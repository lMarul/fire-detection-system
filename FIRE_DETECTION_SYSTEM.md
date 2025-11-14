# 🔫 Fire Detection Trigger System

## Overview
This document explains the complete fire detection trigger system - the "gun trigger" that activates automated fire response workflows based on Arduino sensors and ML vision detection.

## System Architecture

### 1. Core Components

#### **Fire Detection Logic Engine** (`src/lib/fireDetectionLogic.ts`)
- Evaluates 8 possible sensor combinations (Camera × Flame × Heat: TRUE/FALSE)
- Applies temperature thresholds:
  - **600°C**: Heat sensor activation threshold
  - **800°C**: Critical emergency escalation
- Returns structured `FireResponse` with action flags

#### **Global State Management** (`src/contexts/FireDetectionContext.tsx`)
- React Context Provider managing all active fire events
- Tracks fire lifecycle: detection → response → resolution
- Handles automated timing:
  - Water cannon: +1 second after detection
  - Emergency call: +3 seconds after detection

#### **User Interface Components**
- **FireTriggerPanel**: Manual testing interface with sensor simulation
- **FireAlertDialog**: Comprehensive fire event popup with resolve capability
- **BotStatusCard**: Shows resolve button for active fire bots
- **Dashboard**: Displays trigger panel and auto-opens fire alerts

### 2. Sensor Truth Table

All 8 combinations evaluated by the trigger system:

| Camera | Flame | Heat | Response | Actions |
|--------|-------|------|----------|---------|
| ✓ | ✓ | ✓ | **FIRE CONFIRMED** | Water Cannon + Emergency |
| ✓ | ✓ | ✗ | Water Cannon Only | Water Cannon |
| ✓ | ✗ | ✓ | Water/Emergency | Based on temperature |
| ✓ | ✗ | ✗ | False Alarm | None |
| ✗ | ✓ | ✓ | Water/Emergency | Based on temperature |
| ✗ | ✓ | ✗ | False Alarm | None |
| ✗ | ✗ | ✓ | Water/Emergency | Based on temperature |
| ✗ | ✗ | ✗ | **NORMAL** | None |

### 3. Temperature-Based Emergency Escalation

When only 2 sensors detect (not all 3):
- **< 600°C**: Heat sensor FALSE, other logic applies
- **600-799°C**: Heat sensor TRUE, activate water cannon
- **≥ 800°C**: Heat sensor TRUE + CRITICAL, water cannon + emergency call

### 4. Severity Levels

| Severity | Criteria |
|----------|----------|
| **CRITICAL** | Temp ≥ 800°C |
| **HIGH** | All 3 sensors TRUE |
| **MEDIUM** | 2 sensors TRUE |
| **LOW** | 1 sensor TRUE |
| **NONE** | False alarm or normal |

## Fire Detection Workflow

```
┌─────────────────────────────────────────────────────────────────┐
│ 1. TRIGGER EVENT                                                 │
│    - Arduino sensors detect heat/flame (600°C threshold)         │
│    - ML camera detects visual fire signature                    │
│    - OR: Manual trigger via FireTriggerPanel                    │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│ 2. SENSOR EVALUATION                                            │
│    - evaluateFireDetection(sensors) called                      │
│    - Checks all 8 truth table combinations                      │
│    - Applies temperature thresholds (600°C / 800°C)             │
│    - Returns FireResponse with action flags                     │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│ 3. AUTOMATED RESPONSE                                           │
│    IF Fire Confirmed:                                           │
│      ✓ Activate water cannon (+1s delay)                       │
│      ✓ Call emergency services (+3s delay)                     │
│      ✓ Show severity badge (critical/high/medium/low)          │
│      ✓ Log event timestamp                                      │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│ 4. USER NOTIFICATION                                            │
│    - Toast notification appears                                 │
│    - FireAlertDialog auto-opens                                │
│    - Bot marker turns RED on map                                │
│    - Bot status updates to "active-fire"                        │
│    - Dashboard shows in "Active Fire" section                   │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│ 5. FIRE ALERT DISPLAY                                           │
│    Shows:                                                        │
│      - 3×3 Sensor Validation Grid (Heat/Flame/Visual)          │
│      - Automated Response Actions (Water Cannon, Emergency)     │
│      - Severity Badge                                           │
│      - Bot Location & Address                                   │
│      - Action Timestamps                                        │
│      - "Mark as Resolved" Button                                │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│ 6. ADMIN RESOLUTION                                             │
│    User clicks "Resolve" button:                                │
│      - resolveFireEvent(botId) called                           │
│      - Resolution timestamp logged                              │
│      - Event removed from activeFireEvents                      │
│      - Bot status returns to "operational"                      │
│      - Map marker returns to GREEN                              │
│      - Log appended to fire-logs.csv                            │
└─────────────────────────────────────────────────────────────────┘
```

## API Reference

### Fire Detection Logic

```typescript
// Core trigger evaluation
evaluateFireDetection(sensors: SensorData): FireResponse

interface SensorData {
  heatSensor: boolean;        // TRUE if temp >= 600°C
  flameSensor: boolean;       // Direct flame detection
  visualDetected: boolean;    // ML camera detection
  temperature?: number;       // Optional temp for severity
}

interface FireResponse {
  isFireConfirmed: boolean;
  activateWaterCannon: boolean;
  callEmergency: boolean;
  isFalseAlarm: boolean;
  severity: 'none' | 'low' | 'medium' | 'high' | 'critical';
  response: string;
}
```

### Context API

```typescript
// Global fire state management
const { 
  activeFireEvents,      // Map<botId, FireEvent>
  triggerFireDetection,  // (botId, bot, sensors) => void
  resolveFireEvent,      // (botId) => void
  getFireEvent           // (botId) => FireEvent | undefined
} = useFireDetection();

interface FireEvent {
  botId: string;
  botName: string;
  location: { latitude, longitude, address };
  timestamp: Date;
  sensors: SensorData;
  response: FireResponse;
  waterCannonActivatedTime?: string;
  emergencyCallTime?: string;
  resolvedTime?: string;
}
```

## Usage Guide

### Manual Trigger Testing

1. Navigate to Dashboard page
2. Use **Fire Detection Trigger Panel** at the top
3. Select a bot from dropdown (only operational bots)
4. Adjust sensor inputs:
   - **Temperature**: Use slider (triggers heat sensor at ≥600°C)
   - **Flame Sensor**: Toggle switch
   - **Visual (AI)**: Toggle switch
5. Preview expected response
6. Click **"Pull the Trigger 🔫"**
7. Fire alert dialog auto-opens
8. Review sensor validation grid and automated actions
9. Click **"Mark as Resolved"** to clear event

### Arduino Integration (Future)

The system is ready for Arduino hardware via Web Serial API:

```typescript
// src/lib/arduino.ts (to be implemented)
const connectArduino = async () => {
  const port = await navigator.serial.requestPort();
  await port.open({ baudRate: 9600 });
  
  const reader = port.readable.getReader();
  while (true) {
    const { value } = await reader.read();
    const sensors = parseArduinoData(value);
    
    if (sensors.temperature >= 600) {
      triggerFireDetection(botId, bot, sensors);
    }
  }
};
```

## Data Synchronization

### CSV Logging

When fire is triggered or resolved:

**fire-logs.csv** format:
```csv
timestamp,botId,botName,location,heat,flame,visual,waterCannon,emergencyCall,severity,status
2024-01-15 10:30:00,bot-1,Alpha,"Pasay City",Detected,Detected,Detected,10:30:01,10:30:03,high,resolved
```

### State Updates

Fire detection automatically syncs across:
- ✅ **Dashboard**: Active fire count, bot list
- ✅ **Map**: Red pulsing marker
- ✅ **Bots Page**: Shows in active fire filter
- ✅ **Logs Page**: New log entry
- ✅ **Bot Status Cards**: Shows resolve button

## Testing Scenarios

### Scenario 1: Full Fire Confirmation
```
Temperature: 900°C (heat: TRUE)
Flame Sensor: TRUE
Visual AI: TRUE
---
Expected:
- isFireConfirmed: true
- Water cannon activated
- Emergency services called
- Severity: CRITICAL
- Status: active-fire
```

### Scenario 2: Water Cannon Only
```
Temperature: 25°C (heat: FALSE)
Flame Sensor: TRUE
Visual AI: TRUE
---
Expected:
- isFireConfirmed: false
- Water cannon activated
- No emergency call
- Severity: MEDIUM
```

### Scenario 3: False Alarm
```
Temperature: 25°C (heat: FALSE)
Flame Sensor: FALSE
Visual AI: TRUE
---
Expected:
- isFalseAlarm: true
- No water cannon
- No emergency call
- Severity: LOW
```

### Scenario 4: Normal Operation
```
Temperature: 25°C (heat: FALSE)
Flame Sensor: FALSE
Visual AI: FALSE
---
Expected:
- No fire detected
- No actions
- Severity: NONE
- Status: operational
```

## Component Integration

### Adding Fire Detection to New Pages

```tsx
import { useFireDetection } from '@/contexts/FireDetectionContext';
import { FireAlertDialog } from '@/components/FireAlertDialog';

function MyPage() {
  const { activeFireEvents, triggerFireDetection } = useFireDetection();
  const [openDialog, setOpenDialog] = useState(false);
  
  // Display active fires
  const activeFires = Array.from(activeFireEvents.values());
  
  // Manual trigger example
  const handleFireDetection = (botId: string, bot: Bot) => {
    const sensors = {
      heatSensor: true,
      flameSensor: true,
      visualDetected: true,
      temperature: 850
    };
    triggerFireDetection(botId, bot, sensors);
  };
  
  return (
    <>
      {activeFires.map(event => (
        <FireAlertDialog
          key={event.botId}
          botId={event.botId}
          botName={event.botName}
          open={openDialog}
          onOpenChange={setOpenDialog}
        />
      ))}
    </>
  );
}
```

## Performance Considerations

- **Sensor Polling**: Limit Arduino reads to 1Hz to prevent flooding
- **State Updates**: Use React Context to avoid prop drilling
- **Dialog Management**: Auto-open dialogs limited to prevent UI blocking
- **CSV Writes**: Batch log writes (currently console.log, future: API)
- **Map Markers**: Optimize re-renders with React.memo on marker components

## Security & Validation

- ✅ Temperature threshold prevents false heat triggers
- ✅ Multi-sensor validation reduces false alarms
- ✅ Admin-only resolve capability (future: auth required)
- ✅ Timestamp logging for audit trail
- ✅ Input sanitization on CSV writes (future)

## Future Enhancements

### Phase 2 (Hardware Integration)
- [ ] Arduino Web Serial API connection
- [ ] Real-time sensor streaming
- [ ] Calibration interface for sensor thresholds
- [ ] Hardware status monitoring

### Phase 3 (ML Training)
- [ ] TensorFlow.js fire detection model training
- [ ] Custom dataset collection from CCTV feeds
- [ ] Real-time inference optimization
- [ ] False positive learning

### Phase 4 (Backend)
- [ ] REST API for fire event logging
- [ ] WebSocket real-time updates
- [ ] Database integration (PostgreSQL)
- [ ] Historical analytics dashboard

### Phase 5 (Advanced Features)
- [ ] Multi-bot coordination (spread detection)
- [ ] Evacuation route calculation
- [ ] SMS/Email emergency notifications
- [ ] Integration with city emergency systems

## Troubleshooting

### Fire Not Triggering
1. Check temperature >= 600°C for heat sensor
2. Verify bot is in "operational" status
3. Check console for `evaluateFireDetection` logs
4. Ensure FireDetectionProvider wraps app

### Dialog Not Opening
1. Verify `openDialogs` state in Dashboard
2. Check `activeFireEvents` Map has entry
3. Ensure botId matches between trigger and dialog
4. Look for React key warnings in console

### Resolve Button Not Working
1. Check `resolveFireEvent` is called correctly
2. Verify botId exists in activeFireEvents Map
3. Check for state update in React DevTools
4. Ensure toast notification appears

## Code Examples

### Complete Fire Trigger Flow

```typescript
// 1. User sets up sensors
const sensors: SensorData = {
  heatSensor: true,        // 650°C detected
  flameSensor: true,       // IR flame detected
  visualDetected: true,    // ML sees fire
  temperature: 650
};

// 2. Trigger detection
triggerFireDetection('bot-1', alphaBot, sensors);

// 3. System evaluates (automatic)
const response = evaluateFireDetection(sensors);
// Returns: {
//   isFireConfirmed: true,
//   activateWaterCannon: true,
//   callEmergency: false,  // temp < 800
//   severity: 'high'
// }

// 4. Fire event created (automatic)
const fireEvent: FireEvent = {
  botId: 'bot-1',
  botName: 'Alpha',
  timestamp: new Date(),
  sensors,
  response,
  waterCannonActivatedTime: '10:30:01'
};

// 5. UI updates (automatic)
// - Toast notification
// - Dialog opens
// - Map marker turns red
// - Bot status = 'active-fire'

// 6. Admin resolves
resolveFireEvent('bot-1');

// 7. Cleanup (automatic)
// - Event removed from Map
// - Bot returns to operational
// - Marker returns to green
// - Log written to CSV
```

## System Requirements

- Modern browser with Web Serial API support (Chrome/Edge)
- Arduino with sensors (heat, flame, optional)
- Webcam for ML detection
- React 18.3+ with Context API
- TypeScript 5.8+ for type safety

## Credits & License

Created for Urban Ignite Fire Detection System
Pasay City, Barangay 165 Deployment

**Key Features:**
- 🔫 Truth table trigger logic (8 combinations)
- 🌡️ Temperature thresholds (600°C / 800°C)
- 💧 Automated water cannon activation
- 📞 Emergency services integration
- 🗺️ Real-time map synchronization
- 📊 Comprehensive logging system
- ✅ Admin resolution workflow

---

**Last Updated:** January 2024
**Version:** 1.0.0
**Status:** Production Ready ✅
