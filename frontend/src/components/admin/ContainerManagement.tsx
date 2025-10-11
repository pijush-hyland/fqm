import React, { useState, useEffect } from 'react';
import { containerTypeService } from '../../services/api';
import type { ContainerType } from '../../types';
import './ContainerManagement.css';

const ContainerManagement: React.FC = () => {
  const [containerTypes, setContainerTypes] = useState<ContainerType[]>([]);
  const [filteredContainers, setFilteredContainers] = useState<ContainerType[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [showForm, setShowForm] = useState<boolean>(false);
  const [editingContainer, setEditingContainer] = useState<ContainerType | null>(null);
  
  const [formData, setFormData] = useState<ContainerType>({
    code: '',
    name: '',
    description: '',
    lengthMeters: 0,
    widthMeters: 0,
    heightMeters: 0,
    volumeCBM: 0,
    maxGrossWeightKG: 0,
    maxPayloadKG: 0,
    tareWeightKG: 0,
    isRefrigerated: false,
    isActive: true
  });

  const calculateVolume = (length: string, width: string, height: string): number => {
    if (length && width && height) {
      return (parseFloat(length) * parseFloat(width) * parseFloat(height));
    }
    return 0;
  };

  useEffect(() => {
    loadContainerTypes();
  }, []);

  useEffect(() => {
    filterContainers();
  }, [containerTypes, searchTerm]);

  const loadContainerTypes = async (): Promise<void> => {
    setLoading(true);
    try {
      const response = await containerTypeService.getAllContainerTypes();
      setContainerTypes(response.data);
      setError('');
    } catch (err) {
      setError('Failed to load container types');
      console.error('Error loading container types:', err);
    } finally {
      setLoading(false);
    }
  };

  const filterContainers = (): void => {
    let filtered = containerTypes;
    
    if (searchTerm) {
      filtered = filtered.filter(container =>
        container.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        container.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (container.description && container.description.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    setFilteredContainers(filtered);
  };

  const handleDimensionChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    const numValue = parseFloat(value) || 0;
    const newFormData = { ...formData, [name]: numValue };
    
        // Auto-calculate volume when dimensions change
    if (['lengthMeters', 'widthMeters', 'heightMeters'].includes(name)) {
      const volume = calculateVolume(
        name === 'lengthMeters' ? value : formData.lengthMeters.toString(),
        name === 'widthMeters' ? value : formData.widthMeters.toString(),
        name === 'heightMeters' ? value : formData.heightMeters.toString()
      );
      newFormData.volumeCBM = volume;
    }
    
    setFormData(newFormData);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setLoading(true);
    try {
      const submitData: ContainerType = {
        ...formData,
        id: editingContainer?.id
      };

      if (editingContainer && editingContainer.id) {
        await containerTypeService.updateContainerType(editingContainer.id, submitData);
      } else {
        await containerTypeService.createContainerType(submitData);
      }
      await loadContainerTypes();
      resetForm();
      setError('');
    } catch (err) {
      setError(editingContainer ? 'Failed to update container type' : 'Failed to create container type');
      console.error('Error saving container type:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (container: ContainerType): void => {
    setEditingContainer(container);
    setFormData({
      code: container.code,
      name: container.name,
      description: container.description || '',
      lengthMeters: container.lengthMeters || 0,
      widthMeters: container.widthMeters || 0,
      heightMeters: container.heightMeters || 0,
      volumeCBM: container.volumeCBM || 0,
      maxPayloadKG: container.maxPayloadKG || 0,
      tareWeightKG: container.tareWeightKG || 0,
      maxGrossWeightKG: container.maxGrossWeightKG || 0,
      isRefrigerated: container.isRefrigerated || false,
      isActive: container.isActive || true
    });
    setShowForm(true);
  };

  const handleDelete = async (id: number): Promise<void> => {
    if (window.confirm('Are you sure you want to delete this container type?')) {
      setLoading(true);
      try {
        await containerTypeService.deleteContainerType(id);
        await loadContainerTypes();
        setError('');
      } catch (err) {
        setError('Failed to delete container type');
        console.error('Error deleting container type:', err);
      } finally {
        setLoading(false);
      }
    }
  };

  const resetForm = (): void => {
    setFormData({
      code: '',
      name: '',
      description: '',
      lengthMeters: 0,
      widthMeters: 0,
      heightMeters: 0,
      volumeCBM: 0,
      maxPayloadKG: 0,
      tareWeightKG: 0,
      maxGrossWeightKG: 0,
      isRefrigerated: false,
      isActive: true
    });
    setEditingContainer(null);
    setShowForm(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>): void => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    if (['lengthMeters', 'widthMeters', 'heightMeters'].includes(name)) {
      handleDimensionChange(e as React.ChangeEvent<HTMLInputElement>);
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const formatNumber = (num: number): string => {
    return num ? new Intl.NumberFormat().format(num) : 'N/A';
  };

  return (
    <div className="container-management">
      <div className="header">
        <div className="title-section">
          <h2>📦 Container Type Management</h2>
          <p>Manage shipping container types and specifications</p>
        </div>
        <button 
          className="btn btn-primary"
          onClick={() => setShowForm(true)}
          disabled={loading}
        >
          ➕ Add New Container Type
        </button>
      </div>

      {error && (
        <div className="error-message">
          ⚠️ {error}
        </div>
      )}

      <div className="filters">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search container types..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {showForm && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>{editingContainer ? 'Edit Container Type' : 'Add New Container Type'}</h3>
              <button className="close-btn" onClick={resetForm}>×</button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label>Container Code *</label>
                  <input
                    type="text"
                    name="code"
                    value={formData.code}
                    onChange={handleInputChange}
                    placeholder="e.g., 20GP, 40HC, 45HC"
                    required
                    maxLength={10}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Container Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g., 20ft General Purpose Dry Container"
                  required
                />
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Brief description of the container type..."
                  rows={3}
                />
              </div>

              <div className="form-section">
                <h4>📏 Dimensions</h4>
                <div className="form-row">
                  <div className="form-group">
                    <label>Length (Meters) *</label>
                    <input
                      type="number"
                      step="0.01"
                      name="lengthMeters"
                      value={formData.lengthMeters}
                      onChange={handleInputChange}
                      placeholder="e.g., 5.89"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Width (Meters) *</label>
                    <input
                      type="number"
                      step="0.01"
                      name="widthMeters"
                      value={formData.widthMeters}
                      onChange={handleInputChange}
                      placeholder="e.g., 2.35"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Height (Meters) *</label>
                    <input
                      type="number"
                      step="0.01"
                      name="heightMeters"
                      value={formData.heightMeters}
                      onChange={handleInputChange}
                      placeholder="e.g., 2.39"
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Volume (CBM) *</label>
                    <input
                      type="number"
                      step="0.01"
                      name="volumeCBM"
                      value={formData.volumeCBM}
                      onChange={handleInputChange}
                      placeholder="Auto-calculated from dimensions"
                      required
                    />
                    <small>Automatically calculated from dimensions</small>
                  </div>
                </div>
              </div>

              <div className="form-section">
                <h4>⚖️ Weight Specifications</h4>
                <div className="form-row">
                  <div className="form-group">
                    <label>Max Payload (KG) *</label>
                    <input
                      type="number"
                      step="0.1"
                      name="maxPayloadKG"
                      value={formData.maxPayloadKG}
                      onChange={handleInputChange}
                      placeholder="e.g., 28280"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Tare Weight (KG) *</label>
                    <input
                      type="number"
                      step="0.1"
                      name="tareWeightKG"
                      value={formData.tareWeightKG}
                      onChange={handleInputChange}
                      placeholder="e.g., 2200"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Max Gross Weight (KG) *</label>
                    <input
                      type="number"
                      step="0.1"
                      name="maxGrossWeightKG"
                      value={formData.maxGrossWeightKG}
                      onChange={handleInputChange}
                      placeholder="e.g., 30480"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="form-section">
                <h4>🔧 Special Features</h4>
                <div className="form-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="isRefrigerated"
                      checked={formData.isRefrigerated}
                      onChange={handleInputChange}
                    />
                    Refrigerated Container
                  </label>
                </div>

                <div className="form-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="isActive"
                      checked={formData.isActive}
                      onChange={handleInputChange}
                    />
                    Active Container Type
                  </label>
                </div>
              </div>

              <div className="form-actions">
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? 'Saving...' : (editingContainer ? 'Update Container Type' : 'Create Container Type')}
                </button>
                <button type="button" className="btn btn-secondary" onClick={resetForm}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="containers-grid">
        {loading && <div className="loading">Loading container types...</div>}
        
        {!loading && filteredContainers.length === 0 && (
          <div className="no-data">
            {searchTerm ? 'No container types match your search' : 'No container types found'}
          </div>
        )}

        {filteredContainers.map(container => (
          <div key={container.id} className={`container-card ${!container.isActive ? 'inactive' : ''}`}>
            <div className="container-header">
              <div className="container-title">
                <span className="container-icon">📦</span>
                <div>
                  <h4>{container.name}</h4>
                  <span className="container-code">{container.code}</span>
                  {container.isRefrigerated && <span className="feature-badge">❄️ REEFER</span>}
                </div>
              </div>
              <div className="container-actions">
                <button
                  className="btn btn-sm btn-secondary"
                  onClick={() => handleEdit(container)}
                  disabled={loading}
                >
                  ✏️ Edit
                </button>
                <button
                  className="btn btn-sm btn-danger"
                  onClick={() => container.id && handleDelete(container.id)}
                  disabled={loading}
                >
                  🗑️ Delete
                </button>
              </div>
            </div>
            
            <div className="container-details">
              {container.description && (
                <div className="description">
                  {container.description}
                </div>
              )}
              
              <div className="specs-grid">
                <div className="spec-section">
                  <h5>📏 Dimensions</h5>
                  <div className="spec-item">
                    <span>L × W × H:</span>
                    <span>{container.lengthMeters} × {container.widthMeters} × {container.heightMeters} m</span>
                  </div>
                  <div className="spec-item">
                    <span>Volume:</span>
                    <span>{container.volumeCBM} CBM</span>
                  </div>
                </div>

                <div className="spec-section">
                  <h5>⚖️ Weight</h5>
                  <div className="spec-item">
                    <span>Max Payload:</span>
                    <span>{formatNumber(container.maxPayloadKG)} kg</span>
                  </div>
                  <div className="spec-item">
                    <span>Tare Weight:</span>
                    <span>{formatNumber(container.tareWeightKG)} kg</span>
                  </div>
                </div>
              </div>

              {!container.isActive && (
                <div className="status-badge inactive">INACTIVE</div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ContainerManagement;
