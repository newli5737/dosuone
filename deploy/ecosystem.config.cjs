/**
 * PM2 — chạy từ thư mục repo:
 *   pm2 start deploy/ecosystem.config.cjs
 *   pm2 save
 */
module.exports = {
  apps: [
    {
      name: 'dosuone-one-api',
      cwd: '/home/dosuTech/appbandt/backend',
      script: 'dist/main.js',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '400M',
      env: {
        NODE_ENV: 'production',
      },
      error_file: '/home/dosuTech/appbandt/logs/api-error.log',
      out_file: '/home/dosuTech/appbandt/logs/api-out.log',
      merge_logs: true,
      time: true,
    },
  ],
};
