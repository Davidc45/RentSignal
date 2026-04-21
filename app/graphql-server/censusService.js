//Handles ACS fetch and filtering for GraphQL server
const ACS_BASE_URL = "https://api.census.gov/data/2024/acs/acs5";
const MEDIAN_GROSS_RENT_VAR = "B25064_001E";
const API_KEY = "[Insert Key here]";

const ORANGE_COUNTY_CITIES = new Set([
  "Aliso Viejo city, California",
  "Anaheim city, California",
  "Brea city, California",
  "Buena Park city, California",
  "Costa Mesa city, California",
  "Cypress city, California",
  "Dana Point city, California",
  "Fountain Valley city, California",
  "Fullerton city, California",
  "Garden Grove city, California",
  "Huntington Beach city, California",
  "Irvine city, California",
  "La Habra city, California",
  "La Palma city, California",
  "Laguna Beach city, California",
  "Laguna Hills city, California",
  "Laguna Niguel city, California",
  "Laguna Woods city, California",
  "Lake Forest city, California",
  "Los Alamitos city, California",
  "Mission Viejo city, California",
  "Newport Beach city, California",
  "Orange city, California",
  "Placentia city, California",
  "Rancho Santa Margarita city, California",
  "San Clemente city, California",
  "San Juan Capistrano city, California",
  "Santa Ana city, California",
  "Seal Beach city, California",
  "Stanton city, California",
  "Tustin city, California",
  "Villa Park city, California",
  "Westminster city, California",
  "Yorba Linda city, California",
]);

export async function fetchOrangeCountyCitiesFromACS() {
  const url =
    `${ACS_BASE_URL}?get=NAME,${MEDIAN_GROSS_RENT_VAR}` +
    `&for=place:*&in=state:06&key=${API_KEY}`;

  console.log("Census URL:", url);

  const res = await fetch(url);
  const text = await res.text();

  console.log("Census status:", res.status);
  console.log("Census raw body:", text);

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
      trend: "Unknown",
      stateFips: row[2],
      placeFips: row[3],
      geoId: `${row[2]}-${row[3]}`,
      geographyType: "place",
    }))
    .filter((city) => ORANGE_COUNTY_CITIES.has(city.fullName))
    .sort((a, b) => a.name.localeCompare(b.name));
}