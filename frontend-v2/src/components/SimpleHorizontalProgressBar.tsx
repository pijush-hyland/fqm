import React from 'react';

interface SimpleHorizontalProgressBarProps {
	currentStep: number;
	totalSteps: number;
}

const SimpleHorizontalProgressBar: React.FC<SimpleHorizontalProgressBarProps> = ({
	currentStep,
	totalSteps
}) => {
	const progressPercentage = (currentStep / totalSteps) * 100;

	return (
		<div className="w-full bg-gray-100/70 rounded-t-lg h-2 overflow-hidden">
			<div
				className="bg-blue-500 h-full transition-all duration-500 ease-out"
				style={{ width: `${progressPercentage}%` }}
			/>
		</div>
	);
};

export default SimpleHorizontalProgressBar;
