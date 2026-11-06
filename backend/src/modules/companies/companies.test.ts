import { companiesService } from './companies.service';

describe('Companies Module Tests', () => {
  it('should fetch list of companies records', async () => {
    const result = await companiesService.getAll();
    expect(result).toBeDefined();
    expect(result.items.length).toBeGreaterThan(0);
    expect(result.items[0].status).toBe('ACTIVE');
  });

  it('should fetch single companies by id', async () => {
    const item = await companiesService.getById('test_1');
    expect(item).toBeDefined();
    expect(item?.id).toBe('test_1');
  });
});
