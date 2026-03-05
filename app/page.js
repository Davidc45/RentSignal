"use client";

import { useState } from "react";
import CitySelector from "./components/CitySelector";
import "./landing.css";

export default function Page() {
  const [selectedCities, setSelectedCities] = useState([]);

  return (
    <div className="landing">
      <nav className="landing-nav">
        <a href="#" className="landing-nav__logo">RentSignal</a>
        <div className="landing-nav__links">
          <a href="#how-it-works" className="landing-nav__link">How it works</a>
          <a href="#features" className="landing-nav__link">Features</a>
        </div>
      </nav>

      <section className="landing-hero">
        <div className="landing-hero__eyebrow">California Rent Intelligence</div>
        <h1 className="landing-hero__title">
          Stop guessing.<br />Start comparing.
        </h1>
        <p className="landing-hero__subtitle">
          Compare rent affordability across California cities using real
          government data — not estimates from listing sites.
        </p>

        <div className="landing-hero__search">
          <CitySelector
            selectedCities={selectedCities}
            onCitiesChange={setSelectedCities}
            maxCities={3}
          />
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

        <p className="landing-hero__note">
          Free · No account needed · Backed by Census ACS + BLS data
        </p>
      </section>

      <section className="landing-preview">
        <div className="landing-preview__inner">
          <div className="landing-preview__card">
            <div className="landing-preview__city">San Francisco</div>
            <div className="landing-preview__badge landing-preview__badge--bad">Not Recommended</div>
            <div className="landing-preview__rent">$3,200<span>/mo</span></div>
            <div className="landing-preview__trend landing-preview__trend--up">↑ Rising</div>
            <div className="landing-preview__rule">55% of income</div>
          </div>
          <div className="landing-preview__card landing-preview__card--highlight">
            <div className="landing-preview__city">Sacramento</div>
            <div className="landing-preview__badge landing-preview__badge--good">Affordable</div>
            <div className="landing-preview__rent">$1,650<span>/mo</span></div>
            <div className="landing-preview__trend landing-preview__trend--flat">→ Flat</div>
            <div className="landing-preview__rule">28% of income</div>
          </div>
          <div className="landing-preview__card">
            <div className="landing-preview__city">Oakland</div>
            <div className="landing-preview__badge landing-preview__badge--stretch">Stretch</div>
            <div className="landing-preview__rent">$2,400<span>/mo</span></div>
            <div className="landing-preview__trend landing-preview__trend--up">↑ Rising</div>
            <div className="landing-preview__rule">41% of income</div>
          </div>
        </div>
        <p className="landing-preview__caption">Sample comparison · $70k annual income · 1 Bedroom</p>
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

      <section className="landing-how" id="how-it-works">
        <h2 className="landing-section__title">How it works</h2>
        <div className="landing-steps">
          <div className="landing-step">
            <div className="landing-step__number">01</div>
            <h3 className="landing-step__heading">Pick your cities</h3>
            <p className="landing-step__desc">
              Search and select up to 3 California cities you're considering.
            </p>
          </div>
          <div className="landing-step__arrow">→</div>
          <div className="landing-step">
            <div className="landing-step__number">02</div>
            <h3 className="landing-step__heading">Enter your income</h3>
            <p className="landing-step__desc">
              Add your annual household income and bedroom preference.
            </p>
          </div>
          <div className="landing-step__arrow">→</div>
          <div className="landing-step">
            <div className="landing-step__number">03</div>
            <h3 className="landing-step__heading">See the picture</h3>
            <p className="landing-step__desc">
              Get affordability ratings, rent ranges, and 12-month trend data side by side.
            </p>
          </div>
        </div>
      </section>

      <section className="landing-features" id="features">
        <h2 className="landing-section__title">What you get</h2>
        <div className="landing-feature-grid">
          <div className="landing-feature-card">
            <div className="landing-feature-card__icon">📍</div>
            <h3 className="landing-feature-card__title">Side-by-side comparison</h3>
            <p className="landing-feature-card__desc">
              Compare median rent, affordability status, and rent ranges across 3 cities at once.
            </p>
          </div>
          <div className="landing-feature-card">
            <div className="landing-feature-card__icon">📊</div>
            <h3 className="landing-feature-card__title">Affordability scoring</h3>
            <p className="landing-feature-card__desc">
              Instant Affordable / Stretch / Not Recommended ratings based on the 30% and 40% income rules.
            </p>
          </div>
          <div className="landing-feature-card">
            <div className="landing-feature-card__icon">📈</div>
            <h3 className="landing-feature-card__title">Rent trend signals</h3>
            <p className="landing-feature-card__desc">
              See if rents in each city are Rising, Flat, or Falling based on BLS CPI housing data.
            </p>
          </div>
          <div className="landing-feature-card">
            <div className="landing-feature-card__icon">🏛️</div>
            <h3 className="landing-feature-card__title">Government-backed data</h3>
            <p className="landing-feature-card__desc">
              All rent baselines come from the US Census ACS 5-Year survey — not scraped listings.
            </p>
          </div>
        </div>
      </section>

      <footer className="landing-footer">
        <span className="landing-footer__brand">RentSignal</span>
        <span className="landing-footer__note">
          Data: Census ACS 2024 · BLS CPI Housing Index · Built for California renters
        </span>
      </footer>
    </div>
  );
}
