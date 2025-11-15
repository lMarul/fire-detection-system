import React, { createContext, useContext, useState, useCallback } from 'react';
import { evaluateFireDetection, SensorData, FireResponse } from '@/lib/fireDetectionLogic';
import { 
  logFireEvent as saveFireLog, 
  updateFireEventStatus,
  generateLogId, 
  formatTimestamp, 
  calculateFireConfidence,
  FireLogEntry 
} from '@/lib/csvLogger';
import { toast } from 'sonner';

interface Bot {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  address: string;
  status: 'operational' | 'not-operational' | 'repairing' | 'active-fire';
}

interface FireEvent {
  botId: string;
  botName: string;
  location: { latitude: number; longitude: number; address: string };
  timestamp: Date;
  sensors: SensorData;
  response: FireResponse;
  acousticExtinguisherActivatedTime?: string;
  emergencyCallTime?: string;
  resolvedTime?: string;
}

interface FireDetectionContextType {
  activeFireEvents: Map<string, FireEvent>;
  triggerFireDetection: (botId: string, bot: Bot, sensors: SensorData) => void;
  resolveFireEvent: (botId: string) => void;
  getFireEvent: (botId: string) => FireEvent | undefined;
}

const FireDetectionContext = createContext<FireDetectionContextType | undefined>(undefined);

export const FireDetectionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeFireEvents, setActiveFireEvents] = useState<Map<string, FireEvent>>(new Map());

  const triggerFireDetection = useCallback((botId: string, bot: Bot, sensors: SensorData) => {
    const response = evaluateFireDetection(sensors);
    const timestamp = new Date();

    // Create fire event
    const fireEvent: FireEvent = {
      botId,
      botName: bot.name,
      location: {
        latitude: bot.latitude,
        longitude: bot.longitude,
        address: bot.address
      },
      timestamp,
      sensors,
      response
    };

    // Add timestamps for actions
    if (response.activateAcousticExtinguisher) {
      const extinguisherTime = new Date(timestamp.getTime() + 1000); // 1 second after detection
      fireEvent.acousticExtinguisherActivatedTime = extinguisherTime.toLocaleTimeString('en-US', { hour12: false });
    }

    if (response.callEmergency) {
      const emergencyTime = new Date(timestamp.getTime() + 3000); // 3 seconds after detection
      fireEvent.emergencyCallTime = emergencyTime.toLocaleTimeString('en-US', { hour12: false });
    }

    // Update active events
    setActiveFireEvents(prev => {
      const newMap = new Map(prev);
      newMap.set(botId, fireEvent);
      return newMap;
    });

    // Show appropriate toasts based on response
    if (response.isFireConfirmed) {
      toast.error(`🔥 FIRE CONFIRMED - ${bot.name}`, {
        description: response.response,
        duration: 0, // Don't auto-dismiss
        action: {
          label: 'View',
          onClick: () => {
            // Will be handled by the map to open popup
            window.dispatchEvent(new CustomEvent('fire-detected', { detail: { botId } }));
          }
        }
      });
    } else if (response.activateAcousticExtinguisher) {
      toast.warning(`🔊 Acoustic Fire Extinguisher Activated - ${bot.name}`, {
        description: response.response,
        duration: 10000
      });
    } else if (response.isFalseAlarm) {
      toast.info(`✓ False Alarm - ${bot.name}`, {
        description: response.response,
        duration: 5000
      });
    }

    // Log to CSV (localStorage for now, API in production)
    const logEntry: FireLogEntry = {
      id: generateLogId(),
      botId,
      botName: bot.name,
      latitude: bot.latitude,
      longitude: bot.longitude,
      address: bot.address,
      timestamp: formatTimestamp(timestamp),
      temperature: sensors.temperature,
      humidity: undefined, // Could be added from bot sensors later
      fireConfidence: calculateFireConfidence(
        sensors.heatSensor,
        sensors.flameSensor,
        sensors.visualDetected,
        sensors.temperature
      ),
      heatDetected: sensors.heatSensor,
      flameDetected: sensors.flameSensor,
      visualDetected: sensors.visualDetected,
      acousticExtinguisherActivated: response.activateAcousticExtinguisher,
      acousticExtinguisherActivatedTime: fireEvent.acousticExtinguisherActivatedTime,
      emergencyCallTime: fireEvent.emergencyCallTime,
      status: response.isFireConfirmed ? 'active' : response.isFalseAlarm ? 'cleared' : 'active'
    };
    
    saveFireLog(logEntry);

  }, []);

  const resolveFireEvent = useCallback((botId: string) => {
    const event = activeFireEvents.get(botId);
    if (!event) return;

    const resolvedTime = new Date();
    const resolvedTimeString = resolvedTime.toLocaleTimeString('en-US', { hour12: false });

    // Update the existing log entry instead of creating a new one
    updateFireEventStatus(botId, 'resolved', resolvedTimeString);

    // Remove from active events
    setActiveFireEvents(prev => {
      const newMap = new Map(prev);
      newMap.delete(botId);
      return newMap;
    });

    toast.success(`✓ Issue Resolved - ${event.botName}`, {
      description: `Incident resolved at ${resolvedTimeString}`,
      duration: 5000
    });
  }, [activeFireEvents]);

  const getFireEvent = useCallback((botId: string) => {
    return activeFireEvents.get(botId);
  }, [activeFireEvents]);

  return (
    <FireDetectionContext.Provider value={{ 
      activeFireEvents, 
      triggerFireDetection, 
      resolveFireEvent,
      getFireEvent 
    }}>
      {children}
    </FireDetectionContext.Provider>
  );
};

export const useFireDetection = () => {
  const context = useContext(FireDetectionContext);
  if (!context) {
    throw new Error('useFireDetection must be used within FireDetectionProvider');
  }
  return context;
};
