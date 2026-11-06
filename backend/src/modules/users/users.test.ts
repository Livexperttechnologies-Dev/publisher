import { usersService } from './users.service';

describe('Users Module Tests', () => {
  it('should fetch list of users records', async () => {
    const result = await usersService.getAll();
    expect(result).toBeDefined();
    expect(result.items.length).toBeGreaterThan(0);
    expect(result.items[0].status).toBe('ACTIVE');
  });

  it('should fetch single users by id', async () => {
    const item = await usersService.getById('test_1');
    expect(item).toBeDefined();
    expect(item?.id).toBe('test_1');
  });
});
