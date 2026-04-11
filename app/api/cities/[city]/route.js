import cities from "@/lib/data/cities.json";

export async function GET(_request, { params }) {
  const { city } = await params;
  const key = decodeURIComponent(city).toLowerCase();
  const data = cities[key];

  if (!data) {
    return Response.json({ error: "City not found" }, { status: 404 });
  }

  return Response.json(data);
}
