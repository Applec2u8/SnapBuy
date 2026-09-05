/**
 * ComponentBlot — Custom Quill Embed Blot
 * Quill strips unknown data-* attributes. Registering a proper blot
 * ensures data-component-id is preserved through Quill serialization.
 */
import Quill from 'quill';

const Embed = Quill.import('blots/embed') as any;

class ComponentEmbedBlot extends Embed {
  static blotName = 'component-embed';
  static tagName = 'span';
  static className = 'manual-component-embed';

  static create(value: string) {
    const node = super.create() as HTMLSpanElement;
    node.setAttribute('data-component-id', value);
    node.setAttribute('contenteditable', 'false');
    node.style.cssText = `
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: #ede9fe;
      border: 1.5px dashed #7c3aed;
      border-radius: 8px;
      padding: 5px 10px;
      font-size: 11px;
      color: #7c3aed;
      font-weight: 900;
      cursor: default;
      user-select: none;
      font-family: sans-serif;
      margin: 2px 4px;
      vertical-align: middle;
    `;
    node.textContent = `📦 ${value}`;
    return node;
  }

  static value(node: Element): string {
    return node.getAttribute('data-component-id') || '';
  }
}

const Inline = Quill.import('blots/inline') as any;

class ManualLinkRefBlot extends Inline {
  static blotName = 'manual-link-ref';
  static tagName = 'span';
  static className = 'manual-link-ref';

  static create(value: string) {
    const node = super.create() as HTMLSpanElement;
    node.setAttribute('data-manual-id', value);
    node.style.cssText = `
      color: #7c3aed;
      font-weight: 800;
      cursor: pointer;
      text-decoration: underline;
      border-bottom: 1.5px dashed #7c3aed;
      padding: 1px 4px;
      border-radius: 4px;
      font-family: sans-serif;
    `;
    return node;
  }

  static formats(node: Element) {
    return node.getAttribute('data-manual-id') || '';
  }
}

// Register once (guard against HMR double-register)
try {
  Quill.register(ComponentEmbedBlot, true);
  Quill.register(ManualLinkRefBlot, true);
} catch (_) {}

export { ComponentEmbedBlot, ManualLinkRefBlot };
