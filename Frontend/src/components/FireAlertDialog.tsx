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
      <AlertDialogContent className="max-w-2xl mx-4">
        <AlertDialogHeader>
          <div className="flex flex-col items-center justify-center text-center py-4 sm:py-8">
            <div className="w-16 h-16 sm:w-24 sm:h-24 rounded-full bg-red-500 flex items-center justify-center animate-pulse mb-4 sm:mb-6">
              <Flame className="h-8 w-8 sm:h-12 sm:w-12 text-white" />
            </div>
            <AlertDialogTitle className="text-4xl sm:text-5xl lg:text-6xl font-black text-red-600 mb-3 sm:mb-4">
              FIRE ALERT
            </AlertDialogTitle>
            <div className="text-xl sm:text-2xl font-bold text-blue-600 mb-2 px-2">
              🔊 Acoustic Fire Extinguisher Activated
            </div>
            <p className="text-base sm:text-lg text-muted-foreground mt-3 sm:mt-4">{botName}</p>
            <AlertDialogDescription className="text-sm sm:text-base mt-2 px-4">
              {fireEvent.location.address}
            </AlertDialogDescription>
          </div>
        </AlertDialogHeader>

        <AlertDialogFooter className="mt-4 sm:mt-8 flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="w-full sm:w-auto">
            View Later
          </Button>
          <AlertDialogAction asChild>
            <Button 
              onClick={handleResolve}
              className="bg-green-600 hover:bg-green-700 w-full sm:w-auto"
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
