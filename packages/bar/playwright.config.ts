import { defineConfig } from '@playwright/test';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SERVE_SCRIPT = resolve(__dirname, 'bin/serve.js');
const DOCS_PATH = resolve(__dirname, 'tests/e2e/fixtures/mock-project/.vibelens/docs');

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 30000,
  use: {
    browserName: 'chromium',
    headless: true,
    baseURL: 'http://localhost:4799',
  },
  webServer: {
    command: `node ${SERVE_SCRIPT} -p 4799 -d ${DOCS_PATH}`,
    port: 4799,
    reuseExistingServer: false,
    env: { VIBELENS_NO_OPEN: '1' },
    timeout: 30000,
  },
});
