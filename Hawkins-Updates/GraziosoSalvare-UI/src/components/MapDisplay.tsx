import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import type { Animal } from '../services/api';

// Fix leafet default icon issue in React
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

function ChangeView({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center, map]);
  return null;
}

interface MapDisplayProps {
  animal: Animal | null;
}

export default function MapDisplay({ animal }: MapDisplayProps) {
  const defaultCenter: [number, number] = [30.2672, -97.7431]; // Default to Austin, TX or somewhere
  const center: [number, number] = animal?.locationLat && animal?.locationLong 
    ? [animal.locationLat, animal.locationLong] 
    : defaultCenter;

  return (
    <div className="bg-slate-900/40 backdrop-blur-md border border-white/5 rounded-3xl p-6 shadow-xl shadow-black/30 h-full min-h-[400px] flex flex-col">
      <h2 className="text-xl font-bold text-slate-100 mb-4">
        Location {animal ? `- ${animal.name || animal.animalId}` : ''}
      </h2>
      <div className="flex-1 rounded-xl overflow-hidden border border-white/10 z-0 relative">
        <MapContainer center={center} zoom={13} style={{ height: '100%', width: '100%', minHeight: '300px' }}>
          <ChangeView center={center} />
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {animal?.locationLat && animal?.locationLong && (
            <Marker position={[animal.locationLat, animal.locationLong]}>
              <Popup>
                <strong>{animal.name || animal.animalId}</strong><br />
                {animal.animalType} - {animal.breed}
              </Popup>
            </Marker>
          )}
        </MapContainer>
      </div>
    </div>
  );
}
