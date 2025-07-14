import Link from "next/link";

interface Conversation {
  id: string;
  title: string;
  lastMessage: string;
  timestamp: string;
  unreadCount: number;
}

interface ConversationItemProps {
  conversation: Conversation;
  isActive: boolean;
}

export function ConversationItem({ conversation, isActive }: ConversationItemProps) {
  const formatTime = (timestamp: string) => {
    const now = new Date();
    const date = new Date(timestamp);
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days}g`;
    if (hours > 0) return `${hours}h`;
    if (minutes > 0) return `${minutes}m`;
    return "ora";
  };

  return (
    <Link href={`/c/${conversation.id}`}>
      <div className={`px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors duration-200 cursor-pointer border-l-4 ${
        isActive 
          ? 'bg-blue-50 dark:bg-blue-900/10 border-blue-500' 
          : 'border-transparent'
      }`}>
        <div className="flex items-center justify-between mb-0.5">
          <h3 className="font-medium text-gray-900 dark:text-white text-sm truncate pr-2">
            {conversation.title}
          </h3>
          <span className="text-xs text-gray-500 dark:text-gray-400 flex-shrink-0">
            {formatTime(conversation.timestamp)}
          </span>
        </div>
        <p className="text-xs text-gray-600 dark:text-gray-400 truncate leading-relaxed">
          {conversation.lastMessage}
        </p>
      </div>
    </Link>
  );
} 