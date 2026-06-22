import React, { useState } from 'react';
import axios from 'axios';
import { Bot, Send, X, Minimize2, Maximize2 } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';

const API_URL = process.env.REACT_APP_BACKEND_URL;

export const AIAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hello! I\'m your AI security assistant powered by Llama 3.1. Ask me about threat analysis, security recommendations, or incident response.' }
  ]);
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!message.trim()) return;

    const userMessage = message;
    setMessage('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    try {
      const { data } = await axios.post(
        `${API_URL}/api/ai/chat`,
        { message: userMessage },
        { withCredentials: true }
      );
      setMessages(prev => [...prev, { role: 'assistant', content: data.response }]);
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'I encountered an error. Please ensure the Ollama service is running with Llama 3.1 model loaded.' 
      }]);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-cyan-500 hover:bg-cyan-600 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(6,182,212,0.4)] hover:shadow-[0_0_40px_rgba(6,182,212,0.6)] transition-all z-50"
        data-testid="ai-assistant-open-button"
      >
        <Bot className="w-6 h-6 text-white" />
      </button>
    );
  }

  return (
    <div 
      className={`fixed right-6 z-50 bg-slate-900/90 backdrop-blur-2xl border border-cyan-500/30 shadow-[0_0_30px_rgba(6,182,212,0.2)] rounded-2xl overflow-hidden flex flex-col transition-all ${
        isMinimized ? 'bottom-6 w-80 h-16' : 'bottom-6 w-96 h-[600px]'
      }`}
      data-testid="ai-assistant-widget"
    >
      <div className="flex items-center justify-between p-4 border-b border-white/10 bg-slate-950/50">
        <div className="flex items-center gap-3">
          <div 
            className="w-10 h-10 rounded-full flex items-center justify-center"
            style={{ backgroundImage: `url('https://static.prod-images.emergentagent.com/jobs/4b0dec1c-2f82-4ca3-aaed-c75274dabdaf/images/3cd4ea1e7251b67e1802844e1497b2f4f894256cc3cc63cf0de31846ef49f2fa.png')`, backgroundSize: 'cover' }}
          >
            <Bot className="w-6 h-6 text-cyan-400" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-100">AI Assistant</h3>
            <p className="text-xs text-slate-400">Llama 3.1</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-1.5 hover:bg-slate-800 rounded transition-colors"
            data-testid="ai-assistant-minimize"
          >
            {isMinimized ? <Maximize2 className="w-4 h-4 text-slate-400" /> : <Minimize2 className="w-4 h-4 text-slate-400" />}
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1.5 hover:bg-slate-800 rounded transition-colors"
            data-testid="ai-assistant-close"
          >
            <X className="w-4 h-4 text-slate-400" />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin" data-testid="ai-chat-messages">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] px-4 py-3 rounded-lg ${
                    msg.role === 'user'
                      ? 'bg-cyan-500/20 border border-cyan-500/30 text-slate-100'
                      : 'bg-slate-800/50 border border-white/5 text-slate-200'
                  }`}
                >
                  <p className="text-sm leading-relaxed">{msg.content}</p>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-slate-800/50 border border-white/5 px-4 py-3 rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
                    <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="p-4 border-t border-white/10 bg-slate-950/50">
            <div className="flex items-center gap-2">
              <Input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                placeholder="Ask about threats..."
                className="flex-1 bg-slate-900/50 border-white/10 text-white placeholder:text-slate-500"
                disabled={loading}
                data-testid="ai-chat-input"
              />
              <Button
                onClick={sendMessage}
                disabled={loading || !message.trim()}
                className="bg-cyan-500 hover:bg-cyan-600 text-white"
                data-testid="ai-chat-send"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};