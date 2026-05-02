export const GET_CITIES = `
  query GetCities {
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
      sourceNameFromCsv
      rentHistory {
        date
        rent
      }
    }
  }
`;

export const GET_CITY = `
  query GetCity($name: String!) {
    city(name: $name) {
      id
      name
      geoId
      medianRent
      latestRent
      previousRent
      monthOverMonthPct
      trend
      lastUpdated
      sourceNameFromCsv
    }
  }
`;