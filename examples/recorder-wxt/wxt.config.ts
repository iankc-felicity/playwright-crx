import { defineConfig } from 'wxt';
import * as path from 'path';

// See https://wxt.dev/api/config.html
export default defineConfig({
  alias: {
    '@isomorphic': path.resolve(__dirname, '../../playwright/packages/playwright-core/src/utils/isomorphic'),
    '@protocol': path.resolve(__dirname, '../../playwright/packages/protocol/src'),
    '@web': path.resolve(__dirname, '../../playwright/packages/web/src'),
    '@recorder': path.resolve(__dirname, '../../playwright/packages/recorder/src'),
  },
  modules: ['@wxt-dev/module-react'],
});
