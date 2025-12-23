
import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    lib: {
      entry: './src/sdk-entry.js',
      name: 'AmazonConnectApp',                // window.AmazonConnectApp === SDK object
      formats: ['umd'],                        // keep it simple; ES build optional
      fileName: () => 'amazon-connect-app.umd.js',
    },
    sourcemap: true,
  },
});
