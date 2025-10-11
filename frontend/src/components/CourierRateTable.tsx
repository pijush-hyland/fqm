import React from 'react';
import type { CourierRate } from '../types';
import './CourierRateTable.css';

interface CourierRateTableProps {
  rates: CourierRate[];
  onEdit?: (rate: CourierRate) => void;
  onDelete?: (id: number) => void;
  isAdmin?: boolean;
}

const CourierRateTable: React.FC<CourierRateTableProps> = ({
  rates,
  onEdit = () => {},
  onDelete = () => {},
  isAdmin = true
}) => {
  const formatDate = (dateString: string): string => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString();
  };

  const formatCurrency = (amount: number, currency: string = 'INR'): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  const getStatusBadge = (effectiveFrom: string, effectiveTo: string): React.ReactElement => {
    const now = new Date();
    const from = new Date(effectiveFrom);
    const to = new Date(effectiveTo);
    
    if (now < from) {
      return <span className="badge badge-pending">Pending</span>;
    } else if (now > to) {
      return <span className="badge badge-expired">Expired</span>;
    }

    return <></>;
  };

  if (!rates || rates.length === 0) {
    return (
      <div className="card">
        <p className="text-center">No courier rates found.</p>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="table-responsive">
        <table className="table">
          <thead>
            <tr>
              <th>🏢 Courier Service</th>
              <th>🚚 Service Details</th>
              <th>💰 {isAdmin ? "Rate" : "Total Cost"}</th>
              <th>⏱️ Transit Time</th>
              <th>📦 Capacity</th>
              <th>📅 Status</th>
              {isAdmin && <th>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {rates.map((rate, index) => (
              // <tr key={rate.id} className={index === 0 ? 'best-option' : ''}>
              <tr key={rate.id}>
                <td>
                  <div className="courier-info">
                    <strong className="courier-name">{rate.courierName}</strong>
                    {/* {index === 0 && <span className="best-badge">🏆 Best Option</span>} */}
                  </div>
                </td>
                <td>
                  <div className="service-details">
                    <div className="route">
                      <span className="route-point">
                        {typeof rate.origin === 'string' ? rate.origin : rate.origin?.name || 'Unknown'}
                      </span>
                      <span className="route-arrow">→</span>
                      <span className="route-point">
                        {typeof rate.destination === 'string' ? rate.destination : rate.destination?.name || 'Unknown'}
                      </span>
                    </div>
                    <div className="service-type">
                      <span className={`service-badge ${rate.shippingType.toLowerCase()}`}>
                        {rate.shippingType === 'AIR' ? '✈️ Air Freight' : '🚢 Sea Freight'}
                      </span>
                      {rate.seaFreightMode && (
                        <span className={`container-badge ${rate.seaFreightMode.toLowerCase()}`}>
                          {rate.seaFreightMode}
                        </span>
                      )}
                      {rate.containerType && (
                        <span className={`container-type-badge`}>
                          {typeof rate.containerType === 'string' ? rate.containerType : rate.containerType?.name || 'Container'}
                        </span>
                      )}
                    </div>
                  </div>
                </td>
                <td>
                  <div className="cost-info">
                    <div className="main-cost">{formatCurrency(rate.rate, rate.currency)}</div>
                    <div className="cost-note">{isAdmin? "Shipping rate": "Total Cost"}</div>
                  </div>
                </td>
                <td>
                  <div className="transit-info">
                    {rate.transitDays ? (
                      <>
                        <div className="transit-days">{rate.transitDays} days</div>
                        <div className="transit-note">Estimated delivery</div>
                      </>
                    ) : (
                      <span className="no-data">Contact for details</span>
                    )}
                  </div>
                </td>
                <td>
                  <div className="capacity-info">
                    {rate.weightLimit ? (
                      <>
                        <div className="weight-limit">Max: {rate.weightLimit} KG</div>
                        <div className="capacity-note">Weight capacity</div>
                      </>
                    ) : (
                      <span className="no-data">Contact for limits</span>
                    )}
                  </div>
                </td>
                <td>
                  <div className="status-info">
                    <div className="status-badges">
                      {rate.effectiveFrom && rate.effectiveTo &&
                        getStatusBadge(rate.effectiveFrom, rate.effectiveTo)
                        || rate.isActive !== false ? (
                            <span className="badge badge-active">Active</span>
                            ) : (
                              <span className="badge badge-inactive">Inactive</span>
                            )
                      }
                    </div>
                    <div className="validity">
                      {rate.effectiveTo && `Valid until ${formatDate(rate.effectiveTo)}`}
                    </div>
                  </div>
                </td>
                {isAdmin && (
                  <td>
                    <div className="actions">
                      <button
                        className="btn btn-sm btn-primary"
                        onClick={() => onEdit(rate)}
                        title="Edit"
                      >
                        Edit
                      </button>
                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => rate.id && onDelete(rate.id)}
                        title="Delete"
                        disabled={!rate.id}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CourierRateTable;
