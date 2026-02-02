module.exports = {
  apps: [
    {
      name: "bklm-api",
      cwd: "./apps/api",      
      script: "dist/main.js",
      env: {
        NODE_ENV: "production",
        PORT: 3001,
      },
    },
    {
      name: "bklm-web",
      cwd: "./apps/web",      
      script: "npm",
      args: "start",          
      env: {
        NODE_ENV: "production",
        PORT: 3001,
      },
    },
  ],
};