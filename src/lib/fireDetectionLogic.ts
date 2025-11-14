/**
 * FIRE DETECTION TRIGGER LOGIC
 * 
 * This module handles the 3-component validation system for fire detection.
 * All triggers must be evaluated to determine the appropriate response.
 */

export interface SensorData {
  heatSensor: boolean;          // True if temperature >= 600°C
  flameSensor: boolean;         // True if flame detected
  visualDetected: boolean;      // True if ML detects fire in camera
  temperature?: number;         // Current temperature reading
}

export interface FireResponse {
  isFireConfirmed: boolean;     // All 3 sensors TRUE
  activateWaterCannon: boolean; // Water cannon should activate
  callEmergency: boolean;       // Emergency hotline should be called
  isFalseAlarm: boolean;        // All 3 sensors FALSE or invalid combination
  response: string;             // Human-readable response
  severity: 'none' | 'low' | 'medium' | 'high' | 'critical';
}

/**
 * Temperature threshold for heat sensor activation
 */
export const HEAT_THRESHOLD_CELSIUS = 600;

/**
 * Temperature threshold for critical emergency (immediate hotline call)
 */
export const CRITICAL_TEMP_CELSIUS = 800;

/**
 * Evaluate sensor data and determine fire response
 * 
 * LOGIC TABLE:
 * Camera | Flame | Heat | Result
 * -------|-------|------|--------
 * TRUE   | TRUE  | TRUE | FIRE CONFIRMED - Water Cannon + Emergency
 * FALSE  | FALSE | FALSE| Normal (Green Bot)
 * TRUE   | FALSE | FALSE| FALSE ALARM
 * TRUE   | TRUE  | FALSE| Water Cannon Only
 * FALSE  | TRUE  | TRUE | Water Cannon / Emergency (depends on temp)
 * TRUE   | FALSE | TRUE | Water Cannon / Emergency (depends on temp)
 * FALSE  | TRUE  | FALSE| FALSE ALARM
 */
export function evaluateFireDetection(sensors: SensorData): FireResponse {
  const { heatSensor, flameSensor, visualDetected, temperature = 0 } = sensors;

  // ALL TRUE - FIRE CONFIRMED
  if (heatSensor && flameSensor && visualDetected) {
    return {
      isFireConfirmed: true,
      activateWaterCannon: true,
      callEmergency: true,
      isFalseAlarm: false,
      response: 'FIRE CONFIRMED - Nearest station is on the way + Water Cannon Activated',
      severity: 'critical'
    };
  }

  // ALL FALSE - Normal Operation
  if (!heatSensor && !flameSensor && !visualDetected) {
    return {
      isFireConfirmed: false,
      activateWaterCannon: false,
      callEmergency: false,
      isFalseAlarm: false,
      response: 'Normal - All systems operational',
      severity: 'none'
    };
  }

  // Camera TRUE, Flame FALSE, Heat FALSE - FALSE ALARM
  if (visualDetected && !flameSensor && !heatSensor) {
    return {
      isFireConfirmed: false,
      activateWaterCannon: false,
      callEmergency: false,
      isFalseAlarm: true,
      response: 'FALSE ALARM - Visual only, no heat or flame detected',
      severity: 'none'
    };
  }

  // Camera TRUE, Flame TRUE, Heat FALSE - Water Cannon Only
  if (visualDetected && flameSensor && !heatSensor) {
    return {
      isFireConfirmed: false,
      activateWaterCannon: true,
      callEmergency: false,
      isFalseAlarm: false,
      response: 'Water Cannon Activated - Visual and flame detected',
      severity: 'medium'
    };
  }

  // Camera FALSE, Flame TRUE, Heat TRUE - Water Cannon / Emergency (temp dependent)
  if (!visualDetected && flameSensor && heatSensor) {
    const isCritical = temperature >= CRITICAL_TEMP_CELSIUS;
    return {
      isFireConfirmed: false,
      activateWaterCannon: true,
      callEmergency: isCritical,
      isFalseAlarm: false,
      response: isCritical 
        ? `CRITICAL - Water Cannon + Emergency (${temperature}°C)`
        : `Water Cannon Activated - Flame and heat detected (${temperature}°C)`,
      severity: isCritical ? 'critical' : 'high'
    };
  }

  // Camera TRUE, Flame FALSE, Heat TRUE - Water Cannon / Emergency (temp dependent)
  if (visualDetected && !flameSensor && heatSensor) {
    const isCritical = temperature >= CRITICAL_TEMP_CELSIUS;
    return {
      isFireConfirmed: false,
      activateWaterCannon: true,
      callEmergency: isCritical,
      isFalseAlarm: false,
      response: isCritical
        ? `CRITICAL - Water Cannon + Emergency (${temperature}°C)`
        : `Water Cannon Activated - Visual and heat detected (${temperature}°C)`,
      severity: isCritical ? 'critical' : 'high'
    };
  }

  // Camera FALSE, Flame TRUE, Heat FALSE - FALSE ALARM
  if (!visualDetected && flameSensor && !heatSensor) {
    return {
      isFireConfirmed: false,
      activateWaterCannon: false,
      callEmergency: false,
      isFalseAlarm: true,
      response: 'FALSE ALARM - Flame only, no heat or visual confirmation',
      severity: 'none'
    };
  }

  // Any other combination - treat as potential issue but not confirmed
  return {
    isFireConfirmed: false,
    activateWaterCannon: false,
    callEmergency: false,
    isFalseAlarm: true,
    response: 'UNHANDLED SENSOR COMBINATION - Check system',
    severity: 'low'
  };
}

/**
 * Check if temperature reading triggers heat sensor
 */
export function isHeatDetected(temperature: number): boolean {
  return temperature >= HEAT_THRESHOLD_CELSIUS;
}

/**
 * Determine bot status based on fire detection result
 */
export function getBotStatus(fireResponse: FireResponse, isOperational: boolean): 'operational' | 'active-fire' | 'not-operational' | 'repairing' {
  if (!isOperational) {
    return 'not-operational';
  }
  
  if (fireResponse.isFireConfirmed || fireResponse.activateWaterCannon) {
    return 'active-fire';
  }
  
  return 'operational';
}
