"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { animate, stagger } from "motion/react";
import CitySelector from "./components/CitySelector";
import HeroCity from "./components/HeroCity";
import { fetchCities } from "./features/cities/citiesThunks";
import {
  selectAllCities,
  selectCitiesStatus,
} from "./features/cities/selectors";
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
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g transform="translate(5, 2)" fillRule="nonzero">
          <path fill="#FF4D00" d="M3.53162364,0.93677136 C5.71648131,-0.332725549 8.40202895,-0.310536831 10.5663829,0.994894436 C12.7094606,2.32691389 14.0119656,4.70417621 13.9999171,7.2614437 C13.9499525,9.80193665 12.5532948,12.19 10.8074726,14.0360916 C9.79983405,15.1064007 8.67261414,16.0528287 7.44884341,16.8560387 C7.32280695,16.9289175 7.18475052,16.9777069 7.04148491,17 C6.90359952,16.9941293 6.76931787,16.9533854 6.65075329,16.8814437 C4.78242676,15.6745675 3.14333538,14.1340363 1.81233196,12.3339613 C0.698588545,10.8313638 0.0658356762,9.01600687 0,7.13441906 L0.00498738283,6.86069219 C0.0959232361,4.40464541 1.42479659,2.16092909 3.53162364,0.93677136 Z M7.90726427,5.03477398 C7.01907148,4.65723455 5.99504406,4.86234968 5.31331796,5.5543476 C4.63159185,6.24634553 4.42664239,7.28872472 4.794164,8.19478048 C5.1616856,9.10083625 6.029182,9.69184263 6.99160428,9.69184862 C7.62210424,9.69637563 8.22818849,9.44382725 8.67481048,8.99047584 C9.12143248,8.53712442 9.37148354,7.92063779 9.36926261,7.27838032 C9.37261286,6.29803506 8.79545706,5.41231342 7.90726427,5.03477398 Z" />
          <ellipse fill="#FF4D00" opacity="0.4" cx="7" cy="19" rx="5" ry="1" />
        </g>
      </svg>
    ),
    title: "Side-by-side comparison",
    desc: "Compare median rent, affordability status, and rent ranges across 3 cities at once.",
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g transform="translate(2, 2)" fill="#FF4D00" fillRule="nonzero">
          <path d="M14.6694,0.0004 C18.0704,0.0004 19.9904,1.9294 20.0004,5.3304 L20.0004,14.6704 C20.0004,18.0704 18.0704,20.0004 14.6694,20.0004 L5.3304,20.0004 C1.9294,20.0004 0.0004,18.0704 0.0004,14.6704 L0.0004,5.3304 C0.0004,1.9294 1.9294,0.0004 5.3304,0.0004 Z M10.5004,4.1304 C10.2194,3.9604 9.8794,3.9604 9.6104,4.1304 C9.3394,4.2994 9.1904,4.6104 9.2194,4.9204 L9.2194,15.1104 C9.2704,15.5404 9.6294,15.8604 10.0494,15.8604 C10.4804,15.8604 10.8394,15.5404 10.8794,15.1104 L10.8794,4.9204 C10.9194,4.6104 10.7704,4.2994 10.5004,4.1304 Z M5.8304,7.4104 C5.5604,7.2404 5.2194,7.2404 4.9504,7.4104 C4.6794,7.5804 4.5304,7.8894 4.5604,8.2004 L4.5604,15.1104 C4.5994,15.5404 4.9594,15.8604 5.3894,15.8604 C5.8204,15.8604 6.1794,15.5404 6.2194,15.1104 L6.2194,8.2004 C6.2504,7.8894 6.0994,7.5804 5.8304,7.4104 Z M15.0894,11.0404 C14.8204,10.8704 14.4804,10.8704 14.2004,11.0404 C13.9294,11.2104 13.7804,11.5094 13.8204,11.8304 L13.8204,15.1104 C13.8604,15.5404 14.2194,15.8604 14.6504,15.8604 C15.0704,15.8604 15.4294,15.5404 15.4804,15.1104 L15.4804,11.8304 C15.5094,11.5094 15.3604,11.2104 15.0894,11.0404 Z" />
        </g>
      </svg>
    ),
    title: "Affordability scoring",
    desc: "Instant Affordable / Stretch / Not Recommended ratings based on the 30% and 40% income rules.",
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M6.91711 14.8539L9.91011 10.9649L13.3241 13.6449L16.2531 9.86487" stroke="#FF4D00" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path fillRule="evenodd" clipRule="evenodd" d="M19.6671 2.34998C20.7291 2.34998 21.5891 3.20998 21.5891 4.27198C21.5891 5.33298 20.7291 6.19398 19.6671 6.19398C18.6051 6.19398 17.7451 5.33298 17.7451 4.27198C17.7451 3.20998 18.6051 2.34998 19.6671 2.34998Z" stroke="#FF4D00" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M20.7555 9.26898C20.8885 10.164 20.9495 11.172 20.9495 12.303C20.9495 19.241 18.6375 21.553 11.6995 21.553C4.76246 21.553 2.44946 19.241 2.44946 12.303C2.44946 5.36598 4.76246 3.05298 11.6995 3.05298C12.8095 3.05298 13.8005 3.11198 14.6825 3.23998" stroke="#FF4D00" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    title: "Rent trend signals",
    desc: "See if rents in each city are Rising, Flat, or Falling based on BLS CPI housing data.",
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g transform="translate(2.5, 2)" fill="#FF4D00" fillRule="nonzero">
          <path d="M6.64373233,18.7821107 L6.64373233,15.7152449 C6.64371685,14.9380902 7.27567036,14.3067075 8.05843544,14.3018198 L10.9326107,14.3018198 C11.7188748,14.3018198 12.3562677,14.9346318 12.3562677,15.7152449 L12.3562677,18.7732212 C12.3562498,19.4472781 12.9040221,19.995083 13.5829406,20 L15.5438266,20 C16.4596364,20.0023291 17.3387522,19.6427941 17.9871692,19.0007051 C18.6355861,18.3586161 19,17.4867541 19,16.5775231 L19,7.86584638 C19,7.13138763 18.6720694,6.43471253 18.1046183,5.96350064 L11.4429783,0.674268354 C10.2785132,-0.250877524 8.61537279,-0.22099178 7.48539114,0.745384082 C7.48539114,0.745384082 0.967012253,5.96350064 0.967012253,5.96350064 C0.37274068,6.42082162 0.0175522924,7.11956262 0,7.86584638 L0,16.5686336 C0,18.463707 1.54738155,20 3.45617342,20 L5.37229029,20 C5.69917279,20.0023364 6.01348703,19.8750734 6.24547302,19.6464237 C6.477459,19.417774 6.60792577,19.1066525 6.60791706,18.7821107 L6.64373233,18.7821107 Z" />
        </g>
      </svg>
    ),
    title: "Government-backed data",
    desc: "All rent baselines come from the US Census ACS 5-Year survey — not scraped listings.",
  },
];


function parseSalary(raw) {
  const n = Number(String(raw).replace(/[^0-9.]/g, ""));
  return Number.isFinite(n) && n > 0 ? n : null;
}

function getBadgeInfo(medianRent, annualSalary) {
  if (medianRent == null) {
    return { label: "No Data", className: "flat", rank: 99 };
  }

  if (annualSalary) {
    const monthly = annualSalary / 12;
    const ratio = medianRent / monthly;
    if (ratio <= 0.30) return { label: "Affordable", className: "good", rank: 1 };
    if (ratio <= 0.40) return { label: "Stretch", className: "stretch", rank: 2 };
    return { label: "Not Recommended", className: "bad", rank: 3 };
  }

  if (medianRent <= 2000) return { label: "Affordable", className: "good", rank: 1 };
  if (medianRent <= 2600) return { label: "Stretch", className: "stretch", rank: 2 };
  return { label: "Not Recommended", className: "bad", rank: 3 };
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

function buildCityCard(city, annualSalary, highlight = false, ruleLabel = "ACS median rent") {
  const badge = getBadgeInfo(city.medianRent, annualSalary);
  const trend = getTrendInfo(city.trend ?? "Flat");

  return {
    city: city.name,
    badge: badge.label,
    badgeClass: badge.className,
    rent: city.medianRent == null ? "N/A" : `$${city.medianRent.toLocaleString()}`,
    trend: trend.label,
    trendClass: trend.className,
    rule: ruleLabel,
    highlight,
    badgeRank: badge.rank,
    medianRent: city.medianRent,
  };
}

export default function Page() {
  const [selectedCities, setSelectedCities] = useState([]);
  const [salaryInput, setSalaryInput] = useState("");

  const router = useRouter();
  const dispatch = useDispatch();
  const cities = useSelector(selectAllCities);
  const citiesStatus = useSelector(selectCitiesStatus);
  const isCitiesLoading = citiesStatus === "loading";

  const annualSalary = parseSalary(salaryInput);

  const mostExpensiveCards = [...cities]
    .filter((city) => city.medianRent != null)
    .sort((a, b) => b.medianRent - a.medianRent)
    .slice(0, 3)
    .map((city) => buildCityCard(city, annualSalary, false, "Highest median rent"));

  const bestValueCards = [...cities]
    .filter((city) => city.medianRent != null)
    .sort((a, b) => {
      const badgeA = getBadgeInfo(a.medianRent, annualSalary);
      const badgeB = getBadgeInfo(b.medianRent, annualSalary);
      if (badgeA.rank !== badgeB.rank) return badgeA.rank - badgeB.rank;
      return a.medianRent - b.medianRent;
    })
    .slice(0, 3)
    .map((city) => buildCityCard(city, annualSalary, false, "Best value pick"));

  useEffect(() => {
    dispatch(fetchCities());
  }, [dispatch]);

  const handleCompareClick = () => {
    const params = new URLSearchParams();
    params.set("cities", selectedCities.join(","));
    if (annualSalary) params.set("salary", String(annualSalary));
    router.push(`/map?${params.toString()}`);
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
            <div className="landing-hero__salary-row">
              <span className="landing-hero__salary-prefix">$</span>
              <input
                className="landing-hero__salary-input"
                type="text"
                inputMode="numeric"
                placeholder="Annual salary (optional)"
                value={salaryInput}
                onChange={(e) => setSalaryInput(e.target.value)}
              />
            </div>
            <button
              className={`landing-hero__search-btn ${
                selectedCities.length === 0
                  ? "landing-hero__search-btn--disabled"
                  : ""
              }`}
              disabled={selectedCities.length === 0}
              onClick={handleCompareClick}
            >
              Compare on Map
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

      <section className="landing-insights">
        <div className="landing-insights__labels">
          <div className="landing-insights__label-group">
            <h2 className="landing-insights__title">Top 3 Most Expensive</h2>
            <p className="landing-insights__subtitle">
              Highest median rent among supported Orange County cities
            </p>
          </div>
          <div className="landing-insights__label-group">
            <h2 className="landing-insights__title">Top 3 Best Value</h2>
            <p className="landing-insights__subtitle">
              Best affordability band first, then lowest median rent
            </p>
          </div>
        </div>

        {isCitiesLoading ? (
          <div className="landing-loading-card">
            <div className="landing-loading-card__spinner" />
            <p className="landing-loading-card__text">Loading ACS data...</p>
          </div>
        ) : (
          <div className="landing-insights__cards">
            {mostExpensiveCards.map((card) => (
              <div key={card.city} className="landing-preview__card">
                <div className="landing-preview__city">{card.city}</div>
                <div className={`landing-preview__badge landing-preview__badge--${card.badgeClass}`}>
                  {card.badge}
                </div>
                <div className="landing-preview__rent">
                  {card.rent}<span>/mo</span>
                </div>
                <div className={`landing-preview__trend landing-preview__trend--${card.trendClass}`}>
                  {card.trend}
                </div>
                <div className="landing-preview__rule">{card.rule}</div>
              </div>
            ))}
            <div className="landing-insights__divider" />
            {bestValueCards.map((card) => (
              <div key={card.city} className="landing-preview__card">
                <div className="landing-preview__city">{card.city}</div>
                <div className={`landing-preview__badge landing-preview__badge--${card.badgeClass}`}>
                  {card.badge}
                </div>
                <div className="landing-preview__rent">
                  {card.rent}<span>/mo</span>
                </div>
                <div className={`landing-preview__trend landing-preview__trend--${card.trendClass}`}>
                  {card.trend}
                </div>
                <div className="landing-preview__rule">{card.rule}</div>
              </div>
            ))}
          </div>
        )}
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