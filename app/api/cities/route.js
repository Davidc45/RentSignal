import cities from "@/lib/data/cities.json";

export async function GET() {
  const names = Object.values(cities).map((c) => c.name);
  return Response.json(names);
}
