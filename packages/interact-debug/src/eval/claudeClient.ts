import { exec } from 'node:child_process';
import { writeFile, unlink, mkdtemp } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

const DEFAULT_TIMEOUT_MS = 600_000;
const MAX_RETRIES = 3;
const INITIAL_BACKOFF_MS = 15_000;

/**
 * Call the Claude CLI to generate a response.
 * Requires `claude` (from @anthropic-ai/claude-code) to be installed and authenticated.
 *
 * Includes retry logic with exponential backoff to handle rate limiting.
 */
export async function generate(
  systemPrompt: string,
  userPrompt: string,
  options?: { timeoutMs?: number },
): Promise<string> {
  const timeout = options?.timeoutMs ?? DEFAULT_TIMEOUT_MS;

  const tmpDir = await mkdtemp(join(tmpdir(), 'interact-eval-'));
  const systemPromptFile = join(tmpDir, 'system-prompt.txt');
  const userPromptFile = join(tmpDir, 'user-prompt.txt');
  await writeFile(systemPromptFile, systemPrompt);
  await writeFile(userPromptFile, userPrompt);

  const cmd = [
    'cat',
    esc(userPromptFile),
    '|',
    'claude',
    '--system-prompt-file',
    esc(systemPromptFile),
    '--output-format',
    'text',
    '--max-turns',
    '3',
    '--tools',
    "''",
    '-p',
    '-',
  ].join(' ');

  try {
    let lastError: Error | undefined;

    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      if (attempt > 0) {
        const backoff = INITIAL_BACKOFF_MS * Math.pow(2, attempt - 1);
        await sleep(backoff);
      }

      try {
        return await execCommand(cmd, timeout);
      } catch (err) {
        lastError = err instanceof Error ? err : new Error(String(err));
        const duration = lastError.message.match(/\((\d+)ms\)/)?.[1];
        const fast = duration && parseInt(duration) < 10_000;
        if (!fast) throw lastError;
        // Fast failure = likely rate limited, retry
      }
    }

    throw lastError ?? new Error('Claude CLI failed after retries');
  } finally {
    await Promise.all([
      unlink(systemPromptFile).catch(() => {}),
      unlink(userPromptFile).catch(() => {}),
    ]);
  }
}

function execCommand(cmd: string, timeout: number): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    exec(
      cmd,
      { timeout, maxBuffer: 1024 * 1024 * 10, shell: '/bin/bash' },
      (error, stdout, stderr) => {
        if (error) {
          reject(
            new Error(`Claude CLI failed: ${error.message}${stderr ? `\nstderr: ${stderr}` : ''}`),
          );
          return;
        }
        resolve(stdout);
      },
    );
  });
}

function esc(s: string): string {
  return `'${s.replace(/'/g, "'\\''")}'`;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
