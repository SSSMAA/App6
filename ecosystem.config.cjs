module.exports = {
  apps: [{
    name: 'ischoolgo-dev',
    script: 'npm',
    args: 'run dev',
    cwd: '/home/user/webapp',
    env: {
      NODE_ENV: 'development',
      PORT: 3000
    },
    watch: false,
    ignore_watch: ['node_modules', 'dist', '.git'],
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    error_file: '/home/user/webapp/logs/err.log',
    out_file: '/home/user/webapp/logs/out.log',
    log_file: '/home/user/webapp/logs/combined.log'
  }]
};