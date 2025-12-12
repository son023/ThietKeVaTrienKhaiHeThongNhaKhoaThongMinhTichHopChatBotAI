
// import { useState, useEffect, useRef } from 'react';
// import { Search, Bell, ChevronDown, Home, X, CheckCircle } from 'lucide-react';
// import { toast } from 'sonner';
// import { connectWebSocket, subscribeToInvoicePaid, InvoicePaidNotification } from '../services/websocketService';
// import { authController } from '../controllers/AuthController';

// interface PharmacistHeaderProps {
//   onLogout: () => void;
//   onGoHome?: () => void;
// }

// interface Notification {
//   id: string;
//   type: string;
//   title: string;
//   message: string;
//   timestamp: number;
//   read: boolean;
//   invoiceId?: string;
//   dispenseOrderId?: string;
// }

// export function PharmacistHeader({ onLogout, onGoHome }: PharmacistHeaderProps) {
//   const [showDropdown, setShowDropdown] = useState(false);
//   const [showNotifications, setShowNotifications] = useState(false);
//   const [searchQuery, setSearchQuery] = useState('');
//   const [notifications, setNotifications] = useState<Notification[]>([]);
//   const dropdownRef = useRef<HTMLDivElement>(null);
//   const notificationRef = useRef<HTMLDivElement>(null);

//   // ✅ Kết nối WebSocket và subscribe notifications
//   useEffect(() => {
//     const currentUser = authController.getCurrentUser();
//     if (!currentUser) {
//       console.warn('[PharmacistHeader] No current user, skipping WebSocket subscription');
//       return;
//     }

//     console.log('[PharmacistHeader] Setting up WebSocket subscription for user:', currentUser.id);

//     // Kết nối WebSocket
//     connectWebSocket();

//     // Subscribe vào invoice paid notifications
//     const unsubscribe = subscribeToInvoicePaid(currentUser.id, (notification: InvoicePaidNotification) => {
//       console.log('[PharmacistHeader] Invoice paid notification received:', notification);

//       // Tạo notification object
//       const newNotification: Notification = {
//         id: `invoice-paid-${Date.now()}`,
//         type: 'INVOICE_PAID',
//         title: '💰 Hóa đơn đã được thanh toán',
//         message: notification.message || 'Hóa đơn đã được thanh toán thành công. Có thể cấp phát đơn thuốc.',
//         timestamp: notification.timestamp || Date.now(),
//         read: false,
//         invoiceId: notification.invoiceId,
//         dispenseOrderId: notification.dispenseOrderId,
//       };

//       // Thêm vào danh sách notifications
//       setNotifications(prev => [newNotification, ...prev]);

//       // ✅ Hiển thị popup toast
//       toast.success(
//         <div>
//           <p className="font-semibold">💰 Hóa đơn đã được thanh toán</p>
//           <p className="text-sm">{notification.message}</p>
//         </div>,
//         {
//           duration: 5000,
//           icon: <CheckCircle className="w-5 h-5 text-green-500" />,
//         }
//       );
//     });

//     return () => {
//       unsubscribe();
//     };
//   }, []);



//   // Đóng dropdown khi click outside
//   useEffect(() => {
//     const handleClickOutside = (event: MouseEvent) => {
//       if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
//         setShowDropdown(false);
//       }
//       if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
//         setShowNotifications(false);
//       }
//     };

//     document.addEventListener('mousedown', handleClickOutside);
//     return () => document.removeEventListener('mousedown', handleClickOutside);
//   }, []);

//   const unreadCount = notifications.filter(n => !n.read).length;

//   const markAsRead = (id: string) => {
//     setNotifications(notifications.map(notif =>
//       notif.id === id ? { ...notif, read: true } : notif
//     ));
//   };

//   const markAllAsRead = () => {
//     setNotifications(notifications.map(notif => ({ ...notif, read: true })));
//   };

//   const deleteNotification = (id: string) => {
//     setNotifications(notifications.filter(notif => notif.id !== id));
//   };

//   return (
//     <div className="fixed top-0 left-0 right-0 h-[80px] bg-white border-b border-[#e5e7eb] shadow-sm z-50">
//       <div className="flex items-center justify-between h-full px-6">
//         {/* Logo */}
//         <div className="flex items-center gap-3">
//           <div className="w-10 h-10 rounded-lg bg-[#3fb5ff] flex items-center justify-center">
//             <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
//             </svg>
//           </div>
//           <div>
//             <h1 className="font-['Fz_Poppins:SemiBold',sans-serif] text-[20px] text-[#01304e]">
//               DentalCareX
//             </h1>
//             <p className="font-['Fz_Poppins:Regular',sans-serif] text-[12px] text-[#05619a]">
//               Dược sĩ
//             </p>
//           </div>
//         </div>

//         {/* Search Bar */}
//         <div className="flex-1 max-w-[500px] mx-8">
//           <div className="relative">
//             <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#05619a]" />
//             <input
//               type="text"
//               value={searchQuery}
//               onChange={(e) => setSearchQuery(e.target.value)}
//               placeholder="Tìm kiếm thuốc, hoạt chất, đơn thuốc..."
//               className="w-full h-[44px] pl-11 pr-4 rounded-lg border border-[#3295d0] bg-[#fcfeff] font-['Fz_Poppins:Regular',sans-serif] text-[14px] text-[#333333] placeholder:text-[#999999] focus:outline-none focus:ring-2 focus:ring-[#3fb5ff] focus:border-transparent transition-all"
//             />
//           </div>
//         </div>

//         {/* Right Section */}
//         <div className="flex items-center gap-4">
//           {/* ✅ Notifications với dropdown */}
//           <div className="relative" ref={notificationRef}>
//             <button
//               onClick={() => setShowNotifications(!showNotifications)}
//               className="relative p-2 rounded-lg hover:bg-[#f0f9ff] transition-colors"
//             >
//               <Bell className="w-6 h-6 text-[#05619a]" />
//               {unreadCount > 0 && (
//                 <span className="absolute top-1 right-1 w-5 h-5 bg-[#dc3545] rounded-full flex items-center justify-center">
//                   <span className="font-['Fz_Poppins:SemiBold',sans-serif] text-white text-[11px]">
//                     {unreadCount}
//                   </span>
//                 </span>
//               )}
//             </button>

//             {/* Notifications Dropdown */}


//             {/* Notifications Dropdown */}
//             {showNotifications && (
//               <div className="absolute right-0 mt-2 w-[400px] bg-white rounded-lg shadow-lg border border-[#e5e7eb] z-50 max-h-[500px] overflow-hidden flex flex-col">
//                 {/* Header */}
//                 <div className="px-4 py-3 border-b border-[#e5e7eb] flex items-center justify-between">
//                   <h3 className="font-['Fz_Poppins:SemiBold',sans-serif] text-[16px] text-[#01304e]">
//                     Thông báo {notifications.length > 0 && `(${notifications.length})`}
//                   </h3>
//                   {unreadCount > 0 && (
//                     <button
//                       onClick={markAllAsRead}
//                       className="font-['Fz_Poppins:Regular',sans-serif] text-[12px] text-[#3fb5ff] hover:text-[#05619a]"
//                     >
//                       Đánh dấu tất cả đã đọc
//                     </button>
//                   )}
//                 </div>

//                 {/* Notifications List */}
//                 <div className="overflow-y-auto flex-1">
//                   {notifications.length === 0 ? (
//                     <div className="p-8 text-center">
//                       <Bell className="w-12 h-12 text-[#d6edfa] mx-auto mb-3" />
//                       <p className="font-['Fz_Poppins:Regular',sans-serif] text-[14px] text-[#6c757d]">
//                         Chưa có thông báo
//                       </p>
//                     </div>
//                   ) : (
//                     <div className="divide-y divide-[#e5e7eb]">
//                       {notifications.map((notif) => (
//                         <div
//                           key={notif.id}
//                           className={`p-4 hover:bg-[#f8f9fa] transition-colors cursor-pointer ${!notif.read ? 'bg-[#ecf8ff]' : ''
//                             }`}
//                           onClick={() => markAsRead(notif.id)}
//                         >
//                           <div className="flex items-start justify-between gap-3">
//                             <div className="flex-1">
//                               <div className="flex items-center gap-2 mb-1">
//                                 <CheckCircle className={`w-4 h-4 flex-shrink-0 ${notif.read ? 'text-[#6c757d]' : 'text-[#28a745]'}`} />
//                                 <p className="font-['Fz_Poppins:SemiBold',sans-serif] text-[14px] text-[#01304e]">
//                                   {notif.title}
//                                 </p>
//                                 {!notif.read && (
//                                   <span className="w-2 h-2 bg-[#3fb5ff] rounded-full flex-shrink-0"></span>
//                                 )}
//                               </div>
//                               <p className="font-['Fz_Poppins:Regular',sans-serif] text-[13px] text-[#6c757d] mb-2">
//                                 {notif.message}
//                               </p>
//                               <p className="font-['Fz_Poppins:Regular',sans-serif] text-[11px] text-[#999999]">
//                                 {new Date(notif.timestamp).toLocaleString('vi-VN')}
//                               </p>
//                             </div>
//                             <button
//                               onClick={(e) => {
//                                 e.stopPropagation();
//                                 deleteNotification(notif.id);
//                               }}
//                               className="p-1 hover:bg-[#fff5f5] rounded transition-colors flex-shrink-0"
//                             >
//                               <X className="w-4 h-4 text-[#dc3545]" />
//                             </button>
//                           </div>
//                         </div>
//                       ))}
//                     </div>
//                   )}
//                 </div>
//               </div>
//             )}

//           </div>

//           {/* User Avatar & Dropdown */}
//           <div className="relative" ref={dropdownRef}>
//             {/* ... existing user dropdown code ... */}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }



import { useState, useEffect, useRef } from 'react';
import { Search, Bell, ChevronDown, Home, X, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { connectWebSocket, subscribeToInvoicePaid, InvoicePaidNotification } from '../services/websocketService';
import { authController } from '../controllers/AuthController';
import { useNotifications } from '../contexts/NotificationContext';

interface PharmacistHeaderProps {
  onLogout: () => void;
  onGoHome?: () => void;
}


export function PharmacistHeader({ onLogout, onGoHome }: PharmacistHeaderProps) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);

  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  } = useNotifications();



  // Đóng dropdown khi click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);




  return (
    <div className="fixed top-0 left-0 right-0 h-[80px] bg-white border-b border-[#e5e7eb] shadow-sm z-50">
      <div className="flex items-center justify-between h-full px-6">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#3fb5ff] flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
            </svg>
          </div>
          <div>
            <h1 className="font-['Fz_Poppins:SemiBold',sans-serif] text-[20px] text-[#01304e]">
              DentalCareX
            </h1>
            <p className="font-['Fz_Poppins:Regular',sans-serif] text-[12px] text-[#05619a]">
              Dược sĩ
            </p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="flex-1 max-w-[500px] mx-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#05619a]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm thuốc, hoạt chất, đơn thuốc..."
              className="w-full h-[44px] pl-11 pr-4 rounded-lg border border-[#3295d0] bg-[#fcfeff] font-['Fz_Poppins:Regular',sans-serif] text-[14px] text-[#333333] placeholder:text-[#999999] focus:outline-none focus:ring-2 focus:ring-[#3fb5ff] focus:border-transparent transition-all"
            />
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-4">
          {/* ✅ Notifications với dropdown */}
          <div className="relative" ref={notificationRef}>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 rounded-lg hover:bg-[#f0f9ff] transition-colors"
            >
              <Bell className="w-6 h-6 text-[#05619a]" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-5 h-5 bg-[#dc3545] rounded-full flex items-center justify-center">
                  <span className="font-['Fz_Poppins:SemiBold',sans-serif] text-white text-[11px]">
                    {unreadCount}
                  </span>
                </span>
              )}
            </button>
            {/* Notifications Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-[400px] bg-white rounded-lg shadow-lg border border-[#e5e7eb] z-50 max-h-[500px] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="px-4 py-3 border-b border-[#e5e7eb] flex items-center justify-between">
                  <h3 className="font-['Fz_Poppins:SemiBold',sans-serif] text-[16px] text-[#01304e]">
                    Thông báo {notifications.length > 0 && `(${notifications.length})`}
                  </h3>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="font-['Fz_Poppins:Regular',sans-serif] text-[12px] text-[#3fb5ff] hover:text-[#05619a]"
                    >
                      Đánh dấu tất cả đã đọc
                    </button>
                  )}
                </div>
                {/* Notifications List */}
                <div className="overflow-y-auto flex-1">
                  {notifications.length === 0 ? (
                    <div className="p-8 text-center">
                      <Bell className="w-12 h-12 text-[#d6edfa] mx-auto mb-3" />
                      <p className="font-['Fz_Poppins:Regular',sans-serif] text-[14px] text-[#6c757d]">
                        Chưa có thông báo
                      </p>
                    </div>
                  ) : (
                    <div className="divide-y divide-[#e5e7eb]">
                      {notifications.map((notif) => (
                        <div
                          key={notif.id}
                          className={`p-4 hover:bg-[#f8f9fa] transition-colors cursor-pointer ${!notif.read ? 'bg-[#ecf8ff]' : ''
                            }`}
                          onClick={() => markAsRead(notif.id)}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <CheckCircle
                                  className={`w-4 h-4 flex-shrink-0 ${notif.read ? 'text-[#6c757d]' : 'text-[#28a745]'
                                    }`}
                                />
                                <p className="font-['Fz_Poppins:SemiBold',sans-serif] text-[14px] text-[#01304e]">
                                  {notif.title}
                                </p>
                                {!notif.read && (
                                  <span className="w-2 h-2 bg-[#3fb5ff] rounded-full flex-shrink-0"></span>
                                )}
                              </div>
                              <p className="font-['Fz_Poppins:Regular',sans-serif] text-[13px] text-[#6c757d] mb-2">
                                {notif.message}
                              </p>
                              <p className="font-['Fz_Poppins:Regular',sans-serif] text-[11px] text-[#999999]">
                                {new Date(notif.timestamp).toLocaleString('vi-VN')}
                              </p>
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteNotification(notif.id);
                              }}
                              className="p-1 hover:bg-[#fff5f5] rounded transition-colors flex-shrink-0"
                            >
                              <X className="w-4 h-4 text-[#dc3545]" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Avatar & Dropdown */}
          <div className="relative" ref={dropdownRef}>
            {/* ... existing user dropdown code ... */}
          </div>
        </div>
      </div>
    </div>
  );
}