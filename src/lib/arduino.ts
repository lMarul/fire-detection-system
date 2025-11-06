import { FireBot } from '@/types/bot';

// Arduino communication service
export class ArduinoService {
  private static instance: ArduinoService;
  private port: any | null = null; // SerialPort type
  private reader: ReadableStreamDefaultReader<Uint8Array> | null = null;
  private isConnected: boolean = false;
  private listeners: ((data: ArduinoData) => void)[] = [];

  private constructor() {}

  static getInstance(): ArduinoService {
    if (!ArduinoService.instance) {
      ArduinoService.instance = new ArduinoService();
    }
    return ArduinoService.instance;
  }

  // Connect to Arduino via Web Serial API
  async connect(): Promise<boolean> {
    try {
      // Check if Web Serial API is supported
      if (!('serial' in navigator)) {
        console.error('Web Serial API not supported in this browser');
        return false;
      }

      // Request port access
      this.port = await (navigator as any).serial.requestPort();
      
      // Open the serial port with Arduino's default baud rate
      await this.port.open({ baudRate: 9600 });
      
      this.isConnected = true;
      console.log('Arduino connected successfully');
      
      // Start reading data
      this.startReading();
      
      return true;
    } catch (error) {
      console.error('Failed to connect to Arduino:', error);
      return false;
    }
  }

  // Start reading data from Arduino
  private async startReading() {
    if (!this.port || !this.port.readable) return;

    try {
      this.reader = this.port.readable.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (this.isConnected) {
        const { value, done } = await this.reader.read();
        if (done) break;

        // Decode incoming data
        buffer += decoder.decode(value, { stream: true });
        
        // Process complete lines
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.trim()) {
            this.processData(line.trim());
          }
        }
      }
    } catch (error) {
      console.error('Error reading from Arduino:', error);
    } finally {
      if (this.reader) {
        this.reader.releaseLock();
      }
    }
  }

  // Process incoming Arduino data
  private processData(data: string) {
    try {
      // Expected format from Arduino: "BOT_ID,FIRE_DETECTED,TEMPERATURE,HUMIDITY"
      // Example: "bot-001,1,45.5,60.2"
      const parts = data.split(',');
      
      if (parts.length >= 2) {
        const arduinoData: ArduinoData = {
          botId: parts[0],
          fireDetected: parts[1] === '1',
          temperature: parts[2] ? parseFloat(parts[2]) : undefined,
          humidity: parts[3] ? parseFloat(parts[3]) : undefined,
          timestamp: new Date().toISOString()
        };

        // Notify all listeners
        this.listeners.forEach(listener => listener(arduinoData));
      }
    } catch (error) {
      console.error('Error processing Arduino data:', error);
    }
  }

  // Subscribe to Arduino data
  subscribe(callback: (data: ArduinoData) => void) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(cb => cb !== callback);
    };
  }

  // Send command to Arduino
  async sendCommand(command: string): Promise<void> {
    if (!this.port || !this.port.writable) {
      console.error('Arduino not connected');
      return;
    }

    try {
      const writer = this.port.writable.getWriter();
      const encoder = new TextEncoder();
      await writer.write(encoder.encode(command + '\n'));
      writer.releaseLock();
    } catch (error) {
      console.error('Error sending command to Arduino:', error);
    }
  }

  // Disconnect from Arduino
  async disconnect(): Promise<void> {
    this.isConnected = false;

    if (this.reader) {
      await this.reader.cancel();
      this.reader = null;
    }

    if (this.port) {
      await this.port.close();
      this.port = null;
    }

    console.log('Arduino disconnected');
  }

  getConnectionStatus(): boolean {
    return this.isConnected;
  }
}

// Arduino data interface
export interface ArduinoData {
  botId: string;
  fireDetected: boolean;
  temperature?: number;
  humidity?: number;
  timestamp: string;
}

// Hook for using Arduino in React components
import { useEffect, useState } from 'react';

export const useArduino = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [latestData, setLatestData] = useState<ArduinoData | null>(null);
  const arduinoService = ArduinoService.getInstance();

  useEffect(() => {
    const unsubscribe = arduinoService.subscribe((data) => {
      setLatestData(data);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const connect = async () => {
    const success = await arduinoService.connect();
    setIsConnected(success);
    return success;
  };

  const disconnect = async () => {
    await arduinoService.disconnect();
    setIsConnected(false);
  };

  const sendCommand = async (command: string) => {
    await arduinoService.sendCommand(command);
  };

  return {
    isConnected,
    latestData,
    connect,
    disconnect,
    sendCommand
  };
};
