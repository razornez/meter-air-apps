/**
 * PM2 ecosystem — menjalankan backend + frontend sekaligus.
 *
 * Pakai:
 *   cd refactor
 *   pm2 start ecosystem.config.js   ← mulai semua
 *   pm2 stop all                     ← hentikan semua
 *   pm2 restart all                  ← restart semua
 *   pm2 logs                         ← lihat log real-time
 *   pm2 logs meter-api               ← log backend saja
 *   pm2 logs meter-web               ← log expo saja
 *
 * Auto-start saat Windows boot (jalankan sekali sebagai Admin):
 *   pm2 start ecosystem.config.js
 *   pm2 save
 *   npm install -g pm2-windows-startup
 *   pm2-startup install
 */

const path = require('path');
const root  = __dirname;
// Windows: npm/npx harus pakai .cmd
const npm  = process.platform === 'win32' ? 'npm.cmd'  : 'npm';
const npx  = process.platform === 'win32' ? 'npx.cmd'  : 'npx';

module.exports = {
  apps: [
    // ── Backend NestJS (auto-reload via nest --watch) ───────────────────────
    {
      name: 'meter-api',
      cwd: path.join(root, 'api'),
      script: npm,
      args: 'run start:dev',
      autorestart: true,
      max_restarts: 10,
      restart_delay: 3000,
      env: {
        NODE_ENV: 'development',
        PORT: '4000',
      },
      error_file: path.join(root, 'logs', 'api-error.log'),
      out_file:   path.join(root, 'logs', 'api-out.log'),
      merge_logs: true,
    },

    // ── Mobile / Web (Expo + Fast Refresh) ─────────────────────────────────
    {
      name: 'meter-web',
      cwd: path.join(root, 'mobile'),
      script: npx,
      args: 'expo start --web --non-interactive',
      autorestart: true,
      max_restarts: 5,
      restart_delay: 5000,
      env: {
        EXPO_PUBLIC_API_URL: 'http://localhost:4000/api',
      },
      error_file: path.join(root, 'logs', 'web-error.log'),
      out_file:   path.join(root, 'logs', 'web-out.log'),
      merge_logs: true,
    },
  ],
};
