import { synchronize } from '@nozbe/watermelondb/sync';
import { supabase } from '../lib/supabase';
import { database } from './index';

export async function syncDatabase(): Promise<void> {
  await synchronize({
    database,
    migrationsEnabledAtVersion: 1,
    pullChanges: async ({ lastPulledAt }) => {
      const { data, error } = await supabase.rpc('pull_changes', { last_pulled_at: lastPulledAt ?? null });
      if (error) throw new Error(error.message);
      return { changes: data.changes, timestamp: data.timestamp };
    },
    pushChanges: async ({ changes }) => {
      const { error } = await supabase.rpc('push_changes', { changes });
      if (error) throw new Error(error.message);
    },
  });
}

let syncInFlight: Promise<void> | null = null;
let syncQueued = false;

// WatermelonDB's synchronize() isn't safe to call while another sync is still
// running, so every trigger point (sign-in, app foreground, after a local
// write) goes through this instead of calling syncDatabase() directly. Errors
// are swallowed — sync is best-effort and offline usage must keep working.
// Returns the in-flight promise so callers that care (e.g. to re-hydrate
// stores once fresh data has landed) can await it; fire-and-forget callers
// can just ignore the return value.
export function scheduleSync(): Promise<void> {
  if (syncInFlight) {
    syncQueued = true;
    return syncInFlight;
  }
  syncInFlight = syncDatabase()
    .catch(() => {})
    .finally(() => {
      syncInFlight = null;
      if (syncQueued) {
        syncQueued = false;
        scheduleSync();
      }
    });
  return syncInFlight;
}
