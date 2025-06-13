/**
 * Real-time communication system using WebSockets
 * Provides live updates for articles, comments, and user interactions
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import { analytics } from './analytics';

interface RealtimeEvent {
  type: string;
  data: any;
  timestamp: number;
  id: string;
}

interface RealtimeConfig {
  url: string;
  reconnectInterval: number;
  maxReconnectAttempts: number;
  heartbeatInterval: number;
  enableCompression: boolean;
}

interface ConnectionState {
  isConnected: boolean;
  isConnecting: boolean;
  lastConnected: number | null;
  reconnectAttempts: number;
  latency: number;
}

class RealtimeManager {
  private static instance: RealtimeManager;
  private ws: WebSocket | null = null;
  private config: RealtimeConfig;
  private state: ConnectionState;
  private eventListeners: Map<string, Function[]> = new Map();
  private reconnectTimer: NodeJS.Timeout | null = null;
  private heartbeatTimer: NodeJS.Timeout | null = null;
  private messageQueue: RealtimeEvent[] = [];
  private lastHeartbeat: number = 0;

  private constructor() {
    this.config = {
      url: this.getWebSocketUrl(),
      reconnectInterval: 5000,
      maxReconnectAttempts: 10,
      heartbeatInterval: 30000,
      enableCompression: true,
    };

    this.state = {
      isConnected: false,
      isConnecting: false,
      lastConnected: null,
      reconnectAttempts: 0,
      latency: 0,
    };
  }

  static getInstance(): RealtimeManager {
    if (!RealtimeManager.instance) {
      RealtimeManager.instance = new RealtimeManager();
    }
    return RealtimeManager.instance;
  }

  /**
   * Get WebSocket URL based on environment
   */
  private getWebSocketUrl(): string {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.hostname;
    
    if (host === 'localhost' || host === '127.0.0.1') {
      return `${protocol}//${host}:3001/ws`;
    }
    
    // Production WebSocket URL
    return `${protocol}//onward-dominicans-backend-v2.onrender.com/ws`;
  }

  /**
   * Connect to WebSocket server
   */
  async connect(): Promise<void> {
    if (this.state.isConnected || this.state.isConnecting) {
      return;
    }

    this.state.isConnecting = true;
    console.log('🔌 Connecting to WebSocket server...');

    try {
      this.ws = new WebSocket(this.config.url);
      
      if (this.config.enableCompression) {
        // Enable compression if supported
        this.ws.binaryType = 'arraybuffer';
      }

      this.setupEventListeners();
      
      // Wait for connection or timeout
      await new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Connection timeout'));
        }, 10000);

        this.ws!.onopen = () => {
          clearTimeout(timeout);
          resolve();
        };

        this.ws!.onerror = (error) => {
          clearTimeout(timeout);
          reject(error);
        };
      });

    } catch (error) {
      console.error('❌ WebSocket connection failed:', error);
      this.handleConnectionError();
    }
  }

  /**
   * Disconnect from WebSocket server
   */
  disconnect(): void {
    console.log('🔌 Disconnecting from WebSocket server...');
    
    this.clearTimers();
    
    if (this.ws) {
      this.ws.close(1000, 'Client disconnect');
      this.ws = null;
    }

    this.state.isConnected = false;
    this.state.isConnecting = false;
    this.emit('disconnected');
  }

  /**
   * Send message to server
   */
  send(type: string, data: any): void {
    const message: RealtimeEvent = {
      type,
      data,
      timestamp: Date.now(),
      id: this.generateId(),
    };

    if (this.state.isConnected && this.ws) {
      try {
        this.ws.send(JSON.stringify(message));
        analytics.track('realtime_message_sent', 'communication', { type });
      } catch (error) {
        console.error('❌ Failed to send message:', error);
        this.queueMessage(message);
      }
    } else {
      this.queueMessage(message);
    }
  }

  /**
   * Subscribe to events
   */
  on(eventType: string, callback: Function): void {
    if (!this.eventListeners.has(eventType)) {
      this.eventListeners.set(eventType, []);
    }
    this.eventListeners.get(eventType)!.push(callback);
  }

  /**
   * Unsubscribe from events
   */
  off(eventType: string, callback: Function): void {
    const listeners = this.eventListeners.get(eventType);
    if (listeners) {
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  /**
   * Get connection state
   */
  getState(): ConnectionState {
    return { ...this.state };
  }

  /**
   * Setup WebSocket event listeners
   */
  private setupEventListeners(): void {
    if (!this.ws) return;

    this.ws.onopen = () => {
      console.log('✅ WebSocket connected');
      this.state.isConnected = true;
      this.state.isConnecting = false;
      this.state.lastConnected = Date.now();
      this.state.reconnectAttempts = 0;
      
      this.startHeartbeat();
      this.processMessageQueue();
      this.emit('connected');
      
      analytics.track('realtime_connected', 'communication');
    };

    this.ws.onclose = (event) => {
      console.log('🔌 WebSocket disconnected:', event.code, event.reason);
      this.state.isConnected = false;
      this.state.isConnecting = false;
      
      this.clearTimers();
      this.emit('disconnected', { code: event.code, reason: event.reason });
      
      // Auto-reconnect unless it was a clean close
      if (event.code !== 1000) {
        this.scheduleReconnect();
      }
      
      analytics.track('realtime_disconnected', 'communication', { 
        code: event.code, 
        reason: event.reason 
      });
    };

    this.ws.onmessage = (event) => {
      try {
        const message: RealtimeEvent = JSON.parse(event.data);
        this.handleMessage(message);
      } catch (error) {
        console.error('❌ Failed to parse WebSocket message:', error);
      }
    };

    this.ws.onerror = (error) => {
      console.error('❌ WebSocket error:', error);
      this.emit('error', error);
    };
  }

  /**
   * Handle incoming messages
   */
  private handleMessage(message: RealtimeEvent): void {
    // Handle heartbeat responses
    if (message.type === 'pong') {
      this.state.latency = Date.now() - this.lastHeartbeat;
      return;
    }

    // Emit to listeners
    this.emit(message.type, message.data);
    this.emit('message', message);

    analytics.track('realtime_message_received', 'communication', { 
      type: message.type 
    });
  }

  /**
   * Emit event to listeners
   */
  private emit(eventType: string, data?: any): void {
    const listeners = this.eventListeners.get(eventType);
    if (listeners) {
      listeners.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error('❌ Error in event listener:', error);
        }
      });
    }
  }

  /**
   * Handle connection errors
   */
  private handleConnectionError(): void {
    this.state.isConnecting = false;
    this.state.reconnectAttempts++;
    
    if (this.state.reconnectAttempts < this.config.maxReconnectAttempts) {
      this.scheduleReconnect();
    } else {
      console.error('❌ Max reconnection attempts reached');
      this.emit('maxReconnectAttemptsReached');
    }
  }

  /**
   * Schedule reconnection attempt
   */
  private scheduleReconnect(): void {
    if (this.reconnectTimer) return;

    const delay = Math.min(
      this.config.reconnectInterval * Math.pow(2, this.state.reconnectAttempts),
      30000 // Max 30 seconds
    );

    console.log(`🔄 Scheduling reconnect in ${delay}ms (attempt ${this.state.reconnectAttempts + 1})`);

    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      this.connect();
    }, delay);
  }

  /**
   * Start heartbeat to keep connection alive
   */
  private startHeartbeat(): void {
    this.heartbeatTimer = setInterval(() => {
      if (this.state.isConnected) {
        this.lastHeartbeat = Date.now();
        this.send('ping', { timestamp: this.lastHeartbeat });
      }
    }, this.config.heartbeatInterval);
  }

  /**
   * Clear all timers
   */
  private clearTimers(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  /**
   * Queue message for later sending
   */
  private queueMessage(message: RealtimeEvent): void {
    this.messageQueue.push(message);
    
    // Limit queue size
    if (this.messageQueue.length > 100) {
      this.messageQueue.shift();
    }
  }

  /**
   * Process queued messages
   */
  private processMessageQueue(): void {
    while (this.messageQueue.length > 0 && this.state.isConnected) {
      const message = this.messageQueue.shift()!;
      try {
        this.ws!.send(JSON.stringify(message));
      } catch (error) {
        console.error('❌ Failed to send queued message:', error);
        break;
      }
    }
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
}

// Export singleton instance
export const realtimeManager = RealtimeManager.getInstance();

/**
 * React hook for real-time features
 */
export const useRealtime = (autoConnect: boolean = true) => {
  const [state, setState] = useState<ConnectionState>(realtimeManager.getState());

  useEffect(() => {
    const updateState = () => setState(realtimeManager.getState());

    realtimeManager.on('connected', updateState);
    realtimeManager.on('disconnected', updateState);
    realtimeManager.on('error', updateState);

    if (autoConnect) {
      realtimeManager.connect();
    }

    return () => {
      realtimeManager.off('connected', updateState);
      realtimeManager.off('disconnected', updateState);
      realtimeManager.off('error', updateState);
    };
  }, [autoConnect]);

  const subscribe = useCallback((eventType: string, callback: Function) => {
    realtimeManager.on(eventType, callback);
    return () => realtimeManager.off(eventType, callback);
  }, []);

  const send = useCallback((type: string, data: any) => {
    realtimeManager.send(type, data);
  }, []);

  return {
    ...state,
    connect: () => realtimeManager.connect(),
    disconnect: () => realtimeManager.disconnect(),
    subscribe,
    send,
  };
};
