import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import CCTVDialog from './CCTVDialog';
import 'leaflet/dist/leaflet.css';

// Bot interface matching CSV structure
interface Bot {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  address: string;
  status: 'operational' | 'not-operational' | 'repairing' | 'active-fire';
  lastActivity: Date;
  temperature?: number;
  humidity?: number;
  waterCannonStatus: boolean;
  heatSensor: boolean;
  flameSensor: boolean;
  cameraSensor: boolean;
  batteryLevel?: number;
  charging: boolean;
}

interface BotMapProps {
  bots?: Bot[];
}

// Parse CSV helper function
const parseCSV = (csv: string): Bot[] => {
  const lines = csv.split('\n').filter(line => line.trim());
  const headers = lines[0].split(',').map(h => h.trim());
  
  return lines.slice(1).map(line => {
    const values: string[] = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        values.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    values.push(current.trim());
    
    const obj: any = {};
    headers.forEach((header, index) => {
      obj[header] = values[index]?.replace(/"/g, '') || '';
    });
    
    return {
      id: obj.id,
      name: obj.name,
      latitude: parseFloat(obj.latitude),
      longitude: parseFloat(obj.longitude),
      address: obj.address,
      status: obj.status as 'operational' | 'not-operational' | 'repairing' | 'active-fire',
      lastActivity: new Date(obj.lastActivity),
      temperature: obj.temperature && obj.temperature !== '' ? parseFloat(obj.temperature) : undefined,
      humidity: obj.humidity && obj.humidity !== '' ? parseFloat(obj.humidity) : undefined,
      waterCannonStatus: obj.waterCannonStatus === 'true',
      heatSensor: obj.heatSensor === 'true',
      flameSensor: obj.flameSensor === 'true',
      cameraSensor: obj.cameraSensor === 'true',
      batteryLevel: obj.batteryLevel && obj.batteryLevel !== '' ? parseFloat(obj.batteryLevel) : 0,
      charging: obj.charging === 'true'
    };
  });
};

const BotMap = ({ bots: propBots }: BotMapProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const [selectedBot, setSelectedBot] = useState<Bot | null>(null);
  const [cctvOpen, setCctvOpen] = useState(false);
  const [bots, setBots] = useState<Bot[]>(propBots || []);

  // Load bots from CSV if not provided as props
  useEffect(() => {
    if (propBots && propBots.length > 0) {
      setBots(propBots);
      return;
    }

    fetch('/data/bots.csv')
      .then(response => response.text())
      .then(csv => {
        const parsedBots = parseCSV(csv);
        setBots(parsedBots);
      })
      .catch(error => console.error('Error loading bots:', error));
  }, [propBots]);

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
    const createBotIcon = (status: Bot['status']) => {
      let color: string;
      let pulseClass = '';
      
      switch (status) {
        case 'operational':
          color = '#10b981'; // green
          break;
        case 'active-fire':
          color = '#ef4444'; // red
          pulseClass = 'animate-pulse';
          break;
        case 'not-operational':
          color = '#6b7280'; // gray
          break;
        case 'repairing':
          color = '#eab308'; // yellow
          pulseClass = 'animate-pulse';
          break;
        default:
          color = '#6b7280';
      }
      
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

      const getStatusColor = (status: Bot['status']) => {
        switch (status) {
          case 'operational': return 'bg-green-500';
          case 'active-fire': return 'bg-red-500';
          case 'not-operational': return 'bg-gray-500';
          case 'repairing': return 'bg-yellow-500';
          default: return 'bg-gray-500';
        }
      };

      const getStatusLabel = (status: Bot['status']) => {
        switch (status) {
          case 'operational': return 'Operational';
          case 'active-fire': return 'Active Fire';
          case 'not-operational': return 'Not Operational';
          case 'repairing': return 'Repairing';
          default: return status;
        }
      };

      const popupContent = `
        <div class="text-sm">
          <div class="font-bold text-base mb-1">${bot.name}</div>
          <div class="flex items-center gap-2 mb-1">
            <span class="inline-block w-2 h-2 rounded-full ${getStatusColor(bot.status)}"></span>
            <span class="font-medium">${getStatusLabel(bot.status)}</span>
          </div>
          <div class="text-xs text-gray-600 mt-1">
            Battery: ${bot.batteryLevel || 0}%${bot.charging ? ' (Charging)' : ''}
          </div>
          ${bot.status === 'operational' || bot.status === 'active-fire'
            ? `<button class="mt-2 w-full bg-green-600 hover:bg-green-700 text-white text-xs font-medium py-1 px-2 rounded" onclick="window.openCCTV_${bot.id.replace(/-/g, '_')}()">
                📹 View CCTV Feed
              </button>`
            : `<div class="mt-2 text-xs text-gray-500 text-center py-1">CCTV Offline</div>`
          }
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
