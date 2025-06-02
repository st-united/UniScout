import React from 'react';
import { useTranslation } from 'react-i18next';
import { Filter } from 'lucide-react';

interface FilterOptions {
  region?: string;
  fields?: string[];
  rating?: number;
  ranking?: number;
}

interface FilterPanelProps {
  regions?: string[];
  selectedRegion?: string;
  onRegionChange?: (region: string) => void;
  onApplyFilters: (filters: FilterOptions) => void;
}

const FilterPanel: React.FC<FilterPanelProps> = ({
  regions = [],
  selectedRegion = '',
  onRegionChange,
  onApplyFilters
}) => {
  const { t } = useTranslation();
  const [filters, setFilters] = React.useState<FilterOptions>({
    region: selectedRegion
  });

  const handleRegionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newRegion = e.target.value;
    const newFilters = { ...filters, region: newRegion };
    setFilters(newFilters);
    onRegionChange?.(newRegion);
    onApplyFilters(newFilters);
  };

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        {t('UNIVERSITIES.FILTERS')}
      </h3>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('UNIVERSITIES.REGION')}
          </label>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <select
              value={filters.region}
              onChange={handleRegionChange}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary appearance-none"
            >
              <option value="">{t('UNIVERSITIES.ALL_REGIONS')}</option>
              {regions.map(region => (
                <option key={region} value={region}>
                  {region}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FilterPanel;