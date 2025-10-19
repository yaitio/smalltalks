// @ts-check

import react from '@astrojs/react';
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  security: {
    checkOrigin: false
  },
  integrations: [react()],
  vite: {
    resolve: {
      alias: {
        '@': '/src',
        '@components': '/src/components',
        '@layouts': '/src/layouts',
        '@services': '/src/services',
        '@stores': '/src/stores',
        '@hooks': '/src/hooks',
        '@utils': '/src/utils',
        '@types': '/src/types',
        '@styles': '/src/styles',
      },
    },
  },
});
