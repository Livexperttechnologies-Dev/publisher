import { taxationService } from './taxation.service';

describe('Taxation Module Tests', () => {
  it('should fetch list of taxation records', async () => {
    const result = await taxationService.getAll();
    expect(result).toBeDefined();
    expect(result.items.length).toBeGreaterThan(0);
    expect(result.items[0].status).toBe('ACTIVE');
  });

  it('should fetch single taxation by id', async () => {
    const item = await taxationService.getById('test_1');
    expect(item).toBeDefined();
    expect(item?.id).toBe('test_1');
  });
});
