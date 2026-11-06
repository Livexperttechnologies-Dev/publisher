import { reportsService } from './reports.service';

describe('Reports Module Tests', () => {
  it('should fetch list of reports records', async () => {
    const result = await reportsService.getAll();
    expect(result).toBeDefined();
    expect(result.items.length).toBeGreaterThan(0);
    expect(result.items[0].status).toBe('ACTIVE');
  });

  it('should fetch single reports by id', async () => {
    const item = await reportsService.getById('test_1');
    expect(item).toBeDefined();
    expect(item?.id).toBe('test_1');
  });
});
