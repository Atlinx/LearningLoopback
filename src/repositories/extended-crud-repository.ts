import {DataObject, DefaultCrudRepository, ensurePromise, Entity, Filter, Options} from '@loopback/repository';
import legacy, {Listener, OperationHookContext, PersistedModel} from 'loopback-datasource-juggler';
import {User} from '../models';

export type LifecycleHook = {
  operation: string;
  listener: Listener<OperationHookContext<typeof PersistedModel>>;
}

/**
 * Extends DefaultCrudRepository to add missing features.
 * As lb4 is updated, this class will be phased out.
 */
export abstract class ExtendedCrudRepository<T extends Entity, ID, Relations extends object = {}> extends DefaultCrudRepository<T, ID, Relations> {
  // ----- START CRUD OPERATIONS -----
  /**
   * Finds an entity using the filter and returns it.
   * If the entity doesn't exist, it creates it and
   * returns the newly created entity
   *
   * @param filter Entity to search for
   * @param newEntity New entity to create if search failed
   * @param options Additional options
   * @returns A tuple promise. Tuple = [entity, was the entity created].
   */
  async findOrCreate(
    filter: Filter<T>,
    newEntity: DataObject<T>,
    options?: Options,
  ): Promise<[(T & Relations), boolean]> {
    const newData = await this.entityToData(newEntity, options);
    const result = await ensurePromise(
      this.modelClass.findOrCreate(this.normalizeDefinedFilter(filter), newData, options),
    );
    const model = result[0];
    const createdNewModel = result[1];
    const entity = this.toEntity(model);
    const include = filter?.include;
    const resolved = await this.includeRelatedModels(
      [entity],
      include,
      options,
    );
    return [resolved[0], createdNewModel];
  }

  // Normalizes a defined filter.
  protected normalizeDefinedFilter(filter: Filter<T>): legacy.Filter {
    // We know that noramlizeFilter MUST return a filter;
    return <legacy.Filter>this.normalizeFilter(filter);
  }
  // ----- END CRUD OPERATIONS -----

  // ----- START LIFECYCLE HOOKS -----

  /**
   * Virtual method for adding custom lifecycle hooks to CRUD operations.
   * @returns Custom lifecycle hooks
   */
  customLifecycleHooks(): LifecycleHook[] {
    return [];
  }

  // This is temporary, as lb4 devleopment is ongoing
  // See: https://loopback.io/doc/en/lb4/migration-models-operation-hooks.html
  definePersistedModel(entityClass: typeof User) {
    const modelClass = super.definePersistedModel(entityClass);

    this.customLifecycleHooks().forEach((hook) => {
      modelClass.observe(hook.operation, hook.listener);
    });

    return modelClass;
  }

  // ----- END LIFECYCLE HOOKS -----
}
