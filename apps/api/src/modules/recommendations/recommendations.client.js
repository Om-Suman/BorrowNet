import config from "../../config/index.js";
import { ServiceUnavailableException } from "../../core/errors.js";

const timeoutMs = 20000;

async function callService(path, { method = "GET", query, body } = {}) {
  if (!config.recommender.apiKey) {
    throw new ServiceUnavailableException("Recommendation service is not configured.");
  }
  try {
    const url = new URL(`${config.recommender.url}${path}`);
    for (const [key, value] of Object.entries(query || {})) {
      if (value !== undefined && value !== null) url.searchParams.set(key, String(value));
    }
    const response = await fetch(url, {
      method,
      headers: {
        "X-API-Key": config.recommender.apiKey,
        ...(body && { "Content-Type": "application/json" }),
      },
      ...(body && { body: JSON.stringify(body) }),
      signal: AbortSignal.timeout(timeoutMs),
    });
    if (!response.ok) throw new Error(`Recommender returned HTTP ${response.status}.`);
    return await response.json();
  } catch {
    throw new ServiceUnavailableException("Recommendation service is temporarily unavailable.");
  }
}

export function searchRecommendations(query) {
  return callService("/recommendations", { query });
}

export function relatedRecommendations(query) {
  return callService("/recommendations", { query });
}

export function refreshItemEmbedding(itemId, text) {
  return callService("/embed", { method: "POST", body: { itemId, text } });
}
