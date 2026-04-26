import { InteractLogger } from './logger';

export type PatcherOptions = {
  /** Logger instance to write entries to. If not provided, a default is created. */
  logger?: InteractLogger;
  /** Intercept console.warn calls that match Interact patterns. Default: true */
  interceptWarn?: boolean;
  /** Log lifecycle events (create, destroy). Default: true */
  logLifecycle?: boolean;
};

type Cleanup = () => void;

let activeCleanups: Cleanup[] = [];
let activeLogger: InteractLogger | null = null;

/**
 * Enable debug logging by patching global console.warn and (optionally)
 * the Interact static API (create/destroy) to emit structured log entries.
 *
 * Call `disableLogging()` to undo all patches.
 */
export function enableLogging(options?: PatcherOptions): InteractLogger {
  if (activeCleanups.length > 0) {
    disableLogging();
  }

  const logger: InteractLogger = options?.logger ?? new InteractLogger();
  activeLogger = logger;

  const interceptWarn = options?.interceptWarn ?? true;
  const logLifecycle = options?.logLifecycle ?? true;

  if (interceptWarn) {
    activeCleanups.push(patchConsoleWarn(logger));
  }

  if (logLifecycle) {
    activeCleanups.push(patchInteractLifecycle(logger));
  }

  return logger;
}

/**
 * Disable logging and restore all original functions.
 */
export function disableLogging(): void {
  for (const cleanup of activeCleanups) {
    cleanup();
  }
  activeCleanups = [];
  activeLogger = null;
}

/** The currently active logger, or null if logging is disabled. */
export function getActiveLogger(): InteractLogger | null {
  return activeLogger;
}

// ---------------------------------------------------------------------------
// console.warn interception
// ---------------------------------------------------------------------------

const INTERACT_WARN_PATTERN = /^Interact:\s*/;
const KEY_EXTRACT = /key\s+"([^"]+)"/i;
const SEQUENCE_EXTRACT = /Sequence\s+"([^"]+)"/i;
const CONTROLLER_EXTRACT = /Controller\s+for\s+key\s+"([^"]+)"/i;
const INSTANCE_EXTRACT = /Instance\s+for\s+key\s+"([^"]+)"/i;

function patchConsoleWarn(logger: InteractLogger): Cleanup {
  const original = console.warn;

  console.warn = (...args: unknown[]) => {
    const firstArg = args[0];

    if (typeof firstArg === 'string' && INTERACT_WARN_PATTERN.test(firstArg)) {
      const message = firstArg.replace(INTERACT_WARN_PATTERN, '');
      const key = extractKey(firstArg);
      const category = categorizeWarnMessage(firstArg);

      logger.warn(category, message, { key, data: args.length > 1 ? args.slice(1) : undefined });
    }

    original.apply(console, args);
  };

  return () => {
    console.warn = original;
  };
}

function extractKey(msg: string): string | undefined {
  return KEY_EXTRACT.exec(msg)?.[1]
    ?? CONTROLLER_EXTRACT.exec(msg)?.[1]
    ?? INSTANCE_EXTRACT.exec(msg)?.[1]
    ?? undefined;
}

function categorizeWarnMessage(msg: string): 'handler' | 'lifecycle' | 'dom' | 'config' | 'sequence' {
  if (SEQUENCE_EXTRACT.test(msg)) return 'sequence';
  if (/controller/i.test(msg)) return 'dom';
  if (/instance/i.test(msg)) return 'lifecycle';
  if (/container|selector|element/i.test(msg)) return 'dom';
  return 'config';
}

// ---------------------------------------------------------------------------
// Interact lifecycle patching
// ---------------------------------------------------------------------------

function patchInteractLifecycle(logger: InteractLogger): Cleanup {
  let InteractClass: any;
  try {
    InteractClass = require('@wix/interact').Interact;
  } catch {
    return () => {};
  }

  const originalCreate = InteractClass.create;
  const originalDestroy = InteractClass.destroy;
  const originalInstanceDestroy = InteractClass.prototype?.destroy;

  if (typeof originalCreate === 'function') {
    InteractClass.create = function patchedCreate(...args: unknown[]) {
      logger.info('lifecycle', 'Interact.create() called', { data: { interactionCount: (args[0] as any)?.interactions?.length } });
      return originalCreate.apply(this, args);
    };
  }

  if (typeof originalDestroy === 'function') {
    InteractClass.destroy = function patchedDestroy(...args: unknown[]) {
      logger.info('lifecycle', 'Interact.destroy() called (static)');
      return originalDestroy.apply(this, args);
    };
  }

  if (typeof originalInstanceDestroy === 'function') {
    InteractClass.prototype.destroy = function patchedInstanceDestroy(...args: unknown[]) {
      logger.info('lifecycle', 'instance.destroy() called');
      return originalInstanceDestroy.apply(this, args);
    };
  }

  return () => {
    if (typeof originalCreate === 'function') InteractClass.create = originalCreate;
    if (typeof originalDestroy === 'function') InteractClass.destroy = originalDestroy;
    if (typeof originalInstanceDestroy === 'function') InteractClass.prototype.destroy = originalInstanceDestroy;
  };
}
