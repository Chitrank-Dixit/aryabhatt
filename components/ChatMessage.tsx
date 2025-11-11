
import React from 'react';
import { ChatMessage as ChatMessageType } from '../types';
import { ThinkingIcon } from './Icons';

interface ChatMessageProps {
  message: ChatMessageType;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const { sender, text, isThinking } = message;

  if (sender === 'system') {
    return (
      <div className="text-center text-xs text-slate-500 italic py-2">
        {text}
      </div>
    );
  }

  const isAI = sender === 'ai';

  if (isThinking) {
    return (
      <div className="flex items-start gap-3">
         <div className="w-8 h-8 rounded-full bg-cyan-500 flex items-center justify-center flex-shrink-0">
          <ThinkingIcon className="w-5 h-5 text-white animate-pulse" />
        </div>
        <div className="bg-slate-700 rounded-lg p-3 max-w-xl animate-pulse">
            <div className="flex items-center gap-2 text-slate-400">
              <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce delay-75"></div>
              <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce delay-150"></div>
              <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce delay-300"></div>
              <span className="text-sm font-semibold ml-1">Thinking...</span>
            </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className={`flex items-start gap-3 ${!isAI ? 'flex-row-reverse' : ''}`}>
      {isAI && (
        <div className="w-8 h-8 rounded-full bg-slate-600 flex items-center justify-center flex-shrink-0">
          <i className="fa-solid fa-brain text-cyan-400"></i>
        </div>
      )}
      <div
        className={`rounded-lg p-3 max-w-xl text-white ${isAI ? 'bg-slate-700' : 'bg-cyan-600'}`}
      >
        <p className="whitespace-pre-wrap">{text}</p>
      </div>
    </div>
  );
};

export default ChatMessage;
