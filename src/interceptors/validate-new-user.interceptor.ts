import {
  injectable,
  Interceptor,
  InvocationContext,
  InvocationResult,
  Provider,
  ValueOrPromise
} from '@loopback/core';
import {User} from '../models';

/**
 * This class will be bound to the application as an `Interceptor` during
 * `boot`
 */
@injectable({tags: {key: ValidateNewUserInterceptor.BINDING_KEY}})
export class ValidateNewUserInterceptor implements Provider<Interceptor> {
  static readonly BINDING_KEY = `interceptors.${ValidateNewUserInterceptor.name}`;
  /*
  constructor() {}
  */

  /**
   * This method is used by LoopBack context to produce an interceptor function
   * for the binding.
   *
   * @returns An interceptor function
   */
  value() {
    return this.intercept.bind(this);
  }

  /**
   * The logic to intercept an invocation
   * @param invocationCtx - Invocation context
   * @param next - A function to invoke next interceptor or the target method
   */
  async intercept(
    invocationCtx: InvocationContext,
    next: () => ValueOrPromise<InvocationResult>,
  ) {
    // Add pre-invocation logic here
    let user: User | undefined;
    if (invocationCtx.methodName === 'create')
      user = invocationCtx.args[0];

    if (
      user &&
      !this.doesUserHaveLoginMethod(user)
    ) {
      throw new Error(
        'User must have at least one valid login method.',
      );
    }

    const result = await next();
    // Add post-invocation logic here
    return result;
  }

  // Note that we don't check if discordId is valid.
  // It looks like you need a discord bot for that, which is overkill for us.
  doesUserHaveLoginMethod(user: User) {
    return (user.email && user.password) ||
      user.discordId;
  }
}
