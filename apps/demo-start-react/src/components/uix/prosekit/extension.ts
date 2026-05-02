
import { defineDoc } from 'prosekit/extensions/doc'
import { defineParagraph } from 'prosekit/extensions/paragraph'
import { defineNodeSpec, union, defineHistory, defineBaseKeymap, defineBaseCommands } from 'prosekit/core';
import { defineText } from 'prosekit/extensions/text';
import {
  fromProseMirrorNode,
  toProseMirrorNode,
} from '@prosemirror-processor/unist/mdast'
import type { Heading } from 'mdast'
import { defineHeading } from 'prosekit/extensions/heading';
import { defineList } from 'prosekit/extensions/list';
import { defineBlockquote } from 'prosekit/extensions/blockquote';
import { defineStrike } from 'prosekit/extensions/strike';
import { defineBold } from 'prosekit/extensions/bold';
import { defineItalic } from 'prosekit/extensions/italic';
import { defineCode } from 'prosekit/extensions/code';
import { defineLink } from 'prosekit/extensions/link';
import { defineImage } from 'prosekit/extensions/image';
import { defineCodeBlock, defineCodeBlockHighlight } from 'prosekit/extensions/code-block';
import { defineHorizontalRule } from 'prosekit/extensions/horizontal-rule';
import { defineDropCursor } from 'prosekit/extensions/drop-cursor';
import { defineGapCursor } from 'prosekit/extensions/gap-cursor';
// bun add prosekit @types/mdast @prosemirror-processor/unist

export const defineExtension = () => union([
  defineDoc(),
  defineNodeSpec({
    name: 'doc',
    topNode: true,
    content: 'block+',
  }),
  defineParagraph(),
    defineText(),
  defineHeading(),
    defineNodeSpec({
      name: 'heading',
      __toUnist: fromProseMirrorNode('heading', (node) => ({
        depth: node.attrs.level,
      })),
      __fromUnist: toProseMirrorNode('heading', (node) => {
        const _node = node as Heading
        return {
          level: _node.depth,
        }
      }),
    }),
    defineList(),

  defineBlockquote(),
  defineBaseKeymap(),
  defineBaseCommands(),
  defineBold(),
  defineItalic(),
  defineStrike(),
  defineCode(),
  defineLink(),
  defineImage(),
  defineCodeBlock(),
  defineHorizontalRule(),
  defineHistory(),
  defineDropCursor(),
  defineGapCursor(),
  // defineCodeBlockHighlight(), // 开箱即用的代码高亮，内部可配置 highlight.js 语言
]);