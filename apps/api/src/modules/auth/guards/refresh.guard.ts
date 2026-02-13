// src/auth/guards/refresh.guard.ts
import { AuthGuard } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';

@Injectable()
export class MerchantRefreshGuard extends AuthGuard('jwt-refresh') {}
