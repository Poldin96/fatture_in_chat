export function TypingIndicator() {
  return (
    <div className="flex justify-start mb-4">
      <div className="max-w-xs lg:max-w-md xl:max-w-lg px-4 py-3 rounded-2xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-bl-sm shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <div className="flex gap-1">
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
          </div>
          <span className="text-sm text-gray-500 dark:text-gray-400">AI sta scrivendo...</span>
        </div>
      </div>
    </div>
  );
} 