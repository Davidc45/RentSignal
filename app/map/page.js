"use client";

import React from "react";
import { APIProvider, Map } from "@vis.gl/react-google-maps";

const defaultCenter = { lat: 37.5, lng: -119.5 };
const defaultZoom = 6;

export default function MapPage() {
  return (
    <div className="flex flex-col h-screen">
      <div className="flex-1">
        <APIProvider
          apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ""}
          onLoad={() => console.log("Maps API has loaded.")}
        >
          <Map
            style={{ width: "100%", height: "100%" }}
            defaultCenter={defaultCenter}
            defaultZoom={defaultZoom}
            minZoom={6}
            onCameraChanged={(ev) =>
              console.log("camera changed:", ev.detail.center, "zoom:", ev.detail.zoom)
            }
          />
        </APIProvider>
      </div>
    </div>
  );
}
