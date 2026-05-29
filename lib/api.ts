/**
 * Server-side fetch helpers for the freshify-users backend.
 * USERS_SERVICE_URL is injected via Cloud Run env vars.
 */
const USERS_URL = process.env.USERS_SERVICE_URL || "https://freshify-users-sbzaekoo4q-uc.a.run.app";

export async function postUsers<T>(path: string, body: unknown, token?: string): Promise<T> {
  const headers: Record<string, string> = { "content-type": "application/json" };
  if (token) headers["authorization"] = `Bearer ${token}`;
  const res = await fetch(`${USERS_URL}${path}`, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
    cache: "no-store",
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`users ${path} ${res.status}: ${text}`);
  }
  return res.json() as Promise<T>;
}

export async function getUsers<T>(path: string, token: string): Promise<T> {
  const res = await fetch(`${USERS_URL}${path}`, {
    headers: { authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`users ${path} ${res.status}: ${text}`);
  }
  return res.json() as Promise<T>;
}
