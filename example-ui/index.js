import './style.css';

import { basicSetup, EditorView} from 'codemirror'
import { yamlLanguage, yaml } from '../dist/index.js';

const examples = await import.meta.glob('./examples/*', { as: 'raw' });
let examplesDiv = document.getElementById('examples');

function parse(ele, text) {
  ele.innerHTML = yamlLanguage.parser.parse(text);
}

for (let [file, readText] of Object.entries(examples)) {
  const text = await readText();

  examplesDiv.appendChild(document.createElement('h4')).textContent =
    file.replace('./examples/', '');

  let el = document.createElement('div');
  el.classList.add('example');
  examplesDiv.appendChild(el);

  const parsed = document.createElement('pre');
  parsed.classList.add('parsed');
  parse(parsed, text);

  const updater = EditorView.updateListener.of((e) => {
    parse(parsed, e.state.doc.toString());
  });

  new EditorView({
    doc: text,
    extensions: [basicSetup, yaml(), updater],
    parent: el,
  });

  el.appendChild(parsed);
}