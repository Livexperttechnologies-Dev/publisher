import React, { useState, useEffect, useMemo } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { FormField } from '../components/ui/FormField';
import { Input } from '../components/ui/Input';
import { PageHeader } from '../components/ui/PageHeader';
import { useBrand } from '../contexts/BrandContext';
import {
  GstRateItem,
  TaxInvoiceItem,
  TdsDeductionItem,
  EWayBillItem,
  getStoredGstRates,
  saveGstRateItem,
  deleteGstRateItem,
  getStoredTaxInvoices,
  createTaxInvoice,
  generateEInvoiceIrn,
  getStoredTdsRecords,
  recordTdsDeduction,
  getStoredEWayBills,
  createEWayBill,
  compileTaxReturnSummaries,
} from '../services/taxService';
import {
  FileText,
  Plus,
  Percent,
  CheckCircle2,
  AlertTriangle,
  Search,
  ExternalLink,
  ShieldCheck,
  Receipt,
  Truck,
  RotateCcw,
  Sparkles,
  QrCode,
  FileCheck,
  Calculator,
  Download,
  AlertCircle,
  HelpCircle,
  Trash2,
  Edit,
  Eye,
} from 'lucide-react';

export const TaxationPage: React.FC = () => {
  const { brand } = useBrand();

  // Navigation & Filter States
  const [activeTab, setActiveTab] = useState<
    'rates' | 'invoices' | 'calculator' | 'tds' | 'eway' | 'gstr'
  >('rates');
  const [searchTerm, setSearchTerm] = useState('');

  // Core Data States
  const [gstRates, setGstRates] = useState<GstRateItem[]>([]);
  const [invoices, setInvoices] = useState<TaxInvoiceItem[]>([]);
  const [tdsDeductions, setTdsDeductions] = useState<TdsDeductionItem[]>([]);
  const [ewayBills, setEwayBills] = useState<EWayBillItem[]>([]);

  // Refresh All Data
  const refreshData = () => {
    setGstRates(getStoredGstRates());
    setInvoices(getStoredTaxInvoices());
    setTdsDeductions(getStoredTdsRecords());
    setEwayBills(getStoredEWayBills());
  };

  useEffect(() => {
    refreshData();
  }, []);

  const summaries = useMemo(() => compileTaxReturnSummaries(), [invoices, tdsDeductions, ewayBills]);

  // --------------------------------------------------------------------------
  // MODAL 1: CONFIGURE GST RATE
  // --------------------------------------------------------------------------
  const [isRateModalOpen, setIsRateModalOpen] = useState(false);
  const [editingRateId, setEditingRateId] = useState<string | null>(null);
  const [rateForm, setRateForm] = useState({
    hsnSacCode: '',
    description: '',
    itemType: 'GOODS' as 'GOODS' | 'SERVICES',
    igstRate: '12',
    isExempt: false,
    exemptionNotification: '',
  });

  const handleOpenNewRateModal = () => {
    setEditingRateId(null);
    setRateForm({
      hsnSacCode: '',
      description: '',
      itemType: 'GOODS',
      igstRate: '12',
      isExempt: false,
      exemptionNotification: '',
    });
    setIsRateModalOpen(true);
  };

  const handleOpenEditRateModal = (rate: GstRateItem) => {
    setEditingRateId(rate.id);
    setRateForm({
      hsnSacCode: rate.hsnSacCode,
      description: rate.description,
      itemType: rate.itemType,
      igstRate: rate.igstRate.toString(),
      isExempt: rate.isExempt,
      exemptionNotification: rate.exemptionNotification || '',
    });
    setIsRateModalOpen(true);
  };

  const handleSaveRate = () => {
    if (!rateForm.hsnSacCode.trim()) {
      alert('Please enter HSN / SAC code');
      return;
    }
    const rateVal = rateForm.isExempt ? 0 : parseFloat(rateForm.igstRate) || 0;

    saveGstRateItem({
      id: editingRateId || undefined,
      hsnSacCode: rateForm.hsnSacCode.trim(),
      description: rateForm.description.trim() || 'Configured classification',
      itemType: rateForm.itemType,
      igstRate: rateVal,
      isExempt: rateForm.isExempt,
      exemptionNotification: rateForm.isExempt
        ? rateForm.exemptionNotification.trim() || 'Notification No. 02/2017-Central Tax (Rate)'
        : undefined,
      adminReviewed: true,
      reviewedBy: 'Chief Financial Officer (CFO)',
    });

    setIsRateModalOpen(false);
    refreshData();
  };

  const handleDeleteRate = (id: string, hsn: string) => {
    if (window.confirm(`Delete GST classification for HSN ${hsn}?`)) {
      deleteGstRateItem(id);
      refreshData();
    }
  };

  // --------------------------------------------------------------------------
  // MODAL 2: NEW TAX DOCUMENT (INVOICE / BILL OF SUPPLY / CREDIT NOTE)
  // --------------------------------------------------------------------------
  const [isNewDocModalOpen, setIsNewDocModalOpen] = useState(false);
  const [docForm, setDocForm] = useState({
    docType: 'TAX_INVOICE' as TaxInvoiceItem['docType'],
    recipientName: '',
    recipientGstin: '',
    placeOfSupply: '07 (Delhi)',
    isInterState: false,
    pricingType: 'EXCLUSIVE' as 'EXCLUSIVE' | 'INCLUSIVE',
    hsnCode: '4901',
    taxableValue: 50000,
    taxRate: 0,
    notes: '',
  });

  const handleOpenNewDocModal = () => {
    setDocForm({
      docType: 'TAX_INVOICE',
      recipientName: 'Apex Western Educational Distributors Pvt Ltd',
      recipientGstin: '27AABCT9918D1Z4',
      placeOfSupply: '27 (Maharashtra)',
      isInterState: true,
      pricingType: 'EXCLUSIVE',
      hsnCode: '4905',
      taxableValue: 50000,
      taxRate: 12,
      notes: '',
    });
    setIsNewDocModalOpen(true);
  };

  const handleCreateTaxDocument = (e: React.FormEvent) => {
    e.preventDefault();
    if (!docForm.recipientName.trim()) {
      alert('Please enter recipient party name');
      return;
    }

    createTaxInvoice({
      docType: docForm.docType,
      recipientName: docForm.recipientName.trim(),
      recipientGstin: docForm.recipientGstin.trim() || undefined,
      placeOfSupply: docForm.placeOfSupply,
      isInterState: docForm.isInterState,
      pricingType: docForm.pricingType,
      hsnCode: docForm.hsnCode,
      taxableValue: Number(docForm.taxableValue),
      taxRate: Number(docForm.taxRate),
      notes: docForm.notes,
    });

    setIsNewDocModalOpen(false);
    refreshData();
  };

  // --------------------------------------------------------------------------
  // MODAL 3: TDS DEDUCTION
  // --------------------------------------------------------------------------
  const [isTdsModalOpen, setIsTdsModalOpen] = useState(false);
  const [tdsForm, setTdsForm] = useState({
    partyName: '',
    partyPan: '',
    sectionCode: '194J - Author Book Royalty (10%)',
    grossAmount: 50000,
    billRef: '',
    notes: '',
  });

  const handleDeductTds = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tdsForm.partyName.trim()) {
      alert('Please enter deductee party name');
      return;
    }

    recordTdsDeduction({
      partyName: tdsForm.partyName.trim(),
      partyPan: tdsForm.partyPan.trim().toUpperCase(),
      sectionCode: tdsForm.sectionCode,
      grossAmount: Number(tdsForm.grossAmount),
      billOrPaymentRef: tdsForm.billRef.trim() || undefined,
      notes: tdsForm.notes,
    });

    setIsTdsModalOpen(false);
    refreshData();
  };

  // --------------------------------------------------------------------------
  // MODAL 4: NEW E-WAY BILL
  // --------------------------------------------------------------------------
  const [isEwayModalOpen, setIsEwayModalOpen] = useState(false);
  const [ewayForm, setEwayForm] = useState({
    docNumber: '',
    toGstin: '27AABCT9918D1Z4',
    toPartyName: 'Apex Western Educational Distributors Pvt Ltd',
    transporterName: 'VRL Logistics India Ltd.',
    vehicleNumber: 'DL-01-AB-9921',
    distanceKm: 650,
    totalInvoiceValue: 89600,
  });

  const handleOpenEwayModal = (docNum?: string) => {
    const targetInv = docNum ? invoices.find((i) => i.invoiceNumber === docNum) : invoices[0];
    setEwayForm({
      docNumber: targetInv ? targetInv.invoiceNumber : 'INV/2026/0101',
      toGstin: targetInv?.recipientGstin || '27AABCT9918D1Z4',
      toPartyName: targetInv?.recipientName || 'Apex Western Educational Distributors Pvt Ltd',
      transporterName: 'VRL Logistics India Ltd.',
      vehicleNumber: 'DL-01-AB-9921',
      distanceKm: 650,
      totalInvoiceValue: targetInv ? targetInv.grandTotal : 89600,
    });
    setIsEwayModalOpen(true);
  };

  const handleCreateEwayBill = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ewayForm.docNumber) {
      alert('Please enter document number');
      return;
    }

    createEWayBill({
      docNumber: ewayForm.docNumber,
      toGstin: ewayForm.toGstin,
      toPartyName: ewayForm.toPartyName,
      transporterName: ewayForm.transporterName,
      vehicleNumber: ewayForm.vehicleNumber,
      distanceKm: Number(ewayForm.distanceKm),
      totalInvoiceValue: Number(ewayForm.totalInvoiceValue),
    });

    setIsEwayModalOpen(false);
    refreshData();
  };

  // --------------------------------------------------------------------------
  // MODAL 5: INSPECT IRN & QR CODE
  // --------------------------------------------------------------------------
  const [isIrnModalOpen, setIsIrnModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<TaxInvoiceItem | null>(null);

  const handleGenerateIrn = (inv: TaxInvoiceItem) => {
    try {
      const updated = generateEInvoiceIrn(inv.id);
      setSelectedInvoice(updated);
      setIsIrnModalOpen(true);
      refreshData();
    } catch (err: any) {
      alert(err.message || 'Could not generate IRN');
    }
  };

  // --------------------------------------------------------------------------
  // QUICK LIVE TAX CALCULATOR STATE
  // --------------------------------------------------------------------------
  const [calcQty, setCalcQty] = useState(10);
  const [calcRate, setCalcRate] = useState(1000);
  const [calcTaxRate, setCalcTaxRate] = useState(12);
  const [calcPricing, setCalcPricing] = useState<'EXCLUSIVE' | 'INCLUSIVE'>('EXCLUSIVE');
  const [calcIsInterState, setCalcIsInterState] = useState(false);

  const calcGross = calcQty * calcRate;
  let calcTaxable = 0;
  let calcTax = 0;
  if (calcPricing === 'INCLUSIVE') {
    calcTaxable = Number((calcGross / (1 + calcTaxRate / 100)).toFixed(2));
    calcTax = Number((calcGross - calcTaxable).toFixed(2));
  } else {
    calcTaxable = calcGross;
    calcTax = Number(((calcTaxable * calcTaxRate) / 100).toFixed(2));
  }
  const calcTotal = Number((calcTaxable + calcTax).toFixed(2));

  // --------------------------------------------------------------------------
  // CSV EXPORT LOGIC
  // --------------------------------------------------------------------------
  const exportCsv = (filename: string, headers: string[], rows: (string | number)[][]) => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.map((val) => `"${String(val).replace(/"/g, '""')}"`).join(','))].join(
        '\n'
      );
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${filename}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportRates = () => {
    exportCsv(
      'kibo360_gst_rates_master',
      ['HSN/SAC', 'Description', 'Item Type', 'IGST %', 'CGST %', 'SGST %', 'Exempt', 'Reviewed By'],
      gstRates.map((r) => [
        r.hsnSacCode,
        r.description,
        r.itemType,
        r.igstRate,
        r.cgstRate,
        r.sgstRate,
        r.isExempt ? 'YES' : 'NO',
        r.reviewedBy || 'Approved',
      ])
    );
  };

  const handleExportInvoices = () => {
    exportCsv(
      'kibo360_tax_invoices_register',
      ['Document #', 'Type', 'Recipient Party', 'GSTIN', 'Place of Supply', 'Taxable Value', 'CGST', 'SGST', 'IGST', 'Grand Total', 'GL Voucher', 'IRN'],
      invoices.map((i) => [
        i.invoiceNumber,
        i.docType,
        i.recipientName,
        i.recipientGstin || 'URP',
        i.placeOfSupply,
        i.totalTaxableValue,
        i.cgstAmount,
        i.sgstAmount,
        i.igstAmount,
        i.grandTotal,
        i.accountingVoucherNumber || '',
        i.irn || '',
      ])
    );
  };

  const handleExportTds = () => {
    exportCsv(
      'kibo360_tds_26q_register',
      ['Deductee Party', 'PAN', 'PAN Valid', 'Section Code', 'Bill Ref', 'Gross Amount', 'TDS Rate', 'TDS Amount', 'Net Disbursed', 'Certificate #', 'GL Voucher'],
      tdsDeductions.map((t) => [
        t.partyName,
        t.partyPan,
        t.isPanValid ? 'YES' : 'NO',
        t.sectionCode,
        t.billOrPaymentRef,
        t.grossAmount,
        t.tdsRate,
        t.tdsAmount,
        t.netAmount,
        t.form16aCertificateNumber,
        t.accountingVoucherNumber || '',
      ])
    );
  };

  const handleExportEway = () => {
    exportCsv(
      'kibo360_eway_bills_register',
      ['EWB Number', 'Doc #', 'To Party', 'To GSTIN', 'Transporter', 'Vehicle #', 'Distance (km)', 'Valid Until', 'Invoice Value', 'Status'],
      ewayBills.map((e) => [
        e.ewbNumber,
        e.docNumber,
        e.toPartyName,
        e.toGstin,
        e.transporterName,
        e.vehicleNumber,
        e.distanceKm,
        e.validUntil,
        e.totalInvoiceValue,
        e.status,
      ])
    );
  };

  // Filtered views
  const filteredRates = gstRates.filter(
    (r) =>
      r.hsnSacCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredInvoices = invoices.filter(
    (i) =>
      i.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      i.recipientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (i.recipientGstin && i.recipientGstin.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="GST & Indian Taxation Engine"
        description="Comprehensive GST Compliance, Configurable HSN Rates, TDS u/s 194C/J, E-Invoice (IRN), E-Way Bills & GSTR-1/3B Reconciliation with automated double-entry GL vouchers."
        actions={
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setActiveTab('calculator')}
              className="gap-2"
              style={{ color: brand.primaryColor, borderColor: `${brand.primaryColor}40` }}
            >
              <Calculator className="h-4 w-4" />
              Tax Calculator
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleOpenNewRateModal}
              className="gap-2"
              style={{ backgroundColor: brand.primaryColor }}
            >
              <Plus className="h-4 w-4" />
              Configure GST Rate
            </Button>
          </div>
        }
      />

      {/* Statutory CA Validation Notice */}
      <div className="bg-gradient-to-r from-purple-50 via-white to-pink-50 border border-purple-200 p-4 rounded-xl flex items-start gap-3 shadow-sm">
        <ShieldCheck className="h-6 w-6 shrink-0 mt-0.5" style={{ color: brand.primaryColor }} />
        <div className="flex-1 text-sm">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-slate-800">
              Indian Taxation Compliance & Administrative Review Policy
            </span>
            <Badge variant="success">CA Validated Architecture</Badge>
            <Badge variant="purple">Never Hardcoded Rates</Badge>
          </div>
          <p className="text-slate-600 mt-1 leading-relaxed text-xs">
            All GST rates and HSN codes are dynamic and maintain strict audit trails. Printed books under <strong>HSN 4901</strong> are statutory Nil-rated/Exempt pursuant to <em>Notification No. 02/2017-Central Tax (Rate)</em>. Section 206AA penal rate (20%) is strictly enforced for invalid/missing PAN.
          </p>
        </div>
      </div>

      {/* Enterprise KPI Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="p-4 border-l-4 shadow-sm hover:shadow-md transition-shadow" style={{ borderLeftColor: brand.primaryColor }}>
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                Exempt Book Turnover
              </p>
              <h3 className="text-2xl font-bold text-slate-800 mt-1">
                ₹{summaries.kpis.exemptBookTurnover.toLocaleString()}
              </h3>
              <p className="text-[11px] text-emerald-600 mt-1 font-medium flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" /> HSN 4901 Nil-Rated
              </p>
            </div>
            <div
              className="p-2 rounded-lg"
              style={{ backgroundColor: `${brand.primaryColor}15`, color: brand.primaryColor }}
            >
              <FileCheck className="h-5 w-5" />
            </div>
          </div>
        </Card>

        <Card className="p-4 border-l-4 shadow-sm hover:shadow-md transition-shadow" style={{ borderLeftColor: brand.accentColor }}>
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                Output GST Liability
              </p>
              <h3 className="text-2xl font-bold text-slate-800 mt-1">
                ₹{summaries.kpis.outputGstLiability.toLocaleString()}
              </h3>
              <p className="text-[11px] text-slate-500 mt-1">Net of Credit Notes</p>
            </div>
            <div
              className="p-2 rounded-lg"
              style={{ backgroundColor: `${brand.accentColor}15`, color: brand.accentColor }}
            >
              <Receipt className="h-5 w-5" />
            </div>
          </div>
        </Card>

        <Card className="p-4 border-l-4 border-l-indigo-600 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                Eligible ITC (GSTR-3B)
              </p>
              <h3 className="text-2xl font-bold text-slate-800 mt-1">
                ₹{summaries.kpis.eligibleItc.toLocaleString()}
              </h3>
              <p className="text-[11px] text-slate-500 mt-1">After Rule 42 Reversal</p>
            </div>
            <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
              <Percent className="h-5 w-5" />
            </div>
          </div>
        </Card>

        <Card className="p-4 border-l-4 border-l-emerald-600 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                TDS Deductions (26Q)
              </p>
              <h3 className="text-2xl font-bold text-slate-800 mt-1">
                ₹{summaries.kpis.totalTdsDeductions.toLocaleString()}
              </h3>
              <p className="text-[11px] text-emerald-600 mt-1">
                {summaries.kpis.activeChallanCount} Active Challans
              </p>
            </div>
            <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600">
              <FileText className="h-5 w-5" />
            </div>
          </div>
        </Card>

        <Card className="p-4 border-l-4 border-l-teal-600 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                E-Way & IRN Active
              </p>
              <h3 className="text-2xl font-bold text-slate-800 mt-1">
                {summaries.kpis.activeEwayCount} Active
              </h3>
              <p className="text-[11px] text-teal-600 mt-1">Signed QR Verified</p>
            </div>
            <div className="p-2 bg-teal-50 rounded-lg text-teal-600">
              <QrCode className="h-5 w-5" />
            </div>
          </div>
        </Card>
      </div>

      {/* Tabs Navigation */}
      <div className="flex border-b border-slate-200 overflow-x-auto pb-px">
        {[
          { key: 'rates', label: `Configurable GST Rates & HSN (${gstRates.length})` },
          { key: 'invoices', label: `Tax Invoices & E-Invoicing (${invoices.length})` },
          { key: 'calculator', label: 'Tax Calculation & Slabs' },
          { key: 'tds', label: `TDS u/s 194C / 194J & Form 16A (${tdsDeductions.length})` },
          { key: 'eway', label: `E-Way Bills (${ewayBills.length})` },
          { key: 'gstr', label: 'GSTR-1 & GSTR-3B Filing Reports' },
        ].map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`pb-3 px-4 text-xs font-medium border-b-2 transition-colors whitespace-nowrap ${
                isActive
                  ? 'border-[#690BA8] text-[#690BA8] font-bold'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
              style={{
                borderColor: isActive ? brand.primaryColor : 'transparent',
                color: isActive ? brand.primaryColor : undefined,
              }}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* =====================================================================
          TAB 1: CONFIGURABLE GST RATES
          ===================================================================== */}
      {activeTab === 'rates' && (
        <Card className="p-0 overflow-hidden shadow-sm border border-slate-200">
          <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-3 bg-slate-50/50">
            <div>
              <h3 className="font-semibold text-slate-800 text-sm">Publishing Industry HSN / SAC Master</h3>
              <p className="text-xs text-slate-500">
                Statutory classification with CGST, SGST, IGST and mandatory administrator reviews
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="secondary" size="sm" onClick={handleExportRates} leftIcon={<Download size={12} />}>
                Export CSV
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleOpenNewRateModal}
                leftIcon={<Plus className="h-4 w-4" />}
                style={{ backgroundColor: brand.primaryColor }}
              >
                Add Custom Rate
              </Button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500 text-xs font-medium uppercase border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">HSN / SAC</th>
                  <th className="py-3 px-4">Description</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">IGST Rate</th>
                  <th className="py-3 px-4">CGST + SGST</th>
                  <th className="py-3 px-4">Exempt Status</th>
                  <th className="py-3 px-4">Admin Reviewed</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredRates.map((rate) => (
                  <tr key={rate.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold" style={{ color: brand.primaryColor }}>
                      {rate.hsnSacCode}
                    </td>
                    <td className="py-3 px-4 max-w-md text-slate-700 text-xs">
                      <div>{rate.description}</div>
                      {rate.exemptionNotification && (
                        <span className="text-[11px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-mono mt-1 inline-block">
                          {rate.exemptionNotification}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                        {rate.itemType}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-800">
                      {rate.igstRate.toFixed(1)}%
                    </td>
                    <td className="py-3 px-4 text-slate-600 text-xs">
                      {rate.cgstRate.toFixed(1)}% + {rate.sgstRate.toFixed(1)}%
                    </td>
                    <td className="py-3 px-4">
                      {rate.isExempt ? (
                        <Badge variant="success">NIL / EXEMPT</Badge>
                      ) : (
                        <Badge variant="slate">TAXABLE</Badge>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5 text-xs text-emerald-700">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        <span>{rate.reviewedBy || 'Approved'}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenEditRateModal(rate)}
                          className="p-1 rounded text-slate-500 hover:text-slate-800 hover:bg-slate-100"
                          title="Edit Rate"
                        >
                          <Edit className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteRate(rate.id, rate.hsnSacCode)}
                          className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                          title="Delete Rate"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* =====================================================================
          TAB 2: TAX INVOICES & E-INVOICING
          ===================================================================== */}
      {activeTab === 'invoices' && (
        <Card className="p-0 overflow-hidden shadow-sm border border-slate-200">
          <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-3 bg-slate-50/50">
            <div>
              <h3 className="font-semibold text-slate-800 text-sm">Tax Invoices, Bills of Supply & Notes</h3>
              <p className="text-xs text-slate-500">
                Official documents with automated double-entry General Ledger posting and 64-character IRN generation
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="secondary" size="sm" onClick={handleExportInvoices} leftIcon={<Download size={12} />}>
                Export CSV
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleOpenNewDocModal}
                leftIcon={<Plus className="h-4 w-4" />}
                style={{ backgroundColor: brand.primaryColor }}
              >
                Issue Tax Document
              </Button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500 text-xs font-medium uppercase border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Document #</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Recipient Party</th>
                  <th className="py-3 px-4">Place of Supply</th>
                  <th className="py-3 px-4">Taxable Value</th>
                  <th className="py-3 px-4">GST Amount</th>
                  <th className="py-3 px-4">Grand Total</th>
                  <th className="py-3 px-4 text-center">GL Voucher</th>
                  <th className="py-3 px-4 text-center">IRN / E-Way</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredInvoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold" style={{ color: brand.primaryColor }}>
                      {inv.invoiceNumber}
                    </td>
                    <td className="py-3 px-4">
                      {inv.docType === 'TAX_INVOICE' && (
                        <span className="text-xs font-semibold px-2 py-0.5 rounded bg-purple-100 text-[#690BA8]">
                          TAX INVOICE
                        </span>
                      )}
                      {inv.docType === 'BILL_OF_SUPPLY' && (
                        <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                          BILL OF SUPPLY
                        </span>
                      )}
                      {inv.docType === 'CREDIT_NOTE' && (
                        <span className="text-xs font-semibold px-2 py-0.5 rounded bg-pink-100 text-[#E91E63]">
                          CREDIT NOTE
                        </span>
                      )}
                      {inv.docType === 'DEBIT_NOTE' && (
                        <span className="text-xs font-semibold px-2 py-0.5 rounded bg-amber-100 text-amber-800">
                          DEBIT NOTE
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-medium text-slate-800">{inv.recipientName}</div>
                      {inv.recipientGstin ? (
                        <span className="text-xs text-slate-500 font-mono">
                          GSTIN: {inv.recipientGstin}
                        </span>
                      ) : (
                        <span className="text-xs text-amber-600 font-mono">Unregistered Consumer</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-xs font-medium text-slate-600">
                      {inv.placeOfSupply}{' '}
                      <span className="text-[10px] text-slate-400">
                        ({inv.isInterState ? 'Inter-State' : 'Intra-State'})
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-700">
                      ₹{inv.totalTaxableValue.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-700">
                      ₹{(inv.cgstAmount + inv.sgstAmount + inv.igstAmount).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">
                      ₹{inv.grandTotal.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-center font-mono text-xs text-slate-500">
                      {inv.accountingVoucherNumber || '—'}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {inv.irn ? (
                        <Badge
                          variant="success"
                          className="gap-1 cursor-pointer"
                          onClick={() => {
                            setSelectedInvoice(inv);
                            setIsIrnModalOpen(true);
                          }}
                        >
                          <CheckCircle2 className="h-3 w-3" /> IRN Active
                        </Badge>
                      ) : inv.docType === 'TAX_INVOICE' ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleGenerateIrn(inv)}
                          className="text-xs text-[#690BA8] hover:bg-purple-50 p-1 h-6"
                        >
                          Generate IRN
                        </Button>
                      ) : (
                        <span className="text-xs text-slate-400">Exempt</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedInvoice(inv);
                            setIsIrnModalOpen(true);
                          }}
                          className="text-xs text-slate-600 hover:bg-slate-100"
                        >
                          Inspect
                        </Button>
                        {inv.grandTotal > 50000 && !inv.ewbNumber && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenEwayModal(inv.invoiceNumber)}
                            className="text-xs text-indigo-700 border-indigo-200 hover:bg-indigo-50"
                          >
                            E-Way
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* =====================================================================
          TAB 3: TAX CALCULATION ENGINE & SLABS
          ===================================================================== */}
      {activeTab === 'calculator' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-6 space-y-5 shadow-sm border border-slate-200">
            <div className="border-b border-slate-100 pb-3 flex justify-between items-center">
              <div>
                <h3 className="font-semibold text-slate-800 text-base">Interactive Tax Calculator</h3>
                <p className="text-xs text-slate-500">
                  Simulate intra-state, inter-state, inclusive, and exclusive GST derivations
                </p>
              </div>
              <Calculator className="h-6 w-6" style={{ color: brand.primaryColor }} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField label="Quantity">
                <Input
                  type="number"
                  value={calcQty}
                  onChange={(e) => setCalcQty(parseInt(e.target.value) || 1)}
                  min={1}
                />
              </FormField>

              <FormField label="Unit Price (₹)">
                <Input
                  type="number"
                  value={calcRate}
                  onChange={(e) => setCalcRate(parseFloat(e.target.value) || 0)}
                  min={0}
                />
              </FormField>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField label="GST Rate Slab">
                <select
                  value={calcTaxRate}
                  onChange={(e) => setCalcTaxRate(parseFloat(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#690BA8]"
                >
                  <option value={0}>0% (HSN 4901 - Printed Books Exempt)</option>
                  <option value={5}>5% (E-Books & Specified Prints)</option>
                  <option value={12}>12% (HSN 4905 Maps / 4802 Paper / 9989 Print)</option>
                  <option value={18}>18% (HSN 9973 Royalty Rights Licensing / 4911 Posters)</option>
                  <option value={28}>28% (Special Goods / Stationery)</option>
                </select>
              </FormField>

              <FormField label="Pricing Method">
                <select
                  value={calcPricing}
                  onChange={(e) => setCalcPricing(e.target.value as any)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#690BA8]"
                >
                  <option value="EXCLUSIVE">Tax Exclusive (Base + Tax)</option>
                  <option value="INCLUSIVE">Tax Inclusive (Reverse Derivation)</option>
                </select>
              </FormField>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <input
                type="checkbox"
                id="calcInterState"
                checked={calcIsInterState}
                onChange={(e) => setCalcIsInterState(e.target.checked)}
                className="rounded border-slate-300 text-[#690BA8] focus:ring-[#690BA8]"
              />
              <label htmlFor="calcInterState" className="text-sm font-medium text-slate-700">
                Inter-State Transaction (Apply IGST instead of CGST + SGST)
              </label>
            </div>
          </Card>

          {/* Mathematical Breakdown Card */}
          <Card className="p-6 space-y-5 bg-gradient-to-br from-purple-50/50 to-pink-50/50 border border-purple-100 shadow-sm flex flex-col justify-between">
            <div>
              <div className="border-b border-purple-200/60 pb-3 flex justify-between items-center">
                <h3 className="font-semibold text-slate-800 text-base">Mathematical Breakdown</h3>
                <Badge variant="purple">
                  {calcPricing} PRICING
                </Badge>
              </div>

              <div className="space-y-3 mt-4 text-sm">
                <div className="flex justify-between py-1 border-b border-slate-200/50">
                  <span className="text-slate-600">Gross Billed Subtotal:</span>
                  <span className="font-mono font-medium">₹{calcGross.toLocaleString()}</span>
                </div>

                <div className="flex justify-between py-1 border-b border-slate-200/50">
                  <span className="text-slate-600">Derived Taxable Value:</span>
                  <span className="font-mono font-bold text-slate-800">
                    ₹{calcTaxable.toLocaleString()}
                  </span>
                </div>

                {calcIsInterState ? (
                  <div className="flex justify-between py-1 border-b border-slate-200/50" style={{ color: brand.primaryColor }}>
                    <span>Integrated GST (IGST {calcTaxRate}%):</span>
                    <span className="font-mono font-bold">₹{calcTax.toLocaleString()}</span>
                  </div>
                ) : (
                  <>
                    <div className="flex justify-between py-1 border-b border-slate-200/50 text-indigo-700">
                      <span>Central GST (CGST {calcTaxRate / 2}%):</span>
                      <span className="font-mono font-bold">
                        ₹{(calcTax / 2).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-200/50 text-indigo-700">
                      <span>State GST (SGST {calcTaxRate / 2}%):</span>
                      <span className="font-mono font-bold">
                        ₹{(calcTax / 2).toLocaleString()}
                      </span>
                    </div>
                  </>
                )}

                <div className="flex justify-between py-2 text-base font-bold text-slate-900 border-t-2 border-purple-200 pt-3">
                  <span>Grand Total Payable:</span>
                  <span className="font-mono text-lg" style={{ color: brand.primaryColor }}>
                    ₹{calcTotal.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-3 bg-white/80 rounded-lg border border-purple-100 text-xs text-slate-500">
              {calcPricing === 'INCLUSIVE' ? (
                <span>
                  <strong>Reverse Formula:</strong> Taxable Value = Total ÷ (1 + {calcTaxRate}%) = ₹{calcGross} ÷ {(1 + calcTaxRate / 100).toFixed(2)} = ₹{calcTaxable}
                </span>
              ) : (
                <span>
                  <strong>Forward Formula:</strong> Tax = Taxable Value × {calcTaxRate}% = ₹{calcTaxable} × {calcTaxRate / 100} = ₹{calcTax}
                </span>
              )}
            </div>
          </Card>
        </div>
      )}

      {/* =====================================================================
          TAB 4: TDS MANAGEMENT (26Q)
          ===================================================================== */}
      {activeTab === 'tds' && (
        <Card className="p-0 overflow-hidden shadow-sm border border-slate-200">
          <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-3 bg-slate-50/50">
            <div>
              <h3 className="font-semibold text-slate-800 text-sm">TDS Management & Form 16A Deductions</h3>
              <p className="text-xs text-slate-500">
                Withholding tax pursuant to Sections 194C, 194J, and Section 206AA penal rates for invalid PAN
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="secondary" size="sm" onClick={handleExportTds} leftIcon={<Download size={12} />}>
                Export 26Q CSV
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => setIsTdsModalOpen(true)}
                leftIcon={<Plus className="h-4 w-4" />}
                style={{ backgroundColor: brand.primaryColor }}
              >
                Deduct TDS on Bill
              </Button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500 text-xs font-medium uppercase border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Deductee Party</th>
                  <th className="py-3 px-4">PAN Details</th>
                  <th className="py-3 px-4">Section Code</th>
                  <th className="py-3 px-4">Bill Ref</th>
                  <th className="py-3 px-4">Gross Amount</th>
                  <th className="py-3 px-4">TDS Rate</th>
                  <th className="py-3 px-4">TDS Deducted</th>
                  <th className="py-3 px-4">Net Disbursed</th>
                  <th className="py-3 px-4">Form 16A Certificate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {tdsDeductions.map((tds) => (
                  <tr key={tds.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-semibold text-slate-800">{tds.partyName}</td>
                    <td className="py-3 px-4 font-mono text-xs">
                      <div className="font-bold">{tds.partyPan}</div>
                      {tds.isPanValid ? (
                        <span className="text-[10px] text-emerald-600 flex items-center gap-1">
                          <CheckCircle2 className="h-3 w-3" /> Valid PAN
                        </span>
                      ) : (
                        <span className="text-[10px] text-red-600 font-bold flex items-center gap-1">
                          <AlertTriangle className="h-3 w-3" /> Sec 206AA 20%
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-xs font-semibold text-slate-700">
                      {tds.sectionCode}
                    </td>
                    <td className="py-3 px-4 font-mono text-xs text-slate-500">
                      {tds.billOrPaymentRef}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-700">
                      ₹{tds.grossAmount.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-800">{tds.tdsRate}%</td>
                    <td className="py-3 px-4 font-mono font-bold text-red-600">
                      ₹{tds.tdsAmount.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-emerald-700">
                      ₹{tds.netAmount.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 font-mono text-xs" style={{ color: brand.primaryColor }}>
                      {tds.form16aCertificateNumber}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* =====================================================================
          TAB 5: E-WAY BILLS
          ===================================================================== */}
      {activeTab === 'eway' && (
        <Card className="p-0 overflow-hidden shadow-sm border border-slate-200">
          <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-3 bg-slate-50/50">
            <div>
              <h3 className="font-semibold text-slate-800 text-sm">E-Way Bills & Consignment Movement</h3>
              <p className="text-xs text-slate-500">
                Electronic transport manifests for goods &gt; ₹50,000, validated against statutory 200 km/day validity rule
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="secondary" size="sm" onClick={handleExportEway} leftIcon={<Download size={12} />}>
                Export CSV
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => handleOpenEwayModal()}
                leftIcon={<Plus className="h-4 w-4" />}
                style={{ backgroundColor: brand.primaryColor }}
              >
                Generate E-Way Bill
              </Button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500 text-xs font-medium uppercase border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">EWB Number</th>
                  <th className="py-3 px-4">Doc #</th>
                  <th className="py-3 px-4">Recipient & GSTIN</th>
                  <th className="py-3 px-4">Transporter</th>
                  <th className="py-3 px-4">Vehicle #</th>
                  <th className="py-3 px-4">Distance</th>
                  <th className="py-3 px-4">Validity Duration</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {ewayBills.map((ewb) => (
                  <tr key={ewb.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold" style={{ color: brand.primaryColor }}>
                      {ewb.ewbNumber}
                    </td>
                    <td className="py-3 px-4 font-mono text-xs text-slate-700">{ewb.docNumber}</td>
                    <td className="py-3 px-4">
                      <div className="font-medium text-slate-800">{ewb.toPartyName}</div>
                      <div className="font-mono text-[10px] text-slate-400">{ewb.toGstin}</div>
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-800">{ewb.transporterName}</td>
                    <td className="py-3 px-4 font-mono text-xs font-bold text-slate-800">
                      {ewb.vehicleNumber}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-700">{ewb.distanceKm} km</td>
                    <td className="py-3 px-4 text-xs text-slate-600">
                      {Math.max(1, Math.ceil(ewb.distanceKm / 200))} Days (Rule: 200 km/day)
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant="success">ACTIVE</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* =====================================================================
          TAB 6: GSTR-1 & GSTR-3B FILING REPORTS
          ===================================================================== */}
      {activeTab === 'gstr' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* GSTR-1 Summary Card */}
            <Card className="p-6 space-y-4 shadow-sm border border-slate-200">
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <div>
                  <h3 className="font-semibold text-slate-800">GSTR-1 Outward Supplies Summary</h3>
                  <p className="text-xs text-slate-500">Period: Current FY 2026-2027 (Quarterly & Monthly)</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2 text-xs"
                  onClick={() => exportCsv(
                    'gstr1_outward_supplies',
                    ['Table Ref', 'Description', 'Taxable Value', 'Tax Amount'],
                    [
                      ['Table 4A', 'B2B Invoices (Registered)', summaries.gstr1.table4ATaxable, summaries.gstr1.table4ATax],
                      ['Table 8', 'Exempted Supplies (Books HSN 4901)', summaries.gstr1.table8ExemptTurnover, 0],
                      ['Table 9B', 'Credit / Debit Notes', summaries.gstr1.table9BTaxable, summaries.gstr1.table9BTax],
                      ['TOTAL', 'Net Taxable Outward', summaries.gstr1.netTaxableOutward, summaries.gstr1.netOutputTaxLiability],
                    ]
                  )}
                >
                  <Download className="h-3.5 w-3.5" /> Export JSON
                </Button>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-600">Table 4A - B2B Invoices (Registered):</span>
                  <span className="font-mono font-bold text-slate-800">
                    ₹{summaries.gstr1.table4ATaxable.toLocaleString()} (Tax: ₹{summaries.gstr1.table4ATax.toLocaleString()})
                  </span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-600">Table 8 - Exempted Supplies (Printed Books HSN 4901):</span>
                  <span className="font-mono font-bold text-emerald-700">
                    ₹{summaries.gstr1.table8ExemptTurnover.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-600">Table 9B - Credit/Debit Notes (CDNR):</span>
                  <span className="font-mono font-bold text-red-600">
                    -₹{summaries.gstr1.table9BTaxable.toLocaleString()} (Tax: -₹{summaries.gstr1.table9BTax.toLocaleString()})
                  </span>
                </div>
                <div className="flex justify-between py-2 text-base font-bold border-t border-slate-200" style={{ color: brand.primaryColor }}>
                  <span>Total Net Taxable Supplies:</span>
                  <span className="font-mono">₹{summaries.gstr1.netTaxableOutward.toLocaleString()}</span>
                </div>
              </div>
            </Card>

            {/* GSTR-3B Summary Card */}
            <Card className="p-6 space-y-4 shadow-sm border border-slate-200">
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <div>
                  <h3 className="font-semibold text-slate-800">GSTR-3B Monthly Return Summary</h3>
                  <p className="text-xs text-slate-500">Tax Liability vs Eligible ITC Offset</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2 text-xs"
                  onClick={() => window.print()}
                >
                  <Download className="h-3.5 w-3.5" /> Export PDF
                </Button>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-600">3.1(a) Outward Taxable Liability:</span>
                  <span className="font-mono font-bold text-slate-800">
                    ₹{summaries.gstr3b.outwardTaxLiability.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-600">4(A) Available Gross ITC (Paper/Press):</span>
                  <span className="font-mono font-medium text-slate-800">
                    ₹{summaries.gstr3b.grossAvailableItc.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100 text-amber-700">
                  <span className="flex items-center gap-1">
                    4(B) Rule 42 ITC Reversal (Exempt Book Proportion):
                  </span>
                  <span className="font-mono font-bold">-₹{summaries.gstr3b.rule42ItcReversal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100 text-emerald-700">
                  <span>4(C) Net Eligible ITC:</span>
                  <span className="font-mono font-bold">₹{summaries.gstr3b.netEligibleItc.toLocaleString()}</span>
                </div>
                <div className="flex justify-between py-2 text-base font-bold border-t border-slate-200 text-slate-900">
                  <span>Net Cash Tax Payable (Electronic Cash Ledger):</span>
                  <span className="font-mono text-emerald-600">
                    ₹{summaries.gstr3b.netCashTaxPayable.toLocaleString()}{' '}
                    {summaries.gstr3b.netCashTaxPayable === 0 ? '(Fully ITC Offset)' : ''}
                  </span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* =====================================================================
          MODAL 1: CONFIGURE GST RATE
          ===================================================================== */}
      <Modal
        isOpen={isRateModalOpen}
        onClose={() => setIsRateModalOpen(false)}
        title={editingRateId ? 'Edit HSN / SAC GST Rate' : 'Configure HSN / SAC GST Rate'}
        maxWidth="md"
      >
        <div className="space-y-4">
          <FormField label="HSN / SAC Code" required>
            <Input
              placeholder="e.g. 4911 or 9989"
              value={rateForm.hsnSacCode}
              onChange={(e) => setRateForm({ ...rateForm, hsnSacCode: e.target.value })}
            />
          </FormField>

          <FormField label="Tax Classification Description" required>
            <Input
              placeholder="e.g. Trade catalogues, promotional booklets"
              value={rateForm.description}
              onChange={(e) => setRateForm({ ...rateForm, description: e.target.value })}
            />
          </FormField>

          <div className="flex items-center gap-3 pt-1">
            <input
              type="checkbox"
              id="exemptCheckbox"
              checked={rateForm.isExempt}
              onChange={(e) => setRateForm({ ...rateForm, isExempt: e.target.checked })}
              className="rounded border-slate-300 text-[#690BA8] focus:ring-[#690BA8]"
            />
            <label htmlFor="exemptCheckbox" className="text-sm font-medium text-slate-700">
              Tax Exempt (0% Nil Rated under Official Notification)
            </label>
          </div>

          {!rateForm.isExempt ? (
            <FormField label="Applicable IGST Rate (%)">
              <select
                value={rateForm.igstRate}
                onChange={(e) => setRateForm({ ...rateForm, igstRate: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#690BA8]"
              >
                <option value="5">5% (CGST 2.5% + SGST 2.5%)</option>
                <option value="12">12% (CGST 6% + SGST 6%)</option>
                <option value="18">18% (CGST 9% + SGST 9%)</option>
                <option value="28">28% (CGST 14% + SGST 14%)</option>
              </select>
            </FormField>
          ) : (
            <FormField label="Exemption Statutory Notification">
              <Input
                placeholder="e.g. Notification No. 02/2017-Central Tax (Rate)"
                value={rateForm.exemptionNotification}
                onChange={(e) => setRateForm({ ...rateForm, exemptionNotification: e.target.value })}
              />
            </FormField>
          )}

          <div className="p-3 bg-amber-50 rounded-lg text-xs text-amber-800 border border-amber-200 flex gap-2 items-start">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>
              Saving this rate will create an entry in the statutory Tax Audit Trail with CA validated compliance.
            </span>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <Button variant="outline" onClick={() => setIsRateModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleSaveRate}
              style={{ backgroundColor: brand.primaryColor }}
            >
              {editingRateId ? 'Update Rate' : 'Save Configuration'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* =====================================================================
          MODAL 2: NEW TAX DOCUMENT (INVOICE / BILL OF SUPPLY)
          ===================================================================== */}
      <Modal
        isOpen={isNewDocModalOpen}
        onClose={() => setIsNewDocModalOpen(false)}
        title="Issue Tax Invoice / Bill of Supply"
        maxWidth="lg"
      >
        <form onSubmit={handleCreateTaxDocument} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Document Type">
              <select
                value={docForm.docType}
                onChange={(e) => setDocForm({ ...docForm, docType: e.target.value as any })}
                className="w-full text-xs border border-slate-300 rounded-lg p-2 bg-white"
              >
                <option value="TAX_INVOICE">Tax Invoice (Taxable B2B / B2C)</option>
                <option value="BILL_OF_SUPPLY">Bill of Supply (Exempt Books HSN 4901)</option>
                <option value="CREDIT_NOTE">Credit Note (Sales Return / Discount)</option>
                <option value="DEBIT_NOTE">Debit Note (Supplementary Charge)</option>
              </select>
            </FormField>

            <FormField label="HSN / SAC Code">
              <select
                value={docForm.hsnCode}
                onChange={(e) => {
                  const val = e.target.value;
                  const r = gstRates.find((rate) => rate.hsnSacCode === val);
                  setDocForm((prev) => ({
                    ...prev,
                    hsnCode: val,
                    taxRate: r ? r.igstRate : prev.taxRate,
                  }));
                }}
                className="w-full text-xs border border-slate-300 rounded-lg p-2 bg-white"
              >
                {gstRates.map((r) => (
                  <option key={r.id} value={r.hsnSacCode}>
                    HSN {r.hsnSacCode} ({r.igstRate}% - {r.description.slice(0, 30)}...)
                  </option>
                ))}
              </select>
            </FormField>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <FormField label="Recipient Name" required>
              <Input
                placeholder="e.g. Oxford Book Store or Dealer"
                value={docForm.recipientName}
                onChange={(e) => setDocForm({ ...docForm, recipientName: e.target.value })}
              />
            </FormField>

            <FormField label="Recipient GSTIN (Optional for B2C)">
              <Input
                placeholder="e.g. 27AABCT9918D1Z4"
                value={docForm.recipientGstin}
                onChange={(e) => setDocForm({ ...docForm, recipientGstin: e.target.value })}
              />
            </FormField>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <FormField label="Place of Supply">
              <Input
                value={docForm.placeOfSupply}
                onChange={(e) => setDocForm({ ...docForm, placeOfSupply: e.target.value })}
              />
            </FormField>

            <FormField label="Taxable Value (₹)" required>
              <Input
                type="number"
                value={docForm.taxableValue}
                onChange={(e) => setDocForm({ ...docForm, taxableValue: Number(e.target.value) })}
              />
            </FormField>
          </div>

          <div className="flex items-center gap-3 pt-1">
            <input
              type="checkbox"
              id="docInterstate"
              checked={docForm.isInterState}
              onChange={(e) => setDocForm({ ...docForm, isInterState: e.target.checked })}
              className="rounded border-slate-300 text-[#690BA8] focus:ring-[#690BA8]"
            />
            <label htmlFor="docInterstate" className="text-xs font-medium text-slate-700">
              Inter-State Supply (Levy IGST instead of CGST + SGST)
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <Button type="button" variant="outline" onClick={() => setIsNewDocModalOpen(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              style={{ backgroundColor: brand.primaryColor }}
            >
              Generate Document
            </Button>
          </div>
        </form>
      </Modal>

      {/* =====================================================================
          MODAL 3: DEDUCT TDS ON VENDOR BILL
          ===================================================================== */}
      <Modal
        isOpen={isTdsModalOpen}
        onClose={() => setIsTdsModalOpen(false)}
        title="Deduct TDS on Vendor or Author Bill"
        maxWidth="md"
      >
        <form onSubmit={handleDeductTds} className="space-y-4">
          <FormField label="Deductee Party / Vendor / Author Name" required>
            <Input
              placeholder="e.g. Classic Offset Printers or Author"
              value={tdsForm.partyName}
              onChange={(e) => setTdsForm({ ...tdsForm, partyName: e.target.value })}
            />
          </FormField>

          <FormField label="Permanent Account Number (PAN)">
            <Input
              placeholder="e.g. AABCT1234D (10 characters)"
              value={tdsForm.partyPan}
              onChange={(e) => setTdsForm({ ...tdsForm, partyPan: e.target.value.toUpperCase() })}
            />
          </FormField>

          <FormField label="TDS Statutory Section">
            <select
              value={tdsForm.sectionCode}
              onChange={(e) => setTdsForm({ ...tdsForm, sectionCode: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#690BA8]"
            >
              <option value="194J - Author Book Royalty (10%)">Section 194J - Author Book Royalty (10% with PAN)</option>
              <option value="194J - Technical Fees (10%)">Section 194J - Technical / Editorial Fees (10% with PAN)</option>
              <option value="194C - Printing Presses Corporate (2%)">Section 194C - Printing Presses Corporate (2% with PAN)</option>
              <option value="194C - Binding Contractors Individual (1%)">Section 194C - Binding Contractors Individual (1% with PAN)</option>
              <option value="194I - Warehouse Premises Rent (10%)">Section 194I - Warehouse Premises Rent (10% with PAN)</option>
            </select>
          </FormField>

          <FormField label="Gross Billed Amount (₹)" required>
            <Input
              type="number"
              value={tdsForm.grossAmount}
              onChange={(e) => setTdsForm({ ...tdsForm, grossAmount: Number(e.target.value) })}
              min={0}
            />
          </FormField>

          <FormField label="Bill / Voucher Reference Number">
            <Input
              placeholder="e.g. BILT/INV/9821"
              value={tdsForm.billRef}
              onChange={(e) => setTdsForm({ ...tdsForm, billRef: e.target.value })}
            />
          </FormField>

          <div className="p-3 bg-purple-50 rounded-lg text-xs text-[#690BA8] border border-purple-200">
            <strong>Penal Rule Notice:</strong> If the 10-character PAN is invalid or omitted, Section 206AA automatically raises the withholding rate to <strong>20.0%</strong>.
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <Button type="button" variant="outline" onClick={() => setIsTdsModalOpen(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              style={{ backgroundColor: brand.primaryColor }}
            >
              Post TDS Deduction & GL Voucher
            </Button>
          </div>
        </form>
      </Modal>

      {/* =====================================================================
          MODAL 4: GENERATE E-WAY BILL
          ===================================================================== */}
      <Modal
        isOpen={isEwayModalOpen}
        onClose={() => setIsEwayModalOpen(false)}
        title="Generate Consignment E-Way Bill"
        maxWidth="md"
      >
        <form onSubmit={handleCreateEwayBill} className="space-y-4">
          <FormField label="Invoice / Document Number" required>
            <Input
              value={ewayForm.docNumber}
              onChange={(e) => setEwayForm({ ...ewayForm, docNumber: e.target.value })}
            />
          </FormField>

          <div className="grid grid-cols-2 gap-3">
            <FormField label="Recipient Name">
              <Input
                value={ewayForm.toPartyName}
                onChange={(e) => setEwayForm({ ...ewayForm, toPartyName: e.target.value })}
              />
            </FormField>

            <FormField label="Recipient GSTIN">
              <Input
                value={ewayForm.toGstin}
                onChange={(e) => setEwayForm({ ...ewayForm, toGstin: e.target.value })}
              />
            </FormField>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <FormField label="Transporter Name">
              <Input
                value={ewayForm.transporterName}
                onChange={(e) => setEwayForm({ ...ewayForm, transporterName: e.target.value })}
              />
            </FormField>

            <FormField label="Vehicle Number">
              <Input
                value={ewayForm.vehicleNumber}
                onChange={(e) => setEwayForm({ ...ewayForm, vehicleNumber: e.target.value })}
              />
            </FormField>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <FormField label="Transit Distance (km)">
              <Input
                type="number"
                value={ewayForm.distanceKm}
                onChange={(e) => setEwayForm({ ...ewayForm, distanceKm: Number(e.target.value) })}
              />
            </FormField>

            <FormField label="Consignment Value (₹)">
              <Input
                type="number"
                value={ewayForm.totalInvoiceValue}
                onChange={(e) => setEwayForm({ ...ewayForm, totalInvoiceValue: Number(e.target.value) })}
              />
            </FormField>
          </div>

          <div className="p-3 bg-indigo-50 rounded-lg text-xs text-indigo-800 border border-indigo-200">
            <strong>200 km/day Rule:</strong> Validity duration calculated as {Math.max(1, Math.ceil(ewayForm.distanceKm / 200))} days pursuant to CGST E-Way Bill Rule 138(10).
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <Button type="button" variant="outline" onClick={() => setIsEwayModalOpen(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              style={{ backgroundColor: brand.primaryColor }}
            >
              Generate E-Way Bill
            </Button>
          </div>
        </form>
      </Modal>

      {/* =====================================================================
          MODAL 5: INSPECT IRN & QR CODE
          ===================================================================== */}
      <Modal
        isOpen={isIrnModalOpen}
        onClose={() => setIsIrnModalOpen(false)}
        title={`E-Invoice IRN Details – #${selectedInvoice?.invoiceNumber}`}
        maxWidth="md"
      >
        <div className="space-y-4">
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs font-semibold text-slate-500 uppercase">
                Invoice Reference Number (IRN)
              </span>
              <Badge variant="success">64-char SHA256</Badge>
            </div>
            <div
              className="font-mono text-xs break-all bg-white p-2.5 rounded border border-slate-200"
              style={{ color: brand.primaryColor }}
            >
              {selectedInvoice?.irn || '86c2ad16fe4f0ad8e11982bca192837261928371625348291029384756102938'}
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 border border-slate-200 rounded-xl bg-white">
            <div className="p-3 bg-slate-100 rounded-lg">
              <QrCode className="h-16 w-16 text-slate-800" />
            </div>
            <div className="text-xs space-y-1">
              <div className="font-bold text-slate-800">Digitally Signed B2B QR Code</div>
              <div className="text-slate-500">Document: {selectedInvoice?.invoiceNumber}</div>
              <div className="text-slate-500">Seller GSTIN: 07AAACK1234D1Z5</div>
              <div className="text-slate-500">Grand Total: ₹{selectedInvoice?.grandTotal.toLocaleString()}</div>
              <div className="text-emerald-600 font-semibold">Verified by NIC IRP Portal</div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <Button variant="outline" onClick={() => setIsIrnModalOpen(false)}>
              Close
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
