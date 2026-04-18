import { buildMarketSnapshot } from "./services/buildMarketSnapshot.js";
import { getCityBySlug } from "./helpers/cityLookup.js";

/**
 * AppSync Lambda resolver for the marketSnapshot query.
 * Event shape from AppSync direct Lambda resolver:
 *   { arguments: { citySlug, income, bedrooms } }
 */
export const handler = async (event) => {
  const { citySlug, income, bedrooms } = event.arguments ?? {};

  if (!citySlug || income == null || bedrooms == null) {
    throw new Error("Missing required arguments: citySlug, income, bedrooms");
  }

  const city = getCityBySlug(citySlug);
  if (!city) {
    throw new Error(`Unknown city: ${citySlug}`);
  }

  const snapshot = await buildMarketSnapshot({
    citySlug,
    cityName: city.name,
    income: Number(income),
    bedrooms: Number(bedrooms),
  });

  return snapshot;
};
