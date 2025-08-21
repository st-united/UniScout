import { DownOutlined } from '@ant-design/icons';
import { ConfigProvider, Button, Select, Checkbox } from 'antd';
import axios from 'axios';
import { MapPinned, Filter as FilterIcon } from 'lucide-react';
import React, { useCallback, useEffect, useMemo, useState, memo } from 'react';

import CountryMultiSelect from './CountryMultiSelect';
import { MultiCheckSection } from './MultiCheckSection';
import SubjectsField from './Subject';
import type { SelectProps } from 'antd';

/* Types */
export interface FilterOptions {
  search: string;
  country: string[];
  type: string[];
  size: string[];
  field: string[];
  sortOrder: 'asc' | 'desc';
}

interface UniversityFilterProps {
  onFiltersUpdate: (filters: FilterOptions) => void;
  initialFilters: FilterOptions;
  availableCountries?: string[];
  availableFields?: string[];
}

type Option = { label: string; value: string };

/* Helpers */
const normalizeText = (s: string) =>
  s
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();

const asOptions = (arr: string[]): Option[] => arr.map((v) => ({ label: v, value: v }));

const safeList = (x: any): string[] =>
  Array.isArray(x?.data) ? x.data : Array.isArray(x?.items) ? x.items : Array.isArray(x) ? x : [];

const capitalizeFirst = (s: string) =>
  s ? s.trim().charAt(0).toUpperCase() + s.trim().slice(1).toLowerCase() : s;

const SIZE_FALLBACK: Option[] = [
  { label: 'Small', value: 'small' },
  { label: 'Medium', value: 'medium' },
  { label: 'Large', value: 'large' },
  { label: 'Extra Large', value: 'extra large' },
];

/* Main */
const UniversityFilter: React.FC<UniversityFilterProps> = ({
  onFiltersUpdate,
  initialFilters,
  availableCountries,
}) => {
  const filters = initialFilters;
  const [mobileOpen, setMobileOpen] = useState(false);

  /* Countries */
  const [countries, setCountries] = useState<string[]>(availableCountries ?? []);
  useEffect(() => {
    let mounted = true;
    if (availableCountries?.length) return;
    (async () => {
      try {
        const { data } = await axios.get('/universities/countries');
        const list = safeList(data)
          .map(String)
          .sort((a, b) => a.localeCompare(b));
        if (mounted) setCountries(list);
      } catch {
        if (mounted) setCountries([]);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [availableCountries]);

  /* Types */
  const [typeOptions, setTypeOptions] = useState<Option[]>([]);
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const { data } = await axios.get('/universities/types');
        const list = safeList(data).map(String);
        const normalized = Array.from(new Set(list.map((t) => String(t).trim().toLowerCase())));
        const opts: Option[] = normalized.map((t) => ({ label: capitalizeFirst(t), value: t }));

        if (mounted) setTypeOptions(opts);
      } catch {
        if (mounted)
          setTypeOptions([
            { label: 'Public', value: 'public' },
            { label: 'Private', value: 'private' },
            { label: 'Academic', value: 'academic' },
            { label: 'College', value: 'college' },
            { label: 'International', value: 'international' },
          ]);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const update = useCallback(
    (key: keyof FilterOptions, value: string | string[]) => {
      onFiltersUpdate({ ...filters, [key]: value as any });
    },
    [onFiltersUpdate, filters],
  );

  const reset = useCallback(() => {
    onFiltersUpdate({
      ...filters,
      country: [],
      type: [],
      size: [],
      field: [],
      sortOrder: 'asc',
      search: '',
    });
  }, [onFiltersUpdate, filters]);

  const FilterCard = (
    <div className='w-full lg:w-[320px] rounded-xl bg-white p-4 shadow-sm'>
      <div className='mb-3 flex items-center justify-between'>
        <span className='font-medium text-orange-500'>Filter</span>
        <Button type='link' className='!pr-0 !font-medium !text-orange-500' onClick={reset}>
          Reset Filter
        </Button>
      </div>

      <div className='mb-3 rounded-lg border border-solid border-[#E2E8F0] p-4'>
        <div style={{ fontWeight: 600, marginBottom: 12 }}>Country</div>
        <CountryMultiSelect
          value={filters.country}
          options={countries}
          onChange={(v) => update('country', v)}
        />
      </div>

      <MultiCheckSection
        title='University Type'
        options={typeOptions}
        value={filters.type}
        onChange={(v) => update('type', v)}
        columns={2}
      />
      <div className='h-3' />
      <MultiCheckSection
        title='Size'
        options={SIZE_FALLBACK}
        value={filters.size}
        onChange={(v) => update('size', v)}
        columns={2}
      />
      <div className='h-3' />

      <SubjectsField value={filters.field} onChange={(next) => update('field', next)} />
    </div>
  );

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#FF7012',
          colorPrimaryHover: '#FF8A3D',
          borderRadius: 10,
          colorBorder: '#E2E8F0',
          colorText: '#0F172A',
        },
        components: {
          Select: { optionSelectedBg: '#fff7ed' },
          Input: { activeBorderColor: '#FF7012', hoverBorderColor: '#FF7012' },
        },
      }}
    >
      <aside className='w-full lg:w-80 lg:sticky lg:top-20 self-start'>
        <div className='mb-3 flex lg:hidden'>
          <Button
            onClick={() => setMobileOpen((v) => !v)}
            icon={<FilterIcon className='w-4 h-4' />}
            className='!border-[#E2E8F0] !text-[#FF7012] !bg-white'
          >
            {mobileOpen ? 'Hide filters' : 'Show filters'}
          </Button>
        </div>

        <div className={`lg:block ${mobileOpen ? 'block' : 'hidden'}`}>{FilterCard}</div>
      </aside>
    </ConfigProvider>
  );
};

export default UniversityFilter;
