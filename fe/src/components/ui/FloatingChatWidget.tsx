import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, User, Circle } from 'lucide-react';
import { Button } from './button';

interface Message {
  id: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: Date;
}

interface FloatingChatWidgetProps {
  botName?: string;
  welcomeMessage?: string;
  onSendMessage?: (message: string) => void;
}

export function FloatingChatWidget({
  botName = 'DentalCare Assistant',
  welcomeMessage = 'Xin chào! Tôi có thể giúp gì cho bạn?',
  onSendMessage
}: FloatingChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'bot',
      content: welcomeMessage,
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleToggleChat = () => {
    setIsOpen(!isOpen);
  };

  const handleSendMessage = () => {
    if (inputValue.trim() === '') return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');

    // Call custom handler if provided
    if (onSendMessage) {
      onSendMessage(inputValue);
    }

    // Simulate bot typing
    setIsTyping(true);

    // Simulate bot response (replace with actual API call)
    setTimeout(() => {
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: 'Cảm ơn bạn đã liên hệ! Chúng tôi sẽ phản hồi sớm nhất.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMessage]);
      setIsTyping(false);
    }, 1500);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <>
      {/* Chat Box Container */}
      <div
        className={`fixed bottom-24 right-6 w-full max-w-[400px] sm:w-[400px] transition-all duration-300 origin-bottom-right z-50 ${
          isOpen
            ? 'scale-100 opacity-100 translate-y-0'
            : 'scale-95 opacity-0 translate-y-4 pointer-events-none'
        }`}
      >
        <div className="bg-neutral-surface rounded-2xl shadow-2xl border border-neutral-border overflow-hidden flex flex-col h-[600px] max-h-[80vh]">
          {/* Header */}
          <div className="bg-gradient-to-r from-primary to-primary-strong p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-['Fz_Poppins:SemiBold',sans-serif] text-white text-[16px]">
                  {botName}
                </h3>
                <div className="flex items-center gap-1.5">
                  <Circle className="w-2 h-2 text-green-400 fill-green-400 animate-pulse" />
                  <span className="font-['Fz_Poppins:Regular',sans-serif] text-white/90 text-[12px]">
                    Đang hoạt động
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={handleToggleChat}
              className="w-8 h-8 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors"
              aria-label="Đóng chat"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>

          {/* Messages List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-neutral-muted/30">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex items-start gap-2 ${
                  message.type === 'user' ? 'flex-row-reverse' : 'flex-row'
                }`}
              >
                {/* Avatar */}
                <div
                  className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                    message.type === 'user'
                      ? 'bg-primary'
                      : 'bg-neutral-gray-200'
                  }`}
                >
                  {message.type === 'user' ? (
                    <User className="w-4 h-4 text-white" />
                  ) : (
                    <Bot className="w-4 h-4 text-neutral-heading" />
                  )}
                </div>

                {/* Message Bubble */}
                <div
                  className={`flex flex-col max-w-[75%] ${
                    message.type === 'user' ? 'items-end' : 'items-start'
                  }`}
                >
                  <div
                    className={`rounded-2xl px-4 py-2.5 ${
                      message.type === 'user'
                        ? 'bg-primary text-white rounded-br-sm'
                        : 'bg-neutral-surface border border-neutral-border text-neutral-heading rounded-bl-sm'
                    }`}
                  >
                    <p className="font-['Fz_Poppins:Regular',sans-serif] text-[14px] leading-relaxed">
                      {message.content}
                    </p>
                  </div>
                  <span className="font-['Fz_Poppins:Regular',sans-serif] text-neutral-gray-400 text-[11px] mt-1 px-1">
                    {formatTime(message.timestamp)}
                  </span>
                </div>
              </div>
            ))}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex items-start gap-2">
                <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-neutral-gray-200">
                  <Bot className="w-4 h-4 text-neutral-heading" />
                </div>
                <div className="bg-neutral-surface border border-neutral-border rounded-2xl rounded-bl-sm px-4 py-3">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-neutral-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 bg-neutral-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 bg-neutral-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}

            {/* Scroll anchor */}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 bg-neutral-surface border-t border-neutral-border">
            <div className="flex items-end gap-2">
              <div className="flex-1 relative">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Nhập tin nhắn..."
                  className="w-full px-4 py-3 pr-12 rounded-xl border-2 border-neutral-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all font-['Fz_Poppins:Regular',sans-serif] text-[14px] bg-neutral-surface text-neutral-heading placeholder:text-neutral-gray-400"
                />
              </div>
              <Button
                onClick={handleSendMessage}
                disabled={inputValue.trim() === ''}
                className="h-12 w-12 rounded-xl bg-primary hover:bg-primary-strong disabled:bg-neutral-gray-200 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center p-0"
              >
                <Send className="w-5 h-5" />
              </Button>
            </div>

            {/* Quick Actions (Optional) */}
            <div className="flex gap-2 mt-3 flex-wrap">
              <button
                onClick={() => setInputValue('Đặt lịch hẹn')}
                className="px-3 py-1.5 text-[12px] font-['Fz_Poppins:Medium',sans-serif] text-primary bg-primary/10 hover:bg-primary/20 rounded-full transition-colors"
              >
                Đặt lịch hẹn
              </button>
              <button
                onClick={() => setInputValue('Hỏi về dịch vụ')}
                className="px-3 py-1.5 text-[12px] font-['Fz_Poppins:Medium',sans-serif] text-primary bg-primary/10 hover:bg-primary/20 rounded-full transition-colors"
              >
                Dịch vụ
              </button>
              <button
                onClick={() => setInputValue('Tư vấn miễn phí')}
                className="px-3 py-1.5 text-[12px] font-['Fz_Poppins:Medium',sans-serif] text-primary bg-primary/10 hover:bg-primary/20 rounded-full transition-colors"
              >
                Tư vấn
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* FAB (Floating Action Button) */}
      <button
        onClick={handleToggleChat}
        className={`fixed bottom-6 right-6 w-16 h-16 rounded-full bg-primary hover:bg-primary-strong shadow-lg hover:shadow-xl transition-all duration-300 z-50 flex items-center justify-center group ${
          isOpen ? 'rotate-90' : 'rotate-0'
        }`}
        aria-label={isOpen ? 'Đóng chat' : 'Mở chat'}
      >
        {isOpen ? (
          <X className="w-7 h-7 text-white transition-transform duration-300" />
        ) : (
          <MessageCircle className="w-7 h-7 text-white transition-transform duration-300 group-hover:scale-110" />
        )}

        {/* Pulse animation when closed */}
        {!isOpen && (
          <span className="absolute inset-0 rounded-full bg-primary animate-ping opacity-75" />
        )}
      </button>
    </>
  );
}
