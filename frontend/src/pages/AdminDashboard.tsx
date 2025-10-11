import React, { useState, useEffect } from 'react';
import CourierRateForm from '../components/CourierRateForm';
import CourierRateTable from '../components/CourierRateTable';
import LocationManagement from '../components/admin/LocationManagement';
import ContainerManagement from '../components/admin/ContainerManagement';
import { courierRateService } from '../services/api';
import type { CourierRate } from '../types';
import './AdminDashboard.css';

type TabType = 'rates' | 'locations' | 'containers';

const AdminDashboard: React.FC = () => {
  const [rates, setRates] = useState<CourierRate[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [editingRate, setEditingRate] = useState<CourierRate | null>(null);
  const [showForm, setShowForm] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<TabType>('rates');

  useEffect(() => {
    loadRates();
  }, []);

  const loadRates = async (): Promise<void> => {
    try {
      setLoading(true);
      const response = await courierRateService.getAllRates();
      setRates(response.data as CourierRate[]);
      setError('');
    } catch (err) {
      setError('Failed to load courier rates. Please check if the backend is running.');
      console.error('Error loading rates:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRate = async (rateData: any): Promise<void> => {
    try {
      await courierRateService.createRate(rateData);
      setSuccess('Courier rate created successfully!');
      setShowForm(false);
      loadRates();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to create courier rate. Please try again.');
      console.error('Error creating rate:', err);
    }
  };

  const handleUpdateRate = async (rateData: any): Promise<void> => {
    try {
      if (!editingRate) return;
      await courierRateService.updateRate(editingRate.id as number, rateData);
      setSuccess('Courier rate updated successfully!');
      setEditingRate(null);
      setShowForm(false);
      loadRates();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to update courier rate. Please try again.');
      console.error('Error updating rate:', err);
    }
  };

  const handleDeleteRate = async (id: number): Promise<void> => {
    if (window.confirm('Are you sure you want to delete this courier rate?')) {
      try {
        await courierRateService.deleteRate(id);
        setSuccess('Courier rate deleted successfully!');
        loadRates();
        setTimeout(() => setSuccess(''), 3000);
      } catch (err) {
        setError('Failed to delete courier rate. Please try again.');
        console.error('Error deleting rate:', err);
      }
    }
  };

  const handleEdit = (rate: CourierRate): void => {
    setEditingRate(rate);
    setShowForm(true);
  };

  const handleCancelEdit = (): void => {
    setEditingRate(null);
    setShowForm(false);
  };

  const handleAddNew = (): void => {
    setEditingRate(null);
    setShowForm(true);
  };

  const renderTabContent = (): React.ReactElement => {
    switch (activeTab) {
      case 'locations':
        return <LocationManagement />;
      case 'containers':
        return <ContainerManagement />;
      case 'rates':
      default:
        return (
          <>
            {!showForm ? (
              <>
                <div className="card">
                  <div className="card-header">
                    <h3>Courier Rates Management</h3>
                    <button
                      className="btn btn-primary"
                      onClick={handleAddNew}
                    >
                      Add New Rate
                    </button>
                  </div>
                </div>

                <CourierRateTable
                  rates={rates}
                  onEdit={handleEdit}
                  onDelete={handleDeleteRate}
                  isAdmin={true}
                />
              </>
            ) : (
              <CourierRateForm
                onSubmit={editingRate ? handleUpdateRate : handleCreateRate}
                initialData={editingRate}
                onCancel={handleCancelEdit}
              />
            )}
          </>
        );
    }
  };

  if (loading && activeTab === 'rates') {
    return <div className="loading">Loading courier rates...</div>;
  }

  return (
    <>
      <header className="header">
        <div className="container">
          <h1>Freight Quote Management System</h1>
        </div>
      </header>
      <main>
        <div className="page-header">
          <h2>🏢 Admin Dashboard</h2>
          <p>Manage freight system configuration and master data</p>
        </div>

        {error && (
          <div className="alert alert-error">
            {error}
          </div>
        )}

        {success && (
          <div className="alert alert-success">
            {success}
          </div>
        )}

        <div className="admin-tabs">
          <button
            className={`tab-button ${activeTab === 'rates' ? 'active' : ''}`}
            onClick={() => setActiveTab('rates')}
          >
            💰 Courier Rates
          </button>
          <button
            className={`tab-button ${activeTab === 'locations' ? 'active' : ''}`}
            onClick={() => setActiveTab('locations')}
          >
            📍 Locations
          </button>
          <button
            className={`tab-button ${activeTab === 'containers' ? 'active' : ''}`}
            onClick={() => setActiveTab('containers')}
          >
            📦 Container Types
          </button>
        </div>

        <div className="tab-content">
          {renderTabContent()}
        </div>
      </main>
    </>
  );
};

export default AdminDashboard;
