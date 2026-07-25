import { Model } from '@nozbe/watermelondb';

export default class Person extends Model {
  static table = 'people';
  static associations = {
    transactions: { type: 'has_many' as const, foreignKey: 'person_id' },
  };

  get name(): string {
    return this._getRaw('name') as string;
  }
  set name(value: string) {
    this._setRaw('name', value);
  }

  get phone(): string | undefined {
    return (this._getRaw('phone') as string | null) ?? undefined;
  }
  set phone(value: string | undefined) {
    this._setRaw('phone', value ?? null);
  }

  get createdAt(): Date {
    return new Date(this._getRaw('created_at') as number);
  }
  set createdAt(date: Date) {
    this._setRaw('created_at', +new Date(date));
  }

  get deletedAt(): number | undefined {
    return (this._getRaw('deleted_at') as number | null) ?? undefined;
  }
  set deletedAt(value: number | undefined) {
    this._setRaw('deleted_at', value ?? null);
  }
}
