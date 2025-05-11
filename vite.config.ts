import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import dts from 'vite-plugin-dts';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig({
  plugins: [
    react(),
    dts({
      include: ['src/**/*'],
      exclude: ['node_modules/**'],
      insertTypesEntry: true,
    }),
  ],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'ReactGanttChart',
      fileName: format => `react-gantt-chart.${format}.js`,
      formats: ['es', 'umd'],
    },
    cssCodeSplit: false, // Ensure CSS is not split into chunks
    rollupOptions: {
      external: ['react', 'react-dom', 'lodash'],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
          lodash: '_',
          zustand: 'zustand',
        },
        assetFileNames: (assetInfo): string => {
          // Makes all CSS files output as 'style.css'
          if (assetInfo.name && assetInfo.name.endsWith('.css')) {
            return 'style.css';
          }
          return assetInfo.name || 'asset-[hash].[ext]';
        },
      },
    },
    // Make sure to copy the style.css file to the dist directory as well
    emptyOutDir: true, // Clear the output directory before build
  },
  css: {
    // Make sure styles are processed correctly
    postcss: {}, // Add any postcss processing if needed
  },
});
