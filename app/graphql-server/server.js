//Starts Apollo Server for testing GraphQL queries related to cities and median rent data in Orange County, CA
//Connects schema.js and resolvers.js to serve data from the Census API
//Launches GraphQL server on http://localhost:4000 for local development and testing
import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
import { typeDefs } from "./schema.js";
import { resolvers } from "./resolvers.js";

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

const { url } = await startStandaloneServer(server, {
  listen: { port: 4000 },
});

console.log(`Server ready at: ${url}`);