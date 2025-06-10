import { CheckCircle, XCircle } from 'lucide-react';
import React from 'react';

interface SuccessNotificationProps {
  show: boolean;
  message: string;
  type: 'success' | 'error';
}

const SuccessNotification: React.FC<SuccessNotificationProps> = ({ show, message, type }) => {
  if (!show) return null;

  const isSuccess = type === 'success';

  return (
    <div
      className={`py-3 px-6 rounded-md flex items-center justify-end mb-6 transition-all duration-300 ease-in-out animate-fadeIn ${
        isSuccess ? 'bg-green-100' : 'bg-red-100'
      }`}
    >
      {isSuccess ? (
        <CheckCircle className='text-green-500 mr-2' size={24} />
      ) : (
        <XCircle className='text-red-500 mr-2' size={24} />
      )}
      <span className={`font-semibold ${isSuccess ? 'text-green-800' : 'text-red-800'}`}>
        {message}
      </span>
    </div>
  );
};

export default SuccessNotification;
