/// <reference types="vitest" />
import { default as react } from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, loadEnv } from 'vite';

export default async ({ mode }: any) => {
  const pluginRewriteAll = (await import('vite-plugin-rewrite-all')).default;

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
                @use "@app/assets/styles/_variable.scss";
                @use "@app/assets/styles/_fonts.scss";
                @use "@app/assets/styles/_layout.scss";`,
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
