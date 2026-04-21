//Frontend helper function to send GraphQL queries to the server and handle responses/errors    
export async function graphqlRequest(query, variables = {}) {
  const res = await fetch("http://localhost:4000/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query,
      variables,
    }),
  });

  const json = await res.json();

  if (!res.ok || json.errors) {
    throw new Error(json.errors?.[0]?.message || "GraphQL request failed");
  }

  return json.data;
}