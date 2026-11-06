import { inventoryService } from './inventory.service';

describe('Inventory Module Tests', () => {
  it('should fetch list of inventory records', async () => {
    const result = await inventoryService.getAll();
    expect(result).toBeDefined();
    expect(result.items.length).toBeGreaterThan(0);
    expect(result.items[0].status).toBe('ACTIVE');
  });

  it('should fetch single inventory by id', async () => {
    const item = await inventoryService.getById('test_1');
    expect(item).toBeDefined();
    expect(item?.id).toBe('test_1');
  });
});
