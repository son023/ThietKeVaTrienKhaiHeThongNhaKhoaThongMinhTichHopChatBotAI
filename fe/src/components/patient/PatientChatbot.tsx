import { useState, useRef, useEffect } from 'react';
import { X, Send, Bot, User } from 'lucide-react';
import { Card } from '../ui/card';
import { Input } from '../ui/input';
import { Button } from '../ui/button';

interface Message {
  id: number;
  text: string;
  sender: 'bot' | 'user';
  timestamp: Date;
  quickReplies?: string[];
}

interface PatientChatbotProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PatientChatbot({ isOpen, onClose }: PatientChatbotProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: 'Xin chào! Tôi là trợ lý ảo của DentalCareX. Tôi có thể giúp gì cho bạn?',
      sender: 'bot',
      timestamp: new Date(),
      quickReplies: [
        'Giờ làm việc?',
        'Địa chỉ phòng khám?',
        'Đặt lịch hẹn',
        'Liên hệ nhân viên'
      ]
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const getBotResponse = (userMessage: string): { text: string; quickReplies?: string[] } => {
    const lowerMessage = userMessage.toLowerCase();

    if (lowerMessage.includes('giờ') || lowerMessage.includes('mở cửa') || lowerMessage.includes('làm việc')) {
      return {
        text: 'Phòng khám mở cửa:\n🕐 9h00 - 21h00\n📅 Tất cả các ngày trong tuần (kể cả Lễ, Tết)\n\nBạn muốn đặt lịch hẹn không?',
        quickReplies: ['Đặt lịch hẹn', 'Xem dịch vụ', 'Câu hỏi khác']
      };
    }

    if (lowerMessage.includes('địa chỉ') || lowerMessage.includes('ở đâu') || lowerMessage.includes('chỗ nào')) {
      return {
        text: 'Địa chỉ phòng khám:\n📍 Tầng 2, TTTM Mandarin Garden 2\nPhường Tân Mai, Quận Hoàng Mai, Hà Nội\n\n📞 Hotline: +84 583891780\n\nBạn cần chỉ đường không?',
        quickReplies: ['Chỉ đường', 'Đặt lịch hẹn', 'Câu hỏi khác']
      };
    }

    if (lowerMessage.includes('đặt lịch') || lowerMessage.includes('book') || lowerMessage.includes('hẹn')) {
      return {
        text: 'Để đặt lịch hẹn, bạn có thể:\n\n1️⃣ Đặt online qua trang web\n2️⃣ Gọi điện: +84 583891780\n3️⃣ Đến trực tiếp phòng khám\n\nBạn muốn đặt lịch cho dịch vụ nào?',
        quickReplies: ['Khám tổng quát', 'Niềng răng', 'Tẩy trắng răng', 'Dịch vụ khác']
      };
    }

    if (lowerMessage.includes('giá') || lowerMessage.includes('chi phí') || lowerMessage.includes('bao nhiêu')) {
      return {
        text: 'Bảng giá dịch vụ phổ biến:\n\n💰 Khám tổng quát: 200,000đ\n💰 Cạo vôi răng: 500,000đ\n💰 Tẩy trắng răng: 3,500,000đ\n💰 Niềng răng: Từ 20,000,000đ\n\nĐể biết chi tiết về gói dịch vụ, vui lòng liên hệ: +84 583891780',
        quickReplies: ['Đặt lịch hẹn', 'Xem thêm dịch vụ', 'Câu hỏi khác']
      };
    }

    if (lowerMessage.includes('nhân viên') || lowerMessage.includes('tư vấn') || lowerMessage.includes('support')) {
      return {
        text: 'Để được hỗ trợ trực tiếp từ nhân viên tư vấn:\n\n📞 Hotline: +84 583891780\n📧 Email: dentist@gmail.com\n\nHoặc bạn có thể để lại thông tin, chúng tôi sẽ liên hệ lại trong vòng 30 phút.',
        quickReplies: ['Gọi điện ngay', 'Để lại thông tin', 'Câu hỏi khác']
      };
    }

    if (lowerMessage.includes('dịch vụ') || lowerMessage.includes('service')) {
      return {
        text: 'Các dịch vụ tại DentalCareX:\n\n🦷 Khám tổng quát\n🦷 Niềng răng (Invisalign, mắc cài)\n🦷 Tẩy trắng răng\n🦷 Bọc răng sứ\n🦷 Cạo vôi, lấy cao răng\n🦷 Điều trị tủy răng\n🦷 Nhổ răng khôn\n🦷 Cấy ghép Implant\n\nBạn quan tâm dịch vụ nào?',
        quickReplies: ['Niềng răng', 'Tẩy trắng răng', 'Implant', 'Đặt lịch hẹn']
      };
    }

    if (lowerMessage.includes('bác sĩ') || lowerMessage.includes('doctor')) {
      return {
        text: 'Đội ngũ bác sĩ giàu kinh nghiệm:\n\n👨‍⚕️ BS. Nguyễn Văn A - Chuyên khoa Điều trị\n👩‍⚕️ BS. Trần Thị B - Chuyên khoa Chỉnh nha\n👨‍⚕️ BS. Lê Văn C - Chuyên khoa Nội nha\n👩‍⚕️ BS. Phạm Thị D - Chuyên khoa Thẩm mỹ\n\nBạn muốn đặt lịch với bác sĩ nào?',
        quickReplies: ['Đặt lịch hẹn', 'Xem thông tin BS', 'Câu hỏi khác']
      };
    }

    if (lowerMessage.includes('cảm ơn') || lowerMessage.includes('thanks') || lowerMessage.includes('thank you')) {
      return {
        text: 'Rất vui được hỗ trợ bạn! 😊\nNếu cần thêm thông tin, đừng ngần ngại hỏi nhé!',
        quickReplies: ['Giờ làm việc?', 'Địa chỉ phòng khám?', 'Đặt lịch hẹn']
      };
    }

    // Default response
    return {
      text: 'Xin lỗi, tôi chưa hiểu câu hỏi của bạn. Bạn có thể:\n\n• Hỏi về giờ làm việc\n• Hỏi về địa chỉ phòng khám\n• Hỏi về dịch vụ và giá cả\n• Đặt lịch hẹn\n• Liên hệ nhân viên tư vấn',
      quickReplies: ['Giờ làm việc?', 'Địa chỉ phòng khám?', 'Đặt lịch hẹn', 'Liên hệ nhân viên']
    };
  };

  const handleSendMessage = (text: string) => {
    if (!text.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: messages.length + 1,
      text: text.trim(),
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    // Simulate bot typing delay
    setTimeout(() => {
      const botResponseData = getBotResponse(text);
      const botMessage: Message = {
        id: messages.length + 2,
        text: botResponseData.text,
        sender: 'bot',
        timestamp: new Date(),
        quickReplies: botResponseData.quickReplies
      };

      setMessages(prev => [...prev, botMessage]);
      setIsTyping(false);
    }, 1000);
  };

  const handleQuickReply = (reply: string) => {
    handleSendMessage(reply);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendMessage(inputValue);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-[20px] right-[20px] z-50 w-[380px] max-w-[calc(100vw-40px)] h-[600px] max-h-[calc(100vh-40px)]">
      <Card className="w-full h-full flex flex-col shadow-[0px_8px_32px_0px_rgba(0,0,0,0.12)] border-[#ebf6fc] overflow-hidden">
        {/* DoctorHeader */}
        <div className="bg-gradient-to-r from-[#3fb5ff] to-[#1e8bc3] p-[20px] flex items-center justify-between">
          <div className="flex items-center gap-[12px]">
            <div className="w-[40px] h-[40px] bg-white/20 rounded-[10px] flex items-center justify-center">
              <Bot className="w-[24px] h-[24px] text-white" />
            </div>
            <div>
              <h3 className="font-['Fz_Poppins:SemiBold',sans-serif] text-white text-[16px]">
                Trợ lý ảo
              </h3>
              <p className="font-['Fz_Poppins:Regular',sans-serif] text-white/80 text-[12px]">
                Luôn sẵn sàng hỗ trợ
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-[32px] h-[32px] bg-white/20 hover:bg-white/30 rounded-[8px] flex items-center justify-center transition-colors"
          >
            <X className="w-[20px] h-[20px] text-white" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-[20px] space-y-[16px] bg-[#fcfeff]">
          {messages.map((message) => (
            <div key={message.id}>
              <div
                className={`flex gap-[12px] ${
                  message.sender === 'user' ? 'flex-row-reverse' : ''
                }`}
              >
                {/* Avatar */}
                <div
                  className={`w-[32px] h-[32px] rounded-[8px] flex items-center justify-center flex-shrink-0 ${
                    message.sender === 'bot'
                      ? 'bg-gradient-to-br from-[#3fb5ff] to-[#1e8bc3]'
                      : 'bg-[#e0e0e0]'
                  }`}
                >
                  {message.sender === 'bot' ? (
                    <Bot className="w-[18px] h-[18px] text-white" />
                  ) : (
                    <User className="w-[18px] h-[18px] text-[#666666]" />
                  )}
                </div>

                {/* Message Bubble */}
                <div
                  className={`max-w-[70%] ${
                    message.sender === 'user' ? 'items-end' : ''
                  }`}
                >
                  <div
                    className={`rounded-[12px] p-[12px] ${
                      message.sender === 'bot'
                        ? 'bg-white border border-[#ebf6fc]'
                        : 'bg-gradient-to-br from-[#3fb5ff] to-[#1e8bc3] text-white'
                    }`}
                  >
                    <p
                      className={`font-['Fz_Poppins:Regular',sans-serif] text-[14px] leading-[1.6] whitespace-pre-line ${
                        message.sender === 'bot' ? 'text-[#333333]' : 'text-white'
                      }`}
                    >
                      {message.text}
                    </p>
                  </div>
                  <p className="font-['Fz_Poppins:Regular',sans-serif] text-[#999999] text-[11px] mt-[4px] px-[4px]">
                    {message.timestamp.toLocaleTimeString('vi-VN', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>

              {/* Quick Replies */}
              {message.quickReplies && message.sender === 'bot' && (
                <div className="flex flex-wrap gap-[8px] mt-[12px] ml-[44px]">
                  {message.quickReplies.map((reply, index) => (
                    <button
                      key={index}
                      onClick={() => handleQuickReply(reply)}
                      className="px-[12px] py-[8px] bg-white border-2 border-[#3fb5ff] text-[#3fb5ff] rounded-[8px] font-['Fz_Poppins:Medium',sans-serif] text-[13px] hover:bg-[#ebf6fc] transition-colors"
                    >
                      {reply}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex gap-[12px]">
              <div className="w-[32px] h-[32px] bg-gradient-to-br from-[#3fb5ff] to-[#1e8bc3] rounded-[8px] flex items-center justify-center flex-shrink-0">
                <Bot className="w-[18px] h-[18px] text-white" />
              </div>
              <div className="bg-white border border-[#ebf6fc] rounded-[12px] p-[12px]">
                <div className="flex gap-[4px]">
                  <div className="w-[8px] h-[8px] bg-[#3fb5ff] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-[8px] h-[8px] bg-[#3fb5ff] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-[8px] h-[8px] bg-[#3fb5ff] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-[16px] bg-white border-t border-[#ebf6fc]">
          <form onSubmit={handleSubmit} className="flex gap-[8px]">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Nhập tin nhắn..."
              className="flex-1 font-['Fz_Poppins:Regular',sans-serif]"
            />
            <Button
              type="submit"
              disabled={!inputValue.trim()}
              className="bg-gradient-to-r from-[#3fb5ff] to-[#1e8bc3] hover:shadow-[0px_4px_16px_0px_rgba(63,181,255,0.4)] transition-all px-[16px]"
            >
              <Send className="w-[18px] h-[18px]" />
            </Button>
          </form>
        </div>
      </Card>
    </div>
  );
}
