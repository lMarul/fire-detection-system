import { FireBot } from '@/types/bot';
import { Card } from '@/components/ui/card';
import { AlertCircle, CheckCircle } from 'lucide-react';

interface BotStatusCardProps {
  bot: FireBot;
}

const BotStatusCard = ({ bot }: BotStatusCardProps) => {
  const isActive = bot.status === 'active';

  return (
    <Card className="p-4 hover:bg-secondary/50 transition-colors">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="font-semibold text-lg mb-1">{bot.name}</h3>
          <p className="text-sm text-muted-foreground mb-2">ID: {bot.id}</p>
          <div className="flex items-center gap-2">
            {isActive ? (
              <>
                <AlertCircle className="h-4 w-4 text-destructive" />
                <span className="text-sm font-medium text-destructive">
                  Fire Detected
                </span>
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4 text-success" />
                <span className="text-sm font-medium text-success">
                  Operational
                </span>
              </>
            )}
          </div>
          {isActive && bot.lastActive && (
            <p className="text-xs text-muted-foreground mt-2">
              Active since: {bot.lastActive}
            </p>
          )}
        </div>
        <div
          className={`w-3 h-3 rounded-full ${
            isActive ? 'bg-destructive' : 'bg-success'
          } animate-pulse`}
        />
      </div>
    </Card>
  );
};

export default BotStatusCard;
