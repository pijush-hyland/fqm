import { useState, useEffect } from 'react';
import courierRateAPI from '../../apis/courierRateAPI';
import containerTypeAPI from '../../apis/containerTypeAPI';
import LocationSelector from '../../components/LocationSelector';
import { cargoTypeCategories } from '../../components/CargoTypeFormModular';
import type { courierRate, ShippingType, SeaFreightMode, CourierRatePayload } from '../../types/courierRate.type';
import type { ContainerType } from '../../types/container.type';

interface CourierRateFilters {
	courierName: string;
	shippingType: ShippingType | '';
	seaFreightMode: SeaFreightMode | '';
	origin: number | null;
	destination: number | null;
	isActive: boolean | null;
}

interface RateFormData extends Omit<courierRate, 'id' | 'origin' | 'destination' | 'effectiveFrom' | 'effectiveTo' | 'createdAt' | 'updatedAt'> {
	origin: number | null;
	destination: number | null;
	effectiveFrom: string;
	effectiveTo: string;
	cargoTypeCategory?: string;
	cargoType?: string;
	// Remove containerType as it's not needed for multi-container FCL
	// containerType?: ContainerType;
}

interface ValidationErrors {
	courierName?: string;
	origin?: string;
	destination?: string;
	effectiveFrom?: string;
	effectiveTo?: string;
	rate?: string;
	transitDays?: string;
	ratesForFCL?: string;
	cargoTypeCategory?: string;
	cargoType?: string;
}

const ErrorMessage = ({ error }: { error?: string }) => {
	if (!error) return null;
	return (
		<div className="text-red-500 text-sm mt-1 flex items-center">
			<svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
				<path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
			</svg>
			{error}
		</div>
	);
};

const CourierRatesAdmin = () => {
	const [rates, setRates] = useState<courierRate[]>([]);
	const [containerTypes, setContainerTypes] = useState<ContainerType[]>([]);
	const [loading, setLoading] = useState(false);
	const [showModal, setShowModal] = useState(false);
	const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
	const [selectedRate, setSelectedRate] = useState<courierRate | null>(null);
	const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
	const [showSuccessMessage, setShowSuccessMessage] = useState(false);

	const [filters, setFilters] = useState<CourierRateFilters>({
		courierName: '',
		shippingType: '',
		seaFreightMode: '',
		origin: null,
		destination: null,
		isActive: null
	});

	const [formData, setFormData] = useState<RateFormData>({
		courierName: '',
		origin: null,
		destination: null,
		shippingType: 'AIR',
		seaFreightMode: "LCL",
		effectiveFrom: '',
		effectiveTo: '',
		isActive: true,
		transitDays: 0,
		rate: 0,
		currency: 'INR',
		cargoTypeCategory: '',
		cargoType: ''
	});

	useEffect(() => {
		fetchRates();
		fetchContainerTypes();
	}, []);

	const fetchRates = async () => {
		setLoading(true);
		try {
			const response = await courierRateAPI.getAllRates();
			setRates(response || []);
		} catch (error) {
			console.error('Error fetching rates:', error);
		} finally {
			setLoading(false);
		}
	};

	const fetchContainerTypes = async () => {
		try {
			const response = await containerTypeAPI.getAll();
			setContainerTypes(response);
		} catch (error) {
			console.error('Error fetching container types:', error);
		}
	};

	const handleFilterChange = (field: keyof CourierRateFilters, value: any) => {
		setFilters(prev => ({ ...prev, [field]: value }));
	};

	const handleFormChange = (field: keyof RateFormData, value: any) => {
		setFormData(prev => ({ ...prev, [field]: value }));
		if(field === 'shippingType' && value === 'AIR') {
			// Reset seaFreightMode if shippingType is changed to AIR
			setFormData(prev => ({ ...prev, seaFreightMode: undefined, ratesForFCL: {} }));
		}else if(field === 'seaFreightMode' && value !== 'FCL') {
			// Reset ratesForFCL if seaFreightMode is changed from FCL to LCL or undefined
			setFormData(prev => ({ ...prev, ratesForFCL: {} }));
		}else if(field === 'seaFreightMode' && value === 'FCL') {
			// Reset single rate if seaFreightMode is changed to FCL
			setFormData(prev => ({ ...prev, rate: undefined }));
		}else if(field === 'shippingType' && value === 'WATER' && !formData.seaFreightMode) {
			// Reset single rate if shippingType is changed to WATER
			setFormData(prev => ({ ...prev, seaFreightMode: "LCL" }));
		}
		// Clear validation error when user starts typing
		if (validationErrors[field as keyof ValidationErrors]) {
			setValidationErrors(prev => ({ ...prev, [field]: undefined }));
		}
	};

	const validateForm = (): boolean => {
		const errors: ValidationErrors = {};

		// Courier Name validation
		if (!formData.courierName || formData.courierName.trim().length < 2) {
			errors.courierName = 'Courier name must be at least 2 characters long';
		} else if (formData.courierName.trim().length > 100) {
			errors.courierName = 'Courier name cannot exceed 100 characters';
		}

		// Origin validation
		if (!formData.origin) {
			errors.origin = 'Origin location is required';
		}

		// Destination validation
		if (!formData.destination) {
			errors.destination = 'Destination location is required';
		}

		// Same origin and destination validation
		if (formData.origin && formData.destination && formData.origin === formData.destination) {
			errors.destination = 'Destination must be different from origin';
		}

		// Effective From validation
		if (!formData.effectiveFrom) {
			errors.effectiveFrom = 'Effective from date is required';
		} else {
			const fromDate = new Date(formData.effectiveFrom);
			const today = new Date();
			today.setHours(0, 0, 0, 0);
			if (fromDate < today) {
				errors.effectiveFrom = 'Effective from date cannot be in the past';
			}
		}

		// Effective To validation
		if (!formData.effectiveTo) {
			errors.effectiveTo = 'Effective to date is required';
		}

		// Date range validation
		if (formData.effectiveFrom && formData.effectiveTo) {
			const fromDate = new Date(formData.effectiveFrom);
			const toDate = new Date(formData.effectiveTo);
			if (fromDate >= toDate) {
				errors.effectiveTo = 'Effective to date must be after effective from date';
			}
			// Check if the date range is reasonable (not more than 10 years)
			const maxDate = new Date(fromDate);
			maxDate.setFullYear(maxDate.getFullYear() + 10);
			if (toDate > maxDate) {
				errors.effectiveTo = 'Date range cannot exceed 10 years';
			}
		}

		// Rate validation - different logic for FCL vs other shipping types
		if (formData.shippingType === 'WATER' && formData.seaFreightMode === 'FCL') {
			// For FCL, validate ratesForFCL instead of single rate
			if (!formData.ratesForFCL || Object.keys(formData.ratesForFCL).length === 0) {
				errors.ratesForFCL = 'At least one container type rate is required for FCL shipping';
			} else {
				// Validate each rate in ratesForFCL
				const invalidRates = Object.entries(formData.ratesForFCL).filter(([_, rate]) => !rate || rate <= 0);
				if (invalidRates.length > 0) {
					errors.ratesForFCL = 'All container type rates must be greater than 0';
				}
				// Check for rates exceeding maximum
				const excessiveRates = Object.entries(formData.ratesForFCL).filter(([_, rate]) => rate > 999999.99);
				if (excessiveRates.length > 0) {
					errors.ratesForFCL = 'Container type rates cannot exceed 999,999.99';
				}
			}
		} else {
			// For non-FCL shipping, validate single rate
			if (!formData.rate || formData.rate <= 0) {
				errors.rate = 'Rate must be greater than 0';
			} else if (formData.rate > 999999.99) {
				errors.rate = 'Rate cannot exceed 999,999.99';
			}
		}

		// Transit Days validation
		if (formData.transitDays !== undefined && formData.transitDays < 0) {
			errors.transitDays = 'Transit days cannot be negative';
		} else if (formData.transitDays !== undefined && formData.transitDays > 365) {
			errors.transitDays = 'Transit days cannot exceed 365 days';
		}

		setValidationErrors(errors);
		return Object.keys(errors).length === 0;
	};

	const filteredRates = rates.filter(rate => {
		return (
			(!filters.courierName || rate.courierName.toLowerCase().includes(filters.courierName.toLowerCase())) &&
			(!filters.shippingType || rate.shippingType === filters.shippingType) &&
			(!filters.seaFreightMode || rate.seaFreightMode === filters.seaFreightMode) &&
			(filters.origin === null || rate.origin.id === filters.origin) &&
			(filters.destination === null || rate.destination.id === filters.destination) &&
			(filters.isActive === null || rate.isActive === filters.isActive)
		);
	});

	const openCreateModal = () => {
		setModalMode('create');
		setSelectedRate(null);
		setValidationErrors({});
		setFormData({
			courierName: '',
			origin: null,
			destination: null,
			shippingType: 'AIR',
			effectiveFrom: '',
			effectiveTo: '',
			isActive: true,
			transitDays: 0,
			rate: 0,
			ratesForFCL: {},
			currency: 'INR',
			cargoTypeCategory: '',
			cargoType: ''
		});
		setShowModal(true);
	};

	const openEditModal = (rate: courierRate) => {
		setModalMode('edit');
		setSelectedRate(rate);
		setValidationErrors({});
		setFormData({
			...rate,
			origin: rate.origin.id,
			destination: rate.destination.id,
			effectiveFrom: new Date(rate.effectiveFrom).toISOString().split('T')[0],
			effectiveTo: new Date(rate.effectiveTo).toISOString().split('T')[0],
			ratesForFCL: rate.ratesForFCL || {},
			cargoTypeCategory: '',
			cargoType: ''
		});
		setShowModal(true);
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		
		// Validate form before submission
		if (!validateForm()) {
			return;
		}

		setLoading(true);

		try {
			const submitData: CourierRatePayload = {
				...formData,
				effectiveFrom: new Date(formData.effectiveFrom),
				effectiveTo: new Date(formData.effectiveTo),
				origin: { id: formData.origin as number },
				destination: { id: formData.destination as number },
				ratesForFCL: formData.shippingType === 'WATER' && formData.seaFreightMode === 'FCL' ? formData.ratesForFCL : undefined,
			};

			if (modalMode === 'create') {
				await courierRateAPI.createRate(submitData);
			} else if (selectedRate) {
				await courierRateAPI.updateRate(selectedRate.id!.toString(), submitData);
			}

			setShowModal(false);
			setValidationErrors({});
			setShowSuccessMessage(true);
			setTimeout(() => setShowSuccessMessage(false), 3000);
			await fetchRates();
		} catch (error) {
			console.error('Error saving rate:', error);
		} finally {
			setLoading(false);
		}
	};

	const handleDelete = async (id: number) => {
		if (window.confirm('Are you sure you want to delete this rate?')) {
			setLoading(true);
			try {
				await courierRateAPI.deleteRate(id.toString());
				await fetchRates();
			} catch (error) {
				console.error('Error deleting rate:', error);
			} finally {
				setLoading(false);
			}
		}
	};

	const getLocationType = () => {
		if (formData.shippingType === 'WATER') {
			return "SEA_PORT";
		}
		return 'AIRPORT';
	};

	const renderConditionalFields = () => {
		if (formData.shippingType === 'WATER' && formData.seaFreightMode === 'FCL') {
			return (
				<div className="space-y-4">
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-2">Container Type Rates</label>
						<p className="text-sm text-gray-600 mb-3">
							Choose which container types to offer by setting their rates. Leave fields empty for container types you don't want to support.
						</p>
						<div className="space-y-3">
							{containerTypes.map((containerType) => {
								const hasRate = formData.ratesForFCL?.[containerType.id];
								return (
									<div 
										key={containerType.id} 
										className={`flex items-center space-x-3 p-3 rounded-lg border transition-colors ${
											hasRate 
												? 'bg-blue-50 border-blue-200' 
												: 'bg-gray-50 border-gray-200'
										}`}
									>
										<div className="flex-1">
											<div className="flex items-center space-x-2">
												<div className={`w-3 h-3 rounded-full ${
													hasRate ? 'bg-blue-500' : 'bg-gray-300'
												}`}></div>
												<label className={`text-sm font-medium ${
													hasRate ? 'text-blue-700' : 'text-gray-600'
												}`}>
													{containerType.name}
												</label>
											</div>
											<p className="text-xs text-gray-500 ml-5">
												{containerType.volumeCBM} CBM capacity, {containerType.maxGrossWeightKG}kg max weight
											</p>
										</div>
										<div className="flex-shrink-0">
											<input
												type="number"
												placeholder="Enter rate"
												value={formData.ratesForFCL?.[containerType.id] || ''}
												onChange={(e) => {
													const rate = e.target.value ? parseFloat(e.target.value) : undefined;
													const updatedRates = { ...formData.ratesForFCL };
													if (rate !== undefined && rate > 0) {
														updatedRates[containerType.id] = rate;
													} else {
														delete updatedRates[containerType.id];
													}
													handleFormChange('ratesForFCL', updatedRates);
												}}
												className={`w-36 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors ${
													validationErrors.ratesForFCL ? 'border-red-500 bg-red-50' : 
													hasRate ? 'border-blue-300 bg-white' : 'border-gray-300 bg-white'
												}`}
												min="0"
												step="0.01"
											/>
											{hasRate && (
												<button
													type="button"
													onClick={() => {
														const updatedRates = { ...formData.ratesForFCL };
														delete updatedRates[containerType.id];
														handleFormChange('ratesForFCL', updatedRates);
													}}
													className="ml-2 text-red-500 hover:text-red-700 text-sm"
													title="Remove this container type"
												>
													✕
												</button>
											)}
										</div>
									</div>
								);
							})}
						</div>
						<ErrorMessage error={validationErrors.ratesForFCL} />
						
						{/* Summary of enabled container types */}
						{formData.ratesForFCL && Object.keys(formData.ratesForFCL).length > 0 && (
							<div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
								<div className="flex items-start space-x-2">
									<div className="text-green-600 mt-0.5">✅</div>
									<div className="text-sm">
										<p className="font-medium text-green-800 mb-1">
											Enabled Container Types ({Object.keys(formData.ratesForFCL).length})
										</p>
										<div className="flex flex-wrap gap-2">
											{Object.entries(formData.ratesForFCL).map(([containerTypeId, rate]) => {
												const containerType = containerTypes.find(ct => ct.id.toString() === containerTypeId);
												return containerType ? (
													<span
														key={containerTypeId}
														className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800"
													>
														{containerType.name}: {formData.currency} {rate}
													</span>
												) : null;
											})}
										</div>
									</div>
								</div>
							</div>
						)}

						<div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
							<div className="flex items-start space-x-2">
								<div className="text-yellow-600 mt-0.5">💡</div>
								<div className="text-sm text-yellow-800">
									<p className="font-medium">Tip: Selective Container Support</p>
									<p>You have full control over which container types to offer:</p>
									<ul className="mt-1 ml-4 list-disc text-xs">
										<li>Enter a rate to enable that container type</li>
										<li>Leave empty or use the ✕ button to disable</li>
										<li>At least one container type must have a rate set</li>
									</ul>
								</div>
							</div>
						</div>
					</div>
				</div>
			);
		}
		return null;
	};

	const handleNumberChange = (
		e: React.ChangeEvent<HTMLInputElement>,
		field: keyof Pick<RateFormData, 'rate' | 'transitDays'>
	) => {
		const value = e.target.value;
		if (value === '') {
			handleFormChange(field, 0);
		} else {
			const numValue = parseFloat(value);
			if (!isNaN(numValue) && numValue >= 0) {
				handleFormChange(field, numValue);
			}
		}
	};

	return (
		<div className="max-w-7xl mx-auto p-6">
			{/* Success Message */}
			{showSuccessMessage && (
				<div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg mb-6 flex items-center">
					<svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
						<path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
					</svg>
					Rate {modalMode === 'create' ? 'created' : 'updated'} successfully!
				</div>
			)}

			{/* Header */}
			<div className="flex justify-between items-center mb-6 flex-row-reverse">
				{/* <h1 className="text-3xl font-bold text-gray-900">Courier Rate Management</h1> */}
				<button
					onClick={openCreateModal}
					className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center"
				>
					<svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
					</svg>
					Create New Rate
				</button>
			</div>

			{/* Horizontal Filter Section */}
			<div className="bg-white rounded-lg shadow-sm p-4 mb-6">
				<h2 className="text-lg font-semibold mb-4">Filters</h2>
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-2">Courier Name</label>
						<input
							type="text"
							placeholder="Search courier..."
							value={filters.courierName}
							onChange={(e) => handleFilterChange('courierName', e.target.value)}
							className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors border-gray-300"
						/>
					</div>
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-2">Shipping Type</label>
						<select
							value={filters.shippingType}
							onChange={(e) => handleFilterChange('shippingType', e.target.value)}
							className="w-full px-4 py-3 pr-10 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors border-gray-300 appearance-none bg-white"
						>
							<option value="">All</option>
							<option value="AIR">Air</option>
							<option value="WATER">Sea</option>
						</select>
					</div>
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-2">Sea Freight Mode</label>
						<select
							value={filters.seaFreightMode}
							onChange={(e) => handleFilterChange('seaFreightMode', e.target.value)}
							className="w-full px-4 py-3 pr-10 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors border-gray-300 appearance-none bg-white"
						>
							<option value="">All</option>
							<option value="FCL">FCL</option>
							<option value="LCL">LCL</option>
						</select>
					</div>
					<LocationSelector
						label="Origin"
						value={filters.origin}
						onChange={(value) => handleFilterChange('origin', value)}
						placeholder="Select origin"
						LocationType="AIRPORT"
					/>
					<LocationSelector
						label="Destination"
						value={filters.destination}
						onChange={(value) => handleFilterChange('destination', value)}
						placeholder="Select destination"
						LocationType="AIRPORT"
					/>
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
						<select
							value={filters.isActive === null ? '' : filters.isActive.toString()}
							onChange={(e) => handleFilterChange('isActive', e.target.value === '' ? null : e.target.value === 'true')}
							className="w-full px-4 py-3 pr-10 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors border-gray-300 appearance-none bg-white"
						>
							<option value="">All</option>
							<option value="true">Active</option>
							<option value="false">Inactive</option>
						</select>
					</div>
				</div>
			</div>

			{/* Rates List */}
			{loading ? (
				<div className="bg-white rounded-lg shadow-sm p-8 text-center">
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
					<p className="text-gray-600">Loading rates...</p>
				</div>
			) : (
				<div className="grid grid-cols-1 gap-4">
					{filteredRates.map((rate) => (
						<div key={rate.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
							<div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
								<div className="flex-1">
									<div className="flex items-center mb-2">
										<h3 className="text-lg font-semibold text-gray-900 mr-3">{rate.courierName}</h3>
										<span className={`px-2 py-1 text-xs font-medium rounded-full ${rate.shippingType === 'AIR'
											? 'bg-blue-100 text-blue-800'
											: 'bg-green-100 text-green-800'
											}`}>
											{rate.shippingType}
										</span>
										{rate.seaFreightMode && (
											<span className="ml-2 px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
												{rate.seaFreightMode}
											</span>
										)}
										<span className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${rate.isActive
											? 'bg-green-100 text-green-800'
											: 'bg-red-100 text-red-800'
											}`}>
											{rate.isActive ? 'Active' : 'Inactive'}
										</span>
									</div>

									<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-gray-600">
										<div>
											<span className="font-medium">Route:</span> {rate.origin.name} → {rate.destination.name}
										</div>
										{/* FCL rates display */}
										{rate.shippingType === 'WATER' && rate.seaFreightMode === 'FCL' && rate.ratesForFCL && Object.keys(rate.ratesForFCL).length > 0 ? (
											<div className="col-span-2">
												<span className="font-medium">Container Rates:</span>
												{/* <div className="flex flex-wrap gap-2 mt-1"> */}
													{Object.entries(rate.ratesForFCL).map(([containerTypeId, rateValue]) => {
														const containerType = containerTypes.find(ct => ct.id.toString() === containerTypeId);
														return containerType ? (
															<span
																key={containerTypeId}
																className="inline-flex items-center px-2 py-1 m-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
															>
																{containerType.name}: {rate.currency} {rateValue}
															</span>
														) : null;
													})}
												{/* </div> */}
											</div>
										) : (
											<div className="col-span-2">
												<span className="font-medium">Rate:</span>
												<span className="inline-flex items-center px-2 py-1 m-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">{rate.currency} {rate.rate || 'N/A'} </span>
											</div>
										)}
										{!!rate.transitDays && (
											<div>
												<span className="font-medium">Transit:</span> {rate.transitDays} days
											</div>
										)}
										<div>
											<div><span className="font-medium">From:</span> {new Date(rate.effectiveFrom).toLocaleDateString()}</div>
											<div><span className="font-medium">To:</span> {new Date(rate.effectiveTo).toLocaleDateString()}</div>
										</div>
									</div>
								</div>

								<div className="mt-4 lg:mt-0 lg:ml-6 flex space-x-2">
									<button
										onClick={() => openEditModal(rate)}
										className="bg-yellow-500 text-white px-3 py-1 rounded text-sm hover:bg-yellow-600"
									>
										Edit
									</button>
									<button
										onClick={() => handleDelete(rate.id!)}
										className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
									>
										Delete
									</button>
								</div>
							</div>
						</div>
					))}
					{filteredRates.length === 0 && (
						<div className="bg-white rounded-lg shadow-sm p-8 text-center">
							<p className="text-gray-500">No courier rates found matching your criteria.</p>
						</div>
					)}
				</div>
			)}

			{/* Modal for Create/Edit */}
			{showModal && (
				<div className="fixed inset-0 bg-gray-200/50 bg-opacity-50 flex items-center justify-center z-50 p-4">
					<div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
						<div className="p-6">
							<div className="flex justify-between items-center mb-6">
								<h2 className="text-2xl font-bold text-gray-900">
									{modalMode === 'create' ? 'Create New Rate' : 'Edit Rate'}
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

							<form onSubmit={handleSubmit} className="space-y-6">
								{/* Basic Information */}
								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									<div>
										<label className="block text-sm font-medium text-gray-700 mb-2">Courier Name *</label>
										<input
											type="text"
											
											value={formData.courierName}
											onChange={(e) => handleFormChange('courierName', e.target.value)}
											className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors ${
												validationErrors.courierName ? 'border-red-500 bg-red-50' : 'border-gray-300'
											}`}
										/>
										<ErrorMessage error={validationErrors.courierName} />
									</div>
									{!(formData.shippingType === 'WATER' && formData.seaFreightMode === 'FCL') && (<div>
										<label className="block text-sm font-medium text-gray-700 mb-2">Rate *</label>
										<input
											type="number"
											step="0.01"
											min="0.1"
											value={formData.rate}
											onChange={(e) => handleNumberChange(e, 'rate')}
											className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors ${
												validationErrors.rate ? 'border-red-500 bg-red-50' : 'border-gray-300'
											}`}
										/>
										<ErrorMessage error={validationErrors.rate} />
									</div>)}
								</div>

								{/* Shipping Type and Mode */}
								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									<div>
										<label className="block text-sm font-medium text-gray-700 mb-2">Shipping Type *</label>
										<select
											
											value={formData.shippingType}
											onChange={(e) => handleFormChange('shippingType', e.target.value)}
											className="w-full px-4 py-3 pr-10 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors border-gray-300 appearance-none bg-white"
										>
											<option value="AIR">Air Freight</option>
											<option value="WATER">Sea Freight</option>
										</select>
									</div>
									{formData.shippingType === 'WATER' && (
										<div>
											<label className="block text-sm font-medium text-gray-700 mb-2">Sea Freight Mode *</label>
											<select
												
												value={formData.seaFreightMode}
												onChange={(e) => handleFormChange('seaFreightMode', e.target.value)}
												className="w-full px-4 py-3 pr-10 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors border-gray-300 appearance-none bg-white"
											>
												<option value="LCL">Less Container Load (LCL)</option>
												<option value="FCL">Full Container Load (FCL)</option>
											</select>
										</div>
									)}
								</div>

								{/* Locations */}
								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									<div>
										<LocationSelector
											label="Origin *"
											value={formData.origin}
											onChange={(value) => handleFormChange('origin', value)}
											placeholder="Select origin"
											LocationType={getLocationType()}
										/>
										<ErrorMessage error={validationErrors.origin} />
									</div>
									<div>
										<LocationSelector
											label="Destination *"
											value={formData.destination}
											onChange={(value) => handleFormChange('destination', value)}
											placeholder="Select destination"
											LocationType={getLocationType()}
										/>
										<ErrorMessage error={validationErrors.destination} />
									</div>
								</div>

								{/* Dates */}
								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									<div>
										<label className="block text-sm font-medium text-gray-700 mb-2">Effective From *</label>
										<input
											type="date"
											
											value={formData.effectiveFrom}
											onChange={(e) => handleFormChange('effectiveFrom', e.target.value)}
											className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors ${
												validationErrors.effectiveFrom ? 'border-red-500 bg-red-50' : 'border-gray-300'
											}`}
										/>
										<ErrorMessage error={validationErrors.effectiveFrom} />
									</div>
									<div>
										<label className="block text-sm font-medium text-gray-700 mb-2">Effective To *</label>
										<input
											type="date"
											
											value={formData.effectiveTo}
											onChange={(e) => handleFormChange('effectiveTo', e.target.value)}
											className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors ${
												validationErrors.effectiveTo ? 'border-red-500 bg-red-50' : 'border-gray-300'
											}`}
										/>
										<ErrorMessage error={validationErrors.effectiveTo} />
									</div>
								</div>

								{/* Conditional Fields */}
								{renderConditionalFields()}

								{/* Cargo Type */}
								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									<div>
										<label className="block text-sm font-medium text-gray-700 mb-2">Cargo Category</label>
										<select
											value={formData.cargoTypeCategory}
											onChange={(e) => {
												handleFormChange('cargoTypeCategory', e.target.value);
												handleFormChange('cargoType', '');
											}}
											className={`w-full px-4 py-3 pr-10 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors appearance-none bg-white ${
												validationErrors.cargoTypeCategory ? 'border-red-500 bg-red-50' : 'border-gray-300'
											}`}
										>
											<option value="">Select category</option>
											{Object.keys(cargoTypeCategories).map((category) => (
												<option key={category} value={category}>{category}</option>
											))}
										</select>
										<ErrorMessage error={validationErrors.cargoTypeCategory} />
									</div>
									{formData.cargoTypeCategory && (
										<div>
											<label className="block text-sm font-medium text-gray-700 mb-2">Cargo Type</label>
											<select
												value={formData.cargoType}
												onChange={(e) => handleFormChange('cargoType', e.target.value)}
												className={`w-full px-4 py-3 pr-10 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors appearance-none bg-white ${
													validationErrors.cargoType ? 'border-red-500 bg-red-50' : 'border-gray-300'
												}`}
											>
												<option value="">Select type</option>
												{cargoTypeCategories[formData.cargoTypeCategory as keyof typeof cargoTypeCategories]?.map((type) => (
													<option key={type} value={type}>{type}</option>
												))}
											</select>
											<ErrorMessage error={validationErrors.cargoType} />
										</div>
									)}
								</div>

								{/* Additional Fields */}
								<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
									<div>
										<label className="block text-sm font-medium text-gray-700 mb-2">Transit Days</label>
										<input
											type="number"
											value={formData.transitDays}
											onChange={(e) => handleFormChange('transitDays', Number(e.target.value))}
											className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors ${
												validationErrors.transitDays ? 'border-red-500 bg-red-50' : 'border-gray-300'
											}`}
										/>
										<ErrorMessage error={validationErrors.transitDays} />
									</div>
									<div>
										<label className="block text-sm font-medium text-gray-700 mb-2">Currency</label>
										<select
											value={formData.currency}
											onChange={(e) => handleFormChange('currency', e.target.value)}
											className="w-full px-4 py-3 pr-10 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors border-gray-300 appearance-none bg-white"
										>
											<option value="INR">INR</option>
											<option value="USD">USD</option>
											<option value="EUR">EUR</option>
										</select>
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
										{loading ? 'Saving...' : modalMode === 'create' ? 'Create Rate' : 'Update Rate'}
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

export default CourierRatesAdmin;