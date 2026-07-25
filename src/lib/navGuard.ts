import { router } from 'expo-router';

const LOCK_MS = 600;
let locked = false;

function withLock(fn: () => void) {
  if (locked) return;
  locked = true;
  fn();
  setTimeout(() => {
    locked = false;
  }, LOCK_MS);
}

export function safePush(href: Parameters<typeof router.push>[0]) {
  withLock(() => router.push(href));
}

export function safeReplace(href: Parameters<typeof router.replace>[0]) {
  withLock(() => router.replace(href));
}
