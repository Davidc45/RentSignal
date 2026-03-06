"use client";

import { useState, useEffect, useRef } from "react";
import { animate, stagger } from "motion/react";
import CitySelector from "./components/CitySelector";
import HeroCity from "./components/HeroCity";
import "./landing.css";

function FeatureCards({ cards }) {
  const ref = useRef(null);

  useEffect(() => {
    if (!ref.current) return;
    const items = ref.current.querySelectorAll(".landing-feature-card");
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          animate(items, { opacity: 1, y: [40, 0] }, { delay: stagger(0.08), duration: 0.5, easing: [0.25, 1, 0.5, 1] });
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
        <div key={card.title} className="landing-feature-card" style={{ opacity: 0 }}>
          <div className="landing-feature-card__icon">{card.icon}</div>
          <h3 className="landing-feature-card__title">{card.title}</h3>
          <p className="landing-feature-card__desc">{card.desc}</p>
        </div>
      ))}
    </div>
  );
}

const FEATURE_CARDS = [
  { icon: "📍", title: "Side-by-side comparison", desc: "Compare median rent, affordability status, and rent ranges across 3 cities at once." },
  { icon: "📊", title: "Affordability scoring", desc: "Instant Affordable / Stretch / Not Recommended ratings based on the 30% and 40% income rules." },
  { icon: "📈", title: "Rent trend signals", desc: "See if rents in each city are Rising, Flat, or Falling based on BLS CPI housing data." },
  { icon: "🏛️", title: "Government-backed data", desc: "All rent baselines come from the US Census ACS 5-Year survey — not scraped listings." },
];

const PREVIEW_CARDS = [
  { city: "San Francisco", badge: "Not Recommended", badgeClass: "bad", rent: "$3,200", trend: "↑ Rising", trendClass: "up", rule: "55% of income" },
  { city: "Sacramento", badge: "Affordable", badgeClass: "good", rent: "$1,650", trend: "→ Flat", trendClass: "flat", rule: "28% of income", highlight: true },
  { city: "Oakland", badge: "Stretch", badgeClass: "stretch", rent: "$2,400", trend: "↑ Rising", trendClass: "up", rule: "41% of income" },
];

export default function Page() {
  const [selectedCities, setSelectedCities] = useState([]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    (async () => {
      const gsap = (await import("gsap")).default;
      const { ScrambleTextPlugin } = await import("gsap/ScrambleTextPlugin");
      gsap.registerPlugin(ScrambleTextPlugin);
      const el = document.querySelector(".scramble-word");
      const tween = gsap.to(el, {duration: 1, scrambleText:{ text:"-/#$%>", chars:"<&!§8("}, paused: true});
      el.addEventListener("mouseenter", () => tween.play());
      el.addEventListener("mouseleave", () => tween.reverse());
    })();
  }, []);

  return (
    <div className="landing">
      <section className="landing-hero">
        <div className="landing-hero__left">
          <span className="landing-brand">RentSignal</span>
          <div className="landing-hero__eyebrow">California Rent Intelligence</div>
          <h1 className="landing-hero__title">
            Stop <span className="scramble-word">guessing.</span><br />Start comparing.
          </h1>
          <p className="landing-hero__subtitle">
            Compare rent affordability across California cities using real
            government data — not estimates from listing sites.
          </p>
          <div className="landing-hero__search">
            <CitySelector selectedCities={selectedCities} onCitiesChange={setSelectedCities} maxCities={3} />
            <button
              className={`landing-hero__search-btn ${selectedCities.length === 0 ? "landing-hero__search-btn--disabled" : ""}`}
              disabled={selectedCities.length === 0}
            >
              Compare
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </button>
          </div>
          <p className="landing-hero__note">Free · No account needed · Backed by Census ACS + BLS data</p>
        </div>
        <div className="landing-hero__right">
          <HeroCity />
        </div>
      </section>

      <section className="landing-preview">
        <div className="landing-preview__inner">
          {PREVIEW_CARDS.map((card) => (
            <div
              key={card.city}
              className={`landing-preview__card${card.highlight ? " landing-preview__card--highlight" : ""}`}
            >
              <div className="landing-preview__city">{card.city}</div>
              <div className={`landing-preview__badge landing-preview__badge--${card.badgeClass}`}>{card.badge}</div>
              <div className="landing-preview__rent">{card.rent}<span>/mo</span></div>
              <div className={`landing-preview__trend landing-preview__trend--${card.trendClass}`}>{card.trend}</div>
              <div className="landing-preview__rule">{card.rule}</div>
            </div>
          ))}
        </div>
        <p className="landing-preview__caption">Sample comparison · $70k annual income · 1 Bedroom</p>
      </section>

      <section className="landing-stats">
        <div className="landing-stat"><span className="landing-stat__value">60+</span><span className="landing-stat__label">California cities</span></div>
        <div className="landing-stat__divider" />
        <div className="landing-stat"><span className="landing-stat__value">30 / 40%</span><span className="landing-stat__label">Affordability rules</span></div>
        <div className="landing-stat__divider" />
        <div className="landing-stat"><span className="landing-stat__value">ACS 2024</span><span className="landing-stat__label">Census data source</span></div>
        <div className="landing-stat__divider" />
        <div className="landing-stat"><span className="landing-stat__value">BLS CPI</span><span className="landing-stat__label">Rent trend index</span></div>
      </section>

      <div className="landing-bottom-row">
        <section className="landing-how" id="how-it-works">
          <h2 className="landing-section__title landing-section__title--left">How it works</h2>
          <div className="landing-steps">
            {[
              { num: "01", heading: "Pick your cities", desc: "Search and select up to 3 California cities you're considering." },
              { num: "02", heading: "Enter your income", desc: "Add your annual household income and bedroom preference." },
              { num: "03", heading: "See the picture", desc: "Get affordability ratings, rent ranges, and 12-month trend data side by side." },
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
          <h2 className="landing-section__title landing-section__title--left">What you get</h2>
          <FeatureCards cards={FEATURE_CARDS} />
        </section>
      </div>

      <footer className="landing-footer">
        <span className="landing-footer__brand">RentSignal</span>
        <span className="landing-footer__note">
          Data: Census ACS 2024 · BLS CPI Housing Index · Built for California renters
        </span>
      </footer>
    </div>
  );
}
