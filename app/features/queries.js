//Stores GraphQL queries for fetching data from APIs
export const GET_CITIES = `
  query GetCities {
    cities {
      id
      name
      medianRent
      geoId
    }
  }
`;

export const GET_CITY_TRENDS = `
  query GetCityTrends {
    cityTrends {
      id
      name
      latestRent
      previousRent
      monthOverMonthPct
      trend
      lastUpdated
    }
  }
`;