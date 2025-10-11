import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import type { SingleValue, StylesConfig } from 'react-select';
import { locationService } from '../services/api';
import type { Location, LocationSelectorProps, LocationType } from '../types';
import './LocationSelector.css';

interface LocationOption {
    value: string;
    label: string;
    data: Location;
}

const LocationSelector: React.FC<LocationSelectorProps> = ({
    value,
    onChange,
    placeholder = "Search and select location...",
    locationType = null,
    error = null
}) => {
    const [options, setOptions] = useState<LocationOption[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [selectedOption, setSelectedOption] = useState<LocationOption | null>(null);

    useEffect(() => {
        loadLocations();
    }, [locationType]);

    useEffect(() => {
        // Set selected option when value changes
        if (value && options.length > 0) {
            const selected = options.find(option => option.value === value);
            setSelectedOption(selected || null);
        } else {
            setSelectedOption(null);
        }
    }, [value, options]);

    const loadLocations = async (): Promise<void> => {
        setLoading(true);
        try {
            const response = await locationService.getAllLocations();
            let locations = response.data;
            
            // Filter by location type if specified
            if (locationType) {
                locations = locations.filter((loc: Location) => loc.locationType === locationType);
            }
            
            // Convert to react-select options
            const locationOptions: LocationOption[] = locations.map((location: Location) => ({
                value: location.id?.toString() || '',
                label: `${getLocationIcon(location.locationType)} ${location.name} (${location.locationCode}) - ${location.country}`,
                data: location
            }));
            
            setOptions(locationOptions);
        } catch (err) {
            console.error('Error loading locations:', err);
            setOptions([]);
        } finally {
            setLoading(false);
        }
    };

    const getLocationIcon = (type: LocationType): string => {
        const icons: Record<LocationType, string> = {
            'SEA_PORT': '⚓',
            'AIRPORT': '✈️',
            'CITY': '🏙️',
            'INLAND_PORT': '🚛'
        };
        return icons[type] || '📍';
    };

    const handleChange = (
        newValue: SingleValue<LocationOption>
    ): void => {
        setSelectedOption(newValue);
        onChange(newValue ? newValue.value : '');
    };

    const customStyles: StylesConfig<LocationOption> = {
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
            <Select<LocationOption>
                value={selectedOption}
                onChange={handleChange}
                options={options}
                isLoading={loading}
                isSearchable
                isClearable
                placeholder={placeholder}
                styles={customStyles}
                noOptionsMessage={({ inputValue }) => 
                    inputValue ? `No locations found for "${inputValue}"` : 'No locations available'
                }
                loadingMessage={() => 'Loading locations...'}
            />
            {error && <div className="error-message">{error}</div>}
        </div>
    );
};

export default LocationSelector;
