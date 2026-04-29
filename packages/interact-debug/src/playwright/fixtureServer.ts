import type { InteractArtifact } from '../types';

/**
 * Serve an InteractArtifact as a live web page via Vite dev server.
 *
 * Writes the artifact's HTML/CSS/JS to a temp directory, configures Vite
 * with aliases to local @wix/interact and @wix/motion sources, injects
 * debug hooks onto `window.__interactDebug`, and starts a dev server on
 * a dynamic port.
 */
export async function serveArtifact(
  artifact: InteractArtifact,
): Promise<{ url: string; cleanup: () => Promise<void> }> {
  const fs = await import('node:fs/promises');
  const path = await import('node:path');
  const os = await import('node:os');
  const { createServer } = await import('vite');

  const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'interact-debug-'));

  const html = artifact.raw?.html ?? '';
  const css = artifact.raw?.css ?? '';
  const js = artifact.raw?.js ?? '';

  const configJson = JSON.stringify(artifact.config, null, 2);

  const mainJs = `
${js}

window.__interactDebug = window.__interactDebug || {};
window.__interactDebug.config = ${configJson};

window.__interactDebug.getAnimationState = function(key) {
  const el = document.querySelector('[data-interact-key="' + key + '"]');
  if (!el) return [];
  return el.getAnimations().map(function(a) {
    return {
      name: a.animationName || a.id || '',
      playState: a.playState,
      currentTime: a.currentTime,
      progress: a.effect && a.effect.getComputedTiming
        ? a.effect.getComputedTiming().progress
        : null,
    };
  });
};

window.__interactDebug.getComputedStyle = function(key, prop) {
  const el = document.querySelector('[data-interact-key="' + key + '"]');
  if (!el) return '';
  return window.getComputedStyle(el).getPropertyValue(prop);
};

window.__interactDebug.getAllKeys = function() {
  return Array.from(document.querySelectorAll('[data-interact-key]'))
    .map(function(el) { return el.getAttribute('data-interact-key'); })
    .filter(Boolean);
};
`;

  const indexHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Interact Debug Fixture</title>
  <style>${css}</style>
</head>
<body>
  ${html}
  <script type="module" src="./main.js"></script>
</body>
</html>`;

  await fs.writeFile(path.join(tmpDir, 'index.html'), indexHtml);
  await fs.writeFile(path.join(tmpDir, 'main.js'), mainJs);

  const interactSrc = resolvePeerSource(path, 'interact');
  const motionSrc = resolvePeerSource(path, 'motion');

  const alias: Record<string, string> = {};
  if (interactSrc) alias['@wix/interact'] = interactSrc;
  if (motionSrc) alias['@wix/motion'] = motionSrc;

  const server = await createServer({
    root: tmpDir,
    resolve: { alias },
    server: { port: 0, strictPort: false },
    logLevel: 'silent',
  });

  await server.listen();
  const address = server.httpServer?.address();
  const port = typeof address === 'object' && address ? address.port : 5199;
  const url = `http://localhost:${port}`;

  return {
    url,
    cleanup: async () => {
      await server.close();
      await fs.rm(tmpDir, { recursive: true, force: true }).catch(() => {});
    },
  };
}

function resolvePeerSource(
  pathMod: typeof import('node:path'),
  pkg: 'interact' | 'motion',
): string | undefined {
  try {
    const thisDir = pathMod.dirname(new URL(import.meta.url).pathname);
    return pathMod.resolve(thisDir, `../../../${pkg}/src/index.ts`);
  } catch {
    return undefined;
  }
}
