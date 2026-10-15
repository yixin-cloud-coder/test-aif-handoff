<!-- handoff:task:e1386cc9-4803-4f70-812c-fe19a247daa5 -->

# Implementation Plan: CLI Calculator (命令行小计算器)

Branch: main
Created: 2026-10-15

## Settings
- [ ] Testing: yes
- [ ] Logging: verbose
- [ ] Docs: no

## Summary

A small command-line calculator in pure Node.js with **zero external dependencies**.
It reads an arithmetic expression from CLI arguments or stdin, evaluates it with
correct operator precedence and parentheses, and prints the result to stdout.

Requirements:
- [x] Pure Node.js — no npm dependencies (everything on `node:` built-ins).
- [x] Operators: `+` `-` `*` `/`, parentheses, unary minus, decimal numbers.
- [x] Correct precedence (`*` `/` bind tighter than `+` `-`).
- [x] Tests written with Node's built-in `node:test` + `node:assert` (run via `node --test`).
- [x] Clear errors (invalid syntax, division by zero) written to stderr with a non-zero exit code.

Architecture: a classic `tokenize → parse → evaluate` pipeline, split into small
pure modules so each stage is unit-testable in isolation. `stdout` is reserved
exclusively for the numeric result; all logging and errors go to `stderr`.

## Commit Plan
- [x] **Commit 1** (after tasks 1–3): "feat: calculator tokenizer and parser"
- [x] **Commit 2** (after tasks 4–5): "feat: evaluator and CLI entry"
- [x] **Commit 3** (after task 6): "test: node:test calculator suite"

## Tasks

### Phase 1: Setup
- [x] **Task 1: Scaffold the project**
  - [x] Create `package.json` with `"type": "module"`, **no dependencies**, and scripts
    `"test": "node --test"` and `"start": "node src/cli.js"`.
  - [x] Create `.gitignore` (`node_modules/`, `.DS_Store`).
  - [x] Create empty `src/` and `test/` directory structure.
  - [x] Logging: no runtime code yet. Verify the scaffold with `node --test` (must exit 0
    with "no tests found").
  - [x] Files: `package.json`, `.gitignore`, `src/`, `test/`

### Phase 2: Core Engine
- [x] **Task 2: Implement the tokenizer** (depends on 1)
  - [x] Implement `tokenize(input) → Token[]` in `src/tokenizer.js`.
  - [x] Token types: `number` (integer or decimal), `operator` (`+ - * /`), `lparen`, `rparen`.
  - [x] Skip whitespace. Throw `SyntaxError` on any unrecognized character.
  - [x] Emit `-` as an operator token; the parser decides unary vs. binary context.
  - [x] Logging: a `debug()` helper gated by `DEBUG=1` logs each produced token to `stderr`
    (format: `[tokenizer] <type> <value>`).
  - [x] Files: `src/tokenizer.js`

- [x] **Task 3: Implement the recursive-descent parser** (depends on 2)
  - [x] Implement `parse(tokens) → AST` in `src/parser.js`.
  - [x] Grammar (precedence climbing):
    - [x] `expr    := term (('+' | '-') term)*`
    - [x] `term    := factor (('*' | '/') factor)*`
    - [x] `factor  := number | '(' expr ')' | '-' factor`
  - [x] AST node shapes: `{ type:'number', value }`, `{ type:'binary', op, left, right }`,
    `{ type:'unary', op, right }`.
  - [x] Throw `SyntaxError` on unexpected tokens or trailing input after a complete expression.
  - [x] Logging: `debug()` logs the fully-built AST to `stderr` (format: `[parser] <AST>`).
  - [x] Files: `src/parser.js`

- [x] **Task 4: Implement the evaluator and public facade** (depends on 3)
  - [x] Implement `evaluateNode(node) → number` in `src/evaluator.js`: walk the AST and apply
    `+ - * /` and unary negation.
  - [x] Throw `Error('Division by zero')` when a divisor evaluates to `0`.
  - [x] Implement `evaluate(expression) → number` in `src/calculator.js` composing
    `tokenize → parse → evaluate`, rethrowing `SyntaxError` as a friendly error.
  - [x] Logging: `debug()` logs each node evaluation (format: `[evaluator] <op> <result>`);
    `console.error` logs division-by-zero and syntax failures with full context.
  - [x] Files: `src/evaluator.js`, `src/calculator.js`

### Phase 3: CLI + Tests
- [x] **Task 5: Implement the CLI entry point** (depends on 4)
  - [x] Implement `src/cli.js`: join `process.argv.slice(2)` into a single expression; if no
    args are given, read the expression from stdin (all lines).
  - [x] Print the numeric result to `stdout` via `console.log`.
  - [x] On error, print `Error: <message>` to `stderr` and `process.exit(1)`.
  - [x] Support `--help` / `-h` to print usage, and `--version`.
  - [x] Logging: `debug()` logs the received expression; all diagnostics go to `stderr` so
    `stdout` stays clean for scripting.
  - [x] Files: `src/cli.js`

- [x] **Task 6: Write the node:test suite** (depends on 4, 5)
  - [x] Implement `test/calculator.test.js` using `import { test } from 'node:test'` and
    `import assert from 'node:assert/strict'`.
  - [x] Cover: `+`/`-`; `*`/`/`; precedence (`2 + 3 * 4 === 14`); parentheses
    (`(2 + 3) * 4 === 20`); unary minus (`-3 + 5 === 2`); decimals (`3.14 * 2`);
    whitespace tolerance; division by zero throws; invalid input throws.
  - [x] Verify the full suite passes with `npm test` (`node --test`).
  - [x] Logging: N/A — tests use assertions; no runtime logging.
  - [x] Files: `test/calculator.test.js`
