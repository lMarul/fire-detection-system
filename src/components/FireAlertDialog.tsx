import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Flame, Phone, Droplet, CheckCircle, AlertTriangle } from 'lucide-react';
import { useFireDetection } from '@/contexts/FireDetectionContext';
import { Badge } from '@/components/ui/badge';

interface FireAlertDialogProps {
  botId: string;
  botName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onResolve?: () => void;
}

export const FireAlertDialog = ({ 
  botId, 
  botName, 
  open, 
  onOpenChange,
  onResolve 
}: FireAlertDialogProps) => {
  const { getFireEvent, resolveFireEvent } = useFireDetection();
  const fireEvent = getFireEvent(botId);

  if (!fireEvent) return null;

  const handleResolve = () => {
    resolveFireEvent(botId);
    onOpenChange(false);
    onResolve?.();
  };

  const { response, sensors } = fireEvent;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-2xl">
        <AlertDialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-full bg-red-500 flex items-center justify-center animate-pulse">
              <Flame className="h-6 w-6 text-white" />
            </div>
            <div>
              <AlertDialogTitle className="text-2xl">
                🔥 {response.isFireConfirmed ? 'FIRE CONFIRMED' : 'FIRE ALERT'}
              </AlertDialogTitle>
              <p className="text-sm text-muted-foreground">{botName}</p>
            </div>
          </div>
          <AlertDialogDescription className="text-base">
            {fireEvent.location.address}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-4 py-4">
          {/* Sensor Status */}
          <div className="bg-secondary/30 p-4 rounded-lg">
            <h3 className="font-semibold mb-3 text-sm">SENSOR VALIDATION</h3>
            <div className="grid grid-cols-3 gap-3">
              <div className={`p-3 rounded border-2 ${
                sensors.heatSensor 
                  ? 'bg-red-500/10 border-red-500' 
                  : 'bg-gray-500/10 border-gray-500'
              }`}>
                <div className="text-xs opacity-70">HEAT SENSOR</div>
                <div className="font-bold mt-1">
                  {sensors.heatSensor ? '✓ Detected' : '✗ Clear'}
                </div>
                {sensors.temperature && (
                  <div className="text-xs mt-1">{sensors.temperature}°C</div>
                )}
              </div>
              <div className={`p-3 rounded border-2 ${
                sensors.flameSensor 
                  ? 'bg-orange-500/10 border-orange-500' 
                  : 'bg-gray-500/10 border-gray-500'
              }`}>
                <div className="text-xs opacity-70">FLAME SENSOR</div>
                <div className="font-bold mt-1">
                  {sensors.flameSensor ? '✓ Detected' : '✗ Clear'}
                </div>
              </div>
              <div className={`p-3 rounded border-2 ${
                sensors.visualDetected 
                  ? 'bg-yellow-500/10 border-yellow-500' 
                  : 'bg-gray-500/10 border-gray-500'
              }`}>
                <div className="text-xs opacity-70">VISUAL (AI)</div>
                <div className="font-bold mt-1">
                  {sensors.visualDetected ? '✓ Detected' : '✗ Clear'}
                </div>
              </div>
            </div>
          </div>

          {/* Response Actions */}
          <div className="space-y-2">
            <h3 className="font-semibold text-sm">AUTOMATED RESPONSE</h3>
            
            {response.activateWaterCannon && (
              <div className="flex items-center gap-3 p-3 bg-blue-500/10 border border-blue-500 rounded-lg">
                <Droplet className="h-5 w-5 text-blue-500" />
                <div className="flex-1">
                  <div className="font-medium">Water Cannon Activated</div>
                  {fireEvent.waterCannonActivatedTime && (
                    <div className="text-xs text-muted-foreground">
                      Activated at {fireEvent.waterCannonActivatedTime}
                    </div>
                  )}
                </div>
                <CheckCircle className="h-5 w-5 text-green-500" />
              </div>
            )}

            {response.callEmergency && (
              <div className="flex items-center gap-3 p-3 bg-purple-500/10 border border-purple-500 rounded-lg">
                <Phone className="h-5 w-5 text-purple-500" />
                <div className="flex-1">
                  <div className="font-medium">Emergency Services Contacted</div>
                  {fireEvent.emergencyCallTime && (
                    <div className="text-xs text-muted-foreground">
                      Called at {fireEvent.emergencyCallTime}
                    </div>
                  )}
                </div>
                <CheckCircle className="h-5 w-5 text-green-500" />
              </div>
            )}

            {response.isFalseAlarm && (
              <div className="flex items-center gap-3 p-3 bg-yellow-500/10 border border-yellow-500 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-yellow-500" />
                <div className="flex-1">
                  <div className="font-medium">False Alarm Detected</div>
                  <div className="text-xs text-muted-foreground">
                    Insufficient sensor validation
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Severity Badge */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Severity:</span>
            <Badge variant={
              response.severity === 'critical' ? 'destructive' :
              response.severity === 'high' ? 'destructive' :
              response.severity === 'medium' ? 'default' :
              'secondary'
            }>
              {response.severity.toUpperCase()}
            </Badge>
          </div>

          {/* Response Message */}
          <div className="bg-primary/5 p-3 rounded-lg border">
            <div className="text-sm font-medium">{response.response}</div>
          </div>
        </div>

        <AlertDialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            View Later
          </Button>
          <AlertDialogAction asChild>
            <Button 
              onClick={handleResolve}
              className="bg-green-600 hover:bg-green-700"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Mark as Resolved
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
