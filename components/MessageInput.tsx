
import React from 'react';
import { SendIcon } from './Icons';

interface MessageInputProps {
  userInput: string;
  setUserInput: (value: string) => void;
  onSend: () => void;
  isLoading: boolean;
  disabled?: boolean;
}

const MessageInput: React.FC<MessageInputProps> = ({ userInput, setUserInput, onSend, isLoading, disabled }) => {

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSend(); }} className="flex items-center gap-3">
      <input
        type="text"
        value={userInput}
        onChange={(e) => setUserInput(e.target.value)}
        onKeyPress={handleKeyPress}
        placeholder={disabled ? "Upload an image to begin..." : "Type your answer or ask a question..."}
        className="flex-1 p-3 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-shadow disabled:opacity-50 disabled:cursor-not-allowed"
        disabled={isLoading || disabled}
      />
      <button
        type="submit"
        disabled={isLoading || !userInput.trim() || disabled}
        className="bg-cyan-600 text-white p-3 rounded-lg hover:bg-cyan-700 disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors"
      >
        <SendIcon className="w-6 h-6" />
      </button>
    </form>
  );
};

export default MessageInput;
