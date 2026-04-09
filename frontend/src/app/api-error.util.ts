/** Shown when auth is required; never mentions tokens. */
export const SIGN_IN_REQUIRED_MESSAGE = 'You need to sign in for that.';

/** Maps auth-related API messages to a friendly string; never surfaces the word "token" to users. */
export function formatApiError(err: unknown, fallback: string): string {
  const http = err as { status?: number; error?: { error?: string } | string };
  let msg: string | undefined;
  if (typeof http.error === 'object' && http.error !== null && 'error' in http.error) {
    msg = (http.error as { error: string }).error;
  } else if (typeof http.error === 'string') {
    msg = http.error;
  }
  if (http.status === 401 || (msg && /token/i.test(msg))) {
    return SIGN_IN_REQUIRED_MESSAGE;
  }
  return msg ?? fallback;
}
