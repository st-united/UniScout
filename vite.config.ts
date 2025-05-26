/// <reference types="vitest" />
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import pluginRewriteAll from 'vite-plugin-rewrite-all';

export default ({ mode }: any) => {
  process.env = { ...process.env, ...loadEnv(mode, process.cwd()) };

  return defineConfig({
    plugins: [pluginRewriteAll(), react()],
    resolve: {
      alias: { '@app': path.resolve('./src') },
    },
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: `
                @import "@app/assets/styles/_variable.scss";
                @import "@app/assets/styles/_fonts.scss";
                @import "@app/assets/styles/_layout.scss";`,
        },
      },
    },
    server: {
      watch: {
        usePolling: true,
      },
      host: true,
      strictPort: true,
      port: 5001,
    },
    test: {
      globals: true,
      environment: 'jsdom',
      coverage: {
        reporter: ['text', 'html'],
        exclude: ['node_modules/'],
      },
    },
  });
};
