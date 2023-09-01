import { styleTags, tags as t } from "@lezer/highlight";

export const yamlHighlighting = styleTags({
  Number: t.number,
  Boolean: t.bool,
  Key: t.atom,
  Anchor: t.variableName,
  Alias: t.derefOperator,
  Plain: t.string,
  MultiLine: t.string,
  MultiLineKey: t.atom,
  Comment: t.comment,
});
