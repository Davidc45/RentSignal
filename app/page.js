"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { animate, stagger } from "motion/react";
import { APIProvider, Map, AdvancedMarker, Pin } from "@vis.gl/react-google-maps";
import CitySelector from "./components/CitySelector";
import HeroCity from "./components/HeroCity";
import { fetchCities } from "./features/cities/citiesThunks";
import {
  selectAllCities,
  selectCitiesStatus,
} from "./features/cities/selectors";
import CompareChart from "./components/CompareChart";
import {
  GOOGLE_MAPS_API_KEY,
  GOOGLE_MAPS_MAP_ID,
} from "./api/clientConfig";
import citiesGeo from "../data/cities";
import "./landing.css";

const FEATURE_CARDS = [
  {
    icon: "📍",
    title: "Side-by-side comparison",
    desc: "Compare median rent, affordability status, and rent ranges across 3 cities at once.",
  },
  {
    icon: "📊",
    title: "Affordability scoring",
    desc: "Instant Affordable / Stretch / Not Recommended ratings based on the 30% and 40% income rules.",
  },
  {
    icon: "📈",
    title: "Rent trend signals",
    desc: "See if rents in each city are Rising, Flat, or Falling based on rent trend data.",
  },
  {
    icon: "🏛️",
    title: "Government-backed data",
    desc: "All rent baselines come from the US Census ACS 5-Year survey — not scraped listings.",
  },
];

const DEFAULT_PREVIEW_CITIES = ["Aliso Viejo", "Anaheim", "Brea"];

const defaultCenter = { lat: 33.65, lng: -117.85 };
const defaultZoom = 10;
const MAX_COMPARE = 3;

const geoByName = Object.fromEntries(
  citiesGeo.map((city) => [city.name.toLowerCase(), city])
);

function FeatureCards({ cards }) {
  const ref = useRef(null);

  useEffect(() => {
    if (!ref.current) return;

    const items = ref.current.querySelectorAll(".landing-feature-card");

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          animate(
            items,
            { opacity: 1, y: [40, 0] },
            {
              delay: stagger(0.08),
              duration: 0.5,
              easing: [0.25, 1, 0.5, 1],
            }
          );

          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );

    observer.observe(ref.current);

    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className="landing-feature-grid">
      {cards.map((card) => (
        <div
          key={card.title}
          className="landing-feature-card"
          style={{ opacity: 0 }}
        >
          <div className="landing-feature-card__icon">{card.icon}</div>
          <h3 className="landing-feature-card__title">{card.title}</h3>
          <p className="landing-feature-card__desc">{card.desc}</p>
        </div>
      ))}
    </div>
  );
}

function parseSalary(raw) {
  const n = Number(String(raw).replace(/[^0-9.]/g, ""));
  return Number.isFinite(n) && n > 0 ? n : null;
}

function formatUsd(n) {
  if (n == null || Number.isNaN(Number(n))) return "—";
  return `$${Math.round(Number(n)).toLocaleString("en-US")}`;
}

function getBadgeInfo(medianRent, annualSalary) {
  if (medianRent == null) {
    return { label: "No Data", className: "flat", rank: 99 };
  }

  if (!annualSalary) {
    return { label: "Income Pending", className: "flat", rank: 98 };
  }

  const monthly = annualSalary / 12;
  const ratio = medianRent / monthly;

  if (ratio <= 0.3) {
    return { label: "Affordable", className: "good", rank: 1 };
  }

  if (ratio <= 0.4) {
    return { label: "Stretch", className: "stretch", rank: 2 };
  }

  return { label: "Not Recommended", className: "bad", rank: 3 };
}

function affordability(rent, annualSalary) {
  if (rent == null) {
    return { label: "No Data", cls: "flat", pct: null };
  }

  if (!annualSalary) {
    return { label: "Income Pending", cls: "neutral", pct: null };
  }

  const monthly = annualSalary / 12;
  const pct = rent / monthly;

  if (pct <= 0.3) {
    return { label: "Recommended", cls: "good", pct };
  }

  if (pct <= 0.4) {
    return { label: "Stretch", cls: "stretch", pct };
  }

  return { label: "Not Recommended", cls: "bad", pct };
}

function getTrendInfo(trend) {
  if (trend === "Rising") {
    return { label: "↑ Rising", className: "up" };
  }

  if (trend === "Falling") {
    return { label: "↓ Falling", className: "down" };
  }

  return { label: "→ Flat", className: "flat" };
}

function trendClass(trend) {
  const s = (trend || "").toLowerCase();

  if (s.includes("ris") || s.includes("up")) return "up";
  if (s.includes("fall") || s.includes("down")) return "down";

  return "flat";
}

function trendArrow(trend) {
  const tc = trendClass(trend);

  if (tc === "up") return `↑ ${trend}`;
  if (tc === "down") return `↓ ${trend}`;

  return `→ ${trend || "Flat"}`;
}

function getRuleLabel(annualSalary, fallback) {
  if (!annualSalary) return "Enter income to calculate affordability";
  return `Based on $${annualSalary.toLocaleString()}/yr income`;
}

function buildCityCard(
  city,
  annualSalary,
  highlight = false,
  ruleLabel = "ACS median rent"
) {
  const badge = getBadgeInfo(city.medianRent, annualSalary);
  const trend = getTrendInfo(city.trend ?? "Flat");

  return {
    city: city.name,
    badge: badge.label,
    badgeClass: badge.className,
    rent:
      city.medianRent == null ? "N/A" : `$${city.medianRent.toLocaleString()}`,
    trend: trend.label,
    trendClass: trend.className,
    rule: ruleLabel,
    highlight,
    badgeRank: badge.rank,
    medianRent: city.medianRent,
  };
}

function pinColors(afford, isSelected) {
  if (isSelected) {
    return { bg: "#1a0800", border: "#ff4d00", glyph: "#ffffff" };
  }

  if (afford) {
    if (afford.cls === "good") {
      return { bg: "#052e16", border: "#22c55e", glyph: "#22c55e" };
    }

    if (afford.cls === "stretch") {
      return { bg: "#1c1500", border: "#eab308", glyph: "#eab308" };
    }

    if (afford.cls === "bad") {
      return { bg: "#2d0a0a", border: "#ef4444", glyph: "#ef4444" };
    }
  }

  return { bg: "#1a0800", border: "#ff4d00", glyph: "#ff4d00" };
}

function estimateMonthlyRents(latestRent, momPct, months = 12) {
  if (!latestRent) return [];

  const rate = (momPct || 0) / 100;
  const pts = new Array(months);

  pts[months - 1] = latestRent;

  for (let i = months - 2; i >= 0; i--) {
    pts[i] = pts[i + 1] / (1 + rate);
  }

  return pts;
}

function Sparkline({ data, color }) {
  if (!data || data.length < 2) return null;

  const w = 300;
  const h = 72;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const pad = 8;

  const pts = data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * w;
      const y = h - pad - ((v - min) / range) * (h - pad * 2);
      return `${x},${y}`;
    })
    .join(" ");

  const lastX = w;
  const lastY =
    h - pad - ((data[data.length - 1] - min) / range) * (h - pad * 2);

  return (
    <svg
      width="100%"
      height={h}
      viewBox={`0 0 ${w} ${h}`}
      preserveAspectRatio="none"
    >
      <defs>
        <linearGradient id="spark-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.18" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>

      <polygon
        points={`0,${h} ${pts} ${lastX},${h}`}
        fill="url(#spark-fill)"
      />

      <polyline
        points={pts}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <circle cx={lastX} cy={lastY} r="3" fill={color} />
    </svg>
  );
}

function AffordabilityBar({ rent, annualSalary }) {
  const monthly = annualSalary / 12;
  const maxRent = monthly * 0.5;
  const goodAt = monthly * 0.3;
  const stretchAt = monthly * 0.4;
  const markerPct = Math.min((rent / maxRent) * 100, 100);
  const incomePct = Math.round((rent / monthly) * 100);

  const verdict =
    rent <= goodAt
      ? "well within"
      : rent <= stretchAt
      ? "at the edge of"
      : "above";

  const rule = rent <= goodAt ? "30%" : "40%";

  return (
    <div className="afford-bar-section">
      <div className="afford-bar-header">
        <span className="afford-bar-header__label">
          Affordability for your income
        </span>
        <span className="afford-bar-header__income">
          {formatUsd(annualSalary)}/yr
        </span>
      </div>

      <div className="afford-bar-labels">
        <span>$0</span>
        <span>{formatUsd(goodAt)}</span>
        <span>{formatUsd(stretchAt)}</span>
        <span>{formatUsd(maxRent)}</span>
      </div>

      <div className="afford-bar">
        <div className="afford-bar__good" style={{ width: "60%" }} />
        <div className="afford-bar__stretch" style={{ width: "20%" }} />
        <div className="afford-bar__bad" style={{ width: "20%" }} />
        <div className="afford-bar__marker" style={{ left: `${markerPct}%` }} />
      </div>

      <div className="afford-bar-tiers">
        <span className="afford-bar-tiers__good">Good</span>
        <span className="afford-bar-tiers__stretch">Stretch</span>
        <span className="afford-bar-tiers__bad">Not rec.</span>
      </div>

      <p className="afford-bar-desc">
        At {incomePct}% of gross income, rent here is{" "}
        <strong>{verdict}</strong> the {rule} affordability rule.
      </p>
    </div>
  );
}

function CityDetailPanel({ city, annualSalary, onClose }) {
  const afford = affordability(city.medianRent, annualSalary);
  const tc = trendClass(city.trend);
  const mom = city.monthOverMonthPct;
  const momLabel =
    mom != null ? `${mom >= 0 ? "+" : ""}${mom.toFixed(1)}%` : "—";

  const annual12 =
    mom != null
      ? `${((Math.pow(1 + mom / 100, 12) - 1) * 100).toFixed(1)}%`
      : "—";

  const rentLow =
    city.medianRent != null ? Math.round(city.medianRent * 0.85) : null;

  const rentHigh =
    city.medianRent != null ? Math.round(city.medianRent * 1.15) : null;

  const sparkData = estimateMonthlyRents(city.latestRent, mom);
  const sparkColor =
    tc === "up" ? "#ef4444" : tc === "down" ? "#22c55e" : "#aaaaaa";

  return (
    <div className="detail-panel">
      <div className="detail-panel__header">
        <div>
          <div className="detail-panel__city">{city.name}</div>
          <div className="detail-panel__sub">Orange County · CA</div>
        </div>

        <button
          className="detail-panel__close"
          onClick={onClose}
          aria-label="Back"
        >
          ←
        </button>
      </div>

      {afford && (
        <div
          className={`detail-panel__badge detail-panel__badge--${afford.cls}`}
        >
          {afford.label}
        </div>
      )}

      <div className="detail-panel__rent-hero">
        {formatUsd(city.medianRent)}
        <span>/mo median</span>
      </div>

      {rentLow != null && (
        <div className="detail-panel__range">
          range: {formatUsd(rentLow)} – {formatUsd(rentHigh)}{" "}
          <span>(±15%)</span>
        </div>
      )}

      {annualSalary && city.medianRent != null && (
        <AffordabilityBar rent={city.medianRent} annualSalary={annualSalary} />
      )}

      <div className="detail-panel__section-label">Market Snapshot</div>

      <div className="detail-panel__snapshot">
        <div className="detail-snap__cell">
          <span className="detail-snap__label">Median Rent</span>
          <span className="detail-snap__value">
            {formatUsd(city.medianRent)}
          </span>
          <span className="detail-snap__sub">ACS 5-Yr</span>
        </div>

        <div className="detail-snap__cell">
          <span className="detail-snap__label">12-Mo Change</span>
          <span className={`detail-snap__value detail-snap__value--${tc}`}>
            {mom != null ? (mom >= 0 ? "+" : "") : ""}
            {annual12}
          </span>
          <span className="detail-snap__sub">year over year est.</span>
        </div>

        <div className="detail-snap__cell">
          <span className="detail-snap__label">Rent Range</span>
          <span className="detail-snap__value detail-snap__value--sm">
            {formatUsd(rentLow)}–{formatUsd(rentHigh)}
          </span>
          <span className="detail-snap__sub">±15% est.</span>
        </div>

        <div className="detail-snap__cell">
          <span className="detail-snap__label">% of Income</span>
          <span className="detail-snap__value">
            {afford?.pct != null ? `${Math.round(afford.pct * 100)}%` : "—"}
          </span>
          <span className="detail-snap__sub">
            {annualSalary
              ? `${formatUsd(annualSalary)}/yr input`
              : "enter salary"}
          </span>
        </div>
      </div>

      <div className="detail-panel__section-label">
        12-Month Trend
        <span className="detail-panel__section-meta">Zillow estimate</span>
      </div>

      <div className="detail-panel__trend-row">
        <span
          className={`detail-panel__trend-badge detail-panel__trend-badge--${tc}`}
        >
          {trendArrow(city.trend || "Flat")}
        </span>
        <span className="detail-panel__trend-stat">
          {momLabel} MoM · {annual12} 12mo
        </span>
      </div>

      <div className="detail-panel__sparkline">
        <Sparkline data={sparkData} color={sparkColor} />
      </div>

      {city.latestRent != null && (
        <div className="detail-panel__sparkline-labels">
          <span>12mo ago</span>
          <span>{formatUsd(city.latestRent)}/mo now</span>
        </div>
      )}
    </div>
  );
}

function CityCompareCard({ city, afford, onRemove, onSelect }) {
  const mom = city.monthOverMonthPct;
  const momLabel =
    mom != null ? `${mom >= 0 ? "+" : ""}${mom.toFixed(1)}% MoM` : null;

  const tc = trendClass(city.trend);

  return (
    <div
      className={`compare-card compare-card--${afford ? afford.cls : "neutral"}`}
      onClick={onSelect}
      style={{ cursor: "pointer" }}
    >
      <div className="compare-card__header">
        <span className="compare-card__city">{city.name}</span>

        <button
          className="compare-card__remove"
          onClick={(e) => {
            e.stopPropagation();
            onRemove(city.name);
          }}
          aria-label="Remove"
        >
          ×
        </button>
      </div>

      {afford ? (
        <div className={`compare-card__badge compare-card__badge--${afford.cls}`}>
          {afford.label}
        </div>
      ) : (
        <div className="compare-card__badge compare-card__badge--neutral">
          Income Pending
        </div>
      )}

      <div className="compare-card__rents">
        <div className="compare-card__rent-item">
          <span className="compare-card__rent-value">
            {formatUsd(city.medianRent)}
          </span>
          <span className="compare-card__rent-label">median/mo</span>
        </div>

        {city.latestRent != null && (
          <div className="compare-card__rent-item">
            <span className="compare-card__rent-value compare-card__rent-value--sub">
              {formatUsd(city.latestRent)}
            </span>
            <span className="compare-card__rent-label">latest/mo</span>
          </div>
        )}
      </div>

      {afford?.pct != null && (
        <div className="compare-card__pct">
          {Math.round(afford.pct * 100)}% of monthly income
        </div>
      )}

      <div className="compare-card__footer">
        {city.trend && (
          <span className={`compare-card__trend compare-card__trend--${tc}`}>
            {trendArrow(city.trend)}
          </span>
        )}

        {momLabel && <span className="compare-card__mom">{momLabel}</span>}

        <span className="compare-card__detail-hint">tap for details →</span>
      </div>
    </div>
  );
}

function IntegratedCityMap({
  cities,
  annualSalary,
  selectedCities,
  onCitiesChange,
}) {
  const [detailCity, setDetailCity] = useState(null);

  const cityData = useMemo(() => {
    return (cities || []).flatMap((city) => {
      const geo = geoByName[city.name.toLowerCase()];
      if (!geo) return [];

      return [
        {
          ...city,
          lat: geo.lat,
          lng: geo.lng,
          slug: geo.slug,
        },
      ];
    });
  }, [cities]);

  const selectedCityObjects = selectedCities
    .map((name) => cityData.find((city) => city.name === name))
    .filter(Boolean);

  const selectedNameSet = new Set(selectedCities);

  const handleMarkerClick = useCallback(
    (city) => {
      onCitiesChange((prev) => {
        if (prev.includes(city.name)) return prev;
        if (prev.length >= MAX_COMPARE) return prev;

        return [...prev, city.name];
      });

      setDetailCity(city);
    },
    [onCitiesChange]
  );

  const handleRemove = useCallback(
    (cityName) => {
      onCitiesChange((prev) => prev.filter((name) => name !== cityName));

      setDetailCity((prev) => {
        if (prev?.name === cityName) return null;
        return prev;
      });
    },
    [onCitiesChange]
  );

  return (
    <div className="embedded-map-layout">
      <div className="embedded-map-layout__map">
        <APIProvider apiKey={GOOGLE_MAPS_API_KEY || ""}>
          <Map
            style={{ width: "100%", height: "100%" }}
            defaultCenter={defaultCenter}
            defaultZoom={defaultZoom}
            minZoom={6}
            mapId={GOOGLE_MAPS_MAP_ID}
            colorScheme="DARK"
          >
            {cityData.map((city) => {
              const afford = affordability(city.medianRent, annualSalary);
              const isSelected = selectedNameSet.has(city.name);
              const colors = pinColors(afford, isSelected);

              return (
                <AdvancedMarker
                  key={city.id || city.slug || city.name}
                  position={{ lat: city.lat, lng: city.lng }}
                  onClick={() => handleMarkerClick(city)}
                  title={city.name}
                >
                  <Pin
                    background={colors.bg}
                    borderColor={colors.border}
                    glyphColor={colors.glyph}
                    scale={isSelected ? 1.25 : 1}
                  />
                </AdvancedMarker>
              );
            })}
          </Map>
        </APIProvider>
      </div>

      <div className="embedded-map-layout__panel">
        {detailCity ? (
          <CityDetailPanel
            city={detailCity}
            annualSalary={annualSalary}
            onClose={() => setDetailCity(null)}
          />
        ) : (
          <div className="panel-compare">
            <div className="panel-compare__header">
              <span className="panel-compare__title">Map Selected Cities</span>
              <span className="panel-compare__count">
                {selectedCityObjects.length} / {MAX_COMPARE}
              </span>
            </div>

            {selectedCityObjects.length === 0 ? (
              <div className="panel-compare__empty">
                Click up to {MAX_COMPARE} pins on the map to compare cities.
              </div>
            ) : (
              <div className="panel-compare__cards">
                {selectedCityObjects.map((city) => (
                  <CityCompareCard
                    key={city.id || city.name}
                    city={city}
                    afford={affordability(city.medianRent, annualSalary)}
                    onRemove={handleRemove}
                    onSelect={() => setDetailCity(city)}
                  />
                ))}
              </div>
            )}

            {selectedCityObjects.length > 0 && (
              <button
                className="panel-compare__clear"
                onClick={() => {
                  onCitiesChange([]);
                  setDetailCity(null);
                }}
              >
                Clear all
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function Page() {
  const [selectedCities, setSelectedCities] = useState([]);
  const [compareRequested, setCompareRequested] = useState(false);
  const [salaryInput, setSalaryInput] = useState("");
  const [appliedSalary, setAppliedSalary] = useState(null);

  const dispatch = useDispatch();
  const cities = useSelector(selectAllCities);
  const citiesStatus = useSelector(selectCitiesStatus);
  const isCitiesLoading = citiesStatus === "loading";

  const previewCityNames =
    selectedCities.length > 0 ? selectedCities : DEFAULT_PREVIEW_CITIES;

  const previewCards = previewCityNames
    .map((targetName) => {
      const city = cities.find((c) => c.name === targetName);
      if (!city) return null;

      return buildCityCard(
        city,
        appliedSalary,
        selectedCities.length > 0
          ? city.name === selectedCities[0]
          : city.name === "Anaheim",
        getRuleLabel(appliedSalary, "ACS median rent")
      );
    })
    .filter(Boolean);

  const mostExpensiveCards = [...cities]
    .filter((city) => city.medianRent != null)
    .sort((a, b) => b.medianRent - a.medianRent)
    .slice(0, 3)
    .map((city) =>
      buildCityCard(
        city,
        appliedSalary,
        false,
        appliedSalary
          ? "Income-based affordability"
          : "Enter income to calculate affordability"
      )
    );

  const bestValueCards = [...cities]
    .filter((city) => city.medianRent != null)
    .sort((a, b) => {
      const badgeA = getBadgeInfo(a.medianRent, appliedSalary);
      const badgeB = getBadgeInfo(b.medianRent, appliedSalary);

      if (badgeA.rank !== badgeB.rank) {
        return badgeA.rank - badgeB.rank;
      }

      return a.medianRent - b.medianRent;
    })
    .slice(0, 3)
    .map((city) =>
      buildCityCard(
        city,
        appliedSalary,
        false,
        appliedSalary
          ? "Best fit for income"
          : "Enter income to calculate affordability"
      )
    );

  useEffect(() => {
    dispatch(fetchCities());
  }, [dispatch]);

  const handleCompareClick = () => {
    setCompareRequested(true);
  };

  const handleCalculateAffordability = () => {
    setAppliedSalary(parseSalary(salaryInput));
  };

  useEffect(() => {
    if (typeof window === "undefined") return;

    let trigger;
    let el;

    (async () => {
      const gsap = (await import("gsap")).default;
      const { ScrambleTextPlugin } = await import("gsap/ScrambleTextPlugin");

      gsap.registerPlugin(ScrambleTextPlugin);

      el = document.querySelector(".scramble-word");
      if (!el) return;

      trigger = el.closest(".title-line");
      if (!trigger) return;

      const handleMouseEnter = () => {
        gsap.killTweensOf(el);
        gsap.to(el, {
          duration: 0.8,
          scrambleText: { text: "-/#$%>", chars: "<&!§8(" },
          overwrite: true,
        });
      };

      const handleMouseLeave = () => {
        gsap.killTweensOf(el);
        gsap.to(el, {
          duration: 0.5,
          scrambleText: { text: "guessing.", chars: "<&!§8(" },
          overwrite: true,
        });
      };

      trigger.addEventListener("mouseenter", handleMouseEnter);
      trigger.addEventListener("mouseleave", handleMouseLeave);

      trigger._handleMouseEnter = handleMouseEnter;
      trigger._handleMouseLeave = handleMouseLeave;
    })();

    return () => {
      if (trigger?._handleMouseEnter) {
        trigger.removeEventListener("mouseenter", trigger._handleMouseEnter);
      }

      if (trigger?._handleMouseLeave) {
        trigger.removeEventListener("mouseleave", trigger._handleMouseLeave);
      }
    };
  }, []);

  return (
    <div className="landing">
      <section className="landing-hero">
        <div className="landing-hero__left">
          <span className="landing-brand">RentSignal</span>

          <div className="landing-hero__eyebrow">
            California Rent Intelligence
          </div>

          <h1 className="landing-hero__title">
            <span className="title-line">
              Stop <span className="scramble-word">guessing.</span>
            </span>
            <span className="title-line">Start comparing.</span>
          </h1>

          <p className="landing-hero__subtitle">
            Compare rent affordability across California cities using real
            government data — not estimates from listing sites.
          </p>

          <section className="landing-insights">
            <div className="landing-insights__group">
              <div className="landing-insights__header">
                <h2 className="landing-insights__title">
                  Top 3 Most Expensive
                </h2>
                <p className="landing-insights__subtitle">
                  Highest median rent among supported Orange County cities
                </p>
              </div>

              <div className="landing-preview__inner landing-preview__inner--live">
                {isCitiesLoading ? (
                  <div className="landing-loading-card">
                    <div className="landing-loading-card__spinner" />
                    <p className="landing-loading-card__text">
                      Loading ACS data...
                    </p>
                  </div>
                ) : (
                  mostExpensiveCards.map((card) => (
                    <div key={card.city} className="landing-preview__card">
                      <div className="landing-preview__city">{card.city}</div>

                      <div
                        className={`landing-preview__badge landing-preview__badge--${card.badgeClass}`}
                      >
                        {card.badge}
                      </div>

                      <div className="landing-preview__rent">
                        {card.rent}
                        <span>/mo</span>
                      </div>

                      <div
                        className={`landing-preview__trend landing-preview__trend--${card.trendClass}`}
                      >
                        {card.trend}
                      </div>

                      <div className="landing-preview__rule">{card.rule}</div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="landing-insights__group">
              <div className="landing-insights__header">
                <h2 className="landing-insights__title">Top 3 Best Value</h2>
                <p className="landing-insights__subtitle">
                  Best affordability band first, then lowest median rent
                </p>
              </div>

              <div className="landing-preview__inner landing-preview__inner--live">
                {isCitiesLoading ? (
                  <div className="landing-loading-card">
                    <div className="landing-loading-card__spinner" />
                    <p className="landing-loading-card__text">
                      Loading ACS data...
                    </p>
                  </div>
                ) : (
                  bestValueCards.map((card) => (
                    <div key={card.city} className="landing-preview__card">
                      <div className="landing-preview__city">{card.city}</div>

                      <div
                        className={`landing-preview__badge landing-preview__badge--${card.badgeClass}`}
                      >
                        {card.badge}
                      </div>

                      <div className="landing-preview__rent">
                        {card.rent}
                        <span>/mo</span>
                      </div>

                      <div
                        className={`landing-preview__trend landing-preview__trend--${card.trendClass}`}
                      >
                        {card.trend}
                      </div>

                      <div className="landing-preview__rule">{card.rule}</div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </section>

          <div className="landing-hero__tools">
            <div className="landing-hero__panel">
              <h2 className="landing-hero__panel-title">
                Select cities to compare
              </h2>

              <CitySelector
                cities={cities}
                selectedCities={selectedCities}
                onCitiesChange={setSelectedCities}
                maxCities={MAX_COMPARE}
              />

              <button
                className={`landing-hero__search-btn ${
                  selectedCities.length === 0
                    ? "landing-hero__search-btn--disabled"
                    : ""
                }`}
                disabled={selectedCities.length === 0}
                onClick={handleCompareClick}
              >
                Compare
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 8l4 4m0 0l-4 4m4-4H3"
                  />
                </svg>
              </button>

              {compareRequested && selectedCities.length > 0 && (
                <div className="landing-compare-results">
                  <CompareChart
                    cities={cities}
                    selectedCities={selectedCities}
                  />

                  <section className="landing-preview landing-preview--inside-panel">
                    <div className="landing-preview__inner">
                      {previewCards.map((card) => (
                        <div
                          key={card.city}
                          className={`landing-preview__card${
                            card.highlight
                              ? " landing-preview__card--highlight"
                              : ""
                          }`}
                        >
                          <div className="landing-preview__city">
                            {card.city}
                          </div>

                          <div
                            className={`landing-preview__badge landing-preview__badge--${card.badgeClass}`}
                          >
                            {card.badge}
                          </div>

                          <div className="landing-preview__rent">
                            {card.rent}
                            <span>/mo</span>
                          </div>

                          <div
                            className={`landing-preview__trend landing-preview__trend--${card.trendClass}`}
                          >
                            {card.trend}
                          </div>

                          <div className="landing-preview__rule">
                            {card.rule}
                          </div>
                        </div>
                      ))}
                    </div>

                    <p className="landing-preview__caption">
                      Selected cities: {selectedCities.join(" · ")}
                    </p>
                  </section>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="landing-hero__right">
          <HeroCity />
        </div>
      </section>

      <section className="landing-affordability-shell">
        <div className="landing-hero__panel landing-affordability-panel">
          <h2 className="landing-hero__panel-title">
            Estimate city affordability
          </h2>

          <div className="landing-hero__salary-row">
            <span className="landing-hero__salary-prefix">$</span>
            <input
              className="landing-hero__salary-input"
              type="text"
              inputMode="numeric"
              placeholder="Enter annual income"
              value={salaryInput}
              onChange={(e) => setSalaryInput(e.target.value)}
            />
          </div>

          <button
            className="landing-hero__search-btn landing-hero__search-btn--secondary"
            onClick={handleCalculateAffordability}
          >
            Calculate Affordability
          </button>

          <section className="landing-map-section landing-map-section--inside-panel">
            <div className="landing-map-section__header">
              <h2 className="landing-map-section__title">
                Interactive Orange County Map
              </h2>
              <p className="landing-map-section__subtitle">
                Click a pin to select a city, view market snapshot details, and
                update affordability colors after calculating income.
              </p>
            </div>

            <IntegratedCityMap
              cities={cities}
              annualSalary={appliedSalary}
              selectedCities={selectedCities}
              onCitiesChange={setSelectedCities}
            />
          </section>
        </div>

        <p className="landing-hero__note landing-affordability-note">
          {appliedSalary
            ? `Affordability currently based on $${appliedSalary.toLocaleString()}/yr`
            : "Free · No account needed · Backed by Census ACS + rent trend data"}
        </p>
      </section>

      <section className="landing-stats">
        <div className="landing-stat">
          <span className="landing-stat__value">60+</span>
          <span className="landing-stat__label">California cities</span>
        </div>

        <div className="landing-stat__divider" />

        <div className="landing-stat">
          <span className="landing-stat__value">30 / 40%</span>
          <span className="landing-stat__label">Affordability rules</span>
        </div>

        <div className="landing-stat__divider" />

        <div className="landing-stat">
          <span className="landing-stat__value">ACS 2024</span>
          <span className="landing-stat__label">Census data source</span>
        </div>

        <div className="landing-stat__divider" />

        <div className="landing-stat">
          <span className="landing-stat__value">Zillow</span>
          <span className="landing-stat__label">Rent trend source</span>
        </div>
      </section>

      <div className="landing-bottom-row">
        <section className="landing-how" id="how-it-works">
          <h2 className="landing-section__title landing-section__title--left">
            How it works
          </h2>

          <div className="landing-steps">
            {[
              {
                num: "01",
                heading: "Pick your cities",
                desc: "Search or click map pins to select up to 3 Orange County cities.",
              },
              {
                num: "02",
                heading: "Enter your income",
                desc: "Calculate affordability labels from your annual income.",
              },
              {
                num: "03",
                heading: "Explore market details",
                desc: "Click a map pin or compare card to view rent range, trend, and affordability details.",
              },
            ].map((step) => (
              <div key={step.num} className="landing-step">
                <div className="landing-step__number">{step.num}</div>
                <h3 className="landing-step__heading">{step.heading}</h3>
                <p className="landing-step__desc">{step.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="landing-features" id="features">
          <h2 className="landing-section__title landing-section__title--left">
            What you get
          </h2>

          <FeatureCards cards={FEATURE_CARDS} />
        </section>
      </div>

      <footer className="landing-footer">
        <span className="landing-footer__brand">RentSignal</span>
        <span className="landing-footer__note">
          Data: Census ACS 2024 · Zillow rent trends · Built for California
          renters
        </span>
      </footer>
    </div>
  );
}