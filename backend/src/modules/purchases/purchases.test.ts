import { purchasesService } from './purchases.service';

describe('Purchases Module Tests', () => {
  it('should fetch list of purchases records', async () => {
    const result = await purchasesService.getAll();
    expect(result).toBeDefined();
    expect(result.items.length).toBeGreaterThan(0);
    expect(result.items[0].status).toBe('ACTIVE');
  });

  it('should fetch single purchases by id', async () => {
    const item = await purchasesService.getById('test_1');
    expect(item).toBeDefined();
    expect(item?.id).toBe('test_1');
  });
});
