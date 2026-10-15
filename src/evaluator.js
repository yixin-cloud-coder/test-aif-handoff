import { debug } from './debug.js';

/**
 * Evaluate an AST node produced by the parser.
 *
 * Walks the tree and applies `+ - * /` and unary negation. Throws
 * `Error('Division by zero')` when a divisor evaluates to `0`.
 *
 * @param {{type: string}} node - an AST node.
 * @returns {number} the numeric result.
 * @throws {Error} on division by zero or unknown node/operator.
 */
export function evaluateNode(node) {
  switch (node.type) {
    case 'number': {
      debug('evaluator', `number ${node.value}`);
      return node.value;
    }

    case 'unary': {
      const value = -evaluateNode(node.right);
      debug('evaluator', `- ${value}`);
      return value;
    }

    case 'binary': {
      const left = evaluateNode(node.left);
      const right = evaluateNode(node.right);

      let result;
      switch (node.op) {
        case '+':
          result = left + right;
          break;
        case '-':
          result = left - right;
          break;
        case '*':
          result = left * right;
          break;
        case '/':
          if (right === 0) {
            throw new Error('Division by zero');
          }
          result = left / right;
          break;
        default:
          throw new Error(`Unknown operator: ${node.op}`);
      }

      debug('evaluator', `${node.op} ${result}`);
      return result;
    }

    default:
      throw new Error(`Unknown AST node type: ${node.type}`);
  }
}
