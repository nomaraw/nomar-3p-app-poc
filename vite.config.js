// vite.config.js
import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    lib: {
      entry: './src/sdk-entry.js',
      name: 'AmazonConnectApp',              // UMD global: window.AmazonConnectApp
      formats: ['umd', 'es'],
      fileName: (format) => `amazon-connect-app.${format}.js`,
    },
    sourcemap: true,
  },
});
