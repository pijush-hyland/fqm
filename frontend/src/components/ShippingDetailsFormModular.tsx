import React from 'react';
import type { ShippingType, SeaFreightMode } from '../types/courierRate.type';
import type { StepComponentProps } from './MultiStepForm';
import type { QuoteFormData } from '../types/quoteForm.type';

const ShippingDetailsFormModular: React.FC<StepComponentProps<QuoteFormData>> = ({
	formData,
	errors,
	onInputChange
}) => {
	const shippingTypes: { value: ShippingType; label: string; description: string }[] = [
		{ value: 'AIR', label: 'Air Freight', description: 'Fast delivery via air transport' },
		{ value: 'WATER', label: 'Sea Freight', description: 'Cost-effective ocean shipping' }
	];

	const seaFreightModes: { value: SeaFreightMode; label: string; description: string }[] = [
		{ value: 'FCL', label: 'Full Container Load (FCL)', description: 'Exclusive use of entire container' },
		{ value: 'LCL', label: 'Less than Container Load (LCL)', description: 'Shared container space' }
	];

	const handleShippingTypeChange = (value: ShippingType) => {
		// onInputChange('shippingType', value);
		// Reset sea freight mode when shipping type changes
		onInputChange({
            seaFreightMode: '',
            shippingType: value,
            origin: null,
            destination: null
        });
		// onInputChange('seaFreightMode', '');
	};

	const handleSeaFreightModeChange = (value: SeaFreightMode) => {
		onInputChange('seaFreightMode', value);
	};

	const handleShippingDateChange = (value: string) => {
		onInputChange('shippingDate', value);
	};

	// const handleMaxTransitDaysChange = (e: React.ChangeEvent<HTMLInputElement>) => {
	// 	const value = e.target.value;
	// 	if (value === '') {
	// 		onInputChange('maxTransitDays', '');
	// 	} else {
	// 		const numValue = parseInt(value, 10);
	// 		if (!isNaN(numValue) && numValue >= 0) {
	// 			onInputChange('maxTransitDays', numValue);
	// 		}
	// 	}
	// };

	return (
		<div className='mb-6'>
			<h3 className="text-xl font-semibold text-gray-800 mb-6">Shipping Details</h3>

			<div className="space-y-6">
				{/* Shipping Type Selection */}
				<div>
					<label className="block text-sm font-medium text-gray-700 mb-3">
						Shipping Type *
					</label>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						{shippingTypes.map((type) => (
							<div
								key={type.value}
								onClick={() => handleShippingTypeChange(type.value)}
								className={`border-2 p-4 cursor-pointer transition-colors rounded-lg ${
									formData.shippingType === type.value
										? 'border-blue-500 bg-blue-50'
										: 'border-gray-200 hover:border-gray-300'
								}`}
							>
								<div className="flex items-center space-x-3">
									<input
										type="radio"
										name="shippingType"
										value={type.value}
										checked={formData.shippingType === type.value}
										// onChange={() => handleShippingTypeChange(type.value)}
										className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
									/>
									<div>
										<div className="font-medium text-gray-900">{type.label}</div>
										<div className="text-sm text-gray-600">{type.description}</div>
									</div>
								</div>
							</div>
						))}
					</div>
					{errors.shippingType && (
						<p className="mt-1 text-sm text-red-600">{errors.shippingType}</p>
					)}
				</div>

				{/* Sea Freight Mode Selection (only show if Sea is selected) */}
				{formData.shippingType === 'WATER' && (
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-3">
							Sea Freight Mode *
						</label>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							{seaFreightModes.map((mode) => (
								<div
									key={mode.value}
									onClick={() => handleSeaFreightModeChange(mode.value)}
									className={`border-2 rounded-lg p-4 cursor-pointer transition-colors ${
										formData.seaFreightMode === mode.value
											? 'border-blue-500 bg-blue-50'
											: 'border-gray-200 hover:border-gray-300'
									}`}
								>
									<div className="flex items-center space-x-3">
										<input
											type="radio"
											name="seaFreightMode"
											value={mode.value}
											checked={formData.seaFreightMode === mode.value}
											// onChange={() => handleSeaFreightModeChange(mode.value)}
											className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
										/>
										<div>
											<div className="font-medium text-gray-900">{mode.label}</div>
											<div className="text-sm text-gray-600">{mode.description}</div>
										</div>
									</div>
								</div>
							))}
						</div>
						{errors.seaFreightMode && (
							<p className="mt-1 text-sm text-red-600">{errors.seaFreightMode}</p>
						)}
					</div>
				)}

				{/* Shipping Date */}
				<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
					<div>
						<label htmlFor="shippingDate" className="block text-sm font-medium text-gray-700 mb-2">
							Preferred Shipping Date *
						</label>
						<input
							type="date"
							id="shippingDate"
							value={formData.shippingDate}
							onChange={(e) => handleShippingDateChange(e.target.value)}
							min={new Date().toISOString().split('T')[0]}
							className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors ${
								errors.shippingDate ? 'border-red-500' : 'border-gray-300'
							}`}
						/>
						{errors.shippingDate && (
							<p className="mt-1 text-sm text-red-600">{errors.shippingDate}</p>
						)}
					</div>

					{/* <div>
						<label htmlFor="maxTransitDays" className="block text-sm font-medium text-gray-700 mb-2">
							Maximum Transit Days
						</label>
						<input
							type="number"
							id="maxTransitDays"
							value={formData.maxTransitDays || ''}
							onChange={handleMaxTransitDaysChange}
							placeholder="e.g., 30"
							min="1"
							max="365"
							className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors ${
								errors.maxTransitDays ? 'border-red-500' : 'border-gray-300'
							}`}
						/>
						<p className="mt-1 text-xs text-gray-500">
							Leave blank for no time restriction
						</p>
						{errors.maxTransitDays && (
							<p className="mt-1 text-sm text-red-600">{errors.maxTransitDays}</p>
						)}
					</div> */}
				</div>
			</div>
		</div>
	);
};

export default ShippingDetailsFormModular;
