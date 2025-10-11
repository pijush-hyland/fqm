import React from 'react';
import type { StepComponentProps } from './MultiStepForm';
import type { QuoteFormData } from '../types/quoteForm.type';

// Define cargo type categories and their subcategories
export const cargoTypeCategories = {
	'General Cargo': [
		'Electronics',
		'Textiles & Clothing',
		'Furniture & Home Goods',
		'Books & Documents',
		'Sporting Goods',
		'Toys & Games',
		'Other General Cargo'
	],
	'Food & Beverages': [
		'Fresh Food',
		'Frozen Food',
		'Dry Food Products',
		'Beverages',
		'Perishable Goods',
		'Temperature Controlled'
	],
	'Industrial Goods': [
		'Machinery & Equipment',
		'Raw Materials',
		'Construction Materials',
		'Automotive Parts',
		'Tools & Hardware',
		'Metal Products'
	],
	'Chemicals & Hazardous': [
		'Non-Hazardous Chemicals',
		'Hazardous Materials (DG)',
		'Pharmaceuticals',
		'Cosmetics & Personal Care',
		'Cleaning Products'
	],
	'Bulk Cargo': [
		'Liquid Bulk',
		'Dry Bulk',
		'Grain & Agricultural',
		'Coal & Minerals',
		'Petroleum Products'
	],
	'Special Cargo': [
		'Oversized/Heavy Lift',
		'Refrigerated',
		'Live Animals',
		'Artwork & Antiques',
		'Medical Equipment',
		'Project Cargo'
	]
};

interface CargoTypeFormModularProps extends StepComponentProps<QuoteFormData> { }

const CargoTypeFormModular: React.FC<CargoTypeFormModularProps> = ({
	formData,
	errors,
	onInputChange
}) => {
	const handleCategoryChange = (category: string) => {
		onInputChange('cargoTypeCategory', category);
		// Reset cargo type when category changes
		if (formData.cargoType) {
			onInputChange('cargoType', '');
		}
	};

	const getAvailableCargoTypes = () => {
		if (!formData.cargoTypeCategory) return [];
		return cargoTypeCategories[formData.cargoTypeCategory as keyof typeof cargoTypeCategories] || [];
	};

	return (
		<div className="mb-6 flex flex-col gap-6">
			<div>
				<h3 className="text-xl font-semibold text-gray-800 mb-6">Cargo Type Information</h3>
				<p className="text-gray-600 mb-4">
					Please select the category and specific type of cargo you're shipping.
				</p>
			</div>

			<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
				{/* Cargo Category Selection */}
				<div>
					<label className="block text-sm font-medium text-gray-700 mb-2">
						Cargo Category *
					</label>
					<select
						value={formData.cargoTypeCategory}
						onChange={(e) => handleCategoryChange(e.target.value)}
						className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.cargoTypeCategory ? 'border-red-300' : 'border-gray-300'
							}`}
					>
						<option value="">Select cargo category...</option>
						{Object.keys(cargoTypeCategories).map((category) => (
							<option key={category} value={category}>
								{category}
							</option>
						))}
					</select>
					{errors.cargoTypeCategory && (
						<p className="mt-1 text-sm text-red-600">{errors.cargoTypeCategory}</p>
					)}
				</div>

				{/* Cargo Type Selection */}
				{formData.cargoTypeCategory && (
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-2">
							Specific Cargo Type *
						</label>
						<select
							value={formData.cargoType}
							onChange={(e) => onInputChange('cargoType', e.target.value)}
							className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.cargoType ? 'border-red-300' : 'border-gray-300'
								}`}
						>
							<option value="">Select cargo type...</option>
							{getAvailableCargoTypes().map((type) => (
								<option key={type} value={type}>
									{type}
								</option>
							))}
						</select>
						{errors.cargoType && (
							<p className="mt-1 text-sm text-red-600">{errors.cargoType}</p>
						)}
					</div>
				)}
			</div>

			{/* Information Panel */}
			{formData.cargoTypeCategory && (
				<div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded">
					<div className="flex">
						<div className="flex-shrink-0">
							<svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
								<path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
							</svg>
						</div>
						<div className="ml-3">
							<p className="text-sm text-blue-700">
								<strong>Selected Category:</strong> {formData.cargoTypeCategory}
								{formData.cargoType && (
									<>
										<br />
										<strong>Cargo Type:</strong> {formData.cargoType}
									</>
								)}
							</p>
							<p className="text-xs text-blue-600 mt-1">
								The cargo type helps us provide more accurate shipping quotes and ensure proper handling.
							</p>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

export default CargoTypeFormModular;
