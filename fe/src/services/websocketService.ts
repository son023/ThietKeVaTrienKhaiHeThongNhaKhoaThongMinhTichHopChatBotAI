import SockJS from 'sockjs-client';
import { Client, IMessage, StompSubscription } from '@stomp/stompjs';

let stompClient: Client | null = null;
const activeSubscriptions = new Map<string, StompSubscription>();

export interface AppointmentRollbackNotification {
  type: string;
  appointmentId: string;
  reason: string;
  message: string;
}

export interface InvoicePaidNotification {
  type: string;
  appointmentId?: string;
  reason?: string;
  message: string;
  invoiceId?: string;
  dispenseOrderId?: string;
  timestamp?: number;
}

export interface PrescriptionErrorNotification {
  type: string;
  message: string;
  appointmentId?: string;
  doctorId?: string;
  reason?: string;
  timestamp?: number;
}



export const connectWebSocket = (): Client | null => {
  if (stompClient?.connected) {
    console.log('[WebSocket] Already connected');
    return stompClient;
  }

  console.log('[WebSocket] Attempting to connect to http://localhost:8079/ws');
  const socket = new SockJS('http://localhost:8079/ws');
  
  socket.onopen = () => {
    console.log('[WebSocket] SockJS connection opened');
  };
  
  socket.onclose = (event) => {
    console.log('[WebSocket] SockJS connection closed', event);
  };
  
  socket.onerror = (error) => {
    console.error('[WebSocket] SockJS connection error:', error);
  };
  
  stompClient = new Client({
    webSocketFactory: () => socket as any,
    reconnectDelay: 5000,
    heartbeatIncoming: 4000,
    heartbeatOutgoing: 4000,
    onConnect: (frame) => {
      console.log('[WebSocket] STOMP connected successfully!', frame);
      console.log('[WebSocket] Active subscriptions:', Array.from(activeSubscriptions.keys()));
    },
    onStompError: (frame) => {
      console.error('[WebSocket] STOMP error:', frame);
    },
    onWebSocketError: (event) => {
      console.error('[WebSocket] WebSocket error:', event);
    },
    onDisconnect: () => {
      console.log('[WebSocket] STOMP disconnected');
      activeSubscriptions.clear();
    },
    debug: (str) => {
      console.log('[WebSocket] STOMP debug:', str);
    },
  });

  console.log('[WebSocket] Activating STOMP client...');
  stompClient.activate();
  return stompClient;
};

export const subscribeToAppointmentRollback = (
  appointmentId: string,
  onAppointmentRollback: (notification: AppointmentRollbackNotification) => void
): () => void => {
  console.log(`[WebSocket] Subscribing to appointment rollback for: ${appointmentId}`);
  
  if (!stompClient) {
    console.log('[WebSocket] No client found, creating new connection...');
    connectWebSocket();
  }

  const topic = `/topic/appointment-rollback/${appointmentId}`;
  console.log(`[WebSocket] Topic: ${topic}`);

  if (activeSubscriptions.has(appointmentId)) {
    console.log(`[WebSocket] Unsubscribing from existing subscription for: ${appointmentId}`);
    const existingSub = activeSubscriptions.get(appointmentId);
    existingSub?.unsubscribe();
    activeSubscriptions.delete(appointmentId);
  }

  let retryCount = 0;
  const maxRetries = 50;

  const subscribe = () => {
    if (stompClient && stompClient.connected) {
      try {
        const subscription = stompClient.subscribe(topic, (message: IMessage) => {
          console.log(`[WebSocket] Message received on topic ${topic}:`, message.body);
          try {
            const notification: AppointmentRollbackNotification = JSON.parse(message.body);
            console.log('[WebSocket] Parsed notification:', notification);
            onAppointmentRollback(notification);
          } catch (error) {
            console.error('[WebSocket] Error parsing websocket message:', error);
          }
        });
        
        activeSubscriptions.set(appointmentId, subscription);
        console.log(`[WebSocket] ✅ Successfully subscribed to ${topic}`);
        console.log(`[WebSocket] Total active subscriptions: ${activeSubscriptions.size}`);
      } catch (error) {
        console.error('[WebSocket] Error subscribing:', error);
      }
    } else {
      retryCount++;
      if (retryCount < maxRetries) {
        console.log(`[WebSocket] Waiting for connection... (${retryCount}/${maxRetries})`);
        setTimeout(subscribe, 100);
      } else {
        console.error('[WebSocket] ❌ Failed to subscribe: Connection timeout');
      }
    }
  };

  if (stompClient?.connected) {
    console.log('[WebSocket] Already connected, subscribing immediately');
    subscribe();
  } else {
    console.log('[WebSocket] Not connected yet, waiting for connection...');
    const checkConnection = setInterval(() => {
      if (stompClient?.connected) {
        clearInterval(checkConnection);
        console.log('[WebSocket] Connection established, subscribing now');
        subscribe();
      } else if (retryCount >= maxRetries) {
        clearInterval(checkConnection);
        console.error('[WebSocket] ❌ Connection timeout');
      }
    }, 100);
  }

  return () => {
    const subscription = activeSubscriptions.get(appointmentId);
    if (subscription) {
      subscription.unsubscribe();
      activeSubscriptions.delete(appointmentId);
      console.log(`[WebSocket] Unsubscribed from appointment rollback for appointment: ${appointmentId}`);
    }
  };
};

// ✅ THÊM: Subscribe vào invoice paid notifications
export const subscribeToInvoicePaid = (
  pharmacistId: string,
  onInvoicePaid: (notification: InvoicePaidNotification) => void
): () => void => {
  console.log(`[WebSocket] Subscribing to invoice paid notifications for pharmacist: ${pharmacistId}`);
  
  if (!stompClient) {
    console.log('[WebSocket] No client found, creating new connection...');
    connectWebSocket();
  }

  const topic = `/topic/invoice-paid`;
  console.log(`[WebSocket] Topic: ${topic}`);

  const subscriptionKey = `invoice-paid-${pharmacistId}`;

  if (activeSubscriptions.has(subscriptionKey)) {
    console.log(`[WebSocket] Unsubscribing from existing subscription for: ${subscriptionKey}`);
    const existingSub = activeSubscriptions.get(subscriptionKey);
    existingSub?.unsubscribe();
    activeSubscriptions.delete(subscriptionKey);
  }

  let retryCount = 0;
  const maxRetries = 50;

  const subscribe = () => {
    if (stompClient && stompClient.connected) {
      try {
        const subscription = stompClient.subscribe(topic, (message: IMessage) => {
          console.log(`[WebSocket] ✅ Invoice paid message received on topic ${topic}:`, message.body);
          console.log(`[WebSocket] Message type:`, typeof message.body);
          console.log(`[WebSocket] Message length:`, message.body?.length);
          
          try {
            const rawNotification = JSON.parse(message.body);
            console.log('[WebSocket] ✅ Parsed raw notification:', rawNotification);
            
            // ✅ Map từ backend format sang frontend format
            const notification: InvoicePaidNotification = {
              type: rawNotification.type || 'INVOICE_PAID',
              appointmentId: rawNotification.appointmentId || undefined,
              reason: rawNotification.reason || undefined,
              message: rawNotification.message || 'Hóa đơn đã được thanh toán thành công',
              invoiceId: rawNotification.invoiceId || rawNotification.reason || undefined, // reason có thể chứa invoiceId
              dispenseOrderId: rawNotification.dispenseOrderId || undefined,
              timestamp: rawNotification.timestamp || Date.now(),
            };
            
            console.log('[WebSocket] ✅ Mapped notification:', notification);
            onInvoicePaid(notification);
          } catch (error) {
            console.error('[WebSocket] ❌ Error parsing invoice paid message:', error);
            console.error('[WebSocket] Raw message body:', message.body);
          }
        });
        
        activeSubscriptions.set(subscriptionKey, subscription);
        console.log(`[WebSocket] ✅ Successfully subscribed to ${topic}`);
        console.log(`[WebSocket] Total active subscriptions: ${activeSubscriptions.size}`);
      } catch (error) {
        console.error('[WebSocket] ❌ Error subscribing:', error);
      }
    } else {
      retryCount++;
      if (retryCount < maxRetries) {
        console.log(`[WebSocket] Waiting for connection... (${retryCount}/${maxRetries})`);
        setTimeout(subscribe, 100);
      } else {
        console.error('[WebSocket] ❌ Failed to subscribe: Connection timeout');
      }
    }
  };

  if (stompClient?.connected) {
    console.log('[WebSocket] Already connected, subscribing immediately');
    subscribe();
  } else {
    console.log('[WebSocket] Not connected yet, waiting for connection...');
    const checkConnection = setInterval(() => {
      if (stompClient?.connected) {
        clearInterval(checkConnection);
        console.log('[WebSocket] Connection established, subscribing now');
        subscribe();
      } else if (retryCount >= maxRetries) {
        clearInterval(checkConnection);
        console.error('[WebSocket] ❌ Connection timeout');
      }
    }, 100);
  }

  return () => {
    const subscription = activeSubscriptions.get(subscriptionKey);
    if (subscription) {
      subscription.unsubscribe();
      activeSubscriptions.delete(subscriptionKey);
      console.log(`[WebSocket] Unsubscribed from invoice paid notifications for pharmacist: ${pharmacistId}`);
    }
  };
};

export const subscribeToPrescriptionError = (
  doctorId: string,
  onError: (n: PrescriptionErrorNotification) => void
): () => void => {
  if (!stompClient) connectWebSocket();
  const topic = `/topic/prescription-error/${doctorId}`;
  const key = `prescription-error-${doctorId}`;
  if (activeSubscriptions.has(key)) {
    activeSubscriptions.get(key)?.unsubscribe();
    activeSubscriptions.delete(key);
  }

  let retry = 0, max = 50;
  const doSub = () => {
    if (stompClient?.connected) {
      const sub = stompClient.subscribe(topic, (msg: IMessage) => {
        try {
          const raw = JSON.parse(msg.body);
          const n: PrescriptionErrorNotification = {
            type: raw.type || "PRESCRIPTION_ERROR",
            message: raw.message || raw.reason || "Có lỗi khi tạo đơn thuốc",
            appointmentId: raw.appointmentId,
            doctorId: raw.doctorId,
            reason: raw.reason,
            timestamp: raw.timestamp || Date.now(),
          };
          onError(n);
        } catch (e) {
          console.error("parse prescription error", e, msg.body);
        }
      });
      activeSubscriptions.set(key, sub);
    } else if (retry++ < max) {
      setTimeout(doSub, 100);
    }
  };
  doSub();
  return () => {
    activeSubscriptions.get(key)?.unsubscribe();
    activeSubscriptions.delete(key);
  };
};


export const unsubscribeFromAppointmentRollback = (appointmentId: string) => {
  const subscription = activeSubscriptions.get(appointmentId);
  if (subscription) {
    subscription.unsubscribe();
    activeSubscriptions.delete(appointmentId);
    console.log(`Unsubscribed from appointment rollback for appointment: ${appointmentId}`);
  }
};

export const disconnectWebSocket = () => {
  activeSubscriptions.forEach((sub) => sub.unsubscribe());
  activeSubscriptions.clear();
  
  if (stompClient) {
    stompClient.deactivate();
    stompClient = null;
  }
};

export const isConnected = (): boolean => {
  return stompClient?.connected || false;
};




