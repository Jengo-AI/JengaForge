import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';
import { chatWithGemini } from '../services/geminiService';
import { ChatMessage } from '../types';

import { PageWrapper } from '../components/PageWrapper';

import { useAuth } from '../context/AuthContext';

export const Assistant: React.FC = () => {
  const { user } = useAuth();
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'model',
      text: "Hello! I'm JengaAgent. I can help you find the right tools, compare them, or suggest workflows for your next project. What are you building today?",
      timestamp: new Date()
    }
  ]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    // Format history for context (simplified)
    const history = messages.map(m => ({
        role: m.role,
        parts: [{ text: m.text }]
    }));

    const responseText = await chatWithGemini(userMsg.text, history);

    const botMsg: ChatMessage = {
      id: (Date.now() + 1).toString(),
      role: 'model',
      text: responseText,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, botMsg]);
    setIsLoading(false);
  };

  return (
    <PageWrapper>
      <div className="container mx-auto px-4 py-8 h-[calc(100vh-64px)] flex flex-col">
       <div className="flex-none mb-6 text-center">
            <h1 className="text-3xl font-black text-surface-text flex items-center justify-center gap-3 uppercase tracking-widest">
                <Sparkles className="text-jenga-500" />
                Jenga<span className="text-jenga-500">Agent</span>
            </h1>
            <p className="text-surface-muted text-sm mt-2 font-mono">Powered by Gemini 3 Flash</p>
       </div>

       {/* Chat Area */}
       <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="flex-grow bg-dark-800 border-4 border-dark-600 rounded-none overflow-hidden flex flex-col shadow-[8px_8px_0px_0px_rgba(255,140,0,1)]"
       >
            <div className="flex-grow overflow-y-auto p-6 space-y-6 custom-scrollbar">
                {messages.map((msg) => (
                    <motion.div 
                        key={msg.id} 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                        <div className={`flex max-w-[85%] md:max-w-[70%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'} gap-4`}>
                            <div className={`w-8 h-8 rounded-none flex items-center justify-center flex-shrink-0 border-2 border-dark-600 overflow-hidden ${msg.role === 'user' ? 'bg-dark-700' : 'bg-jenga-500'}`}>
                                {msg.role === 'user' ? (
                                    user?.avatar ? (
                                        <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                                    ) : (
                                        <User className="w-5 h-5 text-surface-text" />
                                    )
                                ) : (
                                    <Bot className="w-5 h-5 text-dark-950" />
                                )}
                            </div>
                            <div className={`p-4 rounded-none text-sm leading-relaxed border-2 font-mono ${
                                msg.role === 'user' 
                                ? 'bg-dark-900 text-surface-text border-dark-600' 
                                : 'bg-dark-800 text-surface-text border-jenga-500 shadow-[4px_4px_0px_0px_rgba(255,140,0,1)]'
                            }`}>
                                {/* Simple Markdown-like rendering for lists/bold */}
                                {msg.text.split('\n').map((line, i) => (
                                    <p key={i} className="mb-2 last:mb-0">
                                        {line}
                                    </p>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                ))}
                {isLoading && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex justify-start"
                    >
                         <div className="flex gap-4">
                            <div className="w-8 h-8 rounded-none bg-jenga-500 border-2 border-dark-600 flex items-center justify-center">
                                <Bot className="w-5 h-5 text-dark-950" />
                            </div>
                            <div className="bg-dark-900 p-4 rounded-none border-2 border-dark-600 flex items-center gap-2 text-surface-muted text-sm font-mono">
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Thinking...
                            </div>
                         </div>
                    </motion.div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-dark-900 border-t-4 border-dark-600">
                <form onSubmit={handleSend} className="relative group">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Ask for a recommendation (e.g., 'Best free tool for logos?')..."
                        className="relative w-full bg-dark-800 text-surface-text rounded-none pl-5 pr-12 py-4 focus:outline-none focus:border-jenga-500 border-4 border-dark-600 font-mono transition-all"
                        disabled={isLoading}
                    />
                    <button 
                        type="submit" 
                        disabled={!input.trim() || isLoading}
                        className="absolute right-2 top-2 p-2 bg-jenga-500 hover:bg-jenga-400 text-dark-950 transition-all disabled:opacity-50 disabled:cursor-not-allowed border-2 border-dark-950 rounded-none"
                    >
                        <Send className="w-5 h-5" />
                    </button>
                </form>
            </div>
        </motion.div>
    </div>
    </PageWrapper>
  );
};
