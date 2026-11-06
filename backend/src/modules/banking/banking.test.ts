import { bankingService } from './banking.service';

describe('Banking Module Tests', () => {
  it('should fetch list of banking records', async () => {
    const result = await bankingService.getAll();
    expect(result).toBeDefined();
    expect(result.items.length).toBeGreaterThan(0);
    expect(result.items[0].status).toBe('ACTIVE');
  });

  it('should fetch single banking by id', async () => {
    const item = await bankingService.getById('test_1');
    expect(item).toBeDefined();
    expect(item?.id).toBe('test_1');
  });
});
