"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const DEFAULT_INCOME = 80000;

function formatUsd(value) {
  return `$${Number(value).toLocaleString("en-US")}`;
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

export default function AffordabilityChart({
  cities,
  selectedCities,
  income = DEFAULT_INCOME,
}) {
  const comparedCities = cities.filter((city) =>
    selectedCities.includes(city.name)
  );

  if (comparedCities.length === 0) return null;

  const affordableRent = Math.round((income / 12) * 0.3);

  const data = comparedCities.map((city) => ({
    name: city.name,
    "Median Rent": city.medianRent ?? 0,
    "Affordable Rent": affordableRent,
  }));

  return (
    <section className="chart-card affordability-chart">
      <div className="chart-card__inner affordability-chart__inner">
        <div className="chart-card__header">
          <div>
            <h2 className="chart-card__title affordability-chart__title">
              Affordable vs Median Rent
            </h2>
            <p className="chart-card__subtitle affordability-chart__subtitle">
              Based on 30% income rule · Annual income:{" "}
              <span className="chart-card__highlight affordability-chart__income">
                {formatUsd(income)}
              </span>
            </p>
          </div>
        </div>

        <div className="chart-card__canvas affordability-chart__canvas">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 10, right: 18, left: 10, bottom: 0 }}
              barCategoryGap="28%"
              barGap={8}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(255, 77, 0, 0.09)"
                vertical={false}
              />

              <XAxis
                dataKey="name"
                tick={{ fill: "#c0c0c0", fontSize: 12, fontWeight: 600 }}
                axisLine={false}
                tickLine={false}
              />

              <YAxis
                tickFormatter={formatUsd}
                tick={{ fill: "#888", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                width={76}
              />

              <Tooltip
                content={<CustomTooltip />}
                cursor={{ fill: "rgba(255, 77, 0, 0.045)" }}
              />

              <Legend
                wrapperStyle={{
                  color: "#c0c0c0",
                  paddingTop: 16,
                  fontSize: 12,
                  fontWeight: 600,
                }}
              />

              <Bar
                dataKey="Median Rent"
                fill="rgba(255, 77, 0, 0.86)"
                stroke="rgba(255, 120, 40, 1)"
                strokeWidth={1.5}
                radius={[10, 10, 0, 0]}
              />

              <Bar
                dataKey="Affordable Rent"
                fill="rgba(34, 197, 94, 0.72)"
                stroke="rgba(34, 197, 94, 1)"
                strokeWidth={1.5}
                radius={[10, 10, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </section>
  );
}