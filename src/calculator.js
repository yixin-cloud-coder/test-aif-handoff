import { tokenize } from './tokenizer.js';
import { parse } from './parser.js';
import { evaluateNode } from './evaluator.js';
import { debug } from './debug.js';

/**
 * Evaluate an arithmetic expression string by composing the pipeline
 * `tokenize -> parse -> evaluate`.
 *
 * @param {string} expression - the raw arithmetic expression.
 * @returns {number} the numeric result.
 * @throws {Error} a friendly error for syntax problems, or `Division by zero`.
 */
export function evaluate(expression) {
  debug('calculator', `evaluate("${expression}")`);

  try {
    const tokens = tokenize(expression);
    const ast = parse(tokens);
    return evaluateNode(ast);
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error(`Invalid expression: ${error.message}`);
    }
    throw error;
  }
}
