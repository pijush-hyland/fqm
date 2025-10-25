
import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import quoteAPI from '../apis/quoteAPI';
import LocationSelector from '../components/LocationSelector';
import type { QuoteRequirement } from '../types/quoteRequirement.type';
import type { QuoteFormData } from '../types/quoteForm.type';
import type { courierRate, ShippingType, SeaFreightMode } from '../types/courierRate.type';
import type { LocationType } from '../types/location.type';
import type { ContainerType } from '../types/container.type';
import { cargoTypeCategories } from '../components/CargoTypeFormModular';
import containerTypeAPI from '../apis/containerTypeAPI';

// Filter form data type (excludes maxTransitDays)
interface QuotationFilters extends Omit<QuoteFormData, 'maxTransitDays'> { }

const Quotations = () => {
	const location = useLocation();
	const navigate = useNavigate();
	const [quotations, setQuotations] = useState<courierRate[]>([]);
	const [loading, setLoading] = useState(false);
	const [showFilters, setShowFilters] = useState(false);
	const [containerTypes, setContainerTypes] = useState<ContainerType[]>([]);
	const [filters, setFilters] = useState<QuotationFilters>({
		origin: null,
		destination: null,
		shippingType: '',
		seaFreightMode: '',
		shippingDate: '',
		numberOfPackages: '',
		grossWeightKG: '',
		volumeCBM: '',
		containerCount: {},
		cargoTypeCategory: '',
		cargoType: ''
	});
	const [filterModified, setFilterModified] = useState(false);

	// Extract quote requirement from navigation state
	const quoteRequirement: QuoteRequirement | null = location.state?.quoteRequirement || null;

	useEffect(() => {
		// If no quote requirement, redirect to quote page
		if (!quoteRequirement) {
			navigate('/quote');
			return;
		}

		// Prepopulate filters with quote requirement data
		setFilters({
			origin: quoteRequirement.origin,
			destination: quoteRequirement.destination,
			shippingType: quoteRequirement.shippingType,
			seaFreightMode: quoteRequirement.seaFreightMode || '',
			shippingDate: quoteRequirement.shippingDate.toISOString().split('T')[0],
			numberOfPackages: quoteRequirement.numberOfPackages,
			grossWeightKG: quoteRequirement.grossWeightKG,
			volumeCBM: quoteRequirement.volumeCBM,
			containerCount: quoteRequirement.containerCount || {},
			cargoTypeCategory: quoteRequirement.cargoTypeCategory || '',
			cargoType: quoteRequirement.cargoType || ''
		});

		// Initial API call
		fetchQuotations(quoteRequirement);
		// Fetch container types for FCL filtering
		fetchContainerTypes();
	}, [quoteRequirement, navigate]);

	const fetchContainerTypes = async () => {
		try {
			const response = await containerTypeAPI.getAll();
			setContainerTypes(response);
		} catch (error) {
			console.error('Error fetching container types:', error);
		}
	};

	const fetchQuotations = async (requirement: QuoteRequirement) => {
		setLoading(true);
		try {
			const response = await quoteAPI.getQuoteByRequirement(requirement);
			setQuotations(response || []);
		} catch (error) {
			console.error('Error fetching quotations:', error);
			setQuotations([]);
		} finally {
			setLoading(false);
		}
	};

	const handleContainerCountChange = (containerTypeId: number, count: number) => {
		const newContainerCount = { ...filters.containerCount };
		const numericId = containerTypeId;

		if (count === 0) {
			delete newContainerCount[numericId];
		} else {
			newContainerCount[numericId] = count;
		}

		handleFilterChange('containerCount', newContainerCount);
	};

	const handleFilterChange = (field: keyof QuotationFilters, value: any) => {
		setFilterModified(true);
		setFilters(prev => ({
			...prev,
			[field]: value
		}));
	};

	const handleSearch = () => {
		if (!filters.origin || !filters.destination) return;

		const searchRequirement: QuoteRequirement = {
			origin: filters.origin,
			destination: filters.destination,
			shippingType: filters.shippingType as ShippingType,
			seaFreightMode: filters.seaFreightMode as SeaFreightMode || undefined,
			shippingDate: new Date(filters.shippingDate),
			numberOfPackages: filters.numberOfPackages as number,
			grossWeightKG: filters.grossWeightKG as number,
			volumeCBM: filters.volumeCBM as number,
			containerCount: Object.keys(filters.containerCount).length > 0 ? filters.containerCount : undefined,
			cargoTypeCategory: filters.cargoTypeCategory,
			cargoType: filters.cargoType
		};

		// Update navigation state with new search requirement
		navigate('/quotations', {
			state: {
				...location.state,
				quoteRequirement: searchRequirement
			},
			replace: true // Replace current history entry instead of adding new one
		});

		setFilterModified(false);
		fetchQuotations(searchRequirement);
	};

	const getLocationType = (): LocationType => {
		if (filters.shippingType === 'WATER') {
			return "SEA_PORT";
		}
		return 'AIRPORT';
	};

	const formatCurrency = (amount: number, currency: string = 'USD') => {
		return new Intl.NumberFormat('en-US', {
			style: 'currency',
			currency: currency
		}).format(amount);
	};

	const formatDate = (date: Date) => {
		return new Intl.DateTimeFormat('en-US', {
			year: 'numeric',
			month: 'short',
			day: 'numeric'
		}).format(new Date(date));
	};

	if (!quoteRequirement) {
		return null; // Component will redirect
	}

	return (
		<div className="max-w-7xl mx-auto p-4 lg:p-6">
			{/* Header */}
			<div className="mb-6">
				<div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
					<div>
						<h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
							Freight Quotations
						</h1>
						<p className="text-gray-600 mt-1">
							Compare rates from different carriers for your shipment
						</p>
					</div>
					<div className="mt-4 lg:mt-0">
						<button
							onClick={() => setShowFilters(!showFilters)}
							className="lg:hidden bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center"
						>
							<svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707v6.586a1 1 0 01-1.447.894l-4-2A1 1 0 019 18.586v-4.586a1 1 0 00-.293-.707L2.293 7.293A1 1 0 012 6.586V4z" />
							</svg>
							Filters
						</button>
					</div>
				</div>
			</div>

			<div className="lg:grid lg:grid-cols-4 lg:gap-6">
				{/* Filter Panel */}
				<div className={`lg:col-span-1 ${showFilters ? 'block' : 'hidden lg:block'}`}>
					<div className="bg-white rounded-lg shadow-sm p-6 mb-6 lg:mb-0">
						<h2 className="text-lg font-semibold text-gray-900 mb-4">Search Filters</h2>

						<div className="space-y-4">
							{/* Shipping Type */}
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">
									Shipping Type
								</label>
								<select
									value={filters.shippingType}
									onChange={(e) => handleFilterChange('shippingType', e.target.value)}
									className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
								>
									<option value="">Select type</option>
									<option value="AIR">Air Freight</option>
									<option value="WATER">Sea Freight</option>
								</select>
							</div>

							{/* Sea Freight Mode */}
							{filters.shippingType === 'WATER' && (
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-2">
										Sea Freight Mode
									</label>
									<select
										value={filters.seaFreightMode}
										onChange={(e) => handleFilterChange('seaFreightMode', e.target.value)}
										className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
									>
										<option value="">Select mode</option>
										<option value="FCL">Full Container Load (FCL)</option>
										<option value="LCL">Less Container Load (LCL)</option>
									</select>
								</div>
							)}

							{/* Locations */}
							<div className="space-y-4">
								<LocationSelector
									label="Origin"
									value={filters.origin}
									onChange={(value) => handleFilterChange('origin', value)}
									placeholder="Select origin"
									LocationType={getLocationType()}
								/>
								<LocationSelector
									label="Destination"
									value={filters.destination}
									onChange={(value) => handleFilterChange('destination', value)}
									placeholder="Select destination"
									LocationType={getLocationType()}
								/>
							</div>

							{/* Shipping Date */}
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">
									Shipping Date
								</label>
								<input
									type="date"
									value={filters.shippingDate}
									onChange={(e) => handleFilterChange('shippingDate', e.target.value)}
									className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
								/>
							</div>

							{/* Conditional Fields Based on Shipping Type */}
							{/* FCL Container Selection */}
							{filters.shippingType === 'WATER' && filters.seaFreightMode === 'FCL' && (
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-3">
										Container Selection
									</label>
									<div className="space-y-3">
										{containerTypes.map((containerType) => (
											<div key={containerType.id} className="flex items-center justify-between p-3 border border-gray-200 rounded">
												<div className="flex-1">
													<div className="text-sm font-medium text-gray-900">{containerType.name}</div>
													<div className="text-xs text-gray-500">
														{containerType.volumeCBM} CBM, {containerType.maxGrossWeightKG}kg max
													</div>
												</div>
												<div className="flex items-center space-x-2">
													<button
														type="button"
														onClick={() => {
															const numericId = containerType.id;
															const currentCount = filters.containerCount[numericId] || 0;
															handleContainerCountChange(containerType.id, Math.max(0, currentCount - 1));
														}}
														className="w-6 h-6 rounded border border-gray-300 flex items-center justify-center hover:bg-gray-50 text-sm"
													>
														-
													</button>
													<input
														type="number"
														min="0"
														max="99"
														value={(() => {
															const numericId = containerType.id;
															return filters.containerCount[numericId] || 0;
														})()}
														onChange={(e) => {
															const count = parseInt(e.target.value, 10);
															if (!isNaN(count) && count >= 0) {
																handleContainerCountChange(containerType.id, count);
															}
														}}
														className="w-12 px-1 py-1 text-center border border-gray-300 rounded text-sm"
													/>
													<button
														type="button"
														onClick={() => {
															const numericId = containerType.id;
															const currentCount = filters.containerCount[numericId] || 0;
															handleContainerCountChange(containerType.id, currentCount + 1);
														}}
														className="w-6 h-6 rounded border border-gray-300 flex items-center justify-center hover:bg-gray-50 text-sm"
													>
														+
													</button>
												</div>
											</div>
										))}
									</div>
								</div>
							)}

							{/* LCL and AIR Package Details */}
							{((filters.shippingType === 'WATER' && filters.seaFreightMode === 'LCL') || filters.shippingType === 'AIR') && (
								<div className="space-y-4">
									<div>
										<label className="block text-sm font-medium text-gray-700 mb-2">
											Number of Packages
										</label>
										<input
											type="number"
											value={filters.numberOfPackages}
											onChange={(e) => handleFilterChange('numberOfPackages', Number(e.target.value))}
											className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
										/>
									</div>
									<div>
										<label className="block text-sm font-medium text-gray-700 mb-2">
											Gross Weight (KG)
										</label>
										<input
											type="number"
											value={filters.grossWeightKG}
											onChange={(e) => handleFilterChange('grossWeightKG', Number(e.target.value))}
											className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
										/>
									</div>
									<div>
										<label className="block text-sm font-medium text-gray-700 mb-2">
											Volume (CBM)
										</label>
										<input
											type="number"
											step="0.01"
											value={filters.volumeCBM}
											onChange={(e) => handleFilterChange('volumeCBM', Number(e.target.value))}
											className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
										/>
									</div>
								</div>
							)}

							{/* Cargo Type Fields (for all shipping types) */}
							{filters.shippingType && (
								<div className="space-y-4">
									<div>
										<label className="block text-sm font-medium text-gray-700 mb-2">
											Cargo Category
										</label>
										<select
											value={filters.cargoTypeCategory}
											onChange={(e) => {
												handleFilterChange('cargoTypeCategory', e.target.value);
												// Reset cargo type when category changes
												if (filters.cargoType) {
													handleFilterChange('cargoType', '');
												}
											}}
											className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
										>
											<option value="">Select category</option>
											{Object.keys(cargoTypeCategories).map((category) => (
												<option key={category} value={category}>
													{category}
												</option>
											))}
										</select>
									</div>

									{filters.cargoTypeCategory && (
										<div>
											<label className="block text-sm font-medium text-gray-700 mb-2">
												Cargo Type
											</label>
											<select
												value={filters.cargoType}
												onChange={(e) => handleFilterChange('cargoType', e.target.value)}
												className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
											>
												<option value="">Select type</option>
												{cargoTypeCategories[filters.cargoTypeCategory as keyof typeof cargoTypeCategories]?.map((type) => (
													<option key={type} value={type}>
														{type}
													</option>
												))}
											</select>
										</div>
									)}
								</div>
							)}

							{/* Search Button */}
							<button
								onClick={handleSearch}
								disabled={!filters.origin || !filters.destination || loading || !filterModified}
								className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
							>
								{loading ? (
									<>
										<svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
											<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
											<path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
										</svg>
										Searching...
									</>
								) : (
									<>
										<svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
										</svg>
										Update Search
									</>
								)}
							</button>
						</div>
					</div>
				</div>

				{/* Quotations List */}
				<div className="lg:col-span-3">
					{loading ? (
						<div className="bg-white rounded-lg shadow-sm p-8 text-center">
							<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
							<p className="text-gray-600">Loading quotations...</p>
						</div>
					) : quotations.length === 0 ? (
						<div className="bg-white rounded-lg shadow-sm p-8 text-center">
							<div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
								<svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
								</svg>
							</div>
							<h3 className="text-lg font-medium text-gray-900 mb-2">No quotations found</h3>
							<p className="text-gray-600">Try adjusting your search criteria or check back later.</p>
						</div>
					) : (
						<div className="space-y-4">
							{quotations.map((quotation) => (
								<div key={quotation.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
									<div className="p-6">
										<div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
											<div className="flex-1">
												<div className="flex items-center mb-2">
													<h3 className="text-lg font-semibold text-gray-900 mr-3">
														{quotation.courierName}
													</h3>
													<span className={`px-2 py-1 text-xs font-medium rounded-full ${quotation.shippingType === 'AIR'
														? 'bg-blue-100 text-blue-800'
														: 'bg-green-100 text-green-800'
														}`}>
														{quotation.shippingType}
													</span>
													{quotation.seaFreightMode && (
														<span className="ml-2 px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
															{quotation.seaFreightMode}
														</span>
													)}
												</div>

												<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm text-gray-600">
													<div className="flex items-center">
														<svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
															<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
															<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
														</svg>
														<span>{quotation.origin.name} → {quotation.destination.name}</span>
													</div>
													{quotation.transitDays && (
														<div className="flex items-center">
															<svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
																<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
															</svg>
															<span>{quotation.transitDays} days</span>
														</div>
													)}
													<div className="flex items-center">
														<svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
															<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
														</svg>
														<span>Valid until {formatDate(quotation.effectiveTo)}</span>
													</div>
												</div>

												{!!quotation.description && (
													<p className="mt-3 text-sm text-gray-600">
														{quotation.description}
													</p>
												)}
											</div>

											<div className="mt-4 lg:mt-0 lg:ml-6 text-right">
												<div className="text-2xl font-bold text-green-600 mb-1">
													{formatCurrency(quotation.rate as number, quotation.currency)}
												</div>
												{/* {quotation.minimumCharge && (
													<div className="text-sm text-gray-600">
														Min: {formatCurrency(quotation.minimumCharge, quotation.currency)}
													</div>
												)} */}
												<button className="mt-3 bg-blue-600 disabled:bg-gray-400 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-sm font-medium" disabled>
													Select Quote
												</button>
											</div>
										</div>

										{/* Additional fees section */}
										{(!!quotation.fuelSurcharge || !!quotation.securitySurcharge || !!quotation.documentationFee) && (
											<div className="mt-4 pt-4 border-t border-gray-200">
												<div className="flex flex-wrap gap-4 text-xs text-gray-600">
													{quotation.fuelSurcharge && (
														<span>Fuel Surcharge: {formatCurrency(quotation.fuelSurcharge, quotation.currency)}</span>
													)}
													{quotation.securitySurcharge && (
														<span>Security: {formatCurrency(quotation.securitySurcharge, quotation.currency)}</span>
													)}
													{quotation.documentationFee && (
														<span>Documentation: {formatCurrency(quotation.documentationFee, quotation.currency)}</span>
													)}
												</div>
											</div>
										)}
									</div>
								</div>
							))}
						</div>
					)}
				</div>
			</div>
		</div>
	);
};

export default Quotations;