import { useState, useEffect } from 'react';

interface NumberInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange' | 'type'> {
	value: number | undefined;
	onChange: (value: number | undefined) => void;
}

const NumberInput = ({ value, onChange, ...props }: NumberInputProps) => {
	const [display, setDisplay] = useState<string>(
		value !== undefined ? String(value) : ''
	);

	useEffect(() => {
		const current = display === '' ? undefined : parseFloat(display);
		if (current !== value) {
			setDisplay(value !== undefined ? String(value) : '');
		}
	}, [value]);

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const raw = e.target.value;
		setDisplay(raw);
		if (raw === '') {
			onChange(undefined);
		} else {
			const num = parseFloat(raw);
			if (!isNaN(num)) {
				onChange(num);
			}
		}
	};

	return <input type="number" value={display} onChange={handleChange} {...props} />;
};

export default NumberInput;
