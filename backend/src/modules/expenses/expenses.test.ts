import { expensesService } from './expenses.service';

describe('Expenses Module Tests', () => {
  it('should fetch list of expenses records', async () => {
    const result = await expensesService.getAll();
    expect(result).toBeDefined();
    expect(result.items.length).toBeGreaterThan(0);
    expect(result.items[0].status).toBe('ACTIVE');
  });

  it('should fetch single expenses by id', async () => {
    const item = await expensesService.getById('test_1');
    expect(item).toBeDefined();
    expect(item?.id).toBe('test_1');
  });
});
