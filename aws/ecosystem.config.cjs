// PM2 Ecosystem Configuration for FundedWealth API Server
module.exports = {
    apps: [
        {
            name: "fundedwealth-api",
            script: "./artifacts/api-server/dist/index.mjs",
            cwd: "/opt/fundedwealth",
            node_args: "--enable-source-maps --use-system-ca",
            instances: "max", // Use all available CPU cores
            exec_mode: "cluster",
            env: {
                NODE_ENV: "production",
                PORT: "8080",
            },
            env_file: "/opt/fundedwealth/.env",
            max_memory_restart: "512M",
            error_file: "/var/log/fundedwealth/error.log",
            out_file: "/var/log/fundedwealth/out.log",
            merge_logs: true,
            log_date_format: "YYYY-MM-DD HH:mm:ss Z",
            watch: false,
            max_restarts: 10,
            restart_delay: 5000,
            autorestart: true,
            kill_timeout: 5000,
            wait_ready: true,
            listen_timeout: 10000,
        },
    ],
};
