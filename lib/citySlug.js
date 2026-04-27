/**
 * Maps a display name from the city picker (e.g. "Santa Ana") to the Lambda/AppSync citySlug.
 * Must match `slug` in `data/cities.js` (kebab-case, no `-ca` suffix).
 */
export function displayCityToCitySlug(displayName) {
  return displayName.trim().toLowerCase().replace(/\s+/g, "-");
}
