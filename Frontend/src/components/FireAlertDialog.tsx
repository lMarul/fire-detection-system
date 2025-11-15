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
import { Flame, CheckCircle } from 'lucide-react';
import { useFireDetection } from '@/contexts/FireDetectionContext';

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

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-2xl">
        <AlertDialogHeader>
          <div className="flex flex-col items-center justify-center text-center py-8">
            <div className="w-24 h-24 rounded-full bg-red-500 flex items-center justify-center animate-pulse mb-6">
              <Flame className="h-12 w-12 text-white" />
            </div>
            <AlertDialogTitle className="text-6xl font-black text-red-600 mb-4">
              FIRE ALERT
            </AlertDialogTitle>
            <div className="text-2xl font-bold text-blue-600 mb-2">
              🔊 Acoustic Fire Extinguisher Activated
            </div>
            <p className="text-lg text-muted-foreground mt-4">{botName}</p>
            <AlertDialogDescription className="text-base mt-2">
              {fireEvent.location.address}
            </AlertDialogDescription>
          </div>
        </AlertDialogHeader>

        <AlertDialogFooter className="mt-8">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            View Later
          </Button>
          <AlertDialogAction asChild>
            <Button 
              onClick={handleResolve}
              className="bg-green-600 hover:bg-green-700"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Resolve Issue
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
