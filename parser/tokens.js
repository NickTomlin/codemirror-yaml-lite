import { ContextTracker, ExternalTokenizer } from "@lezer/lr";
import { Dedent, Indent } from "./parser.terms";

const newline = 10,
  space = 32,
  tab = 9,
  carriageReturn = 13,
  hash = 35;

export const Indentation = new ExternalTokenizer((input, stack) => {
  let cDepth = stack.context.depth;
  if (cDepth < 0) return;
  let prev = input.peek(-1),
    depth;
  if (prev == newline || prev == carriageReturn) {
    let depth = 0,
      chars = 0;
    for (;;) {
      if (input.next == space) depth++;
      else if (input.next == tab) depth += 8 - (depth % 8);
      else break;
      input.advance();
      chars++;
    }
    if (depth != cDepth && input.next != newline && input.next != carriageReturn && input.next != hash) {
      if (depth < cDepth) input.acceptToken(Dedent, -chars);
      else input.acceptToken(Indent);
    }
  }
});

function IndentLevel(parent, depth) {
  this.parent = parent;
  // -1 means this is not an actual indent level but a set of brackets
  this.depth = depth;
  this.hash = (parent ? (parent.hash + parent.hash) << 8 : 0) + depth + (depth << 4);
}

const topIndent = new IndentLevel(null, 0);

function countIndent(space) {
  let depth = 0;
  for (let i = 0; i < space.length; i++) depth += space.charCodeAt(i) == tab ? 8 - (depth % 8) : 1;
  return depth;
}

export const trackIndent = new ContextTracker({
  start: topIndent,
  reduce(context) {
    return context.depth < 0 ? context.parent : context;
  },
  shift(context, term, stack, input) {
    if (term == Indent) return new IndentLevel(context, countIndent(input.read(input.pos, stack.pos)));
    if (term == Dedent) return context.parent;
    return context;
  },
  hash(context) {
    return context.hash;
  },
});
