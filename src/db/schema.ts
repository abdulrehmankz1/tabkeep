import { appSchema, tableSchema } from '@nozbe/watermelondb';

export default appSchema({
  version: 1,
  tables: [
    tableSchema({
      name: 'categories',
      columns: [
        { name: 'user_id', type: 'string', isIndexed: true },
        { name: 'name', type: 'string' },
        { name: 'icon', type: 'string' },
        { name: 'color', type: 'string' },
        { name: 'type', type: 'string' }, // 'daily' | 'monthly'
        { name: 'updated_at', type: 'number' },
        { name: 'deleted_at', type: 'number', isOptional: true },
      ],
    }),
    tableSchema({
      name: 'expenses',
      columns: [
        { name: 'user_id', type: 'string', isIndexed: true },
        { name: 'amount', type: 'number' }, // integer paisas
        { name: 'category_id', type: 'string', isIndexed: true },
        { name: 'note', type: 'string', isOptional: true },
        { name: 'date', type: 'string' },
        { name: 'source', type: 'string' }, // 'manual' | 'ocr'
        { name: 'receipt_image', type: 'string', isOptional: true },
        { name: 'receipt_remote', type: 'string', isOptional: true },
        { name: 'merchant', type: 'string', isOptional: true },
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
        { name: 'deleted_at', type: 'number', isOptional: true },
      ],
    }),
    tableSchema({
      name: 'people',
      columns: [
        { name: 'user_id', type: 'string', isIndexed: true },
        { name: 'name', type: 'string' },
        { name: 'phone', type: 'string', isOptional: true },
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
        { name: 'deleted_at', type: 'number', isOptional: true },
      ],
    }),
    tableSchema({
      name: 'transactions',
      columns: [
        { name: 'user_id', type: 'string', isIndexed: true },
        { name: 'person_id', type: 'string', isIndexed: true },
        { name: 'amount', type: 'number' }, // integer paisas
        { name: 'direction', type: 'string' }, // 'gave' | 'received'
        { name: 'note', type: 'string', isOptional: true },
        { name: 'transaction_date', type: 'number' },
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
        { name: 'deleted_at', type: 'number', isOptional: true },
      ],
    }),
  ],
});
