import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useFireDetection } from '@/contexts/FireDetectionContext';
import { SensorData } from '@/lib/fireDetectionLogic';
import { Flame } from 'lucide-react';

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

  const handleTrigger = () => {
    const bot = bots.find(b => b.id === selectedBotId);
    if (!bot) {
      console.error('Bot not found:', selectedBotId);
      return;
    }

    // Simplified: Always trigger fire with acoustic extinguisher activation
    const sensors: SensorData = {
      heatSensor: true,
      flameSensor: true,
      visualDetected: true,
      temperature: 650
    };

    console.log('Triggering fire detection:', { botId: selectedBotId, bot, sensors });
    triggerFireDetection(selectedBotId, bot as any, sensors);
  };

  // Handle Enter key press
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === 'Enter' && selectedBotId) {
        handleTrigger();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [selectedBotId]);

  // Include operational and active-fire bots (can re-test active fires)
  const availableBots = bots.filter(b => 
    b.status === 'operational' || b.status === 'active-fire'
  );

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <Flame className="h-5 w-5 text-orange-500" />
        <h3 className="font-bold text-lg">🔫 Fire Detection Trigger Panel</h3>
      </div>
      
      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium mb-2 block">Select Bot</label>
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

        <div className="bg-blue-500/10 border border-blue-500 p-4 rounded-lg text-center">
          <p className="text-sm font-medium text-blue-600">
            🔊 Acoustic Fire Extinguisher will be activated
          </p>
        </div>

        <Button 
          onClick={handleTrigger}
          disabled={!selectedBotId}
          className="w-full bg-orange-600 hover:bg-orange-700 text-lg py-6"
        >
          <Flame className="h-5 w-5 mr-2" />
          Trigger Fire Alert (Press Enter)
        </Button>

        {selectedBotId && (
          <p className="text-xs text-center text-muted-foreground">
            Press Enter on your keyboard to trigger
          </p>
        )}
      </div>
    </Card>
  );
};
