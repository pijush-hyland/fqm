import { expect, test, type Page } from '@playwright/test';

const options = [
  { id: 1, code: '20GP', name: '20 Standard', internalDimensionsMeters: { length: 5.895, width: 2.35, height: 2.392 }, capacityCbm: 33, maximumCargoWeightKg: 28230 },
  { id: 3, code: '40GP', name: '40 Standard', internalDimensionsMeters: { length: 12.029, width: 2.35, height: 2.392 }, capacityCbm: 60, maximumCargoWeightKg: 27000 },
  { id: 8, code: '20OT', name: '20 Open Top', internalDimensionsMeters: null, capacityCbm: 33, maximumCargoWeightKg: 27320 },
  { id: 4, code: '40HC', name: '40 High Cube', internalDimensionsMeters: { length: 12.024, width: 2.35, height: 2.697 }, capacityCbm: 67, maximumCargoWeightKg: 27000 },
  { id: 9, code: '40OT', name: '40 Open Top High', internalDimensionsMeters: null, capacityCbm: 62.5, maximumCargoWeightKg: 28500 },
  { id: 12, code: '20TK', name: '20 Feet Iso Tank', internalDimensionsMeters: null, capacityCbm: 24, maximumCargoWeightKg: 32200 },
];

const retiredOption = {
  id: 2,
  code: '20HC',
  name: 'Retired 20 High Cube',
  internalDimensionsMeters: { length: 5.9, width: 2.35, height: 2.69 },
  capacityCbm: 37,
  maximumCargoWeightKg: 28250,
  active: false,
};

const expectedDetails = [
  ['Internal dimensions: 5.895 × 2.35 × 2.392 m', 'Container Capacity: 33 m³', 'Maximum cargo weight: 28,230 kg'],
  ['Internal dimensions: 12.029 × 2.35 × 2.392 m', 'Container Capacity: 60 m³', 'Maximum cargo weight: 27,000 kg'],
  ['Internal dimensions: Not available', 'Container Capacity: 33 m³', 'Maximum cargo weight: 27,320 kg'],
  ['Internal dimensions: 12.024 × 2.35 × 2.697 m', 'Container Capacity: 67 m³', 'Maximum cargo weight: 27,000 kg'],
  ['Internal dimensions: Not available', 'Container Capacity: 62.5 m³', 'Maximum cargo weight: 28,500 kg'],
  ['Internal dimensions: Not available', 'Container Capacity: 24 m³', 'Maximum cargo weight: 32,200 kg'],
];

const locations = [
  { id: 1, name: 'Port of New York', country: 'United States', code: 'USNYC', type: 'SEA_PORT' },
  { id: 2, name: 'Port of Shanghai', country: 'China', code: 'CNSHA', type: 'SEA_PORT' },
];

async function mockApis(page: Page) {
  await page.route('**/container-types/customer', (route) => route.fulfill({ json: [...options, retiredOption] }));
  await page.route('**/locations?**', (route) => route.fulfill({ json: locations }));
  await page.route('**/locations/1', (route) => route.fulfill({ json: locations[0] }));
  await page.route('**/locations/2', (route) => route.fulfill({ json: locations[1] }));
  await page.route('**/quotes/get-quotes', (route) => route.fulfill({ json: [] }));
}

async function openQuoteContainerSelection(page: Page) {
  await mockApis(page);
  await page.goto('/quote');
  await page.getByText('Sea Freight', { exact: true }).click();
  await page.getByText('Full Container Load (FCL)', { exact: true }).click();
  await page.locator('#shippingDate').fill('2099-01-01');
  await page.getByRole('button', { name: 'Next' }).click();

  await page.getByPlaceholder('Where are you shipping from?').fill('New York');
  await page.getByText('Port of New York', { exact: true }).click();
  await page.getByPlaceholder('Where are you shipping to?').fill('Shanghai');
  await page.getByText('Port of Shanghai', { exact: true }).click();
  await page.getByRole('button', { name: 'Next' }).click();
  await expect(page.getByRole('heading', { name: 'Container Selection', exact: true })).toBeVisible();
}

async function expectApprovedCatalogue(page: Page) {
  const cards = page.locator('section[role="group"]');
  await expect(cards).toHaveCount(6);
  expect(await cards.evaluateAll((elements) => elements.map((element) => element.getAttribute('aria-label'))))
    .toEqual(options.map((option) => option.name));
  await expect(page.getByText('Retired', { exact: true })).toHaveCount(0);
  await expect(page.getByText(retiredOption.name, { exact: true })).toHaveCount(0);

  for (let index = 0; index < options.length; index += 1) {
    const card = cards.nth(index);
    await expect(card.locator('p')).toHaveText(expectedDetails[index]);
    await expect(card.getByRole('spinbutton', { name: `${options[index].name} quantity` })).toBeEnabled();
    const contained = await card.evaluate((element) => {
      const cardBox = element.getBoundingClientRect();
      return Array.from(element.querySelectorAll('p, input, button')).every((child) => {
        const childBox = child.getBoundingClientRect();
        return childBox.left >= cardBox.left && childBox.right <= cardBox.right
          && childBox.top >= cardBox.top && childBox.bottom <= cardBox.bottom;
      });
    });
    expect(contained).toBe(true);
  }

  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth))
    .toBe(true);
}

test('quote creation shows the approved FCL catalogue', async ({ page }) => {
  await openQuoteContainerSelection(page);
  await expectApprovedCatalogue(page);
});

test('quotation search shows the same approved FCL catalogue', async ({ page }) => {
  await openQuoteContainerSelection(page);
  await page.getByRole('button', { name: 'Increase 20 Standard quantity' }).click();
  await page.getByRole('button', { name: 'Next' }).click();
  await page.locator('select').first().selectOption('General Cargo');
  await page.locator('select').nth(1).selectOption('Electronics');
  await page.getByRole('button', { name: 'Get Quotes' }).click();
  await expect(page).toHaveURL(/\/quotations$/);

  const filtersButton = page.getByRole('button', { name: 'Filters' });
  if (await filtersButton.isVisible()) {
    await filtersButton.click();
  }
  await expectApprovedCatalogue(page);
});