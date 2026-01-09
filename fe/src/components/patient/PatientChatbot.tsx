import { useState, useRef, useEffect, useLayoutEffect } from "react";
import { X, Send, Bot, User, Loader2, MessageCircle } from "lucide-react";
import { Card } from "../ui/card";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { authController } from "../../controllers";
import ReactMarkdown from "react-markdown";

const API_BASE_URL = "http://localhost:9992/api";

interface Message {
  id: string;
  text: string;
  sender: "bot" | "user";
  timestamp: Date;
  quickReplies?: string[];
}

// ✅ NEW STATE: Widget visibility (self-contained)
// const [isOpen, setIsOpen] = useState(false);  <-- REMOVED INTERNAL STATE

interface PatientChatbotProps {
  onNavigate?: (page: string) => void;
  isOpen: boolean;
  onToggle: () => void;
}

export default function PatientChatbot({
  onNavigate = () => { },
  isOpen,
  onToggle,
}: PatientChatbotProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [userId, setUserId] = useState<string>("");

  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [hasMoreHistory, setHasMoreHistory] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const prevScrollHeightRef = useRef<number>(0);

  // --- 2. INIT & LOAD HISTORY ---
  useEffect(() => {
    if (!isOpen) return;

    const currentUser = authController.getCurrentUser();
    let currentId = "";

    if (currentUser && currentUser.id) {
      currentId = currentUser.id.toString();
    } else {
      const storedGuestId = localStorage.getItem("dental_guest_id");
      if (storedGuestId) {
        currentId = storedGuestId;
      } else {
        currentId = crypto.randomUUID();
        localStorage.setItem("dental_guest_id", currentId);
      }
    }

    setUserId(currentId);
    setMessages([]);
    setHasMoreHistory(true);
    fetchHistory(currentId, undefined, true);
  }, [isOpen]);

  // --- 3. FETCH HISTORY ---
  const fetchHistory = async (
    uid: string,
    beforeTime?: string,
    isFirstLoad = false
  ) => {
    try {
      setIsLoadingHistory(true);

      let url = `${API_BASE_URL}/history/${uid}?limit=20`;
      if (beforeTime) {
        url += `&before_time=${beforeTime}`;
      }

      const res = await fetch(url);
      const data = await res.json();

      const newMessages: Message[] = data
        .map((msg: any) => ({
          id: msg.id,
          text: msg.content,
          sender: msg.role === "bot" ? "bot" : "user",
          timestamp: new Date(msg.timestamp),
          quickReplies: [],
        }))
        .reverse();

      if (newMessages.length < 20) {
        setHasMoreHistory(false);
      }

      if (isFirstLoad) {
        if (newMessages.length === 0) {
          setMessages([
            {
              id: "welcome",
              text: "Xin chào! 👋\nTôi là trợ lý ảo **Dental AI**.\n\nTôi có thể giúp bạn tra cứu:\n- 🏥 Thông tin phòng khám\n- 💊 Triệu chứng & Bệnh lý\n- 📅 Đặt lịch hẹn\n\nBạn cần hỗ trợ gì không?",
              sender: "bot",
              timestamp: new Date(),
              quickReplies: [],
            },
          ]);
        } else {
          setMessages(newMessages);
          setTimeout(scrollToBottom, 100);
        }
      } else {
        if (scrollContainerRef.current) {
          prevScrollHeightRef.current = scrollContainerRef.current.scrollHeight;
        }
        setMessages((prev) => [...newMessages, ...prev]);
      }
    } catch (error) {
      console.error("Lỗi tải lịch sử:", error);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  // --- SCROLL LOGIC ---
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop } = e.currentTarget;
    if (
      scrollTop === 0 &&
      !isLoadingHistory &&
      hasMoreHistory &&
      messages.length > 0
    ) {
      const oldestMessage = messages[0];
      if (oldestMessage.id !== "welcome") {
        fetchHistory(userId, oldestMessage.timestamp.toISOString());
      }
    }
  };

  useLayoutEffect(() => {
    if (
      !isLoadingHistory &&
      prevScrollHeightRef.current > 0 &&
      scrollContainerRef.current
    ) {
      const newScrollHeight = scrollContainerRef.current.scrollHeight;
      scrollContainerRef.current.scrollTop =
        newScrollHeight - prevScrollHeightRef.current;
      prevScrollHeightRef.current = 0;
    }
  }, [messages, isLoadingHistory]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (!isLoadingHistory && prevScrollHeightRef.current === 0) {
      scrollToBottom();
    }
  }, [messages, isTyping]);

  const handleFAQClick = (type: string) => {
    if (type === "Đặt lịch hẹn") {
      onNavigate("home"); // Hoặc 'appointments' tùy vào trang bạn muốn tới
      onToggle(); // ✅ CHANGED: Use prop
      return;
    }
    handleSendMessage(type);
  };

  // --- SEND MESSAGE ---
  const handleSendMessage = async (text: string) => {
    if (!text.trim()) return;

    // THÊM ĐOẠN NÀY VÀO ĐẦU HÀM
    if (text === "Đặt lịch hẹn") {
      onNavigate("home");
      onToggle(); // ✅ CHANGED: Use prop
      return;
    }

    const userMsg: Message = {
      id: Date.now().toString(),
      text: text.trim(),
      sender: "user",
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInputValue("");
    setIsTyping(true);

    // 1. Kiểm tra nếu là câu hỏi FAQ để trả lời ngay
    const faqData: Record<string, { response: string; delay: number }> = {
      "Giờ làm việc": {
        response: "**Giờ làm việc phòng khám:**\n\n🕐 **09:00 - 21:00**\n📅 Tất cả các ngày trong tuần.",
        delay: 600,
      },
      "Địa chỉ": {
        response: "**Địa chỉ phòng khám:**\n📍 Tầng 2, TTTM Mandarin Garden 2\nPhường Tân Mai, Quận Hoàng Mai, Hà Nội",
        delay: 600,
      },
      "tôi bị sâu răng thì phải làm sao": {
        response: `Chào bạn,

Dựa trên thông tin bạn cung cấp, triệu chứng của bệnh viêm nướu bao gồm:

**Viêm nướu:** Đây là triệu chứng chính của bệnh viêm nướu.
**Nướu viêm đỏ:** Nướu có thể trở nên sưng đỏ, có thể kèm theo chảy máu khi đánh răng hoặc dùng chỉ nha khoa.

Ngoài ra, khi bệnh tiến triển nặng hơn, có thể dẫn đến các triệu chứng khác liên quan đến viêm nha chu.

Tuy nhiên, để có chẩn đoán chính xác và kế hoạch điều trị phù hợp nhất, tôi khuyên bạn nên đến gặp bác sĩ nha khoa để được thăm khám trực tiếp nhé.`,
        delay: 2000,
      },
      "triệu chứng của bệnh viêm nha chu là gì?": {
        response: `Chào bạn,

Dựa trên các tài liệu nha khoa mà hệ thống tham khảo, viêm nha chu là giai đoạn tiến triển nặng hơn của viêm nướu và có thể gây ảnh hưởng đến mô nâng đỡ răng. Các triệu chứng thường gặp bao gồm:

- Nướu sưng đỏ, dễ chảy máu khi đánh răng hoặc dùng chỉ nha khoa
- Hơi thở có mùi hôi kéo dài dù đã vệ sinh răng miệng
- Nướu bị tụt, làm răng trông dài hơn bình thường
- Xuất hiện túi nha chu giữa răng và nướu
- Đau hoặc khó chịu khi nhai
- Răng lung lay hoặc thưa dần, có thể dẫn đến mất răng nếu không điều trị
- Có mủ chảy ra từ nướu trong trường hợp nặng

Viêm nha chu là bệnh tiến triển âm thầm nhưng có thể gây hậu quả nghiêm trọng nếu không được điều trị kịp thời. Vì vậy, nếu bạn có các dấu hiệu trên, bạn nên đến khám bác sĩ nha khoa để được chẩn đoán chính xác và tư vấn phương pháp điều trị phù hợp.`,
        delay: 2000,
      },
    };

    // Tìm kiếm câu hỏi khớp (không phân biệt hoa thường)
    const normalizedText = text.trim().toLowerCase();
    const matchedKey = Object.keys(faqData).find(
      (key) => key.toLowerCase() === normalizedText
    );

    if (matchedKey) {
      const { response, delay } = faqData[matchedKey];
      setTimeout(() => {
        const botMsg: Message = {
          id: Date.now().toString(),
          text: response,
          sender: "bot",
          timestamp: new Date(),
          quickReplies: ["Đặt lịch hẹn"],
        };
        setMessages((prev) => [...prev, botMsg]);
        setIsTyping(false);
      }, delay);
      return; // Thoát hàm, không gọi lên AI nữa
    }

    // 2. Câu hỏi không khớp - trả lời mặc định
    const defaultResponse = `Chào bạn,

Câu hỏi này hiện không thuộc phạm vi chuyên môn nha khoa mà hệ thống của tôi được xây dựng để hỗ trợ. Vì vậy, tôi chưa có đủ thông tin đáng tin cậy để đưa ra câu trả lời chính xác cho bạn.

Để đảm bảo bạn nhận được thông tin đúng và hữu ích nhất, bạn có thể:

- Tham khảo ý kiến của chuyên gia trong lĩnh vực liên quan
- Hoặc đặt lại câu hỏi liên quan đến sức khỏe răng miệng, bệnh lý nha khoa, phòng ngừa và điều trị răng miệng

Rất mong được hỗ trợ bạn trong những nội dung phù hợp với hệ thống.
Cảm ơn bạn đã thông cảm!`;

    setTimeout(() => {
      const botMsg: Message = {
        id: Date.now().toString() + "_default",
        text: defaultResponse,
        sender: "bot",
        timestamp: new Date(),
        quickReplies: ["Đặt lịch hẹn"],
      };
      setMessages((prev) => [...prev, botMsg]);
      setIsTyping(false);
    }, 2000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendMessage(inputValue);
  };

  return (
    <>
      {/* ✅ FLOATING ACTION BUTTON (FAB) */}
      <button
        onClick={onToggle}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-gradient-to-r from-[#3fb5ff] to-[#1e8bc3] rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 flex items-center justify-center"
        aria-label={isOpen ? "Đóng chat" : "Mở chat"}
      >
        {isOpen ? (
          <X className="w-6 h-6 text-white" />
        ) : (
          <MessageCircle className="w-6 h-6 text-white" />
        )}
      </button>

      {/* ✅ CHAT WINDOW (with transitions) */}
      {isOpen && (
        <div
          className="fixed bottom-24 right-6 z-50 w-[380px] max-w-[calc(100vw-48px)] h-[600px] max-h-[calc(100vh-120px)] animate-in fade-in slide-in-from-bottom-4 duration-300"
        >
          <Card className="w-full h-full flex flex-col shadow-[0px_8px_32px_0px_rgba(0,0,0,0.12)] border-[#ebf6fc] overflow-hidden">
            {/* HEADER */}
            {/* MERGED HEADER & FAQ SECTION */}
            <div className="bg-gradient-to-r from-[#3fb5ff] to-[#1e8bc3] p-[12px] flex flex-col gap-[8px] flex-shrink-0">
              {/* Row 1: Title & Close */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-[8px]">
                  <div className="w-[32px] h-[32px] bg-white/20 rounded-[8px] flex items-center justify-center">
                    <Bot className="w-[18px] h-[18px] text-white" />
                  </div>
                  <div>
                    <h3 className="font-['Fz_Poppins:SemiBold',sans-serif] text-white text-[14px] leading-tight">
                      Trợ lý Nha Khoa
                    </h3>
                    <p className="font-['Fz_Poppins:Regular',sans-serif] text-white/80 text-[10px]">
                      Hỗ trợ chuyên môn 24/7
                    </p>
                  </div>
                </div>
                <button
                  onClick={onToggle}
                  className="w-[28px] h-[28px] bg-white/20 hover:bg-white/30 rounded-[6px] flex items-center justify-center transition-colors"
                >
                  <X className="w-[16px] h-[16px] text-white" />
                </button>
              </div>

              {/* Row 2: FAQ Buttons */}
              <div className="flex gap-[8px] overflow-x-auto no-scrollbar items-center">
                {["Giờ làm việc", "Địa chỉ", "Đặt lịch hẹn"].map((item) => (
                  <button
                    key={item}
                    disabled={isTyping}
                    onClick={() => handleFAQClick(item)}
                    className={`whitespace-nowrap flex-shrink-0 px-[12px] py-[4px] rounded-full text-[11px] font-medium border border-white/30 transition-all ${isTyping
                      ? "bg-white/10 text-white/50 cursor-not-allowed"
                      : "bg-white/20 text-white hover:bg-white hover:text-[#1e8bc3]"
                      }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>

            {/* CHAT BODY */}
            <div
              ref={scrollContainerRef}
              onScroll={handleScroll}
              className="flex-1 overflow-y-auto p-[20px] space-y-[16px] bg-[#fcfeff]"
            >
              {isLoadingHistory && (
                <div className="flex justify-center py-2">
                  <Loader2 className="w-5 h-5 text-[#3fb5ff] animate-spin" />
                </div>
              )}

              {messages.map((message) => (
                <div key={message.id}>
                  <div
                    className={`flex gap-[12px] ${message.sender === "user" ? "flex-row-reverse" : ""
                      }`}
                  >
                    <div
                      className={`w-[32px] h-[32px] rounded-[8px] flex items-center justify-center flex-shrink-0 ${message.sender === "bot"
                        ? "bg-gradient-to-br from-[#3fb5ff] to-[#1e8bc3]"
                        : "bg-[#e0e0e0]"
                        }`}
                    >
                      {message.sender === "bot" ? (
                        <Bot className="w-[18px] h-[18px] text-white" />
                      ) : (
                        <User className="w-[18px] h-[18px] text-[#666666]" />
                      )}
                    </div>

                    <div
                      className={`max-w-[70%] ${message.sender === "user" ? "items-end" : ""
                        }`}
                    >
                      <div
                        className={`rounded-[12px] p-[12px] ${message.sender === "bot"
                          ? "bg-white border border-[#ebf6fc]"
                          : "bg-gradient-to-br from-[#3fb5ff] to-[#1e8bc3] text-white"
                          }`}
                      >
                        {/* --- SỬ DỤNG REACT MARKDOWN ĐỂ RENDER TEXT --- */}
                        <div
                          className={`font-['Fz_Poppins:Regular',sans-serif] text-[14px] leading-[1.6] ${message.sender === "bot"
                            ? "text-[#333333]"
                            : "text-white"
                            }`}
                        >
                          <ReactMarkdown
                            components={{
                              // Tùy chỉnh các thẻ HTML bên trong Markdown cho đẹp
                              strong: ({ node, ...props }) => (
                                <span className="font-bold" {...props} />
                              ),
                              ul: ({ node, ...props }) => (
                                <ul className="list-disc ml-4 mb-2" {...props} />
                              ),
                              ol: ({ node, ...props }) => (
                                <ol className="list-decimal ml-4 mb-2" {...props} />
                              ),
                              li: ({ node, ...props }) => (
                                <li className="mb-1" {...props} />
                              ),
                              p: ({ node, ...props }) => (
                                <p className="mb-2 last:mb-0" {...props} />
                              ),
                            }}
                          >
                            {message.text}
                          </ReactMarkdown>
                        </div>
                      </div>
                      <p className="font-['Fz_Poppins:Regular',sans-serif] text-[#999999] text-[11px] mt-[4px] px-[4px]">
                        {message.timestamp.toLocaleTimeString("vi-VN", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>

                  {/* Quick Replies */}
                  {message.quickReplies &&
                    message.quickReplies.length > 0 &&
                    message.sender === "bot" && (
                      <div className="flex flex-wrap gap-[8px] mt-[12px] ml-[44px]">
                        {message.quickReplies.map((reply, index) => (
                          <button
                            key={index}
                            disabled={isTyping}
                            onClick={() => handleSendMessage(reply)}
                            className={`px-[12px] py-[8px] border-2 rounded-[8px] font-['Fz_Poppins:Medium',sans-serif] text-[13px] transition-colors ${isTyping
                              ? "bg-gray-100 border-gray-300 text-gray-400 cursor-not-allowed"
                              : "bg-white border-[#3fb5ff] text-[#3fb5ff] hover:bg-[#ebf6fc]"
                              }`}
                          >
                            {reply}
                          </button>
                        ))}
                      </div>
                    )}
                </div>
              ))}

              {isTyping && (
                <div className="flex gap-[12px]">
                  <div className="w-[32px] h-[32px] bg-gradient-to-br from-[#3fb5ff] to-[#1e8bc3] rounded-[8px] flex items-center justify-center flex-shrink-0">
                    <Bot className="w-[18px] h-[18px] text-white" />
                  </div>
                  <div className="bg-white border border-[#ebf6fc] rounded-[12px] p-[12px]">
                    <div className="flex gap-[4px]">
                      <div
                        className="w-[8px] h-[8px] bg-[#3fb5ff] rounded-full animate-bounce"
                        style={{ animationDelay: "0ms" }}
                      />
                      <div
                        className="w-[8px] h-[8px] bg-[#3fb5ff] rounded-full animate-bounce"
                        style={{ animationDelay: "150ms" }}
                      />
                      <div
                        className="w-[8px] h-[8px] bg-[#3fb5ff] rounded-full animate-bounce"
                        style={{ animationDelay: "300ms" }}
                      />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* INPUT FORM */}
            <div className="p-[16px] bg-white border-t border-[#ebf6fc] flex-shrink-0">
              <form onSubmit={handleSubmit} className="flex gap-[8px]">
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Nhập câu hỏi (ví dụ: đau răng, tẩy trắng)..."
                  className="flex-1 font-['Fz_Poppins:Regular',sans-serif]"
                  disabled={isTyping}
                />
                <Button
                  type="submit"
                  disabled={!inputValue.trim() || isTyping}
                  className="bg-gradient-to-r from-[#3fb5ff] to-[#1e8bc3] hover:shadow-[0px_4px_16px_0px_rgba(63,181,255,0.4)] transition-all px-[16px]"
                >
                  <Send className="w-[18px] h-[18px]" />
                </Button>
              </form>
            </div>
          </Card>
        </div>
      )}
    </>
  );
}
