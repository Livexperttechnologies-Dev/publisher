import { authService } from './auth.service';

describe('Auth Module Tests', () => {
  it('should fetch list of auth records', async () => {
    const result = await authService.getAll();
    expect(result).toBeDefined();
    expect(result.items.length).toBeGreaterThan(0);
    expect(result.items[0].status).toBe('ACTIVE');
  });

  it('should fetch single auth by id', async () => {
    const item = await authService.getById('test_1');
    expect(item).toBeDefined();
    expect(item?.id).toBe('test_1');
  });
});
