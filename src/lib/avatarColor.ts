const AVATAR_COLORS = ['#8B5CF6', '#EC4899', '#14B8A6', '#F97316', '#3B82F6', '#EF4444'];

export function avatarColorFromName(name: string): string {
  let hash = 0;
  for (const char of name) hash += char.charCodeAt(0);
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
}

export function initialsFromName(name: string): string {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}
