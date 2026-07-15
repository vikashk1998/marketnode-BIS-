/**
 * Central framework configuration.
 * Environment overrides via BIS_* variables allow CI and local flexibility.
 */
export const frameworkConfig = {
  urls: {
    frontend: process.env.BIS_FRONTEND_URL ?? 'http://localhost:5173',
    backend: process.env.BIS_BACKEND_URL ?? 'http://localhost:8080',
    swagger: process.env.BIS_SWAGGER_URL ?? 'http://localhost:8080/swagger-ui.html',
  },
  sftp: {
    host: process.env.BIS_SFTP_HOST ?? 'localhost',
    port: Number(process.env.BIS_SFTP_PORT ?? 2222),
    username: process.env.BIS_SFTP_USERNAME ?? 'bonduser',
    password: process.env.BIS_SFTP_PASSWORD ?? 'bondpass',
    remoteDir: process.env.BIS_SFTP_REMOTE_DIR ?? '/upload/bonds',
  },
  timeouts: {
    test: 180_000,
    expect: 15_000,
    action: 15_000,
    navigation: 30_000,
    api: 30_000,
    sftpPoll: 60_000,
    bondAppear: 90_000,
  },
  polling: {
    intervalMs: 1_000,
    bondAppearIntervalMs: 2_000,
  },
  timezone: 'Asia/Kuala_Lumpur',
  defaultUserId: 'INV-001',
} as const;

export type FrameworkConfig = typeof frameworkConfig;
