import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'light' | 'dark';
  className?: string;
}

const Logo: React.FC<LogoProps> = ({ size = 'md', variant = 'dark', className = '' }) => {
  const sizeClasses = {
    sm: 'h-6',
    md: 'h-8',
    lg: 'h-12'
  };

  const textColor = variant === 'light' ? 'text-white' : 'text-primary';

  return (
    <div className={`flex items-center ${className}`}>
      <span className={`font-bold text-2xl ${textColor} ${sizeClasses[size]}`}>
        UniScout
      </span>
    </div>
  );
};

export default Logo; 