// src/components/common/Chatbot.tsx
import React, { useState } from 'react';
import axios from 'axios';
import { X, MessageCircle } from 'lucide-react';

type Message = {
  from: 'user' | 'bot';
  text: string;
  time: string;
};

const formatTime = (date: Date) =>
  date.toLocaleString('en-US', {
    weekday: 'short',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const currentTime = formatTime(new Date());
    const userMessage: Message = { from: 'user', text: input, time: currentTime };
    setMessages((prev) => [...prev, userMessage]);

    try {
      const response = await axios.post('http://localhost:6002/api/chatbot/message', {
        message: input,
      });

      const botReply: Message = {
        from: 'bot',
        text: response.data.response,
        time: formatTime(new Date()),
      };
      setMessages((prev) => [...prev, botReply]);
      setInput('');
    } catch (error) {
      const errorReply: Message = {
        from: 'bot',
        text: 'Something went wrong. Please try again.',
        time: formatTime(new Date()),
      };
      setMessages((prev) => [...prev, errorReply]);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans">
      {isOpen ? (
        <div className="w-80 h-[480px] rounded-xl shadow-xl border border-gray-200 bg-white flex flex-col overflow-hidden">
          {/* Header with fixed logo size */}
          <div className="bg-orange-500 text-white flex items-center px-4 py-3 justify-between">
            <div className="flex items-center gap-2 font-semibold">
              <img
                src="/chat.jpg"
                alt="Bot"
                className="w-8 h-8 rounded-full border-2 border-white object-cover"
              />
              <span className="text-sm">UniScout Assistant</span>
            </div>
            <button 
              onClick={() => setIsOpen(false)} 
              className="hover:text-gray-200 transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Timestamp */}
          {messages.length > 0 && (
            <div className="text-center text-xs text-gray-500 py-2 bg-gray-50">
              {messages[0].time}
            </div>
          )}

          {/* Chat Body */}
          <div className="flex-1 overflow-y-auto p-3 space-y-4 bg-gray-50">
            {messages.map((msg, idx) => (
              <div 
                key={idx} 
                className={`flex ${msg.from === 'user' ? 'justify-end' : 'justify-start'} items-start gap-2`}
              >
                {msg.from === 'bot' && (
                  <img
                    src="/chat2.png"
                    alt="Bot Logo"
                    className="w-6 h-6 border border-orange-400 rounded-full p-0.5 bg-white"
                  />
                )}
                <div
                  className={`px-3 py-2 max-w-[80%] rounded-xl text-sm ${
                    msg.from === 'user'
                      ? 'bg-orange-500 text-white rounded-br-none'
                      : 'bg-[#fef4e8] text-gray-800 rounded-bl-none'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
          </div>

          {/* Input Area */}
          <div className="p-3 border-t border-gray-200 flex gap-2 items-center bg-white">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type a message..."
              onKeyDown={(e) => {
                if (e.key === 'Enter') sendMessage();
              }}
              className="flex-1 px-4 py-2 text-sm border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-orange-300"
            />
            <button
              onClick={sendMessage}
              className="bg-orange-500 hover:bg-orange-600 text-white rounded-full p-2 transition-colors"
            >
              <img
                src="/send.png"
                alt="send"
                className="w-7 h-7"
              />
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-orange-500 text-white rounded-full p-3 shadow-lg hover:bg-orange-600 transition-colors"
        >
          <MessageCircle size={24} />
        </button>
      )}
    </div>
  );
};

export default Chatbot;