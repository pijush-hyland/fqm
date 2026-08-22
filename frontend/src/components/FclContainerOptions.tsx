import { useEffect } from 'react';
import type { CustomerContainerOption, InternalDimensionsMeters } from '../types/container.type';

type FclContainerOptionsProps = {
	options: CustomerContainerOption[];
	quantities: Record<number, number>;
	onQuantityChange: (optionId: number, quantity: number) => void;
	locale?: string;
};

type ValidCustomerContainerOption = CustomerContainerOption & {
	capacityCbm: number;
	maximumCargoWeightKg: number;
};

const isPositiveNumber = (value: number | null): value is number =>
	typeof value === 'number' && Number.isFinite(value) && value > 0;

const hasValidDimensions = (dimensions: InternalDimensionsMeters | null) =>
	dimensions === null || (
		isPositiveNumber(dimensions.length)
		&& isPositiveNumber(dimensions.width)
		&& isPositiveNumber(dimensions.height)
	);

const isValidOption = (option: CustomerContainerOption): option is ValidCustomerContainerOption =>
	Number.isInteger(option.id)
	&& option.id > 0
	&& option.code.trim().length > 0
	&& option.name.trim().length > 0
	&& isPositiveNumber(option.capacityCbm)
	&& isPositiveNumber(option.maximumCargoWeightKg)
	&& hasValidDimensions(option.internalDimensionsMeters);

const formatMeasurement = (value: number, maximumFractionDigits: number, locale?: string) =>
	new Intl.NumberFormat(locale, { maximumFractionDigits }).format(value);

const FclContainerOptions = ({
	options,
	quantities,
	onQuantityChange,
	locale,
}: FclContainerOptionsProps) => {
	useEffect(() => {
		for (const option of options) {
			if (!isValidOption(option) && (quantities[option.id] ?? 0) > 0) {
				onQuantityChange(option.id, 0);
			}
		}
	}, [onQuantityChange, options, quantities]);

	const selectedOptions = options
		.filter(isValidOption)
		.filter((option) => (quantities[option.id] ?? 0) > 0);
	const totalContainers = selectedOptions.reduce((sum, option) => sum + quantities[option.id], 0);
	const combinedCapacity = selectedOptions.reduce(
		(sum, option) => sum + option.capacityCbm * quantities[option.id],
		0,
	);

	return (
		<>
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
				{options.map((option) => {
					const validOption = isValidOption(option) ? option : null;
					const valid = validOption !== null;
					const quantity = quantities[option.id] ?? 0;

					return (
						<section
							key={option.id}
							role="group"
							aria-label={option.name}
							className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors"
						>
							<div className="mb-4">
								<h4 className="font-medium text-gray-900">{option.name}</h4>
								{validOption ? (
									<div className="mt-2 space-y-1 text-sm text-gray-600">
										<p>
											Internal dimensions: {validOption.internalDimensionsMeters === null
												? 'Not available'
												: `${formatMeasurement(validOption.internalDimensionsMeters.length, 3, locale)} × ${formatMeasurement(validOption.internalDimensionsMeters.width, 3, locale)} × ${formatMeasurement(validOption.internalDimensionsMeters.height, 3, locale)} m`}
										</p>
										<p>Capacity: {formatMeasurement(validOption.capacityCbm, 2, locale)} m³</p>
										<p>Maximum cargo weight: {formatMeasurement(validOption.maximumCargoWeightKg, 0, locale)} kg</p>
									</div>
								) : (
									<p className="mt-2 text-sm font-medium text-red-700">Details unavailable</p>
								)}
							</div>

							<div className="flex items-center justify-between">
								<label htmlFor={`container-${option.id}`} className="text-sm font-medium text-gray-700">
									Quantity:
								</label>
								<div className="flex items-center space-x-2">
									<button
										type="button"
										aria-label={`Decrease ${option.name} quantity`}
										disabled={!valid || quantity === 0}
										onClick={() => onQuantityChange(option.id, Math.max(0, quantity - 1))}
										className="w-8 h-8 rounded-full border border-gray-300 disabled:opacity-40"
									>
										-
									</button>
									<input
										type="number"
										id={`container-${option.id}`}
										aria-label={`${option.name} quantity`}
										min="0"
										max="99"
										disabled={!valid}
										value={quantity}
										onChange={(event) => {
											const nextQuantity = Number(event.target.value);
											if (Number.isInteger(nextQuantity) && nextQuantity >= 0 && nextQuantity <= 99) {
												onQuantityChange(option.id, nextQuantity);
											}
										}}
										className="w-16 px-2 py-1 text-center border border-gray-300 rounded"
									/>
									<button
										type="button"
										aria-label={`Increase ${option.name} quantity`}
										disabled={!valid || quantity >= 99}
										onClick={() => onQuantityChange(option.id, quantity + 1)}
										className="w-8 h-8 rounded-full border border-gray-300 disabled:opacity-40"
									>
										+
									</button>
								</div>
							</div>
						</section>
					);
				})}
			</div>

			{totalContainers > 0 && (
				<div className="mt-6 p-4 bg-gray-50 rounded-lg">
					<h4 className="font-medium text-gray-900 mb-2">Selection Summary</h4>
					<p className="text-sm text-gray-700">
						Combined Capacity (calculated): {formatMeasurement(combinedCapacity, 2, locale)} m³
					</p>
					<p className="mt-2 text-sm font-medium text-gray-900">Total Containers: {totalContainers}</p>
				</div>
			)}
		</>
	);
};

export default FclContainerOptions;