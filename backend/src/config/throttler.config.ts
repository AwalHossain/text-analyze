import { registerAs } from '@nestjs/config';

export default registerAs('throttler', () => ({
  ttl: parseInt(process.env.THROTTLE_TTL as string, 10) || 60,
  limit: parseInt(process.env.THROTTLE_LIMIT as string, 10) || 10,
  penaltyMs: parseInt(process.env.PENALTY_TTL as string, 10) || 5000,
}));
