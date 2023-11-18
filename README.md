Codemirror YAML Lite
---

This package provides CodeMirror language support for a _partial_ version of the YAML 1.2 spec, and also contains the [Lezer](https://lezer.codemirror.net/) grammar that powers it.


## Usage

Add the package to your projext

```
npm i @nicktomlin/codemirror-lang-yaml-lite
```

And include in your CM extensions:

```
import {yaml} from "@nicktomlin/codemirror-lang-yaml-lite"

new EditorView({
    extensions: [
        // ...
        yaml
    ]
})
```

See the [`example-ui`](./example-ui) directory for a runnable example.


## Contributing

### Pull requests welcome; feature requests are DIY

I'll try to do what I can to fix bugs, but I'm satisfied with a subset of YAML behavior at the moment. If you'd like the parser augmented for your use case, please open a PR.

### Development

Working with the parser:

```
# launch tests and parser in --watch mode
npm run dev

# run the UI (useful for previewing changes in CodeMirror)
npm run ui
```

## FAQ

### Why `lite`?

YAML is a notoriously complicated (or -- to put a positive spin on it -- flexible) data serialization language. As such, it's difficult to parse.

### Why not use CM `legacy-modes`?

CodeMirror 6 supports basic yaml syntax highlighting through [legacy streaming mode](https://github.com/codemirror/legacy-modes#user-content-yaml) and you should use it if your use case is simple! But, it is not fully compatible with all of the features a "real" lezer parser provides. For example, that means it is not able to support [mixed language parsing](https://codemirror.net/examples/mixed-language/) which prompted this package's development.


## Prior art / References

- [this thread](https://github.com/codemirror/dev/issues/306)
- [this thread](https://discuss.codemirror.net/t/cm6-integrate-yaml-and-markdown/4494)
- [this thread on mixed language support](https://discuss.codemirror.net/t/nested-autocomplete-for-custom-languages/5600)
- [this repo by @teucer](https://github.com/teucer/vite-repro/blob/main/src/parser/yaml.grammar)
- the [@codemirror/lang-javascript](https://github.com/codemirror/lang-javascript#readme) package is a great reference
- the legacy [yaml mode](https://github.com/codemirror/legacy-modes/blob/main/mode/yaml.js)


#### Playgrounds

- [This stackblitz starter](https://stackblitz.com/edit/lezer-sandbox-template?file=main.js)
- https://littletools.app/lezer
- https://lezer-playground.vercel.app/
