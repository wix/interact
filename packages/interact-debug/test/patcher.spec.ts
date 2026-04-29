import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { enableLogging, disableLogging, getActiveLogger } from '../src/log/patcher';
import { InteractLogger } from '../src/log/logger';

describe('patcher', () => {
  afterEach(() => {
    disableLogging();
  });

  it('returns a logger when enabling', () => {
    const logger = enableLogging();
    expect(logger).toBeInstanceOf(InteractLogger);
  });

  it('accepts a custom logger', () => {
    const custom = new InteractLogger();
    const returned = enableLogging({ logger: custom });
    expect(returned).toBe(custom);
  });

  it('getActiveLogger returns the active logger', () => {
    expect(getActiveLogger()).toBeNull();
    const logger = enableLogging();
    expect(getActiveLogger()).toBe(logger);
  });

  it('getActiveLogger returns null after disabling', () => {
    enableLogging();
    disableLogging();
    expect(getActiveLogger()).toBeNull();
  });

  describe('console.warn interception', () => {
    it('captures Interact console.warn calls', () => {
      const logger = enableLogging({ interceptWarn: true, logLifecycle: false });

      console.warn('Interact: No container found for list container "myList"');

      const log = logger.getLog();
      expect(log).toHaveLength(1);
      expect(log[0].level).toBe('warn');
      expect(log[0].message).toBe('No container found for list container "myList"');
    });

    it('extracts key from Interact warnings', () => {
      const logger = enableLogging({ interceptWarn: true, logLifecycle: false });

      console.warn('Interact: Instance for key "hero" not found');

      const log = logger.getLog();
      expect(log[0].key).toBe('hero');
    });

    it('categorizes controller warnings as dom', () => {
      const logger = enableLogging({ interceptWarn: true, logLifecycle: false });

      console.warn('Interact: Controller for key "hero" not found');

      const log = logger.getLog();
      expect(log[0].category).toBe('dom');
    });

    it('categorizes sequence warnings as sequence', () => {
      const logger = enableLogging({ interceptWarn: true, logLifecycle: false });

      console.warn('Interact: Sequence "entrance" not found in config');

      const log = logger.getLog();
      expect(log[0].category).toBe('sequence');
    });

    it('ignores non-Interact console.warn calls', () => {
      const logger = enableLogging({ interceptWarn: true, logLifecycle: false });

      console.warn('Some other warning');

      const log = logger.getLog();
      expect(log).toHaveLength(0);
    });

    it('restores original console.warn on disable', () => {
      const original = console.warn;
      enableLogging({ interceptWarn: true, logLifecycle: false });
      expect(console.warn).not.toBe(original);

      disableLogging();
      expect(console.warn).toBe(original);
    });
  });

  it('re-enabling replaces previous patches', () => {
    const logger1 = enableLogging({ interceptWarn: true, logLifecycle: false });
    const logger2 = enableLogging({ interceptWarn: true, logLifecycle: false });

    console.warn('Interact: Instance for key "test" not found');

    expect(logger1.getLog()).toHaveLength(0);
    expect(logger2.getLog()).toHaveLength(1);
  });
});
