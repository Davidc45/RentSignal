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
    <div className="affordability-chart__tooltip">
      <p className="affordability-chart__tooltip-city">{label}</p>
      {payload.map((entry) => (
        <p key={entry.name} style={{ color: entry.color }}>
          {entry.name}: {formatUsd(entry.value)}
        </p>
      ))}
    </div>
  );
};

export default function AffordabilityChart({ cities, selectedCities, income = DEFAULT_INCOME }) {
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
    <section className="affordability-chart">
      <div className="affordability-chart__inner">
        <h2 className="affordability-chart__title">
          Affordable vs Median Rent
        </h2>
        <p className="affordability-chart__subtitle">
          Based on 30% income rule · Annual income:{" "}
          <span className="affordability-chart__income">{formatUsd(income)}</span>
        </p>
        <div className="affordability-chart__canvas">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 10, right: 24, left: 16, bottom: 0 }}
              barCategoryGap="30%"
              barGap={6}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(255,255,255,0.08)"
                vertical={false}
              />
              <XAxis
                dataKey="name"
                tick={{ fill: "#d1d5db", fontSize: 13 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tickFormatter={formatUsd}
                tick={{ fill: "#d1d5db", fontSize: 12 }}
                axisLine={false}
                tickLine={false}
                width={80}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255,255,255,0.04)" }} />
              <Legend
                wrapperStyle={{ color: "#e5e7eb", paddingTop: 16, fontSize: 13 }}
              />
              <Bar
                dataKey="Median Rent"
                fill="rgba(99, 102, 241, 0.85)"
                radius={[6, 6, 0, 0]}
              />
              <Bar
                dataKey="Affordable Rent"
                fill="rgba(34, 197, 94, 0.85)"
                radius={[6, 6, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </section>
  );
}
