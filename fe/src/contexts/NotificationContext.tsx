import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { connectWebSocket, subscribeToInvoicePaid, InvoicePaidNotification } from '../services/websocketService';
import { authController } from '../controllers/AuthController';
import { toast } from 'sonner';
import { CheckCircle } from 'lucide-react';

export interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  timestamp: number;
  read: boolean;
  invoiceId?: string;
  dispenseOrderId?: string;
  appointmentId?: string;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  deleteNotification: (id: string) => void;
  clearAllNotifications: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
};

interface NotificationProviderProps {
  children: React.ReactNode;
  userId?: string;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children, userId }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // ✅ Subscribe WebSocket khi component mount hoặc userId thay đổi
  useEffect(() => {
    if (!userId) {
      console.warn('[NotificationContext] No userId provided, skipping WebSocket subscription');
      return;
    }

    console.log('[NotificationContext] Setting up WebSocket subscription for user:', userId);

    // Kết nối WebSocket
    connectWebSocket();

    // Subscribe vào invoice paid notifications
    const unsubscribe = subscribeToInvoicePaid(userId, (notification: InvoicePaidNotification) => {
      console.log('[NotificationContext] Invoice paid notification received:', notification);

      // Tạo notification object
      const newNotification: Notification = {
        id: `invoice-paid-${Date.now()}-${Math.random()}`,
        type: 'INVOICE_PAID',
        title: '💰 Hóa đơn đã được thanh toán',
        message: notification.message || 'Hóa đơn đã được thanh toán thành công. Có thể cấp phát đơn thuốc.',
        timestamp: notification.timestamp || Date.now(),
        read: false,
        invoiceId: notification.invoiceId,
        dispenseOrderId: notification.dispenseOrderId,
        appointmentId: notification.appointmentId,
      };

      // Thêm vào danh sách notifications
      setNotifications(prev => [newNotification, ...prev]);

      // ✅ Hiển thị popup toast
      toast.success(
        <div>
          <p className="font-semibold">💰 Hóa đơn đã được thanh toán</p>
          <p className="text-sm">{notification.message}</p>
        </div>,
        {
          duration: 5000,
          icon: <CheckCircle className="w-5 h-5 text-green-500" />,
        }
      );
    });

    return () => {
      unsubscribe();
    };
  }, [userId]);

  const markAsRead = useCallback((id: string) => {
    setNotifications(prev =>
      prev.map(notif => (notif.id === id ? { ...notif, read: true } : notif))
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => prev.map(notif => ({ ...notif, read: true })));
  }, []);

  const deleteNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  }, []);

  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        clearAllNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};