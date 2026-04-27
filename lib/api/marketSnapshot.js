import { GET_MARKET_SNAPSHOT } from "../graphql/queries.js";

function getAppSyncConfig() {
  const url = process.env.NEXT_PUBLIC_APPSYNC_URL;
  const apiKey = process.env.NEXT_PUBLIC_APPSYNC_API_KEY;
  const region = process.env.NEXT_PUBLIC_AWS_REGION;

  if (!url?.trim() || !apiKey?.trim() || !region?.trim()) {
    throw new Error(
      "Missing AppSync configuration. Set NEXT_PUBLIC_APPSYNC_URL, NEXT_PUBLIC_APPSYNC_API_KEY, and NEXT_PUBLIC_AWS_REGION in .env.local."
    );
  }

  return { url: url.trim(), apiKey: apiKey.trim(), region: region.trim() };
}

/**
 * Fetches a single market snapshot from AppSync (GraphQL, API key auth).
 * Runs in the browser when called from client components (uses NEXT_PUBLIC_* env).
 *
 * @param {{ citySlug: string, income: number, bedrooms: number }} params
 * @returns {Promise<object>} marketSnapshot object from GraphQL data
 */
export async function fetchMarketSnapshot({ citySlug, income, bedrooms }) {
  const { url, apiKey } = getAppSyncConfig();

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
    },
    body: JSON.stringify({
      query: GET_MARKET_SNAPSHOT,
      variables: { citySlug, income, bedrooms },
    }),
  });

  let body;
  try {
    body = await response.json();
  } catch {
    throw new Error(`AppSync response was not JSON (HTTP ${response.status})`);
  }

  if (!response.ok) {
    throw new Error(
      `AppSync HTTP ${response.status}: ${typeof body === "object" ? JSON.stringify(body) : String(body)}`
    );
  }

  if (body.errors?.length) {
    const msg = body.errors.map((e) => e.message).join("; ");
    throw new Error(msg || "GraphQL errors returned from AppSync");
  }

  const snapshot = body.data?.marketSnapshot;
  if (snapshot == null) {
    throw new Error("No marketSnapshot in response data");
  }

  return snapshot;
}
