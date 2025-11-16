import React, { useState, useEffect } from 'react';
import type { ContainerType } from '../types/container.type';
import type { StepComponentProps } from './MultiStepForm';
import type { QuoteFormData } from '../types/quoteForm.type';
import containerTypeAPI from '../apis/containerTypeAPI';

const ContainerDetailsFormModular: React.FC<StepComponentProps<QuoteFormData>> = ({
	formData,
	errors,
	onInputChange
}) => {
	const [containerTypes, setContainerTypes] = useState<ContainerType[]>([]);
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		fetchContainerTypes();
	}, []);

	const fetchContainerTypes = async () => {
		setLoading(true);
		try {
			const response = await containerTypeAPI.getAll();
			setContainerTypes(response);
		} catch (error) {
			console.error('Error fetching container types:', error);
		} finally {
			setLoading(false);
		}
	};

	const handleContainerCountChange = (containerTypeId: string | number, count: number) => {
		const newContainerCount = { ...formData.containerCount };
		const numericId = typeof containerTypeId === 'string' ? parseInt(containerTypeId, 10) : containerTypeId;
		
		if (count === 0) {
			delete newContainerCount[numericId];
		} else {
			newContainerCount[numericId] = count;
		}
		
		onInputChange('containerCount', newContainerCount);
	};

	const getTotalContainers = () => {
		return Object.values(formData.containerCount).reduce((sum, count) => sum + count, 0);
	};

	const getSelectedContainerInfo = () => {
		const selected = containerTypes.filter(type => {
			const numericId = typeof type.id === 'string' ? parseInt(type.id, 10) : type.id;
			return formData.containerCount[numericId] && formData.containerCount[numericId] > 0;
		});
		
		return selected.map(type => {
			const numericId = typeof type.id === 'string' ? parseInt(type.id, 10) : type.id;
			return {
				...type,
				count: formData.containerCount[numericId]
			};
		});
	};

	if (loading) {
		return (
			<div className='mb-6'>
				<div className="flex items-center justify-center py-12">
					<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
					<span className="ml-3 text-gray-600">Loading container types...</span>
				</div>
			</div>
		);
	}

	return (
		<div className='mb-6'>
			<h3 className="text-xl font-semibold text-gray-800 mb-6">Container Selection</h3>
			
			{/* Container Types Grid */}
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
				{containerTypes.map((containerType) => (
					<div
						key={containerType.id}
						className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors"
					>
						<div className="mb-4">
							<h4 className="font-medium text-gray-900">{containerType.name}</h4>
							<p className="text-sm text-gray-600 mt-1">
								{(containerType.lengthMeters * 3.281).toFixed(1)}' × {(containerType.widthMeters * 3.281).toFixed(1)}' × {(containerType.heightMeters * 3.281).toFixed(1)}'
							</p>
							<p className="text-xs text-gray-500 mt-1">
								Max: {containerType.maxGrossWeightKG}kg, {containerType.volumeCBM} CBM
							</p>
						</div>
						
						<div className="flex items-center justify-between">
							<label htmlFor={`container-${containerType.id}`} className="text-sm font-medium text-gray-700">
								Quantity:
							</label>
							<div className="flex items-center space-x-2">
								<button
									type="button"
									onClick={() => {
										const numericId = typeof containerType.id === 'string' ? parseInt(containerType.id, 10) : containerType.id;
										handleContainerCountChange(
											containerType.id, 
											Math.max(0, (formData.containerCount[numericId] || 0) - 1)
										);
									}}
									className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 text-gray-600"
								>
									-
								</button>
								<input
									type="number"
									id={`container-${containerType.id}`}
									min="0"
									max="99"
									value={(() => {
										const numericId = typeof containerType.id === 'string' ? parseInt(containerType.id, 10) : containerType.id;
										return formData.containerCount[numericId] || 0;
									})()}
									onChange={(e) => {
										const count = parseInt(e.target.value, 10);
										if (!isNaN(count) && count >= 0) {
											handleContainerCountChange(containerType.id, count);
										}
									}}
									className="w-16 px-2 py-1 text-center border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
								/>
								<button
									type="button"
									onClick={() => {
										const numericId = typeof containerType.id === 'string' ? parseInt(containerType.id, 10) : containerType.id;
										handleContainerCountChange(
											containerType.id,
											(formData.containerCount[numericId] || 0) + 1
										);
									}}
									className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 text-gray-600"
								>
									+
								</button>
							</div>
						</div>
					</div>
				))}
			</div>

			{/* Error Message */}
			{errors.containerCount && (
				<div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
					<p className="text-sm text-red-600">{errors.containerCount}</p>
				</div>
			)}

			{/* Summary */}
			{getTotalContainers() > 0 && (
				<div className="mt-6 p-4 bg-gray-50 rounded-lg">
					<h4 className="font-medium text-gray-900 mb-2">Selection Summary</h4>
					<div className="space-y-2">
						{getSelectedContainerInfo().map((container) => (
							<div key={container.id} className="flex justify-between text-sm">
								<span className="text-gray-600">
									{container.count}× {container.name}
								</span>
								<span className="text-gray-500">
									{container.count * container.volumeCBM} CBM total
								</span>
							</div>
						))}
						<div className="border-t border-gray-200 pt-2 mt-2">
							<div className="flex justify-between font-medium text-gray-900">
								<span>Total Containers:</span>
								<span>{getTotalContainers()}</span>
							</div>
						</div>
					</div>
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

export default ContainerDetailsFormModular;
