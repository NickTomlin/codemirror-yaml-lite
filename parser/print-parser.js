const ignore = new Set(["Document", "Mapping", "Indent", "Dedent"]);
export function stringifyTree(tree, input, { includeContent = false } = {}) {
  try {
    const buf = [];
    let Indent = 0;
    tree.cursor().iterate(
      (node) => {
        // TODO: maybe just ignore nodes that have children?
        if (!ignore.has(node.name)) {
          let text = input.slice(node.from, node.to).replace(/\n/g, "\\n");
          let snippet = includeContent ? `(${text})` : "";
          buf.push(" ".repeat(Indent * 2) + node.name + snippet);
        } else {
          buf.push(" ".repeat(Indent * 2) + node.name);
        }
        ++Indent;
      },
      () => {
        --Indent;
      }
    );
    return buf.join("\n");
  } catch (e) {
    console.error(e);
  }
}
