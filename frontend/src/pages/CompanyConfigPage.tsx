import React, { useState } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { FormField } from '../components/ui/FormField';
import { PageHeader } from '../components/ui/PageHeader';
import {
  Building2,
  GitBranch,
  Calendar,
  Layers,
  Sliders,
  DollarSign,
  Lock,
  Unlock,
  Plus,
  Save,
  CheckCircle2,
  PieChart,
  ShieldCheck,
  FileSpreadsheet,
  Palette,
} from 'lucide-react';
import { useBrand } from '../contexts/BrandContext';
import { BrandCustomizer } from '../components/branding/BrandCustomizer';
import {
  getStoredCompanyProfile,
  saveCompanyProfile,
  getStoredBranches,
  saveBranch,
  deleteBranch,
  getStoredFiscalYears,
  saveFiscalYear,
  toggleMonthLock,
  BranchRecord,
  FiscalYearRecord,
} from '../services/configService';

export const CompanyConfigPage: React.FC = () => {
  const { brand } = useBrand();
  const [activeTab, setActiveTab] = useState<'PROFILE' | 'BRANCHES' | 'FISCAL_YEARS' | 'ACCOUNTING' | 'CENTRES' | 'CONSOLIDATED' | 'BRANDING'>('PROFILE');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modals state
  const [isBranchModalOpen, setIsBranchModalOpen] = useState(false);
  const [isFYModalOpen, setIsFYModalOpen] = useState(false);

  // Company Profile State (from localStorage)
  const initialProfile = getStoredCompanyProfile();
  const [companyName, setCompanyName] = useState(initialProfile.companyName);
  const [gstin, setGstin] = useState(initialProfile.gstin);
  const [pan, setPan] = useState(initialProfile.pan);
  const [cin, setCin] = useState(initialProfile.cin);
  const [currencySymbol, setCurrencySymbol] = useState(initialProfile.currencySymbol);
  const [decimalPrecision, setDecimalPrecision] = useState(initialProfile.decimalPrecision);
  const [invoicePrefix, setInvoicePrefix] = useState(initialProfile.invoicePrefix);
  const [invValMethod, setInvValMethod] = useState<'FIFO' | 'WEIGHTED_AVERAGE'>(initialProfile.invValMethod);

  // Branches State
  const [branches, setBranches] = useState<BranchRecord[]>(getStoredBranches());

  // Fiscal Years & Period Locks State
  const [fiscalYears, setFiscalYears] = useState<FiscalYearRecord[]>(getStoredFiscalYears());

  // Form states for branch modal
  const [newBranchName, setNewBranchName] = useState('');
  const [newBranchCode, setNewBranchCode] = useState('');
  const [newBranchState, setNewBranchState] = useState('');
  const [newBranchGstin, setNewBranchGstin] = useState('');

  // Form states for FY modal
  const [newFYName, setNewFYName] = useState('');
  const [newFYStartDate, setNewFYStartDate] = useState('');
  const [newFYEndDate, setNewFYEndDate] = useState('');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleSaveAllCompanySettings = () => {
    saveCompanyProfile({
      companyName,
      gstin,
      pan,
      cin,
      currencySymbol,
      decimalPrecision,
      invoicePrefix,
      invValMethod,
    });
    showToast('Company master configuration saved & audited successfully.');
  };

  const handleToggleMonthLock = (fyId: string, monthName: string) => {
    const updated = toggleMonthLock(fyId, monthName);
    if (updated) {
      setFiscalYears(getStoredFiscalYears());
      showToast(`Accounting period "${monthName}" lock status updated.`);
    }
  };

  const handleSaveBranch = (e: React.FormEvent) => {
    e.preventDefault();
    const created = saveBranch({
      name: newBranchName,
      code: newBranchCode.toUpperCase(),
      isMain: false,
      city: newBranchState,
      state: newBranchState,
      gstin: newBranchGstin,
      manager: 'Branch Executive',
      prefix: `${newBranchCode.toUpperCase()}-INV`,
      transfers: true,
    });
    setBranches(getStoredBranches());
    setIsBranchModalOpen(false);
    setNewBranchName('');
    setNewBranchCode('');
    setNewBranchState('');
    setNewBranchGstin('');
    showToast(`Branch Depot "${created.name}" created successfully.`);
  };

  const handleDeleteBranch = (id: string) => {
    if (confirm('Are you sure you want to delete this branch depot?')) {
      const ok = deleteBranch(id);
      if (ok) {
        setBranches(getStoredBranches());
        showToast('Branch depot deleted successfully.');
      } else {
        alert('Cannot delete the primary corporate headquarters branch.');
      }
    }
  };

  const handleSaveFY = (e: React.FormEvent) => {
    e.preventDefault();
    const created = saveFiscalYear({
      name: newFYName,
      period: `${newFYStartDate} to ${newFYEndDate}`,
      status: 'Upcoming Period',
      isClosed: false,
      lockedMonths: [],
    });
    setFiscalYears(getStoredFiscalYears());
    setIsFYModalOpen(false);
    setNewFYName('');
    showToast(`Fiscal Year "${created.name}" created successfully.`);
  };

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-[#340771] text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-2.5 text-xs animate-in slide-in-from-top-2">
          <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      <PageHeader
        title="Multi-Company & Financial Year Configuration"
        description="Enterprise legal entity setup, state-specific branch GSTINs, immutable period locking, and accounting defaults."
        breadcrumbs={[{ label: 'System Settings', href: '/settings' }, { label: 'Company Configuration' }]}
        actions={
          <Button
            variant="primary"
            size="sm"
            leftIcon={<Save size={14} />}
            onClick={handleSaveAllCompanySettings}
          >
            Save All Settings
          </Button>
        }
      />

      {/* Navigation Tabs */}
      <div className="flex items-center gap-1.5 border-b border-slate-200 overflow-x-auto pb-px">
        {[
          { key: 'PROFILE', label: 'Company Profile & Tax', icon: Building2 },
          { key: 'BRANCHES', label: 'Branches & Depots', icon: GitBranch },
          { key: 'FISCAL_YEARS', label: 'Fiscal Years & Period Locks', icon: Calendar },
          { key: 'ACCOUNTING', label: 'Accounting Defaults', icon: Layers },
          { key: 'CENTRES', label: 'Cost & Profit Centres', icon: Sliders },
          { key: 'CONSOLIDATED', label: 'Consolidated Reporting', icon: PieChart },
          { key: 'BRANDING', label: 'Dynamic Brand & Colors', icon: Palette },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-all whitespace-nowrap ${
              activeTab === tab.key
                ? 'border-brand-primary text-brand-primary bg-purple-50/50'
                : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
            }`}
          >
            <tab.icon size={15} />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* TAB 1: COMPANY MASTER PROFILE */}
      {activeTab === 'PROFILE' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card header="Corporate Legal Identification">
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField label="Company Trade Name" required>
                    <Input value={companyName} onChange={(e) => setCompanyName(e.target.value)} />
                  </FormField>
                  <FormField label="Full Legal Entity Name" required>
                    <Input defaultValue="Apex Educational Publishers & Distributors Limited" />
                  </FormField>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <FormField label="State GSTIN" required>
                    <Input value={gstin} onChange={(e) => setGstin(e.target.value)} className="font-mono uppercase" />
                  </FormField>
                  <FormField label="PAN Number" required>
                    <Input value={pan} onChange={(e) => setPan(e.target.value)} className="font-mono uppercase" />
                  </FormField>
                  <FormField label="CIN Number (Corporate ID)">
                    <Input value={cin} onChange={(e) => setCin(e.target.value)} className="font-mono uppercase" />
                  </FormField>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField label="Corporate Registered Address" required>
                    <Input defaultValue="Publishers Enclave, Daryaganj, New Delhi - 110002" />
                  </FormField>
                  <FormField label="Billing Address (Printed on Invoices)" required>
                    <Input defaultValue="Publishers Enclave, Daryaganj, New Delhi - 110002" />
                  </FormField>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <FormField label="Official Finance Email" required>
                    <Input defaultValue="finance@apexpublishers.com" />
                  </FormField>
                  <FormField label="Corporate Phone" required>
                    <Input defaultValue="+91 11 4567 8900" />
                  </FormField>
                  <FormField label="Website URL">
                    <Input defaultValue="https://www.apexpublishers.com" />
                  </FormField>
                </div>
              </div>
            </Card>

            <Card header="Company Bank Accounts & Settlement Details">
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField label="Bank Account Name" required>
                    <Input defaultValue="Apex Educational Publishers & Distributors Ltd" />
                  </FormField>
                  <FormField label="Bank Account Number" required>
                    <Input defaultValue="50200012345678" className="font-mono" />
                  </FormField>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <FormField label="Bank Name" required>
                    <Input defaultValue="HDFC Bank Ltd" />
                  </FormField>
                  <FormField label="IFSC Code" required>
                    <Input defaultValue="HDFC0000123" className="font-mono uppercase" />
                  </FormField>
                  <FormField label="Branch Name" required>
                    <Input defaultValue="Daryaganj Branch" />
                  </FormField>
                </div>
              </div>
            </Card>
          </div>

          <div className="space-y-6">
            <Card header="Official Brand Logo & Colors">
              <div className="space-y-3">
                <div className="text-center p-4 bg-slate-50 rounded-lg border border-slate-200">
                  <img
                    src={brand.logoUrl}
                    alt="Company Logo"
                    style={{ height: `${brand.logoHeight || 36}px` }}
                    className="mx-auto object-contain transition-all"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/kibo360-logo.png';
                    }}
                  />
                  <p className="text-xs font-semibold mt-2" style={{ color: brand.primaryColor }}>
                    {brand.tagline || 'Publishing ERP'}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Live Dynamic Branding Asset</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full text-xs"
                  leftIcon={<Palette size={14} />}
                  onClick={() => setActiveTab('BRANDING' as any)}
                >
                  Customize Brand & Colors
                </Button>
              </div>
            </Card>

            <Card header="Invoice Numbering & Decimal Precision">
              <div className="space-y-4">
                <FormField label="Invoice Prefix" required>
                  <Input value={invoicePrefix} onChange={(e) => setInvoicePrefix(e.target.value)} />
                </FormField>
                <FormField label="Monetary Decimal Precision">
                  <select
                    value={decimalPrecision}
                    onChange={(e) => setDecimalPrecision(Number(e.target.value))}
                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-700"
                  >
                    <option value={2}>2 Decimal Places (e.g. ₹1,250.50)</option>
                    <option value={3}>3 Decimal Places (e.g. ₹1,250.500)</option>
                    <option value={4}>4 Decimal Places (Strict Forex / Unit Cost)</option>
                  </select>
                </FormField>
                <div className="p-3 bg-purple-50 rounded-lg border border-purple-200 text-xs">
                  <span className="font-semibold text-[#690BA8]">Live Invoice Format Preview:</span>
                  <p className="font-mono text-xs font-bold text-slate-800 mt-1">
                    {invoicePrefix}/2026/0892
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* TAB 2: MULTI-BRANCH DIRECTORY */}
      {activeTab === 'BRANCHES' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center pb-2">
            <div>
              <h3 className="text-sm font-bold text-slate-800">Branch Depots & State-Wise GSTINs</h3>
              <p className="text-xs text-slate-500">Each branch operates with independent GST compliance and depot inventory.</p>
            </div>
            <Button
              variant="primary"
              size="sm"
              leftIcon={<Plus size={14} />}
              onClick={() => setIsBranchModalOpen(true)}
            >
              Add New Branch Depot
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {branches.map((b) => (
              <Card key={b.id} className="p-4 flex flex-col justify-between border-t-4 border-t-[#690BA8]">
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-slate-800">{b.name}</h4>
                      <p className="text-xs text-slate-400 font-mono mt-0.5">{b.code}</p>
                    </div>
                    {b.isMain && <Badge variant="purple" size="sm">Main HQ</Badge>}
                  </div>

                  <div className="mt-4 space-y-2 text-xs text-slate-600">
                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <span className="text-slate-400">State GSTIN:</span>
                      <span className="font-mono font-bold text-slate-800">{b.gstin}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <span className="text-slate-400">Invoice Prefix:</span>
                      <span className="font-mono text-[#690BA8] font-bold">{b.prefix}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <span className="text-slate-400">Depot Manager:</span>
                      <span className="font-semibold text-slate-800">{b.manager}</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-slate-400">Inter-Branch Transfers:</span>
                      <span className="font-semibold text-emerald-600">Enabled</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex justify-end">
                  <Button variant="secondary" size="sm">Configure Depot</Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: FISCAL YEARS & PERIOD LOCKS */}
      {activeTab === 'FISCAL_YEARS' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center pb-2">
            <div>
              <h3 className="text-sm font-bold text-slate-800">Financial Years & Period Lock Control</h3>
              <p className="text-xs text-slate-500">Lock completed monthly periods to prevent unauthorized backdated voucher postings.</p>
            </div>
            <Button
              variant="primary"
              size="sm"
              leftIcon={<Plus size={14} />}
              onClick={() => setIsFYModalOpen(true)}
            >
              Create New Fiscal Year
            </Button>
          </div>

          <div className="space-y-4">
            {fiscalYears.map((fy) => (
              <Card key={fy.id} className="p-0 overflow-hidden">
                <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-b border-slate-200">
                  <div className="flex items-center gap-3">
                    <Calendar size={18} className="text-[#690BA8]" />
                    <div>
                      <h4 className="text-sm font-bold text-slate-800">{fy.name}</h4>
                      <p className="text-xs text-slate-500">{fy.period}</p>
                    </div>
                  </div>
                  <Badge variant={fy.isClosed ? 'slate' : 'success'} size="md">
                    {fy.status}
                  </Badge>
                </div>

                {!fy.isClosed && (
                  <div className="p-6">
                    <h5 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                      Monthly Accounting Period Locks (Audit Safeguard)
                    </h5>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {fy.lockedMonths.map((m) => (
                        <div
                          key={m.month}
                          className={`p-3 rounded-lg border flex items-center justify-between text-xs transition-colors ${
                            m.isLocked ? 'bg-orange-50/60 border-orange-200' : 'bg-white border-slate-200'
                          }`}
                        >
                          <div>
                            <p className="font-semibold text-slate-800">{m.month}</p>
                            <span className={`text-[10px] font-bold ${m.isLocked ? 'text-[#F06A64]' : 'text-emerald-600'}`}>
                              {m.isLocked ? 'Locked (Closed)' : 'Open for Posting'}
                            </span>
                          </div>
                          <button
                            onClick={() => handleToggleMonthLock(fy.id, m.month)}
                            className="p-1.5 rounded-md hover:bg-white text-slate-500 transition-colors"
                            title={m.isLocked ? 'Unlock Period' : 'Lock Period'}
                          >
                            {m.isLocked ? <Lock size={15} className="text-[#F06A64]" /> : <Unlock size={15} className="text-emerald-600" />}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: ACCOUNTING DEFAULTS MAPPING */}
      {activeTab === 'ACCOUNTING' && (
        <div className="space-y-6">
          <Card header="Automated General Ledger Account Mappings">
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField label="Default Book Sales Revenue Account" required>
                  <Input defaultValue="3010 - Curriculum & School Textbook Sales" readOnly />
                </FormField>
                <FormField label="Default Paper Procurement Account" required>
                  <Input defaultValue="4020 - Paper & Reel Consumption" readOnly />
                </FormField>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <FormField label="Inventory Valuation Method" required>
                  <select
                    value={invValMethod}
                    onChange={(e) => setInvValMethod(e.target.value as any)}
                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-700 focus:outline-none focus:border-[#690BA8]"
                  >
                    <option value="FIFO">FIFO (First In, First Out) – Standard</option>
                    <option value="WEIGHTED_AVERAGE">Weighted Average Cost</option>
                  </select>
                </FormField>
                <FormField label="Default Debtors Account" required>
                  <Input defaultValue="1030 - Trade Receivables (Sundry Debtors)" readOnly />
                </FormField>
                <FormField label="Default Creditors Account" required>
                  <Input defaultValue="2010 - Trade Payables (Sundry Creditors)" readOnly />
                </FormField>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField label="Default Cash Account" required>
                  <Input defaultValue="1020 - Main Godown Cash in Hand" readOnly />
                </FormField>
                <FormField label="Default Operational Bank Account" required>
                  <Input defaultValue="1010 - HDFC Operational Account - A/C 9871" readOnly />
                </FormField>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <FormField label="Round-Off Account" required>
                  <Input defaultValue="4090 - Rounding Off Difference Account" readOnly />
                </FormField>
                <FormField label="Trade Discount Allowed Account" required>
                  <Input defaultValue="4080 - Trade Discount Allowed (Expense)" readOnly />
                </FormField>
                <FormField label="Purchase Discount Received Account" required>
                  <Input defaultValue="3090 - Purchase Cash Discount Received (Income)" readOnly />
                </FormField>
              </div>

              <div className="pt-2 flex justify-end">
                <Button variant="primary" size="sm" onClick={() => showToast('Accounting default mappings updated.')}>
                  Save Ledger Mappings
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* TAB 5: COST & PROFIT CENTRES */}
      {activeTab === 'CENTRES' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card header="Publishing Profit Centres">
            <div className="space-y-3">
              {[
                { code: 'PC-SCHOOL', name: 'School Curriculum & Textbooks Division', type: 'Primary Profit Centre' },
                { code: 'PC-HIGHER', name: 'Higher Education Academic Press', type: 'Specialized Division' },
                { code: 'PC-TRADE', name: 'Trade & General Literature Imprints', type: 'Trade Imprint' },
              ].map((pc) => (
                <div key={pc.code} className="flex items-center justify-between p-3 rounded-lg border border-slate-200 bg-slate-50/60">
                  <div>
                    <h5 className="text-xs font-bold text-slate-800">{pc.name}</h5>
                    <p className="text-[11px] text-slate-400 font-mono">{pc.code}</p>
                  </div>
                  <Badge variant="purple" size="sm">{pc.type}</Badge>
                </div>
              ))}
            </div>
          </Card>

          <Card header="Production & Operational Cost Centres">
            <div className="space-y-3">
              {[
                { code: 'CC-EXH', name: 'New Delhi World Book Fair Exhibition', category: 'EXHIBITION' },
                { code: 'CC-OFFSET', name: 'Senior Math Offset Press Run', category: 'PRODUCTION' },
                { code: 'CC-EDIT', name: 'Curriculum Revision Editorial Commission', category: 'EDITORIAL' },
              ].map((cc) => (
                <div key={cc.code} className="flex items-center justify-between p-3 rounded-lg border border-slate-200 bg-slate-50/60">
                  <div>
                    <h5 className="text-xs font-bold text-slate-800">{cc.name}</h5>
                    <p className="text-[11px] text-slate-400 font-mono">{cc.code}</p>
                  </div>
                  <Badge variant="slate" size="sm">{cc.category}</Badge>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* TAB 6: CONSOLIDATED REPORTING */}
      {activeTab === 'CONSOLIDATED' && (
        <div className="space-y-6">
          <Card header="Authorized Multi-Branch Consolidated Overview">
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-purple-50/70 border border-purple-200">
                  <span className="text-xs font-semibold text-[#690BA8] uppercase">Consolidated Turnover</span>
                  <h4 className="text-2xl font-bold text-slate-800 mt-1">₹79,500,000.00</h4>
                  <p className="text-[11px] text-slate-500 mt-1">Across Delhi HQ, Mumbai & Bangalore</p>
                </div>
                <div className="p-4 rounded-xl bg-indigo-50/70 border border-indigo-200">
                  <span className="text-xs font-semibold text-[#340771] uppercase">Consolidated Receivables</span>
                  <h4 className="text-2xl font-bold text-slate-800 mt-1">₹8,745,200.00</h4>
                  <p className="text-[11px] text-slate-500 mt-1">Total market book debtors</p>
                </div>
                <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200">
                  <span className="text-xs font-semibold text-emerald-700 uppercase">Consolidated Stock Valuation</span>
                  <h4 className="text-2xl font-bold text-slate-800 mt-1">₹29,770,000.00</h4>
                  <p className="text-[11px] text-slate-500 mt-1">149,500 total book copies</p>
                </div>
              </div>

              <div>
                <h5 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-3">
                  Branch-Wise Contribution Breakdown
                </h5>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50/70 text-[11px] font-semibold uppercase text-slate-500">
                        <th className="py-2.5 px-4">Branch Depot</th>
                        <th className="py-2.5 px-4">State</th>
                        <th className="py-2.5 px-4">State GSTIN</th>
                        <th className="py-2.5 px-4 text-right">Allocated Turnover</th>
                        <th className="py-2.5 px-4 text-right">Stock Valuation</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      <tr>
                        <td className="py-3 px-4 font-semibold text-slate-800">Headquarters Central Depot (HQ-DELHI)</td>
                        <td className="py-3 px-4 text-slate-600">Delhi</td>
                        <td className="py-3 px-4 font-mono">07AAAAA0000A1Z5</td>
                        <td className="py-3 px-4 text-right font-mono font-bold">₹58,400,000.00</td>
                        <td className="py-3 px-4 text-right font-mono">₹18,420,000.00</td>
                      </tr>
                      <tr>
                        <td className="py-3 px-4 font-semibold text-slate-800">Western Zonal Depot (BHW-MUM)</td>
                        <td className="py-3 px-4 text-slate-600">Maharashtra</td>
                        <td className="py-3 px-4 font-mono">27AAAAA0000A1Z2</td>
                        <td className="py-3 px-4 text-right font-mono font-bold">₹14,800,000.00</td>
                        <td className="py-3 px-4 text-right font-mono">₹7,150,000.00</td>
                      </tr>
                      <tr>
                        <td className="py-3 px-4 font-semibold text-slate-800">Southern Distribution Hub (STH-BLR)</td>
                        <td className="py-3 px-4 text-slate-600">Karnataka</td>
                        <td className="py-3 px-4 font-mono">29AAAAA0000A1Z8</td>
                        <td className="py-3 px-4 text-right font-mono font-bold">₹6,300,000.00</td>
                        <td className="py-3 px-4 text-right font-mono">₹4,200,000.00</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* TAB 7: DYNAMIC BRANDING & THEME */}
      {activeTab === 'BRANDING' && (
        <div className="space-y-6">
          <BrandCustomizer />
        </div>
      )}

      {/* Modal: Add New Branch */}
      <Modal
        isOpen={isBranchModalOpen}
        onClose={() => setIsBranchModalOpen(false)}
        title="Add Regional Branch Depot"
        subtitle="Provision a state-wise distribution depot with separate GSTIN and invoice prefix."
        maxWidth="md"
      >
        <form onSubmit={handleSaveBranch} className="space-y-4">
          <FormField label="Branch Name" required>
            <Input
              placeholder="e.g. Eastern Regional Depot"
              value={newBranchName}
              onChange={(e) => setNewBranchName(e.target.value)}
              required
            />
          </FormField>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Branch Code" required>
              <Input
                placeholder="EAST-KOL"
                value={newBranchCode}
                onChange={(e) => setNewBranchCode(e.target.value)}
                required
              />
            </FormField>
            <FormField label="State" required>
              <Input
                placeholder="West Bengal"
                value={newBranchState}
                onChange={(e) => setNewBranchState(e.target.value)}
                required
              />
            </FormField>
          </div>
          <FormField label="Branch State GSTIN (15 Chars)" required>
            <Input
              placeholder="19AAAAA0000A1Z1"
              value={newBranchGstin}
              onChange={(e) => setNewBranchGstin(e.target.value)}
              className="font-mono uppercase"
              required
            />
          </FormField>
          <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
            <Button variant="secondary" size="sm" type="button" onClick={() => setIsBranchModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit">
              Save Branch Depot
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal: Create Fiscal Year */}
      <Modal
        isOpen={isFYModalOpen}
        onClose={() => setIsFYModalOpen(false)}
        title="Create Financial Year"
        subtitle="Define new accounting cycle and starting period."
        maxWidth="sm"
      >
        <form onSubmit={handleSaveFY} className="space-y-4">
          <FormField label="Fiscal Year Name" required>
            <Input
              placeholder="FY 2027-2028"
              value={newFYName}
              onChange={(e) => setNewFYName(e.target.value)}
              required
            />
          </FormField>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Start Date" required>
              <Input
                type="date"
                value={newFYStartDate}
                onChange={(e) => setNewFYStartDate(e.target.value)}
                required
              />
            </FormField>
            <FormField label="End Date" required>
              <Input
                type="date"
                value={newFYEndDate}
                onChange={(e) => setNewFYEndDate(e.target.value)}
                required
              />
            </FormField>
          </div>
          <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
            <Button variant="secondary" size="sm" type="button" onClick={() => setIsFYModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit">
              Create Fiscal Cycle
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
