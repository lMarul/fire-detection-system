import { useState, useMemo, useEffect } from 'react';
import Navigation from '@/components/Navigation';
import { getPendingFireLogs, FireLogEntry } from '@/lib/csvLogger';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { 
  AlertCircle, 
  Calendar as CalendarIcon, 
  MapPin, 
  Thermometer, 
  Clock, 
  Filter,
  Download,
  Search
} from 'lucide-react';
import { format } from 'date-fns';
import * as XLSX from 'xlsx';

// Fire event log interface
interface FireLog {
  id: string;
  botId: string;
  botName: string;
  location: {
    latitude: number;
    longitude: number;
    address: string;
  };
  timestamp: Date;
  temperature?: number;
  humidity?: number;
  fireConfidence?: number;
  heatDetected: boolean;
  flameDetected: boolean;
  visualDetected: boolean;
  acousticExtinguisherActivated: boolean;
  acousticExtinguisherActivatedTime?: string;
  emergencyCallTime?: string;
  status: 'active' | 'resolved' | 'cleared' | 'not-operational' | 'repairing' | 'operational';
}

// Parse CSV helper function with proper quote handling
const parseCSV = (csv: string): FireLog[] => {
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
    values.push(current.trim()); // Push last value
    
    const obj: any = {};
    headers.forEach((header, index) => {
      obj[header] = values[index]?.replace(/"/g, '') || '';
    });
    
    return {
      id: obj.id,
      botId: obj.botId,
      botName: obj.botName,
      location: {
        latitude: parseFloat(obj.latitude),
        longitude: parseFloat(obj.longitude),
        address: obj.address
      },
      timestamp: new Date(obj.timestamp),
      temperature: obj.temperature && obj.temperature !== '' ? parseFloat(obj.temperature) : undefined,
      humidity: obj.humidity && obj.humidity !== '' ? parseFloat(obj.humidity) : undefined,
      fireConfidence: obj.fireConfidence && obj.fireConfidence !== '' ? parseFloat(obj.fireConfidence) : undefined,
      heatDetected: obj.heatDetected === 'true',
      flameDetected: obj.flameDetected === 'true',
      visualDetected: obj.visualDetected === 'true',
      acousticExtinguisherActivated: obj.waterCannonActivated === 'true',
      acousticExtinguisherActivatedTime: obj.waterCannonActivatedTime && obj.waterCannonActivatedTime !== '' ? obj.waterCannonActivatedTime : undefined,
      emergencyCallTime: obj.emergencyCallTime && obj.emergencyCallTime !== '' ? obj.emergencyCallTime : undefined,
      status: obj.status as 'active' | 'resolved' | 'cleared' | 'not-operational' | 'repairing' | 'operational'
    };
  });
};

const Logs = () => {
  const [logs, setLogs] = useState<FireLog[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState<Date | undefined>(undefined);
  const [sortBy, setSortBy] = useState<'recent' | 'oldest'>('recent');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [botFilter, setBotFilter] = useState<string>('all');

  // Function to load logs
  const loadLogs = () => {
    // Load CSV logs
    fetch('/data/fire-logs.csv')
      .then(response => response.text())
      .then(csv => {
        const csvLogs = parseCSV(csv);
        
        // Load localStorage logs
        const localStorageLogs = getPendingFireLogs();
        
        // Convert localStorage logs to FireLog format
        const convertedLocalLogs: FireLog[] = localStorageLogs.map(log => ({
          id: log.id,
          botId: log.botId,
          botName: log.botName,
          location: {
            latitude: log.latitude,
            longitude: log.longitude,
            address: log.address
          },
          timestamp: new Date(log.timestamp),
          temperature: log.temperature,
          humidity: log.humidity,
          fireConfidence: log.fireConfidence,
          heatDetected: log.heatDetected,
          flameDetected: log.flameDetected,
          visualDetected: log.visualDetected,
          acousticExtinguisherActivated: log.acousticExtinguisherActivated,
          acousticExtinguisherActivatedTime: log.acousticExtinguisherActivatedTime,
          emergencyCallTime: log.emergencyCallTime,
          status: log.status
        }));
        
        // Combine and sort by timestamp (newest first)
        const allLogs = [...csvLogs, ...convertedLocalLogs].sort((a, b) => 
          b.timestamp.getTime() - a.timestamp.getTime()
        );
        
        setLogs(allLogs);
        console.log(`📊 Loaded ${csvLogs.length} CSV logs + ${convertedLocalLogs.length} localStorage logs = ${allLogs.length} total`);
      })
      .catch(error => {
        console.error('Error loading logs:', error);
      });
  };

  // Load logs from CSV file AND localStorage
  useEffect(() => {
    loadLogs();

    // Listen for storage changes (when logs are updated)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'fire_logs_pending') {
        console.log('🔄 Fire logs updated, reloading...');
        loadLogs();
      }
    };

    // Listen for custom event when logs change in same window
    const handleLogsUpdate = () => {
      console.log('🔄 Fire logs updated (same window), reloading...');
      loadLogs();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('fireLogsUpdated', handleLogsUpdate);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('fireLogsUpdated', handleLogsUpdate);
    };
  }, []);

  // Filter and sort logs
  const filteredLogs = useMemo(() => {
    let filtered = [...logs];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(log =>
        log.botName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.location.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.id.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Date filter
    if (dateFilter) {
      filtered = filtered.filter(log =>
        format(log.timestamp, 'yyyy-MM-dd') === format(dateFilter, 'yyyy-MM-dd')
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(log => log.status === statusFilter);
    }

    // Bot filter
    if (botFilter !== 'all') {
      filtered = filtered.filter(log => log.botId === botFilter);
    }

    // Sort
    filtered.sort((a, b) => {
      if (sortBy === 'recent') {
        return b.timestamp.getTime() - a.timestamp.getTime();
      } else {
        return a.timestamp.getTime() - b.timestamp.getTime();
      }
    });

    return filtered;
  }, [logs, searchQuery, dateFilter, sortBy, statusFilter, botFilter]);

  const getStatusBadge = (status: FireLog['status']) => {
    const statusConfig = {
      'active': { variant: 'destructive' as const, label: 'ACTIVE' },
      'resolved': { variant: 'default' as const, label: 'RESOLVED' },
      'cleared': { variant: 'secondary' as const, label: 'CLEARED' },
      'not-operational': { variant: 'outline' as const, label: 'NOT OPERATIONAL' },
      'repairing': { variant: 'outline' as const, label: 'REPAIRING' },
      'operational': { variant: 'outline' as const, label: 'OPERATIONAL' }
    };
    
    const config = statusConfig[status];
    return <Badge variant={config.variant} className={
      status === 'not-operational' ? 'bg-gray-500/10 text-gray-500 border-gray-500' :
      status === 'repairing' ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500' :
      status === 'operational' ? 'bg-green-500/10 text-green-500 border-green-500' :
      ''
    }>{config.label}</Badge>;
  };

  const exportLogs = () => {
    // Prepare data for Excel export
    const excelData = filteredLogs.map(log => ({
      'Log ID': log.id,
      'Bot ID': log.botId,
      'Bot Name': log.botName,
      'Location': log.location.address,
      'Latitude': log.location.latitude,
      'Longitude': log.location.longitude,
      'Date': format(log.timestamp, 'yyyy-MM-dd'),
      'Time': format(log.timestamp, 'HH:mm:ss'),
      'Temperature (°C)': log.temperature || 'N/A',
      'Humidity (%)': log.humidity || 'N/A',
      'AI Confidence': log.fireConfidence ? `${(log.fireConfidence * 100).toFixed(1)}%` : 'N/A',
      'Heat Detected': log.heatDetected ? 'Yes' : 'No',
      'Flame Detected': log.flameDetected ? 'Yes' : 'No',
      'Visual Detected': log.visualDetected ? 'Yes' : 'No',
      'Acoustic Fire Extinguisher': log.acousticExtinguisherActivated ? 'Activated' : 'Not Activated',
      'Acoustic Fire Extinguisher Time': log.acousticExtinguisherActivatedTime || 'N/A',
      'Emergency Call Time': log.emergencyCallTime || 'N/A',
      'Status': log.status.toUpperCase()
    }));

    // Create worksheet
    const ws = XLSX.utils.json_to_sheet(excelData);
    
    // Set column widths
    const colWidths = [
      { wch: 10 },  // Log ID
      { wch: 10 },  // Bot ID
      { wch: 15 },  // Bot Name
      { wch: 35 },  // Location
      { wch: 12 },  // Latitude
      { wch: 12 },  // Longitude
      { wch: 12 },  // Date
      { wch: 10 },  // Time
      { wch: 15 },  // Temperature
      { wch: 12 },  // Humidity
      { wch: 15 },  // AI Confidence
      { wch: 15 },  // Heat Detected
      { wch: 15 },  // Flame Detected
      { wch: 15 },  // Visual Detected
      { wch: 28 },  // Acoustic Fire Extinguisher
      { wch: 28 },  // Acoustic Fire Extinguisher Time
      { wch: 18 },  // Emergency Call Time
      { wch: 15 },  // Status
    ];
    ws['!cols'] = colWidths;

    // Create workbook
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Fire Detection Logs');

    // Generate Excel file
    XLSX.writeFile(wb, `Fire-Detection-Logs-${format(new Date(), 'yyyy-MM-dd')}.xlsx`);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-4 py-4 sm:py-6">
        <div className="mb-4 sm:mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">Fire Detection Logs</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Complete history of all fire detection events and bot activations
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-4 mb-4 sm:mb-6">
          <Card className="p-3 sm:p-4">
            <p className="text-xs sm:text-sm text-muted-foreground mb-1">Total Events</p>
            <p className="text-xl sm:text-2xl font-bold">{logs.length}</p>
          </Card>
          <Card className="p-3 sm:p-4 border-destructive/50">
            <p className="text-xs sm:text-sm text-muted-foreground mb-1">Active</p>
            <p className="text-xl sm:text-2xl font-bold text-destructive">
              {logs.filter(l => l.status === 'active').length}
            </p>
          </Card>
          <Card className="p-3 sm:p-4 border-green-500/50">
            <p className="text-xs sm:text-sm text-muted-foreground mb-1">Resolved</p>
            <p className="text-xl sm:text-2xl font-bold text-green-500">
              {logs.filter(l => l.status === 'resolved').length}
            </p>
          </Card>
          <Card className="p-3 sm:p-4">
            <p className="text-xs sm:text-sm text-muted-foreground mb-1">Cleared</p>
            <p className="text-xl sm:text-2xl font-bold text-muted-foreground">
              {logs.filter(l => l.status === 'cleared').length}
            </p>
          </Card>
          <Card className="p-3 sm:p-4 border-gray-500/50">
            <p className="text-xs sm:text-sm text-muted-foreground mb-1 truncate">Not Operational</p>
            <p className="text-xl sm:text-2xl font-bold text-gray-500">
              {logs.filter(l => l.status === 'not-operational').length}
            </p>
          </Card>
          <Card className="p-3 sm:p-4 border-yellow-500/50">
            <p className="text-xs sm:text-sm text-muted-foreground mb-1">Repairing</p>
            <p className="text-xl sm:text-2xl font-bold text-yellow-500">
              {logs.filter(l => l.status === 'repairing').length}
            </p>
          </Card>
        </div>

        {/* Filters */}
        <Card className="p-3 sm:p-4 mb-4 sm:mb-6">
          <div className="flex items-center gap-2 mb-3 sm:mb-4">
            <Filter className="h-4 w-4" />
            <h2 className="font-semibold text-sm sm:text-base">Filters</h2>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search logs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* Date Filter */}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start text-left">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateFilter ? format(dateFilter, 'PPP') : 'Pick a date'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={dateFilter}
                  onSelect={setDateFilter}
                  initialFocus
                />
              </PopoverContent>
            </Popover>

            {/* Sort By */}
            <Select value={sortBy} onValueChange={(value: 'recent' | 'oldest') => setSortBy(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recent">Most Recent</SelectItem>
                <SelectItem value="oldest">Oldest First</SelectItem>
              </SelectContent>
            </Select>

            {/* Status Filter */}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="cleared">Cleared</SelectItem>
                <SelectItem value="operational">Operational</SelectItem>
                <SelectItem value="not-operational">Not Operational</SelectItem>
                <SelectItem value="repairing">Repairing</SelectItem>
              </SelectContent>
            </Select>

            {/* Bot Filter */}
            <Select value={botFilter} onValueChange={setBotFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Bot" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Bots</SelectItem>
                <SelectItem value="bot-001">FireBot Alpha</SelectItem>
                <SelectItem value="bot-002">FireBot Beta</SelectItem>
                <SelectItem value="bot-003">FireBot Gamma</SelectItem>
                <SelectItem value="bot-004">FireBot Delta</SelectItem>
                <SelectItem value="bot-005">FireBot Epsilon</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between mt-4 pt-4 border-t">
            <p className="text-sm text-muted-foreground">
              Showing {filteredLogs.length} of {logs.length} logs
            </p>
            <Button onClick={exportLogs} variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" />
              Export Excel
            </Button>
          </div>
        </Card>

        {/* Logs List */}
        <div className="space-y-3 sm:space-y-4">
          {filteredLogs.map((log) => (
            <Card key={log.id} className="p-4 sm:p-6 hover:bg-secondary/50 transition-colors">
              <div className="flex flex-col sm:flex-row items-start justify-between gap-3 mb-3 sm:mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 flex-shrink-0 rounded-full ${
                    log.status === 'active' ? 'bg-red-500 animate-pulse' :
                    log.status === 'resolved' ? 'bg-green-500' :
                    log.status === 'operational' ? 'bg-green-500' :
                    log.status === 'not-operational' ? 'bg-gray-500' :
                    log.status === 'repairing' ? 'bg-yellow-500 animate-pulse' :
                    'bg-gray-500'
                  }`} />
                  <div className="min-w-0">
                    <h3 className="font-bold text-base sm:text-lg truncate">{log.botName}</h3>
                    <p className="text-xs sm:text-sm text-muted-foreground truncate">ID: {log.id}</p>
                  </div>
                </div>
                
                <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                  {getStatusBadge(log.status)}
                  {log.acousticExtinguisherActivated && (
                    <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500 text-xs sm:text-sm">
                      🔊 ACOUSTIC FIRE EXTINGUISHER ACTIVATED
                    </Badge>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-3 sm:mb-4">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                  <div className="min-w-0">
                    <p className="text-xs text-muted-foreground">Date & Time</p>
                    <p className="font-medium text-sm sm:text-base truncate">{format(log.timestamp, 'PPP p')}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                  <div className="min-w-0">
                    <p className="text-xs text-muted-foreground">Location</p>
                    <p className="font-medium text-sm sm:text-base truncate">{log.location.address}</p>
                  </div>
                </div>

                {log.temperature && (
                  <div className="flex items-center gap-2">
                    <Thermometer className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                    <div className="min-w-0">
                      <p className="text-xs text-muted-foreground">Temperature</p>
                      <p className="font-medium text-sm sm:text-base">{log.temperature}°C</p>
                    </div>
                  </div>
                )}

                {log.fireConfidence && (
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                    <div className="min-w-0">
                      <p className="text-xs text-muted-foreground">AI Confidence</p>
                      <p className="font-medium text-sm sm:text-base">{(log.fireConfidence * 100).toFixed(1)}%</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3 mb-3 sm:mb-4">
                <div className="flex items-center gap-2">
                  <span className={`px-2 sm:px-3 py-1.5 sm:py-2 rounded text-xs sm:text-sm font-medium flex-1 text-center ${
                    log.heatDetected ? 'bg-red-500/10 text-red-500 border border-red-500/20' : 'bg-gray-500/10 text-gray-500'
                  }`}>
                    🔥 Heat: {log.heatDetected ? 'Detected' : 'Clear'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 sm:px-3 py-1.5 sm:py-2 rounded text-xs sm:text-sm font-medium flex-1 text-center ${
                    log.flameDetected ? 'bg-orange-500/10 text-orange-500 border border-orange-500/20' : 'bg-gray-500/10 text-gray-500'
                  }`}>
                    🔥 Flame: {log.flameDetected ? 'Detected' : 'Clear'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 sm:px-3 py-1.5 sm:py-2 rounded text-xs sm:text-sm font-medium flex-1 text-center ${
                    log.visualDetected ? 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20' : 'bg-gray-500/10 text-gray-500'
                  }`}>
                    👁️ Visual: {log.visualDetected ? 'Detected' : 'Clear'}
                  </span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 text-xs sm:text-sm">
                {log.acousticExtinguisherActivatedTime && (
                  <span className="px-2 py-1 rounded font-medium bg-blue-500/10 text-blue-500 w-full sm:w-auto text-center sm:text-left">
                    🔊 Acoustic Fire Extinguisher: {log.acousticExtinguisherActivatedTime}
                  </span>
                )}
                {log.emergencyCallTime && (
                  <span className="px-2 py-1 rounded font-medium bg-purple-500/10 text-purple-500 w-full sm:w-auto text-center sm:text-left">
                    📞 Emergency Hotline: {log.emergencyCallTime}
                  </span>
                )}
              </div>
            </Card>
          ))}

          {filteredLogs.length === 0 && (
            <Card className="p-12 text-center">
              <AlertCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No logs found</h3>
              <p className="text-muted-foreground">
                Try adjusting your filters or search query
              </p>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
};

export default Logs;
