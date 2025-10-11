import React, { useState, useEffect } from 'react';
import type { Location, LocationType } from '../types/location.type';
import locationAPI from '../apis/locationAPI';

interface LocationSelectorProps {
	label: string;
	value: number | null;
	onChange: (locationId: number| null) => void;
	placeholder?: string;
	error?: string;
	LocationType?: LocationType;
}

const LocationSelector: React.FC<LocationSelectorProps> = ({
	label,
	value,
	onChange,
	placeholder = "Search for a location...",
	error,
	LocationType
}) => {
	const [locations, setLocations] = useState<Location[]>([]);
	const [searchTerm, setSearchTerm] = useState('');
	const [isOpen, setIsOpen] = useState(false);
	const [loading, setLoading] = useState(false);
	const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
	const [isSelected, setIsSelected] = useState(false);

	useEffect(() => {
		if (searchTerm.length >= 2 && !isSelected ) {
			const timeoutId = setTimeout(() => {
				fetchLocations(searchTerm);
			}, 300);
			return () => clearTimeout(timeoutId);
		}
	}, [searchTerm]);

	useEffect(() => {
		if (value) {
			// Find the selected location details when value is set externally
			fetchLocationById(value);
		}
	}, [value, selectedLocation]);

	const fetchLocations = async (search: string) => {
		setLoading(true);
		try {
			const response = await locationAPI.getAllLocations(search, undefined, LocationType);
			setLocations(response);
		} catch (error) {
			console.error('Error fetching locations:', error);
			setLocations([]);
		} finally {
			setLoading(false);
		}
	};

	const fetchLocationById = async (locationId: number) => {
		if(isSelected) return;
		try {
			const response = await locationAPI.getLocationById(locationId);
			setSelectedLocation(response);
			setSearchTerm(response.name);
			setIsSelected(true);
		} catch (error) {
			console.error('Error fetching location by ID:', error);
		}
	};


	const handleLocationSelect = (location: Location) => {
		setLocations([location]);
		setSelectedLocation(location);
		setSearchTerm(location.name);
		setIsOpen(false);
		onChange(location.id);
		setIsSelected(true);
	};

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const newValue = e.target.value;
		onChange(null)
		setSearchTerm(newValue);
		setIsSelected(false)
		setIsOpen(true);
		if (newValue !== selectedLocation?.name) {
			setSelectedLocation(null);
		}
	};

	const handleInputFocus = () => {
		setIsOpen(true);
	};

	const handleInputBlur = () => {
		// Delay closing to allow for item selection
		setTimeout(() => setIsOpen(false), 500);
	};

	return (
		<div className="relative">
			<label className="block text-sm font-medium text-gray-700 mb-2">
				{label}
			</label>
			<div className="relative" onBlur={handleInputBlur}>
				<input
					type="text"
					value={searchTerm}
					onChange={handleInputChange}
					onFocus={handleInputFocus}
					placeholder={placeholder}
					className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors ${error ? 'border-red-500' : 'border-gray-300'
						}`}
				/>

				{loading && (
					<div className="absolute right-3 top-1/2 transform -translate-y-1/2">
						<div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
					</div>
				)}

				{/* Dropdown */}
				{isOpen && locations.length > 0 && (
					<div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
						{locations.map((location) => (
							<div
								key={location.id}
								onClick={() => handleLocationSelect(location)}
								className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
							>
								<div className="flex justify-between items-start">
									<div>
										<div className="font-medium text-gray-900">{location.name}</div>
										<div className="text-sm text-gray-600">
											{location.country} • {location.code}
										</div>
									</div>
									<div className="flex flex-col items-end text-xs text-gray-500">
										<span className="px-2 py-1 bg-gray-100 rounded">
											{location.type.replace('_', ' ')}
										</span>
										{location.code && (
											<span className="mt-1">{location.code}</span>
										)}
									</div>
								</div>
							</div>
						))}
					</div>
				)}

				{/* No results message */}
				{isOpen && searchTerm.length >= 2 && locations.length === 0 && !loading && (
					<div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg p-4">
						<div className="text-gray-500 text-center">
							No locations found for "{searchTerm}"
						</div>
					</div>
				)}
			</div>

			{error && (
				<p className="mt-1 text-sm text-red-600">{error}</p>
			)}
		</div>
	);
};

export default LocationSelector;
