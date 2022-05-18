// In file 'providers/my-basic-auth-strategy.ts'

import {AuthenticationBindings, AuthenticationStrategy, UserProfileFactory} from '@loopback/authentication';
import {StrategyAdapter} from '@loopback/authentication-passport';
import {inject, Provider} from '@loopback/core';
import {repository} from '@loopback/repository';
import {Strategy as DiscordStrategy} from 'passport-discord';
import OAuth2Strategy from 'passport-oauth2';
import {UserRepository} from '../repositories';

export class PassportDiscordAuthProvider<MyUser>
  implements Provider<AuthenticationStrategy>
{
  static readonly AUTH_STRATEGY_NAME = "discord";

  constructor(
    @inject(AuthenticationBindings.USER_PROFILE_FACTORY)
    private userProfileFactory: UserProfileFactory<MyUser>,
    @repository('users') private userRepository: UserRepository
  ) { }

  value(): AuthenticationStrategy {
    const discordStrategy = this.configuredDiscordStrategy();
    return this.convertToAuthStrategy(discordStrategy);
  }

  // Takes in the verify callback function and returns a configured basic strategy.
  configuredDiscordStrategy(): DiscordStrategy {
    return new DiscordStrategy({
      clientID: <string>process.env.DISCORD_CLIENT_ID,
      clientSecret: <string>process.env.DISCORD_CLIENT_SECRET,
      callbackURL: <string>process.env.DISCORD_CALLBACK_URL,
      scope: ['identify', 'email', 'guilds', 'guilds.join']
    }, this.verify);
  }

  verify(accessToken: string, refreshToken: string, profile: DiscordStrategy.Profile, done: OAuth2Strategy.VerifyCallback) {
    this.userRepository.findOrCreate(
      {
        where: {
          discordId: profile.id
        }
      },
      {
        discordId: profile.id
      }
    ).then((result) => {
      const user = result[0];
      done(undefined, user);
    }).catch((err) => {
      done(err, undefined);
    });
  }

  // Applies the `StrategyAdapter` to the configured basic strategy instance.
  // You'd better define your strategy name as a constant, like
  // `const AUTH_STRATEGY_NAME = 'basic'`
  // You will need to decorate the APIs later with the same name
  // Pass in the user profile factory
  convertToAuthStrategy(strategy: DiscordStrategy): AuthenticationStrategy {
    return new StrategyAdapter(
      strategy,
      PassportDiscordAuthProvider.AUTH_STRATEGY_NAME,
      this.userProfileFactory,
    );
  }
}
