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

const CITY_COLORS = ["#ff4d00", "#ef4444", "#eab308"];

function formatUsd(value) {
  return `$${Number(value).toLocaleString("en-US")}`;
}

function formatDate(dateStr) {
  if (!dateStr) return "";

  const [year, month] = dateStr.split("-");
  const d = new Date(Number(year), Number(month) - 1);

  return d.toLocaleDateString("en-US", {
    month: "short",
    year: "2-digit",
  });
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;

  return (
    <div className="chart-tooltip">
      <p className="chart-tooltip__title">{label}</p>
      {payload.map((entry) => (
        <p
          key={entry.name}
          className="chart-tooltip__row"
          style={{ color: entry.color }}
        >
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
    <section className="chart-card rent-trend-chart">
      <div className="chart-card__inner rent-trend-chart__inner">
        <div className="chart-card__header">
          <div>
            <h2 className="chart-card__title rent-trend-chart__title">
              12-Month Rent Trend
            </h2>
            <p className="chart-card__subtitle rent-trend-chart__subtitle">
              Zillow ZORI data · Month-over-month rent movement
            </p>
          </div>
        </div>

        <div className="chart-card__canvas rent-trend-chart__canvas">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data}
              margin={{ top: 10, right: 18, left: 10, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(255, 77, 0, 0.09)"
                vertical={false}
              />

              <XAxis
                dataKey="date"
                tick={{ fill: "#c0c0c0", fontSize: 11, fontWeight: 600 }}
                axisLine={false}
                tickLine={false}
              />

              <YAxis
                tickFormatter={formatUsd}
                tick={{ fill: "#888", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                width={76}
                domain={["auto", "auto"]}
              />

              <Tooltip
                content={<CustomTooltip />}
                cursor={{ stroke: "rgba(255, 77, 0, 0.25)" }}
              />

              <Legend
                wrapperStyle={{
                  color: "#c0c0c0",
                  paddingTop: 16,
                  fontSize: 12,
                  fontWeight: 600,
                }}
              />

              {comparedCities.map((city, i) => (
                <Line
                  key={city.name}
                  type="monotone"
                  dataKey={city.name}
                  stroke={CITY_COLORS[i % CITY_COLORS.length]}
                  strokeWidth={2.5}
                  dot={false}
                  activeDot={{
                    r: 5,
                    strokeWidth: 2,
                    stroke: "#080808",
                  }}
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