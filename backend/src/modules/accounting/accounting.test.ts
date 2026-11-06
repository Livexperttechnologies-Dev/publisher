import { accountingService } from './accounting.service';

describe('Accounting Module Tests', () => {
  it('should fetch Chart of Accounts ledgers and groups', async () => {
    const groups = await accountingService.getGroups();
    expect(groups.length).toBeGreaterThan(0);

    const ledgers = await accountingService.getLedgers();
    expect(ledgers.items.length).toBeGreaterThan(0);
    expect(ledgers.items[0].isActive).toBe(true);
  });

  it('should fetch single ledger by id with running balance', async () => {
    const ledgers = await accountingService.getLedgers();
    const first = ledgers.items[0];
    const statement = await accountingService.getLedgerStatement(first.id);
    expect(statement).toBeDefined();
    expect(statement.ledger.id).toBe(first.id);
    expect(statement.closingBalance).toBeGreaterThanOrEqual(0);
  });

  it('should generate balanced Trial Balance', async () => {
    const tb = await accountingService.getTrialBalance();
    expect(tb.isBalanced).toBe(true);
    expect(tb.totalDebit).toBeGreaterThan(0);
    expect(tb.totalCredit).toBe(tb.totalDebit);
    expect(tb.difference).toBe(0);
  });

  it('should generate Profit & Loss statement', async () => {
    const pnl = await accountingService.getProfitAndLoss();
    expect(pnl.totalIncome).toBeGreaterThanOrEqual(0);
    expect(pnl.grossProfit).toBeDefined();
    expect(pnl.netProfit).toBeDefined();
  });

  it('should enforce double-entry balancing on voucher creation', async () => {
    await expect(
      accountingService.createVoucher({
        voucherType: 'JOURNAL',
        narration: 'Unbalanced Test Voucher',
        items: [
          { ledgerId: 'led_bank_hdfc', debitAmount: 5000, creditAmount: 0 },
          { ledgerId: 'led_cash', debitAmount: 0, creditAmount: 4000 }, // Imbalanced by 1000!
        ],
      })
    ).rejects.toThrow(/Double-entry imbalance/);
  });
});
