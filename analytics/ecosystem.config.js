module.exports = {
  apps: [
    {
      name: "fifa_streak",
      script: "winning_streak.py",
      args: "",
      instances: 1,
      autorestart: false,
      cron_restart: "45 6 * * 1",
      watch: false,
      max_memory_restart: "2G",
      env: {
        NODE_ENV: "development",
      },
      env_production: {
        NODE_ENV: "production",
      },
    },
  ],

  deploy: {},
};
