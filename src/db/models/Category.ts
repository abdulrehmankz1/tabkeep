import { Model } from '@nozbe/watermelondb';
import { field, date, children } from '@nozbe/watermelondb/decorators';

export default class Category extends Model {
  static table = 'categories';
  static associations = {
    expenses: { type: 'has_many' as const, foreignKey: 'category_id' },
  };

  @field('user_id') userId!: string;
  @field('name') name!: string;
  @field('icon') icon!: string;
  @field('color') color!: string;
  @field('type') type!: 'daily' | 'monthly';
  @date('updated_at') updatedAt!: Date;
  @field('deleted_at') deletedAt?: number;

  @children('expenses') expenses!: unknown;
}
