import { SearchOutlined } from '@ant-design/icons';
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
    const value = e.target.value;
    setSearchValue(value);
    onSearch?.(value);
  };

  const handleSearchClick = () => {
    onSearch?.(searchValue);
  };

  return (
    <div className={`w-[600px] ${className}`}>
      <div style={{ display: 'flex', height: 40 }}>
        <Input
          placeholder={placeholder}
          value={searchValue}
          onChange={handleSearchChange}
          bordered={false}
          style={{
            flex: 1,
            fontSize: '14px',
            padding: '0 12px',
            border: '1px solid #d9d9d9',
            borderRight: 'none',
            borderRadius: '8px 0 0 8px',
            height: '100%',
            lineHeight: 'normal',
          }}
          className='bg-white'
        />
        <Button
          type='primary'
          onClick={handleSearchClick}
          style={{
            backgroundColor: '#ff7a00',
            border: '1px solid #d9d9d9',
            borderRadius: '0 8px 8px 0',
            width: 32,
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
