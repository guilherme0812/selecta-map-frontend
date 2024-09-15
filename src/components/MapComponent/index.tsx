"use client";

import Leaflet from "leaflet";
import { MapContainer, TileLayer } from "react-leaflet";

import "leaflet/dist/leaflet.css";

Leaflet.Icon.Default.imagePath =
  "//cdnjs.cloudflare.com/ajax/libs/leaflet/1.0.0/images/";

function MapComponent() {
  return (
    <div className="relative w-full h-screen">
      <div className="absolute z-10 h-full w-full bg-gray-300">
        <MapContainer
          center={[-26.30209, -48.8477]}
          zoom={13}
          scrollWheelZoom={false}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
        </MapContainer>
      </div>
    </div>
  );
}

export default MapComponent;
