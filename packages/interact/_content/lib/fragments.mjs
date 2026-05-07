import { readFileSync, readdirSync } from 'node:fs';
import { join, basename } from 'node:path';

export class Fragments {
  constructor(dir) {
    this.store = new Map();
    this._loadDir(dir, '');
  }

  _loadDir(dir, prefix) {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      if (entry.isDirectory()) {
        this._loadDir(join(dir, entry.name), prefix ? `${prefix}/${entry.name}` : entry.name);
      } else if (entry.name.endsWith('.md')) {
        const raw = readFileSync(join(dir, entry.name), 'utf8');
        if (!raw.includes('<!-- #')) {
          if (entry.name !== 'README.md') {
            console.warn(`  ⚠ ${prefix ? `${prefix}/` : ''}${entry.name} has no section markers — skipping`);
          }
          continue;
        }
        const key = prefix
          ? `${prefix}/${basename(entry.name, '.md')}`
          : basename(entry.name, '.md');
        this.store.set(key, this._parseSections(raw, key));
      }
    }
  }

  _parseSections(raw, filePath) {
    const sections = new Map();
    let current = null;
    let buf = [];

    for (const line of raw.split('\n')) {
      const m = line.match(/^<!--\s+#(\S+)\s+-->$/);
      if (m) {
        if (current === null && buf.join('\n').trim()) {
          throw new Error(
            `Fragment "${filePath}" has content before the first <!-- #section --> marker. Add a marker or remove the content.`,
          );
        }
        if (current !== null) {
          sections.set(current, buf.join('\n').trim());
        }
        current = m[1];
        buf = [];
      } else {
        buf.push(line);
      }
    }
    if (current !== null) {
      sections.set(current, buf.join('\n').trim());
    }
    return sections;
  }

  get(path, section = 'default', params = {}) {
    const sectionMap = this.store.get(path);
    if (!sectionMap) {
      throw new Error(`Fragment not found: ${path}`);
    }
    let content = sectionMap.get(section);
    if (content === undefined) {
      throw new Error(
        `Section "${section}" not found in fragment "${path}". Available: ${[...sectionMap.keys()].join(', ')}`,
      );
    }
    for (const [key, val] of Object.entries(params)) {
      content = content.replaceAll(`{{${key}}}`, val);
    }
    const unreplaced = content.match(/\{\{[^}]+\}\}/g);
    if (unreplaced) {
      throw new Error(
        `Unreplaced placeholders in fragment "${path}#${section}": ${unreplaced.join(', ')}`,
      );
    }
    return content;
  }
}
