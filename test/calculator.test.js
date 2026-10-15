import { test } from 'node:test';
import assert from 'node:assert/strict';
import { evaluate } from '../src/calculator.js';

test('addition and subtraction', () => {
  assert.equal(evaluate('2 + 3'), 5);
  assert.equal(evaluate('10 - 4'), 6);
  assert.equal(evaluate('2 + 3 - 1'), 4);
});

test('multiplication and division', () => {
  assert.equal(evaluate('4 * 5'), 20);
  assert.equal(evaluate('20 / 4'), 5);
});

test('operator precedence', () => {
  assert.equal(evaluate('2 + 3 * 4'), 14);
  assert.equal(evaluate('10 - 4 / 2'), 8);
});

test('parentheses override precedence', () => {
  assert.equal(evaluate('(2 + 3) * 4'), 20);
  assert.equal(evaluate('2 * (3 + 4)'), 14);
});

test('unary minus', () => {
  assert.equal(evaluate('-3 + 5'), 2);
  assert.equal(evaluate('5 - -3'), 8);
  assert.equal(evaluate('-(2 + 3)'), -5);
});

test('decimal numbers', () => {
  assert.equal(evaluate('3.14 * 2'), 6.28);
  assert.equal(evaluate('1.5 + 2.5'), 4);
});

test('whitespace tolerance', () => {
  assert.equal(evaluate('  2 + 3  '), 5);
  assert.equal(evaluate('2\t+\n3'), 5);
  assert.equal(evaluate('( 2 + 3 ) * 4'), 20);
});

test('division by zero throws', () => {
  assert.throws(() => evaluate('1 / 0'), /Division by zero/);
});

test('invalid input throws', () => {
  assert.throws(() => evaluate('2 +'), /Invalid expression/);
  assert.throws(() => evaluate('2 @ 3'), /Invalid expression/);
  assert.throws(() => evaluate('(2 + 3'), /Invalid expression/);
  assert.throws(() => evaluate(''), /Invalid expression/);
});
