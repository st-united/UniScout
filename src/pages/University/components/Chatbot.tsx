import axios from 'axios';
import { X, MessageCircle } from 'lucide-react';
import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';

import styles from './chatbot.module.css';

type Message = {
  from: 'user' | 'bot';
  text: string;
  time: string;
  suggestedQuestions?: string[];
  fileData?: {
    type: 'excel' | 'pdf';
    base64: string;
    filename: string;
  };
};

type BackendChatMessageDto = {
  role: 'user' | 'model';
  parts: { text: string }[];
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

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      sendMessage('', true);
    }
  }, [isOpen]);

  const handleDownloadClick = (fileData: Message['fileData']) => {
    if (!fileData) {
      console.error('No file data provided for download.');
      return;
    }

    const { base64, filename, type } = fileData;

    let mimeType: string;
    if (type === 'pdf') {
      mimeType = 'application/pdf';
    } else if (type === 'excel') {
      mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    } else {
      console.error('Unsupported file type for download:', type);
      return;
    }

    const byteCharacters = atob(base64);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);

    const blob = new Blob([byteArray], { type: mimeType });

    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);

    link.download = filename;

    document.body.appendChild(link);
    link.click();

    document.body.removeChild(link);
    window.URL.revokeObjectURL(link.href);

    console.log('Download initiated for:', filename);
  };

  const sendMessage = async (messageToSend = input, isInitialGreeting = false) => {
    if (!messageToSend.trim() && !isInitialGreeting) return;

    const currentTime = formatTime(new Date());

    if (!isInitialGreeting) {
      const newUserMessage: Message = { from: 'user', text: messageToSend, time: currentTime };
      setMessages((prev) => [...prev, newUserMessage]);
    }

    const currentConversationHistory: BackendChatMessageDto[] = messages.map((msg) => ({
      role: msg.from === 'user' ? 'user' : 'model',
      parts: [{ text: msg.text }],
    }));

    if (!isInitialGreeting) {
      currentConversationHistory.push({
        role: 'user',
        parts: [{ text: messageToSend }],
      });
    }

    setInput('');
    setIsBotTyping(true);

    try {
      const response = await axios.post('http://localhost:6002/api/chatbot', {
        message: messageToSend,
        conversationHistory: currentConversationHistory,
      });

      const botResponseData = response.data.data;

      const botReply: Message = {
        from: 'bot',
        text: botResponseData.response,
        time: formatTime(new Date()),
        suggestedQuestions: botResponseData.suggestedQuestions,
        fileData: botResponseData.fileData,
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

  const handleSuggestedQuestionClick = (question: string) => {
    setInput(question);
    sendMessage(question);
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
              onClick={() => {
                setIsOpen(false);
                setMessages([]);
                setInput('');
                setIsBotTyping(false);
              }}
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
                    <ReactMarkdown rehypePlugins={[rehypeRaw]}>{msg.text}</ReactMarkdown>

                    {msg.fileData && (
                      <button
                        onClick={() => handleDownloadClick(msg.fileData)}
                        className='mt-2 w-full bg-blue-500 hover:bg-blue-600 text-white text-xs py-1 px-2 rounded-md transition-colors'
                      >
                        Download {msg.fileData.type.toUpperCase()} ({msg.fileData.filename})
                      </button>
                    )}
                  </div>
                </div>

                {msg.from === 'bot' &&
                  msg.suggestedQuestions &&
                  msg.suggestedQuestions.length > 0 && (
                    <div className='flex flex-wrap gap-2 mt-2 px-2 py-1'>
                      {msg.suggestedQuestions.map((question, qIdx) => (
                        <button
                          key={qIdx}
                          onClick={() => handleSuggestedQuestionClick(question)}
                          className='px-3 py-1 bg-gray-200 text-gray-700 text-xs rounded-full hover:bg-gray-300 transition-colors cursor-pointer'
                        >
                          {question}
                        </button>
                      ))}
                    </div>
                  )}
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
