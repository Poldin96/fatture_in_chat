import { ChatMessage } from '@/lib/supabase/types'

interface MessageBubbleProps {
  message: ChatMessage;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === "user";
  
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('it-IT', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  // Funzione per formattare il testo markdown semplice
  const formatMessageContent = (content: string) => {
    // Sostituisci **testo** con grassetto
    let formatted = content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    // Sostituisci • con bullet point
    formatted = formatted.replace(/•/g, '&bull;');
    
    // Sostituisci emoji e mantieni le interruzioni di riga
    formatted = formatted.replace(/\n/g, '<br>');
    
    return formatted;
  };

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`max-w-xs lg:max-w-md xl:max-w-lg px-4 py-3 rounded-2xl ${
        isUser 
          ? 'bg-blue-600 text-white rounded-br-sm' 
          : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-bl-sm shadow-sm border border-gray-200 dark:border-gray-700'
      }`}>
        <div 
          className="text-sm leading-relaxed"
          dangerouslySetInnerHTML={{ 
            __html: formatMessageContent(message.content) 
          }}
        />
        <div className={`text-xs mt-1 flex items-center gap-1 ${
          isUser ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'
        }`}>
          <span>{formatTime(message.timestamp)}</span>
          {isUser && (
            <span className="ml-1">✓</span>
          )}
        </div>
      </div>
    </div>
  );
} 