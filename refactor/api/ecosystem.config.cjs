// PM2 — menjaga API NestJS tetap nyala (restart otomatis bila crash / VPS reboot).
// Pakai: pm2 start ecosystem.config.cjs && pm2 save && pm2 startup
module.exports = {
  apps: [
    {
      name: 'meter-air-api',
      script: 'dist/main.js',
      cwd: '/var/www/meter-air-api',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      max_memory_restart: '400M',
      env: {
        NODE_ENV: 'production',
      },
      // Log
      out_file: '/var/log/meter-air-api/out.log',
      error_file: '/var/log/meter-air-api/err.log',
      merge_logs: true,
      time: true,
    },
  ],
};
