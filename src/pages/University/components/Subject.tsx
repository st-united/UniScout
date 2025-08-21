import { SearchOutlined } from '@ant-design/icons';
import { Input, Checkbox, Empty, Spin } from 'antd';
import axios from 'axios';
import VirtualList from 'rc-virtual-list';
import React, { useEffect, useMemo, useState } from 'react';

type SubjectItem = { id: string | number; name: string; fold: string };

export interface SubjectsFieldProps {
  value: string[];
  onChange: (next: string[]) => void;
  endpoint?: string;
  className?: string;
  listHeight?: number;
  maxRendered?: number;
}

const DEFAULT_ENDPOINT = '/universities/subjects';
const DEFAULT_LIST_HEIGHT = 256;
const DEFAULT_MAX_RENDERED = 2000;

const fold = (s: string) =>
  s
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();

const highlightAll = (text: string, q: string): React.ReactNode => {
  if (!q) return text;
  const tl = text.toLowerCase();
  const ql = q.toLowerCase();
  const out: React.ReactNode[] = [];
  let i = 0;
  let last = 0;

  // Remplace "while (true)" par une condition explicite (corrige no-constant-condition)
  let idx = tl.indexOf(ql, i);
  while (idx !== -1) {
    if (idx > last) out.push(text.slice(last, idx));
    out.push(
      <span key={idx} className='text-orange-500 font-semibold'>
        {text.slice(idx, idx + q.length)}
      </span>,
    );
    i = idx + q.length;
    last = i;
    idx = tl.indexOf(ql, i);
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
};

const SubjectsField: React.FC<SubjectsFieldProps> = ({
  value,
  onChange,
  endpoint = DEFAULT_ENDPOINT,
  className,
  listHeight = DEFAULT_LIST_HEIGHT,
  maxRendered = DEFAULT_MAX_RENDERED,
}) => {
  const [query, setQuery] = useState('');
  const [items, setItems] = useState<SubjectItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const { data } = await axios.get(endpoint, { params: undefined });
        const raw = Array.isArray(data?.data)
          ? data.data
          : Array.isArray(data?.items)
          ? data.items
          : Array.isArray(data?.subjects)
          ? data.subjects
          : Array.isArray(data)
          ? data
          : [];

        const list: SubjectItem[] = raw
          .map((s: any) => {
            const name = String(s?.name ?? s);
            return { id: s?.id ?? name, name, fold: fold(name) };
          })
          .sort((a: SubjectItem, b: SubjectItem) => a.name.localeCompare(b.name));

        if (!mounted) return;
        setItems(list);
      } catch {
        if (!mounted) return;
        setError('Unable to load subjects');
        setItems([]);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [endpoint]);

  const toggle = (name: string) =>
    onChange(value.includes(name) ? value.filter((v) => v !== name) : [...value, name]);

  const showList = query.trim().length > 0;

  const view = useMemo(() => {
    if (!showList) return [] as SubjectItem[];
    const qf = fold(query);
    const matches: SubjectItem[] = [];
    const others: SubjectItem[] = [];
    for (let i = 0; i < items.length; i++) {
      const it = items[i];
      (it.fold.includes(qf) ? matches : others).push(it);
      if (matches.length + others.length >= maxRendered) break;
    }
    return matches.concat(others).slice(0, maxRendered);
  }, [items, query, showList, maxRendered]);

  return (
    <div
      className={`p-4 shadow-sm border border-solid border-[#E2E8F0] rounded-lg ${className ?? ''}`}
    >
      <h3 className='text-sm font-semibold mb-3'>Subjects</h3>

      <Input
        allowClear
        className='!h-9 !rounded-md'
        placeholder='Search subjects...'
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        prefix={<SearchOutlined />}
      />

      {showList && (
        <div className='mt-2 rounded-lg border border-gray-200 shadow-sm' aria-busy={loading}>
          {loading ? (
            <div className='py-6 flex justify-center'>
              <Spin />
            </div>
          ) : error ? (
            <div className='py-4 text-center text-sm text-gray-500'>{error}</div>
          ) : view.length === 0 ? (
            <div className='py-4'>
              <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description='No matching subjects' />
            </div>
          ) : (
            // Conteneur listbox pour a11y
            <div role='listbox' aria-multiselectable aria-label='Subjects'>
              <VirtualList data={view} height={listHeight} itemHeight={36} itemKey='id'>
                {(it: SubjectItem) => {
                  const checked = value.includes(it.name);
                  return (
                    <div
                      key={it.id}
                      className='flex items-center gap-2 px-3 py-2 cursor-pointer border-b last:border-b-0 border-gray-100 hover:bg-[#fff7ed]'
                      onClick={() => toggle(it.name)}
                      // Gestion clavier pour Enter/Espace (corrige click-events-have-key-events)
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          toggle(it.name);
                        }
                      }}
                      role='option'
                      aria-selected={checked}
                      // Focusable pour role="option" (corrige interactive-supports-focus)
                      tabIndex={0}
                    >
                      <Checkbox
                        checked={checked}
                        onClick={(e) => e.stopPropagation()}
                        onChange={() => toggle(it.name)}
                      />
                      <span className='text-sm select-none'>{highlightAll(it.name, query)}</span>
                    </div>
                  );
                }}
              </VirtualList>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SubjectsField;
