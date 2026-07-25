import { Model } from '@nozbe/watermelondb';

// Plain getter/setter accessors instead of WatermelonDB's @field/@date decorators —
// they're equivalent (the decorators just wrap the same _getRaw/_setRaw calls), but
// avoids a legacy-decorators + Hermes native-class-fields toolchain conflict.
export default class Expense extends Model {
  static table = 'expenses';

  get amount(): number {
    return this._getRaw('amount') as number;
  }
  set amount(value: number) {
    this._setRaw('amount', value);
  }

  get category(): string {
    return this._getRaw('category') as string;
  }
  set category(value: string) {
    this._setRaw('category', value);
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

  get source(): 'manual' | 'ocr' {
    return this._getRaw('source') as 'manual' | 'ocr';
  }
  set source(value: 'manual' | 'ocr') {
    this._setRaw('source', value);
  }

  get receiptImage(): string | undefined {
    return (this._getRaw('receipt_image') as string | null) ?? undefined;
  }
  set receiptImage(value: string | undefined) {
    this._setRaw('receipt_image', value ?? null);
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
