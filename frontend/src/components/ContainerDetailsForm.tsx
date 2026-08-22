import React, { useState, useEffect } from 'react';
import type { CustomerContainerOption } from '../types/container.type';
import type { StepComponentProps } from './MultiStepForm';
import type { QuoteFormData } from '../types/quoteForm.type';
import containerTypeAPI from '../apis/containerTypeAPI';
import FclContainerOptions from './FclContainerOptions';

const ContainerDetailsForm: React.FC<StepComponentProps<QuoteFormData>> = ({
	formData,
	errors,
	onInputChange
}) => {
	const [fclOptions, setFclOptions] = useState<CustomerContainerOption[]>([]);
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		fetchFclOptions();
	}, []);

	const fetchFclOptions = async () => {
		setLoading(true);
		try {
			const response = await containerTypeAPI.getCustomerOptions();
			setFclOptions(response);
		} catch (error) {
			console.error('Error fetching FCL container options:', error);
		} finally {
			setLoading(false);
		}
	};

	const handleContainerCountChange = (optionId: number, count: number) => {
		const newContainerCount = { ...formData.containerCount };
		
		if (count === 0) {
			delete newContainerCount[optionId];
		} else {
			newContainerCount[optionId] = count;
		}
		
		onInputChange('containerCount', newContainerCount);
	};

	if (loading) {
		return (
			<div className='mb-6'>
				<div className="flex items-center justify-center py-12">
					<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
					<span className="ml-3 text-gray-600">Loading FCL container options...</span>
				</div>
			</div>
		);
	}

	return (
		<div className='mb-6'>
			<h3 className="text-xl font-semibold text-gray-800 mb-6">Container Selection</h3>
			
			<FclContainerOptions
				options={fclOptions}
				quantities={formData.containerCount}
				onQuantityChange={handleContainerCountChange}
			/>

			{/* Error Message */}
			{errors.containerCount && (
				<div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
					<p className="text-sm text-red-600">{errors.containerCount}</p>
				</div>
			)}

			{/* Information Box */}
			<div className="mt-6 p-4 bg-blue-50 rounded-lg">
				<h4 className="font-medium text-blue-900 mb-2">📦 Container Selection Tips</h4>
				<ul className="text-sm text-blue-700 space-y-1">
					<li>• Choose containers based on your cargo volume and weight</li>
					<li>• 20' containers are ideal for heavy, dense cargo</li>
					<li>• 40' containers are better for light, voluminous cargo</li>
					<li>• High cube containers provide extra height for tall items</li>
				</ul>
			</div>
		</div>
	);
};

export default ContainerDetailsForm;
