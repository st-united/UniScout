import { FC } from 'react';

interface FilterPanelProps {
  regions?: string[];
  selectedRegion?: string;
  onRegionChange?: (region: string) => void;
  onApplyFilters: (filters: Record<string, any>) => void;
}

declare const FilterPanel: FC<FilterPanelProps>;
export default FilterPanel; 