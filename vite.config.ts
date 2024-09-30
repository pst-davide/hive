import { defineConfig } from 'vite';

export default defineConfig({
  resolve: {
    alias: {
      'fs': '',
      'path': '',
      'url': '',
      'http': '',
    }
  }
});
