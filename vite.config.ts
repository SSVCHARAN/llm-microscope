import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'node:fs';
import path from 'node:path';

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'models-strict-404-handler',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          if (req.url && req.url.startsWith('/models/')) {
            const cleanUrl = req.url.split('?')[0];
            const filePath = path.join(process.cwd(), 'public', cleanUrl);
            if (!fs.existsSync(filePath)) {
              res.statusCode = 404;
              res.setHeader('Content-Type', 'text/plain');
              res.end('404 Not Found');
              return;
            }
          }
          next();
        });
      }
    }
  ],
  server: {
    proxy: {
      '/lmstudio': {
        target: 'http://127.0.0.1:1234',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/lmstudio/, '')
      }
    }
  },
  optimizeDeps: {
    exclude: ['@huggingface/transformers']
  }
});
