import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Camera, Signal, AlertTriangle } from 'lucide-react';
import { useWebcam } from '@/hooks/useWebcam';

// Bot interface matching CSV structure
interface Bot {
  id: string;
  name: string;
  latitude?: number;
  longitude?: number;
  address?: string;
  status?: string;
  lastActivity?: Date;
  temperature?: number;
  humidity?: number;
  waterCannonStatus?: boolean;
  heatSensor?: boolean;
  flameSensor?: boolean;
  cameraSensor?: boolean;
  batteryLevel?: number;
  charging?: boolean;
}

interface CCTVDialogProps {
  bot: Bot | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CCTVDialog = ({ bot, open, onOpenChange }: CCTVDialogProps) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const { videoRef, isActive, error, startWebcam, stopWebcam } = useWebcam();

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Start webcam when dialog opens
  useEffect(() => {
    if (open) {
      startWebcam();
    } else {
      stopWebcam();
    }
  }, [open]);

  if (!bot) return null;

  const formatDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const formatTime = (date: Date) => {
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl bg-black border-2 border-green-500/50 z-[10000]">
        <DialogHeader className="border-b border-green-500/30 pb-2">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-green-500 font-mono flex items-center gap-2">
              <Camera className="w-5 h-5" />
              SURVEILLANCE CAMERA - {bot.name.toUpperCase()}
            </DialogTitle>
            <div className="flex items-center gap-2 text-green-500 font-mono text-sm">
              <Signal className="w-4 h-4 animate-pulse" />
              <span>LIVE</span>
            </div>
          </div>
        </DialogHeader>

        {/* CCTV Video Feed */}
        <div className="relative aspect-video bg-gray-900 overflow-hidden">
          {/* Live Webcam Feed */}
          <div className="absolute inset-0">
            {error ? (
              <div className="flex flex-col items-center justify-center h-full bg-gray-900 text-red-500">
                <AlertTriangle className="w-16 h-16 mb-4" />
                <p className="font-mono text-sm">CAMERA ACCESS DENIED</p>
                <p className="font-mono text-xs opacity-60 mt-2">{error}</p>
                <p className="font-mono text-xs opacity-60 mt-4">Please allow camera access in browser settings</p>
              </div>
            ) : (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
            )}
          </div>

          {/* Scanline effect */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute inset-0 opacity-10 bg-gradient-to-b from-transparent via-green-500/10 to-transparent animate-scan" />
          </div>

          {/* Grid overlay */}
          <div className="absolute inset-0 pointer-events-none opacity-20">
            <div className="grid grid-cols-3 grid-rows-3 h-full w-full">
              {[...Array(9)].map((_, i) => (
                <div key={i} className="border border-green-500/20" />
              ))}
            </div>
          </div>

          {/* Top overlay - Date & Time */}
          <div className="absolute top-0 left-0 right-0 bg-black/80 px-4 py-2 border-b border-green-500/30">
            <div className="flex justify-between items-center font-mono text-green-500">
              <div className="flex items-center gap-4">
                <span className="text-sm">CAM-{bot.id.split('-')[1]}</span>
                <span className="text-xs opacity-75">{bot.name}</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm">{formatDate(currentTime)}</span>
                <span className="text-lg font-bold tabular-nums">{formatTime(currentTime)}</span>
              </div>
            </div>
          </div>

          {/* Bottom overlay - Bot info */}
          <div className="absolute bottom-0 left-0 right-0 bg-black/80 px-4 py-3 border-t border-green-500/30">
            <div className="grid grid-cols-3 gap-4 font-mono text-xs text-green-500">
              <div>
                <div className="opacity-60 mb-1">STATUS</div>
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${bot.status === 'active' ? 'bg-red-500 animate-pulse' : 'bg-green-500'}`} />
                  <span className="uppercase font-bold">{bot.status}</span>
                </div>
              </div>
              <div>
                <div className="opacity-60 mb-1">COORDINATES</div>
                <div className="font-bold">
                  {bot.latitude?.toFixed(4) || 'N/A'}°N, {bot.longitude?.toFixed(4) || 'N/A'}°E
                </div>
              </div>
              <div>
                <div className="opacity-60 mb-1">BATTERY</div>
                <div className="font-bold">
                  {bot.batteryLevel || 0}% {bot.charging ? '(Charging)' : ''}
                </div>
              </div>
            </div>
          </div>

          {/* Recording indicator */}
          <div className="absolute top-16 left-4 flex items-center gap-2 bg-red-600/90 px-3 py-1 rounded-sm">
            <div className="w-3 h-3 bg-white rounded-full animate-pulse" />
            <span className="text-white font-mono text-xs font-bold">REC</span>
          </div>
        </div>

        <style dangerouslySetInnerHTML={{
          __html: `
            @keyframes scan {
              0% {
                transform: translateY(-100%);
              }
              100% {
                transform: translateY(100%);
              }
            }
            .animate-scan {
              animation: scan 3s linear infinite;
            }
          `
        }} />
      </DialogContent>
    </Dialog>
  );
};

export default CCTVDialog;
