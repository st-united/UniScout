import axios from 'axios';
import { X, MessageCircle } from 'lucide-react';
import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';

import type { Components } from 'react-markdown';

import styles from './chatbot.module.css';

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
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isBotTyping, setIsBotTyping] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      if (!sessionId) {
        setSessionId(`user_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`);
      }

      const initialGreetingMessage: Message = {
        from: 'bot',
        text: 'Hello, I’m DevBot! 👋 I’m your personal assistant. How can I help you?',
        time: formatTime(new Date()),
      };
      setMessages([initialGreetingMessage]);
    }
  }, [isOpen, messages.length, sessionId]);

  const sendMessage = async (messageToSend = input) => {
    if (!messageToSend.trim()) return;

    const currentTime = formatTime(new Date());

    const newUserMessage: Message = { from: 'user', text: messageToSend, time: currentTime };
    setMessages((prev) => [...prev, newUserMessage]);

    setInput('');
    setIsBotTyping(true);

    try {
      const payload = {
        message: messageToSend,
        userId: sessionId,
      };

      const response = await axios.post('http://localhost:6002/api/chatbot/message', payload);

      const botReplyText = response.data.reply;
      const returnedSessionId = response.data.sessionId || response.data.userId;

      if (returnedSessionId && returnedSessionId !== sessionId) {
        setSessionId(returnedSessionId);
      }

      const botReply: Message = {
        from: 'bot',
        text: botReplyText,
        time: formatTime(new Date()),
      };

      setMessages((prev) => [...prev, botReply]);
    } catch (error) {
      console.error('Chatbot API error:', error);
      const errorReply: Message = {
        from: 'bot',
        text: 'Something went wrong. Please try again.',
        time: formatTime(new Date()),
      };
      setMessages((prev) => [...prev, errorReply]);
    } finally {
      setIsBotTyping(false);
    }
  };

  const handleResetChat = async () => {
    if (sessionId) {
      try {
        await axios.post('http://localhost:6002/api/chatbot/reset', { userId: sessionId });
        console.log(`Session ${sessionId} reset on backend.`);
      } catch (error) {
        console.error('Error resetting backend session:', error);
      }
    }
    setIsOpen(false);
    setMessages([]);
    setInput('');
    setIsBotTyping(false);
    setSessionId(null);
  };

  // Custom Markdown Renderer for Links
  const renderers: Components = {
    a: ({ href, children, ...props }) => {
      // Check if the link is for PDF, Excel, or CSV download
      const isDownloadLink =
        href &&
        (href.startsWith('/api/chatbot/download-pdf/') ||
          href.startsWith('/api/chatbot/download-excel/') || // <--- Added Excel check
          href.startsWith('/api/chatbot/download-csv/')); // <--- Added CSV check

      if (isDownloadLink) {
        return (
          <a
            href={`http://localhost:6002${href}`} // Prepend the full base URL for all download links
            target='_blank'
            rel='noopener noreferrer'
            download // This attribute prompts the browser to download the file instead of navigating
            style={{ color: 'blue', textDecoration: 'underline', cursor: 'pointer' }}
            {...props}
          >
            {children}
          </a>
        );
      }
      // For all other links, render as a regular anchor tag
      return (
        <a href={href} {...props}>
          {children}
        </a>
      );
    },
  };

  return (
    <div className='fixed bottom-6 right-6 z-50 font-sans'>
      {isOpen ? (
        <div
          className={`w-80 h-[480px] rounded-xl border border-gray-200 bg-white flex flex-col overflow-hidden ${styles.chatContainerShadow}`}
        >
          <div className='bg-orange-500 text-white flex items-center px-4 py-3 justify-between'>
            <div className='flex items-center gap-2 font-semibold'>
              <img
                src='/chat.jpg'
                alt='Bot'
                className='w-8 h-8 rounded-full border-2 border-white object-cover'
              />
              <span className='text-sm'>UniScout Assistant</span>
            </div>
            <button
              onClick={handleResetChat}
              className='p-1 flex items-center justify-center transition-colors bg-transparent border-none focus:outline-none'
            >
              <X size={20} />
            </button>
          </div>

          <div className={`flex-1 overflow-y-auto p-3 space-y-4 bg-gray-50 ${styles.chatBody}`}>
            {messages.map((msg, idx) => (
              <React.Fragment key={idx}>
                <div
                  className={`flex ${
                    msg.from === 'user' ? 'justify-end' : 'justify-start'
                  } items-start gap-2`}
                >
                  {msg.from === 'bot' && (
                    <img
                      src='/chat2.png'
                      alt='Bot Logo'
                      className='w-6 h-6 border border-orange-400 rounded-full p-0.5 bg-white'
                    />
                  )}
                  <div
                    className={`px-3 py-2 max-w-[80%] rounded-xl text-sm ${
                      msg.from === 'user'
                        ? 'bg-orange-500 text-white rounded-br-none'
                        : 'bg-[#fef4e8] text-gray-800 rounded-bl-none'
                    } prose`}
                  >
                    <ReactMarkdown rehypePlugins={[rehypeRaw]} components={renderers}>
                      {msg.text}
                    </ReactMarkdown>
                  </div>
                </div>
              </React.Fragment>
            ))}
            {isBotTyping && (
              <div className='flex justify-start items-center gap-2'>
                <img
                  src='/chat2.png'
                  alt='Bot Logo'
                  className='w-6 h-6 border border-orange-400 rounded-full p-0.5 bg-white'
                />
                <div className='bg-[#fef4e8] text-gray-800 px-3 py-2 max-w-[80%] rounded-xl rounded-bl-none text-sm'>
                  <div className={styles.typingIndicator}>
                    <span>.</span>
                    <span>.</span>
                    <span>.</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className='p-3 border-t border-gray-200 flex gap-2 items-center bg-white'>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={isBotTyping ? 'Bot is typing...' : 'Type a message...'}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !isBotTyping) sendMessage();
              }}
              disabled={isBotTyping}
              className='flex-1 px-4 py-2 text-sm border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-orange-300 disabled:bg-gray-100 disabled:cursor-not-allowed'
            />
            <button
              onClick={() => sendMessage()}
              disabled={isBotTyping}
              className='bg-orange-500 hover:bg-orange-600 text-white rounded-full p-2 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed'
            >
              <img src='/send.png' alt='send' className='w-7 h-7' />
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setIsOpen(true)}
          className='bg-orange-500 text-white rounded-full p-3 shadow-lg hover:bg-orange-600 transition-colors'
        >
          <MessageCircle size={24} />
        </button>
      )}
    </div>
  );
};
export default Chatbot;
