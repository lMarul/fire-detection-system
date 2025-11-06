import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { FireBot } from '@/types/bot';
import CCTVDialog from './CCTVDialog';
import 'leaflet/dist/leaflet.css';

interface BotMapProps {
  bots: FireBot[];
}

const BotMap = ({ bots }: BotMapProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const [selectedBot, setSelectedBot] = useState<FireBot | null>(null);
  const [cctvOpen, setCctvOpen] = useState(false);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    // Initialize map - Pasay City, Barangay 165
    const map = L.map(mapRef.current).setView([14.5329, 121.0066], 15);

    // Add tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!mapInstanceRef.current) return;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    // Create custom icons
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

    // Add markers for each bot
    bots.forEach((bot) => {
      const marker = L.marker([bot.latitude, bot.longitude], {
        icon: createBotIcon(bot.status),
      }).addTo(mapInstanceRef.current!);

      const popupContent = `
        <div class="text-sm">
          <div class="font-bold text-base mb-1">${bot.name}</div>
          <div class="flex items-center gap-2 mb-1">
            <span class="inline-block w-2 h-2 rounded-full ${
              bot.status === 'active' ? 'bg-red-500' : 'bg-green-500'
            }"></span>
            <span class="capitalize font-medium">${bot.status}</span>
          </div>
          ${bot.status === 'active' && bot.lastActive 
            ? `<div class="text-xs text-gray-600 mt-1">Last Active: ${bot.lastActive}</div>` 
            : ''}
          <button class="mt-2 w-full bg-green-600 hover:bg-green-700 text-white text-xs font-medium py-1 px-2 rounded" onclick="window.openCCTV_${bot.id.replace(/-/g, '_')}()">
            📹 View CCTV Feed
          </button>
        </div>
      `;

      marker.bindPopup(popupContent);
      
      // Add click handler for CCTV
      (window as any)[`openCCTV_${bot.id.replace(/-/g, '_')}`] = () => {
        // Close the popup when opening CCTV
        marker.closePopup();
        setSelectedBot(bot);
        setCctvOpen(true);
      };

      markersRef.current.push(marker);
    });
  }, [bots]);

  return (
    <>
      <div 
        ref={mapRef} 
        className="h-full w-full rounded-lg overflow-hidden border border-border"
        style={{ minHeight: '500px' }}
      />
      <CCTVDialog 
        bot={selectedBot}
        open={cctvOpen}
        onOpenChange={setCctvOpen}
      />
    </>
  );
};

export default BotMap;
