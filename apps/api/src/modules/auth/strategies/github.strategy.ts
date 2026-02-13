import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-github2';
import { ConfigService } from '../../../config/config.service';

@Injectable()
export class GithubStrategy extends PassportStrategy(Strategy, 'github') {
  constructor(private configService: ConfigService) {
    super({
      clientID: configService.githubClientId,
      clientSecret: configService.githubClientSecret,
      callbackURL: configService.githubCallbackUrl,
      scope: ['user:email'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: any,
  ): Promise<any> {
    const { id, username, emails, displayName, photos } = profile;
    const user = {
      provider: 'github',
      provider_id: id,
      email: emails?.[0]?.value || `${username}@github.com`,
      full_name: displayName || username,
      avatar_url: photos?.[0]?.value,
      access_token: accessToken,
    };
    done(null, user);
  }
}
