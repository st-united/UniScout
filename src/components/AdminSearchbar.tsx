import { SearchOutlined, CloseCircleFilled } from '@ant-design/icons';
import { Input, Button } from 'antd';
import React, { useState } from 'react';

interface SearchBarProps {
  onSearch?: (searchValue: string) => void;
  placeholder?: string;
  className?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({
  onSearch,
  placeholder = 'Search',
  className = '',
}) => {
  const [searchValue, setSearchValue] = useState('');

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(e.target.value);
  };

  const handleClear = () => {
    setSearchValue('');
    onSearch?.('');
  };

  const handleSearchClick = () => {
    onSearch?.(searchValue);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      onSearch?.(searchValue);
    }
  };

  return (
    <div className={`w-full ${className}`}>
      <div style={{ display: 'flex', height: 40 }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Input
            placeholder={placeholder}
            value={searchValue}
            onChange={handleSearchChange}
            onKeyDown={handleKeyPress}
            bordered={false}
            style={{
              width: '100%',
              fontSize: '14px',
              padding: '0 32px 0 12px', // space for clear icon
              border: '1px solid #d9d9d9',
              borderRight: 'none',
              borderRadius: '8px 0 0 8px',
              height: '100%',
              lineHeight: 'normal',
            }}
            className='bg-white'
          />
          {searchValue && (
            <CloseCircleFilled
              onClick={handleClear}
              style={{
                position: 'absolute',
                right: 8,
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#999',
                cursor: 'pointer',
                fontSize: 12,
              }}
            />
          )}
        </div>
        <Button
          type='primary'
          onClick={handleSearchClick}
          style={{
            backgroundColor: '#ff7a00',
            border: '1px solid #d9d9d9',
            borderRadius: '0 8px 8px 0',
            width: 46,
            height: '100%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            padding: 0,
          }}
          icon={<SearchOutlined style={{ fontSize: '16px' }} />}
        />
      </div>
    </div>
  );
};

export default SearchBar;
