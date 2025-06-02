import React from 'react';
import { useTranslation } from 'react-i18next';
import { Search } from 'lucide-react';

interface SearchBarProps {
  onChange?: (value: string) => void;
  onSearch: (query: string) => void;
  initialValue?: string;
  placeholder?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({
  onChange,
  onSearch,
  initialValue,
  placeholder
}) => {
  const { t } = useTranslation();
  const [searchValue, setSearchValue] = React.useState(initialValue || '');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setSearchValue(newValue);
    onChange?.(newValue);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchValue);
  };

  return (
    <form onSubmit={handleSubmit} className="relative">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
      <input
        type="text"
        value={searchValue}
        onChange={handleChange}
        placeholder={placeholder || t('UNIVERSITIES.SEARCH_PLACEHOLDER')}
        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
      />
    </form>
  );
};

export default SearchBar;