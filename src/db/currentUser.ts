import { useAppFlowStore } from '../store/useAppFlowStore';

export function currentUserId(): string | undefined {
  return useAppFlowStore.getState().user?.id;
}
