import type { Root } from "mdast";
import type { UnistNode } from "./types.js";
import type { Node as ProseMirrorNode, Schema } from "prosemirror-model";

import {
  fromProseMirrorToMdast,
  type ProseMirrorMarkToMdastHandlers,
  type ProseMirrorNodeToMdastHandlers,
} from "@prosemirror-processor/unist/mdast";

import { pmTextHandler } from "@prosemirror-processor/unist";

export function unistFromProsemirror(
  node: ProseMirrorNode,
  schema: Schema,
  options?: Partial<{ postProcess: (node: Root) => void }>,
): UnistNode {
  const nodeHandlers: ProseMirrorNodeToMdastHandlers = {};
  const markHandlers: ProseMirrorMarkToMdastHandlers = {};

  schema.spec.nodes.forEach((k, node) => {
    if (node.__toUnist) {
      nodeHandlers[k] = node.__toUnist;
      nodeHandlers[node.unistName as any] = node.__toUnist;
    }
  });

  schema.spec.marks.forEach((k, mark) => {
    if (mark.__toUnist) {
      markHandlers[k] = mark.__toUnist;
      markHandlers[mark.unistName as any] = mark.__toUnist;
    }
  });

  const result = fromProseMirrorToMdast(node, {
    nodeName: (node) => node.type.spec.unistName ?? node.type.name,
    markName: (node) => node.type.spec.unistName ?? node.type.name,
    nodeHandlers,
    markHandlers,
    textHandler: pmTextHandler,
    schema,
  });
  if (options?.postProcess) {
    options.postProcess(result as Root);
  }
  // @ts-expect-error fix type
  return result;
}
