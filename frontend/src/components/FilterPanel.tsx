import React, { useState } from 'react';
import LocationSelector from './LocationSelector';
import type { FilterPanelProps, FilterState } from '../types';
import './FilterPanel.css';

const FilterPanel: React.FC<FilterPanelProps> = ({ onFilterChange, filters }) => {
  const [localFilters, setLocalFilters] = useState<FilterState>({
    shippingType: filters.shippingType || '',
    containerType: filters.containerType || '',
    origin: filters.origin || '',
    destination: filters.destination || ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>): void => {
    const { name, value } = e.target;
    const newFilters = {
      ...localFilters,
      [name]: value
    };
    setLocalFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleClear = (): void => {
    const clearedFilters: FilterState = {
      shippingType: '',
      containerType: '',
      origin: '',
      destination: ''
    };
    setLocalFilters(clearedFilters);
    onFilterChange(clearedFilters);
  };

  return (
    <div className="card">
      <h3>Search & Filter</h3>
      <div className="filters">
        <div className="form-group">
          <label htmlFor="filter-origin">Origin</label>
          <LocationSelector
            value={localFilters.origin}
            onChange={(value) => {
              const newFilters = { ...localFilters, origin: value };
              setLocalFilters(newFilters);
              onFilterChange(newFilters);
            }}
            placeholder="Search by origin..."
            locationType={null}
          />
        </div>

        <div className="form-group">
          <label htmlFor="filter-destination">Destination</label>
          <LocationSelector
            value={localFilters.destination}
            onChange={(value) => {
              const newFilters = { ...localFilters, destination: value };
              setLocalFilters(newFilters);
              onFilterChange(newFilters);
            }}
            placeholder="Search by destination..."
            locationType={null}
          />
        </div>

        <div className="form-group">
          <label htmlFor="filter-shipping-type">Shipping Type</label>
          <select
            id="filter-shipping-type"
            name="shippingType"
            value={localFilters.shippingType}
            onChange={handleChange}
          >
            <option value="">All Types</option>
            <option value="AIR">Air</option>
            <option value="WATER">Water</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="filter-container-type">Container Type</label>
          <select
            id="filter-container-type"
            name="containerType"
            value={localFilters.containerType}
            onChange={handleChange}
            disabled={localFilters.shippingType !== 'WATER'}
          >
            <option value="">All Containers</option>
            <option value="FCL">FCL (Full Container Load)</option>
            <option value="LCL">LCL (Less than Container Load)</option>
          </select>
        </div>
      </div>
      
      <div className="filter-actions">
        <button
          type="button"
          className="btn btn-secondary"
          onClick={handleClear}
        >
          Clear Filters
        </button>
      </div>
    </div>
  );
};

export default FilterPanel;
