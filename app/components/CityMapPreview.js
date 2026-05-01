"use client";

import React, { useMemo } from "react";
import { APIProvider, Map, AdvancedMarker, Pin } from "@vis.gl/react-google-maps";
import {
  GOOGLE_MAPS_API_KEY,
  GOOGLE_MAPS_MAP_ID,
} from "../api/clientConfig";
import citiesGeo from "../../data/cities";

const defaultCenter = { lat: 33.65, lng: -117.85 };
const defaultZoom = 10;

function affordability(rent, annualSalary) {
  if (!annualSalary || rent == null) return null;

  const monthly = annualSalary / 12;
  const pct = rent / monthly;

  if (pct <= 0.30) return { label: "Affordable", cls: "good", pct };
  if (pct <= 0.40) return { label: "Stretch", cls: "stretch", pct };
  return { label: "Not Recommended", cls: "bad", pct };
}

function pinColors(afford, isSelected) {
  if (isSelected) {
    return {
      bg: "#1a0800",
      border: "#FF4D00",
      glyph: "#ffffff",
    };
  }

  if (afford) {
    if (afford.cls === "good") {
      return {
        bg: "#052e16",
        border: "#22c55e",
        glyph: "#22c55e",
      };
    }

    if (afford.cls === "stretch") {
      return {
        bg: "#1c1500",
        border: "#eab308",
        glyph: "#eab308",
      };
    }

    return {
      bg: "#2d0a0a",
      border: "#ef4444",
      glyph: "#ef4444",
    };
  }

  return {
    bg: "#1a0800",
    border: "#FF4D00",
    glyph: "#FF4D00",
  };
}

export default function CityMapPreview({
  cities = [],
  annualSalary = null,
  selectedCities = [],
  onCityClick,
}) {
  const geoByName = useMemo(() => {
    return Object.fromEntries(
      citiesGeo.map((city) => [city.name.toLowerCase(), city])
    );
  }, []);

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
  }, [cities, geoByName]);

  const selectedNameSet = useMemo(() => {
    return new Set((selectedCities || []).map((name) => String(name).toLowerCase()));
  }, [selectedCities]);

  return (
    <div className="landing-map-preview">
      <APIProvider
        apiKey={GOOGLE_MAPS_API_KEY}
        onLoad={() => console.log("Maps API has loaded.")}
      >
        <Map
          style={{ width: "100%", height: "100%" }}
          defaultCenter={defaultCenter}
          defaultZoom={defaultZoom}
          minZoom={9}
          maxZoom={13}
          mapId={GOOGLE_MAPS_MAP_ID}
        >
          {cityData.map((city) => {
            const afford = affordability(city.medianRent, annualSalary);
            const isSelected = selectedNameSet.has(city.name.toLowerCase());
            const colors = pinColors(afford, isSelected);

            return (
              <AdvancedMarker
                key={city.id || city.slug || city.name}
                position={{ lat: city.lat, lng: city.lng }}
                onClick={() => onCityClick?.(city)}
                title={city.name}
              >
                <Pin
                  background={colors.bg}
                  borderColor={colors.border}
                  glyphColor={colors.glyph}
                  scale={isSelected ? 1.2 : 1}
                />
              </AdvancedMarker>
            );
          })}
        </Map>
      </APIProvider>
    </div>
  );
}