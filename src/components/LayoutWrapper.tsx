import React from 'react';

interface LayoutWrapperProps {
  children: React.ReactNode;
}

const LayoutWrapper: React.FC<LayoutWrapperProps> = ({ children }) => {
  return (
    <div
      className='min-h-screen lg:ml-56 transition-all duration-300 ease-in-out'
      style={{
        marginTop: '14px',
        paddingTop: '28px', // Add some padding from the header
      }}
    >
      <div>{children}</div>
    </div>
  );
};

export default LayoutWrapper;
