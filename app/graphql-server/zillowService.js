import fs from "fs";
import path from "path";
import { parse } from "csv-parse/sync";
import { ORANGE_COUNTY_CITIES } from "./orangeCountyCities.js";

function getDateColumns(row) {
  return Object.keys(row).filter((key) => /^\d{4}-\d{2}-\d{2}$/.test(key));
}

function pickField(row, candidates) {
  return candidates.find((key) => key in row) || null;
}

function classifyTrend(changePct) {
  if (changePct == null || Number.isNaN(changePct)) return "Unknown";
  if (changePct > 0.25) return "Rising";
  if (changePct < -0.25) return "Falling";
  return "Flat";
}

export async function fetchOrangeCountyCityTrendsFromZillow() {
  const csvPath = path.join(
    process.cwd(),
    "app",
    "graphql-server",
    "data",
    "ZillowCityData.csv"
  );

  const csvText = fs.readFileSync(csvPath, "utf-8");

  const records = parse(csvText, {
    columns: true,
    skip_empty_lines: true,
  });

  return records
    .map((row) => {
      const regionNameKey = pickField(row, [
        "RegionName",
        "region_name",
        "Region",
        "City",
      ]);
      const regionTypeKey = pickField(row, [
        "RegionType",
        "region_type",
        "Level",
      ]);
      const stateKey = pickField(row, ["StateName", "state_name", "State"]);
      const countyKey = pickField(row, ["CountyName", "county_name", "County"]);
      const regionIdKey = pickField(row, ["RegionID", "region_id", "id"]);

      const cityName = regionNameKey ? String(row[regionNameKey]).trim() : null;
      const regionType = regionTypeKey
        ? String(row[regionTypeKey]).toLowerCase().trim()
        : "";
      const stateName = stateKey ? String(row[stateKey]).trim() : "";
      const countyName = countyKey ? String(row[countyKey]).trim() : "";

      const dateColumns = getDateColumns(row).sort();
      const valuePairs = dateColumns
        .map((date) => ({
          date,
          value: row[date] === "" ? null : Number(row[date]),
        }))
        .filter((item) => item.value != null && !Number.isNaN(item.value));

      if (!cityName || valuePairs.length < 2) return null;

      if (stateName && stateName !== "CA" && stateName !== "California") {
        return null;
      }

      if (regionType && !regionType.includes("city")) {
        return null;
      }

      if (
        countyName &&
        countyName !== "Orange County" &&
        countyName !== "Orange"
      ) {
        return null;
      }

      if (!ORANGE_COUNTY_CITIES.has(cityName)) {
        return null;
      }

      const latest = valuePairs[valuePairs.length - 1];
      const previous = valuePairs[valuePairs.length - 2];

      const pct =
        previous.value === 0
          ? null
          : ((latest.value - previous.value) / previous.value) * 100;

      return {
        id: regionIdKey ? String(row[regionIdKey]) : cityName,
        name: cityName,
        sourceNameFromCsv: cityName,
        latestRent: latest.value,
        previousRent: previous.value,
        monthOverMonthPct: pct == null ? null : Number(pct.toFixed(2)),
        trend: classifyTrend(pct),
        lastUpdated: latest.date,
      };
    })
    .filter(Boolean)
    .sort((a, b) => a.name.localeCompare(b.name));
}