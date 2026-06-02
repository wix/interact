import { defineConfig } from 'vite';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig(({ command }) => {
  const isDev = command === 'serve';

  return {
    build: {
      lib: {
        entry: {
          index: path.resolve(__dirname, 'src/index.ts'),
          react: path.resolve(__dirname, 'src/react/index.ts'),
          web: path.resolve(__dirname, 'src/web/index.ts'),
        },
        formats: ['es', 'cjs'],
      },
      sourcemap: true,
      rollupOptions: {
        external: ['react', 'react-dom'],
        output: {
          entryFileNames: '[format]/[name].js',
          compact: true,
        },
      },
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src'),
        '@wix/motion': path.resolve(__dirname, '../motion/src/index.ts'),
      },
      preserveSymlinks: false,
    },
    define: {
      __DEV__: isDev,
    },
  };
});
