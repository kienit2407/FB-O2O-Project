import { SetMetadata } from '@nestjs/common';
import { ClientApp } from '../common/auth.constants';

export const CLIENT_KEY = 'client';
export const Client = (client: ClientApp) => SetMetadata(CLIENT_KEY, client);
