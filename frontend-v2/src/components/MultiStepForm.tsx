import { useState, useEffect, type ReactNode } from 'react';
import SimpleHorizontalProgressBar from './SimpleHorizontalProgressBar';

export interface StepConfig<TFormData> {
	id: string;
	title: string;
	component: (props: StepComponentProps<TFormData>) => ReactNode;
	validator?: (formData: TFormData) => ValidationResult;
	shouldSkip?: (formData: TFormData) => boolean;
}

export interface StepComponentProps<TFormData> {
	formData: TFormData;
	errors: Record<string, string>;
	onInputChange: <T extends keyof TFormData>(
		field: T | Partial<TFormData>,
		value?: TFormData[T],
		shouldValidate?: boolean
	) => void;
	hasAttemptedNext: boolean;
}

export interface ValidationResult {
	isValid: boolean;
	errors: Record<string, string>;
}

export interface MultiStepFormProps<TFormData> {
	title: string;
	subtitle: string;
	steps: StepConfig<TFormData>[];
	initialFormData: TFormData;
	onSubmit: (formData: TFormData) => Promise<void>;
	submitButtonText?: string;
	loadingText?: string;
	className?: string;
}

const MultiStepForm = <TFormData extends Record<string, any>>({
	title,
	subtitle,
	steps,
	initialFormData,
	onSubmit,
	submitButtonText = 'Submit',
	loadingText = 'Processing...',
	className = ''
}: MultiStepFormProps<TFormData>) => {
	const [currentStep, setCurrentStep] = useState(1);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [formData, setFormData] = useState<TFormData>(initialFormData);
	const [errors, setErrors] = useState<Record<string, string>>({});
	const [hasAttemptedNext, setHasAttemptedNext] = useState(false);

	// Filter out steps that should be skipped
	const activeSteps = steps.filter(step => !step.shouldSkip?.(formData));
	const totalSteps = activeSteps.length;
	const currentStepConfig = activeSteps[currentStep - 1];

	// Input handler with validation - supports both single field and multi-field updates
	const handleInputChange = <T extends keyof TFormData>(
		field: T | Partial<TFormData>,
		value?: TFormData[T],
		shouldValidate: boolean = true
	) => {
		let newFormData: TFormData;

		// Check if first parameter is a multi-field update (object) or single field (string/key)
		if (typeof field === 'object' && field !== null) {
			// Multi-field update: first parameter is an object with field-value pairs
			newFormData = { ...formData, ...field };
		} else {
			// Single field update: first parameter is field name, second is value
			if (value === undefined) {
				console.warn('Value is required for single field updates');
				return;
			}
			newFormData = { ...formData, [field]: value };
		}

		setFormData(newFormData);

		// Validate immediately if user has attempted to proceed or if explicitly requested
		if (shouldValidate && hasAttemptedNext && currentStepConfig.validator) {
			const validationResult = currentStepConfig.validator(newFormData);
			setErrors(validationResult.errors);
		}
	};

	// Validate current step
	const validateCurrentStep = (dataToValidate = formData): boolean => {
		if (!currentStepConfig.validator) {
			return true;
		}

		const validationResult = currentStepConfig.validator(dataToValidate);
		setErrors(validationResult.errors);
		return validationResult.isValid;
	};

	// Navigate to next step
	const handleNext = () => {
		setHasAttemptedNext(true);
		const isValid = validateCurrentStep();

		if (isValid) {
			if (currentStep < totalSteps) {
				setCurrentStep(currentStep + 1);
				setHasAttemptedNext(false);
				setErrors({});
			} else {
				handleSubmit();
			}
		}
	};

	// Navigate to previous step
	const handlePrev = () => {
		if (currentStep > 1) {
			setCurrentStep(currentStep - 1);
			setErrors({});
			setHasAttemptedNext(false);
		}
	};

	// Submit form
	const handleSubmit = async () => {
		setHasAttemptedNext(true);

		// Validate all steps
		const allValid = activeSteps.every(step => {
			if (!step.validator) return true;
			const validationResult = step.validator(formData);
			if (!validationResult.isValid) {
				setErrors(prev => ({ ...prev, ...validationResult.errors }));
			}
			return validationResult.isValid;
		});

		if (!allValid) {
			return;
		}

		setIsSubmitting(true);

		try {
			await onSubmit(formData);
		} catch (error) {
			console.error('Form submission error:', error);
			// Handle error appropriately
		} finally {
			setIsSubmitting(false);
		}
	};

	// Auto-skip steps when form data changes
	useEffect(() => {
		const newActiveSteps = steps.filter(step => !step.shouldSkip?.(formData));

		// If current step should now be skipped, find next valid step
		if (newActiveSteps.length !== activeSteps.length) {
			const currentStepId = activeSteps[currentStep - 1]?.id;
			const newStepIndex = newActiveSteps.findIndex(step => step.id === currentStepId);

			if (newStepIndex === -1) {
				// Current step is no longer valid, find the appropriate step
				setCurrentStep(Math.min(currentStep, newActiveSteps.length));
			}
		}
	}, [formData]);

	// Clear errors when step changes (unless user just attempted to proceed)
	useEffect(() => {
		if (!hasAttemptedNext) {
			setErrors({});
		}
	}, [currentStep, hasAttemptedNext]);

	return (
		<div className={`h-full py-8 ${className}`}>
			<div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
				{/* Header */}
				<div className="text-center mb-8">
					<h1 className="text-3xl font-bold text-gray-900 mb-2">{title}</h1>
					<p className="text-lg text-gray-600">{subtitle}</p>
				</div>

				{/* Progress Bar */}
				<SimpleHorizontalProgressBar
					currentStep={currentStep}
					totalSteps={totalSteps}
				/>

				{/* Form Content */}
				<div className="bg-white rounded-b-lg shadow-sm p-6">
					{currentStepConfig && currentStepConfig.component({
						formData,
						errors,
						onInputChange: handleInputChange,
						hasAttemptedNext
					})}
				{/* </div> */}

					{/* Navigation Buttons */}
					<div className="flex justify-between items-center">
						<button
							type="button"
							onClick={handlePrev}
							disabled={currentStep === 1}
							className={`flex items-center px-6 py-3 rounded-lg font-medium transition-colors ${currentStep === 1
									? 'bg-gray-100 text-gray-400 cursor-not-allowed'
									: 'bg-gray-200 text-gray-700 hover:bg-gray-300'
								}`}
						>
							<svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
							</svg>
							Previous
						</button>

						{/* <div className="text-sm text-gray-500">
							Step {currentStep} of {totalSteps}
						</div> */}

						<button
							type="button"
							onClick={handleNext}
							disabled={isSubmitting}
							className={`flex items-center px-6 py-3 rounded-lg font-medium transition-colors ${isSubmitting
									? 'bg-blue-400 cursor-not-allowed'
									: 'bg-blue-600 hover:bg-blue-700'
								} text-white`}
						>
							{isSubmitting ? (
								<>
									<div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
									{loadingText}
								</>
							) : currentStep === totalSteps ? (
								<>
									{submitButtonText}
									<svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
									</svg>
								</>
							) : (
								<>
									Next
									<svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
									</svg>
								</>
							)}
						</button>
					</div>
				</div>
			</div>
		</div>
	);
};

export default MultiStepForm;
