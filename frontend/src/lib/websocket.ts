import { useAuthStore } from '@/stores/authStore';
import { useCallStore } from '@/stores/callStore';
import { useAlertStore } from '@/stores/alertStore';

export class WebSocketClient {
  private ws: WebSocket | null = null;
  private url: string;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private isConnecting = false;
  private intentionalClose = false;
  private reconnectTimeout: NodeJS.Timeout | null = null;

  constructor() {
    const baseUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://127.0.0.1:8000';
    this.url = `${baseUrl}/ws/monitor`;
  }

  public connect() {
    if (this.ws?.readyState === WebSocket.OPEN || this.isConnecting) {
      return;
    }

    const token = useAuthStore.getState().token;
    if (!token) return; // Don't connect if not authenticated

    this.isConnecting = true;
    this.intentionalClose = false;
    
    try {
      this.ws = new WebSocket(`${this.url}?token=${token}`);
      
      this.ws.onopen = () => {
        console.log('[VoxGuard] WebSocket connected');
        this.isConnecting = false;
        this.reconnectAttempts = 0;
      };

      this.ws.onmessage = (event) => {
        this.handleMessage(event.data);
      };

      this.ws.onclose = () => {
        this.isConnecting = false;
        this.ws = null;
        if (!this.intentionalClose) {
          this.attemptReconnect();
        }
      };

      this.ws.onerror = (error) => {
        console.error('[VoxGuard] WebSocket error:', error);
        // onclose will handle reconnect
      };
    } catch (err) {
      console.error('[VoxGuard] Failed to construct WebSocket:', err);
      this.isConnecting = false;
    }
  }

  public disconnect() {
    this.intentionalClose = true;
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  private attemptReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('[VoxGuard] Max WebSocket reconnect attempts reached');
      return;
    }

    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
    this.reconnectAttempts++;
    
    console.log(`[VoxGuard] Attempting to reconnect in ${delay}ms...`);
    this.reconnectTimeout = setTimeout(() => {
      this.connect();
    }, delay);
  }

  private handleMessage(dataStr: string) {
    try {
      const payload = JSON.parse(dataStr);
      
      // Route events to appropriate stores
      if (payload.event === 'risk_update' && payload.data) {
        // payload.data might have risk_score, call_id
        useCallStore.getState().updateCall(payload.data.call_id, {
           // We might not get full call updates, just relying on stats or full fetch if needed
        });
        // We probably just fetch latest stats
        useCallStore.getState().fetchStats();
      } else if (payload.event === 'alert_created' && payload.data) {
        useAlertStore.getState().prependAlert(payload.data);
        useCallStore.getState().fetchStats(); // Update stats as flagged calls might increase
      } else if (payload.event === 'call_status_changed' && payload.data) {
        useCallStore.getState().updateCall(payload.data.id, {
          status: payload.data.status,
          completed_at: payload.data.completed_at,
          duration_seconds: payload.data.duration_seconds
        });
        useCallStore.getState().fetchStats();
      }
      
    } catch (err) {
      console.error('[VoxGuard] Failed to parse WebSocket message:', err);
    }
  }
}

// Singleton instance
export const wsClient = new WebSocketClient();
