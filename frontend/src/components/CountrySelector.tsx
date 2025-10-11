import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import type { SingleValue, StylesConfig } from 'react-select';
import './CountrySelector.css';

interface Country {
  code: string;
  name: string;
}

interface CountryOption {
  value: string;
  label: string;
  data: Country;
}

interface CountrySelectorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  error?: string | null;
}

const CountrySelector: React.FC<CountrySelectorProps> = ({
  value,
  onChange,
  placeholder = "Search and select country...",
  error = null
}) => {
  const [selectedOption, setSelectedOption] = useState<CountryOption | null>(null);

  // Common countries list - you can expand this
  const countries: Country[] = [
    { code: 'USA', name: 'United States' },
    { code: 'GBR', name: 'United Kingdom' },
    { code: 'CAN', name: 'Canada' },
    { code: 'DEU', name: 'Germany' },
    { code: 'FRA', name: 'France' },
    { code: 'ITA', name: 'Italy' },
    { code: 'ESP', name: 'Spain' },
    { code: 'NLD', name: 'Netherlands' },
    { code: 'BEL', name: 'Belgium' },
    { code: 'CHE', name: 'Switzerland' },
    { code: 'AUT', name: 'Austria' },
    { code: 'SWE', name: 'Sweden' },
    { code: 'NOR', name: 'Norway' },
    { code: 'DNK', name: 'Denmark' },
    { code: 'FIN', name: 'Finland' },
    { code: 'JPN', name: 'Japan' },
    { code: 'CHN', name: 'China' },
    { code: 'IND', name: 'India' },
    { code: 'AUS', name: 'Australia' },
    { code: 'BRA', name: 'Brazil' },
    { code: 'MEX', name: 'Mexico' },
    { code: 'RUS', name: 'Russia' },
    { code: 'KOR', name: 'South Korea' },
    { code: 'SGP', name: 'Singapore' },
    { code: 'HKG', name: 'Hong Kong' },
    { code: 'ARE', name: 'United Arab Emirates' },
    { code: 'ZAF', name: 'South Africa' },
    { code: 'TUR', name: 'Turkey' },
    { code: 'EGY', name: 'Egypt' },
    { code: 'SAU', name: 'Saudi Arabia' }
  ];

  // Convert to react-select options
  const options: CountryOption[] = countries.map((country) => ({
    value: country.name,
    label: `${country.name} (${country.code})`,
    data: country
  }));

  useEffect(() => {
    // Set selected option when value changes
    if (value && options.length > 0) {
      const selected = options.find(option => option.value === value);
      setSelectedOption(selected || null);
    } else {
      setSelectedOption(null);
    }
  }, [value]);

  const handleChange = (newValue: SingleValue<CountryOption>): void => {
    setSelectedOption(newValue);
    onChange(newValue ? newValue.value : '');
  };

  const customStyles: StylesConfig<CountryOption> = {
    control: (provided, state) => ({
      ...provided,
      borderColor: error ? '#dc3545' : state.isFocused ? '#007bff' : '#ced4da',
      boxShadow: state.isFocused ? '0 0 0 0.2rem rgba(0, 123, 255, 0.25)' : 'none',
      '&:hover': {
        borderColor: error ? '#dc3545' : '#007bff'
      }
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isSelected ? '#007bff' : state.isFocused ? '#f8f9fa' : 'white',
      color: state.isSelected ? 'white' : '#333',
      padding: '10px 12px'
    }),
    placeholder: (provided) => ({
      ...provided,
      color: '#6c757d'
    }),
    singleValue: (provided) => ({
      ...provided,
      color: '#333'
    })
  };

  return (
    <div>
      <Select<CountryOption>
        value={selectedOption}
        onChange={handleChange}
        options={options}
        isSearchable
        isClearable
        placeholder={placeholder}
        styles={customStyles}
        noOptionsMessage={({ inputValue }) => 
          inputValue ? `No countries found for "${inputValue}"` : 'No countries available'
        }
      />
      {error && <div className="error-message">{error}</div>}
    </div>
  );
};

export default CountrySelector;
