import React, { useState, useEffect, useMemo } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { Drawer } from '../components/ui/Drawer';
import { FormField } from '../components/ui/FormField';
import { Input } from '../components/ui/Input';
import { PageHeader } from '../components/ui/PageHeader';
import { useBrand } from '../contexts/BrandContext';
import {
  SupplierItem,
  PurchaseOrderItem,
  GoodsReceiptNoteItem,
  PurchaseInvoiceItem,
  DebitNoteItem,
  VendorPaymentItem,
  getStoredSuppliers,
  saveSupplierItem,
  getStoredOrders,
  createPurchaseOrder,
  getStoredGrns,
  inwardGoodsReceiptNote,
  getStoredInvoices,
  createPurchaseInvoice,
  getStoredReturns,
  createDebitNote,
  getStoredPayments,
  recordVendorPayment,
  computePurchaseKpis,
} from '../services/purchaseService';
import { getStoredWarehouses, WarehouseItem } from '../services/inventoryService';
import { getStoredBooks, BookItem } from '../services/catalogueService';
import {
  ShoppingCart,
  Plus,
  Download,
  Filter,
  CheckCircle2,
  Clock,
  Truck,
  FileText,
  AlertTriangle,
  RotateCcw,
  CreditCard,
  Building2,
  Barcode,
  Search,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  TrendingUp,
  Receipt,
  XCircle,
  Eye,
  Trash2,
  Info,
} from 'lucide-react';

export const PurchasesPage: React.FC = () => {
  const { brand } = useBrand();

  // Active Tab & Filter States
  const [activeTab, setActiveTab] = useState<'orders' | 'grn' | 'invoices' | 'returns' | 'ageing' | 'reports'>('orders');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Core Data States
  const [orders, setOrders] = useState<PurchaseOrderItem[]>([]);
  const [grns, setGrns] = useState<GoodsReceiptNoteItem[]>([]);
  const [invoices, setInvoices] = useState<PurchaseInvoiceItem[]>([]);
  const [returns, setReturns] = useState<DebitNoteItem[]>([]);
  const [suppliers, setSuppliers] = useState<SupplierItem[]>([]);
  const [payments, setPayments] = useState<VendorPaymentItem[]>([]);
  const [warehouses, setWarehouses] = useState<WarehouseItem[]>([]);
  const [books, setBooks] = useState<BookItem[]>([]);

  // Modals & Drawers States
  const [isPoModalOpen, setIsPoModalOpen] = useState(false);
  const [isGrnModalOpen, setIsGrnModalOpen] = useState(false);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [isDebitNoteModalOpen, setIsDebitNoteModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isStatementOpen, setIsStatementOpen] = useState(false);
  const [selectedSupplierForStatement, setSelectedSupplierForStatement] = useState<SupplierItem | null>(null);
  const [selectedPoForView, setSelectedPoForView] = useState<PurchaseOrderItem | null>(null);

  // Refresh All Data
  const refreshData = () => {
    const o = getStoredOrders();
    const g = getStoredGrns();
    const i = getStoredInvoices();
    const r = getStoredReturns();
    const s = getStoredSuppliers();
    const p = getStoredPayments();
    const w = getStoredWarehouses();
    const b = getStoredBooks();

    setOrders(o);
    setGrns(g);
    setInvoices(i);
    setReturns(r);
    setSuppliers(s);
    setPayments(p);
    setWarehouses(w);
    setBooks(b);

    if (s.length > 0 && !selectedSupplierForStatement) {
      setSelectedSupplierForStatement(s[0]);
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  const kpis = useMemo(() => computePurchaseKpis(), [orders, grns, invoices, suppliers]);

  // --------------------------------------------------------------------------
  // FORM STATES
  // --------------------------------------------------------------------------

  // 1. New Purchase Order Form
  const [poForm, setPoForm] = useState({
    supplierName: '',
    expectedDelivery: new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10),
    warehouseId: '',
    paymentTerms: 'Net 30',
    bookTitle: '',
    sku: '',
    quantity: 1000,
    unitRate: 155.0,
    discountPercent: 5.0,
    freightCharges: 3500.0,
    taxRate: 0,
    notes: '',
  });

  const handleOpenPoModal = () => {
    const defaultSup = suppliers[0];
    const defaultWh = warehouses[0];
    const defaultBk = books[0];
    setPoForm({
      supplierName: defaultSup ? defaultSup.name : 'Ballarpur Paper & Pulp Mills Ltd.',
      expectedDelivery: new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10),
      warehouseId: defaultWh ? defaultWh.id : '',
      paymentTerms: defaultSup ? defaultSup.paymentTerms : 'Net 30',
      bookTitle: defaultBk ? defaultBk.title : 'Concepts of Physics (Part 1 - Classic Edition)',
      sku: defaultBk ? defaultBk.sku : 'BK-PHY-CONCEPTS-ENG-PB',
      quantity: 1000,
      unitRate: defaultBk ? defaultBk.purchaseCost : 155.0,
      discountPercent: 5.0,
      freightCharges: 3500.0,
      taxRate: 0,
      notes: '',
    });
    setIsPoModalOpen(true);
  };

  const handleSelectBookForPo = (bookSku: string) => {
    const bk = books.find((b) => b.sku === bookSku);
    if (bk) {
      setPoForm((prev) => ({
        ...prev,
        sku: bk.sku,
        bookTitle: bk.title,
        unitRate: bk.purchaseCost || prev.unitRate,
      }));
    }
  };

  const handleCreatePo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!poForm.supplierName || !poForm.bookTitle) {
      alert('Please fill all required fields');
      return;
    }

    createPurchaseOrder({
      supplierName: poForm.supplierName,
      expectedDelivery: poForm.expectedDelivery,
      warehouseId: poForm.warehouseId || warehouses[0]?.id,
      paymentTerms: poForm.paymentTerms,
      bookTitle: poForm.bookTitle,
      sku: poForm.sku || `SKU-${Date.now().toString().slice(-4)}`,
      quantity: Number(poForm.quantity),
      unitRate: Number(poForm.unitRate),
      discountPercent: Number(poForm.discountPercent),
      freightCharges: Number(poForm.freightCharges),
      taxRate: Number(poForm.taxRate),
      notes: poForm.notes,
    });

    setIsPoModalOpen(false);
    refreshData();
  };

  // 2. New GRN Inward Form
  const [grnForm, setGrnForm] = useState({
    poNumber: '',
    deliveryChallanNo: '',
    transporterName: 'VRL Logistics Express Ltd.',
    vehicleNumber: 'HR-55-AN-4421',
    warehouseRack: 'RACK-A1-01',
    batchBarcode: '',
    receivedQty: 1000,
    acceptedQty: 980,
    rejectedQty: 20,
    rejectionReason: 'Minor handling damage',
    notes: '',
  });

  const handleOpenGrnModal = (poNum?: string) => {
    const targetPo = poNum
      ? orders.find((o) => o.poNumber === poNum)
      : orders.find((o) => o.status === 'ISSUED' || o.status === 'PARTIALLY_RECEIVED') || orders[0];

    const unreceived = targetPo ? targetPo.items[0].quantity - targetPo.items[0].receivedQty : 1000;
    const year = new Date().getFullYear();

    setGrnForm({
      poNumber: targetPo ? targetPo.poNumber : '',
      deliveryChallanNo: `DC-${Date.now().toString().slice(-6)}`,
      transporterName: 'VRL Logistics Express Ltd.',
      vehicleNumber: 'HR-55-AN-4421',
      warehouseRack: 'RACK-A1-02',
      batchBarcode: `BC-${year}-${targetPo?.items[0]?.sku.replace(/[^a-zA-Z0-9]/g, '') || 'ITEM'}-${Date.now().toString().slice(-4)}`,
      receivedQty: Math.max(1, unreceived),
      acceptedQty: Math.max(1, unreceived),
      rejectedQty: 0,
      rejectionReason: '',
      notes: `Inward receipt against ${targetPo?.poNumber || ''}`,
    });
    setIsGrnModalOpen(true);
  };

  const handleCreateGrn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!grnForm.poNumber || !grnForm.deliveryChallanNo) {
      alert('Please select PO and enter delivery challan number');
      return;
    }

    try {
      inwardGoodsReceiptNote({
        poNumber: grnForm.poNumber,
        deliveryChallanNo: grnForm.deliveryChallanNo,
        transporterName: grnForm.transporterName,
        vehicleNumber: grnForm.vehicleNumber,
        warehouseRack: grnForm.warehouseRack,
        batchBarcode: grnForm.batchBarcode,
        receivedQty: Number(grnForm.receivedQty),
        acceptedQty: Number(grnForm.acceptedQty),
        rejectedQty: Number(grnForm.rejectedQty),
        rejectionReason: grnForm.rejectionReason,
        notes: grnForm.notes,
      });

      setIsGrnModalOpen(false);
      refreshData();
    } catch (err: any) {
      alert(err.message || 'Error creating GRN');
    }
  };

  // 3. New Purchase Invoice (3-Way Match) Form
  const [invoiceForm, setInvoiceForm] = useState({
    supplierInvoiceNo: '',
    poNumber: '',
    grnNumber: '',
    invoiceDate: new Date().toISOString().slice(0, 10),
    dueDate: new Date(Date.now() + 45 * 86400000).toISOString().slice(0, 10),
    freightAmount: 0,
    notes: '',
  });

  const handleOpenInvoiceModal = (grnNum?: string) => {
    const targetGrn = grnNum
      ? grns.find((g) => g.grnNumber === grnNum)
      : grns[0];

    const targetPo = targetGrn ? orders.find((o) => o.poNumber === targetGrn.poNumber) : orders[0];

    setInvoiceForm({
      supplierInvoiceNo: `BILL-${Date.now().toString().slice(-5)}`,
      poNumber: targetGrn ? targetGrn.poNumber : (targetPo ? targetPo.poNumber : ''),
      grnNumber: targetGrn ? targetGrn.grnNumber : '',
      invoiceDate: new Date().toISOString().slice(0, 10),
      dueDate: new Date(Date.now() + 45 * 86400000).toISOString().slice(0, 10),
      freightAmount: targetPo ? targetPo.freightCharges : 0,
      notes: '',
    });
    setIsInvoiceModalOpen(true);
  };

  const handleCreateInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!invoiceForm.supplierInvoiceNo || !invoiceForm.grnNumber) {
      alert('Please fill vendor bill number and select GRN');
      return;
    }

    try {
      createPurchaseInvoice({
        supplierInvoiceNo: invoiceForm.supplierInvoiceNo,
        poNumber: invoiceForm.poNumber,
        grnNumber: invoiceForm.grnNumber,
        invoiceDate: invoiceForm.invoiceDate,
        dueDate: invoiceForm.dueDate,
        freightAmount: Number(invoiceForm.freightAmount),
        notes: invoiceForm.notes,
      });

      setIsInvoiceModalOpen(false);
      refreshData();
    } catch (err: any) {
      alert(err.message || 'Error creating Purchase Invoice');
    }
  };

  // 4. New Debit Note Form
  const [dnForm, setDnForm] = useState({
    invoiceNumber: '',
    returnReason: 'Post-inspection defective copies or damaged pages',
    returnedQty: 10,
  });

  const handleOpenDebitNoteModal = (invNum?: string) => {
    const targetInv = invNum
      ? invoices.find((i) => i.invoiceNumber === invNum)
      : invoices.find((i) => i.balanceDue > 0) || invoices[0];

    setDnForm({
      invoiceNumber: targetInv ? targetInv.invoiceNumber : '',
      returnReason: 'Post-inspection missing signature pages or spine defects',
      returnedQty: 10,
    });
    setIsDebitNoteModalOpen(true);
  };

  const handleCreateDebitNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dnForm.invoiceNumber || dnForm.returnedQty <= 0) {
      alert('Please select an invoice and enter valid return quantity');
      return;
    }

    try {
      createDebitNote({
        invoiceNumber: dnForm.invoiceNumber,
        returnReason: dnForm.returnReason,
        returnedQty: Number(dnForm.returnedQty),
      });

      setIsDebitNoteModalOpen(false);
      refreshData();
    } catch (err: any) {
      alert(err.message || 'Error creating Debit Note');
    }
  };

  // 5. Record Vendor Payment Form
  const [payForm, setPayForm] = useState({
    invoiceNumber: '',
    amount: 100000,
    paymentMethod: 'NEFT' as VendorPaymentItem['paymentMethod'],
    bankName: 'HDFC Bank Corporate Current A/c',
    bankAccountNumber: '918010045678912',
    transactionRef: '',
    notes: '',
  });

  const handleOpenPaymentModal = (invNum?: string) => {
    const targetInv = invNum
      ? invoices.find((i) => i.invoiceNumber === invNum)
      : invoices.find((i) => i.balanceDue > 0) || invoices[0];

    setPayForm({
      invoiceNumber: targetInv ? targetInv.invoiceNumber : '',
      amount: targetInv ? targetInv.balanceDue : 100000,
      paymentMethod: 'NEFT',
      bankName: 'HDFC Bank Corporate Current A/c',
      bankAccountNumber: '918010045678912',
      transactionRef: `NEFT-SUP-${Date.now().toString().slice(-6)}`,
      notes: '',
    });
    setIsPaymentModalOpen(true);
  };

  const handleRecordPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!payForm.invoiceNumber || payForm.amount <= 0) {
      alert('Please select invoice and enter payment amount');
      return;
    }

    try {
      recordVendorPayment({
        invoiceNumber: payForm.invoiceNumber,
        amount: Number(payForm.amount),
        paymentMethod: payForm.paymentMethod,
        bankName: payForm.bankName,
        bankAccountNumber: payForm.bankAccountNumber,
        transactionRef: payForm.transactionRef || `NEFT-${Date.now().toString().slice(-6)}`,
        notes: payForm.notes,
      });

      setIsPaymentModalOpen(false);
      refreshData();
    } catch (err: any) {
      alert(err.message || 'Error recording vendor payment');
    }
  };

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

  const handleExportOrders = () => {
    exportCsv(
      'kibo360_purchase_orders',
      ['PO Number', 'Supplier', 'GSTIN', 'Order Date', 'Delivery Date', 'Warehouse', 'Items', 'Subtotal', 'Freight', 'Grand Total', 'Status'],
      orders.map((o) => [
        o.poNumber,
        o.supplierName,
        o.supplierGstin,
        o.orderDate,
        o.expectedDelivery,
        o.warehouseName,
        o.itemsCount,
        o.subtotal,
        o.freightCharges,
        o.grandTotal,
        o.status,
      ])
    );
  };

  const handleExportGrns = () => {
    exportCsv(
      'kibo360_goods_receipt_notes',
      ['GRN Number', 'PO Ref', 'Supplier', 'Receipt Date', 'Challan No', 'Transporter', 'Received Qty', 'Accepted Qty', 'Rejected Qty', 'Warehouse Rack', 'Barcode', 'Status'],
      grns.map((g) => [
        g.grnNumber,
        g.poNumber,
        g.supplierName,
        g.receiptDate,
        g.deliveryChallanNo,
        g.transporterName,
        g.receivedQty,
        g.acceptedQty,
        g.rejectedQty,
        g.warehouseRack,
        g.batchBarcode,
        g.status,
      ])
    );
  };

  const handleExportInvoices = () => {
    exportCsv(
      'kibo360_purchase_invoices',
      ['Invoice #', 'Vendor Bill #', 'Supplier', 'Date', 'Due Date', 'PO Ref', 'GRN Ref', 'Taxable', 'Tax Amount', 'Net Payable', 'Paid', 'Balance Due', '3-Way Matched', 'GL Voucher'],
      invoices.map((i) => [
        i.invoiceNumber,
        i.supplierInvoiceNo,
        i.supplierName,
        i.invoiceDate,
        i.dueDate,
        i.poNumber,
        i.grnNumber,
        i.taxableAmount,
        i.taxAmount,
        i.netPayable,
        i.paidAmount,
        i.balanceDue,
        i.threeWayMatched ? 'YES' : 'NO',
        i.voucherNumber,
      ])
    );
  };

  const handleExportReturns = () => {
    exportCsv(
      'kibo360_purchase_debit_notes',
      ['Debit Note #', 'Invoice Ref', 'Supplier', 'Date', 'Item SKU', 'Item Title', 'Returned Qty', 'Taxable', 'Total Return', 'GL Voucher', 'Status'],
      returns.map((r) => [
        r.returnNumber,
        r.invoiceNumber,
        r.supplierName,
        r.returnDate,
        r.sku,
        r.title,
        r.returnedQty,
        r.taxableAmount,
        r.totalReturnAmount,
        r.voucherNumber,
        r.status,
      ])
    );
  };

  const handleExportPayables = () => {
    exportCsv(
      'kibo360_supplier_payables_ageing',
      ['Supplier Name', 'Code', 'GSTIN', 'Credit Days', 'Credit Limit', 'Current Outstanding', 'Status'],
      suppliers.map((s) => [
        s.name,
        s.code,
        s.gstin,
        s.creditDays,
        s.creditLimit,
        s.currentOutstanding,
        s.status,
      ])
    );
  };

  // Filtered views
  const filteredOrders = orders.filter((o) => {
    const matchesSearch =
      o.poNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.supplierName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.items[0]?.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || o.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredGrns = grns.filter((g) => {
    return (
      g.grnNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      g.poNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      g.supplierName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      g.batchBarcode.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const filteredInvoices = invoices.filter((i) => {
    return (
      i.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      i.supplierInvoiceNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      i.supplierName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      i.voucherNumber.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  // Chronological Statement entries for selected supplier
  const supplierStatementEntries = useMemo(() => {
    if (!selectedSupplierForStatement) return [];

    const supName = selectedSupplierForStatement.name;
    const entries: {
      date: string;
      ref: string;
      type: string;
      debit: number;
      credit: number;
    }[] = [];

    // Invoices are Credits (increasing our liability)
    invoices
      .filter((i) => i.supplierName === supName)
      .forEach((inv) => {
        entries.push({
          date: inv.invoiceDate,
          ref: `Bill #${inv.supplierInvoiceNo} (${inv.invoiceNumber})`,
          type: 'BILL',
          debit: 0,
          credit: inv.netPayable,
        });
      });

    // Payments are Debits (reducing our liability)
    payments
      .filter((p) => p.supplierName === supName)
      .forEach((pay) => {
        entries.push({
          date: pay.paymentDate,
          ref: `${pay.paymentMethod} Remittance #${pay.voucherNumber} (Ref: ${pay.transactionRef})`,
          type: 'PAYMENT',
          debit: pay.amount,
          credit: 0,
        });
      });

    // Debit notes are Debits (reducing our liability)
    returns
      .filter((r) => r.supplierName === supName)
      .forEach((dn) => {
        entries.push({
          date: dn.returnDate,
          ref: `Debit Note #${dn.returnNumber} (${dn.returnReason})`,
          type: 'DEBIT_NOTE',
          debit: dn.totalReturnAmount,
          credit: 0,
        });
      });

    // Sort chronologically
    entries.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // Calculate running balance
    let running = 0;
    return entries.map((e) => {
      running += e.credit - e.debit;
      return {
        ...e,
        runningBalance: Math.round(running * 100) / 100,
      };
    });
  }, [selectedSupplierForStatement, invoices, payments, returns]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Purchase & Vendor Procurement Hub"
        description="End-to-end publishing procurement: Purchase Orders, Dock Goods Receipt (GRN), 3-Way Match Verification, Supplier Ageing, Debit Notes, and Double-Entry GL Postings."
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setActiveTab('reports')}
              leftIcon={<Download size={14} style={{ color: brand.primaryColor }} />}
            >
              Purchase Register
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleOpenPoModal}
              leftIcon={<Plus size={14} />}
              style={{ backgroundColor: brand.primaryColor }}
            >
              New Purchase Order
            </Button>
          </div>
        }
      />

      {/* KPI Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4 border-l-4 bg-white shadow-sm hover:shadow-md transition-shadow" style={{ borderLeftColor: brand.primaryColor }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500">Active Purchase Orders</p>
              <h3 className="text-xl font-bold text-slate-800 mt-1">
                {kpis.activeOrdersCount} Orders
              </h3>
              <p className="text-[11px] text-emerald-600 font-medium mt-1">
                ₹{kpis.committedPoValue.toLocaleString()} committed
              </p>
            </div>
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: `${brand.primaryColor}15`, color: brand.primaryColor }}
            >
              <ShoppingCart size={20} />
            </div>
          </div>
        </Card>

        <Card className="p-4 border-l-4 bg-white shadow-sm hover:shadow-md transition-shadow" style={{ borderLeftColor: brand.accentColor }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500">GRN Inward Receipts</p>
              <h3 className="text-xl font-bold text-slate-800 mt-1">
                {kpis.totalGrnAcceptedQty.toLocaleString()} copies
              </h3>
              <p className="text-[11px] text-slate-500 mt-1">
                {kpis.totalGrnRejectedQty} defective copies rejected
              </p>
            </div>
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: `${brand.accentColor}15`, color: brand.accentColor }}
            >
              <Truck size={20} />
            </div>
          </div>
        </Card>

        <Card className="p-4 border-l-4 border-l-indigo-600 bg-white shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500">3-Way Matched Invoices</p>
              <h3 className="text-xl font-bold text-slate-800 mt-1">
                ₹{kpis.matchedInvoicesTotal.toLocaleString()}
              </h3>
              <p className="text-[11px] text-indigo-600 font-medium mt-1">100% GL Auto-Posted</p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
              <ShieldCheck size={20} />
            </div>
          </div>
        </Card>

        <Card className="p-4 border-l-4 border-l-emerald-600 bg-white shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500">Outstanding Payables</p>
              <h3 className="text-xl font-bold text-slate-800 mt-1">
                ₹{kpis.totalOutstandingPayables.toLocaleString()}
              </h3>
              <p className="text-[11px] text-emerald-600 font-medium mt-1">All within Net 45 terms</p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
              <CreditCard size={20} />
            </div>
          </div>
        </Card>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200 overflow-x-auto pb-px">
        {[
          { key: 'orders', label: `Purchase Orders (${orders.length})`, icon: ShoppingCart },
          { key: 'grn', label: `Goods Receipt GRN (${grns.length})`, icon: Truck },
          { key: 'invoices', label: `Purchase Bills / 3-Way Match (${invoices.length})`, icon: FileText },
          { key: 'returns', label: `Debit Notes & Returns (${returns.length})`, icon: RotateCcw },
          { key: 'ageing', label: `Supplier Payables & Ageing (${suppliers.length})`, icon: CreditCard },
          { key: 'reports', label: 'Purchase Registers & GST', icon: TrendingUp },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-medium transition-colors border-b-2 whitespace-nowrap ${
                isActive
                  ? 'border-[#690BA8] text-[#690BA8] font-semibold bg-purple-50/50'
                  : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
              }`}
              style={{
                borderColor: isActive ? brand.primaryColor : 'transparent',
                color: isActive ? brand.primaryColor : undefined,
                backgroundColor: isActive ? `${brand.primaryColor}0D` : undefined,
              }}
            >
              <Icon size={14} style={{ color: isActive ? brand.primaryColor : undefined }} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* =====================================================================
          TAB 1: PURCHASE ORDERS
          ===================================================================== */}
      {activeTab === 'orders' && (
        <Card className="p-0 border border-slate-200 overflow-hidden shadow-sm">
          <div className="p-4 bg-slate-50/60 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search PO #, supplier, title..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-[#690BA8] w-64 bg-white"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="text-xs border border-slate-200 rounded-md py-1.5 px-2 bg-white"
              >
                <option value="ALL">All Status</option>
                <option value="ISSUED">Issued</option>
                <option value="PARTIALLY_RECEIVED">Partially Received</option>
                <option value="COMPLETED">Completed</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <Button size="sm" variant="secondary" onClick={handleExportOrders} leftIcon={<Download size={12} />}>
                Export CSV
              </Button>
              <Button
                size="sm"
                variant="primary"
                onClick={handleOpenPoModal}
                leftIcon={<Plus size={12} />}
                style={{ backgroundColor: brand.primaryColor }}
              >
                New PO
              </Button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100/75 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4">PO Number</th>
                  <th className="py-3 px-4">Supplier & GSTIN</th>
                  <th className="py-3 px-4">Order Date</th>
                  <th className="py-3 px-4">Expected Delivery</th>
                  <th className="py-3 px-4 text-center">Items & Qty</th>
                  <th className="py-3 px-4 text-right">Freight</th>
                  <th className="py-3 px-4 text-right">Grand Total</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredOrders.map((po) => (
                  <tr key={po.id} className="hover:bg-slate-50/75 transition-colors">
                    <td className="py-3 px-4 font-semibold" style={{ color: brand.primaryColor }}>
                      {po.poNumber}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-medium text-slate-800">{po.supplierName}</div>
                      <div className="text-[10px] text-slate-400 font-mono">GSTIN: {po.supplierGstin}</div>
                    </td>
                    <td className="py-3 px-4 text-slate-600">{po.orderDate}</td>
                    <td className="py-3 px-4 text-slate-600">{po.expectedDelivery}</td>
                    <td className="py-3 px-4 text-center">
                      <div className="font-semibold text-slate-800">
                        {po.items[0]?.quantity.toLocaleString()} units
                      </div>
                      <div className="text-[10px] text-slate-400 truncate max-w-xs">{po.items[0]?.title}</div>
                    </td>
                    <td className="py-3 px-4 text-right text-slate-600">₹{po.freightCharges.toLocaleString()}</td>
                    <td className="py-3 px-4 text-right font-bold text-slate-800">
                      ₹{po.grandTotal.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <Badge
                        variant={
                          po.status === 'COMPLETED'
                            ? 'success'
                            : po.status === 'PARTIALLY_RECEIVED'
                            ? 'coral'
                            : 'purple'
                        }
                        size="sm"
                      >
                        {po.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => setSelectedPoForView(po)}
                          className="text-[11px] h-7 px-2"
                        >
                          View
                        </Button>
                        {po.status !== 'COMPLETED' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleOpenGrnModal(po.poNumber)}
                            className="text-[11px] h-7 px-2 text-emerald-700 border-emerald-300 hover:bg-emerald-50"
                          >
                            Inward
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}

                {filteredOrders.length === 0 && (
                  <tr>
                    <td colSpan={9} className="py-8 text-center text-slate-500">
                      No purchase orders match your criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* =====================================================================
          TAB 2: GOODS RECEIPT NOTES (GRN)
          ===================================================================== */}
      {activeTab === 'grn' && (
        <Card className="p-0 border border-slate-200 overflow-hidden shadow-sm">
          <div className="p-4 bg-slate-50/60 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-xs font-semibold text-slate-700">Dock Goods Receipt Notes (GRN)</span>
              <p className="text-[11px] text-slate-500 mt-0.5">Physical receipt, quality inspection, barcodes, and stock inwarding</p>
            </div>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="secondary" onClick={handleExportGrns} leftIcon={<Download size={12} />}>
                Export CSV
              </Button>
              <Button
                size="sm"
                variant="primary"
                onClick={() => handleOpenGrnModal()}
                leftIcon={<Plus size={12} />}
                style={{ backgroundColor: brand.primaryColor }}
              >
                Inward New GRN
              </Button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100/75 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4">GRN Number</th>
                  <th className="py-3 px-4">PO Ref</th>
                  <th className="py-3 px-4">Supplier</th>
                  <th className="py-3 px-4">Challan / Transporter</th>
                  <th className="py-3 px-4 text-right">Received</th>
                  <th className="py-3 px-4 text-right">Accepted</th>
                  <th className="py-3 px-4 text-right">Rejected</th>
                  <th className="py-3 px-4">Warehouse & Barcode</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredGrns.map((grn) => (
                  <tr key={grn.id} className="hover:bg-slate-50/75 transition-colors">
                    <td className="py-3 px-4 font-semibold" style={{ color: brand.primaryColor }}>
                      {grn.grnNumber}
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-700">{grn.poNumber}</td>
                    <td className="py-3 px-4 text-slate-800">{grn.supplierName}</td>
                    <td className="py-3 px-4">
                      <div className="text-slate-800">{grn.deliveryChallanNo}</div>
                      <div className="text-[10px] text-slate-400">{grn.transporterName}</div>
                    </td>
                    <td className="py-3 px-4 text-right text-slate-700">{grn.receivedQty.toLocaleString()}</td>
                    <td className="py-3 px-4 text-right font-bold text-emerald-600">
                      {grn.acceptedQty.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right font-semibold text-rose-600">
                      {grn.rejectedQty > 0 ? `${grn.rejectedQty} Defective` : '0'}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5 text-slate-700">
                        <Barcode size={13} style={{ color: brand.primaryColor }} />
                        <span className="font-mono text-[11px]">{grn.batchBarcode}</span>
                      </div>
                      <div className="text-[10px] text-slate-400">Rack: {grn.warehouseRack} • {grn.warehouseName}</div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <Badge variant="success" size="sm">INWARDED</Badge>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleOpenInvoiceModal(grn.grnNumber)}
                        className="text-[11px] h-7 px-2 text-[#690BA8] border-purple-300 hover:bg-purple-50"
                      >
                        Create Bill
                      </Button>
                    </td>
                  </tr>
                ))}

                {filteredGrns.length === 0 && (
                  <tr>
                    <td colSpan={10} className="py-8 text-center text-slate-500">
                      No goods receipt notes found. Click "Inward New GRN" to accept incoming stock.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* =====================================================================
          TAB 3: PURCHASE INVOICES & 3-WAY MATCH
          ===================================================================== */}
      {activeTab === 'invoices' && (
        <Card className="p-0 border border-slate-200 overflow-hidden shadow-sm">
          <div className="p-4 bg-slate-50/60 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-xs font-semibold text-slate-700">Purchase Bills & 3-Way Verification</span>
              <p className="text-[11px] text-slate-500 mt-0.5">PO vs GRN vs Vendor Bill verification with automatic General Ledger postings</p>
            </div>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="secondary" onClick={handleExportInvoices} leftIcon={<Download size={12} />}>
                Export CSV
              </Button>
              <Button
                size="sm"
                variant="primary"
                onClick={() => handleOpenInvoiceModal()}
                leftIcon={<Plus size={12} />}
                style={{ backgroundColor: brand.primaryColor }}
              >
                Record Purchase Bill
              </Button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100/75 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4">Invoice #</th>
                  <th className="py-3 px-4">Vendor Bill #</th>
                  <th className="py-3 px-4">Supplier</th>
                  <th className="py-3 px-4">Bill Date / Due Date</th>
                  <th className="py-3 px-4 text-center">3-Way Match</th>
                  <th className="py-3 px-4 text-right">Taxable</th>
                  <th className="py-3 px-4 text-right">Net Payable</th>
                  <th className="py-3 px-4 text-right">Balance Due</th>
                  <th className="py-3 px-4 text-center">GL Voucher</th>
                  <th className="py-3 px-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredInvoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50/75 transition-colors">
                    <td className="py-3 px-4 font-semibold" style={{ color: brand.primaryColor }}>
                      {inv.invoiceNumber}
                    </td>
                    <td className="py-3 px-4 font-mono font-medium text-slate-800">{inv.supplierInvoiceNo}</td>
                    <td className="py-3 px-4 text-slate-800">{inv.supplierName}</td>
                    <td className="py-3 px-4">
                      <div className="text-slate-700">{inv.invoiceDate}</div>
                      <div className="text-[10px] text-rose-500">Due: {inv.dueDate}</div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <CheckCircle2 size={11} /> Matched
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right text-slate-700">₹{inv.taxableAmount.toLocaleString()}</td>
                    <td className="py-3 px-4 text-right font-bold text-slate-900">₹{inv.netPayable.toLocaleString()}</td>
                    <td className="py-3 px-4 text-right font-semibold text-rose-600">
                      ₹{inv.balanceDue.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className="font-mono text-[11px] px-2 py-0.5 rounded font-semibold border"
                        style={{
                          backgroundColor: `${brand.primaryColor}10`,
                          color: brand.primaryColor,
                          borderColor: `${brand.primaryColor}30`,
                        }}
                      >
                        {inv.voucherNumber}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        {inv.balanceDue > 0 && (
                          <Button
                            size="sm"
                            variant="primary"
                            onClick={() => handleOpenPaymentModal(inv.invoiceNumber)}
                            className="text-[11px] h-7 px-2 text-white"
                            style={{ backgroundColor: brand.primaryColor }}
                          >
                            Pay
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => handleOpenDebitNoteModal(inv.invoiceNumber)}
                          className="text-[11px] h-7 px-2 text-pink-700 hover:bg-pink-50"
                        >
                          Return
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}

                {filteredInvoices.length === 0 && (
                  <tr>
                    <td colSpan={10} className="py-8 text-center text-slate-500">
                      No purchase bills recorded yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* =====================================================================
          TAB 4: DEBIT NOTES & RETURNS
          ===================================================================== */}
      {activeTab === 'returns' && (
        <Card className="p-0 border border-slate-200 overflow-hidden shadow-sm">
          <div className="p-4 bg-slate-50/60 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-xs font-semibold text-slate-700">Purchase Returns & Supplier Debit Notes</span>
              <p className="text-[11px] text-slate-500 mt-0.5">Automated liability adjustment and input tax credit reversal</p>
            </div>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="secondary" onClick={handleExportReturns} leftIcon={<Download size={12} />}>
                Export CSV
              </Button>
              <Button
                size="sm"
                variant="primary"
                onClick={() => handleOpenDebitNoteModal()}
                leftIcon={<Plus size={12} />}
                style={{ backgroundColor: brand.accentColor }}
              >
                Issue Debit Note
              </Button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100/75 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4">Debit Note #</th>
                  <th className="py-3 px-4">Invoice Ref</th>
                  <th className="py-3 px-4">Supplier</th>
                  <th className="py-3 px-4">Return Reason</th>
                  <th className="py-3 px-4 text-right">Return Amount</th>
                  <th className="py-3 px-4 text-center">Accounting Voucher</th>
                  <th className="py-3 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {returns.map((dn) => (
                  <tr key={dn.id} className="hover:bg-slate-50/75 transition-colors">
                    <td className="py-3 px-4 font-semibold" style={{ color: brand.accentColor }}>
                      {dn.returnNumber}
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-700">{dn.invoiceNumber}</td>
                    <td className="py-3 px-4 text-slate-800">{dn.supplierName}</td>
                    <td className="py-3 px-4 text-slate-600 max-w-xs">{dn.returnReason}</td>
                    <td className="py-3 px-4 text-right font-bold text-slate-900">
                      ₹{dn.totalReturnAmount.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="font-mono text-[11px] px-2 py-0.5 bg-pink-50 text-[#E91E63] rounded font-semibold border border-pink-200">
                        {dn.voucherNumber}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <Badge variant="success" size="sm">{dn.status}</Badge>
                    </td>
                  </tr>
                ))}

                {returns.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-500">
                      No debit notes recorded.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* =====================================================================
          TAB 5: SUPPLIER AGEING & PAYABLES
          ===================================================================== */}
      {activeTab === 'ageing' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
            <Card className="p-3 bg-white border border-slate-200 shadow-sm text-center">
              <p className="text-[11px] text-slate-500 font-medium">Current (Not Due)</p>
              <h4 className="text-lg font-bold text-slate-800 mt-1">
                ₹{kpis.ageing.currentNotDue.toLocaleString()}
              </h4>
              <p className="text-[10px] text-emerald-600 mt-0.5">Healthy terms</p>
            </Card>
            <Card className="p-3 bg-white border border-slate-200 shadow-sm text-center">
              <p className="text-[11px] text-slate-500 font-medium">1 - 30 Days Overdue</p>
              <h4 className="text-lg font-bold text-slate-800 mt-1">
                ₹{kpis.ageing.overdue1to30.toLocaleString()}
              </h4>
              <p className="text-[10px] text-slate-400 mt-0.5">Under review</p>
            </Card>
            <Card className="p-3 bg-white border border-slate-200 shadow-sm text-center">
              <p className="text-[11px] text-slate-500 font-medium">31 - 60 Days Overdue</p>
              <h4 className="text-lg font-bold text-slate-800 mt-1">
                ₹{kpis.ageing.overdue31to60.toLocaleString()}
              </h4>
              <p className="text-[10px] text-slate-400 mt-0.5">Attention needed</p>
            </Card>
            <Card className="p-3 bg-white border border-slate-200 shadow-sm text-center">
              <p className="text-[11px] text-slate-500 font-medium">61 - 90 Days Overdue</p>
              <h4 className="text-lg font-bold text-slate-800 mt-1">
                ₹{kpis.ageing.overdue61to90.toLocaleString()}
              </h4>
              <p className="text-[10px] text-slate-400 mt-0.5">Critical hold</p>
            </Card>
            <Card className="p-3 bg-white border border-slate-200 shadow-sm text-center">
              <p className="text-[11px] text-slate-500 font-medium">90+ Days Overdue</p>
              <h4 className="text-lg font-bold text-slate-800 mt-1">
                ₹{kpis.ageing.overdue90Plus.toLocaleString()}
              </h4>
              <p className="text-[10px] text-slate-400 mt-0.5">Legal review</p>
            </Card>
          </div>

          <Card className="p-0 border border-slate-200 overflow-hidden shadow-sm">
            <div className="p-4 bg-slate-50/60 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-xs font-semibold text-slate-700">Supplier Ledger Accounts & Credit Ageing</span>
                <p className="text-[11px] text-slate-500 mt-0.5">Running liability balance per paper mill and vendor</p>
              </div>
              <div className="flex items-center gap-2">
                <Button size="sm" variant="secondary" onClick={handleExportPayables} leftIcon={<Download size={12} />}>
                  Export CSV
                </Button>
                <Button
                  size="sm"
                  variant="primary"
                  onClick={() => handleOpenPaymentModal()}
                  leftIcon={<CreditCard size={12} />}
                  style={{ backgroundColor: brand.primaryColor }}
                >
                  Record Supplier Payment
                </Button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-100/75 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                    <th className="py-3 px-4">Supplier Name</th>
                    <th className="py-3 px-4">Code & Category</th>
                    <th className="py-3 px-4">GSTIN</th>
                    <th className="py-3 px-4 text-center">Credit Terms</th>
                    <th className="py-3 px-4 text-right">Credit Limit</th>
                    <th className="py-3 px-4 text-right">Total Outstanding</th>
                    <th className="py-3 px-4 text-center">Statement</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {suppliers.map((sup) => (
                    <tr key={sup.id} className="hover:bg-slate-50/75 transition-colors">
                      <td className="py-3 px-4 font-semibold text-slate-800">{sup.name}</td>
                      <td className="py-3 px-4">
                        <span className="font-mono text-xs">{sup.code}</span>
                        <div className="text-[10px] text-slate-400">{sup.category.replace(/_/g, ' ')}</div>
                      </td>
                      <td className="py-3 px-4 text-slate-600 font-mono text-[11px]">{sup.gstin}</td>
                      <td className="py-3 px-4 text-center">
                        <span className="px-2 py-0.5 bg-slate-100 rounded text-slate-700 font-medium">
                          {sup.creditDays} Days ({sup.paymentTerms})
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right text-slate-700">₹{sup.creditLimit.toLocaleString()}</td>
                      <td className="py-3 px-4 text-right font-bold" style={{ color: brand.primaryColor }}>
                        ₹{sup.currentOutstanding.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => {
                            setSelectedSupplierForStatement(sup);
                            setIsStatementOpen(true);
                          }}
                          className="text-[11px] h-7 px-2"
                        >
                          View Statement
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* =====================================================================
          TAB 6: REGISTERS & ANALYTICS
          ===================================================================== */}
      {activeTab === 'reports' && (
        <div className="space-y-4">
          <Card className="p-4 border border-slate-200 bg-white shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div>
                <h4 className="text-sm font-bold text-slate-800">Purchase Register (GST Tax Compliance)</h4>
                <p className="text-[11px] text-slate-500">Taxable turnover, input CGST/SGST/IGST credit schedule for GSTR-2B</p>
              </div>
              <Button size="sm" variant="secondary" onClick={handleExportInvoices} leftIcon={<Download size={12} />}>
                Export GSTR-2B Recon (CSV)
              </Button>
            </div>

            <div className="overflow-x-auto mt-3">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 text-slate-600 font-semibold text-[11px] border-b border-slate-200">
                    <th className="py-2.5 px-3">Bill Date</th>
                    <th className="py-2.5 px-3">Invoice #</th>
                    <th className="py-2.5 px-3">Supplier Name & GSTIN</th>
                    <th className="py-2.5 px-3 text-right">Taxable Value</th>
                    <th className="py-2.5 px-3 text-right">CGST</th>
                    <th className="py-2.5 px-3 text-right">SGST</th>
                    <th className="py-2.5 px-3 text-right">IGST</th>
                    <th className="py-2.5 px-3 text-right">Total Bill</th>
                    <th className="py-2.5 px-3 text-center">GL Voucher</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {invoices.map((inv) => (
                    <tr key={inv.id}>
                      <td className="py-2 px-3 text-slate-600">{inv.invoiceDate}</td>
                      <td className="py-2 px-3 font-medium" style={{ color: brand.primaryColor }}>
                        {inv.invoiceNumber}
                      </td>
                      <td className="py-2 px-3 text-slate-800">
                        {inv.supplierName} <span className="font-mono text-[10px] text-slate-400">({inv.supplierGstin})</span>
                      </td>
                      <td className="py-2 px-3 text-right text-slate-700">₹{inv.taxableAmount.toLocaleString()}</td>
                      <td className="py-2 px-3 text-right text-slate-500">₹{inv.cgstAmount.toLocaleString()}</td>
                      <td className="py-2 px-3 text-right text-slate-500">₹{inv.sgstAmount.toLocaleString()}</td>
                      <td className="py-2 px-3 text-right text-slate-500">₹{inv.igstAmount.toLocaleString()}</td>
                      <td className="py-2 px-3 text-right font-bold text-slate-900">
                        ₹{inv.netPayable.toLocaleString()}
                      </td>
                      <td className="py-2 px-3 text-center font-mono text-[10px] text-purple-700">
                        {inv.voucherNumber}
                      </td>
                    </tr>
                  ))}
                  <tr className="bg-purple-50/50 font-bold text-slate-900 border-t-2 border-slate-300">
                    <td colSpan={3} className="py-2 px-3 text-right">TOTAL PURCHASES:</td>
                    <td className="py-2 px-3 text-right">
                      ₹{invoices.reduce((sum, i) => sum + i.taxableAmount, 0).toLocaleString()}
                    </td>
                    <td className="py-2 px-3 text-right">
                      ₹{invoices.reduce((sum, i) => sum + i.cgstAmount, 0).toLocaleString()}
                    </td>
                    <td className="py-2 px-3 text-right">
                      ₹{invoices.reduce((sum, i) => sum + i.sgstAmount, 0).toLocaleString()}
                    </td>
                    <td className="py-2 px-3 text-right">
                      ₹{invoices.reduce((sum, i) => sum + i.igstAmount, 0).toLocaleString()}
                    </td>
                    <td className="py-2 px-3 text-right" style={{ color: brand.primaryColor }}>
                      ₹{invoices.reduce((sum, i) => sum + i.netPayable, 0).toLocaleString()}
                    </td>
                    <td></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* =====================================================================
          MODAL 1: ISSUE NEW PURCHASE ORDER
          ===================================================================== */}
      <Modal
        isOpen={isPoModalOpen}
        onClose={() => setIsPoModalOpen(false)}
        title="Issue New Purchase Order"
        maxWidth="2xl"
      >
        <form onSubmit={handleCreatePo} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Supplier / Paper Mill" required>
              <select
                value={poForm.supplierName}
                onChange={(e) => setPoForm({ ...poForm, supplierName: e.target.value })}
                className="w-full text-xs border border-slate-200 rounded-md p-2 bg-white"
              >
                {suppliers.map((s) => (
                  <option key={s.id} value={s.name}>
                    {s.name} ({s.code} - {s.category.replace(/_/g, ' ')})
                  </option>
                ))}
              </select>
            </FormField>

            <FormField label="Expected Delivery Date" required>
              <Input
                type="date"
                value={poForm.expectedDelivery}
                onChange={(e) => setPoForm({ ...poForm, expectedDelivery: e.target.value })}
              />
            </FormField>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Destination Warehouse">
              <select
                value={poForm.warehouseId}
                onChange={(e) => setPoForm({ ...poForm, warehouseId: e.target.value })}
                className="w-full text-xs border border-slate-200 rounded-md p-2 bg-white"
              >
                {warehouses.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name} ({w.city})
                  </option>
                ))}
              </select>
            </FormField>

            <FormField label="Payment Terms">
              <Input
                value={poForm.paymentTerms}
                onChange={(e) => setPoForm({ ...poForm, paymentTerms: e.target.value })}
              />
            </FormField>
          </div>

          <div className="p-3 bg-purple-50/40 rounded-lg border border-purple-100 space-y-3">
            <div className="flex justify-between items-center">
              <h5 className="text-xs font-semibold" style={{ color: brand.primaryColor }}>
                Catalogue Item Specifications
              </h5>
              {books.length > 0 && (
                <select
                  onChange={(e) => handleSelectBookForPo(e.target.value)}
                  className="text-[11px] border border-purple-200 rounded p-1 bg-white"
                >
                  <option value="">-- Quick Select from Catalogue --</option>
                  {books.map((b) => (
                    <option key={b.id} value={b.sku}>
                      {b.title} (Cost: ₹{b.purchaseCost})
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <FormField label="Item Description / Title" required>
                <Input
                  value={poForm.bookTitle}
                  onChange={(e) => setPoForm({ ...poForm, bookTitle: e.target.value })}
                />
              </FormField>
              <FormField label="Item SKU">
                <Input
                  value={poForm.sku}
                  onChange={(e) => setPoForm({ ...poForm, sku: e.target.value })}
                />
              </FormField>
            </div>

            <div className="grid grid-cols-4 gap-3">
              <FormField label="Quantity" required>
                <Input
                  type="number"
                  value={poForm.quantity}
                  onChange={(e) => setPoForm({ ...poForm, quantity: Number(e.target.value) })}
                />
              </FormField>
              <FormField label="Unit Rate (₹)" required>
                <Input
                  type="number"
                  value={poForm.unitRate}
                  onChange={(e) => setPoForm({ ...poForm, unitRate: Number(e.target.value) })}
                />
              </FormField>
              <FormField label="Discount (%)">
                <Input
                  type="number"
                  value={poForm.discountPercent}
                  onChange={(e) => setPoForm({ ...poForm, discountPercent: Number(e.target.value) })}
                />
              </FormField>
              <FormField label="GST Rate (%)">
                <select
                  value={poForm.taxRate}
                  onChange={(e) => setPoForm({ ...poForm, taxRate: Number(e.target.value) })}
                  className="w-full text-xs border border-slate-200 rounded p-2 bg-white"
                >
                  <option value={0}>0% (Printed Books)</option>
                  <option value={12}>12% (Paper Reels / Board)</option>
                  <option value={18}>18% (Printing / Consumables)</option>
                </select>
              </FormField>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Freight & Transport (₹)">
              <Input
                type="number"
                value={poForm.freightCharges}
                onChange={(e) => setPoForm({ ...poForm, freightCharges: Number(e.target.value) })}
              />
            </FormField>
            <FormField label="Order Notes / Delivery Instructions">
              <Input
                placeholder="e.g. Forklift offloading required, double shrink-wrap"
                value={poForm.notes}
                onChange={(e) => setPoForm({ ...poForm, notes: e.target.value })}
              />
            </FormField>
          </div>

          <div className="p-3 bg-slate-50 rounded border border-slate-200 flex justify-between items-center text-xs">
            <span className="text-slate-600 font-medium">Estimated Grand Total (incl. Tax & Freight):</span>
            <span className="text-base font-bold" style={{ color: brand.primaryColor }}>
              ₹
              {(
                poForm.quantity * poForm.unitRate * (1 - poForm.discountPercent / 100) * (1 + poForm.taxRate / 100) +
                poForm.freightCharges
              ).toLocaleString()}
            </span>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <Button type="button" variant="secondary" onClick={() => setIsPoModalOpen(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              style={{ backgroundColor: brand.primaryColor }}
            >
              Issue Purchase Order
            </Button>
          </div>
        </form>
      </Modal>

      {/* =====================================================================
          MODAL 2: INWARD GOODS RECEIPT NOTE (GRN)
          ===================================================================== */}
      <Modal
        isOpen={isGrnModalOpen}
        onClose={() => setIsGrnModalOpen(false)}
        title="Dock Goods Receipt Note (GRN) Inwarding"
        maxWidth="2xl"
      >
        <form onSubmit={handleCreateGrn} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Select Target Purchase Order" required>
              <select
                value={grnForm.poNumber}
                onChange={(e) => {
                  const val = e.target.value;
                  const targetPo = orders.find((o) => o.poNumber === val);
                  const unrec = targetPo ? targetPo.items[0].quantity - targetPo.items[0].receivedQty : 1000;
                  setGrnForm((prev) => ({
                    ...prev,
                    poNumber: val,
                    receivedQty: Math.max(1, unrec),
                    acceptedQty: Math.max(1, unrec),
                    rejectedQty: 0,
                  }));
                }}
                className="w-full text-xs border border-slate-200 rounded p-2 bg-white"
              >
                {orders
                  .filter((o) => o.status !== 'CANCELLED' && o.status !== 'COMPLETED')
                  .map((o) => (
                    <option key={o.id} value={o.poNumber}>
                      {o.poNumber} - {o.supplierName} ({o.items[0]?.title})
                    </option>
                  ))}
              </select>
            </FormField>

            <FormField label="Supplier Delivery Challan #" required>
              <Input
                placeholder="e.g. DC-BILT-99881"
                value={grnForm.deliveryChallanNo}
                onChange={(e) => setGrnForm({ ...grnForm, deliveryChallanNo: e.target.value })}
              />
            </FormField>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Transporter / Carrier">
              <Input
                value={grnForm.transporterName}
                onChange={(e) => setGrnForm({ ...grnForm, transporterName: e.target.value })}
              />
            </FormField>
            <FormField label="Vehicle Number">
              <Input
                placeholder="e.g. HR-55-AN-4421"
                value={grnForm.vehicleNumber}
                onChange={(e) => setGrnForm({ ...grnForm, vehicleNumber: e.target.value })}
              />
            </FormField>
          </div>

          <div className="p-3 bg-slate-50 rounded border border-slate-200 space-y-3">
            <h5 className="text-xs font-semibold text-slate-800">Physical Stock Count & QC Inspection</h5>
            <div className="grid grid-cols-3 gap-3">
              <FormField label="Total Received Qty" required>
                <Input
                  type="number"
                  value={grnForm.receivedQty}
                  onChange={(e) => {
                    const rec = Number(e.target.value);
                    setGrnForm((prev) => ({
                      ...prev,
                      receivedQty: rec,
                      acceptedQty: Math.max(0, rec - prev.rejectedQty),
                    }));
                  }}
                />
              </FormField>

              <FormField label="Accepted Quality Qty" required>
                <Input
                  type="number"
                  value={grnForm.acceptedQty}
                  onChange={(e) => {
                    const acc = Number(e.target.value);
                    setGrnForm((prev) => ({
                      ...prev,
                      acceptedQty: acc,
                      rejectedQty: Math.max(0, prev.receivedQty - acc),
                    }));
                  }}
                />
              </FormField>

              <FormField label="Rejected Defective Qty">
                <Input
                  type="number"
                  value={grnForm.rejectedQty}
                  onChange={(e) => {
                    const rej = Number(e.target.value);
                    setGrnForm((prev) => ({
                      ...prev,
                      rejectedQty: rej,
                      acceptedQty: Math.max(0, prev.receivedQty - rej),
                    }));
                  }}
                />
              </FormField>
            </div>

            {grnForm.rejectedQty > 0 && (
              <FormField label="Rejection Reason / Defect Notes">
                <Input
                  placeholder="e.g. Torn cover, spine damaged, page smudges"
                  value={grnForm.rejectionReason}
                  onChange={(e) => setGrnForm({ ...grnForm, rejectionReason: e.target.value })}
                />
              </FormField>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Assigned Warehouse Rack">
              <Input
                value={grnForm.warehouseRack}
                onChange={(e) => setGrnForm({ ...grnForm, warehouseRack: e.target.value })}
              />
            </FormField>
            <FormField label="Batch Barcode">
              <Input
                value={grnForm.batchBarcode}
                onChange={(e) => setGrnForm({ ...grnForm, batchBarcode: e.target.value })}
              />
            </FormField>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <Button type="button" variant="secondary" onClick={() => setIsGrnModalOpen(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              style={{ backgroundColor: brand.primaryColor }}
            >
              Confirm Inward & Post to Inventory
            </Button>
          </div>
        </form>
      </Modal>

      {/* =====================================================================
          MODAL 3: PURCHASE BILL & 3-WAY MATCH
          ===================================================================== */}
      <Modal
        isOpen={isInvoiceModalOpen}
        onClose={() => setIsInvoiceModalOpen(false)}
        title="Record Purchase Bill (3-Way Verification)"
        maxWidth="lg"
      >
        <form onSubmit={handleCreateInvoice} className="space-y-4">
          <FormField label="Vendor Tax Invoice #" required>
            <Input
              placeholder="e.g. BILT/INV/9942"
              value={invoiceForm.supplierInvoiceNo}
              onChange={(e) => setInvoiceForm({ ...invoiceForm, supplierInvoiceNo: e.target.value })}
            />
          </FormField>

          <div className="grid grid-cols-2 gap-3">
            <FormField label="Associated GRN #" required>
              <select
                value={invoiceForm.grnNumber}
                onChange={(e) => {
                  const val = e.target.value;
                  const g = grns.find((grn) => grn.grnNumber === val);
                  setInvoiceForm((prev) => ({
                    ...prev,
                    grnNumber: val,
                    poNumber: g ? g.poNumber : prev.poNumber,
                  }));
                }}
                className="w-full text-xs border border-slate-200 rounded p-2 bg-white"
              >
                {grns.map((g) => (
                  <option key={g.id} value={g.grnNumber}>
                    {g.grnNumber} ({g.supplierName} - {g.acceptedQty} copies)
                  </option>
                ))}
              </select>
            </FormField>

            <FormField label="PO Reference">
              <Input value={invoiceForm.poNumber} readOnly className="bg-slate-50" />
            </FormField>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <FormField label="Vendor Bill Date">
              <Input
                type="date"
                value={invoiceForm.invoiceDate}
                onChange={(e) => setInvoiceForm({ ...invoiceForm, invoiceDate: e.target.value })}
              />
            </FormField>

            <FormField label="Payment Due Date">
              <Input
                type="date"
                value={invoiceForm.dueDate}
                onChange={(e) => setInvoiceForm({ ...invoiceForm, dueDate: e.target.value })}
              />
            </FormField>
          </div>

          <FormField label="Freight / Inward Transport (₹)">
            <Input
              type="number"
              value={invoiceForm.freightAmount}
              onChange={(e) => setInvoiceForm({ ...invoiceForm, freightAmount: Number(e.target.value) })}
            />
          </FormField>

          <div className="p-3 bg-emerald-50 rounded border border-emerald-200 text-xs text-emerald-800 space-y-1">
            <div className="flex items-center gap-1.5 font-bold">
              <ShieldCheck size={14} className="text-emerald-700" />
              <span>3-Way Match Verification Active</span>
            </div>
            <p className="text-[11px] text-emerald-700">
              Upon submission, system will verify PO quantities against accepted GRN stock and post automated double-entry GL voucher (Debit Inventory, Credit Trade Creditors).
            </p>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <Button type="button" variant="secondary" onClick={() => setIsInvoiceModalOpen(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              style={{ backgroundColor: brand.primaryColor }}
            >
              Post Purchase Bill to GL
            </Button>
          </div>
        </form>
      </Modal>

      {/* =====================================================================
          MODAL 4: ISSUE DEBIT NOTE / PURCHASE RETURN
          ===================================================================== */}
      <Modal
        isOpen={isDebitNoteModalOpen}
        onClose={() => setIsDebitNoteModalOpen(false)}
        title="Issue Supplier Debit Note (Purchase Return)"
        maxWidth="md"
      >
        <form onSubmit={handleCreateDebitNote} className="space-y-4">
          <FormField label="Select Target Purchase Bill" required>
            <select
              value={dnForm.invoiceNumber}
              onChange={(e) => setDnForm({ ...dnForm, invoiceNumber: e.target.value })}
              className="w-full text-xs border border-slate-200 rounded p-2 bg-white"
            >
              {invoices
                .filter((i) => i.balanceDue > 0)
                .map((i) => (
                  <option key={i.id} value={i.invoiceNumber}>
                    {i.invoiceNumber} ({i.supplierName} - Due: ₹{i.balanceDue.toLocaleString()})
                  </option>
                ))}
            </select>
          </FormField>

          <FormField label="Returned Defective Quantity" required>
            <Input
              type="number"
              value={dnForm.returnedQty}
              onChange={(e) => setDnForm({ ...dnForm, returnedQty: Number(e.target.value) })}
            />
          </FormField>

          <FormField label="Return Reason" required>
            <Input
              placeholder="e.g. Post-inspection missing signature pages or misprinted covers"
              value={dnForm.returnReason}
              onChange={(e) => setDnForm({ ...dnForm, returnReason: e.target.value })}
            />
          </FormField>

          <div className="p-3 bg-pink-50 rounded border border-pink-200 text-xs text-pink-800 space-y-1">
            <span className="font-bold">Automated Accounting Adjustments:</span>
            <p className="text-[11px] text-pink-700">
              Posts Debit Note (DN) to General Ledger: Debits Vendor Liability (Trade Creditors) and Credits Inventory, automatically reducing the invoice balance due.
            </p>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <Button type="button" variant="secondary" onClick={() => setIsDebitNoteModalOpen(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              style={{ backgroundColor: brand.accentColor }}
            >
              Confirm Debit Note
            </Button>
          </div>
        </form>
      </Modal>

      {/* =====================================================================
          MODAL 5: RECORD VENDOR PAYMENT
          ===================================================================== */}
      <Modal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        title="Record Supplier Payment Remittance"
        maxWidth="md"
      >
        <form onSubmit={handleRecordPayment} className="space-y-4">
          <FormField label="Target Purchase Bill to Settle" required>
            <select
              value={payForm.invoiceNumber}
              onChange={(e) => {
                const val = e.target.value;
                const inv = invoices.find((i) => i.invoiceNumber === val);
                setPayForm((prev) => ({
                  ...prev,
                  invoiceNumber: val,
                  amount: inv ? inv.balanceDue : prev.amount,
                }));
              }}
              className="w-full text-xs border border-slate-200 rounded p-2 bg-white"
            >
              {invoices
                .filter((i) => i.balanceDue > 0)
                .map((i) => (
                  <option key={i.id} value={i.invoiceNumber}>
                    {i.invoiceNumber} ({i.supplierName} - Due: ₹{i.balanceDue.toLocaleString()})
                  </option>
                ))}
            </select>
          </FormField>

          <FormField label="Disbursement Amount (₹)" required>
            <Input
              type="number"
              value={payForm.amount}
              onChange={(e) => setPayForm({ ...payForm, amount: Number(e.target.value) })}
            />
          </FormField>

          <div className="grid grid-cols-2 gap-3">
            <FormField label="Payment Method">
              <select
                value={payForm.paymentMethod}
                onChange={(e) => setPayForm({ ...payForm, paymentMethod: e.target.value as any })}
                className="w-full text-xs border border-slate-200 rounded p-2 bg-white"
              >
                <option value="NEFT">NEFT (Direct Bank Transfer)</option>
                <option value="RTGS">RTGS (High Value Transfer)</option>
                <option value="CHEQUE">Bank Cheque / DD</option>
                <option value="UPI">Corporate UPI Remittance</option>
              </select>
            </FormField>

            <FormField label="Bank Account">
              <select
                value={payForm.bankName}
                onChange={(e) => setPayForm({ ...payForm, bankName: e.target.value })}
                className="w-full text-xs border border-slate-200 rounded p-2 bg-white"
              >
                <option value="HDFC Bank Corporate Current A/c">HDFC Bank Current (1002)</option>
                <option value="State Bank of India Operative A/c">SBI Operative (1003)</option>
              </select>
            </FormField>
          </div>

          <FormField label="Bank UTR / Cheque Ref Number" required>
            <Input
              placeholder="e.g. NEFT-BILT-99881"
              value={payForm.transactionRef}
              onChange={(e) => setPayForm({ ...payForm, transactionRef: e.target.value })}
            />
          </FormField>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <Button type="button" variant="secondary" onClick={() => setIsPaymentModalOpen(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              style={{ backgroundColor: brand.primaryColor }}
            >
              Post Payment & Update Balances
            </Button>
          </div>
        </form>
      </Modal>

      {/* =====================================================================
          DRAWER 1: SUPPLIER STATEMENT
          ===================================================================== */}
      <Drawer
        isOpen={isStatementOpen}
        onClose={() => setIsStatementOpen(false)}
        title={`Supplier Statement: ${selectedSupplierForStatement?.name || 'Vendor'}`}
        width="xl"
      >
        <div className="space-y-4 text-xs">
          {selectedSupplierForStatement && (
            <div className="p-3 bg-purple-50/50 rounded-lg border border-purple-100 flex justify-between items-center">
              <div>
                <p className="font-semibold text-slate-800">{selectedSupplierForStatement.name}</p>
                <p className="text-[11px] text-slate-500">
                  GSTIN: {selectedSupplierForStatement.gstin} | PAN: {selectedSupplierForStatement.pan}
                </p>
                <p className="text-[10px] text-slate-400">Terms: {selectedSupplierForStatement.paymentTerms}</p>
              </div>
              <div className="text-right">
                <p className="text-[11px] text-slate-500">Closing Balance Payable:</p>
                <p className="text-base font-bold" style={{ color: brand.primaryColor }}>
                  ₹{selectedSupplierForStatement.currentOutstanding.toLocaleString()}
                </p>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <h5 className="font-semibold text-slate-700">Chronological Transactions</h5>
              <Button size="sm" variant="outline" onClick={() => window.print()} leftIcon={<Download size={12} />}>
                Print Statement
              </Button>
            </div>

            <div className="border border-slate-200 rounded-lg overflow-hidden">
              <table className="w-full text-left border-collapse text-[11px]">
                <thead className="bg-slate-100 font-semibold text-slate-600">
                  <tr>
                    <th className="p-2">Date</th>
                    <th className="p-2">Type & Ref</th>
                    <th className="p-2 text-right">Debit (Paid/Return)</th>
                    <th className="p-2 text-right">Credit (Billed)</th>
                    <th className="p-2 text-right">Running Balance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {supplierStatementEntries.map((e, idx) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="p-2 text-slate-600">{e.date}</td>
                      <td className="p-2 font-medium text-slate-800">{e.ref}</td>
                      <td className="p-2 text-right font-medium text-emerald-600">
                        {e.debit > 0 ? `₹${e.debit.toLocaleString()}` : '-'}
                      </td>
                      <td className="p-2 text-right font-medium text-slate-800">
                        {e.credit > 0 ? `₹${e.credit.toLocaleString()}` : '-'}
                      </td>
                      <td className="p-2 text-right font-bold text-slate-900">
                        ₹{e.runningBalance.toLocaleString()}
                      </td>
                    </tr>
                  ))}

                  {supplierStatementEntries.length === 0 && (
                    <tr>
                      <td colSpan={5} className="p-4 text-center text-slate-500">
                        No transactions found for this supplier.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </Drawer>

      {/* =====================================================================
          DRAWER 2: PURCHASE ORDER DETAIL
          ===================================================================== */}
      <Drawer
        isOpen={Boolean(selectedPoForView)}
        onClose={() => setSelectedPoForView(null)}
        title={`Purchase Order: ${selectedPoForView?.poNumber || ''}`}
        width="lg"
      >
        {selectedPoForView && (
          <div className="space-y-4 text-xs">
            <div className="flex justify-between items-start pb-3 border-b border-slate-200">
              <div>
                <span className="font-mono text-xs font-bold" style={{ color: brand.primaryColor }}>
                  {selectedPoForView.poNumber}
                </span>
                <h4 className="text-base font-bold text-slate-800 mt-1">{selectedPoForView.supplierName}</h4>
                <p className="text-slate-500">GSTIN: {selectedPoForView.supplierGstin}</p>
              </div>
              <Badge variant={selectedPoForView.status === 'COMPLETED' ? 'success' : 'purple'}>
                {selectedPoForView.status}
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
              <div>
                <span className="text-slate-400 block text-[11px]">Order Date</span>
                <span className="font-semibold text-slate-700">{selectedPoForView.orderDate}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Expected Delivery</span>
                <span className="font-semibold text-slate-700">{selectedPoForView.expectedDelivery}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Destination Warehouse</span>
                <span className="font-semibold text-slate-700">{selectedPoForView.warehouseName}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Payment Terms</span>
                <span className="font-semibold text-slate-700">{selectedPoForView.paymentTerms}</span>
              </div>
            </div>

            <div>
              <h5 className="font-bold text-slate-800 mb-2">Order Line Items</h5>
              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <table className="w-full text-left border-collapse text-xs">
                  <thead className="bg-slate-100 font-semibold text-slate-700">
                    <tr>
                      <th className="p-2.5">Item Description</th>
                      <th className="p-2.5 text-center">Ordered</th>
                      <th className="p-2.5 text-center">Received</th>
                      <th className="p-2.5 text-right">Unit Rate</th>
                      <th className="p-2.5 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {selectedPoForView.items.map((itm) => (
                      <tr key={itm.id}>
                        <td className="p-2.5">
                          <div className="font-semibold text-slate-800">{itm.title}</div>
                          <div className="font-mono text-[10px] text-slate-400">{itm.sku}</div>
                        </td>
                        <td className="p-2.5 text-center font-bold text-slate-800">{itm.quantity.toLocaleString()}</td>
                        <td className="p-2.5 text-center text-emerald-600 font-bold">{itm.receivedQty.toLocaleString()}</td>
                        <td className="p-2.5 text-right font-medium">₹{itm.rate.toFixed(2)}</td>
                        <td className="p-2.5 text-right font-bold text-slate-900">₹{itm.total.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="border-t border-slate-200 pt-3 flex justify-end">
              <div className="w-64 space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal:</span>
                  <span>₹{selectedPoForView.subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Freight Charges:</span>
                  <span>₹{selectedPoForView.freightCharges.toLocaleString()}</span>
                </div>
                {selectedPoForView.taxAmount > 0 && (
                  <div className="flex justify-between text-slate-600">
                    <span>GST ({selectedPoForView.taxRate}%):</span>
                    <span>₹{selectedPoForView.taxAmount.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm font-bold text-slate-900 border-t border-slate-200 pt-1.5">
                  <span>Grand Total:</span>
                  <span style={{ color: brand.primaryColor }}>₹{selectedPoForView.grandTotal.toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
              {selectedPoForView.status !== 'COMPLETED' && (
                <Button
                  variant="primary"
                  onClick={() => {
                    const poNum = selectedPoForView.poNumber;
                    setSelectedPoForView(null);
                    handleOpenGrnModal(poNum);
                  }}
                  leftIcon={<Truck size={14} />}
                  style={{ backgroundColor: brand.primaryColor }}
                >
                  Create GRN Inward
                </Button>
              )}
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
};
