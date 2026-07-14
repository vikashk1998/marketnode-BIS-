import * as fs from 'fs';
import * as path from 'path';
import { LogLevel } from '../enums';

const LEVEL_RANK: Record<LogLevel, number> = {
  [LogLevel.DEBUG]: 10,
  [LogLevel.INFO]: 20,
  [LogLevel.WARN]: 30,
  [LogLevel.ERROR]: 40,
};

/**
 * Structured logger with file + console sinks.
 * Full detail always goes to reports/logs.
 * Console is quiet by default (WARN/ERROR only).
 *
 * Override:
 *   BIS_LOG_CONSOLE=1          → mirror all levels to console
 *   BIS_LOG_CONSOLE_LEVEL=INFO → console threshold (DEBUG|INFO|WARN|ERROR)
 */
export class Logger {
  private static readonly logDir = path.join(process.cwd(), 'reports', 'logs');
  private readonly context: string;
  private readonly sessionFile: string;
  private readonly consoleLevel: LogLevel;

  constructor(context: string) {
    this.context = context;
    if (!fs.existsSync(Logger.logDir)) {
      fs.mkdirSync(Logger.logDir, { recursive: true });
    }
    this.sessionFile = path.join(
      Logger.logDir,
      `session-${new Date().toISOString().replace(/[:.]/g, '-')}.log`,
    );
    this.consoleLevel = Logger.resolveConsoleLevel();
  }

  debug(message: string, data?: unknown): void {
    this.write(LogLevel.DEBUG, message, data);
  }

  info(message: string, data?: unknown): void {
    this.write(LogLevel.INFO, message, data);
  }

  warn(message: string, data?: unknown): void {
    this.write(LogLevel.WARN, message, data);
  }

  error(message: string, data?: unknown): void {
    this.write(LogLevel.ERROR, message, data);
  }

  testStart(title: string): void {
    this.info(`TEST START: ${title}`);
  }

  testEnd(title: string, status: string): void {
    this.info(`TEST END: ${title} → ${status}`);
  }

  apiRequest(method: string, url: string, body?: unknown): void {
    this.info(`API REQUEST ${method} ${url}`, body);
  }

  apiResponse(status: number, url: string, body?: unknown): void {
    this.info(`API RESPONSE ${status} ${url}`, body);
  }

  businessDate(date: string): void {
    this.info(`BUSINESS DATE: ${date}`);
  }

  generatedData(label: string, data: unknown): void {
    this.info(`GENERATED DATA [${label}]`, data);
  }

  sftpUpload(fileName: string, remotePath: string): void {
    this.info(`SFTP UPLOAD: ${fileName} → ${remotePath}`);
  }

  cleanup(action: string): void {
    this.info(`CLEANUP: ${action}`);
  }

  failure(reason: string, data?: unknown): void {
    this.error(`FAILURE: ${reason}`, data);
  }

  getLogFilePath(): string {
    return this.sessionFile;
  }

  private write(level: LogLevel, message: string, data?: unknown): void {
    const timestamp = new Date().toISOString();
    const payload =
      data === undefined ? '' : ` | ${typeof data === 'string' ? data : JSON.stringify(data)}`;
    const line = `[${timestamp}] [${level}] [${this.context}] ${message}${payload}`;

    // Always persist full detail for reporting / failure attachments
    fs.appendFileSync(this.sessionFile, `${line}\n`, 'utf8');

    if (LEVEL_RANK[level] >= LEVEL_RANK[this.consoleLevel]) {
      // eslint-disable-next-line no-console
      console.log(line);
    }
  }

  private static resolveConsoleLevel(): LogLevel {
    const verboseFlag = (process.env.BIS_LOG_CONSOLE ?? '').toLowerCase();
    if (verboseFlag === '1' || verboseFlag === 'true' || verboseFlag === 'all') {
      return LogLevel.DEBUG;
    }

    const configured = (process.env.BIS_LOG_CONSOLE_LEVEL ?? 'WARN').toUpperCase();
    if (configured === 'DEBUG') return LogLevel.DEBUG;
    if (configured === 'INFO') return LogLevel.INFO;
    if (configured === 'ERROR') return LogLevel.ERROR;
    return LogLevel.WARN;
  }
}

export const rootLogger = new Logger('Framework');
