export const typeDefs = `#graphql
  type City {
    #Census ACS fields
    id: ID!
    name: String!
    geoId: String!
    medianRent: Int

    # Zillow trend fields
    latestRent: Float
    previousRent: Float
    monthOverMonthPct: Float
    trend: String
    lastUpdated: String
    sourceNameFromCsv: String
  }

  type Query {
    cities: [City!]!
    city(name: String!): City
  }
`;