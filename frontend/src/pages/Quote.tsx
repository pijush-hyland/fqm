import { useNavigate, useSearchParams } from 'react-router-dom';
import MultiStepForm, {
	type StepConfig,
	type ValidationResult,
	type StepComponentProps
} from '../components/MultiStepForm';
import LocationSelector from '../components/LocationSelector';
import ShippingDetailsFormModular from '../components/ShippingDetailsFormModular';
import PackageDetailsFormModular from '../components/PackageDetailsFormModular';
import ContainerDetailsFormModular from '../components/ContainerDetailsFormModular';
import CargoTypeFormModular from '../components/CargoTypeFormModular';
import type { QuoteFormData } from '../types/quoteForm.type';
import type { QuoteRequirement } from '../types/quoteRequirement.type';
import type { ShippingType, SeaFreightMode } from '../types/courierRate.type';
import type { LocationType } from '../types/location.type';

const Quote = () => {
	const navigate = useNavigate();
	const [searchParams] = useSearchParams();

	// Extract shippingType from query parameters
	const shippingTypeParam = searchParams.get('shippingType') as ShippingType | null;

	// Initial form data
	const initialFormData: QuoteFormData = {
		origin: null,
		destination: null,
		shippingType: shippingTypeParam || '',
		seaFreightMode: '',
		shippingDate: '',
		numberOfPackages: '',
		grossWeightKG: '',
		volumeCBM: '',
		maxTransitDays: '',
		containerCount: {},
		cargoTypeCategory: '',
		cargoType: '',
	};

	// Validation functions
	const validateShippingDetails = (formData: QuoteFormData): ValidationResult => {
		const errors: Record<string, string> = {};

		if (!formData.shippingType) {
			errors.shippingType = 'Shipping type is required';
		}
		if (formData.shippingType === 'WATER' && !formData.seaFreightMode) {
			errors.seaFreightMode = 'Sea freight mode is required for water shipping';
		}
		if (!formData.shippingDate) {
			errors.shippingDate = 'Shipping date is required';
		} else {
			const selectedDate = new Date(formData.shippingDate);
			const today = new Date();
			today.setHours(0, 0, 0, 0);
			if (selectedDate < today) {
				errors.shippingDate = 'Shipping date cannot be in the past';
			}
		}

		return {
			isValid: Object.keys(errors).length === 0,
			errors
		};
	};

	const validateLocations = (formData: QuoteFormData): ValidationResult => {
		const errors: Record<string, string> = {};

		if (!formData.origin) {
			errors.origin = 'Origin location is required';
		}
		if (!formData.destination) {
			errors.destination = 'Destination location is required';
		}
		if (formData.origin === formData.destination && formData.origin) {
			errors.destination = 'Destination must be different from origin';
		}

		return {
			isValid: Object.keys(errors).length === 0,
			errors
		};
	};

	const validateContainers = (formData: QuoteFormData): ValidationResult => {
		const errors: Record<string, string> = {};
		const totalContainers = Object.values(formData.containerCount).reduce((sum, count) => sum + count, 0);

		if (totalContainers === 0) {
			errors.containerCount = 'At least one container is required for FCL shipping';
		}

		return {
			isValid: Object.keys(errors).length === 0,
			errors
		};
	};

	const validatePackages = (formData: QuoteFormData): ValidationResult => {
		const errors: Record<string, string> = {};

		if (!formData.numberOfPackages || formData.numberOfPackages <= 0) {
			errors.numberOfPackages = 'Number of packages must be at least 1';
		}
		if (!formData.grossWeightKG || formData.grossWeightKG <= 0) {
			errors.grossWeightKG = 'Gross weight must be greater than 0';
		}
		if (!formData.volumeCBM || formData.volumeCBM <= 0) {
			errors.volumeCBM = 'Volume must be greater than 0';
		}

		return {
			isValid: Object.keys(errors).length === 0,
			errors
		};
	};

	const validateCargoType = (formData: QuoteFormData): ValidationResult => {
		const errors: Record<string, string> = {};

		if (!formData.cargoTypeCategory) {
			errors.cargoTypeCategory = 'Cargo category is required';
		}
		if (!formData.cargoType) {
			errors.cargoType = 'Specific cargo type is required';
		}

		return {
			isValid: Object.keys(errors).length === 0,
			errors
		};
	};

	// Helper functions
	const getLocationType = (formData: QuoteFormData): LocationType => {
		if (formData.shippingType === 'WATER') {
			return "SEA_PORT";
		}
		return 'AIRPORT';
	};

	const shouldShowContainerStep = (formData: QuoteFormData): boolean => {
		return formData.shippingType !== 'WATER' || formData.seaFreightMode !== 'FCL';
	};

	const shouldShowPackageStep = (formData: QuoteFormData): boolean => {
		return formData.shippingType !== 'AIR' && formData.seaFreightMode !== 'LCL';
	};

	// Step components - using the modular compatible component
	const ShippingDetailsStep = (props: StepComponentProps<QuoteFormData>) => (
		<ShippingDetailsFormModular {...props} />
	);

	const LocationsStep = ({ formData, errors, onInputChange }: StepComponentProps<QuoteFormData>) => (
		<div className='mb-6'>
			<h3 className="text-xl font-semibold text-gray-800 mb-6">Select Locations</h3>
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
				<LocationSelector
					label="Origin Location"
					value={formData.origin}
					onChange={(value) => onInputChange('origin', value)}
					placeholder="Where are you shipping from?"
					error={errors.origin}
					LocationType={getLocationType(formData)}
				/>
				<LocationSelector
					label="Destination Location"
					value={formData.destination}
					onChange={(value) => onInputChange('destination', value)}
					placeholder="Where are you shipping to?"
					error={errors.destination}
					LocationType={getLocationType(formData)}
				/>
			</div>
		</div>
	);

	const ContainerStep = (props: StepComponentProps<QuoteFormData>) => (
		<ContainerDetailsFormModular {...props} />
	);

	const PackageStep = (props: StepComponentProps<QuoteFormData>) => (
		<PackageDetailsFormModular {...props} />
	);

	const CargoTypeStep = (props: StepComponentProps<QuoteFormData>) => (
		<CargoTypeFormModular {...props} />
	);

	const SummaryStep = ({ formData }: StepComponentProps<QuoteFormData>) => (
		<div className="bg-white shadow-sm rounded-lg p-8 text-center">
			<div className="max-w-md mx-auto">
				<div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
					<svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
					</svg>
				</div>
				<h3 className="text-xl font-semibold text-gray-900 mb-4">Ready to Find Quotes</h3>
				<p className="text-gray-600 mb-6">
					Your shipping requirements are complete. Click the button below to search for the best freight rates.
				</p>
				<div className="bg-gray-50 rounded-lg p-4 text-left">
					<h4 className="font-medium text-gray-900 mb-2">Quick Summary:</h4>
					<div className="text-sm text-gray-600 space-y-1">
						<div>• {formData.shippingType} shipping</div>
						{formData.seaFreightMode && <div>• {formData.seaFreightMode} mode</div>}
						<div>• {formData.numberOfPackages} package{formData.numberOfPackages !== 1 ? 's' : ''}</div>
						<div>• {formData.grossWeightKG} kg total weight</div>
						<div>• {formData.volumeCBM} CBM volume</div>
					</div>
				</div>
			</div>
		</div>
	);

	// Step configuration
	const steps: StepConfig<QuoteFormData>[] = [
		{
			id: 'shipping-details',
			title: 'Shipping Details',
			component: ShippingDetailsStep,
			validator: validateShippingDetails
		},
		{
			id: 'locations',
			title: 'Locations',
			component: LocationsStep,
			validator: validateLocations
		},
		{
			id: 'containers',
			title: 'Container Selection',
			component: ContainerStep,
			validator: validateContainers,
			shouldSkip: shouldShowContainerStep
		},
		{
			id: 'packages',
			title: 'Package Details',
			component: PackageStep,
			validator: validatePackages,
			shouldSkip: shouldShowPackageStep
		},
		{
			id: 'cargo-type',
			title: 'Cargo Type',
			component: CargoTypeStep,
			validator: validateCargoType
		},
	];

	// Form submission handler
	const handleSubmit = async (formData: QuoteFormData) => {
		// Prepare the quote requirement data
		const quoteRequirement: QuoteRequirement = {
			origin: formData.origin!,
			destination: formData.destination!,
			shippingType: formData.shippingType as ShippingType,
			seaFreightMode: formData.seaFreightMode as SeaFreightMode || undefined,
			shippingDate: new Date(formData.shippingDate),
			numberOfPackages: formData.numberOfPackages as number,
			grossWeightKG: formData.grossWeightKG as number,
			volumeCBM: formData.volumeCBM as number,
			maxTransitDays: formData.maxTransitDays as number || undefined,
			containerCount: Object.keys(formData.containerCount).length > 0 ? formData.containerCount : undefined,
			cargoTypeCategory: formData.cargoTypeCategory,
			cargoType: formData.cargoType
		};

		// Submit the quote request
		// const response = await quoteAPI.getQuoteByRequirement(quoteRequirement);

		// Navigate to quotation results page with the response data
		navigate('/quotations', {
			state: {
				quoteRequirement,
				// searchResults: response
			}
		});
	};

	return (
		<MultiStepForm<QuoteFormData>
			title="Get a Freight Quote"
			subtitle="Find the best shipping rates for your cargo in just a few steps"
			steps={steps}
			initialFormData={initialFormData}
			onSubmit={handleSubmit}
			submitButtonText="Get Quotes"
			loadingText="Searching..."
		/>
	);
};

export default Quote;
