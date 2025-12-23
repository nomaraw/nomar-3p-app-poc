import { defineConfig } from 'vite';

export default defineConfig({
  base: '', // leave as empty for project pages; we reference files with absolute GitHub Pages URL
  build: {
    lib: {
      entry: './src/sdk-entry.js',
      name: 'AmazonConnectApp', // window.AmazonConnectApp in UMD
      formats: ['umd', 'es'],
      fileName: (format) => `amazon-connect-app.${format}.js`,
    },
    sourcemap: true
  }
});
