import { useState } from 'react';
import CourierRatesAdmin from './CourierRatesAdmin';
import LocationsAdmin from './LocationsAdmin';

const AdminDashboard = () => {
	const [activeTab, setActiveTab] = useState<'rates' | 'locations'>('rates');

	return (
		<div className="max-w-7xl mx-auto p-6">
			{/* Tab Navigation */}
			<div className="border-b border-gray-200 mb-6">
				<nav className="-mb-px flex space-x-8">
					<button
						onClick={() => setActiveTab('rates')}
						className={`py-2 px-1 border-b-2 font-medium text-sm ${
							activeTab === 'rates'
								? 'border-blue-500 text-blue-600'
								: 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
						}`}
					>
						Courier Rates
					</button>
					<button
						onClick={() => setActiveTab('locations')}
						className={`py-2 px-1 border-b-2 font-medium text-sm ${
							activeTab === 'locations'
								? 'border-blue-500 text-blue-600'
								: 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
						}`}
					>
						Locations
					</button>
				</nav>
			</div>

			{/* Content based on active tab */}
			{activeTab === 'rates' && <CourierRatesAdmin />}
			{activeTab === 'locations' && <LocationsAdmin />}
		</div>
	);
};

export default AdminDashboard;
