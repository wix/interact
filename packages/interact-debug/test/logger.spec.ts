import { describe, it, expect } from 'vitest';
import { InteractLogger } from '../src/log/logger';

describe('InteractLogger', () => {
  it('logs entries and retrieves them', () => {
    const logger = new InteractLogger();
    logger.info('config', 'test message');
    expect(logger.size).toBe(1);
    const entries = logger.getLog();
    expect(entries).toHaveLength(1);
    expect(entries[0].level).toBe('info');
    expect(entries[0].category).toBe('config');
    expect(entries[0].message).toBe('test message');
    expect(entries[0].timestamp).toBeGreaterThan(0);
  });

  it('supports all log levels', () => {
    const logger = new InteractLogger();
    logger.debug('config', 'debug msg');
    logger.info('handler', 'info msg');
    logger.warn('lifecycle', 'warn msg');
    logger.error('dom', 'error msg');

    expect(logger.size).toBe(4);
    const levels = logger.getLog().map((e) => e.level);
    expect(levels).toEqual(['debug', 'info', 'warn', 'error']);
  });

  it('supports context with key, trigger, effectId, data', () => {
    const logger = new InteractLogger();
    logger.info('animation', 'animating', {
      key: 'hero',
      trigger: 'viewEnter',
      effectId: 'fadeIn',
      data: { progress: 0.5 },
    });

    const entry = logger.getLog()[0];
    expect(entry.key).toBe('hero');
    expect(entry.trigger).toBe('viewEnter');
    expect(entry.effectId).toBe('fadeIn');
    expect(entry.data).toEqual({ progress: 0.5 });
  });

  it('clears the log', () => {
    const logger = new InteractLogger();
    logger.info('config', 'a');
    logger.info('config', 'b');
    expect(logger.size).toBe(2);

    logger.clearLog();
    expect(logger.size).toBe(0);
    expect(logger.getLog()).toHaveLength(0);
  });

  it('filters by key', () => {
    const logger = new InteractLogger();
    logger.info('config', 'hero stuff', { key: 'hero' });
    logger.info('config', 'banner stuff', { key: 'banner' });

    const heroEntries = logger.getLogForKey('hero');
    expect(heroEntries).toHaveLength(1);
    expect(heroEntries[0].message).toBe('hero stuff');
  });

  it('filters by trigger', () => {
    const logger = new InteractLogger();
    logger.info('handler', 'view enter', { trigger: 'viewEnter' });
    logger.info('handler', 'hover', { trigger: 'hover' });

    const viewEntries = logger.getLogForTrigger('viewEnter');
    expect(viewEntries).toHaveLength(1);
    expect(viewEntries[0].message).toBe('view enter');
  });

  it('filters by category', () => {
    const logger = new InteractLogger();
    logger.info('config', 'config msg');
    logger.info('handler', 'handler msg');
    logger.warn('config', 'config warn');

    const configEntries = logger.getLogForCategory('config');
    expect(configEntries).toHaveLength(2);
  });

  it('filters by level', () => {
    const logger = new InteractLogger();
    logger.debug('config', 'debug');
    logger.info('config', 'info');
    logger.warn('config', 'warn');
    logger.error('config', 'error');

    const warnAndAbove = logger.getLogAtLevel('warn');
    expect(warnAndAbove).toHaveLength(2);
    expect(warnAndAbove.map((e) => e.level)).toEqual(['warn', 'error']);
  });

  it('filters by custom predicate', () => {
    const logger = new InteractLogger();
    logger.info('config', 'has data', { data: { x: 1 } });
    logger.info('config', 'no data');

    const withData = logger.filterLog((e) => e.data !== undefined);
    expect(withData).toHaveLength(1);
    expect(withData[0].message).toBe('has data');
  });

  it('respects minLevel option', () => {
    const logger = new InteractLogger({ minLevel: 'warn' });
    logger.debug('config', 'debug');
    logger.info('config', 'info');
    logger.warn('config', 'warn');
    logger.error('config', 'error');

    expect(logger.size).toBe(2);
    expect(logger.getLog().map((e) => e.level)).toEqual(['warn', 'error']);
  });

  it('respects maxEntries option', () => {
    const logger = new InteractLogger({ maxEntries: 3 });
    for (let i = 0; i < 10; i++) {
      logger.info('config', `msg ${i}`);
    }

    expect(logger.size).toBe(3);
    expect(logger.getLog()[0].message).toBe('msg 7');
    expect(logger.getLog()[2].message).toBe('msg 9');
  });

  it('does not log when disabled', () => {
    const logger = new InteractLogger();
    logger.disable();
    logger.info('config', 'should not appear');
    expect(logger.size).toBe(0);
  });

  it('resumes logging when re-enabled', () => {
    const logger = new InteractLogger();
    logger.disable();
    logger.info('config', 'invisible');
    logger.enable();
    logger.info('config', 'visible');
    expect(logger.size).toBe(1);
    expect(logger.getLog()[0].message).toBe('visible');
  });

  it('returns a copy from getLog (not the internal buffer)', () => {
    const logger = new InteractLogger();
    logger.info('config', 'original');
    const log = logger.getLog();
    log.push({ timestamp: 0, level: 'debug', category: 'config', message: 'injected' });
    expect(logger.size).toBe(1);
  });
});
