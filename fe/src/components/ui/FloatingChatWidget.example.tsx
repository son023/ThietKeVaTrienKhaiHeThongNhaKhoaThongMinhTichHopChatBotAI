/**
 * FloatingChatWidget - Usage Examples
 *
 * A beautiful floating chat widget with smooth animations and responsive design.
 * Perfect for customer support, booking assistance, or general inquiries.
 */

import { FloatingChatWidget } from './FloatingChatWidget';

// ============================================================================
// Example 1: Basic Usage
// ============================================================================
export function BasicExample() {
  return (
    <div>
      {/* Your page content */}
      <div className="min-h-screen bg-neutral-background p-8">
        <h1>My Page</h1>
        {/* ... other content ... */}
      </div>

      {/* Floating Chat Widget */}
      <FloatingChatWidget />
    </div>
  );
}

// ============================================================================
// Example 2: Custom Configuration
// ============================================================================
export function CustomExample() {
  const handleSendMessage = (message: string) => {
    console.log('User sent:', message);

    // Send to your backend API
    // fetch('/api/chat', {
    //   method: 'POST',
    //   body: JSON.stringify({ message })
    // });
  };

  return (
    <FloatingChatWidget
      botName="Phòng khám DentalCareX"
      welcomeMessage="Xin chào! Chúng tôi có thể giúp bạn đặt lịch hẹn hoặc tư vấn về dịch vụ nha khoa. Bạn cần hỗ trợ gì?"
      onSendMessage={handleSendMessage}
    />
  );
}

// ============================================================================
// Example 3: Integration with API
// ============================================================================
export function ApiIntegrationExample() {
  const handleSendMessage = async (message: string) => {
    try {
      const response = await fetch('/api/chatbot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          userId: 'user-123',
          timestamp: new Date().toISOString()
        })
      });

      const data = await response.json();
      console.log('Bot response:', data.reply);

      // The component will handle showing the response
      // You can extend the component to accept bot responses via props
    } catch (error) {
      console.error('Chat API error:', error);
    }
  };

  return (
    <FloatingChatWidget
      botName="AI Assistant"
      welcomeMessage="Xin chào! Tôi là trợ lý AI. Hãy hỏi tôi bất cứ điều gì!"
      onSendMessage={handleSendMessage}
    />
  );
}

// ============================================================================
// Example 4: In Layout Component
// ============================================================================
export function LayoutWithChat({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-white shadow">
        {/* ... header content ... */}
      </header>

      {/* Main Content */}
      <main className="container mx-auto py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-neutral-heading text-white py-8">
        {/* ... footer content ... */}
      </footer>

      {/* Floating Chat Widget */}
      <FloatingChatWidget
        botName="Support Team"
        welcomeMessage="Chào bạn! Cần hỗ trợ gì không?"
      />
    </div>
  );
}

// ============================================================================
// Props Documentation
// ============================================================================

/**
 * FloatingChatWidget Props:
 *
 * @param {string} botName - Name displayed in chat header (default: "DentalCare Assistant")
 * @param {string} welcomeMessage - Initial greeting message (default: "Xin chào! Tôi có thể giúp gì cho bạn?")
 * @param {(message: string) => void} onSendMessage - Callback when user sends a message
 *
 * Features:
 * - ✅ Smooth animations (scale, opacity, rotate)
 * - ✅ Responsive design (mobile-friendly)
 * - ✅ Auto-scroll to latest message
 * - ✅ Typing indicator
 * - ✅ Quick action buttons
 * - ✅ Timestamp for each message
 * - ✅ Pulse animation on FAB when closed
 * - ✅ Keyboard support (Enter to send)
 * - ✅ Click outside to close
 * - ✅ Design system compliant
 *
 * Styling:
 * - Uses Tailwind utility classes
 * - Follows design tokens (primary, neutral, etc.)
 * - Uses Fz_Poppins font family
 * - Lucide-react icons
 *
 * Accessibility:
 * - aria-label on buttons
 * - Keyboard navigation support
 * - Focus management
 * - Screen reader friendly
 *
 * Mobile Responsive:
 * - Width adjusts on small screens
 * - Height respects viewport (max-h-[80vh])
 * - Touch-friendly buttons
 * - Proper spacing and padding
 */
