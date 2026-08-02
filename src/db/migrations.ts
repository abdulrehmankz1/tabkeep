import { addColumns, schemaMigrations } from '@nozbe/watermelondb/Schema/migrations';

export default schemaMigrations({
  migrations: [
    {
      toVersion: 2,
      steps: [
        addColumns({
          table: 'expenses',
          columns: [{ name: 'user_id', type: 'string', isIndexed: true, isOptional: true }],
        }),
        addColumns({
          table: 'people',
          columns: [{ name: 'user_id', type: 'string', isIndexed: true, isOptional: true }],
        }),
        addColumns({
          table: 'transactions',
          columns: [{ name: 'user_id', type: 'string', isIndexed: true, isOptional: true }],
        }),
      ],
    },
  ],
});
