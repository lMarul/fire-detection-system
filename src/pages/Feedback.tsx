import { useState, useMemo } from 'react';
import Navigation from '@/components/Navigation';
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
  visualDetected: boolean;
  waterCannonActivated: boolean;
  responseTime?: string;
  status: 'active' | 'resolved' | 'false-alarm';
}

// Mock fire logs data
const mockFireLogs: FireLog[] = [
  {
    id: 'log-001',
    botId: 'bot-001',
    botName: 'FireBot Alpha',
    location: {
      latitude: 14.5329,
      longitude: 121.0066,
      address: 'Pasay City, Barangay 165, Street 1'
    },
    timestamp: new Date('2024-11-04T14:23:00'),
    temperature: 45.5,
    humidity: 60.2,
    fireConfidence: 0.87,
    heatDetected: true,
    visualDetected: true,
    waterCannonActivated: true,
    responseTime: '00:02:15',
    status: 'resolved'
  },
  {
    id: 'log-002',
    botId: 'bot-004',
    botName: 'FireBot Delta',
    location: {
      latitude: 14.5369,
      longitude: 121.0106,
      address: 'Pasay City, Barangay 165, Street 4'
    },
    timestamp: new Date('2024-11-04T14:45:00'),
    temperature: 52.3,
    humidity: 55.1,
    fireConfidence: 0.92,
    heatDetected: true,
    visualDetected: true,
    waterCannonActivated: true,
    responseTime: '00:01:45',
    status: 'resolved'
  },
  {
    id: 'log-003',
    botId: 'bot-001',
    botName: 'FireBot Alpha',
    location: {
      latitude: 14.5329,
      longitude: 121.0066,
      address: 'Pasay City, Barangay 165, Street 1'
    },
    timestamp: new Date('2024-11-03T10:15:00'),
    temperature: 38.2,
    humidity: 65.0,
    fireConfidence: 0.45,
    heatDetected: true,
    visualDetected: false,
    waterCannonActivated: false,
    status: 'false-alarm'
  },
  {
    id: 'log-004',
    botId: 'bot-002',
    botName: 'FireBot Beta',
    location: {
      latitude: 14.5349,
      longitude: 121.0086,
      address: 'Pasay City, Barangay 165, Street 2'
    },
    timestamp: new Date('2024-11-02T16:30:00'),
    temperature: 48.7,
    humidity: 58.3,
    fireConfidence: 0.78,
    heatDetected: true,
    visualDetected: true,
    waterCannonActivated: true,
    responseTime: '00:03:20',
    status: 'resolved'
  },
  {
    id: 'log-005',
    botId: 'bot-003',
    botName: 'FireBot Gamma',
    location: {
      latitude: 14.5309,
      longitude: 121.0046,
      address: 'Pasay City, Barangay 165, Street 3'
    },
    timestamp: new Date('2024-11-01T09:45:00'),
    temperature: 55.1,
    humidity: 52.0,
    fireConfidence: 0.95,
    heatDetected: true,
    visualDetected: true,
    waterCannonActivated: true,
    responseTime: '00:01:30',
    status: 'resolved'
  },
];

const Logs = () => {
  const [logs] = useState<FireLog[]>(mockFireLogs);
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState<Date | undefined>(undefined);
  const [sortBy, setSortBy] = useState<'recent' | 'oldest'>('recent');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [botFilter, setBotFilter] = useState<string>('all');

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
    const variants = {
      'active': 'destructive',
      'resolved': 'default',
      'false-alarm': 'secondary'
    } as const;
    
    return <Badge variant={variants[status]}>{status.toUpperCase()}</Badge>;
  };

  const exportLogs = () => {
    const csv = [
      ['ID', 'Bot Name', 'Location', 'Date', 'Time', 'Temperature', 'Confidence', 'Status', 'Response Time'].join(','),
      ...filteredLogs.map(log => [
        log.id,
        log.botName,
        log.location.address,
        format(log.timestamp, 'yyyy-MM-dd'),
        format(log.timestamp, 'HH:mm:ss'),
        log.temperature || 'N/A',
        log.fireConfidence ? `${(log.fireConfidence * 100).toFixed(1)}%` : 'N/A',
        log.status,
        log.responseTime || 'N/A'
      ].join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fire-logs-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Fire Detection Logs</h1>
          <p className="text-muted-foreground">
            Complete history of all fire detection events and bot activations
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="p-4">
            <p className="text-sm text-muted-foreground mb-1">Total Events</p>
            <p className="text-2xl font-bold">{logs.length}</p>
          </Card>
          <Card className="p-4 border-destructive/50">
            <p className="text-sm text-muted-foreground mb-1">Fires Detected</p>
            <p className="text-2xl font-bold text-destructive">
              {logs.filter(l => l.status === 'resolved').length}
            </p>
          </Card>
          <Card className="p-4 border-green-500/50">
            <p className="text-sm text-muted-foreground mb-1">Resolved</p>
            <p className="text-2xl font-bold text-green-500">
              {logs.filter(l => l.status === 'resolved').length}
            </p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-muted-foreground mb-1">False Alarms</p>
            <p className="text-2xl font-bold text-muted-foreground">
              {logs.filter(l => l.status === 'false-alarm').length}
            </p>
          </Card>
        </div>

        {/* Filters */}
        <Card className="p-4 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="h-4 w-4" />
            <h2 className="font-semibold">Filters</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
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
                <SelectItem value="false-alarm">False Alarm</SelectItem>
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
              Export CSV
            </Button>
          </div>
        </Card>

        {/* Logs List */}
        <div className="space-y-4">
          {filteredLogs.map((log) => (
            <Card key={log.id} className="p-6 hover:bg-secondary/50 transition-colors">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${
                    log.status === 'active' ? 'bg-red-500 animate-pulse' :
                    log.status === 'resolved' ? 'bg-green-500' :
                    'bg-gray-500'
                  }`} />
                  <div>
                    <h3 className="font-bold text-lg">{log.botName}</h3>
                    <p className="text-sm text-muted-foreground">ID: {log.id}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {getStatusBadge(log.status)}
                  {log.waterCannonActivated && (
                    <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500">
                      💧 WATER CANNON ACTIVATED
                    </Badge>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Date & Time</p>
                    <p className="font-medium">{format(log.timestamp, 'PPP p')}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Location</p>
                    <p className="font-medium">{log.location.address}</p>
                  </div>
                </div>

                {log.temperature && (
                  <div className="flex items-center gap-2">
                    <Thermometer className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Temperature</p>
                      <p className="font-medium">{log.temperature}°C</p>
                    </div>
                  </div>
                )}

                {log.fireConfidence && (
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">AI Confidence</p>
                      <p className="font-medium">{(log.fireConfidence * 100).toFixed(1)}%</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    log.heatDetected ? 'bg-red-500/10 text-red-500' : 'bg-gray-500/10 text-gray-500'
                  }`}>
                    🔥 Heat: {log.heatDetected ? 'Detected' : 'Normal'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    log.visualDetected ? 'bg-orange-500/10 text-orange-500' : 'bg-gray-500/10 text-gray-500'
                  }`}>
                    👁️ Visual: {log.visualDetected ? 'Detected' : 'Clear'}
                  </span>
                </div>
                {log.responseTime && (
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-1 rounded text-xs font-medium bg-blue-500/10 text-blue-500">
                      ⏱️ Response: {log.responseTime}
                    </span>
                  </div>
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
