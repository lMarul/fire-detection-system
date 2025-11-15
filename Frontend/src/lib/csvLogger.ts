// CSV Logger for Fire Events
// In production, this would be replaced with API calls to a backend

export interface FireLogEntry {
  id: string;
  botId: string;
  botName: string;
  latitude: number;
  longitude: number;
  address: string;
  timestamp: string;
  temperature?: number;
  humidity?: number;
  fireConfidence?: number;
  heatDetected: boolean;
  flameDetected: boolean;
  visualDetected: boolean;
  acousticExtinguisherActivated: boolean;
  acousticExtinguisherActivatedTime?: string;
  emergencyCallTime?: string;
  status: 'active' | 'resolved' | 'cleared' | 'operational' | 'not-operational' | 'repairing';
  resolvedTime?: string;
}

export interface BotStatusLogEntry {
  id: string;
  botId: string;
  botName: string;
  latitude: number;
  longitude: number;
  address: string;
  timestamp: string;
  status: 'operational' | 'not-operational' | 'repairing';
}

// Store logs in localStorage until backend is ready
const FIRE_LOGS_KEY = 'fire_logs_pending';
const STATUS_LOGS_KEY = 'status_logs_pending';

export function logFireEvent(entry: FireLogEntry): void {
  try {
    // Get existing logs
    const existingLogs = getStoredLogs(FIRE_LOGS_KEY);
    
    // Add new log
    existingLogs.push(entry);
    
    // Store back
    localStorage.setItem(FIRE_LOGS_KEY, JSON.stringify(existingLogs));
    
    // Log to console for development
    console.log('🔥 FIRE EVENT LOGGED:', entry);
    console.log('📊 Total pending logs:', existingLogs.length);
    
    // In production, this would trigger an API call:
    // await fetch('/api/logs/fire', { method: 'POST', body: JSON.stringify(entry) });
  } catch (error) {
    console.error('Error logging fire event:', error);
  }
}

export function updateFireEventStatus(botId: string, status: 'resolved' | 'cleared', resolvedTime?: string): void {
  try {
    const existingLogs = getStoredLogs(FIRE_LOGS_KEY) as FireLogEntry[];
    
    console.log('🔍 Searching for active log. BotId:', botId);
    console.log('📊 Total logs in storage:', existingLogs.length);
    
    // Find ALL logs for this bot to debug
    const botLogs = existingLogs.filter(log => log.botId === botId);
    console.log('🤖 All logs for this bot:', botLogs);
    
    // Find the most recent active log for this bot
    const logIndex = existingLogs.findIndex(log => 
      log.botId === botId && log.status === 'active'
    );
    
    console.log('📍 Found log at index:', logIndex);
    
    if (logIndex !== -1) {
      // Update the existing log instead of creating a new one
      console.log('📝 Updating log from:', existingLogs[logIndex].status, 'to:', status);
      existingLogs[logIndex].status = status;
      if (resolvedTime) {
        existingLogs[logIndex].resolvedTime = resolvedTime;
      }
      
      // Store back
      localStorage.setItem(FIRE_LOGS_KEY, JSON.stringify(existingLogs));
      
      // Dispatch custom event to notify listeners (for same-window updates)
      window.dispatchEvent(new Event('fireLogsUpdated'));
      
      console.log('✓ FIRE EVENT UPDATED:', existingLogs[logIndex]);
      console.log('📊 Total pending logs:', existingLogs.length);
    } else {
      console.error('❌ No active fire log found for bot:', botId);
      console.log('💡 This might mean the log has a different status or botId format');
    }
    
    // In production: await fetch('/api/logs/fire/${logId}', { method: 'PATCH', body: JSON.stringify({ status, resolvedTime }) });
  } catch (error) {
    console.error('Error updating fire event:', error);
  }
}

export function logBotStatusChange(entry: BotStatusLogEntry): void {
  try {
    const existingLogs = getStoredLogs(STATUS_LOGS_KEY);
    existingLogs.push(entry);
    localStorage.setItem(STATUS_LOGS_KEY, JSON.stringify(existingLogs));
    
    console.log('📝 STATUS CHANGE LOGGED:', entry);
    
    // In production: await fetch('/api/logs/status', { method: 'POST', body: JSON.stringify(entry) });
  } catch (error) {
    console.error('Error logging status change:', error);
  }
}

export function getStoredLogs(key: string): any[] {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error reading stored logs:', error);
    return [];
  }
}

export function getPendingFireLogs(): FireLogEntry[] {
  return getStoredLogs(FIRE_LOGS_KEY);
}

export function getPendingStatusLogs(): BotStatusLogEntry[] {
  return getStoredLogs(STATUS_LOGS_KEY);
}

export function clearPendingLogs(key: string): void {
  localStorage.removeItem(key);
  console.log('✓ Cleared pending logs for:', key);
}

export function exportLogsToCSV(logs: FireLogEntry[]): string {
  if (logs.length === 0) return '';
  
  // CSV Header
  const headers = [
    'id', 'botId', 'botName', 'latitude', 'longitude', 'address', 
    'timestamp', 'temperature', 'humidity', 'fireConfidence',
    'heatDetected', 'flameDetected', 'visualDetected',
    'waterCannonActivated', 'waterCannonActivatedTime', 'emergencyCallTime',
    'status', 'resolvedTime'
  ];
  
  // CSV Rows
  const rows = logs.map(log => [
    log.id,
    log.botId,
    log.botName,
    log.latitude,
    log.longitude,
    `"${log.address}"`, // Quote address in case it has commas
    log.timestamp,
    log.temperature || '',
    log.humidity || '',
    log.fireConfidence || '',
    log.heatDetected,
    log.flameDetected,
    log.visualDetected,
    log.waterCannonActivated,
    log.waterCannonActivatedTime || '',
    log.emergencyCallTime || '',
    log.status,
    log.resolvedTime || ''
  ]);
  
  // Combine
  const csv = [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n');
  
  return csv;
}

export function downloadLogsAsCSV(logs: FireLogEntry[], filename: string = 'fire-logs.csv'): void {
  const csv = exportLogsToCSV(logs);
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  window.URL.revokeObjectURL(url);
}

// Generate unique log ID
export function generateLogId(): string {
  return `log-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Format timestamp for CSV
export function formatTimestamp(date: Date): string {
  return date.toISOString();
}

// Calculate fire confidence based on sensors (0-1 scale)
export function calculateFireConfidence(
  heatDetected: boolean,
  flameDetected: boolean,
  visualDetected: boolean,
  temperature?: number
): number {
  let confidence = 0;
  
  // Base confidence from sensors
  if (heatDetected) confidence += 0.33;
  if (flameDetected) confidence += 0.33;
  if (visualDetected) confidence += 0.34;
  
  // Boost confidence based on temperature
  if (temperature && temperature >= 800) {
    confidence = Math.min(1.0, confidence + 0.1); // Critical temp
  } else if (temperature && temperature >= 600) {
    confidence = Math.min(1.0, confidence + 0.05); // High temp
  }
  
  return Math.round(confidence * 100) / 100; // Round to 2 decimals
}
