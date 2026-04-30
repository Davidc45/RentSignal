import { fetchOrangeCountyCitiesFromACS } from "./censusService.js";
import { fetchOrangeCountyCityTrendsFromZillow } from "./zillowService.js";

export const resolvers = {
  Query: {
    cities: async () => {
      const [acsCities, zillowCities] = await Promise.all([
        fetchOrangeCountyCitiesFromACS(),
        fetchOrangeCountyCityTrendsFromZillow(),
      ]);

      const zillowMap = new Map(
        zillowCities.map((city) => [city.name.toLowerCase(), city])
      );

      return acsCities.map((city) => {
        const trendData = zillowMap.get(city.name.toLowerCase());

        return {
          ...city,
          latestRent: trendData?.latestRent ?? null,
          previousRent: trendData?.previousRent ?? null,
          monthOverMonthPct: trendData?.monthOverMonthPct ?? null,
          trend: trendData?.trend ?? null,
          lastUpdated: trendData?.lastUpdated ?? null,
          sourceNameFromCsv: trendData?.sourceNameFromCsv ?? null,
        };
      });
    },

    city: async (_, { name }) => {
      const [acsCities, zillowCities] = await Promise.all([
        fetchOrangeCountyCitiesFromACS(),
        fetchOrangeCountyCityTrendsFromZillow(),
      ]);

      const baseCity = acsCities.find(
        (city) => city.name.toLowerCase() === name.toLowerCase()
      );

      if (!baseCity) return null;

      const trendData = zillowCities.find(
        (city) => city.name.toLowerCase() === name.toLowerCase()
      );

      return {
        ...baseCity,
        latestRent: trendData?.latestRent ?? null,
        previousRent: trendData?.previousRent ?? null,
        monthOverMonthPct: trendData?.monthOverMonthPct ?? null,
        trend: trendData?.trend ?? null,
        lastUpdated: trendData?.lastUpdated ?? null,
        sourceNameFromCsv: trendData?.sourceNameFromCsv ?? null,
      };
    },
  },
};