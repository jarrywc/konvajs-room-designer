import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig(({ command }) => ({
  plugins: [react()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  worker: {
    format: 'es' as const,
  },
  ...(command === 'build' && {
    build: {
      lib: {
        entry: resolve(__dirname, 'src/index.ts'),
        formats: ['es'] as const,
        fileName: 'room-designer',
      },
      rollupOptions: {
        external: ['react', 'react-dom', 'react/jsx-runtime', 'konva', 'react-konva'],
        output: {
          globals: {
            react: 'React',
            'react-dom': 'ReactDOM',
            konva: 'Konva',
            'react-konva': 'ReactKonva',
          },
        },
      },
    },
  }),
}));
