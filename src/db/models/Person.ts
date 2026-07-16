import { Model } from '@nozbe/watermelondb';
import { field, date, children } from '@nozbe/watermelondb/decorators';

export default class Person extends Model {
  static table = 'people';
  static associations = {
    transactions: { type: 'has_many' as const, foreignKey: 'person_id' },
  };

  @field('user_id') userId!: string;
  @field('name') name!: string;
  @field('phone') phone?: string;
  @date('created_at') createdAt!: Date;
  @date('updated_at') updatedAt!: Date;
  @field('deleted_at') deletedAt?: number;

  @children('transactions') transactions!: unknown;
}
