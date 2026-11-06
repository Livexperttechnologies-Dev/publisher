import { distributorsService } from './distributors.service';

describe('Distributors Module Tests', () => {
  it('should fetch list of distributors records', async () => {
    const result = await distributorsService.getAll();
    expect(result).toBeDefined();
    expect(result.items.length).toBeGreaterThan(0);
    expect(result.items[0].status).toBe('ACTIVE');
  });

  it('should fetch single distributors by id', async () => {
    const item = await distributorsService.getById('test_1');
    expect(item).toBeDefined();
    expect(item?.id).toBe('test_1');
  });
});
