module.exports = {
  apps: [

    {
      name: "wc_2026_app",
      script: "wc_2026_app.js",
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: "1G",
      exec_mode: "cluster",
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
