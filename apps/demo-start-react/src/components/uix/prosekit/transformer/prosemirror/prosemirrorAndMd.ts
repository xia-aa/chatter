import { unistFromMarkdown } from "#/components/uix/md/transformer/mdAndUnist.ts";
import { prosemirrorFromUnist } from "#/components/uix/prosekit/transformer/prosemirror/prosemirrorFromUnist.ts";
import type { Schema } from 'prosemirror-model'
type EditorRootContextProps ={}

export const  pmNodeFromMd = (
  value: string,
  schema: Schema,
  context?: EditorRootContextProps,
) => {
  if (value === '') {
    return schema.nodes.doc.createAndFill()!
  }
  const unistNode = unistFromMarkdown(value)
  return prosemirrorFromUnist(unistNode, schema)
}