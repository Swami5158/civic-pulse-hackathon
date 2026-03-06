import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, Circle } from 'react-leaflet';
import L from 'leaflet';

// Use CDN for marker icons to avoid build issues
const iconUrl = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png';
const shadowUrl = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
    iconUrl,
    shadowUrl,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

interface MapPickerProps {
  onLocationSelect: (lat: number, lng: number) => void;
  initialPos?: [number, number];
  clusters?: any[];
}

function LocationMarker({ position, setPosition, onLocationSelect }: { 
  position: [number, number], 
  setPosition: (pos: [number, number]) => void,
  onLocationSelect: (lat: number, lng: number) => void 
}) {
  useMapEvents({
    click(e) {
      setPosition([e.latlng.lat, e.latlng.lng]);
      onLocationSelect(e.latlng.lat, e.latlng.lng);
    },
  });

  return position === null ? null : (
    /* @ts-ignore */
    <Marker position={position} icon={DefaultIcon}></Marker>
  );
}

export default function MapPicker({ onLocationSelect, initialPos = [18.5204, 73.8567], clusters = [] }: MapPickerProps) {
  const [position, setPosition] = useState<[number, number]>(initialPos);

  return (
    <div className="h-[300px] w-full rounded-xl overflow-hidden border border-black/10 shadow-sm relative">
      {/* @ts-ignore */}
      <MapContainer 
        center={initialPos} 
        zoom={13} 
        scrollWheelZoom={false} 
        style={{ height: '100%', width: '100%' }}
      >
        {/* @ts-ignore */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <LocationMarker position={position} setPosition={setPosition} onLocationSelect={onLocationSelect} />
        {clusters.map((cluster, idx) => (
          /* @ts-ignore */
          <Circle 
            key={idx}
            center={[cluster.center.lat, cluster.center.lng]}
            radius={500}
            pathOptions={{ color: 'red', fillColor: 'red', fillOpacity: 0.2 }}
          />
        ))}
      </MapContainer>
      <div className="absolute bottom-2 right-2 z-[1000] bg-white/90 backdrop-blur px-2 py-1 rounded text-[10px] font-mono text-black/50">
        Click to set location
      </div>
    </div>
  );
}
