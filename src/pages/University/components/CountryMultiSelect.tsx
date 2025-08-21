import { DownOutlined } from '@ant-design/icons';
import { Select, Checkbox } from 'antd';
import { MapPinned } from 'lucide-react';
import React, { memo, useMemo, useState } from 'react';

import type { SelectProps } from 'antd';

export type CountryMultiSelectProps = {
  value: string[];
  onChange: (vals: string[]) => void;
  options: string[];
  placeholder?: string;
  className?: string;
};

type Option = { label: string; value: string };
const normalizeText = (s: string) =>
  s
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();

const asOptions = (arr: string[]): Option[] => arr.map((v) => ({ label: v, value: v }));

const CountryMultiSelect = memo(function CountryMultiSelect({
  value,
  onChange,
  options,
  placeholder = 'All Countries',
  className,
}: CountryMultiSelectProps) {
  const [open, setOpen] = useState(false);
  const selectOptions = useMemo<SelectProps['options']>(() => asOptions(options), [options]);
  const display = value.length ? `${value.length} selected` : placeholder;

  return (
    <div className={['relative w-full', className].filter(Boolean).join(' ')}>
      <MapPinned className='absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 stroke-2 z-10 pointer-events-none' />
      <span className='absolute left-11 top-1/2 -translate-y-1/2 text-sm text-gray-600 z-10 pointer-events-none whitespace-nowrap overflow-hidden text-ellipsis'>
        {display}
      </span>
      {!value.length && (
        <DownOutlined
          className={`pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-900 z-10 transition-transform ${
            open ? 'rotate-180' : ''
          }`}
        />
      )}
      <Select
        mode='multiple'
        value={value}
        onChange={(vals) => onChange((vals as string[]) || [])}
        options={selectOptions}
        allowClear
        showSearch={false}
        suffixIcon={null}
        optionFilterProp='label'
        maxTagCount={0}
        popupMatchSelectWidth
        onOpenChange={setOpen}
        getPopupContainer={(t) => (t?.parentElement as HTMLElement) || document.body}
        virtual
        listHeight={256}
        className='
          w-full
          [&_.ant-select-selector]:!h-11
          [&_.ant-select-selector]:!rounded-lg
          [&_.ant-select-selector]:!border-[#E2E8F0]
          [&_.ant-select-selector]:!pl-9
          [&_.ant-select-selector]:flex
          [&_.ant-select-selector]:items-center
          [&_.ant-select-focused_.ant-select-selector]:!border-[#E2E8F0]
          [&_.ant-select-focused_.ant-select-selector]:!shadow-[0_0_0_2px_rgba(255,102,0,0.1)]
          [&_.ant-select-selector:hover]:!border-[#E2E8F0]
          [&_.ant-select-selector:hover]:!shadow-[0_0_0_2px_rgba(255,102,0,0.1)]
          [&_.ant-select-item-option-state]:hidden
        '
        filterOption={(input, option) =>
          normalizeText(String((option as any)?.label ?? '')).includes(normalizeText(input))
        }
        optionRender={(opt) => (
          <div className='flex items-center gap-2'>
            <Checkbox checked={value.includes(String(opt.value))} className='pointer-events-none' />
            <span>{String(opt.label)}</span>
          </div>
        )}
        tagRender={() => <></>}
      />
    </div>
  );
});

CountryMultiSelect.displayName = 'CountryMultiSelect';

export default CountryMultiSelect;
