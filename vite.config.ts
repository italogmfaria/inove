import { defineConfig } from 'vite';

export default defineConfig({
  logLevel: 'error',
  build: {
    rollupOptions: {
      onwarn() {
        return;
      }
    }
  },
  server: {
    hmr: {
      overlay: false
    }
  }
});
