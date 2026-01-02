import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  connectWebSocket,
  subscribeToInvoicePaid,
  subscribeToPrescriptionDispensed,
  subscribeToAppointmentCreated,
  InvoicePaidNotification,
  PrescriptionDispensedNotification,
  AppointmentCreatedNotification,
  isConnected
} from '../services/websocketService';
import { notificationController, NotificationDTO } from '../controllers/NotificationController';
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
  userId?: string; // Thêm field này để filter theo user
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: string) => void;
  clearAllNotifications: () => void;
  refreshNotifications: () => Promise<void>;
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
  const [loading, setLoading] = useState(true);

  // Convert NotificationDTO từ backend sang Notification frontend
  const mapDTOToNotification = useCallback((dto: NotificationDTO): Notification => {
    // ✅ Xử lý các loại notification khác nhau
    let title = '💰 Hóa đơn đã được thanh toán';
    if (dto.templateId === 'PRESCRIPTION_DISPENSED') {
      title = '✅ Đơn thuốc đã được cấp phát';
    } else if (dto.templateId === 'APPOINTMENT_CREATED') {
      title = '📅 Lịch hẹn mới';
    }

    return {
      id: dto.id,
      type: dto.templateId ?? 'INVOICE_PAID',
      title,
      message: dto.message,
      timestamp: new Date(dto.createdAt).getTime(),
      read: dto.status === 'read',
      invoiceId: dto.invoiceId,
      dispenseOrderId: dto.dispenseOrderId,
      appointmentId: dto.appointmentId,
      userId: dto.userId, // Thêm mapping userId
    };
  }, []);


  // Load notifications từ backend
  const loadNotifications = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      // Lấy tất cả notifications có templateId === 'APPOINTMENT_CREATED'
      const appointmentNotifications = await notificationController.getByTemplateId('APPOINTMENT_CREATED');

      // Lấy notifications của user hiện tại
      const userNotifications = await notificationController.getByUserId(userId);

      // Kết hợp và loại bỏ trùng lặp
      const allDtos = [...appointmentNotifications, ...userNotifications];
      const uniqueDtos = allDtos.filter((dto, index, self) =>
        index === self.findIndex((n) => n.id === dto.id)
      );

      uniqueDtos.sort((a, b) => {
        const timeA = new Date(a.createdAt).getTime();
        const timeB = new Date(b.createdAt).getTime();
        return timeB - timeA;
      });

      const mappedNotifications = uniqueDtos.map(mapDTOToNotification);
      setNotifications(mappedNotifications);
      console.log(`[NotificationContext] Loaded ${mappedNotifications.length} notifications from backend`);
    } catch (error) {
      console.error('[NotificationContext] Failed to load notifications:', error);
      toast.error('Không thể tải lịch sử thông báo');
    } finally {
      setLoading(false);
    }
  }, [userId, mapDTOToNotification]);

  // Load notifications khi component mount hoặc userId thay đổi
  useEffect(() => {
    if (userId) {
      loadNotifications();
    }
  }, [userId, loadNotifications]);


  // ✅ Subscribe WebSocket khi component mount hoặc userId thay đổi
  useEffect(() => {
    if (!userId) {
      console.warn('[NotificationContext] No userId provided, skipping WebSocket subscription');
      return;
    }


    if (!isConnected()) {
      console.log('[NotificationContext] Setting up WebSocket subscription for user:', userId);
      connectWebSocket();
    }
    // Kết nối WebSocket

    // Subscribe vào invoice paid notifications
    const unsubscribeInvoicePaid = subscribeToInvoicePaid(userId, (notification: InvoicePaidNotification) => {
      console.log('[NotificationContext] Invoice paid notification received:', notification);

      const tempNotification: Notification = {
        id: `ws-invoice-${Date.now()}-${Math.random()}`,
        type: 'INVOICE_PAID',
        title: '💰 Hóa đơn đã được thanh toán',
        message: notification.message,
        timestamp: notification.timestamp || Date.now(),
        read: false,
        invoiceId: notification.invoiceId,
        dispenseOrderId: notification.dispenseOrderId,
        appointmentId: notification.appointmentId,
        userId: userId, // Thêm userId
      };

      setNotifications(prev => [tempNotification, ...prev]);

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

    // ✅ Subscribe vào prescription dispensed notifications
    const unsubscribePrescriptionDispensed = subscribeToPrescriptionDispensed(
      userId,
      (notification: PrescriptionDispensedNotification) => {
        console.log('[NotificationContext] 📨 Prescription dispensed notification received:', notification);

        // ✅ Parse DTO từ backend và tạo notification
        const tempNotification: Notification = {
          id: `ws-prescription-${Date.now()}-${Math.random()}`,
          type: 'PRESCRIPTION_DISPENSED',
          title: '✅ Đơn thuốc đã được cấp phát',
          message: notification.message || `Đơn thuốc đã được dược sĩ ${notification.pharmacistName || 'dược sĩ'} cấp phát thành công`,
          timestamp: notification.timestamp || Date.now(),
          read: false,
          dispenseOrderId: notification.dispenseOrderId,
          appointmentId: notification.appointmentId,
          userId: userId, // Thêm userId
        };

        setNotifications(prev => [tempNotification, ...prev]);

        // ✅ Hiển thị toast với thông tin từ DTO
        toast.success(
          <div>
            <p className="font-semibold">✅ Đơn thuốc đã được cấp phát</p>
            <p className="text-sm">{notification.message}</p>
            {notification.pharmacistName && (
              <p className="text-xs text-gray-500">Dược sĩ: {notification.pharmacistName}</p>
            )}
          </div>,
          {
            duration: 5000,
            icon: <CheckCircle className="w-5 h-5 text-green-500" />,
          }
        );
      }
    );

    const unsubscribeAppointmentCreated = subscribeToAppointmentCreated(
      userId,
      (notification: AppointmentCreatedNotification) => {
        console.log('[NotificationContext] 📅 Appointment created notification received:', notification);

        const tempNotification: Notification = {
          id: `ws-appointment-${Date.now()}-${Math.random()}`,
          type: 'APPOINTMENT_CREATED',
          title: '📅 Lịch hẹn mới',
          message: notification.message || 'Lịch hẹn mới đã được đăng ký',
          timestamp: notification.timestamp || Date.now(),
          read: false,
          appointmentId: notification.appointmentId,
          userId: userId, // Thêm userId
        };

        setNotifications(prev => [tempNotification, ...prev]);

        toast.success(
          <div>
            <p className="font-semibold">📅 Lịch hẹn mới</p>
            <p className="text-sm">{notification.message}</p>
          </div>,
          {
            duration: 5000,
            icon: <CheckCircle className="w-5 h-5 text-blue-500" />,
          }
        );
      }
    );

    // Sync lại DB sau 1–2s
    setTimeout(loadNotifications, 1500);

    return () => {
      unsubscribeInvoicePaid();
      unsubscribePrescriptionDispensed();
      unsubscribeAppointmentCreated();
    };
  }, [userId, loadNotifications]);

  const markAsRead = useCallback(async (id: string) => {
    try {
      await notificationController.markAsRead(id);
      setNotifications(prev =>
        prev.map(notif => (notif.id === id ? { ...notif, read: true } : notif))
      );
    } catch (error) {
      console.error('[NotificationContext] Failed to mark notification as read:', error);
      // Vẫn update UI dù API fail
      setNotifications(prev =>
        prev.map(notif => (notif.id === id ? { ...notif, read: true } : notif))
      );
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    const unreadNotifications = notifications.filter(n => !n.read);
    await Promise.all(unreadNotifications.map(n => markAsRead(n.id)));
  }, [notifications, markAsRead]);

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
        loading,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        clearAllNotifications,
        refreshNotifications: loadNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};