import React, { useState, useEffect } from 'react';
import CountrySelector from '../CountrySelector';
import type { Location, LocationType, LocationTypeInfo, ApiResponse } from '../../types';
import { locationService } from '../../services/api';
import './LocationManagement.css';

const LocationManagement: React.FC = () => {
    const [locations, setLocations] = useState<Location[]>([]);
    const [filteredLocations, setFilteredLocations] = useState<Location[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>('');
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [selectedType, setSelectedType] = useState<string>('');
    const [showForm, setShowForm] = useState<boolean>(false);
    const [editingLocation, setEditingLocation] = useState<Location | null>(null);

    const [formData, setFormData] = useState<Location>({
        name: '',
        locationCode: '',
        country: '',
        countryCode: '',
        portCode: '',
        locationType: 'CITY',
        isActive: true
    });

    const locationTypes: LocationTypeInfo[] = [
        { value: 'SEA_PORT', label: '🚢 Sea Port', icon: '⚓' },
        { value: 'AIRPORT', label: '✈️ Airport', icon: '🛫' },
        { value: 'CITY', label: '🏙️ City', icon: '🏢' },
        { value: 'INLAND_PORT', label: '🚛 Inland Port', icon: '🏭' }
    ];

    useEffect(() => {
        loadLocations();
    }, []);

    useEffect(() => {
        filterLocations();
    }, [locations, searchTerm, selectedType]);

    const loadLocations = async (): Promise<void> => {
        setLoading(true);
        try {
            const response: ApiResponse<Location[]> = await locationService.getAllLocations();
            setLocations(response.data);
            setError('');
        } catch (err) {
            setError('Failed to load locations');
            console.error('Error loading locations:', err);
        } finally {
            setLoading(false);
        }
    };

    const filterLocations = (): void => {
        let filtered = locations;
        
        if (searchTerm) {
            filtered = filtered.filter(location =>
                location.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                location.locationCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                location.portCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                location.country?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }
        
        if (selectedType) {
            filtered = filtered.filter(location => location.locationType === selectedType);
        }
        
        setFilteredLocations(filtered);
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
        e.preventDefault();
        setLoading(true);
        try {
            const submitData = {
                ...formData
            };

            if (editingLocation) {
                if (editingLocation.id !== undefined) {
                    await locationService.updateLocation(editingLocation.id, submitData);
                } else {
                    throw new Error('Editing location does not have a valid id.');
                }
            } else {
                await locationService.createLocation(submitData);
            }
            await loadLocations();
            resetForm();
            setError('');
        } catch (err) {
            setError(editingLocation ? 'Failed to update location' : 'Failed to create location');
            console.error('Error saving location:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (location: Location): void => {
        setEditingLocation(location);
        setFormData(location);
        setShowForm(true);
    };

    const handleDelete = async (id: number): Promise<void> => {
        if (window.confirm('Are you sure you want to delete this location?')) {
            setLoading(true);
            try {
                await locationService.deleteLocation(id);
                await loadLocations();
                setError('');
            } catch (err) {
                setError('Failed to delete location');
                console.error('Error deleting location:', err);
            } finally {
                setLoading(false);
            }
        }
    };

    const resetForm = (): void => {
        setFormData({
            name: '',
            locationCode: '',
            country: '',
            countryCode: '',
            portCode: '',
            locationType: 'CITY',
            isActive: true
        });
        setEditingLocation(null);
        setShowForm(false);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>): void => {
        const { name, value, type } = e.target;
        const checked = (e.target as HTMLInputElement).checked;
        
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const getLocationTypeIcon = (type: LocationType): string => {
        const typeInfo = locationTypes.find(t => t.value === type);
        return typeInfo ? typeInfo.icon : '📍';
    };

    return (
        <div className="location-management">
            <div className="header">
                <div className="title-section">
                    <h2>📍 Location Management</h2>
                    <p>Manage shipping locations including ports, airports, and cities</p>
                </div>
                <button 
                    className="btn btn-primary"
                    onClick={() => setShowForm(true)}
                    disabled={loading}
                >
                    ➕ Add New Location
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
                        placeholder="Search locations..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="type-filter">
                    <select
                        value={selectedType}
                        onChange={(e) => setSelectedType(e.target.value)}
                    >
                        <option value="">All Types</option>
                        {locationTypes.map(type => (
                            <option key={type.value} value={type.value}>
                                {type.label}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {showForm && (
                <div className="modal-overlay">
                    <div className="modal">
                        <div className="modal-header">
                            <h3>{editingLocation ? 'Edit Location' : 'Add New Location'}</h3>
                            <button className="close-btn" onClick={resetForm}>×</button>
                        </div>
                        
                        <form onSubmit={handleSubmit}>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Location Code *</label>
                                    <input
                                        type="text"
                                        name="locationCode"
                                        value={formData.locationCode}
                                        onChange={handleInputChange}
                                        placeholder="e.g., JFK, LAX, NYC"
                                        required
                                        maxLength={10}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Location Type *</label>
                                    <select
                                        name="locationType"
                                        value={formData.locationType}
                                        onChange={handleInputChange}
                                        required
                                    >
                                        {locationTypes.map(type => (
                                            <option key={type.value} value={type.value}>
                                                {type.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Location Name *</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    placeholder="e.g., John F. Kennedy International Airport"
                                    required
                                />
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Country Code</label>
                                    <input
                                        type="text"
                                        name="countryCode"
                                        value={formData.countryCode || ''}
                                        onChange={handleInputChange}
                                        placeholder="e.g., USA, GBR, IND"
                                        maxLength={3}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Port Code</label>
                                    <input
                                        type="text"
                                        name="portCode"
                                        value={formData.portCode || ''}
                                        onChange={handleInputChange}
                                        placeholder="e.g., USNYC, GBLON"
                                        maxLength={5}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Country *</label>
                                    <CountrySelector
                                        value={formData.country}
                                        onChange={(value) => {
                                            setFormData(prev => ({ ...prev, country: value }));
                                        }}
                                        placeholder="Search and select country..."
                                        required
                                    />
                                </div>
                            </div>


                            <div className="form-group">
                                <label className="checkbox-label">
                                    <input
                                        type="checkbox"
                                        name="isActive"
                                        checked={formData.isActive}
                                        onChange={handleInputChange}
                                    />
                                    Active Location
                                </label>
                            </div>

                            <div className="form-actions">
                                <button type="submit" className="btn btn-primary" disabled={loading}>
                                    {loading ? 'Saving...' : (editingLocation ? 'Update Location' : 'Create Location')}
                                </button>
                                <button type="button" className="btn btn-secondary" onClick={resetForm}>
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <div className="locations-grid">
                {loading && <div className="loading">Loading locations...</div>}
                
                {!loading && filteredLocations.length === 0 && (
                    <div className="no-data">
                        {searchTerm || selectedType ? 'No locations match your filters' : 'No locations found'}
                    </div>
                )}

                {filteredLocations.map(location => (
                    <div key={location.id} className={`location-card ${!location.isActive ? 'inactive' : ''}`}>
                        <div className="location-header">
                            <div className="location-title">
                                <span className="location-icon">{getLocationTypeIcon(location.locationType)}</span>
                                <div>
                                    <h4>{location.name}</h4>
                                    <span className="location-code">{location.locationCode}</span>
                                </div>
                            </div>
                            <div className="location-actions">
                                <button
                                    className="btn btn-sm btn-secondary"
                                    onClick={() => handleEdit(location)}
                                    disabled={loading}
                                >
                                    ✏️ Edit
                                </button>
                                <button
                                    className="btn btn-sm btn-danger"
                                    onClick={() => handleDelete((location.id as number))}
                                    disabled={loading}
                                >
                                    🗑️ Delete
                                </button>
                            </div>
                        </div>
                        
                        <div className="location-details">
                            <div className="detail">
                                <span className="label">Country:</span>
                                <span>{location.country}</span>
                            </div>
                            {location.countryCode && (
                                <div className="detail">
                                    <span className="label">Country Code:</span>
                                    <span>{location.countryCode}</span>
                                </div>
                            )}
                            {location.portCode && (
                                <div className="detail">
                                    <span className="label">Port Code:</span>
                                    <span>{location.portCode}</span>
                                </div>
                            )}
                            <div className="detail">
                                <span className="label">Type:</span>
                                <span className="type-badge">{location.locationType.replace('_', ' ')}</span>
                            </div>
                            {!location.isActive && (
                                <div className="status-badge inactive">INACTIVE</div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default LocationManagement;
