import { useState, useMemo } from 'react';
import Navigation from '@/components/Navigation';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { 
  Video, 
  MapPin, 
  Clock, 
  Download, 
  Search, 
  Filter,
  Calendar as CalendarIcon,
  Play,
  Pause,
  AlertCircle,
  CheckCircle,
  Cloud
} from 'lucide-react';
import { format } from 'date-fns';

// Recording interface for CCTV/Fire detection videos
interface Recording {
  id: string;
  botId: string;
  botName: string;
  location: {
    latitude: number;
    longitude: number;
    address: string;
  };
  timestamp: Date;
  duration: number; // in seconds
  fileSize: string; // e.g., "45.2 MB"
  type: 'fire-event' | 'scheduled' | 'manual' | 'motion-detected';
  status: 'uploaded' | 'uploading' | 'failed';
  cloudUrl?: string; // Cloud storage URL (when implemented)
  thumbnail?: string;
  hasAudio: boolean;
  resolution: string; // e.g., "1920x1080"
  fps: number;
}

// Mock recordings data
const mockRecordings: Recording[] = [
  {
    id: 'rec-001',
    botId: 'bot-001',
    botName: 'FireBot Alpha',
    location: {
      latitude: 14.5329,
      longitude: 121.0066,
      address: 'Pasay City, Barangay 165, Street 1'
    },
    timestamp: new Date('2024-11-07T14:23:00'),
    duration: 180,
    fileSize: '45.2 MB',
    type: 'fire-event',
    status: 'uploaded',
    thumbnail: 'https://images.unsplash.com/photo-1711472517245-e45352322113?q=80&w=1072&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    hasAudio: true,
    resolution: '1920x1080',
    fps: 30
  },
  {
    id: 'rec-002',
    botId: 'bot-004',
    botName: 'FireBot Delta',
    location: {
      latitude: 14.5369,
      longitude: 121.0106,
      address: 'Pasay City, Barangay 165, Street 4'
    },
    timestamp: new Date('2024-11-07T12:15:00'),
    duration: 240,
    fileSize: '62.8 MB',
    type: 'fire-event',
    status: 'uploaded',
    thumbnail: 'https://images.unsplash.com/photo-1761414701775-922d94ca5be0?q=80&w=1169&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    hasAudio: true,
    resolution: '1920x1080',
    fps: 30
  },
  {
    id: 'rec-003',
    botId: 'bot-002',
    botName: 'FireBot Beta',
    location: {
      latitude: 14.5349,
      longitude: 121.0086,
      address: 'Pasay City, Barangay 165, Street 2'
    },
    timestamp: new Date('2024-11-07T09:30:00'),
    duration: 120,
    fileSize: '28.5 MB',
    type: 'motion-detected',
    status: 'uploaded',
    thumbnail: 'https://images.unsplash.com/photo-1590859808308-3d2d9c515b1a?w=800&h=450&fit=crop',
    hasAudio: false,
    resolution: '1280x720',
    fps: 24
  },
  {
    id: 'rec-004',
    botId: 'bot-001',
    botName: 'FireBot Alpha',
    location: {
      latitude: 14.5329,
      longitude: 121.0066,
      address: 'Pasay City, Barangay 165, Street 1'
    },
    timestamp: new Date('2024-11-06T18:45:00'),
    duration: 300,
    fileSize: '75.1 MB',
    type: 'scheduled',
    status: 'uploaded',
    thumbnail: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&h=450&fit=crop',
    hasAudio: true,
    resolution: '1920x1080',
    fps: 30
  },
  {
    id: 'rec-005',
    botId: 'bot-003',
    botName: 'FireBot Gamma',
    location: {
      latitude: 14.5309,
      longitude: 121.0046,
      address: 'Pasay City, Barangay 165, Street 3'
    },
    timestamp: new Date('2024-11-06T15:20:00'),
    duration: 90,
    fileSize: '22.3 MB',
    type: 'manual',
    status: 'uploading',
    thumbnail: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800&h=450&fit=crop',
    hasAudio: false,
    resolution: '1280x720',
    fps: 24
  }
];

const Recordings = () => {
  const [recordings] = useState<Recording[]>(mockRecordings);
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState<Date | undefined>(undefined);
  const [sortBy, setSortBy] = useState<'recent' | 'oldest'>('recent');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [botFilter, setBotFilter] = useState<string>('all');

  // Get unique bot names for filter
  const uniqueBots = useMemo(() => {
    const bots = Array.from(new Set(recordings.map(r => r.botName)));
    return bots.sort();
  }, [recordings]);

  // Filter and sort recordings
  const filteredRecordings = useMemo(() => {
    let filtered = [...recordings];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(rec =>
        rec.botName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rec.location.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rec.id.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Date filter
    if (dateFilter) {
      filtered = filtered.filter(rec =>
        format(rec.timestamp, 'yyyy-MM-dd') === format(dateFilter, 'yyyy-MM-dd')
      );
    }

    // Type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter(rec => rec.type === typeFilter);
    }

    // Bot filter
    if (botFilter !== 'all') {
      filtered = filtered.filter(rec => rec.botName === botFilter);
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
  }, [recordings, searchQuery, dateFilter, sortBy, typeFilter, botFilter]);

  // Format duration to mm:ss
  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Get type badge
  const getTypeBadge = (type: Recording['type']) => {
    switch (type) {
      case 'fire-event':
        return <Badge variant="destructive">🔥 Fire Event</Badge>;
      case 'motion-detected':
        return <Badge variant="secondary">👁️ Motion</Badge>;
      case 'scheduled':
        return <Badge variant="outline">📅 Scheduled</Badge>;
      case 'manual':
        return <Badge variant="default">✋ Manual</Badge>;
    }
  };

  // Get status badge
  const getStatusBadge = (status: Recording['status']) => {
    switch (status) {
      case 'uploaded':
        return <Badge className="bg-green-500 hover:bg-green-600"><CheckCircle className="h-3 w-3 mr-1" />Uploaded</Badge>;
      case 'uploading':
        return <Badge className="bg-yellow-500 hover:bg-yellow-600"><Cloud className="h-3 w-3 mr-1 animate-pulse" />Uploading</Badge>;
      case 'failed':
        return <Badge variant="destructive"><AlertCircle className="h-3 w-3 mr-1" />Failed</Badge>;
    }
  };

  // Handle play video
  const handlePlayVideo = (recording: Recording) => {
    alert(`▶️ Playing Video\n\nBot: ${recording.botName}\nID: ${recording.id}\nLocation: ${recording.location.address}\nDuration: ${formatDuration(recording.duration)}\nResolution: ${recording.resolution}\n\n🎬 Video player would open here in production.`);
  };

  // Handle download video
  const handleDownloadVideo = (recording: Recording) => {
    alert(`⬇️ Downloading Video\n\nBot: ${recording.botName}\nID: ${recording.id}\nFile Size: ${recording.fileSize}\nFormat: MP4\n\n📥 Download would start here in production.`);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-4 sm:py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 sm:mb-8 gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2">📹 Video Recordings</h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              CCTV recordings from FireBot units • Cloud storage enabled
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-sm sm:text-lg px-3 sm:px-4 py-1 sm:py-2">
              <Cloud className="h-4 w-4 mr-2" />
              {filteredRecordings.length} Videos
            </Badge>
          </div>
        </div>

        {/* Filters */}
        <Card className="p-4 sm:p-6 mb-4 sm:mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
            {/* Search */}
            <div className="lg:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by bot, location, or ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Date Filter */}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="justify-start text-left font-normal">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateFilter ? format(dateFilter, 'PPP') : 'All Dates'}
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

            {/* Type Filter */}
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="fire-event">Fire Events</SelectItem>
                <SelectItem value="motion-detected">Motion Detected</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="manual">Manual</SelectItem>
              </SelectContent>
            </Select>

            {/* Bot Filter */}
            <Select value={botFilter} onValueChange={setBotFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by bot" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Bots</SelectItem>
                {uniqueBots.map(bot => (
                  <SelectItem key={bot} value={bot}>{bot}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between mt-4 pt-4 border-t">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Sort by:</span>
              <Select value={sortBy} onValueChange={(val) => setSortBy(val as 'recent' | 'oldest')}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recent">Most Recent</SelectItem>
                  <SelectItem value="oldest">Oldest First</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {(dateFilter || typeFilter !== 'all' || botFilter !== 'all' || searchQuery) && (
              <Button 
                variant="ghost" 
                onClick={() => {
                  setDateFilter(undefined);
                  setTypeFilter('all');
                  setBotFilter('all');
                  setSearchQuery('');
                }}
              >
                Clear Filters
              </Button>
            )}
          </div>
        </Card>

        {/* Recordings Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRecordings.map((recording) => (
            <Card key={recording.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              {/* Thumbnail/Preview */}
              <div className="relative bg-black aspect-video flex items-center justify-center overflow-hidden">
                {/* Background Image */}
                {recording.thumbnail && (
                  <img 
                    src={recording.thumbnail} 
                    alt={`CCTV footage from ${recording.botName}`}
                    className="absolute inset-0 w-full h-full object-cover opacity-70"
                  />
                )}
                {/* CCTV Style Overlay */}
                <div className="absolute inset-0 bg-gradient-to-b from-gray-900/50 to-black/80">
                  {/* Timestamp Overlay */}
                  <div className="absolute top-2 left-2 text-white text-xs font-mono bg-black/60 px-2 py-1 rounded">
                    {format(recording.timestamp, 'yyyy-MM-dd HH:mm:ss')}
                  </div>
                  {/* Bot ID Overlay */}
                  <div className="absolute top-2 right-2 text-white text-xs font-mono bg-black/60 px-2 py-1 rounded">
                    CAM {recording.botId.toUpperCase()}
                  </div>
                  {/* Location Overlay */}
                  <div className="absolute bottom-8 left-2 text-white text-xs font-mono bg-black/60 px-2 py-1 rounded max-w-[calc(100%-1rem)]">
                    <div className="truncate">{recording.location.address}</div>
                  </div>
                  {/* Recording Icon */}
                  <div className="absolute bottom-2 left-2 flex items-center gap-1">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                    <span className="text-white text-xs font-mono">REC</span>
                  </div>
                  {/* Scanline Effect */}
                  <div className="absolute inset-0 opacity-10 pointer-events-none" style={{
                    background: 'repeating-linear-gradient(0deg, rgba(0,0,0,0.15), rgba(0,0,0,0.15) 1px, transparent 1px, transparent 2px)',
                  }}></div>
                </div>
                <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded font-mono">
                  {formatDuration(recording.duration)}
                </div>
              </div>

              {/* Details */}
              <div className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-bold text-lg mb-1">{recording.botName}</h3>
                    <p className="text-xs text-muted-foreground">ID: {recording.id}</p>
                  </div>
                  {getStatusBadge(recording.status)}
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>{format(recording.timestamp, 'PPP p')}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="truncate">{recording.location.address}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 mb-4">
                  {getTypeBadge(recording.type)}
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground mb-4">
                  <div>
                    <span className="font-medium">Size:</span> {recording.fileSize}
                  </div>
                  <div>
                    <span className="font-medium">Resolution:</span> {recording.resolution}
                  </div>
                  <div>
                    <span className="font-medium">FPS:</span> {recording.fps}
                  </div>
                  <div>
                    <span className="font-medium">Audio:</span> {recording.hasAudio ? '✓ Yes' : '✗ No'}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Button 
                    className="flex-1" 
                    size="sm" 
                    disabled={recording.status !== 'uploaded'}
                    onClick={() => handlePlayVideo(recording)}
                  >
                    <Play className="h-3 w-3 mr-2" />
                    Play
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    disabled={recording.status !== 'uploaded'}
                    onClick={() => handleDownloadVideo(recording)}
                  >
                    <Download className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {filteredRecordings.length === 0 && (
          <Card className="p-12 text-center">
            <Video className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-bold mb-2">No recordings found</h3>
            <p className="text-muted-foreground">
              {searchQuery || dateFilter || typeFilter !== 'all' || botFilter !== 'all'
                ? 'Try adjusting your filters'
                : 'Recordings from FireBot CCTV systems will appear here'}
            </p>
          </Card>
        )}

        {/* Info Card */}
        <Card className="mt-6 p-6 bg-blue-500/5 border-blue-500/20">
          <div className="flex items-start gap-4">
            <Cloud className="h-6 w-6 text-blue-500 mt-1" />
            <div>
              <h3 className="font-bold mb-2">Cloud Storage Integration</h3>
              <p className="text-sm text-muted-foreground">
                All video recordings are automatically uploaded to secure cloud storage via WiFi. 
                Videos are retained for 30 days and can be downloaded for local archival.
                Fire event recordings are prioritized and uploaded immediately.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Recordings;
