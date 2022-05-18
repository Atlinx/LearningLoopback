import {UserProfileFactory} from '@loopback/authentication';
import {User} from '@src/models';

export class PassportGithubAuthProvider<MyUser>
  implements Provider<UserProfileFactory<User>>
{

}
