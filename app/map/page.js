"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { APIProvider, Map, AdvancedMarker, Pin } from "@vis.gl/react-google-maps";
import { graphqlRequest } from "../api/graphqlApi";
import { GET_ALL_CITIES } from "../../lib/graphql/queries";
import citiesGeo from "../../data/cities";
import "./map.css";

const defaultCenter = { lat: 33.65, lng: -117.85 };
const defaultZoom = 10;
const MAX_COMPARE = 3;

function formatUsd(n) {
  if (n == null || Number.isNaN(Number(n))) return "—";
  return `$${Math.round(Number(n)).toLocaleString("en-US")}`;
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

function affordability(rent, annualSalary) {
  if (!annualSalary || rent == null) return null;
  const monthly = annualSalary / 12;
  const pct = rent / monthly;
  if (pct <= 0.30) return { label: "Recommended", cls: "good", pct };
  if (pct <= 0.40) return { label: "Stretch", cls: "stretch", pct };
  return { label: "Not Recommended", cls: "bad", pct };
}

function pinColors(afford, isSelected) {
  if (isSelected) return { bg: "#1a0800", border: "#FF4D00", glyph: "#fff" };
  if (afford) {
    if (afford.cls === "good")    return { bg: "#052e16", border: "#22c55e", glyph: "#22c55e" };
    if (afford.cls === "stretch") return { bg: "#1c1500", border: "#eab308", glyph: "#eab308" };
    return { bg: "#2d0a0a", border: "#ef4444", glyph: "#ef4444" };
  }
  return { bg: "#1a0800", border: "#FF4D00", glyph: "#FF4D00" };
}

function parseSalary(raw) {
  const n = Number(String(raw).replace(/[^0-9.]/g, ""));
  return Number.isFinite(n) && n > 0 ? n : null;
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
  const w = 300; const h = 72;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const pad = 8;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - pad - ((v - min) / range) * (h - pad * 2);
    return `${x},${y}`;
  }).join(" ");
  const lastX = w;
  const lastY = h - pad - ((data[data.length - 1] - min) / range) * (h - pad * 2);
  return (
    <svg width="100%" height={h} viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none">
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
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={lastX} cy={lastY} r="3" fill={color} />
    </svg>
  );
}

function AffordabilityBar({ rent, annualSalary }) {
  const monthly = annualSalary / 12;
  const maxRent = monthly * 0.50;
  const goodAt = monthly * 0.30;
  const stretchAt = monthly * 0.40;
  const markerPct = Math.min((rent / maxRent) * 100, 100);
  const incomePct = Math.round((rent / monthly) * 100);

  const verdict =
    rent <= goodAt ? "well within" : rent <= stretchAt ? "at the edge of" : "above";
  const rule = rent <= goodAt ? "30%" : "40%";

  return (
    <div className="afford-bar-section">
      <div className="afford-bar-header">
        <span className="afford-bar-header__label">Affordability for your income</span>
        <span className="afford-bar-header__income">{formatUsd(annualSalary)}/yr</span>
      </div>
      <div className="afford-bar-labels">
        <span>$0</span>
        <span>{formatUsd(goodAt)}</span>
        <span>{formatUsd(stretchAt)}</span>
        <span>{formatUsd(maxRent)}</span>
      </div>
      <div className="afford-bar">
        <div className="afford-bar__good"  style={{ width: "60%" }} />
        <div className="afford-bar__stretch" style={{ width: "20%" }} />
        <div className="afford-bar__bad"  style={{ width: "20%" }} />
        <div className="afford-bar__marker" style={{ left: `${markerPct}%` }} />
      </div>
      <div className="afford-bar-tiers">
        <span className="afford-bar-tiers__good">Good</span>
        <span className="afford-bar-tiers__stretch">Stretch</span>
        <span className="afford-bar-tiers__bad">Not rec.</span>
      </div>
      <p className="afford-bar-desc">
        At {incomePct}% of gross income, rent here is <strong>{verdict}</strong> the {rule} affordability rule.
      </p>
    </div>
  );
}

function CityDetailPanel({ city, annualSalary, onClose }) {
  const afford = affordability(city.medianRent, annualSalary);
  const tc = trendClass(city.trend);
  const mom = city.monthOverMonthPct;
  const momLabel = mom != null ? `${mom >= 0 ? "+" : ""}${mom.toFixed(1)}%` : "—";
  const annual12 = mom != null
    ? `${((Math.pow(1 + mom / 100, 12) - 1) * 100).toFixed(1)}%`
    : "—";
  const rentLow  = city.medianRent != null ? Math.round(city.medianRent * 0.85) : null;
  const rentHigh = city.medianRent != null ? Math.round(city.medianRent * 1.15) : null;
  const sparkData = estimateMonthlyRents(city.latestRent, mom);
  const sparkColor = tc === "up" ? "#ef4444" : tc === "down" ? "#22c55e" : "#aaa";

  return (
    <div className="detail-panel">
      <div className="detail-panel__header">
        <div>
          <div className="detail-panel__city">{city.name}</div>
          <div className="detail-panel__sub">Orange County · CA</div>
        </div>
        <button className="detail-panel__close" onClick={onClose} aria-label="Back">←</button>
      </div>

      {afford && (
        <div className={`detail-panel__badge detail-panel__badge--${afford.cls}`}>
          {afford.label}
        </div>
      )}

      <div className="detail-panel__rent-hero">
        {formatUsd(city.medianRent)}
        <span>/mo median</span>
      </div>
      {rentLow != null && (
        <div className="detail-panel__range">
          range: {formatUsd(rentLow)} – {formatUsd(rentHigh)} <span>(±15%)</span>
        </div>
      )}

      {annualSalary && city.medianRent != null && (
        <AffordabilityBar rent={city.medianRent} annualSalary={annualSalary} />
      )}

      <div className="detail-panel__section-label">Market Snapshot</div>
      <div className="detail-panel__snapshot">
        <div className="detail-snap__cell">
          <span className="detail-snap__label">Median Rent</span>
          <span className="detail-snap__value">{formatUsd(city.medianRent)}</span>
          <span className="detail-snap__sub">ACS 5-Yr</span>
        </div>
        <div className="detail-snap__cell">
          <span className="detail-snap__label">12-Mo Change</span>
          <span className={`detail-snap__value detail-snap__value--${tc}`}>
            {mom != null ? (mom >= 0 ? "+" : "") : ""}{annual12}
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
            {afford ? `${Math.round(afford.pct * 100)}%` : "—"}
          </span>
          <span className="detail-snap__sub">
            {annualSalary ? `${formatUsd(annualSalary)}/yr input` : "enter salary"}
          </span>
        </div>
      </div>

      <div className="detail-panel__section-label">
        12-Month Trend
        <span className="detail-panel__section-meta">BLS CPI estimate</span>
      </div>
      <div className="detail-panel__trend-row">
        <span className={`detail-panel__trend-badge detail-panel__trend-badge--${tc}`}>
          {trendArrow(city.trend || "Flat")}
        </span>
        <span className="detail-panel__trend-stat">{momLabel} MoM · {annual12} 12mo</span>
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
  const momLabel = mom != null ? `${mom >= 0 ? "+" : ""}${mom.toFixed(1)}% MoM` : null;
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
          onClick={(e) => { e.stopPropagation(); onRemove(city.id); }}
          aria-label="Remove"
        >×</button>
      </div>

      {afford ? (
        <div className={`compare-card__badge compare-card__badge--${afford.cls}`}>{afford.label}</div>
      ) : (
        <div className="compare-card__badge compare-card__badge--neutral">No salary entered</div>
      )}

      <div className="compare-card__rents">
        <div className="compare-card__rent-item">
          <span className="compare-card__rent-value">{formatUsd(city.medianRent)}</span>
          <span className="compare-card__rent-label">median/mo</span>
        </div>
        {city.latestRent != null && (
          <div className="compare-card__rent-item">
            <span className="compare-card__rent-value compare-card__rent-value--sub">{formatUsd(city.latestRent)}</span>
            <span className="compare-card__rent-label">latest/mo</span>
          </div>
        )}
      </div>

      {afford && (
        <div className="compare-card__pct">{Math.round(afford.pct * 100)}% of monthly income</div>
      )}

      <div className="compare-card__footer">
        {city.trend && (
          <span className={`compare-card__trend compare-card__trend--${tc}`}>{trendArrow(city.trend)}</span>
        )}
        {momLabel && <span className="compare-card__mom">{momLabel}</span>}
        <span className="compare-card__detail-hint">tap for details →</span>
      </div>
    </div>
  );
}

const geoByName = Object.fromEntries(
  citiesGeo.map((c) => [c.name.toLowerCase(), c])
);

export default function MapPage() {
  const [cityData, setCityData] = useState([]);
  const [compared, setCompared] = useState([]);
  const [detailCity, setDetailCity] = useState(null);
  const [error, setError] = useState(null);
  const [salaryInput, setSalaryInput] = useState("");

  const searchParams = useSearchParams();
  const prePopulated = useRef(false);

  const annualSalary = parseSalary(salaryInput);
  const comparedIds = new Set(compared.map((c) => c.id));

  useEffect(() => {
    graphqlRequest(GET_ALL_CITIES)
      .then((data) => {
        const withCoords = (data.cities || []).flatMap((city) => {
          const geo = geoByName[city.name.toLowerCase()];
          if (!geo) return [];
          return [{ ...city, lat: geo.lat, lng: geo.lng, slug: geo.slug }];
        });
        setCityData(withCoords);
      })
      .catch((err) => setError(err.message));
  }, []);

  useEffect(() => {
    if (prePopulated.current || cityData.length === 0) return;
    prePopulated.current = true;

    const salaryParam = searchParams.get("salary");
    if (salaryParam) setSalaryInput(salaryParam);

    const citiesParam = searchParams.get("cities");
    if (citiesParam) {
      const names = citiesParam.split(",").map((s) => s.trim().toLowerCase());
      const matched = names.flatMap((name) => {
        const city = cityData.find((c) => c.name.toLowerCase() === name);
        return city ? [city] : [];
      });
      if (matched.length > 0) setCompared(matched.slice(0, MAX_COMPARE));
    }
  }, [cityData, searchParams]);

  const handleMarkerClick = useCallback((city) => {
    setCompared((prev) => {
      if (prev.find((c) => c.id === city.id)) return prev;
      if (prev.length >= MAX_COMPARE) return prev;
      return [...prev, city];
    });
  }, []);

  const handleRemove = useCallback((id) => {
    setCompared((prev) => prev.filter((c) => c.id !== id));
    setDetailCity((prev) => prev?.id === id ? null : prev);
  }, []);

  return (
    <div className="map-layout">
      <div className="map-layout__map">
        {error && <div className="map-error">{error}</div>}
        <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ""}>
          <Map
            style={{ width: "100%", height: "100%" }}
            defaultCenter={defaultCenter}
            defaultZoom={defaultZoom}
            minZoom={6}
            mapId={process.env.NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID || "DEMO_MAP_ID"}
            colorScheme="DARK"
          >
            {cityData.map((city) => {
              const afford = affordability(city.medianRent, annualSalary);
              const isSelected = comparedIds.has(city.id);
              const colors = pinColors(afford, isSelected);
              return (
                <AdvancedMarker
                  key={city.id || city.slug}
                  position={{ lat: city.lat, lng: city.lng }}
                  onClick={() => handleMarkerClick(city)}
                  title={city.name}
                >
                  <Pin
                    background={colors.bg}
                    borderColor={colors.border}
                    glyphColor={colors.glyph}
                    scale={isSelected ? 1.25 : 1.0}
                  />
                </AdvancedMarker>
              );
            })}
          </Map>
        </APIProvider>
      </div>

      <div className="map-layout__panel">
        {detailCity ? (
          <CityDetailPanel
            city={detailCity}
            annualSalary={annualSalary}
            onClose={() => setDetailCity(null)}
          />
        ) : (
          <>
            <div className="panel-salary">
              <div className="panel-salary__title">RentSignal</div>
              <label className="panel-salary__label" htmlFor="salary-input">Annual Salary</label>
              <div className="panel-salary__input-row">
                <span className="panel-salary__prefix">$</span>
                <input
                  id="salary-input"
                  className="panel-salary__input"
                  type="text"
                  inputMode="numeric"
                  placeholder="e.g. 80,000"
                  value={salaryInput}
                  onChange={(e) => setSalaryInput(e.target.value)}
                />
              </div>
              {annualSalary && (
                <div className="panel-salary__thresholds">
                  <div className="panel-salary__threshold panel-salary__threshold--good">
                    <span>Recommended</span>
                    <span>≤ {formatUsd(annualSalary * 0.30 / 12)}/mo</span>
                  </div>
                  <div className="panel-salary__threshold panel-salary__threshold--stretch">
                    <span>Stretch</span>
                    <span>≤ {formatUsd(annualSalary * 0.40 / 12)}/mo</span>
                  </div>
                  <div className="panel-salary__threshold panel-salary__threshold--bad">
                    <span>Not Recommended</span>
                    <span>&gt; {formatUsd(annualSalary * 0.40 / 12)}/mo</span>
                  </div>
                </div>
              )}
            </div>

            <div className="panel-compare">
              <div className="panel-compare__header">
                <span className="panel-compare__title">Compare Cities</span>
                <span className="panel-compare__count">{compared.length} / {MAX_COMPARE}</span>
              </div>

              {compared.length === 0 ? (
                <div className="panel-compare__empty">
                  Click up to {MAX_COMPARE} pins on the map to compare cities
                </div>
              ) : (
                <div className="panel-compare__cards">
                  {compared.map((city) => (
                    <CityCompareCard
                      key={city.id}
                      city={city}
                      afford={affordability(city.medianRent, annualSalary)}
                      onRemove={handleRemove}
                      onSelect={() => setDetailCity(city)}
                    />
                  ))}
                </div>
              )}

              {compared.length > 0 && (
                <button className="panel-compare__clear" onClick={() => { setCompared([]); setDetailCity(null); }}>
                  Clear all
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
