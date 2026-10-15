#!/usr/bin/env node
import { evaluate } from './calculator.js';
import { debug } from './debug.js';

const VERSION = '1.0.0';
const args = process.argv.slice(2);

if (args.includes('--help') || args.includes('-h')) {
  printUsage();
  process.exit(0);
}

if (args.includes('--version')) {
  console.log(VERSION);
  process.exit(0);
}

async function main() {
  let expression;
  if (args.length > 0) {
    expression = args.join(' ');
  } else {
    expression = await readStdin();
  }

  if (!expression || expression.trim() === '') {
    process.stderr.write('Error: no expression provided\n');
    process.exit(1);
  }

  debug('cli', `received expression: "${expression}"`);

  try {
    const result = evaluate(expression);
    console.log(result);
  } catch (error) {
    process.stderr.write(`Error: ${error.message}\n`);
    process.exit(1);
  }
}

function printUsage() {
  console.log('Usage: node src/cli.js [expression]');
  console.log('       echo "expression" | node src/cli.js');
  console.log('');
  console.log('Evaluates an arithmetic expression and prints the result to stdout.');
  console.log('Supported operators: + - * /, parentheses, unary minus, decimal numbers.');
  console.log('');
  console.log('Options:');
  console.log('  -h, --help    Show this help message');
  console.log('  --version     Show the version number');
}

function readStdin() {
  return new Promise((resolve, reject) => {
    let data = '';
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', (chunk) => {
      data += chunk;
    });
    process.stdin.on('end', () => resolve(data.trim()));
    process.stdin.on('error', reject);
  });
}

main();
