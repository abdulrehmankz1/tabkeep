import { appSchema, tableSchema } from '@nozbe/watermelondb';

export default appSchema({
  version: 1,
  tables: [
    tableSchema({
      name: 'expenses',
      columns: [
        { name: 'amount', type: 'number' }, // integer paisas
        { name: 'category', type: 'string' }, // matches CATEGORY_META keys
        { name: 'note', type: 'string', isOptional: true },
        { name: 'occurred_at', type: 'number' },
        { name: 'source', type: 'string' }, // 'manual' | 'ocr'
        { name: 'receipt_image', type: 'string', isOptional: true },
        { name: 'created_at', type: 'number' },
        { name: 'deleted_at', type: 'number', isOptional: true },
      ],
    }),
    tableSchema({
      name: 'people',
      columns: [
        { name: 'name', type: 'string' },
        { name: 'phone', type: 'string', isOptional: true },
        { name: 'created_at', type: 'number' },
        { name: 'deleted_at', type: 'number', isOptional: true },
      ],
    }),
    tableSchema({
      name: 'transactions',
      columns: [
        { name: 'person_id', type: 'string', isIndexed: true },
        { name: 'amount', type: 'number' }, // integer paisas
        { name: 'direction', type: 'string' }, // 'gave' | 'received'
        { name: 'note', type: 'string', isOptional: true },
        { name: 'occurred_at', type: 'number' },
        { name: 'created_at', type: 'number' },
      ],
    }),
  ],
});
