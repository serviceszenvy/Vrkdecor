/**
 * Bounds an asynchronous read so a slow or unreachable database cannot hang a
 * page render indefinitely.
 *
 * Public pages must degrade to fallback content rather than hold a request
 * open: an unresponsive dependency should cost a visitor a section, not the
 * whole page. Rejects with a generic error carrying no connection detail.
 */
export const DEFAULT_READ_TIMEOUT_MS = 5_000;

export async function withTimeout<T>(
  operation: () => Promise<T>,
  timeoutMs: number = DEFAULT_READ_TIMEOUT_MS,
  label = 'database read',
): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;

  const timeout = new Promise<never>((_resolve, reject) => {
    timer = setTimeout(() => reject(new Error(`Timed out: ${label}`)), timeoutMs);
  });

  try {
    return await Promise.race([operation(), timeout]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}
