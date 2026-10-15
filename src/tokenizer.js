import { debug } from './debug.js';

/**
 * Tokenize an arithmetic expression into a flat list of tokens.
 *
 * Token shapes:
 *   { type: 'number',   value: number }             integer or decimal literal
 *   { type: 'operator', value: '+' | '-' | '*' | '/' }
 *   { type: 'lparen',   value: '(' }
 *   { type: 'rparen',   value: ')' }
 *
 * Whitespace is skipped. Any unrecognized character throws a `SyntaxError`.
 * `-` is always emitted as an operator token; the parser decides whether it is
 * unary or binary from the surrounding context.
 *
 * @param {string} input - the raw expression string.
 * @returns {Array<{type: string, value: (number|string)}>} the token list.
 */
export function tokenize(input) {
  const tokens = [];
  let i = 0;

  while (i < input.length) {
    const ch = input[i];

    // Skip whitespace.
    if (/\s/.test(ch)) {
      i++;
      continue;
    }

    // Number literal: must start with a digit; may contain a decimal point.
    if (/[0-9]/.test(ch)) {
      let j = i;
      while (j < input.length && /[0-9.]/.test(input[j])) {
        j++;
      }
      const raw = input.slice(i, j);
      const value = Number(raw);
      if (Number.isNaN(value)) {
        throw new SyntaxError(`Invalid number: "${raw}"`);
      }
      tokens.push({ type: 'number', value });
      i = j;
      continue;
    }

    // Binary/unary operators.
    if (ch === '+' || ch === '-' || ch === '*' || ch === '/') {
      tokens.push({ type: 'operator', value: ch });
      i++;
      continue;
    }

    // Parentheses.
    if (ch === '(') {
      tokens.push({ type: 'lparen', value: ch });
      i++;
      continue;
    }
    if (ch === ')') {
      tokens.push({ type: 'rparen', value: ch });
      i++;
      continue;
    }

    throw new SyntaxError(`Unexpected character: "${ch}"`);
  }

  for (const token of tokens) {
    debug('tokenizer', `${token.type} ${token.value}`);
  }

  return tokens;
}
