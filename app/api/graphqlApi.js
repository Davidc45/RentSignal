const GRAPHQL_ENDPOINT = "http://localhost:4000/";

export async function graphqlRequest(query, variables = {}) {
  try {
    const response = await fetch(GRAPHQL_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query,
        variables,
      }),
    });

    const json = await response.json();

    if (!response.ok || json.errors) {
      throw new Error(
        json.errors?.[0]?.message || "GraphQL request failed"
      );
    }

    return json.data;
  } catch (error) {
    throw new Error(error.message || "Unable to connect to GraphQL server");
  }
}