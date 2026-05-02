"use client";

import { useState, useRef, useEffect } from "react";
import "./CitySelector.css";

export default function CitySelector({
  cities = [],
  selectedCities,
  onCitiesChange,
  maxCities = 2,
}) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [highlighted, setHighlighted] = useState(0);
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);

  const cityNames = cities.map((city) => city.name);

  const filtered = cityNames.filter(
    (city) =>
      city.toLowerCase().includes(query.toLowerCase()) &&
      !selectedCities.includes(city)
  );

  const addCity = (city) => {
    if (selectedCities.length < maxCities) {
      const next = [...selectedCities, city];
      onCitiesChange(next);

      if (next.length < maxCities) {
        setIsOpen(true);
      }
    }

    setQuery("");
    inputRef.current?.focus();
  };

  const removeCity = (city) => {
    onCitiesChange(selectedCities.filter((c) => c !== city));
  };

  const handleKeyDown = (e) => {
    if (!isOpen) {
      if (e.key === "ArrowDown" || e.key === "Enter") setIsOpen(true);
      return;
    }

    if (e.key === "ArrowDown") {
      setHighlighted((h) => Math.min(h + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      setHighlighted((h) => Math.max(h - 1, 0));
    } else if (e.key === "Enter" && filtered[highlighted]) {
      addCity(filtered[highlighted]);
    } else if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    setHighlighted(0);
  }, [query]);

  const isMaxReached = selectedCities.length >= maxCities;

  return (
    <div className="city-selector">
      <div className="city-selector__header">
        <label className="city-selector__label"></label>
      </div>

      {selectedCities.length > 0 && (
        <div className="city-selector__chips">
          {selectedCities.map((city) => (
            <span key={city} className="city-chip">
              <span className="city-chip__dot" />
              {city}
              <button
                onClick={() => removeCity(city)}
                className="city-chip__remove"
                aria-label={`Remove ${city}`}
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}

      <div className="city-selector__dropdown-wrapper" ref={dropdownRef}>
        <div
          className={`city-selector__input-box ${
            isOpen ? "city-selector__input-box--open" : ""
          } ${isMaxReached ? "city-selector__input-box--disabled" : ""}`}
        >
          <svg
            className="city-selector__search-icon"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>

          <input
            ref={inputRef}
            type="text"
            value={query}
            disabled={isMaxReached}
            placeholder={
              isMaxReached
                ? `Max ${maxCities} cities selected`
                : "Search Orange County cities..."
            }
            className="city-selector__input"
            onChange={(e) => {
              setQuery(e.target.value);
              setIsOpen(true);
            }}
            onFocus={() => !isMaxReached && setIsOpen(true)}
            onKeyDown={handleKeyDown}
          />

          {query && (
            <button
              onClick={() => {
                setQuery("");
                inputRef.current?.focus();
              }}
              className="city-selector__clear"
            >
              ×
            </button>
          )}
        </div>

        {isOpen && !isMaxReached && (
          <div className="city-selector__dropdown">
            {filtered.length === 0 ? (
              <div className="city-selector__empty">
                No cities found for &ldquo;{query}&rdquo;
              </div>
            ) : (
              <ul className="city-selector__list">
                {filtered.map((city, i) => (
                  <li
                    key={city}
                    onMouseDown={() => addCity(city)}
                    onMouseEnter={() => setHighlighted(i)}
                    className={`city-selector__option ${
                      i === highlighted
                        ? "city-selector__option--highlighted"
                        : ""
                    }`}
                  >
                    <svg
                      className="city-selector__pin-icon"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                    {city}
                    <span className="city-selector__state-label">CA</span>
                  </li>
                ))}
              </ul>
            )}
            <div className="city-selector__footer">
              {filtered.length} cities available
            </div>
          </div>
        )}
      </div>
    </div>
  );
}