import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { fetchMarketSnapshot } from "./marketSnapshot.js";

const envKeys = ["NEXT_PUBLIC_APPSYNC_URL", "NEXT_PUBLIC_APPSYNC_API_KEY", "NEXT_PUBLIC_AWS_REGION"];

const MOCK_URL = "https://example.appsync-api.us-east-2.amazonaws.com/graphql";
const MOCK_API_KEY = "test-api-key";
const MOCK_REGION = "us-east-2";

function setValidMockEnv() {
  process.env.NEXT_PUBLIC_APPSYNC_URL = MOCK_URL;
  process.env.NEXT_PUBLIC_APPSYNC_API_KEY = MOCK_API_KEY;
  process.env.NEXT_PUBLIC_AWS_REGION = MOCK_REGION;
}

/** Minimal KEY=VALUE parse for .env.local — only used inside RUN_APPSYNC_LIVE tests. */
function readEnvLocalFile() {
  const path = join(process.cwd(), ".env.local");
  if (!existsSync(path)) return {};
  const out = {};
  for (const line of readFileSync(path, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = line.indexOf("=");
    if (eq === -1) continue;
    const key = line.slice(0, eq).trim();
    let val = line.slice(eq + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    out[key] = val;
  }
  return out;
}

describe("fetchMarketSnapshot (unit)", () => {
  let envSnapshot;

  beforeEach(() => {
    envSnapshot = {};
    for (const k of envKeys) {
      envSnapshot[k] = process.env[k];
      delete process.env[k];
    }
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    for (const k of envKeys) {
      if (envSnapshot[k] === undefined) delete process.env[k];
      else process.env[k] = envSnapshot[k];
    }
  });

  it("throws when all required env vars are absent (unit: no .env.local needed)", async () => {
    await expect(fetchMarketSnapshot({ citySlug: "x", income: 1, bedrooms: 1 })).rejects.toThrow(
      /Missing AppSync configuration/
    );
  });

  it("throws when NEXT_PUBLIC_APPSYNC_URL is missing (unit: partial mock env)", async () => {
    process.env.NEXT_PUBLIC_APPSYNC_API_KEY = MOCK_API_KEY;
    process.env.NEXT_PUBLIC_AWS_REGION = MOCK_REGION;
    await expect(fetchMarketSnapshot({ citySlug: "x", income: 1, bedrooms: 1 })).rejects.toThrow(
      /Missing AppSync configuration/
    );
  });

  it("throws when NEXT_PUBLIC_APPSYNC_API_KEY is missing (unit: partial mock env)", async () => {
    process.env.NEXT_PUBLIC_APPSYNC_URL = MOCK_URL;
    process.env.NEXT_PUBLIC_AWS_REGION = MOCK_REGION;
    await expect(fetchMarketSnapshot({ citySlug: "x", income: 1, bedrooms: 1 })).rejects.toThrow(
      /Missing AppSync configuration/
    );
  });

  it("throws when NEXT_PUBLIC_AWS_REGION is missing (unit: partial mock env)", async () => {
    process.env.NEXT_PUBLIC_APPSYNC_URL = MOCK_URL;
    process.env.NEXT_PUBLIC_APPSYNC_API_KEY = MOCK_API_KEY;
    await expect(fetchMarketSnapshot({ citySlug: "x", income: 1, bedrooms: 1 })).rejects.toThrow(
      /Missing AppSync configuration/
    );
  });

  it("POSTs GraphQL with variables and x-api-key header (unit: mocked fetch)", async () => {
    setValidMockEnv();

    const snapshot = {
      city: "Santa Ana",
      citySlug: "santa-ana",
      state: "CA",
      bedrooms: 1,
      medianIncome: 70000,
      medianRent: 2000,
      affordableMonthlyRent: 2000,
      affordabilityRatio: 0.3,
      affordabilityLabel: "Affordable",
      rentTrend12Month: 0.02,
      trendLabel: "Rising",
      lastUpdated: "2025-01-01",
    };

    global.fetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ data: { marketSnapshot: snapshot } }),
    });

    const result = await fetchMarketSnapshot({
      citySlug: "santa-ana",
      income: 80000,
      bedrooms: 1,
    });

    expect(result).toEqual(snapshot);
    expect(global.fetch).toHaveBeenCalledTimes(1);
    const [url, init] = global.fetch.mock.calls[0];
    expect(url).toBe(MOCK_URL);
    expect(init.method).toBe("POST");
    expect(init.headers["Content-Type"]).toBe("application/json");
    expect(init.headers["x-api-key"]).toBe(MOCK_API_KEY);

    const body = JSON.parse(init.body);
    expect(body.variables).toEqual({
      citySlug: "santa-ana",
      income: 80000,
      bedrooms: 1,
    });
    expect(body.query).toContain("marketSnapshot");
    expect(body.query).toContain("GetMarketSnapshot");
  });

  it("throws when HTTP status is not ok (unit: mocked fetch)", async () => {
    setValidMockEnv();
    global.fetch.mockResolvedValue({
      ok: false,
      status: 401,
      json: async () => ({ message: "Unauthorized" }),
    });

    await expect(fetchMarketSnapshot({ citySlug: "a", income: 1, bedrooms: 1 })).rejects.toThrow(
      /AppSync HTTP 401/
    );
  });

  it("throws when GraphQL returns errors array (unit: mocked fetch)", async () => {
    setValidMockEnv();
    global.fetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        errors: [{ message: "Validation error" }],
      }),
    });

    await expect(fetchMarketSnapshot({ citySlug: "a", income: 1, bedrooms: 1 })).rejects.toThrow(
      "Validation error"
    );
  });

  it("throws when response body is not JSON (unit: mocked fetch)", async () => {
    setValidMockEnv();
    global.fetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => {
        throw new SyntaxError("Unexpected token");
      },
    });

    await expect(fetchMarketSnapshot({ citySlug: "a", income: 1, bedrooms: 1 })).rejects.toThrow(
      /was not JSON/
    );
  });

  it("throws when data.marketSnapshot is null (unit: mocked fetch)", async () => {
    setValidMockEnv();
    global.fetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ data: { marketSnapshot: null } }),
    });

    await expect(fetchMarketSnapshot({ citySlug: "a", income: 1, bedrooms: 1 })).rejects.toThrow(
      /No marketSnapshot in response data/
    );
  });
});

describe.skipIf(process.env.RUN_APPSYNC_LIVE !== "1")("fetchMarketSnapshot (live AppSync)", () => {
  it(
    "returns a snapshot for Santa Ana (live: real network; env from shell or .env.local only here)",
    async () => {
      const fromFile = readEnvLocalFile();
      const resolved = {};
      for (const k of envKeys) {
        resolved[k] = (process.env[k] || fromFile[k] || "").trim();
      }
      const missing = envKeys.filter((k) => !resolved[k]);
      if (missing.length) {
        throw new Error(
          `[live AppSync] RUN_APPSYNC_LIVE=1 but missing: ${missing.join(", ")}. ` +
            `Export them in the shell or add them to .env.local at the project root. ` +
            `Unit tests do not load .env.local; this check runs only for the live test.`
        );
      }

      const restore = {};
      for (const k of envKeys) {
        restore[k] = process.env[k];
        process.env[k] = resolved[k];
      }

      try {
        const data = await fetchMarketSnapshot({
          citySlug: "santa-ana",
          income: 80000,
          bedrooms: 1,
        });

        expect(data).toMatchObject({
          citySlug: "santa-ana",
          bedrooms: 1,
        });
        expect(data.city).toBeTruthy();
        expect(data.affordableMonthlyRent).not.toBeNull();
      } finally {
        for (const k of envKeys) {
          if (restore[k] === undefined) delete process.env[k];
          else process.env[k] = restore[k];
        }
      }
    },
    20_000
  );
});
