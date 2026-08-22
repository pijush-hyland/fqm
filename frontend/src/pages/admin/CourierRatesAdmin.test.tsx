import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, expect, test, vi } from 'vitest';
import containerTypeAPI from '../../apis/containerTypeAPI';
import courierRateAPI from '../../apis/courierRateAPI';
import type { AdministrationContainerOption } from '../../types/container.type';
import type { courierRate } from '../../types/courierRate.type';
import CourierRatesAdmin from './CourierRatesAdmin';

vi.mock('../../apis/containerTypeAPI', () => ({
  default: { getAll: vi.fn() },
}));

vi.mock('../../apis/courierRateAPI', () => ({
  default: {
    getAllRates: vi.fn(),
    createRate: vi.fn(),
    updateRate: vi.fn(),
    deleteRate: vi.fn(),
  },
}));

vi.mock('../../components/LocationSelector', () => ({
  default: ({ label }: { label: string }) => <div>{label}</div>,
}));

const options: AdministrationContainerOption[] = [
  {
    id: 1,
    code: '20GP',
    name: '20 Standard',
    description: 'Standard container',
    internalDimensionsMeters: { length: 5.895, width: 2.35, height: 2.392 },
    capacityCbm: 33,
    tareWeightKg: 2230,
    maximumCargoWeightKg: 28230,
    maximumTotalWeightKg: 30460,
    active: true,
    refrigerated: false,
    displayOrder: 1,
  },
  {
    id: 2,
    code: '20HC',
    name: '20 High Cube',
    description: 'Historical container',
    internalDimensionsMeters: null,
    capacityCbm: 37,
    tareWeightKg: null,
    maximumCargoWeightKg: 28000,
    maximumTotalWeightKg: null,
    active: false,
    refrigerated: false,
    displayOrder: null,
  },
];

const existingRate: courierRate = {
  id: 10,
  courierName: 'TEST CARRIER',
  origin: { id: 1, name: 'Origin' } as courierRate['origin'],
  destination: { id: 2, name: 'Destination' } as courierRate['destination'],
  shippingType: 'WATER',
  seaFreightMode: 'FCL',
  effectiveFrom: new Date('2027-01-01'),
  effectiveTo: new Date('2027-12-31'),
  isActive: true,
  ratesForFCL: { 1: 100, 2: 200 },
  currency: 'USD',
};

beforeEach(() => {
  vi.mocked(containerTypeAPI.getAll).mockResolvedValue(options);
  vi.mocked(courierRateAPI.getAllRates).mockResolvedValue([existingRate]);
});

test('labels retired options and prevents selecting them while creating a rate', async () => {
  const user = userEvent.setup();
  render(<CourierRatesAdmin />);

  await user.click(await screen.findByRole('button', { name: 'Create New Rate' }));
  await user.selectOptions(screen.getByLabelText('Shipping Type *'), 'WATER');
  await user.selectOptions(screen.getByLabelText('Sea Freight Mode *'), 'FCL');

  const retiredOption = screen.getByRole('group', { name: '20 High Cube Retired' });
  expect(within(retiredOption).getByText('Retired')).toBeInTheDocument();
  expect(within(retiredOption).getByPlaceholderText('Enter rate')).toBeDisabled();
});

test('keeps an existing retired association visible and editable without a remove action', async () => {
  const user = userEvent.setup();
  render(<CourierRatesAdmin />);

  await user.click(await screen.findByRole('button', { name: 'Edit' }));

  const retiredOption = screen.getByRole('group', { name: '20 High Cube Retired' });
  const retiredRate = within(retiredOption).getByPlaceholderText('Enter rate');
  expect(retiredRate).toHaveValue(200);
  expect(retiredRate).toBeEnabled();
  expect(within(retiredOption).queryByTitle('Remove this container type')).not.toBeInTheDocument();

  await user.clear(retiredRate);
  await user.type(retiredRate, '225');
  await user.click(screen.getByRole('button', { name: 'Update Rate' }));

  expect(courierRateAPI.updateRate).toHaveBeenCalledWith(
    '10',
    expect.objectContaining({ ratesForFCL: { 1: 100, 2: 225 } }),
  );
});
