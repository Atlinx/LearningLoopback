import {inject} from '@loopback/core';
import {HttpErrors} from '@loopback/rest';
import {DbDataSource} from '../datasources';
import {User, UserRelations} from '../models';
import {ExtendedCrudRepository, LifecycleHook} from './extended-crud-repository';

export class UserRepository extends ExtendedCrudRepository<
  User,
  typeof User.prototype.id,
  UserRelations
> {
  constructor(
    @inject('datasources.db') dataSource: DbDataSource,
  ) {
    super(User, dataSource);
  }

  // Lifecycle Hooks
  customLifecycleHooks(): LifecycleHook[] {
    return [
      {
        operation: "before save",
        listener: function (ctx, next) {
          const instance = <User>ctx.instance;
          if ((instance.email && instance.password) ||
            instance.discordId ||
            instance.githubId) {
            next();
          } else {
            next(new HttpErrors.UnprocessableEntity(
              "User must have at least one valid login!"
            ));
          }
        }
      }
    ];
  }
}
