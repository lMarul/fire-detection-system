import { useState, useMemo, useEffect } from 'react';
import Navigation from '@/components/Navigation';
import { useFireDetection } from '@/contexts/FireDetectionContext';
import { FireAlertDialog } from '@/components/FireAlertDialog';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Bot as BotIcon,
  MapPin, 
  Thermometer, 
  Clock, 
  Filter,
  Search,
  Activity,
  AlertCircle,
  Wrench,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { format } from 'date-fns';

// Bot interface
interface Bot {
  id: string;
  name: string;
  location: {
    latitude: number;
    longitude: number;
    address: string;
  };
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

// Parse CSV helper function
const parseCSV = (csv: string): Bot[] => {
  const lines = csv.split('\n').filter(line => line.trim());
  const headers = lines[0].split(',').map(h => h.trim());
  
  return lines.slice(1).map(line => {
    // Handle quoted values with commas
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
      location: {
        latitude: parseFloat(obj.latitude),
        longitude: parseFloat(obj.longitude),
        address: obj.address
      },
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

const Bots = () => {
  const [bots, setBots] = useState<Bot[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const { activeFireEvents } = useFireDetection();
  const [openDialogs, setOpenDialogs] = useState<Record<string, boolean>>({});

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

  // Filter bots
  const filteredBots = useMemo(() => {
    let filtered = [...bots];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(bot =>
        bot.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        bot.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        bot.location.address.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(bot => bot.status === statusFilter);
    }

    return filtered;
  }, [bots, searchQuery, statusFilter]);

  const getStatusBadge = (status: Bot['status']) => {
    const statusConfig = {
      'operational': { variant: 'default' as const, label: 'OPERATIONAL', icon: CheckCircle },
      'active-fire': { variant: 'destructive' as const, label: 'ACTIVE FIRE', icon: Activity },
      'not-operational': { variant: 'outline' as const, label: 'NOT OPERATIONAL', icon: XCircle },
      'repairing': { variant: 'outline' as const, label: 'REPAIRING', icon: Wrench }
    };
    
    const config = statusConfig[status];
    const Icon = config.icon;
    
    return (
      <Badge variant={config.variant} className={
        status === 'not-operational' ? 'bg-gray-500/10 text-gray-500 border-gray-500' :
        status === 'repairing' ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500' :
        ''
      }>
        <Icon className="h-3 w-3 mr-1" />
        {config.label}
      </Badge>
    );
  };

  const getSensorStatus = (active: boolean) => {
    return active ? (
      <span className="text-green-500 text-xs">✓ Active</span>
    ) : (
      <span className="text-red-500 text-xs">✗ Offline</span>
    );
  };

  const getBatteryColor = (level?: number) => {
    if (!level) return 'text-gray-500';
    if (level > 60) return 'text-green-500';
    if (level > 30) return 'text-yellow-500';
    return 'text-red-500';
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-6">
          <BotIcon className="h-8 w-8" />
          <h1 className="text-3xl font-bold">FireBot Fleet Management</h1>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card className="p-4">
            <p className="text-sm text-muted-foreground mb-1">Total Bots</p>
            <p className="text-2xl font-bold">{bots.length}</p>
          </Card>
          <Card className="p-4 border-green-500/50">
            <p className="text-sm text-muted-foreground mb-1">Operational</p>
            <p className="text-2xl font-bold text-green-500">
              {bots.filter(b => b.status === 'operational').length}
            </p>
          </Card>
          <Card className="p-4 border-destructive/50">
            <p className="text-sm text-muted-foreground mb-1">Active Fire</p>
            <p className="text-2xl font-bold text-destructive">
              {bots.filter(b => b.status === 'active-fire').length}
            </p>
          </Card>
          <Card className="p-4 border-yellow-500/50">
            <p className="text-sm text-muted-foreground mb-1">Maintenance</p>
            <p className="text-2xl font-bold text-yellow-500">
              {bots.filter(b => b.status === 'not-operational' || b.status === 'repairing').length}
            </p>
          </Card>
        </div>

        {/* Filters */}
        <Card className="p-4 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="h-4 w-4" />
            <h2 className="font-semibold">Filters</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search bots..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* Status Filter */}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="operational">Operational</SelectItem>
                <SelectItem value="active-fire">Active Fire</SelectItem>
                <SelectItem value="not-operational">Not Operational</SelectItem>
                <SelectItem value="repairing">Repairing</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </Card>

        {/* Bots List */}
        <div className="space-y-4">
          {filteredBots.map((bot) => (
            <Card key={bot.id} className="p-6 hover:bg-secondary/50 transition-colors">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${
                    bot.status === 'operational' ? 'bg-green-500' :
                    bot.status === 'active-fire' ? 'bg-red-500 animate-pulse' :
                    bot.status === 'repairing' ? 'bg-yellow-500 animate-pulse' :
                    'bg-gray-500'
                  }`} />
                  <div>
                    <h3 className="font-bold text-lg">{bot.name}</h3>
                    <p className="text-sm text-muted-foreground">ID: {bot.id}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {getStatusBadge(bot.status)}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Location</p>
                    <p className="font-medium text-sm">{bot.location.address}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Last Activity</p>
                    <p className="font-medium text-sm">{format(bot.lastActivity, 'PPp')}</p>
                  </div>
                </div>

                {bot.temperature !== undefined && (
                  <div className="flex items-center gap-2">
                    <Thermometer className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Temperature</p>
                      <p className="font-medium text-sm">{bot.temperature}°C</p>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Battery</p>
                    <p className={`font-medium text-sm ${getBatteryColor(bot.batteryLevel)}`}>
                      {bot.batteryLevel || 0}% {bot.charging ? '⚡ Charging' : ''}
                    </p>
                  </div>
                </div>
              </div>

              {/* Sensor Status */}
              <div className="border-t pt-4">
                <p className="text-xs text-muted-foreground mb-2">SENSOR STATUS</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="flex items-center justify-between p-2 bg-secondary/30 rounded">
                    <span className="text-xs">Heat Sensor</span>
                    {getSensorStatus(bot.heatSensor)}
                  </div>
                  <div className="flex items-center justify-between p-2 bg-secondary/30 rounded">
                    <span className="text-xs">Flame Sensor</span>
                    {getSensorStatus(bot.flameSensor)}
                  </div>
                  <div className="flex items-center justify-between p-2 bg-secondary/30 rounded">
                    <span className="text-xs">Camera</span>
                    {getSensorStatus(bot.cameraSensor)}
                  </div>
                  <div className="flex items-center justify-between p-2 bg-secondary/30 rounded">
                    <span className="text-xs">Water Cannon</span>
                    {getSensorStatus(bot.waterCannonStatus)}
                  </div>
                </div>
              </div>

              {/* Fire Event Button */}
              {bot.status === 'active-fire' && activeFireEvents.has(bot.id) && (
                <div className="border-t pt-4 mt-4">
                  <Button
                    onClick={() => setOpenDialogs(prev => ({ ...prev, [bot.id]: true }))}
                    className="w-full bg-red-600 hover:bg-red-700"
                  >
                    <AlertCircle className="h-4 w-4 mr-2" />
                    View Fire Event & Resolve
                  </Button>
                </div>
              )}
            </Card>
          ))}

          {filteredBots.length === 0 && (
            <Card className="p-12 text-center">
              <AlertCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No bots found</h3>
              <p className="text-muted-foreground">
                Try adjusting your filters or search query
              </p>
            </Card>
          )}
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
      </div>
    </div>
  );
};

export default Bots;
