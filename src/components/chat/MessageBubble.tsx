interface Message {
  id: string;
  text: string;
  sender: "user" | "ai";
  timestamp: string;
  status?: "delivered" | "read";
}

interface MessageBubbleProps {
  message: Message;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.sender === "user";
  
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('it-IT', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`max-w-xs lg:max-w-md xl:max-w-lg px-4 py-3 rounded-2xl ${
        isUser 
          ? 'bg-blue-600 text-white rounded-br-sm' 
          : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-bl-sm shadow-sm border border-gray-200 dark:border-gray-700'
      }`}>
        <div className="text-sm leading-relaxed whitespace-pre-wrap">
          {message.text}
        </div>
        <div className={`text-xs mt-1 flex items-center gap-1 ${
          isUser ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'
        }`}>
          <span>{formatTime(message.timestamp)}</span>
          {isUser && message.status === 'delivered' && (
            <span className="ml-1">✓</span>
          )}
        </div>
      </div>
    </div>
  );
} 