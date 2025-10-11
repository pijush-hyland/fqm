import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import type { SingleValue, StylesConfig } from 'react-select';
import { containerTypeService } from '../services/api';
import type { ContainerType, ContainerTypeSelectorProps } from '../types';
import './ContainerTypeSelector.css';

interface ContainerTypeOption {
  value: string;
  label: string;
  data: ContainerType;
}

interface ContainerTypeSelectorExtendedProps extends ContainerTypeSelectorProps {
  weightKG?: number | null;
  volumeCBM?: number | null;
  showSuitableOnly?: boolean;
}

const ContainerTypeSelector: React.FC<ContainerTypeSelectorExtendedProps> = ({
  value,
  onChange,
  placeholder = "Search and select container type...",
  weightKG = null,
  volumeCBM = null,
  error = null,
  showSuitableOnly = false 
}) => {
  const [options, setOptions] = useState<ContainerTypeOption[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedOption, setSelectedOption] = useState<ContainerTypeOption | null>(null);

  useEffect(() => {
    loadContainerTypes();
  }, [showSuitableOnly, weightKG, volumeCBM]);

  useEffect(() => {
    // Set selected option when value changes
    if (value && options.length > 0) {
      const selected = options.find(option => option.value === value);
      setSelectedOption(selected || null);
    } else {
      setSelectedOption(null);
    }
  }, [value, options]);

  const loadContainerTypes = async (): Promise<void> => {
    setLoading(true);
    try {
      const response = await containerTypeService.getAllContainerTypes();
      let containers = response.data;
      
      // Filter by suitability if requested
      if (showSuitableOnly && (weightKG || volumeCBM)) {
        containers = containers.filter((container: ContainerType) => 
          isSuitable(container, weightKG, volumeCBM)
        );
      }
      
      // Convert to react-select options
      const containerOptions: ContainerTypeOption[] = containers.map((container: ContainerType) => {
        const suitabilityScore = getSuitabilityScore(container);
        const scoreIndicator = suitabilityScore ? ` [${suitabilityScore}]` : '';
        
        return {
          value: container.id?.toString() || '',
          label: `${container.code} - ${container.name}${scoreIndicator}`,
          data: container
        };
      });
      
      setOptions(containerOptions);
    } catch (err) {
      console.error('Error loading container types:', err);
      setOptions([]);
    } finally {
      setLoading(false);
    }
  };

  const isSuitable = (container: ContainerType, weight: number | null, volume: number | null): boolean => {
    if (weight && weight > container.maxPayloadKG) return false;
    if (volume && volume > container.volumeCBM) return false;
    return true;
  };

  const getSuitabilityScore = (container: ContainerType): string => {
    if (!weightKG && !volumeCBM) return '';
    
    let score = 0;
    let reasons: string[] = [];
    
    if (weightKG) {
      if (weightKG <= container.maxPayloadKG) {
        const utilization = (weightKG / container.maxPayloadKG) * 100;
        if (utilization >= 80) {
          score += 3;
          reasons.push('Excellent weight utilization');
        } else if (utilization >= 60) {
          score += 2;
          reasons.push('Good weight utilization');
        } else {
          score += 1;
          reasons.push('Low weight utilization');
        }
      } else {
        return 'OVERWEIGHT';
      }
    }
    
    if (volumeCBM) {
      if (volumeCBM <= container.volumeCBM) {
        const utilization = (volumeCBM / container.volumeCBM) * 100;
        if (utilization >= 80) {
          score += 3;
          reasons.push('Excellent volume utilization');
        } else if (utilization >= 60) {
          score += 2;
          reasons.push('Good volume utilization');
        } else {
          score += 1;
          reasons.push('Low volume utilization');
        }
      } else {
        return 'OVERSIZED';
      }
    }
    
    if (score >= 5) return 'EXCELLENT';
    if (score >= 3) return 'GOOD';
    if (score >= 1) return 'SUITABLE';
    return 'POOR';
  };

  const handleChange = (newValue: SingleValue<ContainerTypeOption>): void => {
    setSelectedOption(newValue);
    onChange(newValue ? newValue.value : '');
  };

  const getSuitabilityBadgeClass = (score: string): string => {
    switch (score) {
      case 'EXCELLENT': return 'suitability-excellent';
      case 'GOOD': return 'suitability-good';
      case 'SUITABLE': return 'suitability-suitable';
      case 'POOR': return 'suitability-poor';
      case 'OVERWEIGHT': return 'suitability-overweight';
      case 'OVERSIZED': return 'suitability-oversized';
      default: return '';
    }
  };

  const formatNumber = (num: number): string => {
    return new Intl.NumberFormat().format(num);
  };

  const customStyles: StylesConfig<ContainerTypeOption> = {
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
      padding: '12px'
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

  const formatOptionLabel = (option: ContainerTypeOption) => {
    const container = option.data;
    const suitabilityScore = getSuitabilityScore(container);
    
    return (
      <div className="container-option">
        <div>
          <div className="container-info">
            {container.code} - {container.name}
          </div>
          <div className="container-details">
            {container.lengthMeters} × {container.widthMeters} × {container.heightMeters} m
            • {formatNumber(container.maxPayloadKG)} kg
            • {container.volumeCBM} CBM
            {container.isRefrigerated && ' • ❄️ Refrigerated'}
          </div>
        </div>
        {suitabilityScore && (
          <span 
            className={`suitability-badge ${getSuitabilityBadgeClass(suitabilityScore)}`}
            style={{ 
              backgroundColor: getSuitabilityBadgeColor(suitabilityScore)
            }}
          >
            {suitabilityScore}
          </span>
        )}
      </div>
    );
  };

  const getSuitabilityBadgeColor = (score: string): string => {
    switch (score) {
      case 'EXCELLENT': return '#28a745';
      case 'GOOD': return '#17a2b8';
      case 'SUITABLE': return '#ffc107';
      case 'POOR': return '#6c757d';
      case 'OVERWEIGHT': return '#dc3545';
      case 'OVERSIZED': return '#dc3545';
      default: return '#6c757d';
    }
  };

  return (
    <div>
      <Select<ContainerTypeOption>
        value={selectedOption}
        onChange={handleChange}
        options={options}
        isLoading={loading}
        isSearchable
        isClearable
        placeholder={placeholder}
        styles={customStyles}
        formatOptionLabel={formatOptionLabel}
        noOptionsMessage={({ inputValue }) => 
          inputValue ? `No container types found for "${inputValue}"` : 'No container types available'
        }
        loadingMessage={() => 'Loading container types...'}
      />
      {error && <div className="error-message">{error}</div>}
    </div>
  );
};

export default ContainerTypeSelector;
