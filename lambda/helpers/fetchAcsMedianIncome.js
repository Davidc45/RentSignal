import { getCityBySlug } from "./cityLookup.js";

const ACS_BASE = "https://api.census.gov/data";
// Latest available 5-year ACS vintage
const ACS_YEAR = "2022";

// Variable indices within B25031 by bedroom count
const BEDROOM_VAR = {
  0: "B25031_002E", // no bedroom (studio)
  1: "B25031_003E",
  2: "B25031_004E",
  3: "B25031_005E",
  4: "B25031_006E",
};

/**
 * Fetches the ACS 5-year median gross rent for a given city slug and bedroom count.
 * Uses county-level FIPS from the cities dataset to scope the Census query.
 *
 * @param {{ citySlug: string, bedrooms: number }} params
 * @returns {Promise<number>} Median monthly rent in USD
 */
export async function fetchAcsMedianIncome({ citySlug, bedrooms }) {
  const city = getCityBySlug(citySlug);
  if (!city) throw new Error(`Unknown city slug: ${citySlug}`);

  const variable = BEDROOM_VAR[bedrooms] ?? BEDROOM_VAR[1];
  const countyFips = city.hudFips;
  // FIPS: first 2 chars = state, last 3 = county
  const stateFips = countyFips.slice(0, 2);
  const countyCode = countyFips.slice(2);

  const url =
    `${ACS_BASE}/${ACS_YEAR}/acs/acs5` +
    `?get=${variable}` +
    `&for=county:${countyCode}` +
    `&in=state:${stateFips}`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`ACS API error ${response.status} for ${citySlug}`);
  }

  const json = await response.json();
  // json[0] is headers, json[1] is first data row
  const value = parseInt(json?.[1]?.[0], 10);
  if (!value || value < 0) {
    throw new Error(`No ACS rent data for ${citySlug} (bedrooms=${bedrooms})`);
  }

  return value;
}
