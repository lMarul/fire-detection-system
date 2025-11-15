import { useState, useEffect } from 'react';
import Navigation from '@/components/Navigation';
import BotMap from '@/components/BotMap';
import BotStatusCard from '@/components/BotStatusCard';
import { FireAlertDialog } from '@/components/FireAlertDialog';
import { useFireDetection } from '@/contexts/FireDetectionContext';
import { SensorData } from '@/lib/fireDetectionLogic';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, CheckCircle, Shield, Wifi, WifiOff, Wrench, XCircle } from 'lucide-react';
import { toast } from 'sonner';

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
  acousticExtinguisherStatus: boolean;
  heatSensor: boolean;
  flameSensor: boolean;
  cameraSensor: boolean;
  batteryLevel?: number;
  charging: boolean;
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
      acousticExtinguisherStatus: obj.waterCannonStatus === 'true',
      heatSensor: obj.heatSensor === 'true',
      flameSensor: obj.flameSensor === 'true',
      cameraSensor: obj.cameraSensor === 'true',
      batteryLevel: obj.batteryLevel && obj.batteryLevel !== '' ? parseFloat(obj.batteryLevel) : 0,
      charging: obj.charging === 'true'
    };
  });
};

const Dashboard = () => {
  const [bots, setBots] = useState<Bot[]>([]);
  const { activeFireEvents, triggerFireDetection } = useFireDetection();
  const [openDialogs, setOpenDialogs] = useState<Record<string, boolean>>({});
  const [shownDialogs, setShownDialogs] = useState<Set<string>>(new Set());

  // Load bots from CSV file
  useEffect(() => {
    fetch('/data/bots.csv')
      .then(response => response.text())
      .then(csv => {
        const parsedBots = parseCSV(csv);
        setBots(parsedBots);
      })
      .catch(error => console.error('Error loading bots:', error));
  }, []);

  // Enter key handler - Auto trigger FireBot Delta
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === 'Enter') {
        const deltaBot = bots.find(b => b.id === 'bot-delta' || b.name === 'FireBot Delta');
        if (deltaBot) {
          const sensors: SensorData = {
            heatSensor: true,
            flameSensor: true,
            visualDetected: true,
            temperature: 650
          };
          triggerFireDetection(deltaBot.id, deltaBot as any, sensors);
          toast.success('🔥 Fire alert triggered for FireBot Delta');
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [bots, triggerFireDetection]);

  // Auto-open dialogs for new fire events (only once per event)
  useEffect(() => {
    activeFireEvents.forEach((event, botId) => {
      if (!shownDialogs.has(botId)) {
        setOpenDialogs(prev => ({ ...prev, [botId]: true }));
        setShownDialogs(prev => new Set(prev).add(botId));
      }
    });
    
    // Clean up shown dialogs for resolved fires
    const activeIds = new Set(activeFireEvents.keys());
    setShownDialogs(prev => {
      const updated = new Set(prev);
      prev.forEach(id => {
        if (!activeIds.has(id)) {
          updated.delete(id);
        }
      });
      return updated;
    });
  }, [activeFireEvents]);

  // Update bot statuses based on active fire events
  useEffect(() => {
    setBots(prevBots => {
      return prevBots.map(bot => {
        const hasActiveFire = activeFireEvents.has(bot.id);
        // Only update status if there's a change
        if (hasActiveFire && bot.status !== 'active-fire') {
          return { ...bot, status: 'active-fire' as const };
        } else if (!hasActiveFire && bot.status === 'active-fire') {
          // Return to operational when fire is resolved
          return { ...bot, status: 'operational' as const };
        }
        return bot;
      });
    });
  }, [activeFireEvents]);

  const operationalBots = bots.filter((bot) => bot.status === 'operational');
  const activeFireBots = bots.filter((bot) => bot.status === 'active-fire');
  const maintenanceBots = bots.filter((bot) => bot.status === 'not-operational' || bot.status === 'repairing');

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-4 py-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total Bots</p>
                <p className="text-3xl font-bold">{bots.length}</p>
              </div>
              <Shield className="h-10 w-10 text-primary" />
            </div>
          </Card>

          <Card className="p-6 border-green-500/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Operational</p>
                <p className="text-3xl font-bold text-green-500">{operationalBots.length}</p>
              </div>
              <CheckCircle className="h-10 w-10 text-green-500" />
            </div>
          </Card>

          <Card className="p-6 border-destructive/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Active Fire</p>
                <p className="text-3xl font-bold text-destructive">{activeFireBots.length}</p>
              </div>
              <AlertCircle className="h-10 w-10 text-destructive" />
            </div>
          </Card>

          <Card className="p-6 border-yellow-500/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Maintenance</p>
                <p className="text-3xl font-bold text-yellow-500">{maintenanceBots.length}</p>
              </div>
              <Wrench className="h-10 w-10 text-yellow-500" />
            </div>
          </Card>
        </div>

        {/* Fire Alert Dialogs */}
        {Array.from(activeFireEvents.entries()).map(([botId, event]) => (
          <FireAlertDialog
            key={botId}
            botId={botId}
            botName={event.botName}
            open={openDialogs[botId] || false}
            onOpenChange={(open) => setOpenDialogs(prev => ({ ...prev, [botId]: open }))}
          />
        ))}

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Map */}
          <div className="lg:col-span-2">
            <Card className="p-4">
              <h2 className="text-xl font-bold mb-4">Bot Deployment Map</h2>
              <div className="h-[500px]">
                <BotMap />
              </div>
            </Card>
          </div>

          {/* Bot List */}
          <div className="lg:col-span-1">
            <Card className="p-4">
              <h2 className="text-xl font-bold mb-4">Bot Status</h2>
              <div className="space-y-3 max-h-[500px] overflow-y-auto">
                {activeFireBots.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-destructive mb-2 flex items-center gap-2">
                      <AlertCircle className="h-4 w-4" />
                      Active Fire ({activeFireBots.length})
                    </h3>
                    <div className="space-y-2">
                      {activeFireBots.map((bot) => (
                        <BotStatusCard key={bot.id} bot={bot} />
                      ))}
                    </div>
                  </div>
                )}
                
                {operationalBots.length > 0 && (
                  <div className="mt-4">
                    <h3 className="text-sm font-semibold text-green-500 mb-2 flex items-center gap-2">
                      <CheckCircle className="h-4 w-4" />
                      Operational ({operationalBots.length})
                    </h3>
                    <div className="space-y-2">
                      {operationalBots.map((bot) => (
                        <BotStatusCard key={bot.id} bot={bot} />
                      ))}
                    </div>
                  </div>
                )}

                {maintenanceBots.length > 0 && (
                  <div className="mt-4">
                    <h3 className="text-sm font-semibold text-yellow-500 mb-2 flex items-center gap-2">
                      <Wrench className="h-4 w-4" />
                      Maintenance ({maintenanceBots.length})
                    </h3>
                    <div className="space-y-2">
                      {maintenanceBots.map((bot) => (
                        <BotStatusCard key={bot.id} bot={bot} />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
