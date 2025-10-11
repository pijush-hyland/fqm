import React, { useState } from 'react';
import LocationSelector from './LocationSelector';
import type { LocationType, ShippingRequirement } from '../types';
import './ShippingRequirementForm.css';

interface FormErrors {
  [key: string]: string;
}

interface ShippingRequirementFormProps {
  onSubmit: (data: ShippingRequirement) => void;
  loading?: boolean;
}

type FormStep = 1 | 2 | 3 | 4;

const ShippingRequirementForm: React.FC<ShippingRequirementFormProps> = ({ onSubmit, loading = false }) => {
  const [formData, setFormData] = useState<ShippingRequirement>({});
  const [currentStep, setCurrentStep] = useState<FormStep>(1);
  const [errors, setErrors] = useState<FormErrors>({});

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

  const getStepTitle = (step: FormStep): string => {
    switch (step) {
      case 1: return '🚛 Shipment Details';
      case 2: return '📦 Cargo Details';
      case 3: return '🚛 Container Details';
      case 4: return '⏱️ Review & Options';
      default: return '';
    }
  };

  const getStepDescription = (step: FormStep): string => {
    switch (step) {
      case 1: return 'Tell us about your shipment mode and locations';
      case 2: return 'Provide details about your cargo';
      case 3: return 'Specify container requirements';
      case 4: return 'Review details and set additional options';
      default: return '';
    }
  };

  const shouldSkipStep3 = (): boolean => {
    return formData.shippingType !== 'WATER' || formData.seaFreightMode !== 'FCL';
  };

  const validateStep = (step: FormStep): boolean => {
    const newErrors: FormErrors = {};
    
    switch (step) {
      case 1:
        if (!formData.origin) newErrors.origin = 'Origin is required';
        if (!formData.destination) newErrors.destination = 'Destination is required';
        if (formData.shippingType === 'WATER' && !formData.seaFreightMode) {
          newErrors.seaFreightMode = 'Sea freight mode is required';
        }
        break;
      
      case 2:
        if (!formData.numberOfPackages || formData.numberOfPackages <= 0) {
          newErrors.numberOfPackages = 'Number of packages is required';
        }
        if (!formData.grossWeightKG || formData.grossWeightKG <= 0) {
          newErrors.grossWeightKG = 'Gross weight must be positive';
        }
        if (formData.shippingType === 'WATER') {
          if (!formData.volumeCBM || formData.volumeCBM <= 0) {
            newErrors.volumeCBM = 'Volume (CBM) is required for sea freight';
          }
        } else if (formData.volumeCBM && formData.volumeCBM <= 0) {
          newErrors.volumeCBM = 'Volume must be positive if provided';
        }
        break;
      
      case 3:
        if (formData.shippingType === 'WATER' && formData.seaFreightMode === 'FCL') {
          if (!formData.numberOfContainers || formData.numberOfContainers <= 0) {
            newErrors.numberOfContainers = 'Number of containers is required for FCL';
          }
        }
        break;
      
      case 4:
        // Final validation - combine all previous validations
        return validateStep(1) && validateStep(2) && validateStep(3);
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = (): void => {
    if (validateStep(currentStep)) {
      if (currentStep === 2 && shouldSkipStep3()) {
        setCurrentStep(4);
      } else if (currentStep < 4) {
        setCurrentStep((prev) => (prev + 1) as FormStep);
      }
    }
  };

  const prevStep = (): void => {
    if (currentStep === 4 && shouldSkipStep3()) {
      setCurrentStep(2);
    } else if (currentStep > 1) {
      setCurrentStep((prev) => (prev - 1) as FormStep);
    }
  };

  const goToStep = (step: FormStep): void => {
    setCurrentStep(step);
    setErrors({});
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>): void => {
    const { name, value } = e.target;

    // Convert string values to appropriate types
    let processedValue: any = value;
    
    // Handle number fields
    if (e.target.type === 'number' && value !== '') {
      processedValue = parseFloat(value);
    }
    
    let updatedFormData = {
      ...formData,
      [name]: processedValue
    };

    // Smart field clearing when shipping type changes
    if (name === 'shippingType') {
      updatedFormData = {
        ...updatedFormData,
        seaFreightMode: undefined,
        numberOfContainers: 1,
        origin: undefined,
        destination: undefined
      };
    }

    // Clear container count when switching from FCL
    if (name === 'seaFreightMode' && processedValue !== 'FCL') {
      updatedFormData = {
        ...updatedFormData,
        numberOfContainers: 1
      };
    }

    setFormData(updatedFormData);

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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    if (currentStep === 4 && validateStep(4)) {
      try {
        onSubmit(formData);
      } catch (error) {
        console.error('Error converting form data:', error);
      }
    }
  };

  const handleClear = (): void => {
    setFormData({});
    setErrors({});
    setCurrentStep(1);
  };

  const renderStepIndicator = () => {
    const steps = [
      { number: 1, title: 'Shipment' },
      { number: 2, title: 'Cargo' },
      ...(shouldSkipStep3() ? [] : [{ number: 3, title: 'Container' }]),
      { number: 4, title: 'Review' }
    ];

    return (
      <div className="step-indicator">
        {steps.map((step, index) => (
          <React.Fragment key={step.number}>
            <div 
              className={`step ${currentStep === step.number ? 'active' : currentStep > step.number ? 'completed' : ''}`}
              onClick={() => goToStep(step.number as FormStep)}
            >
              <div className="step-number">
                {currentStep > step.number ? '✓' : step.number}
              </div>
              <div className="step-title">{step.title}</div>
            </div>
            {index < steps.length - 1 && <div className="step-connector"></div>}
          </React.Fragment>
        ))}
      </div>
    );
  };

  const renderStep1 = () => (
    <div className="form-section">
      <h4>{getStepTitle(1)}</h4>
      <p>{getStepDescription(1)}</p>
      
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="shippingType">Shipping Mode</label>
          <select
            id="shippingType"
            name="shippingType"
            value={formData.shippingType || ''}
            onChange={handleChange}
          >
            <option value="">Select mode...</option>
            <option value="AIR">✈️ Air Freight (Fast)</option>
            <option value="WATER">🚢 Sea Freight (Economical)</option>
          </select>
          {errors.shippingType && <span className="error">{errors.shippingType}</span>}
        </div>

        {formData.shippingType === 'WATER' && (
          <div className="form-group">
            <label htmlFor="seaFreightMode">Sea Freight Mode </label>
            <select
              id="seaFreightMode"
              name="seaFreightMode"
              value={formData.seaFreightMode || ''}
              onChange={handleChange}
            >
              <option value="">Select mode...</option>
              <option value="LCL">📦 LCL - Less than Container Load</option>
              <option value="FCL">🚛 FCL - Full Container Load</option>
            </select>
            <small>
              {formData.seaFreightMode === 'LCL'
                ? 'Share container space, charged by volume/weight'
                : 'Exclusive use of entire container'
              }
            </small>
            {errors.seaFreightMode && <span className="error">{errors.seaFreightMode}</span>}
          </div>
        )}
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="origin">Origin Location *</label>
          <LocationSelector
            value={(formData.origin || '').toString()}
            onChange={handleLocationChange('origin')}
            locationType={getPrimaryLocationType(formData.shippingType) || null}
            placeholder="Select pickup location..."
            required
            error={errors.origin}
          />
        </div>

        <div className="form-group">
          <label htmlFor="destination">Destination Location *</label>
          <LocationSelector
            value={(formData.destination || '').toString()}
            onChange={handleLocationChange('destination')}
            locationType={getPrimaryLocationType(formData.shippingType) || null}
            placeholder="Select delivery location..."
            required
            error={errors.destination}
          />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="shippingDate">Ready Date *</label>
          <input
            type="date"
            id="shippingDate"
            name="shippingDate"
            value={formData.shippingDate || ''}
            onChange={handleChange}
            min={new Date().toISOString().split('T')[0]}
          />
          <small>When will goods be ready for pickup</small>
          {errors.shippingDate && <span className="error">{errors.shippingDate}</span>}
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="form-section">
      <h4>{getStepTitle(2)}</h4>
      <p>{getStepDescription(2)}</p>
      
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="numberOfPackages">Number of Packages *</label>
          <input
            type="number"
            id="numberOfPackages"
            name="numberOfPackages"
            min="1"
            value={formData.numberOfPackages || ''}
            onChange={handleChange}
            placeholder="e.g., 5"
          />
          <small>Total pieces in this shipment</small>
          {errors.numberOfPackages && <span className="error">{errors.numberOfPackages}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="grossWeightKG">Gross Weight (KG) *</label>
          <input
            type="number"
            id="grossWeightKG"
            name="grossWeightKG"
            step="0.1"
            min="0.1"
            value={formData.grossWeightKG || ''}
            onChange={handleChange}
            placeholder="e.g., 150.5"
          />
          <small>Total weight including packaging</small>
          {errors.grossWeightKG && <span className="error">{errors.grossWeightKG}</span>}
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="volumeCBM">
            Volume (CBM) {formData.shippingType === 'WATER' ? '*' : ''}
          </label>
          <input
            type="number"
            id="volumeCBM"
            name="volumeCBM"
            step="0.001"
            min="0.001"
            value={formData.volumeCBM || ''}
            onChange={handleChange}
            placeholder="e.g., 2.5"
          />
          <small>Cubic meters (L x W x H in meters)</small>
          {errors.volumeCBM && <span className="error">{errors.volumeCBM}</span>}
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="form-section">
      <h4>{getStepTitle(3)}</h4>
      <p>{getStepDescription(3)}</p>
      
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="numberOfContainers">Number of Containers *</label>
          <input
            type="number"
            id="numberOfContainers"
            name="numberOfContainers"
            min="1"
            value={formData.numberOfContainers || ''}
            onChange={handleChange}
            placeholder="e.g., 1"
          />
          <small>How many containers needed</small>
          {errors.numberOfContainers && <span className="error">{errors.numberOfContainers}</span>}
        </div>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="form-section">
      <h4>{getStepTitle(4)}</h4>
      <p>{getStepDescription(4)}</p>
      
      {/* Summary */}
      <div className="summary-section">
        <h5>📋 Shipment Summary</h5>
        <div className="summary-grid">
          <div className="summary-item">
            <strong>Mode:</strong> {formData.shippingType === 'AIR' ? 'Air Freight' : 'Sea Freight'}
            {formData.seaFreightMode && ` (${formData.seaFreightMode})`}
          </div>
          <div className="summary-item">
            <strong>Weight:</strong> {formData.grossWeightKG} kg
          </div>
          {formData.volumeCBM && (
            <div className="summary-item">
              <strong>Volume:</strong> {formData.volumeCBM} CBM
            </div>
          )}
          <div className="summary-item">
            <strong>Packages:</strong> {formData.numberOfPackages}
          </div>
          {formData.numberOfContainers && (
            <div className="summary-item">
              <strong>Containers:</strong> {formData.numberOfContainers}
            </div>
          )}
        </div>
      </div>

      {/* Additional Options */}
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="maxTransitDays">Maximum Transit Days</label>
          <input
            type="number"
            id="maxTransitDays"
            name="maxTransitDays"
            min="1"
            value={formData.maxTransitDays || ''}
            onChange={handleChange}
            placeholder="e.g., 7"
          />
          <small>Maximum acceptable delivery time</small>
        </div>
      </div>
    </div>
  );

  return (
    <div className="card">
      <h3>📋 Shipping Requirements</h3>
      <p>Complete the required fields to get freight quotes</p>
      
      {renderStepIndicator()}
      
      <form onSubmit={handleSubmit}>
        {currentStep === 1 && renderStep1()}
        {currentStep === 2 && renderStep2()}
        {currentStep === 3 && renderStep3()}
        {currentStep === 4 && renderStep4()}

        <div className="step-actions">
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              disabled={currentStep <= 1}
              type="button"
              className="btn btn-secondary"
              onClick={prevStep}
            >
              ← Previous
            </button>

            <button
              type="button"
              className="btn btn-link"
              onClick={handleClear}
            >
              Clear
            </button>
          </div>
          
          <div className="step-actions-right">
            
            {currentStep < 4 ? (
              <button 
                type="button" 
                className="btn btn-primary" 
                onClick={nextStep}
              >
                Next →
              </button>
            ) : (
              <button 
                type="submit" 
                className="btn btn-primary" 
                disabled={loading}
              >
                {loading ? '🔍 Searching...' : '🔍 Find Best Options'}
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
};

export default ShippingRequirementForm;
