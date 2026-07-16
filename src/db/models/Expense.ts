import { Model } from '@nozbe/watermelondb';
import { field, date, relation } from '@nozbe/watermelondb/decorators';
import type Category from './Category';

export default class Expense extends Model {
  static table = 'expenses';
  static associations = {
    categories: { type: 'belongs_to' as const, key: 'category_id' },
  };

  @field('user_id') userId!: string;
  @field('amount') amount!: number; // integer paisas
  @field('category_id') categoryId!: string;
  @field('note') note?: string;
  @field('date') date!: string;
  @field('source') source!: 'manual' | 'ocr';
  @field('receipt_image') receiptImage?: string;
  @field('receipt_remote') receiptRemote?: string;
  @field('merchant') merchant?: string;
  @date('created_at') createdAt!: Date;
  @date('updated_at') updatedAt!: Date;
  @field('deleted_at') deletedAt?: number;

  @relation('categories', 'category_id') category!: Category;
}
