
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ChatMessage as ChatMessageType, Sender } from './types';
import * as geminiService from './services/geminiService';
import ImageUpload from './components/ImageUpload';
import ChatMessage from './components/ChatMessage';
import MessageInput from './components/MessageInput';
import { ThinkingIcon } from './components/Icons';

const App: React.FC = () => {
  const [chatHistory, setChatHistory] = useState<ChatMessageType[]>([]);
  const [userInput, setUserInput] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);
  
  const addMessage = (sender: Sender, text: string, isThinking: boolean = false) => {
    setChatHistory(prev => [...prev, { id: Date.now().toString(), sender, text, isThinking }]);
  };
  
  const handleImageUpload = useCallback(async (base64Image: string) => {
    setUploadedImage(base64Image);
    setChatHistory([]);
    addMessage('system', 'Image successfully uploaded. Analyzing...');
    setIsLoading(true);
    setError(null);
    try {
      const response = await geminiService.analyzeImageAndStartTutoring(base64Image);
      setChatHistory(prev => {
          const newHistory = prev.filter(m => m.sender !== 'system');
          return [...newHistory, { id: Date.now().toString(), sender: 'ai', text: response }];
      });
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : "An unknown error occurred.";
      setError(`Failed to analyze image: ${errorMessage}`);
      addMessage('system', `Error: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleSendMessage = async () => {
    if (!userInput.trim() || isLoading) return;
    
    const newUserMessage: ChatMessageType = { id: Date.now().toString(), sender: 'user', text: userInput };
    const currentChatHistory = [...chatHistory, newUserMessage];
    setChatHistory(currentChatHistory);
    setUserInput('');
    setIsLoading(true);
    setError(null);

    const isComplexQuery = userInput.toLowerCase().includes('why');

    const loadingMessageId = (Date.now() + 1).toString();
    setChatHistory(prev => [...prev, { id: loadingMessageId, sender: 'ai', text: '', isThinking: isComplexQuery }]);

    try {
      let responseText: string;
      if (isComplexQuery) {
        responseText = await geminiService.explainConceptWithThinking(currentChatHistory);
      } else {
        responseText = await geminiService.continueConversation(currentChatHistory);
      }
      
      setChatHistory(prev => prev.map(msg => msg.id === loadingMessageId ? { ...msg, text: responseText, isThinking: false } : msg));

    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : "An unknown error occurred.";
      setError(`Failed to get response: ${errorMessage}`);
      setChatHistory(prev => prev.map(msg => msg.id === loadingMessageId ? { ...msg, text: `Sorry, I encountered an error: ${errorMessage}`, isThinking: false } : msg));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen font-sans">
      <div className="flex-1 flex flex-col bg-slate-800">
        <header className="bg-slate-900/70 backdrop-blur-sm p-4 border-b border-slate-700 shadow-md">
          <h1 className="text-xl font-bold text-cyan-400 flex items-center gap-3">
            <ThinkingIcon className="w-6 h-6" />
            Socratic Math Tutor
          </h1>
          <p className="text-sm text-slate-400">Upload a math problem and let's solve it together.</p>
        </header>
        
        <main className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
           {error && (
            <div className="bg-red-500/20 border border-red-500 text-red-300 p-3 rounded-lg">
              <strong>Error:</strong> {error}
            </div>
          )}
          <div className="space-y-4">
            {chatHistory.map((msg) => (
              <ChatMessage key={msg.id} message={msg} />
            ))}
             <div ref={chatEndRef} />
          </div>
        </main>
        
        <footer className="p-4 bg-slate-900/50 border-t border-slate-700">
            <MessageInput 
                userInput={userInput}
                setUserInput={setUserInput}
                onSend={handleSendMessage}
                isLoading={isLoading}
                disabled={!uploadedImage}
            />
        </footer>
      </div>

      <aside className="w-1/3 min-w-[300px] max-w-[500px] bg-slate-900 border-l border-slate-700 p-6 hidden lg:flex flex-col">
        <h2 className="text-lg font-semibold text-slate-300 mb-4">Problem View</h2>
        <div className="flex-1 rounded-lg bg-slate-800/50 flex items-center justify-center p-4 border-2 border-dashed border-slate-600">
          <ImageUpload onImageUpload={handleImageUpload} uploadedImage={uploadedImage} />
        </div>
        <div className="mt-4 text-xs text-slate-500">
            <p><strong>Tip:</strong> If you get stuck, try asking "Why did we do that?" to get a deeper explanation.</p>
        </div>
      </aside>
    </div>
  );
};

export default App;
