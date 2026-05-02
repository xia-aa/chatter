import { definePlugin } from 'prosekit/core';
import { Plugin, PluginKey } from 'prosemirror-state';

const imagePasteExtension = (fileCache: Map<string, File>) =>
  definePlugin(
    new Plugin({
      key: new PluginKey('imagePaste'),
      props: {
        handlePaste(view, event) {
          // 你的 handlePaste 逻辑，完全照搬
          // 使用 view 和 event，返回 boolean
          const items = event.clipboardData?.items;
          // ... 处理图片 ...
          return false;
        },
      },
    })
  );