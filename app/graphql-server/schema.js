export const typeDefs = `#graphql
  type City {
    id: ID!
    name: String!
    medianRent: Int
    geoId: String!
  }

  type CityTrend {
    id: ID!
    name: String!
    sourceNameFromCsv: String
    latestRent: Float
    previousRent: Float
    monthOverMonthPct: Float
    trend: String!
    lastUpdated: String
  }

  type Query {
    cities: [City!]!
    cityTrends: [CityTrend!]!
    cityTrend(name: String!): CityTrend
  }
`;