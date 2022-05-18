// In file 'providers/my-basic-auth-strategy.ts'

import {AuthenticationBindings, AuthenticationStrategy, UserProfileFactory} from '@loopback/authentication';
import {StrategyAdapter} from '@loopback/authentication-passport';
import {inject, Provider} from '@loopback/core';
import {repository} from '@loopback/repository';
import {Strategy as GithubStrategy} from 'passport-github';
import OAuth2Strategy from 'passport-oauth2';
import {UserRepository} from '../repositories';

export class PassportGithubAuthProvider<MyUser>
  implements Provider<AuthenticationStrategy>
{
  static readonly AUTH_STRATEGY_NAME = "github";

  constructor(
    @inject(AuthenticationBindings.USER_PROFILE_FACTORY)
    private userProfileFactory: UserProfileFactory<MyUser>,
    @repository('users') private userRepository: UserRepository
  ) { }

  value(): AuthenticationStrategy {
    const githubStrategy = this.configuredGithubStrategy();
    return this.convertToAuthStrategy(githubStrategy);
  }

  // Takes in the verify callback function and returns a configured basic strategy.
  configuredGithubStrategy(): GithubStrategy {
    return new GithubStrategy({
      clientID: <string>process.env.GITHUB_CLIENT_ID,
      clientSecret: <string>process.env.GITHUB_CLIENT_SECRET,
      callbackURL: <string>process.env.GITHUB_CALLBACK_URL,
    }, this.verify);
  }

  verify(accessToken: string, refreshToken: string, profile: GithubStrategy.Profile, done: OAuth2Strategy.VerifyCallback) {
    this.userRepository.findOrCreate(
      {
        where: {
          githubId: profile.id
        }
      },
      {
        githubId: profile.id
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
  convertToAuthStrategy(strategy: GithubStrategy): AuthenticationStrategy {
    return new StrategyAdapter(
      strategy,
      PassportGithubAuthProvider.AUTH_STRATEGY_NAME,
      this.userProfileFactory,
    );
  }
}
