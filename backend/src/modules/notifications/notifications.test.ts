import { notificationsService } from './notifications.service';

describe('Notifications Module Tests', () => {
  it('should fetch list of notifications records', async () => {
    const result = await notificationsService.getAll();
    expect(result).toBeDefined();
    expect(result.items.length).toBeGreaterThan(0);
    expect(result.items[0].status).toBe('ACTIVE');
  });

  it('should fetch single notifications by id', async () => {
    const item = await notificationsService.getById('test_1');
    expect(item).toBeDefined();
    expect(item?.id).toBe('test_1');
  });
});
