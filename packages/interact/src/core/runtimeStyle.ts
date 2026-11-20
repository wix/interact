import type { IInteractionController } from '../types';
import type { Interact, getMountedController } from './Interact';

export const appendOwnedStyle = Symbol('append owned style');

type StyleRenderer = IInteractionController & {
  [appendOwnedStyle]?: (rules: string[], canPublish: () => boolean) => StyleReceipt | undefined;
};

export type StyleSheetScope = {
  readonly sheet: CSSStyleSheet;
  readonly adoptedInto: Document | ShadowRoot;
  readonly receipts: Set<StyleReceipt>;
  closing?: { connection: ReturnType<typeof getMountedController> };
};

type StyleReceipt = {
  readonly sheet: CSSStyleSheet;
  release: () => void;
  onRelease?: () => void;
};

const authoredStyles = new WeakMap<Interact, Map<CSSStyleSheet, Map<string, StyleReceipt>>>();

export function makeStyleReceipt(
  scope: StyleSheetScope,
  cssRules: CSSRule[],
): StyleReceipt | undefined {
  if (cssRules.length === 0) return;

  const { sheet } = scope;
  const owned = new Set(cssRules);
  const receipt: StyleReceipt = {
    sheet,
    release() {
      if (!scope.receipts.delete(receipt)) return;

      const onRelease = receipt.onRelease;
      receipt.onRelease = undefined;
      onRelease?.();
      for (let index = sheet.cssRules.length - 1; index >= 0; index--) {
        if (owned.delete(sheet.cssRules[index])) {
          sheet.deleteRule(index);
        }
      }
      owned.clear();
    },
  };
  scope.receipts.add(receipt);
  return receipt;
}

export function writeOwnedStyle(
  author: Interact,
  renderer: StyleRenderer,
  slot: string,
  rules: string[],
  canPublish: () => boolean,
): void {
  const append = renderer[appendOwnedStyle];
  if (!append) {
    renderer.renderStyle(rules);
    return;
  }

  const receipt = append.call(renderer, rules, canPublish);
  if (!receipt) return;

  let sheets = authoredStyles.get(author);
  if (!sheets) {
    sheets = new Map();
    authoredStyles.set(author, sheets);
  }
  const { sheet } = receipt;
  let slots = sheets.get(sheet);
  if (!slots) {
    slots = new Map();
    sheets.set(sheet, slots);
  }

  const previous = slots.get(slot);
  slots.set(slot, receipt);
  receipt.onRelease = () => {
    if (slots.get(slot) !== receipt) return;
    slots.delete(slot);
    if (slots.size === 0) sheets.delete(sheet);
  };
  previous?.release();
}

export function retireOwnedStyles(author: Interact): void {
  const sheets = authoredStyles.get(author);
  if (!sheets) return;

  authoredStyles.delete(author);
  for (const slots of sheets.values()) {
    for (const receipt of slots.values()) {
      receipt.release();
    }
  }
}

export function closeRuntimeSheet(scope: StyleSheetScope): void {
  for (const receipt of scope.receipts) {
    receipt.release();
  }
  scope.adoptedInto.adoptedStyleSheets = scope.adoptedInto.adoptedStyleSheets.filter(
    (sheet) => sheet !== scope.sheet,
  );
  scope.closing = undefined;
}
