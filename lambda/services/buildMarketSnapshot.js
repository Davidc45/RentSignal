import { getCachedCityData, setCachedCityData } from "../helpers/dynamoCache.js";
import { fetchAcsMedianIncome } from "../helpers/fetchAcsMedianIncome.js";
import { fetchBlsRentTrend } from "../helpers/fetchBlsRentTrend.js";

/**
 * Returns the affordability tier label for a given ratio.
 * @param {number} ratio - medianRent / affordableRent
 * @returns {"affordable"|"moderate"|"expensive"|"severe"}
 */
function getAffordabilityTier(ratio) {
  if (ratio <= 1.0) return "affordable";
  if (ratio <= 1.3) return "moderate";
  if (ratio <= 1.6) return "expensive";
  return "severe";
}

/**
 * Aggregates ACS median rent + BLS rent trend into a normalized MarketSnapshot.
 * Checks DynamoDB cache first; stores result on cache miss.
 * ACS failure throws; BLS failure uses stable fallback and continues.
 *
 * @param {{ citySlug: string, cityName: string, income: number, bedrooms: number }} params
 * @returns {Promise<object>} MarketSnapshot
 */
export async function buildMarketSnapshot({ citySlug, cityName, income, bedrooms }) {
  // 1. Cache check
  const cached = await getCachedCityData(citySlug, bedrooms);
  if (cached) {
    const affordableRent = parseFloat(((income / 12) * 0.3).toFixed(2));
    const affordabilityRatio = parseFloat((cached.medianRent / affordableRent).toFixed(4));
    return {
      ...cached,
      income,
      affordableRent,
      affordabilityRatio,
      isAffordable: affordabilityRatio <= 1.0,
      affordabilityTier: getAffordabilityTier(affordabilityRatio),
      cachedAt: cached.cachedAt ?? new Date().toISOString(),
    };
  }

  // 2. Parallel fetch: ACS rent + BLS trend
  const [medianRent, blsTrend] = await Promise.all([
    fetchAcsMedianIncome({ citySlug, bedrooms }),
    fetchBlsRentTrend().catch(() => ({ trend: "stable", percentChange: 0, period: null })),
  ]);

  // 3. Calculations
  const affordableRent = parseFloat(((income / 12) * 0.3).toFixed(2));
  const affordabilityRatio = parseFloat((medianRent / affordableRent).toFixed(4));
  const isAffordable = affordabilityRatio <= 1.0;
  const affordabilityTier = getAffordabilityTier(affordabilityRatio);

  // 4. Build snapshot
  const snapshot = {
    citySlug,
    cityName,
    income,
    bedrooms,
    medianRent,
    affordableRent,
    affordabilityRatio,
    affordabilityTier,
    isAffordable,
    rentTrend: blsTrend.trend,
    trendPercentChange: blsTrend.percentChange,
    trendPeriod: blsTrend.period,
    dataSource: "ACS+BLS",
    cachedAt: null,
  };

  // 5. Cache and return
  await setCachedCityData(citySlug, bedrooms, snapshot);
  return snapshot;
}
