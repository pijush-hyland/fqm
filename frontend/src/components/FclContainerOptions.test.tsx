import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, test, vi } from 'vitest';
import FclContainerOptions from './FclContainerOptions';
import type { CustomerContainerOption } from '../types/container.type';

const options: CustomerContainerOption[] = [
  {
    id: 1,
    code: '20GP',
    name: '20 Standard',
    internalDimensionsMeters: { length: 5.895, width: 2.35, height: 2.392 },
    capacityCbm: 33,
    maximumCargoWeightKg: 28230,
  },
  {
    id: 3,
    code: '20OT',
    name: '20 Open Top',
    internalDimensionsMeters: null,
    capacityCbm: 62.5,
    maximumCargoWeightKg: 27320,
  },
  {
    id: 99,
    code: 'BROKEN',
    name: 'Unexpected option',
    internalDimensionsMeters: null,
    capacityCbm: null,
    maximumCargoWeightKg: 1000,
  },
];

test('renders authoritative metric details and explicit unavailable states', () => {
  render(
    <FclContainerOptions
      options={options}
      quantities={{}}
      locale="en-US"
      onQuantityChange={() => undefined}
    />,
  );

  const standard = screen.getByRole('group', { name: '20 Standard' });
  expect(Array.from(standard.querySelectorAll('p')).map((row) => row.textContent)).toEqual([
    'Internal dimensions: 5.895 × 2.35 × 2.392 m',
    'Capacity: 33 m³',
    'Maximum cargo weight: 28,230 kg',
  ]);
  expect(standard).toHaveTextContent('Internal dimensions: 5.895 × 2.35 × 2.392 m');
  expect(standard).toHaveTextContent('Capacity: 33 m³');
  expect(standard).toHaveTextContent('Maximum cargo weight: 28,230 kg');

  const openTop = screen.getByRole('group', { name: '20 Open Top' });
  expect(openTop).toHaveTextContent('Internal dimensions: Not available');
  expect(openTop).toHaveTextContent('Capacity: 62.5 m³');
  expect(openTop).toHaveTextContent('Maximum cargo weight: 27,320 kg');

  const invalid = screen.getByRole('group', { name: 'Unexpected option' });
  expect(invalid).toHaveTextContent('Details unavailable');
  expect(screen.getByLabelText('Unexpected option quantity')).toBeDisabled();
  expect(screen.getByRole('button', { name: 'Increase Unexpected option quantity' })).toBeDisabled();
});

test('changes valid quantities and reports Combined Capacity from source capacities', async () => {
  const user = userEvent.setup();
  const onQuantityChange = vi.fn();
  const { rerender } = render(
    <FclContainerOptions
      options={options}
      quantities={{ 1: 2, 3: 2 }}
      locale="en-US"
      onQuantityChange={onQuantityChange}
    />,
  );

  expect(screen.getByText('Combined Capacity (calculated): 191 m³')).toBeInTheDocument();
  await user.click(screen.getByRole('button', { name: 'Increase 20 Standard quantity' }));
  expect(onQuantityChange).toHaveBeenCalledWith(1, 3);
  await user.click(screen.getByRole('button', { name: 'Decrease 20 Standard quantity' }));
  expect(onQuantityChange).toHaveBeenCalledWith(1, 1);

  const quantity = screen.getByLabelText('20 Standard quantity');
  fireEvent.change(quantity, { target: { value: '4' } });
  expect(onQuantityChange).toHaveBeenCalledWith(1, 4);
  onQuantityChange.mockClear();
  fireEvent.change(quantity, { target: { value: '1.5' } });
  expect(onQuantityChange).not.toHaveBeenCalled();

  rerender(
    <FclContainerOptions
      options={options}
      quantities={{ 1: 1, 3: 1 }}
      locale="en-US"
      onQuantityChange={onQuantityChange}
    />,
  );
  expect(screen.getByText('Combined Capacity (calculated): 95.5 m³')).toBeInTheDocument();
  expect(screen.getByRole('group', { name: '20 Standard' })).toHaveTextContent('Capacity: 33 m³');
});

test('clears a preselected invalid option while keeping its controls disabled', () => {
  const onQuantityChange = vi.fn();
  render(
    <FclContainerOptions
      options={options}
      quantities={{ 99: 2 }}
      locale="en-US"
      onQuantityChange={onQuantityChange}
    />,
  );

  expect(onQuantityChange).toHaveBeenCalledWith(99, 0);
  expect(screen.getByLabelText('Unexpected option quantity')).toBeDisabled();
  expect(screen.queryByText(/Combined Capacity/)).not.toBeInTheDocument();
});