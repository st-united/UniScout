import axios from 'axios';
import { X, MessageCircle } from 'lucide-react';
import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';

import type { Components } from 'react-markdown';

const API_BASE_URL = import.meta.env.DEV
  ? import.meta.env.VITE_BACKEND_URL
  : import.meta.env.VITE_BASE_URL_API;
type Message = {
  from: 'user' | 'bot';
  text?: string;
  suggestions?: string[];
  time: string;
};

const formatTime = (date: Date) =>
  date.toLocaleString('en-US', {
    weekday: 'short',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });

const formatTextForMarkdown = (text: string): string => {
  const devPlusSocialRegex = /(linkedin|facebook|tiktok):\s*(https?:\/\/\S+)/gi;
  const formattedText = text.replace(devPlusSocialRegex, (match, platform, url) => {
    return `[${platform}](${url})`;
  });

  const genericUrlRegex = /(\s|^)((https?:\/\/\S+)|(www\.\S+))/g;
  const finalFormattedText = formattedText.replace(genericUrlRegex, (match, p1, p2) => {
    return `${p1}[${p2}](${p2})`;
  });

  return finalFormattedText;
};

const saveChatState = (messages: Message[], sessionId: string | null) => {
  try {
    sessionStorage.setItem('chatbot_messages', JSON.stringify(messages));
    if (sessionId) {
      sessionStorage.setItem('chatbot_session_id', sessionId);
    }
  } catch (error) {
    console.error('Error saving chat state to sessionStorage:', error);
  }
};

const loadChatState = () => {
  try {
    const savedMessages = sessionStorage.getItem('chatbot_messages');
    const savedSessionId = sessionStorage.getItem('chatbot_session_id');
    return {
      messages: savedMessages ? JSON.parse(savedMessages) : [],
      sessionId: savedSessionId,
    };
  } catch (error) {
    console.error('Error loading chat state from sessionStorage:', error);
    return { messages: [], sessionId: null };
  }
};

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isBotTyping, setIsBotTyping] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);

  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (isOpen) {
      const { messages: loadedMessages, sessionId: loadedSessionId } = loadChatState();

      if (loadedMessages.length > 0) {
        setMessages(loadedMessages);
      } else {
        const initialCombinedMessage: Message = {
          from: 'bot',
          text: 'Hello, I’m DevBot! 👋 I’m your personal assistant. How can I help you?',
          suggestions: [
            'How do I search for universities by location or type?',
            'How can I contact with DevPlus?',
            'What are the top-ranked universities in USA?',
          ],
          time: formatTime(new Date()),
        };
        setMessages([initialCombinedMessage]);
      }

      if (loadedSessionId) {
        setSessionId(loadedSessionId);
      } else {
        setSessionId(`user_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`);
      }
    }
  }, [isOpen]);

  useEffect(() => {
    saveChatState(messages, sessionId);
  }, [messages, sessionId]);

  const sendMessage = async (messageToSend = input) => {
    if (!messageToSend.trim() || !sessionId) return;

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

      const response = await axios.post(`${API_BASE_URL}api/chatbot/message`, payload);

      const botReplyText = response.data?.reply;
      if (!botReplyText) {
        throw new Error('Invalid response from server: Missing reply.');
      }
      const returnedSessionId = response.data.sessionId || response.data.userId;

      if (returnedSessionId && returnedSessionId !== sessionId) {
        setSessionId(returnedSessionId);
      }

      const formattedBotReplyText = formatTextForMarkdown(botReplyText);

      const botReply: Message = {
        from: 'bot',
        text: formattedBotReplyText,
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

  const handleSuggestionClick = (suggestion: string) => {
    sendMessage(suggestion);
  };

  const handleResetChat = async () => {
    if (isClosing) return;
    setIsClosing(true);
    setIsOpen(false);
    if (sessionId) {
      try {
        await axios.post(`${API_BASE_URL}api/chatbot/reset`, { userId: sessionId });
        console.log(`Session ${sessionId} reset on backend.`);
      } catch (error) {
        console.error('Error resetting backend session:', error);
      }
    }
    setIsClosing(false);
  };

  const renderers: Components = {
    a: ({ href, children, ...props }) => {
      const isDownloadLink =
        href &&
        (href.startsWith('api/chatbot/download-pdf/') ||
          href.startsWith('api/chatbot/download-excel/') ||
          href.startsWith('api/chatbot/download-csv/'));

      if (isDownloadLink) {
        const fullHref = href.startsWith('http')
          ? href
          : `${API_BASE_URL}${href.startsWith('/') ? href.slice(1) : href}`;
        return (
          <a
            href={fullHref}
            target='_blank'
            rel='noopener noreferrer'
            download
            style={{ color: 'blue', textDecoration: 'underline', cursor: 'pointer' }}
            {...props}
          >
            {children}
          </a>
        );
      }
      return (
        <a href={href} target='_blank' rel='noopener noreferrer' {...props}>
          {children}
        </a>
      );
    },
  };

  return (
    <div className='fixed bottom-6 right-6 z-50 font-sans'>
      {isOpen ? (
        <div
          className={`w-80 h-[480px] rounded-xl border border-gray-200 bg-white flex flex-col overflow-hidden shadow-lg`}
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
              disabled={isClosing}
              className='p-1 flex items-center justify-center transition-colors bg-transparent border-none focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed'
            >
              <X size={20} />
            </button>
          </div>

          <div className={`flex-1 overflow-y-auto p-3 space-y-2 bg-gray-50`}>
            {messages.length > 0 && (
              <div className='flex justify-center'>
                <span className='text-xs text-gray-500'>
                  {messages[0].time.split(',').join('')}
                </span>
              </div>
            )}
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
                  {msg.from === 'bot' && (
                    <div className='flex flex-col gap-2'>
                      <div
                        className={`px-3 py-2 max-w-[80%] rounded-xl text-sm bg-[#fef4e8] text-gray-800 rounded-bl-none prose`}
                      >
                        <ReactMarkdown rehypePlugins={[rehypeRaw]} components={renderers}>
                          {msg.text}
                        </ReactMarkdown>
                      </div>
                      {msg.suggestions && (
                        <div className='flex flex-col gap-2'>
                          {msg.suggestions.map((suggestion, suggestionIdx) => (
                            <button
                              key={suggestionIdx}
                              onClick={() => handleSuggestionClick(suggestion)}
                              className='px-3 py-2 text-sm text-orange-500 text-left cursor-pointer transition-colors hover:bg-orange-100 rounded-xl'
                            >
                              {suggestion}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                  {msg.from === 'user' && (
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
                  )}
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
                  <div className='flex space-x-1'>
                    <span className='animate-bounce' style={{ animationDelay: '0s' }}>
                      .
                    </span>
                    <span className='animate-bounce' style={{ animationDelay: '0.2s' }}>
                      .
                    </span>
                    <span className='animate-bounce' style={{ animationDelay: '0.4s' }}>
                      .
                    </span>
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
              <img src='/send.png' alt='send' className='w-7 h-7' />{' '}
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setIsOpen(true)}
          className='bg-transparent border-none p-0 focus:outline-none transition-transform transform hover:scale-105'
          aria-label='Open Chatbot'
        >
          <img
            src='/Button.png'
            alt='Chatbot Logo'
            className='w-14 h-14 rounded-full object-cover shadow-lg'
          />
        </button>
      )}
    </div>
  );
};

export default Chatbot;
