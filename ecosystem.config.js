module.exports = {
  apps: [{
    name: 'wagt',
    script: './index.js',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '512M',
    env: {
      NODE_ENV: 'production'
    },
    // Mengatasi Chromium memlock error
    kill_timeout: 5000,
    listen_timeout: 10000,
    // Log configuration
    error_file: './logs/error.log',
    out_file: './logs/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true
  }]
};
