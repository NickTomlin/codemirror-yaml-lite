// https://github.com/teucer/vite-repro/blob/main/src/yamlmode.ts
import {parser} from "../parser/index.es.js";

import {
  continuedIndent,
  foldInside,
  foldNodeProp,
  indentNodeProp,
  LanguageSupport,
  LRLanguage
} from "@codemirror/language";

export const yamlLanguage = LRLanguage.define({
  parser: parser.configure({
    props: [
      indentNodeProp.add({
        Mapping: continuedIndent({ except: /^\s*}/ }),
        Property: continuedIndent({ except: /^\s*}/ }),
        Sequence: continuedIndent({ except: /^\s*]/ }),
        MultiLine: continuedIndent()
      }),
      foldNodeProp.add({
        "Mapping Sequence MultiLine": foldInside
      })
    ]
  }),
  languageData: {
    closeBrackets: { brackets: ["[", "{", '"'] },
    indentOnInput: /^\s*[}\]]$/
  }
});

export { parser }

export function yaml() {
  return new LanguageSupport(yamlLanguage);
}