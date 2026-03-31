#!/usr/bin/env node

import { existsSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createServer } from 'vite';
import react from '@vitejs/plugin-react';

const __dirname = dirname(fileURLToPath(import.meta.url));
const VIEWER_DIR = resolve(__dirname, '..', 'viewer');

// Parse args (keep it simple — no commander needed for two flags)
const args = process.argv.slice(2);
let port = 4747;
let docsPath = null;

for (let i = 0; i < args.length; i++) {
  if ((args[i] === '-p' || args[i] === '--port') && args[i + 1]) {
    port = parseInt(args[i + 1], 10);
    i++;
  } else if ((args[i] === '-d' || args[i] === '--docs') && args[i + 1]) {
    docsPath = resolve(args[i + 1]);
    i++;
  } else if (args[i] === '--help' || args[i] === '-h') {
    console.log(`
  vibelens serve — view your project's VibeLens docs in the browser

  Usage:
    vibelens serve [options]

  Options:
    -p, --port <number>   Port to serve on (default: 4747)
    -d, --docs <path>     Path to docs directory
    -h, --help            Show this help

  The viewer looks for docs in this order:
    1. --docs flag (if provided)
    2. .vibelens/docs/ in the current directory
    3. public/.vibelens/docs/ in the current directory
`);
    process.exit(0);
  }
}

// Find docs directory
if (!docsPath) {
  const cwd = process.cwd();
  const candidates = [
    join(cwd, '.vibelens', 'docs'),
    join(cwd, 'public', '.vibelens', 'docs'),
  ];
  docsPath = candidates.find((p) => existsSync(p));
}

if (!docsPath || !existsSync(docsPath)) {
  console.error('\n  Could not find VibeLens docs directory.');
  console.error('  Looked for:');
  console.error('    .vibelens/docs/');
  console.error('    public/.vibelens/docs/');
  console.error('\n  Generate docs first, then run vibelens serve.\n');
  process.exit(1);
}

console.log(`\n  VibeLens viewer`);
console.log(`  Docs: ${docsPath}\n`);

const server = await createServer({
  root: VIEWER_DIR,
  plugins: [react()],
  resolve: {
    alias: {
      '@vibelens-docs': docsPath,
    },
  },
  server: {
    port,
    open: true,
  },
});

await server.listen();
server.printUrls();
