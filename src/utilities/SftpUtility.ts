import * as fs from 'fs';
import * as path from 'path';
import SftpClient from 'ssh2-sftp-client';
import { frameworkConfig } from '../config/framework-config';
import { Logger } from './Logger';

/**
 * Reusable SFTP helper for bond CSV uploads.
 */
export class SftpUtility {
  private readonly logger: Logger;

  constructor(logger?: Logger) {
    this.logger = logger ?? new Logger('SftpUtility');
  }

  async uploadFile(localPath: string, remoteFileName?: string): Promise<string> {
    const fileName = remoteFileName ?? path.basename(localPath);
    const remotePath = `${frameworkConfig.sftp.remoteDir}/${fileName}`.replace(/\/+/g, '/');
    const client = new SftpClient();

    try {
      await client.connect({
        host: frameworkConfig.sftp.host,
        port: frameworkConfig.sftp.port,
        username: frameworkConfig.sftp.username,
        password: frameworkConfig.sftp.password,
        readyTimeout: 20_000,
      });

      const buffer = fs.readFileSync(localPath);
      await client.put(buffer, remotePath);
      this.logger.sftpUpload(fileName, remotePath);
      return remotePath;
    } finally {
      await client.end().catch(() => undefined);
    }
  }

  async uploadContent(content: string, remoteFileName: string): Promise<string> {
    const tempDir = path.join(process.cwd(), 'test-data', 'generated');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    const localPath = path.join(tempDir, remoteFileName);
    fs.writeFileSync(localPath, content, 'utf8');
    return this.uploadFile(localPath, remoteFileName);
  }

  /**
   * Fallback used when SFTP credentials/network are unavailable:
   * writes into the docker-compose mounted upload volume.
   */
  uploadViaVolume(localPath: string, remoteFileName?: string): string {
    const fileName = remoteFileName ?? path.basename(localPath);
    const volumeDir = path.join(process.cwd(), 'sftp', 'upload', 'bonds');
    if (!fs.existsSync(volumeDir)) {
      fs.mkdirSync(volumeDir, { recursive: true });
    }
    const dest = path.join(volumeDir, fileName);
    fs.copyFileSync(localPath, dest);
    this.logger.sftpUpload(fileName, dest);
    return dest;
  }
}
