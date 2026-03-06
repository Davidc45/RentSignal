"use client";

import "./HeroCity.css";

function Building({ className }) {
  return (
    <ul className={`building ${className}`}>
      <li className="top" />
      <li className="west" />
      <li className="north" />
      <li className="east" />
      <li className="south" />
    </ul>
  );
}

function Car({ className }) {
  return (
    <ul className={`car ${className}`}>
      <li className="roof" />
      <li className="door-left" />
      <li className="front" />
      <li className="door-right" />
      <li className="trunk" />
    </ul>
  );
}

export default function HeroCity() {
  return (
    <div className="hero-cube">
      <div className="world">
        <h1 className="ground" />
        <Building className="block-1" />
        <Building className="block-2" />
        <Building className="block-3" />
        <Building className="block-4" />
        <Building className="block-5" />
        <Building className="block-6" />
        <Building className="block-7" />
        <Building className="block-8" />
        <Building className="block-9" />
        <Building className="block-10" />
        <Building className="block-11" />
        <Car className="car-1" />
        <Car className="car-2" />
        <Car className="car-3" />
        <p className="road road-1" />
        <p className="road road-2" />
        <p className="road road-3" />
      </div>
    </div>
  );
}
