import * as fs from 'fs';
import * as path from 'path';
import { Logger } from './Logger';

export class FileUtility {
  private readonly logger: Logger;

  constructor(logger?: Logger) {
    this.logger = logger ?? new Logger('FileUtility');
  }

  ensureDir(dirPath: string): void {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
      this.logger.debug(`Created directory ${dirPath}`);
    }
  }

  readText(filePath: string): string {
    return fs.readFileSync(filePath, 'utf8');
  }

  writeText(filePath: string, content: string): void {
    this.ensureDir(path.dirname(filePath));
    fs.writeFileSync(filePath, content, 'utf8');
  }

  exists(filePath: string): boolean {
    return fs.existsSync(filePath);
  }

  deleteIfExists(filePath: string): void {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      this.logger.cleanup(`Deleted ${filePath}`);
    }
  }

  listFiles(dirPath: string, extension?: string): string[] {
    if (!fs.existsSync(dirPath)) {
      return [];
    }
    return fs
      .readdirSync(dirPath)
      .filter((f) => (extension ? f.endsWith(extension) : true))
      .map((f) => path.join(dirPath, f));
  }
}
