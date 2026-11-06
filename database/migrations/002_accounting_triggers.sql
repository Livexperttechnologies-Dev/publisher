-- ==============================================================================
-- KIBO360 ENTERPRISE ERP - STATUTORY ACCOUNTING & IMMUTABILITY TRIGGERS (002)
-- Enforces Double-Entry Equilibrium and Immutable Audit Trails at DB Engine Level
-- ==============================================================================

-- 1. Double-Entry Voucher Summation Trigger Function
CREATE OR REPLACE FUNCTION verify_voucher_double_entry_balance()
RETURNS TRIGGER AS $$
DECLARE
    v_total_debit NUMERIC(15, 2);
    v_total_credit NUMERIC(15, 2);
BEGIN
    SELECT COALESCE(SUM(debit_amount), 0), COALESCE(SUM(credit_amount), 0)
    INTO v_total_debit, v_total_credit
    FROM journal_voucher_items
    WHERE voucher_id = NEW.voucher_id;

    IF v_total_debit <> v_total_credit THEN
        RAISE EXCEPTION 'Statutory Accounting Error: Voucher item debits (%) do not equal credits (%) for voucher ID %',
            v_total_debit, v_total_credit, NEW.voucher_id;
    END IF;

    -- Update parent voucher totals
    UPDATE journal_vouchers
    SET total_debit = v_total_debit,
        total_credit = v_total_credit,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = NEW.voucher_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 2. Immutable Statutory Audit Log Trigger Function
CREATE OR REPLACE FUNCTION prevent_audit_log_modification()
RETURNS TRIGGER AS $$
BEGIN
    RAISE EXCEPTION 'Security Violation: KIBO360 Statutory Audit Logs are strictly immutable. UPDATE and DELETE operations are forbidden by Section 128 of the Companies Act.';
END;
$$ LANGUAGE plpgsql;

-- Bind Audit Log Immutability Triggers
DROP TRIGGER IF EXISTS trg_immutable_audit_update ON audit_logs;
CREATE TRIGGER trg_immutable_audit_update
BEFORE UPDATE ON audit_logs
FOR EACH ROW EXECUTE FUNCTION prevent_audit_log_modification();

DROP TRIGGER IF EXISTS trg_immutable_audit_delete ON audit_logs;
CREATE TRIGGER trg_immutable_audit_delete
BEFORE DELETE ON audit_logs
FOR EACH ROW EXECUTE FUNCTION prevent_audit_log_modification();

-- 3. Automatic Ledger Running Balance Maintenance Trigger
CREATE OR REPLACE FUNCTION update_ledger_running_balance()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        IF NEW.debit_amount > 0 THEN
            UPDATE account_ledgers
            SET current_balance = CASE
                    WHEN is_debit_balance THEN current_balance + NEW.debit_amount
                    ELSE current_balance - NEW.debit_amount
                END,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = NEW.ledger_id;
        ELSIF NEW.credit_amount > 0 THEN
            UPDATE account_ledgers
            SET current_balance = CASE
                    WHEN NOT is_debit_balance THEN current_balance + NEW.credit_amount
                    ELSE current_balance - NEW.credit_amount
                END,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = NEW.ledger_id;
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_update_ledger_balance ON journal_voucher_items;
CREATE TRIGGER trg_update_ledger_balance
AFTER INSERT ON journal_voucher_items
FOR EACH ROW EXECUTE FUNCTION update_ledger_running_balance();
