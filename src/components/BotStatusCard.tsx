import { Card } from '@/components/ui/card';
import { AlertCircle, CheckCircle, XCircle, Wrench } from 'lucide-react';

// Bot interface matching CSV structure
interface Bot {
  id: string;
  name: string;
  status: 'operational' | 'not-operational' | 'repairing' | 'active-fire';
  lastActivity?: Date;
  batteryLevel?: number;
  temperature?: number;
  charging?: boolean;
}

interface BotStatusCardProps {
  bot: Bot;
}

const BotStatusCard = ({ bot }: BotStatusCardProps) => {
  const getStatusIcon = () => {
    switch (bot.status) {
      case 'operational':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'active-fire':
        return <AlertCircle className="h-4 w-4 text-destructive" />;
      case 'not-operational':
        return <XCircle className="h-4 w-4 text-gray-500" />;
      case 'repairing':
        return <Wrench className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getStatusText = () => {
    switch (bot.status) {
      case 'operational':
        return { text: 'Operational', color: 'text-green-500' };
      case 'active-fire':
        return { text: 'Fire Detected', color: 'text-destructive' };
      case 'not-operational':
        return { text: 'Not Operational', color: 'text-gray-500' };
      case 'repairing':
        return { text: 'Under Repair', color: 'text-yellow-500' };
    }
  };

  const getStatusDotColor = () => {
    switch (bot.status) {
      case 'operational':
        return 'bg-green-500';
      case 'active-fire':
        return 'bg-destructive animate-pulse';
      case 'not-operational':
        return 'bg-gray-500';
      case 'repairing':
        return 'bg-yellow-500 animate-pulse';
    }
  };

  const statusInfo = getStatusText();

  return (
    <Card className="p-4 hover:bg-secondary/50 transition-colors">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="font-semibold text-lg mb-1">{bot.name}</h3>
          <p className="text-sm text-muted-foreground mb-2">ID: {bot.id}</p>
          <div className="flex items-center gap-2 mb-2">
            {getStatusIcon()}
            <span className={`text-sm font-medium ${statusInfo.color}`}>
              {statusInfo.text}
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            Battery: {bot.batteryLevel || 0}% {bot.charging ? '⚡ Charging' : ''}
          </p>
          {bot.temperature !== undefined && (
            <p className="text-xs text-muted-foreground">
              Temp: {bot.temperature}°C
            </p>
          )}
        </div>
        <div className={`w-3 h-3 rounded-full ${getStatusDotColor()}`} />
      </div>
    </Card>
  );
};

export default BotStatusCard;
