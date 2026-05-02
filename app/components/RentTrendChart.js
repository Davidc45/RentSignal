"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const CITY_COLORS = [
  "#818cf8",
  "#a78bfa",
  "#34d399",
];

function formatUsd(value) {
  return `$${Number(value).toLocaleString("en-US")}`;
}

function formatDate(dateStr) {
  if (!dateStr) return "";
  const [year, month] = dateStr.split("-");
  const d = new Date(Number(year), Number(month) - 1);
  return d.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rent-trend-chart__tooltip">
      <p className="rent-trend-chart__tooltip-date">{label}</p>
      {payload.map((entry) => (
        <p key={entry.name} style={{ color: entry.color, margin: "4px 0 0" }}>
          {entry.name}: {formatUsd(entry.value)}
        </p>
      ))}
    </div>
  );
};

export default function RentTrendChart({ cities, selectedCities }) {
  const comparedCities = cities.filter(
    (city) => selectedCities.includes(city.name) && city.rentHistory?.length > 0
  );

  if (comparedCities.length === 0) return null;

  // Build a unified date axis from the first city's history, then merge all cities
  const dateKeys = comparedCities[0].rentHistory.map((p) => p.date);

  const data = dateKeys.map((date) => {
    const point = { date: formatDate(date) };
    comparedCities.forEach((city) => {
      const match = city.rentHistory.find((p) => p.date === date);
      point[city.name] = match?.rent ?? null;
    });
    return point;
  });

  return (
    <section className="rent-trend-chart">
      <div className="rent-trend-chart__inner">
        <h2 className="rent-trend-chart__title">12-Month Rent Trend</h2>
        <p className="rent-trend-chart__subtitle">
          Zillow ZORI data · Month-over-month rent movement
        </p>
        <div className="rent-trend-chart__canvas">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data}
              margin={{ top: 10, right: 24, left: 16, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(255,255,255,0.08)"
                vertical={false}
              />
              <XAxis
                dataKey="date"
                tick={{ fill: "#d1d5db", fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tickFormatter={formatUsd}
                tick={{ fill: "#d1d5db", fontSize: 12 }}
                axisLine={false}
                tickLine={false}
                width={80}
                domain={["auto", "auto"]}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ stroke: "rgba(255,255,255,0.15)" }} />
              <Legend
                wrapperStyle={{ color: "#e5e7eb", paddingTop: 16, fontSize: 13 }}
              />
              {comparedCities.map((city, i) => (
                <Line
                  key={city.name}
                  type="monotone"
                  dataKey={city.name}
                  stroke={CITY_COLORS[i % CITY_COLORS.length]}
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 5 }}
                  connectNulls
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </section>
  );
}
