import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  Shield, 
  User, 
  Calendar, 
  Clock, 
  Activity,
  Download,
  Play,
  Settings,
  FileText,
  AlertCircle,
  CheckCircle,
  Lock
} from 'lucide-react';
import { format } from 'date-fns';

interface AdminLog {
  id: string;
  username: string;
  action: string;
  actionType: 'play' | 'download' | 'settings' | 'access' | 'export' | 'system';
  timestamp: Date;
  resourceId?: string;
  resourceName?: string;
  ipAddress: string;
  status: 'success' | 'failed' | 'warning';
  details?: string;
}

// Mock admin logs data
const mockAdminLogs: AdminLog[] = [
  {
    id: 'log-001',
    username: 'admin',
    action: 'Played video recording',
    actionType: 'play',
    timestamp: new Date('2024-11-16T14:23:00'),
    resourceId: 'rec-001',
    resourceName: 'FireBot Alpha - Fire Event',
    ipAddress: '192.168.1.100',
    status: 'success',
    details: 'Video playback initiated successfully'
  },
  {
    id: 'log-002',
    username: 'admin',
    action: 'Downloaded video recording',
    actionType: 'download',
    timestamp: new Date('2024-11-16T12:15:00'),
    resourceId: 'rec-002',
    resourceName: 'FireBot Delta - Fire Event',
    ipAddress: '192.168.1.100',
    status: 'success',
    details: 'Video downloaded (62.8 MB)'
  },
  {
    id: 'log-003',
    username: 'admin',
    action: 'Exported fire logs',
    actionType: 'export',
    timestamp: new Date('2024-11-16T09:30:00'),
    ipAddress: '192.168.1.100',
    status: 'success',
    details: 'Exported 45 fire detection logs to Excel'
  },
  {
    id: 'log-004',
    username: 'operator',
    action: 'Failed login attempt',
    actionType: 'access',
    timestamp: new Date('2024-11-15T18:45:00'),
    ipAddress: '192.168.1.105',
    status: 'failed',
    details: 'Invalid password'
  },
  {
    id: 'log-005',
    username: 'admin',
    action: 'Updated system settings',
    actionType: 'settings',
    timestamp: new Date('2024-11-15T15:20:00'),
    ipAddress: '192.168.1.100',
    status: 'success',
    details: 'Modified acoustic extinguisher sensitivity threshold'
  },
  {
    id: 'log-006',
    username: 'admin',
    action: 'Accessed admin logs',
    actionType: 'access',
    timestamp: new Date('2024-11-15T14:10:00'),
    ipAddress: '192.168.1.100',
    status: 'success',
    details: 'Viewed admin activity logs'
  },
  {
    id: 'log-007',
    username: 'admin',
    action: 'System backup created',
    actionType: 'system',
    timestamp: new Date('2024-11-15T03:00:00'),
    ipAddress: '192.168.1.1',
    status: 'success',
    details: 'Automated daily backup completed'
  },
  {
    id: 'log-008',
    username: 'supervisor',
    action: 'Attempted video download',
    actionType: 'download',
    timestamp: new Date('2024-11-14T16:30:00'),
    resourceId: 'rec-003',
    resourceName: 'FireBot Beta - Motion Detected',
    ipAddress: '192.168.1.120',
    status: 'failed',
    details: 'Insufficient permissions'
  }
];

const AdminLogs = () => {
  const navigate = useNavigate();
  const [authenticated, setAuthenticated] = useState(false);
  const [authDialogOpen, setAuthDialogOpen] = useState(true);
  const [authUsername, setAuthUsername] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [logs] = useState<AdminLog[]>(mockAdminLogs);

  // Handle authentication
  const handleAuthentication = () => {
    if (authUsername === 'admin' && authPassword === 'admin123') {
      setAuthError('');
      setAuthDialogOpen(false);
      setAuthenticated(true);
      setAuthUsername('');
      setAuthPassword('');
    } else {
      setAuthError('Invalid username or password');
    }
  };

  // Get action icon
  const getActionIcon = (actionType: AdminLog['actionType']) => {
    switch (actionType) {
      case 'play':
        return <Play className="h-4 w-4" />;
      case 'download':
        return <Download className="h-4 w-4" />;
      case 'settings':
        return <Settings className="h-4 w-4" />;
      case 'access':
        return <Lock className="h-4 w-4" />;
      case 'export':
        return <FileText className="h-4 w-4" />;
      case 'system':
        return <Activity className="h-4 w-4" />;
    }
  };

  // Get status badge
  const getStatusBadge = (status: AdminLog['status']) => {
    switch (status) {
      case 'success':
        return <Badge className="bg-green-500 hover:bg-green-600"><CheckCircle className="h-3 w-3 mr-1" />Success</Badge>;
      case 'failed':
        return <Badge variant="destructive"><AlertCircle className="h-3 w-3 mr-1" />Failed</Badge>;
      case 'warning':
        return <Badge className="bg-yellow-500 hover:bg-yellow-600"><AlertCircle className="h-3 w-3 mr-1" />Warning</Badge>;
    }
  };

  // If not authenticated, only show dialog
  if (!authenticated) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <Dialog open={authDialogOpen} onOpenChange={(open) => {
          if (!open) {
            navigate('/');
          }
          setAuthDialogOpen(open);
        }}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>🔒 Admin Authentication Required</DialogTitle>
              <DialogDescription>
                Please enter admin credentials to access activity logs.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  placeholder="Enter admin username"
                  value={authUsername}
                  onChange={(e) => setAuthUsername(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAuthentication()}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter admin password"
                  value={authPassword}
                  onChange={(e) => setAuthPassword(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAuthentication()}
                />
              </div>
              {authError && (
                <div className="text-sm text-red-500 bg-red-500/10 border border-red-500/20 rounded p-2">
                  ⚠️ {authError}
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => navigate('/')}>
                Cancel
              </Button>
              <Button onClick={handleAuthentication}>
                Authenticate
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-4 sm:py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 sm:mb-8 gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2 flex items-center gap-3">
              <Shield className="h-8 w-8 text-primary" />
              Admin Activity Logs
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Track all administrative actions and system events • Secure audit trail
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-sm sm:text-lg px-3 sm:px-4 py-1 sm:py-2">
              <Activity className="h-4 w-4 mr-2" />
              {logs.length} Events
            </Badge>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6">
          <Card className="p-4 border-green-500/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Successful</p>
                <p className="text-2xl font-bold text-green-500">
                  {logs.filter(l => l.status === 'success').length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </Card>

          <Card className="p-4 border-red-500/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Failed</p>
                <p className="text-2xl font-bold text-red-500">
                  {logs.filter(l => l.status === 'failed').length}
                </p>
              </div>
              <AlertCircle className="h-8 w-8 text-red-500" />
            </div>
          </Card>

          <Card className="p-4 border-blue-500/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Video Access</p>
                <p className="text-2xl font-bold text-blue-500">
                  {logs.filter(l => l.actionType === 'play' || l.actionType === 'download').length}
                </p>
              </div>
              <Play className="h-8 w-8 text-blue-500" />
            </div>
          </Card>

          <Card className="p-4 border-purple-500/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground mb-1">System</p>
                <p className="text-2xl font-bold text-purple-500">
                  {logs.filter(l => l.actionType === 'system' || l.actionType === 'settings').length}
                </p>
              </div>
              <Settings className="h-8 w-8 text-purple-500" />
            </div>
          </Card>
        </div>

        {/* Logs List */}
        <div className="space-y-3">
          {logs.map((log) => (
            <Card key={log.id} className="p-4 sm:p-6 hover:bg-secondary/50 transition-colors">
              <div className="flex flex-col sm:flex-row items-start justify-between gap-3 mb-3">
                <div className="flex items-start gap-3 flex-1">
                  <div className={`p-2 rounded-lg ${
                    log.status === 'success' ? 'bg-green-500/10 text-green-500' :
                    log.status === 'failed' ? 'bg-red-500/10 text-red-500' :
                    'bg-yellow-500/10 text-yellow-500'
                  }`}>
                    {getActionIcon(log.actionType)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-base sm:text-lg mb-1">{log.action}</h3>
                    {log.resourceName && (
                      <p className="text-sm text-muted-foreground truncate">Resource: {log.resourceName}</p>
                    )}
                  </div>
                </div>
                {getStatusBadge(log.status)}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-3">
                <div className="flex items-center gap-2 text-sm">
                  <User className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs text-muted-foreground">User</p>
                    <p className="font-medium truncate">{log.username}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs text-muted-foreground">Date</p>
                    <p className="font-medium truncate">{format(log.timestamp, 'PPP')}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs text-muted-foreground">Time</p>
                    <p className="font-medium truncate">{format(log.timestamp, 'p')}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-sm">
                  <Activity className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs text-muted-foreground">IP Address</p>
                    <p className="font-medium font-mono truncate">{log.ipAddress}</p>
                  </div>
                </div>
              </div>

              {log.details && (
                <div className="mt-3 pt-3 border-t">
                  <p className="text-sm text-muted-foreground">
                    <span className="font-medium">Details:</span> {log.details}
                  </p>
                </div>
              )}
            </Card>
          ))}
        </div>

        {/* Info Card */}
        <Card className="mt-6 p-6 bg-purple-500/5 border-purple-500/20">
          <div className="flex items-start gap-4">
            <Shield className="h-6 w-6 text-purple-500 mt-1 flex-shrink-0" />
            <div>
              <h3 className="font-bold mb-2">Security & Compliance</h3>
              <p className="text-sm text-muted-foreground">
                All administrative actions are logged and monitored for security purposes. 
                Logs are retained for 90 days and can be exported for compliance reporting.
                Unauthorized access attempts are flagged and reported immediately.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AdminLogs;
