import CodeMirror from '@uiw/react-codemirror';
import React, {useCallback, useState} from 'react';

if (import.meta.hot) {
  // quick and dirty way of getting changes refreshed
  // we should maybe switch to using a `ref` and interacting with CM
  // directly if we want to preserve text
  import.meta.hot.accept('../../src/yaml-language', () => {
    window.location.reload()
  })
}


function printParseTree(parser, input) {
    try {
        if (!input) { return "" }
        const tree = parser.parse(input)
        const buf = [];
        let indent = 0;
        // https://discuss.codemirror.net/t/lezer-debug-view/5282/2

        // try {
        //     // const x = printTree(tree, input, {})
        //     // console.log(x)
        // } catch (e) {
        // }
        tree.cursor().iterate((node) => {
                const snippet = input.slice(node.from, node.to).replaceAll("\n", "\\n").replaceAll("\t", "  ")
                buf.push("  ".repeat(indent) + node.name + ` (${snippet})`)
                ++indent
            },
            () => {
                --indent
            },
        )

        return buf.join("\n") + "\n"
    } catch (e) {
        console.error(e)
        return `Error: ${e.message ?? "Unknown error"}`
    }
}


function EditorPane({ title, value = "", extensions, parser }) {
  const [tree, setTree] = useState(() => {
    return printParseTree(parser, value ?? "", null)
  })
  const handleChange = useCallback((editorValue) => {
      setTree(
          printParseTree(parser, editorValue)
      )
  }, [parser])

  return (
    <div style={{ display: "flex" }}>
      <div style={{ flex: 1, maxWidth: "50%" }}>
        <h1>{title}</h1>
        <CodeMirror
          value={value}
          height="200px"
          extensions={extensions}
          onChange={handleChange}
        />
      </div>
      <div>
        <h1>Lezer Tree</h1>
        <pre><code>{tree}</code></pre>
      </div>
    </div>
  )
}


const basic = `
basic: "thing"
render: |
  multiline 
  string!
another: |
    thing
`.trim()





const examples = {
  basic
}


function App() {
    const renderedExamples = Object.keys(examples).map(([key, value]) => {
      return <EditorPane key={key} title={key} value={value} />
    })

    return (
        <div>
            {renderedExamples}
        </div>
    );
}
export default App;