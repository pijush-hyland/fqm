import React from 'react';
import type { StepComponentProps } from './MultiStepForm';
import type { QuoteFormData } from '../types/quoteForm.type';

const PackageDetailsForm: React.FC<StepComponentProps<QuoteFormData>> = ({
	formData,
	errors,
	onInputChange
}) => {
	const shippingType = formData.shippingType;
	const seaFreightMode = formData.seaFreightMode;

	const handleNumberChange = (
		e: React.ChangeEvent<HTMLInputElement>, 
		field: keyof Pick<QuoteFormData, 'numberOfPackages' | 'grossWeightKG' | 'volumeCBM'>
	) => {
		const value = e.target.value;
		if (value === '') {
			onInputChange(field, '');
		} else {
			const numValue = parseFloat(value);
			if (!isNaN(numValue) && numValue >= 0) {
				onInputChange(field, numValue);
			}
		}
	};

	return (
		<div className='mb-6'>
			<h3 className="text-xl font-semibold text-gray-800 mb-6">Package Details</h3>
			
			<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
				{/* Number of Packages */}
				<div>
					<label htmlFor="numberOfPackages" className="block text-sm font-medium text-gray-700 mb-2">
						Number of Packages *
					</label>
					<input
						type="number"
						id="numberOfPackages"
						value={formData.numberOfPackages || ''}
						onChange={(e) => handleNumberChange(e, 'numberOfPackages')}
						placeholder="e.g., 5"
						min="1"
						step="1"
						className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors ${
							errors.numberOfPackages ? 'border-red-500' : 'border-gray-300'
						}`}
					/>
					{errors.numberOfPackages && (
						<p className="mt-1 text-sm text-red-600">{errors.numberOfPackages}</p>
					)}
				</div>

				{/* Gross Weight */}
				<div>
					<label htmlFor="grossWeightKG" className="block text-sm font-medium text-gray-700 mb-2">
					Total Gross Weight (kg) *
					</label>
					<input
						type="number"
						id="grossWeightKG"
						value={formData.grossWeightKG || ''}
						onChange={(e) => handleNumberChange(e, 'grossWeightKG')}
						placeholder="e.g., 500"
						min="0.1"
						step="0.1"
						className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors ${
							errors.grossWeightKG ? 'border-red-500' : 'border-gray-300'
						}`}
					/>
					{errors.grossWeightKG && (
						<p className="mt-1 text-sm text-red-600">{errors.grossWeightKG}</p>
					)}
					<p className="mt-1 text-xs text-gray-500">
						Total weight including packaging
					</p>
				</div>

				{/* Volume */}
				<div>
					<label htmlFor="volumeCBM" className="block text-sm font-medium text-gray-700 mb-2">
					Total Volume (CBM) *
					</label>
					<input
						type="number"
						id="volumeCBM"
						value={formData.volumeCBM || ''}
						onChange={(e) => handleNumberChange(e, 'volumeCBM')}
						placeholder="e.g., 1.5"
						min="0.01"
						step="0.01"
						className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors ${
							errors.volumeCBM ? 'border-red-500' : 'border-gray-300'
						}`}
					/>
					{errors.volumeCBM && (
						<p className="mt-1 text-sm text-red-600">{errors.volumeCBM}</p>
					)}
					<p className="mt-1 text-xs text-gray-500">
						Cubic meters (length × width × height)
					</p>
				</div>
			</div>

			{/* Disclaimer */}
			{shippingType === 'AIR' && (
				<div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-start space-x-2">
					<span className="text-amber-500 mt-0.5 flex-shrink-0">⚠️</span>
					<p className="text-sm text-amber-800">Rates are applicable only for normal dimension cargo and not for odd dimensions and palletised cargo.</p>
				</div>
			)}
			{shippingType === 'WATER' && seaFreightMode === 'FCL' && (
				<div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-start space-x-2">
					<span className="text-amber-500 mt-0.5 flex-shrink-0">⚠️</span>
					<p className="text-sm text-amber-800">Rates are subject to local charges at both ends, and applicable for normal weight and non odd Cargo.</p>
				</div>
			)}
			{shippingType === 'WATER' && seaFreightMode === 'LCL' && (
				<div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-start space-x-2">
					<span className="text-amber-500 mt-0.5 flex-shrink-0">⚠️</span>
					<p className="text-sm text-amber-800">Rates are subject to changes if the difference between gross weight and volume weight ratio is abnormal.</p>
				</div>
			)}

			{/* Additional Information */}
			<div className="mt-8 p-4 bg-blue-50 rounded-lg">
				<h4 className="font-medium text-blue-900 mb-2">💡 Helpful Tips</h4>
				<ul className="text-sm text-blue-700 space-y-1">
					<li>• Include packaging materials in your weight calculation</li>
					<li>• For irregular shapes, use the dimensions of the smallest box that would contain your items</li>
					<li>• Volume affects pricing significantly - measure carefully</li>
				</ul>
			</div>
		</div>
	);
};

export default PackageDetailsForm;
