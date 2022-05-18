import {AuthenticationBindings, AuthenticationComponent} from '@loopback/authentication';
import {UserServiceBindings} from '@loopback/authentication-jwt';
import {BootMixin} from '@loopback/boot';
import {addExtension, ApplicationConfig, Constructor} from '@loopback/core';
import {RepositoryMixin} from '@loopback/repository';
import {RestApplication} from '@loopback/rest';
import {
  RestExplorerBindings,
  RestExplorerComponent
} from '@loopback/rest-explorer';
import {ServiceMixin} from '@loopback/service-proxy';
import {PassportDiscordAuthProvider} from '@providers/discord-auth-strategy';
import path from 'path';
import {DbDataSource} from './datasources';
import {PassportGithubAuthProvider} from './providers/github-auth-strategy';
import {MySequence} from './sequence';


export {ApplicationConfig};

export class TodoListApplication extends BootMixin(
  ServiceMixin(RepositoryMixin(RestApplication)),
) {
  constructor(options: ApplicationConfig = {}) {
    super(options);

    // ----- DEFAULT -----
    // Set up the custom sequence
    this.sequence(MySequence);

    // Set up default home page
    this.static('/', path.join(__dirname, '../public'));

    // Customize @loopback/rest-explorer configuration here
    this.configure(RestExplorerBindings.COMPONENT).to({
      path: '/explorer',
    });
    this.component(RestExplorerComponent);

    this.projectRoot = __dirname;
    // Customize @loopback/boot Booter Conventions here
    this.bootOptions = {
      controllers: {
        // Customize ControllerBooter Conventions here
        dirs: ['controllers'],
        extensions: ['.controller.js'],
        nested: true,
      },
    };


    // ----- AUTHENTICATION -----
    // Mount authentication system
    this.component(AuthenticationComponent);
    // Bind datasource
    this.dataSource(DbDataSource, UserServiceBindings.DATASOURCE_NAME);

    this.addAuthProviders([
      PassportDiscordAuthProvider,
      PassportGithubAuthProvider
    ]);
  }

  addAuthProviders(authProviders: Constructor<unknown>[]) {
    authProviders.forEach((provider) => {
      addExtension(
        this,
        AuthenticationBindings.AUTHENTICATION_STRATEGY_EXTENSION_POINT_NAME,
        provider,
        {
          namespace: AuthenticationBindings.AUTHENTICATION_STRATEGY_EXTENSION_POINT_NAME
        }
      );
    });
  }
}
