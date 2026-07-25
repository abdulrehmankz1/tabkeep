import { Database } from '@nozbe/watermelondb';
import SQLiteAdapter from '@nozbe/watermelondb/adapters/sqlite';

import schema from './schema';
import { Expense, Person, Transaction } from './models';

const adapter = new SQLiteAdapter({
  schema,
  jsi: true,
});

export const database = new Database({
  adapter,
  modelClasses: [Expense, Person, Transaction],
});
