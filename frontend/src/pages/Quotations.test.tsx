import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, expect, test, vi } from 'vitest';
import containerTypeAPI from '../apis/containerTypeAPI';
import quoteAPI from '../apis/quoteAPI';
import type { CustomerContainerOption } from '../types/container.type';
import Quotations from './Quotations';

vi.mock('../apis/containerTypeAPI', () => ({
  default: {
    getCustomerOptions: vi.fn(),
  },
}));

vi.mock('../apis/quoteAPI', () => ({
  default: {
    getQuoteByRequirement: vi.fn(),
  },
}));

vi.mock('../components/LocationSelector', () => ({
  default: ({ label }: { label: string }) => <div>{label}</div>,
}));

const options: CustomerContainerOption[] = [
  { id: 1, code: '20GP', name: '20 Standard', internalDimensionsMeters: { length: 5.895, width: 2.35, height: 2.392 }, capacityCbm: 33, maximumCargoWeightKg: 28230 },
  { id: 3, code: '40GP', name: '40 Standard', internalDimensionsMeters: { length: 12.029, width: 2.35, height: 2.392 }, capacityCbm: 60, maximumCargoWeightKg: 27000 },
  { id: 8, code: '20OT', name: '20 Open Top', internalDimensionsMeters: null, capacityCbm: 33, maximumCargoWeightKg: 27320 },
  { id: 4, code: '40HC', name: '40 High Cube', internalDimensionsMeters: { length: 12.024, width: 2.35, height: 2.697 }, capacityCbm: 67, maximumCargoWeightKg: 27000 },
  { id: 9, code: '40OT', name: '40 Open Top High', internalDimensionsMeters: null, capacityCbm: 62.5, maximumCargoWeightKg: 28500 },
  { id: 12, code: '20TK', name: '20 Feet Iso Tank', internalDimensionsMeters: null, capacityCbm: 24, maximumCargoWeightKg: 32200 },
];

const expectedDetails = [
  ['Internal dimensions: 5.895 × 2.35 × 2.392 m', 'Container Capacity: 33 m³', 'Maximum cargo weight: 28,230 kg'],
  ['Internal dimensions: 12.029 × 2.35 × 2.392 m', 'Container Capacity: 60 m³', 'Maximum cargo weight: 27,000 kg'],
  ['Internal dimensions: Not available', 'Container Capacity: 33 m³', 'Maximum cargo weight: 27,320 kg'],
  ['Internal dimensions: 12.024 × 2.35 × 2.697 m', 'Container Capacity: 67 m³', 'Maximum cargo weight: 27,000 kg'],
  ['Internal dimensions: Not available', 'Container Capacity: 62.5 m³', 'Maximum cargo weight: 28,500 kg'],
  ['Internal dimensions: Not available', 'Container Capacity: 24 m³', 'Maximum cargo weight: 32,200 kg'],
];

beforeEach(() => {
  vi.mocked(containerTypeAPI.getCustomerOptions).mockResolvedValue(options);
  vi.mocked(quoteAPI.getQuoteByRequirement).mockResolvedValue([]);
});

test('uses the customer catalogue and shared FCL option details in display order', async () => {
  const user = userEvent.setup();
  render(
    <MemoryRouter initialEntries={[{
      pathname: '/quotations',
      state: {
        quoteRequirement: {
          origin: 1,
          destination: 2,
          shippingType: 'WATER',
          seaFreightMode: 'FCL',
          shippingDate: new Date('2026-09-01'),
          numberOfPackages: 0,
          grossWeightKG: 0,
          volumeCBM: 0,
          containerCount: { 1: 1 },
          cargoTypeCategory: 'General Cargo',
          cargoType: 'General Cargo',
        },
      },
    }]}
    >
      <Routes>
        <Route path="/quotations" element={<Quotations />} />
      </Routes>
    </MemoryRouter>,
  );

  expect(await screen.findByRole('group', { name: options[0].name })).toBeInTheDocument();
  expect(containerTypeAPI.getCustomerOptions).toHaveBeenCalledOnce();
  expect(screen.getAllByRole('group').map((option) => option.getAttribute('aria-label')))
    .toEqual(options.map((option) => option.name));
  options.forEach((option, index) => {
    expect(Array.from(
      screen.getByRole('group', { name: option.name }).querySelectorAll('p'),
    ).map((row) => row.textContent)).toEqual(expectedDetails[index]);
  });

  await user.click(screen.getByRole('button', { name: 'Increase 40 Standard quantity' }));
  expect(screen.getByText('Combined Capacity (calculated): 93 m³')).toBeInTheDocument();
});

test('shows invalid selection errors instead of the no-quotation state', async () => {
  vi.mocked(quoteAPI.getQuoteByRequirement).mockRejectedValue(
    Object.assign(new Error('Invalid selection'), { code: 'INVALID_CONTAINER_SELECTION' }),
  );

  render(
    <MemoryRouter initialEntries={[{
      pathname: '/quotations',
      state: {
        quoteRequirement: {
          origin: 1,
          destination: 2,
          shippingType: 'WATER',
          seaFreightMode: 'FCL',
          shippingDate: new Date('2026-09-01'),
          numberOfPackages: 0,
          grossWeightKG: 0,
          volumeCBM: 0,
          containerCount: { 1: 1 },
          cargoTypeCategory: 'General Cargo',
          cargoType: 'General Cargo',
        },
      },
    }]}
    >
      <Routes>
        <Route path="/quotations" element={<Quotations />} />
      </Routes>
    </MemoryRouter>,
  );

  expect(await screen.findByRole('alert')).toHaveTextContent(
    'One or more FCL Container Options are no longer valid. Review your selection and search again.',
  );
  expect(screen.queryByText('No quotations found')).not.toBeInTheDocument();
});