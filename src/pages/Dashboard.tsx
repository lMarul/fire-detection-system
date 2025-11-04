import { useState } from 'react';
import Navigation from '@/components/Navigation';
import BotMap from '@/components/BotMap';
import BotStatusCard from '@/components/BotStatusCard';
import { mockBots } from '@/data/mockData';
import { Card } from '@/components/ui/card';
import { AlertCircle, CheckCircle, Shield } from 'lucide-react';

const Dashboard = () => {
  const [bots] = useState(mockBots);

  const activeBots = bots.filter((bot) => bot.status === 'active');
  const inactiveBots = bots.filter((bot) => bot.status === 'inactive');

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-4 py-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total Bots</p>
                <p className="text-3xl font-bold">{bots.length}</p>
              </div>
              <Shield className="h-10 w-10 text-primary" />
            </div>
          </Card>

          <Card className="p-6 border-destructive/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Active Alerts</p>
                <p className="text-3xl font-bold text-destructive">{activeBots.length}</p>
              </div>
              <AlertCircle className="h-10 w-10 text-destructive" />
            </div>
          </Card>

          <Card className="p-6 border-success/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Operational</p>
                <p className="text-3xl font-bold text-success">{inactiveBots.length}</p>
              </div>
              <CheckCircle className="h-10 w-10 text-success" />
            </div>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Map */}
          <div className="lg:col-span-2">
            <Card className="p-4">
              <h2 className="text-xl font-bold mb-4">Bot Deployment Map</h2>
              <div className="h-[500px]">
                <BotMap bots={bots} />
              </div>
            </Card>
          </div>

          {/* Bot List */}
          <div className="lg:col-span-1">
            <Card className="p-4">
              <h2 className="text-xl font-bold mb-4">Bot Status</h2>
              <div className="space-y-3 max-h-[500px] overflow-y-auto">
                {activeBots.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-destructive mb-2">
                      Active Alerts ({activeBots.length})
                    </h3>
                    {activeBots.map((bot) => (
                      <BotStatusCard key={bot.id} bot={bot} />
                    ))}
                  </div>
                )}
                
                {inactiveBots.length > 0 && (
                  <div className="mt-4">
                    <h3 className="text-sm font-semibold text-success mb-2">
                      Operational ({inactiveBots.length})
                    </h3>
                    {inactiveBots.map((bot) => (
                      <BotStatusCard key={bot.id} bot={bot} />
                    ))}
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
