import { Checkbox, Tooltip } from 'antd';
import React from 'react';

type Value = string;

export type MultiCheckOption<T extends Value = string> = {
  label: string;
  value: T;
  hint?: React.ReactNode;
  disabled?: boolean;
};

type MultiCheckSectionProps<T extends Value = string> = {
  title: string;
  value: T[];
  onChange: (next: T[]) => void;
  options: ReadonlyArray<MultiCheckOption<T>>;
  columns?: 1 | 2 | 3 | 4;
  className?: string;
  showHints?: boolean;
};

export const MultiCheckSection = <T extends Value = string>({
  title,
  value,
  onChange,
  options,
  columns = 2,
  className = '',
  showHints = true,
}: MultiCheckSectionProps<T>) => {
  const gridCols =
    columns === 4
      ? 'grid-cols-4'
      : columns === 3
      ? 'grid-cols-3'
      : columns === 2
      ? 'grid-cols-2'
      : 'grid-cols-1';
  const isTouch = typeof window !== 'undefined' && matchMedia('(pointer: coarse)').matches;
  return (
    <section
      className={`rounded-lg p-4 shadow-sm border border-solid  border-[#E2E8F0] ${className}`}
    >
      <h3 className='text-sm font-semibold mb-3'>{title}</h3>

      <Checkbox.Group
        value={value as any}
        onChange={(vals) => onChange(vals as T[])}
        className={`grid ${gridCols} gap-3`}
      >
        {options.map((opt) => {
          const node = (
            <Checkbox
              key={String(opt.value)}
              value={opt.value}
              disabled={opt.disabled}
              className='!m-0 '
            >
              <span className='text-sm'>{opt.label}</span>
            </Checkbox>
          );

          return showHints && opt.hint ? (
            <Tooltip
              key={String(opt.value)}
              title={opt.hint}
              placement='top'
              trigger={isTouch ? [] : ['hover']}
              getPopupContainer={(n) => n?.parentElement ?? document.body}
              destroyTooltipOnHide
            >
              {node}
            </Tooltip>
          ) : (
            <React.Fragment key={String(opt.value)}>{node}</React.Fragment>
          );
        })}
      </Checkbox.Group>
    </section>
  );
};
