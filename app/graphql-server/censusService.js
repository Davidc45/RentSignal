import {
  ACS_BASE_URL,
  MEDIAN_GROSS_RENT_VAR,
  CENSUS_API_KEY,
} from "./serverConfig.js";
import { ORANGE_COUNTY_ACS_CITY_NAMES } from "./orangeCountyCities.js";

export async function fetchOrangeCountyCitiesFromACS() {
  if (!CENSUS_API_KEY) {
    throw new Error("Missing CENSUS_API_KEY");
  }

  const url =
    `${ACS_BASE_URL}?get=NAME,${MEDIAN_GROSS_RENT_VAR}` +
    `&for=place:*&in=state:06&key=${CENSUS_API_KEY}`;

  const res = await fetch(url);
  const text = await res.text();

  if (!res.ok) {
    throw new Error(`Census API request failed: ${res.status} | ${text}`);
  }

  const data = JSON.parse(text);
  const [, ...rows] = data;

  return rows
    .map((row) => ({
      id: `${row[2]}-${row[3]}`,
      name: row[0].replace(" city, California", ""),
      fullName: row[0],
      medianRent: row[1] === "-666666666" ? null : Number(row[1]),
      geoId: `${row[2]}-${row[3]}`,
    }))
    .filter((city) => ORANGE_COUNTY_ACS_CITY_NAMES.has(city.fullName))
    .map(({ fullName, ...city }) => city)
    .sort((a, b) => a.name.localeCompare(b.name));
}