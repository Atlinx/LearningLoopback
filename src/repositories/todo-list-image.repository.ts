import {Getter, inject} from '@loopback/core';
import {BelongsToAccessor, repository} from '@loopback/repository';
import {DbDataSource} from '../datasources';
import {TodoList, TodoListImage, TodoListImageRelations} from '../models';
import {ExtendedCrudRepository} from './extended-crud-repository';
import {TodoListRepository} from './todo-list.repository';

export class TodoListImageRepository extends ExtendedCrudRepository<
  TodoListImage,
  typeof TodoListImage.prototype.id,
  TodoListImageRelations
> {

  public readonly todoList: BelongsToAccessor<TodoList, typeof TodoListImage.prototype.id>;

  constructor(
    @inject('datasources.db') dataSource: DbDataSource, @repository.getter('TodoListRepository') protected todoListRepositoryGetter: Getter<TodoListRepository>,
  ) {
    super(TodoListImage, dataSource);
    this.todoList = this.createBelongsToAccessorFor('todoList', todoListRepositoryGetter,);
    this.registerInclusionResolver('todoList', this.todoList.inclusionResolver);
  }
}
