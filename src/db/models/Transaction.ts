import { Model } from '@nozbe/watermelondb';

export default class Transaction extends Model {
  static table = 'transactions';
  static associations = {
    people: { type: 'belongs_to' as const, key: 'person_id' },
  };

  get userId(): string | undefined {
    return (this._getRaw('user_id') as string | null) ?? undefined;
  }
  set userId(value: string | undefined) {
    this._setRaw('user_id', value ?? null);
  }

  get personId(): string {
    return this._getRaw('person_id') as string;
  }
  set personId(value: string) {
    this._setRaw('person_id', value);
  }

  get amount(): number {
    return this._getRaw('amount') as number;
  }
  set amount(value: number) {
    this._setRaw('amount', value);
  }

  get direction(): 'gave' | 'received' {
    return this._getRaw('direction') as 'gave' | 'received';
  }
  set direction(value: 'gave' | 'received') {
    this._setRaw('direction', value);
  }

  get note(): string | undefined {
    return (this._getRaw('note') as string | null) ?? undefined;
  }
  set note(value: string | undefined) {
    this._setRaw('note', value ?? null);
  }

  get occurredAt(): Date {
    return new Date(this._getRaw('occurred_at') as number);
  }
  set occurredAt(date: Date) {
    this._setRaw('occurred_at', +new Date(date));
  }

  get createdAt(): Date {
    return new Date(this._getRaw('created_at') as number);
  }
  set createdAt(date: Date) {
    this._setRaw('created_at', +new Date(date));
  }
}
