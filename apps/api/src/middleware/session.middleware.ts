import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

declare global {
  namespace Express {
    interface Request {
      session?: {
        id: string;
        userId?: string;
        createdAt?: Date;
        lastActivity?: Date;
        metadata?: Record<string, any>;
      };
      deviceId?: string;
      clientApp?: string;
    }
  }
}

@Injectable()
export class SessionMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    // Extract common headers
    const sessionId = (req.headers['x-session-id'] as string) || req.cookies?.session_id;
    const deviceId = req.headers['x-device-id'] as string;
    const clientApp = req.headers['x-client-app'] as string;

    // Build session object
    const session: any = {
      id: sessionId || this.generateSessionId(),
      createdAt: new Date(),
      lastActivity: new Date(),
      metadata: {
        userAgent: req.headers['user-agent'],
        ip: req.ip || req.connection?.remoteAddress,
        deviceId,
        clientApp,
      },
    };

    if (sessionId) {
      // In production, you would validate the session from Redis/database
      // For now, we just mark it as existing
      session.userId = undefined; // Will be populated by JWT guard
    }

    // Attach to request
    req['session'] = session;
    req.session = session;
    req.deviceId = deviceId;
    req.clientApp = clientApp;

    next();
  }

  private generateSessionId(): string {
    return `sess_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
  }
}
