"use client";

export function getClientSessionId() {
  const key = "rf_session_id";
  let sessionId = window.localStorage.getItem(key);

  if (!sessionId) {
    sessionId = crypto.randomUUID();
    window.localStorage.setItem(key, sessionId);
  }

  return sessionId;
}

export async function trackClientEvent(endpoint: string, payload: Record<string, unknown> = {}) {
  try {
    await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionId: getClientSessionId(),
        userAgent: navigator.userAgent,
        ...payload,
      }),
      keepalive: true,
    });
  } catch {
    // Analytics must never interrupt shopping.
  }
}
