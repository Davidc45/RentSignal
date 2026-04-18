import cities from "../../data/cities.js";

const bySlug = Object.fromEntries(cities.map((c) => [c.slug, c]));

/**
 * Returns the city object for a given slug, or undefined if not found.
 * @param {string} slug
 */
export function getCityBySlug(slug) {
  return bySlug[slug];
}
