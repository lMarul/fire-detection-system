import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useFireDetection } from '@/contexts/FireDetectionContext';
import { SensorData } from '@/lib/fireDetectionLogic';
import { Flame, Thermometer, Camera, AlertCircle } from 'lucide-react';

interface Bot {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  address: string;
  status: string;
}

interface FireTriggerPanelProps {
  bots: Bot[];
}

export const FireTriggerPanel = ({ bots }: FireTriggerPanelProps) => {
  const { triggerFireDetection } = useFireDetection();
  const [selectedBotId, setSelectedBotId] = useState<string>('');
  const [temperature, setTemperature] = useState<number>(25);
  const [flameSensor, setFlameSensor] = useState<boolean>(false);
  const [visualDetected, setVisualDetected] = useState<boolean>(false);

  const handleTrigger = () => {
    const bot = bots.find(b => b.id === selectedBotId);
    if (!bot) {
      console.error('Bot not found:', selectedBotId);
      return;
    }

    const sensors: SensorData = {
      heatSensor: temperature >= 600,
      flameSensor,
      visualDetected,
      temperature
    };

    console.log('Triggering fire detection:', { botId: selectedBotId, bot, sensors });
    triggerFireDetection(selectedBotId, bot as any, sensors);
    
    // Reset form after triggering
    setTemperature(25);
    setFlameSensor(false);
    setVisualDetected(false);
  };

  // Include operational and active-fire bots (can re-test active fires)
  const availableBots = bots.filter(b => 
    b.status === 'operational' || b.status === 'active-fire'
  );

  console.log('FireTriggerPanel - Total bots:', bots.length, 'Available:', availableBots.length);

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <Flame className="h-5 w-5 text-orange-500" />
        <h3 className="font-bold text-lg">🔫 Fire Detection Trigger Panel</h3>
      </div>
      
      <div className="space-y-4">
        <div>
          <Label>Select Bot</Label>
          <Select value={selectedBotId} onValueChange={setSelectedBotId}>
            <SelectTrigger>
              <SelectValue placeholder="Choose a bot..." />
            </SelectTrigger>
            <SelectContent>
              {availableBots.length === 0 ? (
                <SelectItem value="none" disabled>No operational bots available</SelectItem>
              ) : (
                availableBots.map(bot => (
                  <SelectItem key={bot.id} value={bot.id}>
                    {bot.name} - {bot.address || bot.id}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Thermometer className="h-4 w-4" />
              Temperature (°C)
            </Label>
            <Input 
              type="number" 
              value={temperature}
              onChange={(e) => setTemperature(Number(e.target.value))}
              placeholder="Temperature"
            />
            <p className="text-xs text-muted-foreground">
              Heat Sensor: {temperature >= 600 ? '✓ TRUE (≥600°C)' : '✗ FALSE'}
            </p>
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Flame className="h-4 w-4" />
              Flame Sensor
            </Label>
            <div className="flex items-center gap-2 h-10">
              <Switch 
                checked={flameSensor}
                onCheckedChange={setFlameSensor}
              />
              <span className="text-sm">
                {flameSensor ? '✓ TRUE' : '✗ FALSE'}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Direct flame detection
            </p>
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Camera className="h-4 w-4" />
              Visual (AI)
            </Label>
            <div className="flex items-center gap-2 h-10">
              <Switch 
                checked={visualDetected}
                onCheckedChange={setVisualDetected}
              />
              <span className="text-sm">
                {visualDetected ? '✓ TRUE' : '✗ FALSE'}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              ML fire detection
            </p>
          </div>
        </div>

        <div className="bg-secondary/30 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="h-4 w-4" />
            <span className="font-semibold text-sm">Preview Response:</span>
          </div>
          <p className="text-sm">
            {temperature >= 600 && flameSensor && visualDetected 
              ? '🔥 FIRE CONFIRMED - Water Cannon + Emergency Call'
              : temperature >= 600 && flameSensor
              ? '💧 Water Cannon / Emergency (temp dependent)'
              : temperature >= 600 && visualDetected
              ? '💧 Water Cannon / Emergency (temp dependent)'
              : visualDetected && flameSensor
              ? '💧 Water Cannon Only'
              : !temperature && !flameSensor && !visualDetected
              ? '✓ Normal Operation'
              : '⚠️ False Alarm or Invalid Combination'}
          </p>
        </div>

        <Button 
          onClick={handleTrigger}
          disabled={!selectedBotId}
          className="w-full bg-orange-600 hover:bg-orange-700"
        >
          <Flame className="h-4 w-4 mr-2" />
          Pull the Trigger 🔫
        </Button>
      </div>
    </Card>
  );
};
