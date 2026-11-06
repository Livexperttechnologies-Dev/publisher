import { royaltiesService } from './royalties.service';

describe('Royalties Module Tests', () => {
  it('should fetch list of royalties records', async () => {
    const result = await royaltiesService.getAll();
    expect(result).toBeDefined();
    expect(result.items.length).toBeGreaterThan(0);
    expect(result.items[0].status).toBe('ACTIVE');
  });

  it('should fetch single royalties by id', async () => {
    const item = await royaltiesService.getById('test_1');
    expect(item).toBeDefined();
    expect(item?.id).toBe('test_1');
  });
});
