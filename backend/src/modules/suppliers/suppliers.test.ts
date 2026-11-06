import { suppliersService } from './suppliers.service';

describe('Suppliers Module Tests', () => {
  it('should fetch list of suppliers records', async () => {
    const result = await suppliersService.getAll();
    expect(result).toBeDefined();
    expect(result.items.length).toBeGreaterThan(0);
    expect(result.items[0].status).toBe('ACTIVE');
  });

  it('should fetch single suppliers by id', async () => {
    const item = await suppliersService.getById('test_1');
    expect(item).toBeDefined();
    expect(item?.id).toBe('test_1');
  });
});
