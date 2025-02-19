/* eslint-disable @typescript-eslint/require-await */
import { Injectable, Logger } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection, ConnectionStates } from 'mongoose';

@Injectable()
export class AppService {
  constructor(
    @InjectConnection() private readonly mongoConnection: Connection,
    private readonly logger: Logger,
  ) {}
  getHello(): string {
    return 'Hello World!';
  }

  async checkHealth() {
    try {
      const dbStatus =
        this.mongoConnection.readyState === ConnectionStates.connected
          ? 'up'
          : 'down';

      return {
        status: dbStatus === 'up' ? 'OK' : 'ERROR',
        timestamp: new Date().toISOString(), // Return as ISO string
        services: {
          database: dbStatus,
          logger: 'up',
        },
      };
    } catch (error) {
      this.logger.error('Health check failed', error);
      return {
        status: 'ERROR',
        timestamp: new Date().toISOString(),
        services: {
          database: 'down',
          logger: 'up',
        },
      };
    }
  }
}
