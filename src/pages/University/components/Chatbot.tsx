import axios from 'axios';
import { X, MessageCircle } from 'lucide-react';
import React, { useState, useEffect, useRef } from 'react';

// Define the frontend Message type
type Message = {
  from: 'user' | 'bot';
  text: string;
  time: string;
  // Add a property to store potential suggested questions for the bot's turn
  suggestedQuestions?: string[];
  // Add properties for file data
  fileData?: {
    type: 'excel' | 'pdf';
    base64: string;
    filename: string;
  };
};

// Define the backend's ChatMessageDto structure for conversation history
type BackendChatMessageDto = {
  role: 'user' | 'model'; // 'model' is used by backend, not 'bot' for Gemini's API
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
  const messagesEndRef = useRef<HTMLDivElement>(null); // Ref for auto-scrolling

  // Scroll to the latest message whenever messages state changes
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Initial greeting when chatbot opens
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      // Trigger initial greeting from the backend
      sendMessage('', true); // Send an empty message to trigger the initial greeting
    }
  }, [isOpen]); // Only run when isOpen changes

  // New function to handle the download when the user clicks a button
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

    // Decode base64 string to a binary string
    const byteCharacters = atob(base64);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);

    // Create a Blob from the Uint8Array
    const blob = new Blob([byteArray], { type: mimeType });

    // Create a temporary URL for the Blob
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);

    // Set the download attribute with the desired filename
    link.download = filename;

    // Programmatically click the link to trigger the download
    document.body.appendChild(link); // Append to body is good practice for programmatic clicks
    link.click();

    // Clean up: remove the link and revoke the object URL to free up memory
    document.body.removeChild(link);
    window.URL.revokeObjectURL(link.href);

    console.log('Download initiated for:', filename);
  };

  const sendMessage = async (messageToSend = input, isInitialGreeting = false) => {
    if (!messageToSend.trim() && !isInitialGreeting) return;

    const currentTime = formatTime(new Date());

    // Update messages state immediately for user's message (unless it's the initial empty send)
    // Only add user message if it's not the initial empty trigger
    if (!isInitialGreeting) {
      const newUserMessage: Message = { from: 'user', text: messageToSend, time: currentTime };
      setMessages((prev) => [...prev, newUserMessage]);
    }

    // --- START OF HISTORY PREPARATION ---
    // Create history for backend from current frontend messages.
    // IMPORTANT: When building `conversationHistoryForBackend`, you need to use the `messages`
    // state's *current value*. However, `setMessages` is asynchronous.
    // For the current request, `messages` might not yet include `newUserMessage` if
    // `setMessages` hasn't completed its update.
    // The most robust way is to build the history for the backend from the `prev` state
    // *or* explicitly include the `newUserMessage` if it's not an initial greeting.

    // Let's create a temporary array that represents the full history *for this API call*
    const currentConversationHistory: BackendChatMessageDto[] = messages.map((msg) => ({
      role: msg.from === 'user' ? 'user' : 'model',
      parts: [{ text: msg.text }],
    }));

    // If it's a new user message (not an initial greeting), add it to the history for *this* backend request
    if (!isInitialGreeting) {
      currentConversationHistory.push({
        role: 'user',
        parts: [{ text: messageToSend }],
      });
    }
    // --- END OF HISTORY PREPARATION ---

    try {
      const response = await axios.post('http://localhost:6002/api/chatbot', {
        message: messageToSend, // The current message
        conversationHistory: currentConversationHistory, // Send the compiled history
      });

      const botResponseData = response.data.data; // Access the 'data' property

      const botReply: Message = {
        from: 'bot',
        text: botResponseData.response,
        time: formatTime(new Date()),
        suggestedQuestions: botResponseData.suggestedQuestions,
        fileData: botResponseData.fileData, // Capture fileData if present
      };

      // Use a functional update to ensure you're working with the latest state
      setMessages((prev) => [...prev, botReply]);
      setInput(''); // Clear input after sending

      // The automatic download logic has been moved to handleDownloadClick
      // and will now be triggered by a user click on the rendered button/link.
    } catch (error) {
      console.error('Chatbot API error:', error);
      const errorReply: Message = {
        from: 'bot',
        text: 'Something went wrong. Please try again.',
        time: formatTime(new Date()),
      };
      setMessages((prev) => [...prev, errorReply]);
    }
  };

  const handleSuggestedQuestionClick = (question: string) => {
    setInput(question); // Set the input field to the suggested question
    sendMessage(question); // Automatically send the suggested question
  };

  return (
    <div className='fixed bottom-6 right-6 z-50 font-sans'>
      {isOpen ? (
        <div className='w-80 h-[480px] rounded-xl shadow-xl border border-gray-200 bg-white flex flex-col overflow-hidden'>
          {/* Header with fixed logo size */}
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
                setMessages([]); // Clear messages when closing to reset conversation
                setInput('');
              }}
              className='hover:text-gray-200 transition-colors'
            >
              <X size={20} />
            </button>
          </div>

          {/* Chat Body */}
          <div className='flex-1 overflow-y-auto p-3 space-y-4 bg-gray-50'>
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
                    }`}
                  >
                    {msg.text}
                    {/* Render download button if fileData exists */}
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
                {/* Display suggested questions only after a bot's message */}
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
            <div ref={messagesEndRef} /> {/* For auto-scrolling */}
          </div>

          {/* Input Area */}
          <div className='p-3 border-t border-gray-200 flex gap-2 items-center bg-white'>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder='Type a message...'
              onKeyDown={(e) => {
                if (e.key === 'Enter') sendMessage();
              }}
              className='flex-1 px-4 py-2 text-sm border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-orange-300'
            />
            <button
              onClick={() => sendMessage()} // Call with no arguments to use current input
              className='bg-orange-500 hover:bg-orange-600 text-white rounded-full p-2 transition-colors'
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
