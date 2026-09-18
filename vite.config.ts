import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['@huggingface/transformers']
  },
  server: {
    // Add a custom middleware to prevent index.html fallback for /models/
    configureServer: (server) => {
      server.middlewares.use((req, res, next) => {
        if (req.url?.startsWith('/models/')) {
          // If it's a request to /models/, tell Vite not to use the SPA fallback.
          // By attaching a custom header or just checking if file exists.
          // The easiest way is to let the static file server handle it, and if it fails, throw 404.
          const fs = require('fs');
          const path = require('path');
          const filePath = path.join(__dirname, 'public', req.url);
          if (!fs.existsSync(filePath)) {
            res.statusCode = 404;
            res.end('Not Found');
            return;
          }
        }
        next();
      });
    }
  }
});
