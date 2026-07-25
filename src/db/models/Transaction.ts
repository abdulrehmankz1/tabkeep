import { Model } from '@nozbe/watermelondb';
import { field, date, relation } from '@nozbe/watermelondb/decorators';
import type Person from './Person';

export default class Transaction extends Model {
  static table = 'transactions';
  static associations = {
    people: { type: 'belongs_to' as const, key: 'person_id' },
  };

  @field('user_id') userId!: string;
  @field('person_id') personId!: string;
  @field('amount') amount!: number; // integer paisas
  @field('direction') direction!: 'gave' | 'received';
  @field('note') note?: string;
  @date('transaction_date') transactionDate!: Date;
  @date('created_at') createdAt!: Date;
  @date('updated_at') updatedAt!: Date;
  @field('deleted_at') deletedAt?: number;

  @relation('people', 'person_id') person!: Person;
}
