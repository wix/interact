import type { LogEntry, LogLevel, LogCategory, TriggerType } from '../types';

const LOG_LEVEL_PRIORITY: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

export type LoggerOptions = {
  /** Minimum level to record (entries below this are discarded). Default: 'debug' */
  minLevel?: LogLevel;
  /** Maximum buffer size. When exceeded, oldest entries are dropped. Default: 10000 */
  maxEntries?: number;
};

/**
 * Structured, leveled, categorized logger with a bounded in-memory buffer.
 *
 * Supports scope-aware filtering by key, trigger, category, and level.
 * Zero allocation when disabled (entries are simply not pushed).
 */
export class InteractLogger {
  private buffer: LogEntry[] = [];
  private minLevel: number;
  private maxEntries: number;
  private _enabled = true;

  constructor(options?: LoggerOptions) {
    this.minLevel = LOG_LEVEL_PRIORITY[options?.minLevel ?? 'debug'];
    this.maxEntries = options?.maxEntries ?? 10000;
  }

  // ---------------------------------------------------------------------------
  // Core logging
  // ---------------------------------------------------------------------------

  log(
    level: LogLevel,
    category: LogCategory,
    message: string,
    context?: { key?: string; trigger?: TriggerType; effectId?: string; data?: unknown },
  ): void {
    if (!this._enabled) return;
    if (LOG_LEVEL_PRIORITY[level] < this.minLevel) return;

    const entry: LogEntry = {
      timestamp: Date.now(),
      level,
      category,
      message,
      key: context?.key,
      trigger: context?.trigger,
      effectId: context?.effectId,
      data: context?.data,
    };

    this.buffer.push(entry);

    if (this.buffer.length > this.maxEntries) {
      this.buffer = this.buffer.slice(-this.maxEntries);
    }
  }

  debug(category: LogCategory, message: string, context?: Parameters<InteractLogger['log']>[3]): void {
    this.log('debug', category, message, context);
  }

  info(category: LogCategory, message: string, context?: Parameters<InteractLogger['log']>[3]): void {
    this.log('info', category, message, context);
  }

  warn(category: LogCategory, message: string, context?: Parameters<InteractLogger['log']>[3]): void {
    this.log('warn', category, message, context);
  }

  error(category: LogCategory, message: string, context?: Parameters<InteractLogger['log']>[3]): void {
    this.log('error', category, message, context);
  }

  // ---------------------------------------------------------------------------
  // Buffer access
  // ---------------------------------------------------------------------------

  /** Return a shallow copy of the full log buffer. */
  getLog(): LogEntry[] {
    return [...this.buffer];
  }

  /** Clear the buffer. */
  clearLog(): void {
    this.buffer = [];
  }

  /** Number of entries currently in the buffer. */
  get size(): number {
    return this.buffer.length;
  }

  // ---------------------------------------------------------------------------
  // Filtering
  // ---------------------------------------------------------------------------

  /** Return entries matching a custom predicate. */
  filterLog(predicate: (entry: LogEntry) => boolean): LogEntry[] {
    return this.buffer.filter(predicate);
  }

  /** Convenience: entries for a specific key. */
  getLogForKey(key: string): LogEntry[] {
    return this.buffer.filter((e) => e.key === key);
  }

  /** Convenience: entries for a specific trigger type. */
  getLogForTrigger(trigger: TriggerType): LogEntry[] {
    return this.buffer.filter((e) => e.trigger === trigger);
  }

  /** Convenience: entries for a specific category. */
  getLogForCategory(category: LogCategory): LogEntry[] {
    return this.buffer.filter((e) => e.category === category);
  }

  /** Convenience: entries at or above a given level. */
  getLogAtLevel(level: LogLevel): LogEntry[] {
    const threshold = LOG_LEVEL_PRIORITY[level];
    return this.buffer.filter((e) => LOG_LEVEL_PRIORITY[e.level] >= threshold);
  }

  // ---------------------------------------------------------------------------
  // Enable / disable
  // ---------------------------------------------------------------------------

  get enabled(): boolean {
    return this._enabled;
  }

  enable(): void {
    this._enabled = true;
  }

  disable(): void {
    this._enabled = false;
  }
}
