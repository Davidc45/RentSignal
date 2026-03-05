"use client";

import { useState } from "react";
import CitySelector from "./components/CitySelector";

export default function Page() {
  const [selectedCities, setSelectedCities] = useState([]);

  return (
    <main style={{ maxWidth: 600, margin: "40px auto", padding: "0 24px" }}>
      <CitySelector
        selectedCities={selectedCities}
        onCitiesChange={setSelectedCities}
        maxCities={2}
      />
    </main>
  );
}