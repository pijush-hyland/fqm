import { useState, useEffect } from 'react';
import locationAPI from '../../apis/locationAPI';
import type { Location, LocationType } from '../../types/location.type';
import type { LocationCreateRequest, LocationUpdateRequest } from '../../types/locationSearchCriteria.type';

interface LocationFilters {
	search: string;
	countryCode: string;
	type: LocationType | '';
	isActive: boolean | null;
}

interface LocationFormData extends Omit<LocationCreateRequest, 'isActive'> {
	isActive: boolean;
}

const LocationsAdmin = () => {
	const [locations, setLocations] = useState<Location[]>([]);
	const [loading, setLoading] = useState(false);
	const [showModal, setShowModal] = useState(false);
	const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
	const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
	const [countryCodes, setCountryCodes] = useState<string[]>([]);

	const [filters, setFilters] = useState<LocationFilters>({
		search: '',
		countryCode: '',
		type: '',
		isActive: null
	});

	const [formData, setFormData] = useState<LocationFormData>({
		name: '',
		code: '',
		country: '',
		countryCode: '',
		type: 'AIRPORT',
		isActive: true
	});

	useEffect(() => {
		fetchLocations();
		fetchCountryCodes();
	}, []);

	const fetchLocations = async () => {
		setLoading(true);
		try {
			const response = await locationAPI.getAllLocations(
				filters.search || undefined,
				filters.countryCode || undefined,
				filters.type || undefined
			);
			setLocations(response || []);
		} catch (error) {
			console.error('Error fetching locations:', error);
		} finally {
			setLoading(false);
		}
	};

	const fetchCountryCodes = async () => {
		try {
			const response = await locationAPI.getCountryCodes();
			setCountryCodes(response || []);
		} catch (error) {
			console.error('Error fetching country codes:', error);
		}
	};

	const handleFilterChange = (field: keyof LocationFilters, value: any) => {
		setFilters(prev => ({ ...prev, [field]: value }));
	};

	const handleFormChange = (field: keyof LocationFormData, value: any) => {
		setFormData(prev => ({ ...prev, [field]: value }));
	};

	const filteredLocations = locations.filter(location => {
		return (
			(!filters.search || 
				location.name.toLowerCase().includes(filters.search.toLowerCase()) ||
				location.code.toLowerCase().includes(filters.search.toLowerCase()) ||
				location.country.toLowerCase().includes(filters.search.toLowerCase())
			) &&
			(!filters.countryCode || location.countryCode === filters.countryCode) &&
			(!filters.type || location.type === filters.type) &&
			(filters.isActive === null || location.isActive === filters.isActive)
		);
	});

	const openCreateModal = () => {
		setModalMode('create');
		setSelectedLocation(null);
		setFormData({
			name: '',
			code: '',
			country: '',
			countryCode: '',
			type: 'AIRPORT',
			isActive: true
		});
		setShowModal(true);
	};

	const openEditModal = (location: Location) => {
		setModalMode('edit');
		setSelectedLocation(location);
		setFormData({
			name: location.name,
			code: location.code,
			country: location.country,
			countryCode: location.countryCode,
			type: location.type,
			isActive: location.isActive
		});
		setShowModal(true);
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);

		try {
			const submitData: LocationCreateRequest | LocationUpdateRequest = {
				...formData
			};

			if (modalMode === 'create') {
				await locationAPI.createLocation(submitData);
			} else if (selectedLocation) {
				await locationAPI.updateLocation(selectedLocation.id, submitData);
			}

			setShowModal(false);
			await fetchLocations();
		} catch (error) {
			console.error('Error saving location:', error);
		} finally {
			setLoading(false);
		}
	};

	const handleDelete = async (id: number) => {
		if (window.confirm('Are you sure you want to delete this location?')) {
			setLoading(true);
			try {
				await locationAPI.deleteLocation(id);
				await fetchLocations();
			} catch (error) {
				console.error('Error deleting location:', error);
			} finally {
				setLoading(false);
			}
		}
	};

	const getLocationTypeDisplay = (type: LocationType) => {
		switch (type) {
			case 'SEA_PORT': return 'Sea Port';
			case 'AIRPORT': return 'Airport';
			case 'CITY': return 'City';
			case 'INLAND_PORT': return 'Inland Port';
			default: return type;
		}
	};

	const getLocationTypeColor = (type: LocationType) => {
		switch (type) {
			case 'SEA_PORT': return 'bg-blue-100 text-blue-800';
			case 'AIRPORT': return 'bg-green-100 text-green-800';
			case 'CITY': return 'bg-purple-100 text-purple-800';
			case 'INLAND_PORT': return 'bg-orange-100 text-orange-800';
			default: return 'bg-gray-100 text-gray-800';
		}
	};

	const applyFilters = async () => {
		await fetchLocations();
	};

	return (
		<div className="max-w-7xl mx-auto p-6">
			{/* Header */}
			<div className="flex justify-between items-center mb-6 flex-row-reverse">
				{/* <h1 className="text-3xl font-bold text-gray-900">Location Management</h1> */}
				<button
					onClick={openCreateModal}
					className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center"
				>
					<svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
					</svg>
					Add New Location
				</button>
			</div>

			{/* Filter Section */}
			<div className="bg-white rounded-lg shadow-sm p-4 mb-6">
				<h2 className="text-lg font-semibold mb-4">Filters</h2>
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
					<div>
						<label className="block text-xs font-medium text-gray-700 mb-2">Search</label>
						<input
							type="text"
							placeholder="Name, code, or country..."
							value={filters.search}
							onChange={(e) => handleFilterChange('search', e.target.value)}
							className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors border-gray-300"
						/>
					</div>
					<div>
						<label className="block text-xs font-medium text-gray-700 mb-2">Country Code</label>
						<select
							value={filters.countryCode}
							onChange={(e) => handleFilterChange('countryCode', e.target.value)}
							className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors border-gray-300"
						>
							<option value="">All Countries</option>
							{countryCodes.map((code) => (
								<option key={code} value={code}>{code}</option>
							))}
						</select>
					</div>
					<div>
						<label className="block text-xs font-medium text-gray-700 mb-2">Type</label>
						<select
							value={filters.type}
							onChange={(e) => handleFilterChange('type', e.target.value)}
							className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors border-gray-300"
						>
							<option value="">All Types</option>
							<option value="AIRPORT">Airport</option>
							<option value="SEA_PORT">Sea Port</option>
							<option value="CITY">City</option>
							<option value="INLAND_PORT">Inland Port</option>
						</select>
					</div>
					<div>
						<label className="block text-xs font-medium text-gray-700 mb-2">Status</label>
						<select
							value={filters.isActive === null ? '' : filters.isActive.toString()}
							onChange={(e) => handleFilterChange('isActive', e.target.value === '' ? null : e.target.value === 'true')}
							className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors border-gray-300"
						>
							<option value="">All Status</option>
							<option value="true">Active</option>
							<option value="false">Inactive</option>
						</select>
					</div>
					<div className="flex items-end">
						<button
							onClick={applyFilters}
							className="w-full px-4 py-3 border rounded-lg bg-gray-600 text-white hover:bg-gray-700"
						>
							Apply Filters
						</button>
					</div>
				</div>
			</div>

			{/* Locations List */}
			{loading ? (
				<div className="bg-white rounded-lg shadow-sm p-8 text-center">
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
					<p className="text-gray-600">Loading locations...</p>
				</div>
			) : (
				<div className="grid grid-cols-1 gap-4">
					{filteredLocations.map((location) => (
						<div key={location.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
							<div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
								<div className="flex-1">
									<div className="flex items-center mb-2">
										<h3 className="text-lg font-semibold text-gray-900 mr-3">{location.name}</h3>
										<span className={`px-2 py-1 text-xs font-medium rounded-full ${getLocationTypeColor(location.type)}`}>
											{getLocationTypeDisplay(location.type)}
										</span>
										<span className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${location.isActive
												? 'bg-green-100 text-green-800'
												: 'bg-red-100 text-red-800'
											}`}>
											{location.isActive ? 'Active' : 'Inactive'}
										</span>
									</div>

									<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-gray-600">
										<div>
											<span className="font-medium">Code:</span> {location.code}
										</div>
										<div>
											<span className="font-medium">Country:</span> {location.country} ({location.countryCode})
										</div>
										<div>
											<span className="font-medium">Type:</span> {getLocationTypeDisplay(location.type)}
										</div>
									</div>
								</div>

								<div className="mt-4 lg:mt-0 lg:ml-6 flex space-x-2">
									<button
										onClick={() => openEditModal(location)}
										className="bg-yellow-500 text-white px-3 py-1 rounded text-sm hover:bg-yellow-600"
									>
										Edit
									</button>
									<button
										onClick={() => handleDelete(location.id)}
										className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
									>
										Delete
									</button>
								</div>
							</div>
						</div>
					))}
					{filteredLocations.length === 0 && (
						<div className="bg-white rounded-lg shadow-sm p-8 text-center">
							<p className="text-gray-500">No locations found matching your criteria.</p>
						</div>
					)}
				</div>
			)}

			{/* Modal for Create/Edit */}
			{showModal && (
				<div className="fixed inset-0 bg-gray-200/50 bg-opacity-50 flex items-center justify-center z-50 p-4">
					<div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
						<div className="p-6">
							<div className="flex justify-between items-center mb-6">
								<h2 className="text-2xl font-bold text-gray-900">
									{modalMode === 'create' ? 'Add New Location' : 'Edit Location'}
								</h2>
								<button
									onClick={() => setShowModal(false)}
									className="text-gray-500 hover:text-gray-700"
								>
									<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
									</svg>
								</button>
							</div>

							<form onSubmit={handleSubmit} className="space-y-4">
								{/* Basic Information */}
								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									<div>
										<label className="block text-sm font-medium text-gray-700 mb-2">Location Name *</label>
										<input
											type="text"
											required
											value={formData.name}
											onChange={(e) => handleFormChange('name', e.target.value)}
											className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
											placeholder="e.g., Mumbai International Airport"
										/>
									</div>
									<div>
										<label className="block text-sm font-medium text-gray-700 mb-2">Code *</label>
										<input
											type="text"
											required
											value={formData.code}
											onChange={(e) => handleFormChange('code', e.target.value.toUpperCase())}
											className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
											placeholder="e.g., BOM"
										/>
									</div>
								</div>

								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									<div>
										<label className="block text-sm font-medium text-gray-700 mb-2">Country *</label>
										<input
											type="text"
											required
											value={formData.country}
											onChange={(e) => handleFormChange('country', e.target.value)}
											className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
											placeholder="e.g., India"
										/>
									</div>
									<div>
										<label className="block text-sm font-medium text-gray-700 mb-2">Country Code *</label>
										<input
											type="text"
											required
											maxLength={3}
											value={formData.countryCode}
											onChange={(e) => handleFormChange('countryCode', e.target.value.toUpperCase())}
											className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
											placeholder="e.g., IN"
										/>
									</div>
								</div>

								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									<div>
										<label className="block text-sm font-medium text-gray-700 mb-2">Location Type *</label>
										<select
											required
											value={formData.type}
											onChange={(e) => handleFormChange('type', e.target.value)}
											className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
										>
											<option value="AIRPORT">Airport</option>
											<option value="SEA_PORT">Sea Port</option>
											<option value="CITY">City</option>
											<option value="INLAND_PORT">Inland Port</option>
										</select>
									</div>
								</div>

								<div className="flex items-center">
									<label className="flex items-center">
										<input
											type="checkbox"
											checked={formData.isActive}
											onChange={(e) => handleFormChange('isActive', e.target.checked)}
											className="mr-2"
										/>
										<span className="text-sm font-medium text-gray-700">Active</span>
									</label>
								</div>

								{/* Submit Buttons */}
								<div className="flex justify-end space-x-3 pt-6">
									<button
										type="button"
										onClick={() => setShowModal(false)}
										className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
									>
										Cancel
									</button>
									<button
										type="submit"
										disabled={loading}
										className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
									>
										{loading ? 'Saving...' : modalMode === 'create' ? 'Create Location' : 'Update Location'}
									</button>
								</div>
							</form>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

export default LocationsAdmin;