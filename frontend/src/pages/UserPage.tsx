import React, { useState } from 'react';
import ShippingRequirementForm from '../components/ShippingRequirementForm';
import CourierRateTable from '../components/CourierRateTable';
import { courierRateService } from '../services/api';
import type { CourierRate, ShippingRequirement } from '../types';
import './UserPage.css';

interface Statistics {
  total: number;
  air: number;
  water: number;
  fcl: number;
  lcl: number;
  averageCost: string;
  minCost: string;
  maxCost: string;
}

const UserPage: React.FC = () => {
  const [matchingRates, setMatchingRates] = useState<CourierRate[]>([]);
  const [searchLoading, setSearchLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [hasSearched, setHasSearched] = useState<boolean>(false);
  const [currentRequirement, setCurrentRequirement] = useState<ShippingRequirement | null>(null);

  const handleRequirementSubmit = async (requirement: ShippingRequirement): Promise<void> => {
    try {
      setSearchLoading(true);
      setError('');
      
      // Convert form data to API format for simplified interface
      // const searchRequirement: ShippingRequirement = {
      //   origin: requirement.origin,
      //   destination: requirement.destination,
      //   shippingType: requirement.shippingType,
      //   seaFreightMode: requirement.seaFreightMode,
      //   shippingDate: requirement.readyDate, // Map readyDate to shippingDate
      //   numberOfPackages: parseInt(requirement.numberOfPackages),
      //   grossWeightKG: parseFloat(requirement.grossWeightKG),
      //   volumeCBM: requirement.volumeCBM ? parseFloat(requirement.volumeCBM) : undefined,
      //   // numberOfContainers: requirement.numberOfContainers ? parseInt(requirement.numberOfContainers) : undefined,
      //   maxTransitDays: requirement.maxTransitDays ? parseInt(requirement.maxTransitDays) : undefined
      // };
      
      // const response = await courierRateService.findMatchingRates(searchRequirement);
      const response = await courierRateService.findMatchingRates(requirement);
      setMatchingRates(response.data as CourierRate[]);
      setCurrentRequirement(requirement);
      setHasSearched(true);
    } catch (err) {
      setError('Failed to find matching rates. Please try again.');
      console.error('Error finding matches:', err);
    } finally {
      setSearchLoading(false);
    }
  };

  const getStatistics = (rates: CourierRate[]): Statistics => {
    const stats: Statistics = {
      total: rates.length,
      air: rates.filter(rate => rate.shippingType === 'AIR').length,
      water: rates.filter(rate => rate.shippingType === 'WATER').length,
      fcl: rates.filter(rate => rate.seaFreightMode === 'FCL').length,
      lcl: rates.filter(rate => rate.seaFreightMode === 'LCL').length,
      averageCost: '0',
      minCost: '0',
      maxCost: '0'
    };

    const costs = rates.map(rate => parseFloat(rate.rate.toString()));
    stats.averageCost = costs.length > 0 ? (costs.reduce((a, b) => a + b, 0) / costs.length).toFixed(2) : '0';
    stats.minCost = costs.length > 0 ? Math.min(...costs).toFixed(2) : '0';
    stats.maxCost = costs.length > 0 ? Math.max(...costs).toFixed(2) : '0';

    return stats;
  };

  const clearSearch = (): void => {
    setHasSearched(false);
    setMatchingRates([]);
    setCurrentRequirement(null);
    setError('');
  };

  const stats = getStatistics(matchingRates);

  return (
    <>
      <header className="header">
        <div className="container">
          <h1>Find Shipping Rates</h1>
        </div>
      </header>
      <main>
        <div className="page-header">
          <h2>🚛 Freight Quote Finder</h2>
          <p>Find the best shipping rates from multiple couriers</p>
        </div>

        {error && (
          <div className="alert alert-error">
            {error}
          </div>
        )}

        {/* Requirement Form */}
        {!hasSearched && (
          <ShippingRequirementForm
            onSubmit={handleRequirementSubmit}
            loading={searchLoading}
          />
        )}

        {/* Results */}
        {hasSearched && (
          <div>
            {/* Search Summary */}
            <div className="search-summary card">
              <div className="summary-header">
                <h3>🎯 Your Search Results</h3>
                <button className="btn btn-secondary" onClick={clearSearch}>
                  🔄 New Search
                </button>
              </div>
              
              {currentRequirement && (
                <div className="requirement-summary">
                  <div className="summary-grid">
                    <div className="summary-section">
                      <h5>📍 Route & Service</h5>
                      <p><strong>Route:</strong> Location ID {currentRequirement.origin} → Location ID {currentRequirement.destination}</p>
                      <p><strong>Mode:</strong> {currentRequirement.shippingType === 'AIR' ? '✈️ Air Freight' : '🚢 Sea Freight'}
                        {currentRequirement.seaFreightMode && ` (${currentRequirement.seaFreightMode})`}</p>
                      <p><strong>Ready Date:</strong> {currentRequirement.shippingDate}</p>
                    </div>
                    
                    <div className="summary-section">
                      <h5>📦 Cargo Details</h5>
                      <p><strong>Packages:</strong> {currentRequirement.numberOfPackages} pieces</p>
                      <p><strong>Weight:</strong> {currentRequirement.grossWeightKG} KG</p>
                      {currentRequirement.volumeCBM && <p><strong>Volume:</strong> {currentRequirement.volumeCBM} CBM</p>}
                    </div>
                    
                    {currentRequirement.numberOfContainers && (
                      <div className="summary-section">
                        <h5>🚛 Container</h5>
                        <p><strong>Quantity:</strong> {currentRequirement.numberOfContainers} container(s)</p>
                      </div>
                    )}
                    
                    <div className="summary-section">
                      <h5>⏱️ Constraints</h5>
                      {currentRequirement.maxTransitDays && (
                        <p><strong>Timeline:</strong> Max {currentRequirement.maxTransitDays} days</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Quick Stats */}
              {/* <div className="quick-stats">
                <div className="stat-item">
                  <span className="stat-number">{stats.total}</span>
                  <span className="stat-label">Options Found</span>
                </div>
                {stats.total > 0 && (
                  <>
                    <div className="stat-item">
                      <span className="stat-number">${stats.minCost}</span>
                      <span className="stat-label">Best Price</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-number">${stats.averageCost}</span>
                      <span className="stat-label">Average</span>
                    </div>
                  </>
                )}
              </div> */}
            </div>

            {/* Results Table */}
            {matchingRates.length > 0 ? (
              <CourierRateTable
                rates={matchingRates}
                onEdit={() => {}}
                onDelete={() => {}}
                isAdmin={false}
              />
            ) : (
              <div className="card">
                <div className="no-results">
                  <h4>😔 No matching options found</h4>
                  <p>Try adjusting your requirements:</p>
                  <ul>
                    <li>Increase your budget limit</li>
                    {/* <li>Extend the maximum transit days</li> */}
                    <li>Try different origin/destination</li>
                    <li>Consider different transport mode</li>
                  </ul>
                  <button className="btn btn-primary" onClick={clearSearch}>
                    🔄 Try New Search
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

      </main>
    </>
  );
};

export default UserPage;
