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

export interface LabTestCompletedNotification {
  type: string;
  labTestId: string;
  appointmentId: string;
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
  type?: string;
  message: string;
  doctorId?: string;
  prescriptionId?: string;
  step?: string; // INVENTORY, INVOICE, INSURANCE
  status?: string; // SUCCESS, FAILED
  reason?: string; // Fallback for error details
  timestamp?: number;
}



export const connectWebSocket = (): Client | null => {
  if (stompClient?.connected) {
    console.log('[WebSocket] Already connected');
    return stompClient;
  }

  console.log('[WebSocket] Attempting to connect to http://localhost:8080/ws');
  const socket = new SockJS('http://localhost:8080/ws');

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

// ✅ Subscribe to invoice paid notifications (broadcast to all pharmacists)
export const subscribeToInvoicePaid = (
  pharmacistId: string,
  onInvoicePaid: (notification: InvoicePaidNotification) => void
): () => void => {
  console.log(`[WebSocket] Subscribing to invoice paid notifications for pharmacist: ${pharmacistId}`);

  if (!stompClient) {
    console.log('[WebSocket] No client found, creating new connection...');
    connectWebSocket();
  }

  // ✅ Topic broadcast cho tất cả pharmacist
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
          console.log(`[WebSocket] Message received on topic ${topic}:`, message.body);
          try {
            const rawNotification = JSON.parse(message.body);
            console.log('[WebSocket] Parsed notification:', rawNotification);

            // Map từ backend format sang frontend format
            const notification: InvoicePaidNotification = {
              type: rawNotification.type || 'INVOICE_PAID',
              appointmentId: rawNotification.appointmentId || undefined,
              reason: rawNotification.reason || undefined,
              message: rawNotification.message || 'Hóa đơn đã được thanh toán thành công',
              invoiceId: rawNotification.invoiceId || rawNotification.reason || undefined,
              dispenseOrderId: rawNotification.dispenseOrderId || undefined,
              timestamp: rawNotification.timestamp || Date.now(),
            };

            console.log('[WebSocket] Mapped invoice paid notification:', notification);
            onInvoicePaid(notification);
          } catch (error) {
            console.error('[WebSocket] Error parsing invoice paid message:', error);
          }
        });

        activeSubscriptions.set(subscriptionKey, subscription);
        console.log(`[WebSocket] Successfully subscribed to ${topic}`);
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
        console.error('[WebSocket] Failed to subscribe: Connection timeout');
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
        console.error('[WebSocket] Connection timeout');
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

// ✅ Subscribe to prescription error notifications (specific to doctorId)
export const subscribeToPrescriptionError = (
  doctorId: string,
  onError: (notification: PrescriptionErrorNotification) => void
): () => void => {
  console.log(`[WebSocket] Subscribing to prescription error notifications for doctor: ${doctorId}`);

  if (!stompClient) {
    console.log('[WebSocket] No client found, creating new connection...');
    connectWebSocket();
  }

  // ✅ Topic specific cho từng doctor
  const topic = `/topic/prescription-error/${doctorId}`;
  console.log(`[WebSocket] Topic: ${topic}`);

  const subscriptionKey = `prescription-error-${doctorId}`;
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
          console.log(`[WebSocket] Message received on topic ${topic}:`, message.body);
          try {
            const rawNotification = JSON.parse(message.body);
            console.log('[WebSocket] Parsed notification:', rawNotification);

            // Map từ PrescriptionProcessNotificationEvent sang frontend format
            // Backend gửi: { doctorId, prescriptionId, step, status, message }
            const notification: PrescriptionErrorNotification = {
              type: rawNotification.type || 'PRESCRIPTION_ERROR',
              message: rawNotification.message || 'Có lỗi khi tạo đơn thuốc',
              doctorId: rawNotification.doctorId,
              prescriptionId: rawNotification.prescriptionId,
              step: rawNotification.step, // INVENTORY, INVOICE, INSURANCE
              status: rawNotification.status, // SUCCESS, FAILED
              reason: rawNotification.reason || (rawNotification.status === 'FAILED' ? `Lỗi ở bước ${rawNotification.step || 'UNKNOWN'}` : undefined),
              timestamp: rawNotification.timestamp || Date.now(),
            };

            console.log('[WebSocket] Mapped prescription error notification:', notification);
            onError(notification);
          } catch (error) {
            console.error('[WebSocket] Error parsing prescription error message:', error);
          }
        });

        activeSubscriptions.set(subscriptionKey, subscription);
        console.log(`[WebSocket] Successfully subscribed to ${topic}`);
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
        console.error('[WebSocket] Failed to subscribe: Connection timeout');
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
        console.error('[WebSocket] Connection timeout');
      }
    }, 100);
  }

  return () => {
    const subscription = activeSubscriptions.get(subscriptionKey);
    if (subscription) {
      subscription.unsubscribe();
      activeSubscriptions.delete(subscriptionKey);
      console.log(`[WebSocket] Unsubscribed from prescription error notifications for doctor: ${doctorId}`);
    }
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

export const subscribeToDoctorNotifications = (
  doctorId: string,
  onNotification: (notification: LabTestCompletedNotification) => void
): () => void => {
  console.log(`[WebSocket] Subscribing to doctor notifications for: ${doctorId}`);

  if (!stompClient) {
    console.log('[WebSocket] No client found, creating new connection...');
    connectWebSocket();
  }

  const topic = `/topic/notifications/${doctorId}`;
  console.log(`[WebSocket] Topic: ${topic}`);

  const subscriptionKey = `doctor-notifications-${doctorId}`;
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
          console.log(`[WebSocket] Message received on topic ${topic}:`, message.body);
          try {
            const notification: LabTestCompletedNotification = JSON.parse(message.body);
            console.log('[WebSocket] Parsed notification:', notification);
            onNotification(notification);
          } catch (error) {
            console.error('[WebSocket] Error parsing websocket message:', error);
          }
        });

        activeSubscriptions.set(subscriptionKey, subscription);
        console.log(`[WebSocket] Successfully subscribed to ${topic}`);
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
        console.error('[WebSocket] Failed to subscribe: Connection timeout');
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
        console.error('[WebSocket] Connection timeout');
      }
    }, 100);
  }

  return () => {
    const subscription = activeSubscriptions.get(subscriptionKey);
    if (subscription) {
      subscription.unsubscribe();
      activeSubscriptions.delete(subscriptionKey);
      console.log(`[WebSocket] Unsubscribed from doctor notifications for doctor: ${doctorId}`);
    }
  };
};




