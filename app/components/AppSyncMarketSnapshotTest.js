"use client";

import { useCallback, useEffect, useState } from "react";
import { fetchMarketSnapshot } from "../../lib/api/marketSnapshot";

const SAMPLE = {
  citySlug: "santa-ana-ca",
  income: 80000,
  bedrooms: 1,
};

/**
 * Temporary dev UI: exercise AppSync marketSnapshot from the browser.
 */
export default function AppSyncMarketSnapshotTest() {
  const [status, setStatus] = useState("loading");
  const [payload, setPayload] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  const run = useCallback(async () => {
    setStatus("loading");
    setPayload(null);
    setErrorMessage("");
    try {
      const data = await fetchMarketSnapshot(SAMPLE);
      setPayload(data);
      setStatus("success");
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : String(err));
      setStatus("error");
    }
  }, []);

  useEffect(() => {
    run();
  }, [run]);

  return (
    <section
      className="mx-auto my-10 max-w-3xl rounded-lg border border-dashed border-amber-600/60 bg-amber-50/80 px-4 py-5 text-left text-neutral-900 shadow-sm dark:border-amber-500/50 dark:bg-amber-950/40 dark:text-amber-50"
      aria-label="AppSync market snapshot test"
    >
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-amber-900 dark:text-amber-100">
          AppSync test (temporary)
        </h2>
        <button
          type="button"
          onClick={() => run()}
          disabled={status === "loading"}
          className="rounded border border-amber-800/40 bg-white px-3 py-1 text-xs font-medium text-amber-950 hover:bg-amber-100 disabled:opacity-50 dark:border-amber-200/30 dark:bg-amber-900/50 dark:text-amber-50 dark:hover:bg-amber-800/60"
        >
          Retry
        </button>
      </div>
      <p className="mb-3 text-xs text-neutral-700 dark:text-amber-100/80">
        Sample: <code className="rounded bg-white/80 px-1 py-0.5 dark:bg-black/30">{JSON.stringify(SAMPLE)}</code>
      </p>

      {status === "loading" && <p className="text-sm text-neutral-600 dark:text-amber-100/90">Loading…</p>}

      {status === "error" && (
        <div className="rounded border border-red-300 bg-red-50 p-3 text-sm text-red-900 dark:border-red-800 dark:bg-red-950/50 dark:text-red-100">
          <strong className="block">Error</strong>
          {errorMessage}
        </div>
      )}

      {status === "success" && payload && (
        <pre className="max-h-96 overflow-auto rounded border border-amber-900/20 bg-white/90 p-3 text-xs leading-relaxed text-neutral-800 dark:border-amber-200/20 dark:bg-black/40 dark:text-amber-50">
          {JSON.stringify(payload, null, 2)}
        </pre>
      )}
    </section>
  );
}
