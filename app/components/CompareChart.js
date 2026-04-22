"use client";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export default function CompareChart({ cities, selectedCities }) {
  const comparedCities = cities.filter((city) =>
    selectedCities.includes(city.name)
  );

  if (comparedCities.length === 0) return null;

  const chartData = {
    labels: comparedCities.map((city) => city.name),
    datasets: [
      {
        label: "Median Rent ($)",
        data: comparedCities.map((city) => city.medianRent ?? 0),
        backgroundColor: [
          "rgba(99, 102, 241, 0.85)",
          "rgba(168, 85, 247, 0.85)",
          "rgba(34, 197, 94, 0.85)",
        ],
        borderColor: [
          "rgba(129, 140, 248, 1)",
          "rgba(192, 132, 252, 1)",
          "rgba(74, 222, 128, 1)",
        ],
        borderWidth: 2,
        borderRadius: 8,
      },
    ],
  };

const options = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: true,
      position: "top",
      labels: {
        color: "#e5e7eb",
      },
    },
    title: {
      display: true,
      text: "Median Rent Comparison",
      color: "#f8fafc",
      font: {
        size: 22,
        weight: "bold",
      },
    },
  },
  scales: {
    x: {
      ticks: {
        color: "#d1d5db",
      },
      grid: {
        color: "rgba(255,255,255,0.08)",
      },
    },
    y: {
      beginAtZero: true,
      ticks: {
        color: "#d1d5db",
        callback: function (value) {
          return `$${value.toLocaleString()}`;
        },
      },
      grid: {
        color: "rgba(255,255,255,0.08)",
      },
    },
  },
};

return (
  <section className="landing-compare-chart">
    <div className="landing-compare-chart__inner">
      <div className="landing-compare-chart__canvas">
        <Bar data={chartData} options={options} />
      </div>
    </div>
  </section>
);
}