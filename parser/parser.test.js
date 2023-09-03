import { testTree } from "@lezer/generator/test";
import { parser } from "./parser.js";

import { describe, expect, test } from "vitest";
import { stringifyTree } from "./print-parser.js";

const strictParser = parser.configure({ strict: true });
const looseParser = parser.configure({ strict: false });

function parseTree(input, options = { strict: true }) {
  const chosenParser = options.strict ? strictParser : looseParser;
  try {
    return chosenParser.parse(input);
  } catch (e) {
    if (/No parse at/.test(e.message)) {
      const looseOutput = looseParser.parse(input);
      console.error(e.message, "\n", looseOutput.toString());
      throw new Error(e.message + "\n\t" + looseOutput.toString());
    } else {
      throw e;
    }
  }
}

/*
Test using lezer's test framework to ensure that the tree. Purely structural.
 */
function testParse(input, spec, { strict = true } = {}) {
  const parsedTree = parseTree(input, { strict });
  testTree(parsedTree, spec);
}

/*
Helpful when tokens may overlap with ranges of text and "pass"
while actually being incorrect.

E.g. `/key/value: hi`

Should be Key("/key/:value:") and Plain("hi")
But an incorrect parse could match Key("/key/:) and Plain("value: hi")
and still pass.
*/
function testFormat(input, spec, options = { strict: true, includeContent: false }) {
  const parsedTree = parseTree(input, options);
  const formatted = stringifyTree(parsedTree, input, options);
  expect(formatted).toEqual(spec);
}

describe("Plain scalars", () => {
  test("allows for a range of characters", () => {
    const input = String.raw`
slash: /foo/bar
div: <div>hi</div>
bang: !
`.trim();
    const spec = `
Document
  Mapping
    Key(slash:)
    Plain(/foo/bar)
  Mapping
    Key(div:)
    Plain(<div>hi</div>)
  Mapping
    Key(bang:)
    Plain(!)
`.trim();
    testFormat(input, spec, { includeContent: true });
  });
});

describe("Mappings", () => {
  test("basic", async () => {
    const input = `
key: value
key_2: another_value
bool: true
number: 1234
`.trim();

    const spec = `Document(
    Mapping(Key,Plain),
    Mapping(Key,Plain),
    Mapping(Key,Boolean),
    Mapping(Key,Number)
    )`;

    testParse(input, spec);
  });

  test("string values", () => {
    const input = `
key: "value"
valid: 'foo: bar'
`.trim();
    const spec = `Document(
      Mapping(Key,String),
      Mapping(Key,String)
    )`;
    testParse(input, spec);
  });

  test("string keys", () => {
    const input = `
"key": "value"
"keyb": value
'key_2': 'another_value'
'key_2b': another_value
`.trim();
    const spec = `Document(
      Mapping(Key,String),
      Mapping(Key,Plain),
      Mapping(Key,String),
      Mapping(Key,Plain)
    )`;
    testParse(input, spec);
  });

  test("short keys", () => {
    const input = `
/: hi
k: v
k2: v2
`.trim();
    const spec = `Document(
      Mapping(Key,Plain),
      Mapping(Key,Plain),
      Mapping(Key,Plain)
    )`;
    testParse(input, spec);
  });

  test("support a range of characters in keys", () => {
    const input = String.raw`
key: value
/customer/:id/path/new-value: |
  test
/nested/path: value
/nested/path/:param: value
`.trim();

    const spec = `
Document
  Mapping
    Key(key:)
    Plain(value)
  Mapping
    Key(/customer/:id/path/new-value:)
    MultiLine(|\\n  test\\n)
      MultiLineKey(|)
      Indent
      MultiLineValue(test)
      Dedent
  Mapping
    Key(/nested/path:)
    Plain(value)
  Mapping
    Key(/nested/path/:param:)
    Plain(value)
`.trim();

    testFormat(input, spec, { includeContent: true });
  });

  test("anchors and aliases", () => {
    const input = `
another: key
key: &anchor
  foo: bar
key_2: *anchor
`.trim();

    const spec = `
    Document(
      Mapping(Key,Plain),
      Mapping(Key,Anchor,Indent,Mapping(Key,Plain),Dedent),
      Mapping(Key, Alias)
    )
    `;
    testParse(input, spec);
  });

  describe("nesting", () => {
    test("nested", () => {
      const input = `
key:
  nested_key: nested_value
`.trim();
      const spec = `Document(Mapping(
      Key,Indent, 
      Mapping(Key,Plain)
    ))`;
      testParse(input, spec);
    });

    test("sibling nested keys", () => {
      const input = `
routes:
  /: home
  /:id: customer
  /test: test
  /logout: goodbye`.trim();
      const spec = `Document(
      Mapping(
      Key,
      Indent, 
      Mapping(Key,Plain),
      Mapping(Key,Plain),
      Mapping(Key,Plain),
      Mapping(Key,Plain),
    ))`;
      testParse(input, spec);
    });
  });

  test("deeply nested keys", () => {
    const input = `
top:
  nested_key:
    sibling: hi
    nested_key_2:
      nested_key_3: nested_value
      nested_sibling: true
`.trim();

    const spec = `
Document
  Mapping
    Key(top:)
    Indent
    Mapping
      Key(nested_key:)
      Indent
      Mapping
        Key(sibling:)
        Plain(hi)
      Mapping
        Key(nested_key_2:)
        Indent
        Mapping
          Key(nested_key_3:)
          Plain(nested_value)
        Mapping
          Key(nested_sibling:)
          Boolean(true)
`.trim();
    testFormat(input, spec, { includeContent: true });
  });

  test("newlines", () => {
    const input = `
key: value
key_2: another_value`.trim();

    const spec = `
Document
  Mapping
    Key(key:)
    Plain(value)
  Mapping
    Key(key_2:)
    Plain(another_value)
`.trim();
    testFormat(input, spec, { includeContent: true });
  });
});

describe("multiline", () => {
  test("multiline", () => {
    const input = `
regular: hi
multi: |
  line1
  line2
regular_2: val
`.trim();
    const spec = `Document(
      Mapping(Key,Plain),
      Mapping(Key,MultiLine(MultiLineKey,Indent,MultiLineValue, MultiLineValue,Dedent)),
      Mapping(Key,Plain)
    )`;
    testParse(input, spec);
  });

  test("nested properties with multiline", () => {
    const input = `
key:
  nested_key: |
    nested_value
`.trim();
    const spec = ` Document(Mapping(Key,Indent,Mapping(Key,MultiLine(MultiLineKey,Indent,MultiLineValue))))`;
    testParse(input, spec);
  });
});

describe("Sequences", () => {
  test("scalar Sequence", () => {
    const input = `
key:
  - item1
  - false
  - 1234
a: b
  `.trim();
    const spec = `Document(
      Mapping(Key, Indent, Sequence(SequenceEntry(SequenceIndicator, Plain), SequenceEntry(SequenceIndicator, Boolean), SequenceEntry(SequenceIndicator, Number)), Dedent)
      Mapping(Key, Plain)
    )`;
    testParse(input, spec);
  });

  test("simple object lists [TODO: we need to isolate Sequence errors]", () => {
    const input = `
key:
  - key: y
  - key: d
x: y
`.trim();
    const spec = `Document(
      Mapping(
        Key,
        Indent, 
        Sequence(
          SequenceEntry(
            SequenceIndicator,
            Mapping(Key,Plain),
            ⚠
          ),
          SequenceEntry(
            SequenceIndicator,
            Mapping(Key,Plain),
            ⚠
          )
        )
        Dedent
      ),
      Mapping(Key,Plain))`;
    testParse(input, spec, { strict: false });
  });

  test("multiple Sequence items with newline trailing", () => {
    const input = `
key:
  - item1
  - item2
`.trimStart();
    const spec = `Document(Mapping(Key, Indent, Sequence(SequenceEntry(SequenceIndicator, Plain), SequenceEntry(SequenceIndicator, Plain)), Dedent))`;
    testParse(input, spec);
  });

  test("more complicated object lists TODO: errors after dedent in properties", () => {
    const input = `
key:
  - key: y
    key2: hi
  - key: d
prop: a
`.trim();
    const spec = `Document(
      Mapping(
        Key,
        Indent, 
        Sequence(
          SequenceEntry(
            SequenceIndicator,
            Mapping(Key,Plain),
            Indent,
            Mapping(Key,Plain),
            Dedent,
            ⚠
          ),
          SequenceEntry(
            SequenceIndicator,
            Mapping(Key,Plain)
          )
        )
        Dedent,
      ),
      Mapping(Key,Plain)
)`;
    testParse(input, spec, { strict: false });
  });

  test.skip("deep nesting [TODO: still running into issues with Mapping boundaries]", () => {
    const input = `
key:
  - key: value
    nested: 
      item:
        nest: deep_nest
    nested_list:
      - item1
      `.trim();
    const spec = `
    Document(
      Mapping(
        Key,
        Sequence(
          Indent,
          SequenceEntry(
            SequenceIndicator,
            Mapping(Key,Plain),
            Indent,
            Mapping(Key,Indent,Mapping(Key,Indent,Mapping(Key,Plain),Dedent),Dedent),
            Indent,
            Mapping(
              Key,
              Sequence(
                Indent,
                SequenceEntry(SequenceIndicator,Plain)
                )
            ),⚠, ⚠
          ),
       ⚠)
     )
 )
`.trim();

    testParse(input, spec, { strict: false });
  });
});
