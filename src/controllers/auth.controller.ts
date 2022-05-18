import {authenticate} from '@loopback/authentication';
import {
  User
} from '@loopback/authentication-jwt';
import {inject} from '@loopback/core';
import {model, property} from '@loopback/repository';
import {
  post, SchemaObject
} from '@loopback/rest';
import {SecurityBindings, UserProfile} from '@loopback/security';
import {PassportDiscordAuthProvider} from '@providers/discord-auth-strategy';
import {PassportGithubAuthProvider} from '@providers/github-auth-strategy';

@model()
export class NewUserRequest extends User {
  @property({
    type: 'string',
    required: true,
  })
  password: string;
}

const CredentialsSchema: SchemaObject = {
  type: 'object',
  required: ['email', 'password'],
  properties: {
    email: {
      type: 'string',
      format: 'email',
    },
    password: {
      type: 'string',
      minLength: 8,
    },
  },
};

export const CredentialsRequestBody = {
  description: 'The input of login function',
  required: true,
  content: {
    'application/json': {schema: CredentialsSchema},
  },
};

export class AuthController {
  constructor(
    @inject(SecurityBindings.USER, {optional: true})
    public user: UserProfile,
  ) { }

  @post("auth/discord")
  @authenticate(PassportDiscordAuthProvider.AUTH_STRATEGY_NAME)
  async discord() {

  }

  @post("auth/discord/callback")
  @authenticate(PassportDiscordAuthProvider.AUTH_STRATEGY_NAME)
  async discordCallback() {

  }

  @post("auth/github")
  @authenticate(PassportGithubAuthProvider.AUTH_STRATEGY_NAME)
  async github() {

  }

  @post("auth/github/callback")
  @authenticate(PassportGithubAuthProvider.AUTH_STRATEGY_NAME)
  async githubCallback() {

  }
}
