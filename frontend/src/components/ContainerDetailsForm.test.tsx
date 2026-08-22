import { render, screen } from '@testing-library/react';
import { beforeEach, expect, test, vi } from 'vitest';
import containerTypeAPI from '../apis/containerTypeAPI';
import type { CustomerContainerOption } from '../types/container.type';
import type { QuoteFormData } from '../types/quoteForm.type';
import ContainerDetailsForm from './ContainerDetailsForm';

vi.mock('../apis/containerTypeAPI', () => ({
  default: {
    getCustomerOptions: vi.fn(),
  },
}));

const names = [
  '20 Standard',
  '40 Standard',
  '20 Open Top',
  '40 High Cube',
  '40 Open Top High',
  '20 Feet Iso Tank',
];

const options: CustomerContainerOption[] = names.map((name, index) => ({
  id: index + 1,
  code: `CODE${index + 1}`,
  name,
  internalDimensionsMeters: null,
  capacityCbm: 24 + index,
  maximumCargoWeightKg: 27000 + index,
}));

const formData: QuoteFormData = {
  origin: null,
  destination: null,
  shippingType: '',
  seaFreightMode: '',
  shippingDate: '',
  numberOfPackages: '',
  grossWeightKG: '',
  volumeCBM: '',
  maxTransitDays: '',
  containerCount: {},
  cargoTypeCategory: '',
  cargoType: '',
  remarks: '',
};

beforeEach(() => {
  vi.mocked(containerTypeAPI.getCustomerOptions).mockResolvedValue(options);
});

test('loads the customer catalogue and displays the six approved names in order', async () => {
  render(
    <ContainerDetailsForm
      formData={formData}
      errors={{}}
      onInputChange={() => undefined}
      hasAttemptedNext={false}
    />,
  );

  expect(await screen.findByRole('group', { name: names[0] })).toBeInTheDocument();
  expect(containerTypeAPI.getCustomerOptions).toHaveBeenCalledOnce();
  expect(screen.getAllByRole('group').map((option) => option.getAttribute('aria-label'))).toEqual(names);
});