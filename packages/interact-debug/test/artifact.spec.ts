import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { parseArtifact } from '../src/artifact';
import type { InteractConfig } from '../src/types';
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';

const MINIMAL_CONFIG: InteractConfig = {
  effects: {
    fadeIn: {
      keyframeEffect: { name: 'fade', keyframes: [{ opacity: 0 }, { opacity: 1 }] },
      duration: 500,
    },
  },
  interactions: [
    {
      key: 'hero',
      trigger: 'viewEnter',
      effects: [{ effectId: 'fadeIn' }],
    },
  ],
};

describe('parseArtifact', () => {
  describe('separated input', () => {
    it('assembles config + html + css + js into an artifact', async () => {
      const artifact = await parseArtifact({
        type: 'separated',
        config: MINIMAL_CONFIG,
        html: '<div data-interact-key="hero">Hello</div>',
        css: '.hero { opacity: 0; }',
        js: 'import { Interact } from "@wix/interact";\nInteract.create(config);',
      });

      expect(artifact.config).toEqual(MINIMAL_CONFIG);
      expect(artifact.html).toContain('data-interact-key="hero"');
      expect(artifact.css).toContain('.hero');
      expect(artifact.js).toContain('Interact.create');
      expect(artifact.sourceType).toBe('separated');
      expect(artifact.framework).toBe('vanilla');
    });

    it('detects react framework from import', async () => {
      const artifact = await parseArtifact({
        type: 'separated',
        config: MINIMAL_CONFIG,
        html: '<div></div>',
        js: 'import { Interaction } from "@wix/interact/react";',
      });
      expect(artifact.framework).toBe('react');
    });

    it('detects web framework from import', async () => {
      const artifact = await parseArtifact({
        type: 'separated',
        config: MINIMAL_CONFIG,
        html: '<interact-element></interact-element>',
        js: 'import "@wix/interact/web";',
      });
      expect(artifact.framework).toBe('web');
    });

    it('extracts registered effects from registerEffects([...]) call', async () => {
      const artifact = await parseArtifact({
        type: 'separated',
        config: MINIMAL_CONFIG,
        html: '<div></div>',
        js: 'registerEffects([FadeIn, SlideIn, BounceIn]);',
      });
      expect(artifact.registeredEffects).toEqual(['FadeIn', 'SlideIn', 'BounceIn']);
    });
  });

  describe('mixed input', () => {
    it('extracts config, html, css, and js from a full HTML document', async () => {
      const source = `
<!DOCTYPE html>
<html>
<head>
  <style>.hero { opacity: 0; }</style>
</head>
<body>
  <div data-interact-key="hero">Hello</div>
  <script>
    const config = {
      effects: {
        fadeIn: {
          keyframeEffect: { name: "fade", keyframes: [{ opacity: 0 }, { opacity: 1 }] },
          duration: 500
        }
      },
      interactions: [
        {
          key: "hero",
          trigger: "viewEnter",
          effects: [{ effectId: "fadeIn" }]
        }
      ]
    };
    Interact.create(config);
  </script>
</body>
</html>`;

      const artifact = await parseArtifact({ type: 'mixed', source });

      expect(artifact.sourceType).toBe('mixed');
      expect(artifact.config.interactions).toHaveLength(1);
      expect(artifact.config.interactions[0].key).toBe('hero');
      expect(artifact.config.effects).toHaveProperty('fadeIn');
      expect(artifact.html).toContain('data-interact-key="hero"');
      expect(artifact.html).not.toContain('<script');
      expect(artifact.html).not.toContain('<style');
      expect(artifact.css).toContain('.hero');
    });

    it('extracts config from <script type="application/json"> tag', async () => {
      const source = `
<html>
<body>
  <div data-interact-key="hero">Hello</div>
  <script type="application/json">
    ${JSON.stringify(MINIMAL_CONFIG)}
  </script>
</body>
</html>`;

      const artifact = await parseArtifact({ type: 'mixed', source });
      expect(artifact.config.interactions[0].key).toBe('hero');
    });

    it('skips CDN script tags', async () => {
      const source = `
<html>
<body>
  <div data-interact-key="hero">Hello</div>
  <script src="https://cdn.example.com/lib.js"></script>
  <script type="application/json">${JSON.stringify(MINIMAL_CONFIG)}</script>
</body>
</html>`;

      const artifact = await parseArtifact({ type: 'mixed', source });
      expect(artifact.js).toBeFalsy();
    });

    it('detects react framework from JSX patterns', async () => {
      const source = `
<html>
<body>
  <div id="root"></div>
  <script>
    import { Interaction } from "@wix/interact/react";
    const config = ${JSON.stringify(MINIMAL_CONFIG)};
    Interact.create(config);
  </script>
</body>
</html>`;

      const artifact = await parseArtifact({ type: 'mixed', source });
      expect(artifact.framework).toBe('react');
    });
  });

  describe('directory input', () => {
    let tmpDir: string;

    beforeEach(async () => {
      tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'interact-debug-test-'));
    });

    afterEach(async () => {
      await fs.rm(tmpDir, { recursive: true, force: true });
    });

    it('parses a directory with separated files', async () => {
      await fs.writeFile(path.join(tmpDir, 'config.json'), JSON.stringify(MINIMAL_CONFIG));
      await fs.writeFile(path.join(tmpDir, 'index.html'), '<div data-interact-key="hero">Hello</div>');
      await fs.writeFile(path.join(tmpDir, 'style.css'), '.hero { opacity: 0; }');
      await fs.writeFile(path.join(tmpDir, 'app.js'), 'import { Interact } from "@wix/interact";');

      const artifact = await parseArtifact({ type: 'directory', path: tmpDir });

      expect(artifact.sourceType).toBe('directory');
      expect(artifact.config.interactions).toHaveLength(1);
      expect(artifact.html).toContain('data-interact-key="hero"');
      expect(artifact.css).toContain('.hero');
      expect(artifact.js).toContain('@wix/interact');
    });

    it('merges configs from multiple JSON files (#1)', async () => {
      const config1 = {
        effects: { fadeIn: { keyframeEffect: { name: 'fade', keyframes: [{ opacity: 0 }] }, duration: 500 } },
        interactions: [{ key: 'a', trigger: 'viewEnter', effects: [{ effectId: 'fadeIn' }] }],
      };
      const config2 = {
        effects: { slideIn: { namedEffect: { type: 'SlideIn' }, duration: 300 } },
        interactions: [{ key: 'b', trigger: 'hover', effects: [{ effectId: 'slideIn' }] }],
      };

      await fs.writeFile(path.join(tmpDir, 'config1.json'), JSON.stringify(config1));
      await fs.writeFile(path.join(tmpDir, 'config2.json'), JSON.stringify(config2));
      await fs.writeFile(path.join(tmpDir, 'index.html'), '<div data-interact-key="a">A</div>');

      const artifact = await parseArtifact({ type: 'directory', path: tmpDir });

      expect(artifact.config.effects).toHaveProperty('fadeIn');
      expect(artifact.config.effects).toHaveProperty('slideIn');
      expect(artifact.config.interactions).toHaveLength(2);
    });

    it('merges HTML from multiple files (#2)', async () => {
      await fs.writeFile(path.join(tmpDir, 'config.json'), JSON.stringify(MINIMAL_CONFIG));
      await fs.writeFile(path.join(tmpDir, 'hero.html'), '<div data-interact-key="hero">Hero</div>');
      await fs.writeFile(path.join(tmpDir, 'banner.html'), '<div data-interact-key="banner">Banner</div>');

      const artifact = await parseArtifact({ type: 'directory', path: tmpDir });

      expect(artifact.html).toContain('data-interact-key="hero"');
      expect(artifact.html).toContain('data-interact-key="banner"');
    });

    it('merges JSON config with mixed-html-extracted config (#3)', async () => {
      const jsonConfig = {
        effects: { slideIn: { namedEffect: { type: 'SlideIn' }, duration: 300 } },
        interactions: [{ key: 'b', trigger: 'hover', effects: [{ effectId: 'slideIn' }] }],
      };
      await fs.writeFile(path.join(tmpDir, 'extra.json'), JSON.stringify(jsonConfig));

      const htmlContent = `<html><body>
        <div data-interact-key="hero">Hello</div>
        <script>
          const config = ${JSON.stringify(MINIMAL_CONFIG)};
          Interact.create(config);
        </script>
      </body></html>`;
      await fs.writeFile(path.join(tmpDir, 'index.html'), htmlContent);

      const artifact = await parseArtifact({ type: 'directory', path: tmpDir });

      expect(artifact.config.effects).toHaveProperty('fadeIn');
      expect(artifact.config.effects).toHaveProperty('slideIn');
      expect(artifact.config.interactions.length).toBeGreaterThanOrEqual(2);
    });

    it('sets sourceType to directory (#4)', async () => {
      await fs.writeFile(path.join(tmpDir, 'config.json'), JSON.stringify(MINIMAL_CONFIG));
      await fs.writeFile(path.join(tmpDir, 'index.html'), '<div data-interact-key="hero">Hello</div>');

      const artifact = await parseArtifact({ type: 'directory', path: tmpDir });
      expect(artifact.sourceType).toBe('directory');
    });

    it('sets sourceType to directory even with mixed HTML content (#4)', async () => {
      const htmlContent = `<html><body>
        <div data-interact-key="hero">Hello</div>
        <script>
          const config = ${JSON.stringify(MINIMAL_CONFIG)};
          Interact.create(config);
        </script>
      </body></html>`;
      await fs.writeFile(path.join(tmpDir, 'index.html'), htmlContent);

      const artifact = await parseArtifact({ type: 'directory', path: tmpDir });
      expect(artifact.sourceType).toBe('directory');
    });

    it('merges CSS from multiple files (#5)', async () => {
      await fs.writeFile(path.join(tmpDir, 'config.json'), JSON.stringify(MINIMAL_CONFIG));
      await fs.writeFile(path.join(tmpDir, 'index.html'), '<div>Hello</div>');
      await fs.writeFile(path.join(tmpDir, 'base.css'), '.base { color: red; }');
      await fs.writeFile(path.join(tmpDir, 'theme.css'), '.theme { color: blue; }');

      const artifact = await parseArtifact({ type: 'directory', path: tmpDir });

      expect(artifact.css).toContain('.base');
      expect(artifact.css).toContain('.theme');
    });

    it('throws when no config is found in directory', async () => {
      await fs.writeFile(path.join(tmpDir, 'index.html'), '<div>Hello</div>');
      await fs.writeFile(path.join(tmpDir, 'data.json'), '{"unrelated": true}');

      await expect(parseArtifact({ type: 'directory', path: tmpDir })).rejects.toThrow(
        /Could not find InteractConfig/,
      );
    });

    it('skips malformed JSON files gracefully (#7)', async () => {
      await fs.writeFile(path.join(tmpDir, 'config.json'), JSON.stringify(MINIMAL_CONFIG));
      await fs.writeFile(path.join(tmpDir, 'broken.json'), '{invalid json!!!}');
      await fs.writeFile(path.join(tmpDir, 'index.html'), '<div data-interact-key="hero">Hello</div>');

      const artifact = await parseArtifact({ type: 'directory', path: tmpDir });
      expect(artifact.config.interactions).toHaveLength(1);
    });
  });
});
