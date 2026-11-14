import { createHash } from 'crypto';
import fs from 'fs';
import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import type { Plugin } from 'vite';
import react from '@vitejs/plugin-react';

const PRECACHE_EXTENSIONS = /\.(js|css|svg|woff2?|ttf|otf)$/i;

function serviceWorkerPrecachePlugin(): Plugin {
  return {
    name: 'permitflow-sw-precache',
    apply: 'build',
    closeBundle() {
      const outDir = path.resolve(__dirname, 'dist');
      const assetsDir = path.join(outDir, 'assets');
      const swPath = path.join(outDir, 'sw.js');

      if (!fs.existsSync(assetsDir) || !fs.existsSync(swPath)) return;

      const assetFiles = fs
        .readdirSync(assetsDir)
        .filter((file) => PRECACHE_EXTENSIONS.test(file))
        .sort();

      const urls = [
        '/',
        '/index.html',
        '/manifest.webmanifest',
        '/icon.svg',
        ...assetFiles.map((file) => `/assets/${file}`),
      ];

      const version = createHash('sha1').update(urls.join('|')).digest('hex').slice(0, 12);

      fs.writeFileSync(
        path.join(outDir, 'sw-precache.json'),
        JSON.stringify({ version, urls }, null, 2),
      );

      const source = fs.readFileSync(swPath, 'utf8');
      fs.writeFileSync(swPath, `${source}\nself.__PRECACHE_VERSION = '${version}';\n`);
    },
  };
}

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react(), serviceWorkerPrecachePlugin()],
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
