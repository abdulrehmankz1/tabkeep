export interface AuthUrlTokens {
  accessToken: string;
  refreshToken: string;
  type: string | null;
}

// Supabase redirects auth links (password recovery, OAuth sign-in) with the
// tokens in a URL hash fragment (or query string, depending on client), e.g.
// tabkeep://reset-password#access_token=...&refresh_token=...&type=recovery
export function parseAuthTokensFromUrl(url: string): AuthUrlTokens | null {
  const hashIndex = url.indexOf('#');
  const queryIndex = url.indexOf('?');
  const fragment = hashIndex >= 0 ? url.slice(hashIndex + 1) : queryIndex >= 0 ? url.slice(queryIndex + 1) : '';
  if (!fragment) return null;

  const params = new URLSearchParams(fragment);
  const accessToken = params.get('access_token');
  const refreshToken = params.get('refresh_token');
  if (!accessToken || !refreshToken) return null;

  return { accessToken, refreshToken, type: params.get('type') };
}
