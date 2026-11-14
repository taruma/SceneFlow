import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';
import {defineConfig, loadEnv, type Plugin} from 'vite';
import {CUES_SYNC_PROMPT} from './src/schemas/cues.prompt.ts';

function cuesAssetsPlugin(): Plugin {
  const schemaPath = path.resolve(__dirname, 'src/schemas/cues.schema.json');

  return {
    name: 'cues-ssot-assets',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const url = req.url?.split('?')[0];
        if (url === '/sync-prompt.txt') {
          res.setHeader('Content-Type', 'text/plain; charset=utf-8');
          res.end(CUES_SYNC_PROMPT);
          return;
        }
        if (url === '/schema.json') {
          res.setHeader('Content-Type', 'application/json; charset=utf-8');
          res.end(fs.readFileSync(schemaPath, 'utf-8'));
          return;
        }
        next();
      });
    },
    generateBundle() {
      this.emitFile({
        type: 'asset',
        fileName: 'sync-prompt.txt',
        source: CUES_SYNC_PROMPT,
      });
      this.emitFile({
        type: 'asset',
        fileName: 'schema.json',
        source: fs.readFileSync(schemaPath, 'utf-8'),
      });
    },
  };
}

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, '.', '');
  return {
    plugins: [react(), tailwindcss(), cuesAssetsPlugin()],
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules')) {
              if (id.includes('react') || id.includes('react-dom')) {
                return 'vendor-react';
              }
              if (id.includes('motion')) {
                return 'vendor-motion';
              }
              if (id.includes('lucide-react')) {
                return 'vendor-icons';
              }
              if (id.includes('react-youtube')) {
                return 'vendor-player';
              }
            }
          },
        },
      },
    },
  };
});
