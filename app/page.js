"use client";

import { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { animate, stagger } from "motion/react";
import CitySelector from "./components/CitySelector";
import HeroCity from "./components/HeroCity";
import { fetchCities } from "./features/cities/citiesThunks";
import { selectAllCities } from "./features/cities/acsSelectors";
import { fetchCityTrends } from "./features/cityTrends/cityTrendsThunks";
import { selectAllCityTrends } from "./features/cityTrends/zillowSelectors";
import CompareChart from "./components/CompareChart";
import "./landing.css";

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
    desc: "See if rents in each city are Rising, Flat, or Falling based on BLS CPI housing data.",
  },
  {
    icon: "🏛️",
    title: "Government-backed data",
    desc: "All rent baselines come from the US Census ACS 5-Year survey — not scraped listings.",
  },
];

export default function Page() {
  const [selectedCities, setSelectedCities] = useState([]);
  const [compareRequested, setCompareRequested] = useState(false);

  const dispatch = useDispatch();
  const cities = useSelector(selectAllCities);
  const cityTrends = useSelector(selectAllCityTrends);

  const previewCityNames =
    selectedCities.length > 0
      ? selectedCities
      : ["Aliso Viejo", "Anaheim", "Brea"];

  const previewCards = previewCityNames
    .map((targetName) => {
      const city = cities.find((c) => c.name === targetName);
      const trendData = cityTrends.find((t) => t.name === targetName);

      if (!city) return null;

      const trend = trendData?.trend ?? "Flat";

      return {
        city: city.name,
        badge:
          city.medianRent == null
            ? "No Data"
            : city.medianRent <= 2000
            ? "Affordable"
            : city.medianRent <= 2600
            ? "Stretch"
            : "Not Recommended",
        badgeClass:
          city.medianRent == null
            ? "flat"
            : city.medianRent <= 2000
            ? "good"
            : city.medianRent <= 2600
            ? "stretch"
            : "bad",
        rent:
          city.medianRent == null
            ? "N/A"
            : `$${city.medianRent.toLocaleString()}`,
        trend:
          trend === "Rising"
            ? "↑ Rising"
            : trend === "Falling"
            ? "↓ Falling"
            : "→ Flat",
        trendClass:
          trend === "Rising"
            ? "up"
            : trend === "Falling"
            ? "down"
            : "flat",
        rule: "GraphQL test data",
        highlight:
          selectedCities.length > 0
            ? city.name === selectedCities[0]
            : city.name === "Anaheim",
      };
    })
    .filter(Boolean);

  useEffect(() => {
    dispatch(fetchCities());
  }, [dispatch]);

  useEffect(() => {
    dispatch(fetchCityTrends());
  }, [dispatch]);

  const handleCompareClick = () => {
    setCompareRequested(true);
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
          <div className="landing-hero__search">
            <CitySelector
              cities={cities}
              selectedCities={selectedCities}
              onCitiesChange={setSelectedCities}
              maxCities={3}
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
          </div>
          <p className="landing-hero__note">
            Free · No account needed · Backed by Census ACS + BLS data
          </p>
        </div>
        <div className="landing-hero__right">
          <HeroCity />
        </div>
      </section>

      {compareRequested && selectedCities.length > 0 && (
        <CompareChart cities={cities} selectedCities={selectedCities} />
      )}

      <section className="landing-preview">
        <div className="landing-preview__inner">
          {previewCards.map((card) => (
            <div
              key={card.city}
              className={`landing-preview__card${
                card.highlight ? " landing-preview__card--highlight" : ""
              }`}
            >
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
          ))}
        </div>
        <p className="landing-preview__caption">
          Sample comparison · $70k annual income · 1 Bedroom
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
          <span className="landing-stat__value">BLS CPI</span>
          <span className="landing-stat__label">Rent trend index</span>
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
                desc: "Search and select up to 3 California cities you're considering.",
              },
              {
                num: "02",
                heading: "Enter your income",
                desc: "Add your annual household income and bedroom preference.",
              },
              {
                num: "03",
                heading: "See the picture",
                desc: "Get affordability ratings, rent ranges, and 12-month trend data side by side.",
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
          Data: Census ACS 2024 · BLS CPI Housing Index · Built for California
          renters
        </span>
      </footer>
    </div>
  );
}