import React, { useState, useEffect } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// CẤU HÌNH URL
const NOTIFICATION_SERVICE_URL = 'http://localhost:8094/ws'; // Port của Notification Service
const PRESCRIPTION_API_URL = 'http://localhost:8081/prescription-billing-service/prescription-billings'; // Port của Prescription Service

// GIẢ LẬP DỮ LIỆU BÁC SĨ (Trong thực tế lấy từ Login/Token)
const CURRENT_DOCTOR_ID = "ffffffff-ffff-ffff-ffff-ffffffffffff";

function App() {
  const [loading, setLoading] = useState(false);
  const [stompClient, setStompClient] = useState(null);

  // 1. KẾT NỐI WEBSOCKET KHI TRANG LOAD
  useEffect(() => {
    // Kết nối đến Notification Service
    const socket = new SockJS(NOTIFICATION_SERVICE_URL);
    const client = new Client({
      webSocketFactory: () => socket,
      debug: (str) => {
        // Tắt log debug của stomp cho gọn console (bật lại nếu cần debug)
        // console.log(str);
      },
      onConnect: (frame) => {
        console.log('✅ Đã kết nối WebSocket thành công: ' + frame.command);

        // SUBSCRIBE VÀO TOPIC RIÊNG CỦA BÁC SĨ
        // Topic này phải khớp với logic trong NotificationEventHandler ở Backend
        const topic = `/topic/notifications/${CURRENT_DOCTOR_ID}`;

        client.subscribe(topic, (message) => {
          handleNotification(JSON.parse(message.body));
        });
      },
      onStompError: (frame) => {
        console.error('❌ Lỗi kết nối WebSocket:', frame);
        toast.error("Mất kết nối tới hệ thống thông báo!");
      },
    });

    client.activate();
    setStompClient(client);

    // Cleanup khi component unmount
    return () => {
      if (client && client.active) {
        client.deactivate();
      }
    };
  }, []);

  // 2. XỬ LÝ KHI NHẬN ĐƯỢC THÔNG BÁO TỪ SAGA
  const handleNotification = (notification) => {
    console.log("📩 Nhận thông báo:", notification);

    // Tắt trạng thái loading (spinner)
    setLoading(false);

    // Hiển thị Toast dựa trên trạng thái (STATUS từ Saga gửi về)
    if (notification.status === 'COMPLETED') {
      // Thành công (Màu xanh)
      toast.success(notification.message, {
        position: "top-right",
        autoClose: 5000,
      });
    } else if (notification.status === 'FAILED') {
      // Thất bại (Màu đỏ)
      toast.error(notification.message, {
        position: "top-right",
        autoClose: 7000, // Để lâu hơn chút để kịp đọc lỗi
      });
    } else {
      // Các trạng thái trung gian (nếu có sau này)
      toast.info(notification.message);
    }
  };

  // 3. HÀM GỌI API TẠO ĐƠN THUỐC
  const handleCreatePrescription = async () => {
    setLoading(true); // Bắt đầu xoay loading

    // Dữ liệu mẫu gửi đi
    const payload = {
      medicalHistoryId: "eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee",
      patientId: "eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee",
      doctorId: CURRENT_DOCTOR_ID, // vẫn lấy đúng bác sĩ hiện tại
      diagnosis: "Sốt virus",
      note: "Uống thuốc sau ăn",
      items: [
        {
          medicineId: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
          name: "Paracetamol 500mg",
          quantity: 1,
          unitPrice: 1000
        },
        {
          medicineId: "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb",
          name: "Amoxicillin 500mg",
          quantity: 1,
          unitPrice: 2000
        }
      ]
    };


    try {
      // Gọi API REST (Saga bắt đầu chạy)
      const response = await axios.post(PRESCRIPTION_API_URL, payload);

      console.log("🚀 API Response:", response.data);
      // Lưu ý: Ở đây ta KHÔNG thông báo thành công ngay.
      // Ta chỉ thông báo "Đã gửi yêu cầu" và chờ WebSocket trả kết quả thật.
      toast.info("Đang xử lý đơn thuốc... Vui lòng đợi.", { autoClose: 2000 });

    } catch (error) {
      setLoading(false);
      console.error("Lỗi gọi API:", error);
      toast.error("Không thể gửi yêu cầu tạo đơn. Lỗi server.");
    }
  };

  return (
    <div style={{ padding: '50px', textAlign: 'center' }}>
      <h1>Hệ Thống Kê Đơn Thuốc (Saga Demo)</h1>

      <div style={{ marginTop: '30px' }}>
        <p>Bác sĩ đang đăng nhập: <strong>{CURRENT_DOCTOR_ID}</strong></p>

        <button
          onClick={handleCreatePrescription}
          disabled={loading}
          style={{
            padding: '15px 30px',
            fontSize: '18px',
            backgroundColor: loading ? '#ccc' : '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? 'Đang Xử Lý Saga...' : 'Tạo Đơn Thuốc Mới'}
        </button>
      </div>

      {/* Component chứa các popup thông báo */}
      <ToastContainer />
    </div>
  );
}

export default App;