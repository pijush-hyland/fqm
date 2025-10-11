import React, { useState, useEffect } from 'react';
import LocationSelector from './LocationSelector';
import ContainerTypeSelector from './ContainerTypeSelector';
import type { CourierRate, LocationType, SeaFreightMode, ShippingType, Location, ContainerType } from '../types';

interface CourierRateFormData {
  id?: number;
  courierName?: string;
  origin?: number;             // Location code as number for form handling
  destination?: number;        // Location code as number for form handling
  shippingType?: ShippingType;
  seaFreightMode?: SeaFreightMode;
  effectiveFrom?: string;      // LocalDate as ISO string
  effectiveTo?: string;        // LocalDate as ISO string
  isActive?: boolean;         // Default to true
  transitDays?: number;
  weightLimit?: number;       // in KG
  dimensionLimit?: string;    // e.g., "100x100x100 cm"
  description?: string;
  createdAt?: string;         // LocalDate as ISO string
  updatedAt?: string;         // LocalDate as ISO string
  
  // Rate fields (from base Rate class)
  rate?: number;               // BigDecimal as number - required
  currency?: string;           // Default "INR"

  // SeaFreightRate fields (for WATER shipping)
  documentationFee?: number;
  bunkerAdjustmentRate?: number;
  
  // AirFreightRate fields (for AIR shipping)
  minimumCharge?: number;
  fuelSurchargeRate?: number;
  securitySurcharge?: number;
  airWeightLimit?: number;
  airDescription?: string;
  
  // LCLFreightRate fields (for WATER + LCL)
  lclServiceCharge?: number;
  
  // FCLFreightRate fields (for WATER + FCL)
  containerType?: number;      // Container type code as number for form handling
  terminalHandlingCharge?: number;
}

interface FormErrors {
  [key: string]: string;
}

interface CourierRateFormProps {
  onSubmit: (data: CourierRate) => void;
  initialData?: CourierRate | null;
  onCancel?: () => void;
}

const CourierRateForm: React.FC<CourierRateFormProps> = ({ onSubmit, initialData, onCancel }) => {
  const [formData, setFormData] = useState<CourierRateFormData>({
    isActive: true,
    shippingType: 'AIR',
  });

  const [errors, setErrors] = useState<FormErrors>({});

  // Helper function to get primary location type based on shipping type
  const getPrimaryLocationType = (shippingType?: string): LocationType | null => {
    if (!shippingType) return null;
    switch (shippingType) {
      case 'AIR':
        return 'AIRPORT';
      case 'WATER':
        return 'SEA_PORT';
      default:
        return null; // All types
    }
  };

  useEffect(() => {
    if (initialData) {
      setFormData({
        id: initialData.id,
        courierName: initialData.courierName,
        origin: initialData.origin.id,
        destination: initialData.destination.id,
        shippingType: initialData.shippingType,
        seaFreightMode: initialData.seaFreightMode,
        effectiveFrom: initialData.effectiveFrom,
        effectiveTo: initialData.effectiveTo,
        isActive: initialData.isActive,
        transitDays: initialData.transitDays,
        weightLimit: initialData.weightLimit,
        dimensionLimit: initialData.dimensionLimit,
        description: initialData.description,
        createdAt: initialData.createdAt,
        updatedAt: initialData.updatedAt,
        rate: initialData.rate,
        currency: initialData.currency,
        documentationFee: initialData.documentationFee,
        bunkerAdjustmentRate: initialData.bunkerAdjustmentRate,
        minimumCharge: initialData.minimumCharge,
        fuelSurchargeRate: initialData.fuelSurchargeRate,
        securitySurcharge: initialData.securitySurcharge,
        airWeightLimit: initialData.airWeightLimit,
        airDescription: initialData.airDescription,
        lclServiceCharge: initialData.lclServiceCharge,
        containerType: initialData.containerType?.id,
        terminalHandlingCharge: initialData.terminalHandlingCharge
      });
    }
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>): void => {
    const { name, value } = e.target;
    
    // Convert string values to appropriate types
    let processedValue: any = value;
    
    // Handle number fields
    if (e.target.type === 'number' && value !== '') {
      processedValue = parseFloat(value);
    }
    
    // update formdata such way that specific fields are there only rest got deleted
    const newFormData = { ...formData };
    if(name === "shippingType" && processedValue === "AIR") {
      // Keep only AIR-specific fields, clear WATER-specific fields
      delete newFormData.seaFreightMode;
      delete newFormData.documentationFee;
      delete newFormData.bunkerAdjustmentRate;
      delete newFormData.lclServiceCharge;
      delete newFormData.containerType;
      delete newFormData.terminalHandlingCharge;
    } else if(name === "shippingType" && processedValue === "WATER") {
      // Keep only WATER-specific fields, clear AIR-specific fields
      delete newFormData.minimumCharge;
      delete newFormData.fuelSurchargeRate;
      delete newFormData.securitySurcharge;
      delete newFormData.airWeightLimit;
      delete newFormData.airDescription;
    } else if(name === "seaFreightMode" && processedValue === "FCL") {
      // Keep FCL fields, clear LCL fields
      delete newFormData.lclServiceCharge;
    } else if(name === "seaFreightMode" && processedValue === "LCL") {
      // Keep LCL fields, clear FCL fields
      delete newFormData.containerType;
      delete newFormData.terminalHandlingCharge;
    }

    // Update the field that changed
    newFormData[name as keyof CourierRateFormData] = processedValue;
    
    setFormData(newFormData);
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleLocationChange = (fieldName: 'origin' | 'destination') => (value: string) => {
    const processedValue = value ? parseInt(value) : undefined;
    
    setFormData(prev => ({
      ...prev,
      [fieldName]: processedValue
    }));

    // Clear error when user selects a location
    if (errors[fieldName]) {
      setErrors(prev => ({
        ...prev,
        [fieldName]: ''
      }));
    }
  };

  const handleContainerTypeChange = (value: string) => {
    const processedValue = value ? parseInt(value) : undefined;
    
    setFormData(prev => ({
      ...prev,
      containerType: processedValue
    }));

    // Clear error when user selects a container type
    if (errors.containerType) {
      setErrors(prev => ({
        ...prev,
        containerType: ''
      }));
    }
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: checked
    }));
  };

  const validate = (): boolean => {
    const newErrors: FormErrors = {};
    
    // Basic required fields validation
    if (!formData.courierName?.trim()) newErrors.courierName = 'Courier name is required';
    if (!formData.origin) newErrors.origin = 'Origin is required';
    if (!formData.destination) newErrors.destination = 'Destination is required';
    if (!formData.shippingType) newErrors.shippingType = 'Shipping type is required';
    if (!formData.rate || formData.rate <= 0) newErrors.rate = 'Rate must be a positive number';
    if (!formData.effectiveFrom) newErrors.effectiveFrom = 'Effective from date is required';
    if (!formData.effectiveTo) newErrors.effectiveTo = 'Effective to date is required';
    
    // Date validation
    if (formData.effectiveFrom && formData.effectiveTo) {
      if (new Date(formData.effectiveFrom) >= new Date(formData.effectiveTo)) {
        newErrors.effectiveTo = 'Effective to date must be after effective from date';
      }
    }
    
    // Shipping type specific validation
    if (formData.shippingType === 'WATER') {
      if (!formData.seaFreightMode) {
        newErrors.seaFreightMode = 'Sea freight mode is required for water shipping';
      }
      
      // WATER mode specific validations
      if (formData.seaFreightMode === 'FCL') {
        // FCL specific validations - containerType is optional but if provided should be valid
        if (formData.containerType && formData.containerType <= 0) {
          newErrors.containerType = 'Container type must be selected';
        }
      }
      // LCL mode doesn't have required specific fields beyond seaFreightMode
    }
    
    // AIR shipping doesn't have additional required fields beyond the basic ones
    
    // Numeric field validations for optional fields (if provided, should be valid)
    if (formData.transitDays !== undefined && formData.transitDays <= 0) {
      newErrors.transitDays = 'Transit days must be positive';
    }
    if (formData.weightLimit !== undefined && formData.weightLimit <= 0) {
      newErrors.weightLimit = 'Weight limit must be positive';
    }
    
    // Shipping type specific numeric validations
    if (formData.shippingType === 'AIR') {
      if (formData.minimumCharge !== undefined && formData.minimumCharge < 0) {
        newErrors.minimumCharge = 'Minimum charge cannot be negative';
      }
      if (formData.fuelSurchargeRate !== undefined && (formData.fuelSurchargeRate < 0 || formData.fuelSurchargeRate > 1)) {
        newErrors.fuelSurchargeRate = 'Fuel surcharge rate must be between 0 and 1';
      }
      if (formData.securitySurcharge !== undefined && formData.securitySurcharge < 0) {
        newErrors.securitySurcharge = 'Security surcharge cannot be negative';
      }
      if (formData.airWeightLimit !== undefined && formData.airWeightLimit <= 0) {
        newErrors.airWeightLimit = 'Air weight limit must be positive';
      }
    }
    
    if (formData.shippingType === 'WATER') {
      if (formData.documentationFee !== undefined && formData.documentationFee < 0) {
        newErrors.documentationFee = 'Documentation fee cannot be negative';
      }
      if (formData.bunkerAdjustmentRate !== undefined && (formData.bunkerAdjustmentRate < 0 || formData.bunkerAdjustmentRate > 1)) {
        newErrors.bunkerAdjustmentRate = 'Bunker adjustment rate must be between 0 and 1';
      }
      
      if (formData.seaFreightMode === 'LCL') {
        if (formData.lclServiceCharge !== undefined && formData.lclServiceCharge < 0) {
          newErrors.lclServiceCharge = 'LCL service charge cannot be negative';
        }
      }
      
      if (formData.seaFreightMode === 'FCL') {
        if (formData.terminalHandlingCharge !== undefined && formData.terminalHandlingCharge < 0) {
          newErrors.terminalHandlingCharge = 'Terminal handling charge cannot be negative';
        }
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    if (validate()) {
      const submitData = { ...formData };
      
      // Filter out irrelevant fields based on shipping type and mode
      if (formData.shippingType === 'AIR') {
        // Remove WATER-specific fields for AIR shipping
        delete submitData.seaFreightMode;
        delete submitData.documentationFee;
        delete submitData.bunkerAdjustmentRate;
        delete submitData.lclServiceCharge;
        delete submitData.containerType;
        delete submitData.terminalHandlingCharge;
      } else if (formData.shippingType === 'WATER') {
        // Remove AIR-specific fields for WATER shipping
        delete submitData.minimumCharge;
        delete submitData.fuelSurchargeRate;
        delete submitData.securitySurcharge;
        delete submitData.airWeightLimit;
        delete submitData.airDescription;
        
        // Further filter based on sea freight mode
        if (formData.seaFreightMode === 'LCL') {
          // Remove FCL-specific fields for LCL mode
          delete submitData.containerType;
          delete submitData.terminalHandlingCharge;
        } else if (formData.seaFreightMode === 'FCL') {
          // Remove LCL-specific fields for FCL mode
          delete submitData.lclServiceCharge;
        }
      }
      
      onSubmit(convertCourierFormDataToCourierRate(submitData));
    }
  };

  const convertCourierFormDataToCourierRate = (data: CourierRateFormData): CourierRate => {
    return {
      id: data.id,
      courierName: data.courierName!,
      origin: { id: data.origin } as unknown as Location,           // Will be populated by backend
      destination: { id: data.destination } as unknown as Location, // Will be populated by backend
      shippingType: data.shippingType!,
      seaFreightMode: data.seaFreightMode,
      effectiveFrom: data.effectiveFrom!,
      effectiveTo: data.effectiveTo!,
      isActive: data.isActive,
      transitDays: data.transitDays,
      weightLimit: data.weightLimit,
      dimensionLimit: data.dimensionLimit,
      description: data.description,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
      
      // Rate fields
      rate: data.rate!,
      currency: data.currency || 'INR',

      // SeaFreightRate fields (for WATER shipping)
      documentationFee: data.documentationFee,
      bunkerAdjustmentRate: data.bunkerAdjustmentRate,
      
      // AirFreightRate fields (for AIR shipping)
      minimumCharge: data.minimumCharge,
      fuelSurchargeRate: data.fuelSurchargeRate,
      securitySurcharge: data.securitySurcharge,
      airWeightLimit: data.airWeightLimit,
      airDescription: data.airDescription,
      
      // LCLFreightRate fields (for WATER + LCL)
      lclServiceCharge: data.lclServiceCharge,
      
      // FCLFreightRate fields (for WATER + FCL)
      containerType: data.containerType ? { id: data.containerType } as unknown as ContainerType : undefined,
      terminalHandlingCharge: data.terminalHandlingCharge,
    };
  };

  return (
    <div className="card">
      <h3>{initialData ? 'Edit Courier Rate' : 'Add New Courier Rate'}</h3>
      <form onSubmit={handleSubmit}>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="courierName">Courier Name *</label>
            <input
              type="text"
              id="courierName"
              name="courierName"
              value={formData.courierName}
              onChange={handleChange}
              placeholder="e.g., DHL Express, FedEx, UPS"
            />
            {errors.courierName && <span className="error">{errors.courierName}</span>}
          </div>
        </div>

        
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="shippingType">Shipping Type *</label>
            <select
              id="shippingType"
              name="shippingType"
              value={formData.shippingType}
              onChange={handleChange}
            >
              <option value="">Select Type</option>
              <option value="AIR">Air</option>
              <option value="WATER">Water</option>
            </select>
            {errors.shippingType && <span className="error">{errors.shippingType}</span>}
          </div>

          {formData.shippingType === 'WATER' && (
            <>
              <div className="form-group">
                <label htmlFor="seaFreightMode">Sea Freight Mode *</label>
                <select
                  id="seaFreightMode"
                  name="seaFreightMode"
                  value={formData.seaFreightMode}
                  onChange={handleChange}
                >
                  <option value="">Select Mode</option>
                  <option value="FCL">FCL (Full Container Load)</option>
                  <option value="LCL">LCL (Less than Container Load)</option>
                </select>
                {errors.seaFreightMode && <span className="error">{errors.seaFreightMode}</span>}
              </div>
              {formData.seaFreightMode === 'FCL' && (
                <div className="form-group">
                  <label htmlFor="containerType">Container Type</label>
                  <ContainerTypeSelector
                    value={(formData.containerType || '').toString()}
                    onChange={handleContainerTypeChange}
                    placeholder="Search and select container type..."
                    weightKG={formData.weightLimit}
                    volumeCBM={null}
                    showSuitableOnly={false}
                    error={errors.containerType}
                  />
                </div>
              )}
            </>
          )}
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="origin">Origin *</label>
            <LocationSelector
              value={(formData.origin || '').toString()}
              onChange={handleLocationChange('origin')}
              placeholder="Search and select origin location..."
              locationType={getPrimaryLocationType(formData.shippingType)}
              required
              error={errors.origin}
            />
          </div>

          <div className="form-group">
            <label htmlFor="destination">Destination *</label>
            <LocationSelector
              value={(formData.destination || '').toString()}
              onChange={handleLocationChange('destination')}
              placeholder="Search and select destination location..."
              locationType={getPrimaryLocationType(formData.shippingType)}
              required
              error={errors.destination}
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="rate">Rate *</label>
            <input
              type="number"
              id="rate"
              name="rate"
              step="0.01"
              min="0"
              value={formData.rate}
              onChange={handleChange}
              placeholder="0.00"
            />
            {errors.rate && <span className="error">{errors.rate}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="currency">Currency</label>
            <select
              id="currency"
              name="currency"
              value={formData.currency}
              onChange={handleChange}
            >
              <option value="INR">INR</option>
              <option value="EUR" disabled>EUR</option>
              <option value="GBP" disabled>GBP</option>
              <option value="INR" disabled>INR</option>
            </select>
            {errors.currency && <span className="error">{errors.currency}</span>}
          </div>
        </div>

        {/* Air Freight specific fields */}
        {formData.shippingType === 'AIR' && (
          <>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="minimumCharge">Minimum Charge</label>
                <input
                  type="number"
                  id="minimumCharge"
                  name="minimumCharge"
                  step="0.01"
                  min="0"
                  value={formData.minimumCharge}
                  onChange={handleChange}
                  placeholder="0.00"
                />
                {errors.minimumCharge && <span className="error">{errors.minimumCharge}</span>}
              </div>
              <div className="form-group">
                <label htmlFor="fuelSurchargeRate">Fuel Surcharge Rate (%)</label>
                <input
                  type="number"
                  id="fuelSurchargeRate"
                  name="fuelSurchargeRate"
                  step="0.0001"
                  min="0"
                  max="1"
                  value={formData.fuelSurchargeRate}
                  onChange={handleChange}
                  placeholder="0.0000"
                />
                {errors.fuelSurchargeRate && <span className="error">{errors.fuelSurchargeRate}</span>}
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="securitySurcharge">Security Surcharge</label>
                <input
                  type="number"
                  id="securitySurcharge"
                  name="securitySurcharge"
                  step="0.01"
                  min="0"
                  value={formData.securitySurcharge}
                  onChange={handleChange}
                  placeholder="0.00"
                />
                {errors.securitySurcharge && <span className="error">{errors.securitySurcharge}</span>}
              </div>
              <div className="form-group">
                <label htmlFor="airWeightLimit">Air Weight Limit (KG)</label>
                <input
                  type="number"
                  id="airWeightLimit"
                  name="airWeightLimit"
                  min="0"
                  value={formData.airWeightLimit}
                  onChange={handleChange}
                  placeholder="Weight limit"
                />
                {errors.airWeightLimit && <span className="error">{errors.airWeightLimit}</span>}
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="airDescription">Air Freight Description</label>
              <textarea
                id="airDescription"
                name="airDescription"
                value={formData.airDescription}
                onChange={handleChange}
                placeholder="Additional air freight details"
                rows={2}
              />
              {errors.airDescription && <span className="error">{errors.airDescription}</span>}
            </div>
          </>
        )}

        {/* Sea Freight specific fields */}
        {formData.shippingType === 'WATER' && (
          <>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="documentationFee">Documentation Fee</label>
                <input
                  type="number"
                  id="documentationFee"
                  name="documentationFee"
                  step="0.01"
                  min="0"
                  value={formData.documentationFee}
                  onChange={handleChange}
                  placeholder="0.00"
                />
                {errors.documentationFee && <span className="error">{errors.documentationFee}</span>}
              </div>
              <div className="form-group">
                <label htmlFor="bunkerAdjustmentRate">Bunker Adjustment Rate (%)</label>
                <input
                  type="number"
                  id="bunkerAdjustmentRate"
                  name="bunkerAdjustmentRate"
                  step="0.0001"
                  min="0"
                  max="1"
                  value={formData.bunkerAdjustmentRate}
                  onChange={handleChange}
                  placeholder="0.0000"
                />
                {errors.bunkerAdjustmentRate && <span className="error">{errors.bunkerAdjustmentRate}</span>}
              </div>
            </div>

            {/* LCL specific fields */}
            {formData.seaFreightMode === 'LCL' && (
              <div className="form-group">
                <label htmlFor="lclServiceCharge">LCL Service Charge</label>
                <input
                  type="number"
                  id="lclServiceCharge"
                  name="lclServiceCharge"
                  step="0.01"
                  min="0"
                  value={formData.lclServiceCharge}
                  onChange={handleChange}
                  placeholder="0.00"
                />
                {errors.lclServiceCharge && <span className="error">{errors.lclServiceCharge}</span>}
              </div>
            )}

            {/* FCL specific fields */}
            {formData.seaFreightMode === 'FCL' && (
              <div className="form-group">
                <label htmlFor="terminalHandlingCharge">Terminal Handling Charge</label>
                <input
                  type="number"
                  id="terminalHandlingCharge"
                  name="terminalHandlingCharge"
                  step="0.01"
                  min="0"
                  value={formData.terminalHandlingCharge}
                  onChange={handleChange}
                  placeholder="0.00"
                />
                {errors.terminalHandlingCharge && <span className="error">{errors.terminalHandlingCharge}</span>}
              </div>
            )}
          </>
        )}

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="effectiveFrom">Effective From *</label>
            <input
              type="date"
              id="effectiveFrom"
              name="effectiveFrom"
              value={formData.effectiveFrom}
              onChange={handleChange}
            />
            {errors.effectiveFrom && <span className="error">{errors.effectiveFrom}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="effectiveTo">Effective To *</label>
            <input
              type="date"
              id="effectiveTo"
              name="effectiveTo"
              value={formData.effectiveTo}
              onChange={handleChange}
            />
            {errors.effectiveTo && <span className="error">{errors.effectiveTo}</span>}
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="transitDays">Transit Days</label>
            <input
              type="number"
              id="transitDays"
              name="transitDays"
              min="1"
              value={formData.transitDays}
              onChange={handleChange}
              placeholder="e.g., 3-5 days"
            />
            {errors.transitDays && <span className="error">{errors.transitDays}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="weightLimit">Weight Limit (KG)</label>
            <input
              type="number"
              id="weightLimit"
              name="weightLimit"
              step="0.1"
              min="0"
              value={formData.weightLimit}
              onChange={handleChange}
              placeholder="e.g., 30"
            />
            {errors.weightLimit && <span className="error">{errors.weightLimit}</span>}
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="dimensionLimit">Dimension Limit</label>
          <input
            type="text"
            id="dimensionLimit"
            name="dimensionLimit"
            value={formData.dimensionLimit}
            onChange={handleChange}
            placeholder="e.g., 100x100x100 cm"
          />
          {errors.dimensionLimit && <span className="error">{errors.dimensionLimit}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Optional description or notes"
            rows={3}
          />
          {errors.description && <span className="error">{errors.description}</span>}
        </div>

        <div className="form-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              name="isActive"
              checked={formData.isActive}
              onChange={handleCheckboxChange}
            />
            Active Rate
          </label>
          <small className="form-text">Uncheck to deactivate this rate without deleting it</small>
        </div>

        <div className="actions">
          <button type="submit" className="btn btn-primary">
            {initialData ? 'Update Rate' : 'Add Rate'}
          </button>
          {onCancel && (
            <button type="button" className="btn btn-secondary" onClick={onCancel}>
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default CourierRateForm;
