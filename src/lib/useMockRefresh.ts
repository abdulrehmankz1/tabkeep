import { useCallback, useState } from 'react';

// Simulates a pull-to-refresh cycle until real WatermelonDB/Supabase sync is wired up.
export function useMockRefresh(delayMs = 600) {
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), delayMs);
  }, [delayMs]);

  return { refreshing, onRefresh };
}
