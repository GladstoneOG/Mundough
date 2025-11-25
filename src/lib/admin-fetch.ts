export async function adminFetch<T>(
  input: RequestInfo | URL,
  {
    pinHash,
    ...init
  }: RequestInit & {
    pinHash: string;
  }
): Promise<T> {
  const headers = new Headers(init.headers);
  headers.set("Content-Type", "application/json");
  headers.set("x-admin-pin-hash", pinHash);

  const response = await fetch(input, {
    ...init,
    headers,
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new Error(errorBody.message ?? "Unexpected API error");
  }

  return response.json();
}
