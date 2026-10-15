import { debug } from './debug.js';

/**
 * Recursive-descent parser (precedence climbing) over a token list.
 *
 * Grammar:
 *   expr   := term (('+' | '-') term)*
 *   term   := factor (('*' | '/') factor)*
 *   factor := number | '(' expr ')' | '-' factor
 *
 * AST node shapes:
 *   { type: 'number', value: number }
 *   { type: 'binary', op: '+' | '-' | '*' | '/', left, right }
 *   { type: 'unary',  op: '-', right }
 *
 * @param {Array<{type: string, value: (number|string)}>} tokens - from `tokenize`.
 * @returns {{type: string}} the root AST node.
 * @throws {SyntaxError} on unexpected tokens or trailing input after a complete expression.
 */
export function parse(tokens) {
  let pos = 0;

  function peek() {
    return tokens[pos];
  }

  function next() {
    return tokens[pos++];
  }

  function expect(type, value) {
    const token = peek();
    if (!token || token.type !== type || (value !== undefined && token.value !== value)) {
      const found = token ? `"${token.value}" (${token.type})` : 'end of input';
      throw new SyntaxError(`Expected ${value || type} but found ${found}`);
    }
    return next();
  }

  function parseExpr() {
    let node = parseTerm();
    while (peek() && peek().type === 'operator' && (peek().value === '+' || peek().value === '-')) {
      const op = next().value;
      const right = parseTerm();
      node = { type: 'binary', op, left: node, right };
    }
    return node;
  }

  function parseTerm() {
    let node = parseFactor();
    while (peek() && peek().type === 'operator' && (peek().value === '*' || peek().value === '/')) {
      const op = next().value;
      const right = parseFactor();
      node = { type: 'binary', op, left: node, right };
    }
    return node;
  }

  function parseFactor() {
    const token = peek();
    if (!token) {
      throw new SyntaxError('Unexpected end of input');
    }

    if (token.type === 'number') {
      next();
      return { type: 'number', value: token.value };
    }

    if (token.type === 'lparen') {
      next();
      const node = parseExpr();
      expect('rparen');
      return node;
    }

    if (token.type === 'operator' && token.value === '-') {
      next();
      const right = parseFactor();
      return { type: 'unary', op: '-', right };
    }

    throw new SyntaxError(`Unexpected token: "${token.value}"`);
  }

  if (tokens.length === 0) {
    throw new SyntaxError('Empty expression');
  }

  const ast = parseExpr();

  if (pos < tokens.length) {
    throw new SyntaxError(`Unexpected trailing input: "${tokens[pos].value}"`);
  }

  debug('parser', JSON.stringify(ast));

  return ast;
}
