import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { FireBot } from '@/types/bot';
import 'leaflet/dist/leaflet.css';

interface BotMapProps {
  bots: FireBot[];
}

// Create custom icons for active and inactive bots
const createBotIcon = (status: 'active' | 'inactive') => {
  const color = status === 'active' ? '#ef4444' : '#10b981';
  const svgIcon = `
    <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
      <circle cx="16" cy="16" r="14" fill="${color}" stroke="white" stroke-width="2"/>
      <circle cx="16" cy="16" r="6" fill="white"/>
    </svg>
  `;
  
  return L.icon({
    iconUrl: `data:image/svg+xml;base64,${btoa(svgIcon)}`,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16],
  });
};

const BotMap = ({ bots }: BotMapProps) => {
  // Center on San Francisco
  const center: L.LatLngExpression = [37.7749, -122.4194];

  return (
    <div className="h-full w-full rounded-lg overflow-hidden border border-border">
      <MapContainer
        center={center}
        zoom={13}
        className="h-full w-full"
        scrollWheelZoom={true}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        {bots.map((bot) => (
          <Marker
            key={bot.id}
            position={[bot.latitude, bot.longitude] as L.LatLngExpression}
            icon={createBotIcon(bot.status)}
          >
            <Popup>
              <div className="text-sm">
                <div className="font-bold text-base mb-1">{bot.name}</div>
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className={`inline-block w-2 h-2 rounded-full ${
                      bot.status === 'active' ? 'bg-red-500' : 'bg-green-500'
                    }`}
                  />
                  <span className="capitalize font-medium">{bot.status}</span>
                </div>
                {bot.status === 'active' && bot.lastActive && (
                  <div className="text-xs text-gray-600 mt-1">
                    Last Active: {bot.lastActive}
                  </div>
                )}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default BotMap;
