import {
  continuedIndent,
  foldInside,
  foldNodeProp,
  indentNodeProp,
  LanguageSupport,
  LRLanguage,
} from "@codemirror/language";
import { parser } from "../parser/parser.js";

export const yamlLanguage = LRLanguage.define({
  parser: parser.configure({
    props: [
      indentNodeProp.add({
        MultiLine: continuedIndent(),
        SequenceEntry: continuedIndent(),
      }),
      foldNodeProp.add({
        MultiLine: foldInside,
        Mapping: (node, state) => {
          /*
          Dedents and multilines are special because their `to` overlaps with the content of the next item.

          For example, this

          ```yaml
          routes:
            hut: 1
            cust: 2
          foo: bar
          ```

          Results in a parse tree like this:
          ```
          Document
            Property
              Key (routes:)
              Indent (  )
              Property
                Key (hut:)
                Number (1)
              Property
                Key (cust:)
                Number (2)
              Dedent ()
            Property
              Key (foo:)
              Plain (bar)
          ```

          Where the content of the `Dedent` overlaps with the range of the next `Property`. so we want to fold -1 to avoid folding `foo:`
          */

          if (node.nextSibling) {
            return {
              from: node.firstChild.node.to,
              to: node.to - 1,
            };
          } else {
            return {
              from: node.firstChild.node.to,
              to: node.to,
            };
          }
        },
      }),
    ],
  }),
  languageData: {
    closeBrackets: { brackets: ["[", "{", '"'] },
    indentOnInput: /^\s*[}\]]$/,
  },
});

export { parser };

export function yaml() {
  return new LanguageSupport(yamlLanguage);
}
