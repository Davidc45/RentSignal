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

const CHART_COLORS = [
  {
    bg: "rgba(255, 77, 0, 0.86)",
    border: "rgba(255, 120, 40, 1)",
  },
  {
    bg: "rgba(239, 68, 68, 0.78)",
    border: "rgba(248, 113, 113, 1)",
  },
  {
    bg: "rgba(234, 179, 8, 0.74)",
    border: "rgba(250, 204, 21, 1)",
  },
];

export default function CompareChart({ cities, selectedCities }) {
  const comparedCities = cities.filter((city) =>
    selectedCities.includes(city.name)
  );

  if (comparedCities.length === 0) return null;

  const chartData = {
    labels: comparedCities.map((city) => city.name),
    datasets: [
      {
        label: "Median Rent",
        data: comparedCities.map((city) => city.medianRent ?? 0),
        backgroundColor: comparedCities.map(
          (_, i) => CHART_COLORS[i % CHART_COLORS.length].bg
        ),
        borderColor: comparedCities.map(
          (_, i) => CHART_COLORS[i % CHART_COLORS.length].border
        ),
        borderWidth: 1.5,
        borderRadius: 10,
        borderSkipped: false,
        barThickness: 42,
        maxBarThickness: 52,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    layout: {
      padding: {
        top: 8,
        right: 8,
        bottom: 0,
        left: 0,
      },
    },
    plugins: {
      legend: {
        display: true,
        position: "top",
        align: "end",
        labels: {
          color: "#c0c0c0",
          boxWidth: 10,
          boxHeight: 10,
          borderRadius: 4,
          usePointStyle: true,
          pointStyle: "circle",
          padding: 18,
          font: {
            size: 12,
            weight: "600",
          },
        },
      },
      title: {
        display: true,
        text: "Median Rent Comparison",
        color: "#ffffff",
        align: "start",
        padding: {
          bottom: 18,
        },
        font: {
          size: 18,
          weight: "800",
        },
      },
      tooltip: {
        backgroundColor: "rgba(8, 8, 8, 0.96)",
        titleColor: "#ffffff",
        bodyColor: "#c0c0c0",
        borderColor: "rgba(255, 77, 0, 0.28)",
        borderWidth: 1,
        padding: 12,
        displayColors: true,
        callbacks: {
          label: function (context) {
            return ` ${context.dataset.label}: $${Number(
              context.raw
            ).toLocaleString()}`;
          },
        },
      },
    },
    scales: {
      x: {
        ticks: {
          color: "#c0c0c0",
          font: {
            size: 12,
            weight: "600",
          },
        },
        grid: {
          display: false,
        },
        border: {
          display: false,
        },
      },
      y: {
        beginAtZero: true,
        ticks: {
          color: "#888",
          font: {
            size: 11,
          },
          callback: function (value) {
            return `$${Number(value).toLocaleString()}`;
          },
        },
        grid: {
          color: "rgba(255, 77, 0, 0.09)",
          drawTicks: false,
        },
        border: {
          display: false,
        },
      },
    },
  };

  return (
    <section className="landing-compare-chart chart-card chart-card--median">
      <div className="landing-compare-chart__inner chart-card__inner">
        <div className="landing-compare-chart__canvas chart-card__canvas">
          <Bar data={chartData} options={options} />
        </div>
      </div>
    </section>
  );
}