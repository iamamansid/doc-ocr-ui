import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';

// https://vite.dev/config/
export default defineConfig({
  base: '/doc-ocr-ui/', // Add this line
  plugins: [react()],
  build: {
      outDir: "dist",
    },
});