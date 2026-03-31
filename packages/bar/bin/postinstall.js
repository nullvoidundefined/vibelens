#!/usr/bin/env node

// CommonJS for maximum compatibility — this runs in the consumer's project context
const { existsSync, mkdirSync } = require('node:fs');
const { join } = require('node:path');

const PKG = 'vibelens';
const DOC_DIR = '.vibelens/docs';

try {
  const projectRoot = process.env.INIT_CWD || process.cwd();
  const publicDir = join(projectRoot, 'public');

  if (!existsSync(publicDir)) {
    process.exit(0);
  }

  const targetDir = join(publicDir, DOC_DIR);

  if (!existsSync(targetDir)) {
    mkdirSync(targetDir, { recursive: true });
    console.log(`${PKG}: Created ${DOC_DIR} in public/`);
    console.log(`${PKG}: Add <VibeLens /> to your layout to get started`);
  }
} catch {
  // Fail silently — postinstall errors shouldn't break npm install
}
