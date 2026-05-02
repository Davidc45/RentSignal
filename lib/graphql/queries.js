/** AppSync GraphQL documents (single source of truth for the frontend). */

export const GET_ALL_CITIES = `
  query GetAllCities {
    cities {
      id
      name
      geoId
      medianRent
      latestRent
      previousRent
      monthOverMonthPct
      trend
      lastUpdated
    }
  }
`;

export const GET_MARKET_SNAPSHOT = `
  query GetMarketSnapshot($citySlug: String!, $income: Float!, $bedrooms: Int!) {
    marketSnapshot(citySlug: $citySlug, income: $income, bedrooms: $bedrooms) {
      city
      citySlug
      state
      bedrooms
      medianIncome
      medianRent
      affordableMonthlyRent
      affordabilityRatio
      affordabilityLabel
      rentTrend12Month
      trendLabel
      lastUpdated
    }
  }
`;
