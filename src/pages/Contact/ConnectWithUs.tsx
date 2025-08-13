import { ConfigProvider } from 'antd';
import React, { useState, useCallback } from 'react';

import ConnectWithUsForm from './ConnectWithUsForm';
import { ORANGE, PLACEHOLDER, TabKey } from './helpers/connectWithUsHelpers';

const FONT_STACK = 'Arial, "Segoe UI", system-ui, -apple-system, Roboto, Helvetica, sans-serif';

/* Accessible pill toggle with gradient slider */
function TabsToggle({ active, onChange }: { active: TabKey; onChange: (t: TabKey) => void }) {
  const handleKey = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (e.key === 'ArrowRight' || e.key === 'PageDown') onChange('update');
      if (e.key === 'ArrowLeft' || e.key === 'PageUp') onChange('new');
      if (e.key === 'Home') onChange('new');
      if (e.key === 'End') onChange('update');
    },
    [onChange],
  );

  return (
    <div
      role='tablist'
      aria-label='Choose form'
      onKeyDown={handleKey}
      className='relative h-12 rounded-[10px] p-1 select-none'
      style={{ background: '#EFEFEF' }}
      tabIndex={0}
    >
      {/* slider gradient */}
      <span
        aria-hidden
        className='pointer-events-none absolute left-[5px] top-[5px] bottom-[5px] w-[calc(50%-5px)] rounded-[8px] transition-transform duration-300 ease-[cubic-bezier(.2,0,0,1)]'
        style={{
          background: 'linear-gradient(90deg,#FD6B1A 0%, #E85A0C 100%)',
          transform: active === 'update' ? 'translateX(100%)' : 'translateX(0%)',
          boxShadow: '0 2px 6px rgba(0,0,0,.08)',
        }}
      />
      <div className='grid grid-cols-2 h-full'>
        {[
          { key: 'new' as TabKey, label: 'New University' },
          { key: 'update' as TabKey, label: 'Update Information' },
        ].map(({ key, label }) => {
          const selected = key === active;
          return (
            <button
              key={key}
              role='tab'
              aria-selected={selected}
              onClick={() => onChange(key)}
              className='relative bg-transparent border-none text-sm md:text-base font-medium transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FD6B1A] focus-visible:ring-opacity-40'
              style={{ color: selected ? '#FFFFFF' : '#292D32' }}
            >
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function ConnectWithUs() {
  const [activeTab, setActiveTab] = useState<TabKey>('new');

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: ORANGE,
          colorTextPlaceholder: PLACEHOLDER,
          fontFamily: FONT_STACK,
        },
        components: {
          Input: {
            activeShadow: '0 0 0 3px rgba(255,112,18,0.18)',
            fontFamily: FONT_STACK,
            fontSizeLG: 14,
          },
          Select: {
            colorIcon: ORANGE,
            colorIconHover: ORANGE,
            fontFamily: FONT_STACK,
            fontSizeLG: 14,
          },
        },
      }}
    >
      <div className='bg-orange-50 rounded-lg px-6 md:px-12 lg:px-24 py-8 w-full max-w-6xl mx-auto shadow-sm'>
        <h1
          className='mb-2 text-4xl font-bold text-center bg-gradient-to-r from-[#FD6B1A] to-[#E85A0C] bg-clip-text text-transparent'
          style={{ fontFamily: FONT_STACK }}
        >
          Connect with us
        </h1>
        <p
          className='mb-10 leading-relaxed text-center text-[#959595] text-base md:text-lg font-light'
          style={{ fontFamily: '"Segoe UI", sans-serif' }}
        >
          Your Gateway to University Insights and Support!
        </p>

        <div className='w-full mx-auto mb-8'>
          <TabsToggle active={activeTab} onChange={setActiveTab} />
        </div>

        <ConnectWithUsForm activeTab={activeTab} />
      </div>
    </ConfigProvider>
  );
}
