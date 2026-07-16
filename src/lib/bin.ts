export const BIN_RETENTION_DAYS = 60;
const DAY_MS = 1000 * 60 * 60 * 24;

export function daysLeftInBin(deletedAt: number): number {
  const elapsed = Date.now() - deletedAt;
  return Math.max(0, BIN_RETENTION_DAYS - Math.floor(elapsed / DAY_MS));
}

export function isExpiredInBin(deletedAt: number): boolean {
  return Date.now() - deletedAt >= BIN_RETENTION_DAYS * DAY_MS;
}
