import { Select, theme } from 'antd';
import { ChevronDown } from 'lucide-react';
import React from 'react';

import type { SelectProps } from 'antd';

type Props = {
  id?: string;
  value?: string;
  options: SelectProps['options'];
  placeholder?: string;
  error?: string;
  onChange: (v: string) => void;
  describedById?: string;
};

export default function CountrySelect({
  id,
  value,
  options,
  placeholder,
  error,
  onChange,
  describedById,
}: Props) {
  const { token } = theme.useToken();
  return (
    <div>
      <Select
        id={id}
        variant='borderless'
        value={value || undefined}
        options={options}
        showSearch
        allowClear
        size='large'
        placeholder={placeholder}
        optionFilterProp='label'
        filterOption={(input, option) =>
          (option?.label as string)?.toLowerCase().includes(input.toLowerCase())
        }
        suffixIcon={<ChevronDown size={16} className='text-[#FF7012]' />}
        className='w-full !px-0 !bg-transparent'
        style={{
          borderBottom: `2px solid ${error ? token.colorError : token.colorPrimary}`,
          borderRadius: 0,
          paddingLeft: 0,
          paddingRight: 0,
          fontFamily: token.fontFamily,
        }}
        dropdownStyle={{ borderRadius: 8, fontFamily: token.fontFamily }}
        onChange={(v) => onChange(v as string)}
        getPopupContainer={(trigger) => trigger.parentElement as HTMLElement}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? describedById : undefined}
      />
      {error && (
        <p id={describedById} className='text-sm mt-1' style={{ color: token.colorError }}>
          {error}
        </p>
      )}
    </div>
  );
}
