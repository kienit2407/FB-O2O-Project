import { Injectable } from '@nestjs/common';
import Redis from 'ioredis';
import * as crypto from 'crypto';
import { ConfigService } from '../../../config/config.service';

@Injectable()
export class RefreshSessionService {
    private redis: Redis;
    private ttlSeconds = 30 * 24 * 60 * 60; // match refresh exp (30d)

    constructor(private config: ConfigService) {
        this.redis = new Redis({
            host: this.config.redisHost || 'localhost',
            port: this.config.redisPort || 6379,
            password: this.config.redisPassword,
        });
    }

    async createSession(input: {
        userId: string;
        deviceId?: string;
        aud: string;
        role: string;
    }) {
        const sid = crypto.randomUUID();
        const key = `rt:${sid}`;

        await this.redis.set(
            key,
            JSON.stringify({
                userId: input.userId,
                deviceId: input.deviceId ?? null,
                aud: input.aud,
                role: input.role,
                createdAt: new Date().toISOString(),
            }),
            'EX',
            this.ttlSeconds,
        );

        // optional: track all sessions of user (for revoke-all)
        await this.redis.sadd(`user_rt:${input.userId}`, sid);
        await this.redis.expire(`user_rt:${input.userId}`, this.ttlSeconds);

        return sid;
    }

    async exists(sid: string) {
        const key = `rt:${sid}`;
        const v = await this.redis.get(key);
        return !!v;
    }

    async revokeSession(sid: string) {
        await this.redis.del(`rt:${sid}`);
    }

    async rotateSession(oldSid: string, input: { userId: string; deviceId?: string; aud: string; role: string }) {
        await this.revokeSession(oldSid);
        return this.createSession(input);
    }
}
