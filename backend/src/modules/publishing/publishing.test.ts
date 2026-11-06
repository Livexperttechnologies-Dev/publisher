import { publishingService } from './publishing.service';

describe('Publishing Module Tests', () => {
  it('should fetch list of publishing records', async () => {
    const result = await publishingService.getAll();
    expect(result).toBeDefined();
    expect(result.items.length).toBeGreaterThan(0);
    expect(result.items[0].status).toBe('ACTIVE');
  });

  it('should fetch single publishing by id', async () => {
    const item = await publishingService.getById('test_1');
    expect(item).toBeDefined();
    expect(item?.id).toBe('test_1');
  });
});
