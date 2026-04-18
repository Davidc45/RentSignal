const BLS_API_URL = "https://api.bls.gov/publicAPI/v2/timeseries/data/";
// National rent of primary residence CPI series
const RENT_SERIES_ID = "CUSR0000SEHA";

const TREND_FALLBACK = { trend: "stable", percentChange: 0, period: null };

/**
 * Fetches the 12-month rent CPI trend from the BLS public API.
 * Returns a normalized trend label, percent change, and period string.
 * Falls back to { trend: "stable", percentChange: 0, period: null } on failure.
 *
 * @returns {Promise<{ trend: "rising"|"falling"|"stable", percentChange: number, period: string|null }>}
 */
export async function fetchBlsRentTrend() {
  const currentYear = new Date().getFullYear();
  const startYear = String(currentYear - 1);
  const endYear = String(currentYear);

  let response;
  try {
    response = await fetch(BLS_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        seriesid: [RENT_SERIES_ID],
        startyear: startYear,
        endyear: endYear,
      }),
    });
  } catch {
    return TREND_FALLBACK;
  }

  if (!response.ok) return TREND_FALLBACK;

  let body;
  try {
    body = await response.json();
  } catch {
    return TREND_FALLBACK;
  }

  const series = body?.Results?.series?.[0];
  const data = series?.data;
  if (!Array.isArray(data) || data.length < 2) return TREND_FALLBACK;

  // BLS returns data newest-first; sort ascending by year then period
  const sorted = [...data].sort((a, b) => {
    const yearDiff = Number(a.year) - Number(b.year);
    if (yearDiff !== 0) return yearDiff;
    // period is "M01"–"M12"; lexicographic sort works
    return a.period.localeCompare(b.period);
  });

  const oldest = sorted[0];
  const newest = sorted[sorted.length - 1];

  const oldValue = parseFloat(oldest.value);
  const newValue = parseFloat(newest.value);
  if (!oldValue) return TREND_FALLBACK;

  const percentChange = parseFloat(((newValue - oldValue) / oldValue) * 100).toFixed(2);
  const pct = parseFloat(percentChange);

  let trend;
  if (pct >= 1) trend = "rising";
  else if (pct <= -1) trend = "falling";
  else trend = "stable";

  const periodLabel = `${formatBlsPeriod(oldest)} - ${formatBlsPeriod(newest)}`;

  return { trend, percentChange: pct, period: periodLabel };
}

/** Converts a BLS data point to a human-readable month label, e.g. "Apr 2025". */
function formatBlsPeriod({ year, period, periodName }) {
  if (periodName) return `${periodName} ${year}`;
  // period is "M04" → month index 4
  const monthIndex = parseInt(period.slice(1), 10) - 1;
  const monthName = new Date(2000, monthIndex, 1).toLocaleString("en-US", { month: "short" });
  return `${monthName} ${year}`;
}
