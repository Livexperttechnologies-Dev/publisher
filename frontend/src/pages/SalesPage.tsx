import React, { useState, useMemo } from 'react';
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
  TrendingUp,
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
  ShoppingBag,
  DollarSign,
  Printer,
  Trash2,
  PauseCircle,
  PlayCircle,
  ArrowUpRight,
  Layers,
  Percent,
  Check,
  Package,
  Calendar,
  Users,
  Eye,
} from 'lucide-react';
import {
  SalesOrderItem,
  SalesInvoiceItem,
  DeliveryChallanItem,
  SalesReturnItem,
  CustomerReceiptItem,
  PosSaleRecord,
  PosHeldCart,
  InvoiceLineItem,
  OrderLineItem,
  DebtorsAgeingSummary,
  getStoredOrders,
  saveOrderItem,
  deleteOrderItem,
  getStoredInvoices,
  saveInvoiceItem,
  deleteInvoiceItem,
  getStoredChallans,
  saveChallanItem,
  getStoredReturns,
  saveReturnItem,
  getStoredReceipts,
  saveReceiptItem,
  getStoredPosSales,
  recordPosSale,
  getStoredHeldCarts,
  saveStoredHeldCarts,
  calculateDebtorsAgeing,
  getCustomerStatement,
} from '../services/salesService';
import { getStoredBooks, getStoredParties, BookItem, PartyItem } from '../services/catalogueService';
import { getStoredStocks, StockItem } from '../services/inventoryService';

export const SalesPage: React.FC = () => {
  const { brand } = useBrand();

  // Active Tab
  const [activeTab, setActiveTab] = useState<
    'pos' | 'orders' | 'invoices' | 'challans' | 'returns' | 'receipts' | 'ageing' | 'reports'
  >('pos');

  // Core Data States
  const [orders, setOrders] = useState<SalesOrderItem[]>(() => getStoredOrders());
  const [invoices, setInvoices] = useState<SalesInvoiceItem[]>(() => getStoredInvoices());
  const [challans, setChallans] = useState<DeliveryChallanItem[]>(() => getStoredChallans());
  const [returns, setReturns] = useState<SalesReturnItem[]>(() => getStoredReturns());
  const [receipts, setReceipts] = useState<CustomerReceiptItem[]>(() => getStoredReceipts());
  const [heldCarts, setHeldCarts] = useState<PosHeldCart[]>(() => getStoredHeldCarts());
  const [posSales, setPosSales] = useState<PosSaleRecord[]>(() => getStoredPosSales());

  // Linked Data from Catalogue & Inventory
  const catalogueBooks = useMemo<BookItem[]>(() => getStoredBooks(), []);
  const inventoryStocks = useMemo<StockItem[]>(() => getStoredStocks(), []);
  const tradeParties = useMemo<PartyItem[]>(() => getStoredParties(), []);

  // Filter & Search States
  const [orderSearchTerm, setOrderSearchTerm] = useState('');
  const [invoiceSearchTerm, setInvoiceSearchTerm] = useState('');
  const [customerFilter, setCustomerFilter] = useState('ALL');

  // POS State
  const [posScanQuery, setPosScanQuery] = useState('');
  const [posCart, setPosCart] = useState<InvoiceLineItem[]>([
    {
      id: 'c1',
      sku: 'BK-PHY-HCV-01',
      title: 'Concepts of Physics (Part 1 - Classic Edition)',
      hsnCode: '4901',
      mrp: 495.0,
      quantity: 2,
      discountPercent: 10,
      unitPrice: 445.5,
      taxRate: 0,
      taxAmount: 0,
      totalAmount: 891.0,
    },
  ]);
  const [posPaymentMethod, setPosPaymentMethod] = useState<'CASH' | 'CARD' | 'UPI' | 'SPLIT_PAYMENT'>('SPLIT_PAYMENT');
  const [posCashAmount, setPosCashAmount] = useState('500');
  const [posUpiAmount, setPosUpiAmount] = useState('391');
  const [posCustomerName, setPosCustomerName] = useState('Retail Walk-in Customer');
  const [posReceiptModalOpen, setPosReceiptModalOpen] = useState(false);
  const [lastCompletedBill, setLastCompletedBill] = useState<PosSaleRecord | null>(null);

  // New Order Modal States
  const [newOrderModalOpen, setNewOrderModalOpen] = useState(false);
  const [orderCustomerName, setOrderCustomerName] = useState(tradeParties[0]?.name || 'Oxford Book Store & Distributors Ltd.');
  const [orderChannel, setOrderChannel] = useState<SalesOrderItem['channel']>('WHOLESALE');
  const [orderBookSku, setOrderBookSku] = useState(catalogueBooks[0]?.sku || 'BK-PHY-HCV-01');
  const [orderQty, setOrderQty] = useState('50');
  const [orderFreight, setOrderFreight] = useState('400');
  const [orderNotes, setOrderNotes] = useState('Standard freight consignment');

  // New Invoice Modal States
  const [newInvoiceModalOpen, setNewInvoiceModalOpen] = useState(false);
  const [invCustomerName, setInvCustomerName] = useState(tradeParties[0]?.name || 'Oxford Book Store & Distributors Ltd.');
  const [invChannel, setInvChannel] = useState<SalesInvoiceItem['channel']>('WHOLESALE');
  const [invBookSku, setInvBookSku] = useState(catalogueBooks[0]?.sku || 'BK-PHY-HCV-01');
  const [invQty, setInvQty] = useState('50');
  const [invPaymentMethod, setInvPaymentMethod] = useState<SalesInvoiceItem['paymentMethod']>('CREDIT');
  const [invFreight, setInvFreight] = useState('350');

  // New Challan Modal States
  const [newChallanModalOpen, setNewChallanModalOpen] = useState(false);
  const [challanCustomer, setChallanCustomer] = useState(tradeParties[0]?.name || 'Oxford Book Store & Distributors Ltd.');
  const [challanTransporter, setChallanTransporter] = useState('VRL Logistics India Ltd.');
  const [challanVehicle, setChallanVehicle] = useState('MH-04-AZ-4521');
  const [challanCopies, setChallanCopies] = useState('50');

  // New Return / Credit Note Modal States
  const [newReturnModalOpen, setNewReturnModalOpen] = useState(false);
  const [returnInvoiceNo, setReturnInvoiceNo] = useState(invoices[0]?.invoiceNumber || 'SINV/2026/0001');
  const [returnReason, setReturnReason] = useState('Defective cover & page binding on 5 copies during transit inspection');
  const [returnAmount, setReturnAmount] = useState('1485.00');
  const [returnSku, setReturnSku] = useState('BK-PHY-HCV-01');
  const [returnQty, setReturnQty] = useState('5');

  // New Customer Receipt Modal States
  const [newReceiptModalOpen, setNewReceiptModalOpen] = useState(false);
  const [rcptCustomerName, setRcptCustomerName] = useState(tradeParties[0]?.name || 'Oxford Book Store & Distributors Ltd.');
  const [rcptInvoiceNo, setRcptInvoiceNo] = useState(invoices[0]?.invoiceNumber || 'SINV/2026/0001');
  const [rcptAmount, setRcptAmount] = useState('13715.00');
  const [rcptMethod, setRcptMethod] = useState<CustomerReceiptItem['paymentMethod']>('BANK_TRANSFER_NEFT_RTGS');
  const [rcptBank, setRcptBank] = useState('HDFC Bank Corporate Current A/c');
  const [rcptRef, setRcptRef] = useState('NEFT/HDFC/20261108/99881');

  // Customer Statement Drawer State
  const [statementDrawerOpen, setStatementDrawerOpen] = useState(false);
  const [selectedStatementCustomerName, setSelectedStatementCustomerName] = useState<string>('');

  // Reload helper
  const reloadData = () => {
    setOrders(getStoredOrders());
    setInvoices(getStoredInvoices());
    setChallans(getStoredChallans());
    setReturns(getStoredReturns());
    setReceipts(getStoredReceipts());
    setHeldCarts(getStoredHeldCarts());
    setPosSales(getStoredPosSales());
  };

  // Quick Catalog for POS Scanner
  const quickCatalog = useMemo(() => {
    return catalogueBooks.slice(0, 6).map((b) => ({
      sku: b.sku,
      title: b.title,
      mrp: b.mrp,
      hsnCode: b.hsnSacCode || '4901',
      isbn: b.isbn13,
      taxRate: 0,
    }));
  }, [catalogueBooks]);

  // POS Calculations
  const cartSubtotal = useMemo(() => {
    return posCart.reduce((acc, it) => acc + it.totalAmount, 0);
  }, [posCart]);

  const cartNetPayable = Math.round(cartSubtotal);

  // Dynamic KPIs
  const totalSalesRevenue = useMemo(() => {
    return invoices.reduce((acc, i) => acc + i.grandTotal, 0);
  }, [invoices]);

  const retailPosSales = useMemo(() => {
    return invoices
      .filter((i) => i.channel === 'RETAIL')
      .reduce((acc, i) => acc + i.grandTotal, 0);
  }, [invoices]);

  const totalReceivablesDue = useMemo(() => {
    return invoices.reduce((acc, i) => acc + i.balanceDue, 0);
  }, [invoices]);

  const grossMarginProfit = useMemo(() => {
    // Calculate total revenue minus estimated stock WAC cost
    let estCogs = 0;
    invoices.forEach((inv) => {
      inv.items.forEach((it) => {
        const stock = inventoryStocks.find((s) => s.sku === it.sku);
        const unitCost = stock ? stock.wacCost : it.mrp * 0.45;
        estCogs += unitCost * it.quantity;
      });
    });
    return Math.max(0, totalSalesRevenue - estCogs);
  }, [invoices, inventoryStocks, totalSalesRevenue]);

  const grossMarginPercentage = useMemo(() => {
    if (totalSalesRevenue <= 0) return 0;
    return Number(((grossMarginProfit / totalSalesRevenue) * 100).toFixed(1));
  }, [grossMarginProfit, totalSalesRevenue]);

  // Debtors Ageing Data
  const ageingList = useMemo<DebtorsAgeingSummary[]>(() => {
    return calculateDebtorsAgeing(invoices);
  }, [invoices]);

  // Customer Statement Data
  const currentCustomerStatement = useMemo(() => {
    if (!selectedStatementCustomerName) return null;
    return getCustomerStatement(
      selectedStatementCustomerName,
      invoices,
      receipts,
      returns
    );
  }, [selectedStatementCustomerName, invoices, receipts, returns]);

  // Filtered Orders
  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const matchSearch =
        !orderSearchTerm ||
        o.orderNumber.toLowerCase().includes(orderSearchTerm.toLowerCase()) ||
        o.customerName.toLowerCase().includes(orderSearchTerm.toLowerCase()) ||
        (o.quotationRef && o.quotationRef.toLowerCase().includes(orderSearchTerm.toLowerCase()));

      const matchCustomer =
        customerFilter === 'ALL' || o.customerName === customerFilter;

      return matchSearch && matchCustomer;
    });
  }, [orders, orderSearchTerm, customerFilter]);

  // Filtered Invoices
  const filteredInvoices = useMemo(() => {
    return invoices.filter((i) => {
      const matchSearch =
        !invoiceSearchTerm ||
        i.invoiceNumber.toLowerCase().includes(invoiceSearchTerm.toLowerCase()) ||
        i.customerName.toLowerCase().includes(invoiceSearchTerm.toLowerCase()) ||
        i.voucherNumber.toLowerCase().includes(invoiceSearchTerm.toLowerCase());

      const matchCustomer =
        customerFilter === 'ALL' || i.customerName === customerFilter;

      return matchSearch && matchCustomer;
    });
  }, [invoices, invoiceSearchTerm, customerFilter]);

  // SKU Profitability Analytics
  const skuAnalytics = useMemo(() => {
    const skuMap: Record<
      string,
      { sku: string; title: string; qty: number; revenue: number; cogs: number }
    > = {};

    invoices.forEach((inv) => {
      inv.items.forEach((it) => {
        if (!skuMap[it.sku]) {
          const stock = inventoryStocks.find((s) => s.sku === it.sku);
          skuMap[it.sku] = {
            sku: it.sku,
            title: it.title,
            qty: 0,
            revenue: 0,
            cogs: stock ? stock.wacCost : it.mrp * 0.45,
          };
        }
        skuMap[it.sku].qty += it.quantity;
        skuMap[it.sku].revenue += it.totalAmount;
      });
    });

    return Object.values(skuMap).map((row) => {
      const totalCogs = Number((row.cogs * row.qty).toFixed(2));
      const margin = Number((row.revenue - totalCogs).toFixed(2));
      const marginPct = row.revenue > 0 ? Number(((margin / row.revenue) * 100).toFixed(1)) : 0;
      return {
        ...row,
        totalCogs,
        margin,
        marginPct,
      };
    });
  }, [invoices, inventoryStocks]);

  // --- Handlers: POS ---
  const handleScanOrAdd = (bookItem: {
    sku: string;
    title: string;
    mrp: number;
    hsnCode?: string;
    taxRate?: number;
  }) => {
    const existingIdx = posCart.findIndex((i) => i.sku === bookItem.sku);
    if (existingIdx >= 0) {
      const updated = [...posCart];
      updated[existingIdx].quantity += 1;
      const rate = updated[existingIdx].mrp * (1 - updated[existingIdx].discountPercent / 100);
      updated[existingIdx].totalAmount = Number((updated[existingIdx].quantity * rate).toFixed(2));
      setPosCart(updated);
    } else {
      const discount = 10;
      const netRate = bookItem.mrp * (1 - discount / 100);
      setPosCart([
        ...posCart,
        {
          id: `cart_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
          sku: bookItem.sku,
          title: bookItem.title,
          hsnCode: bookItem.hsnCode || '4901',
          mrp: bookItem.mrp,
          quantity: 1,
          discountPercent: discount,
          unitPrice: netRate,
          taxRate: bookItem.taxRate || 0,
          taxAmount: 0,
          totalAmount: netRate,
        },
      ]);
    }
  };

  const updateCartQty = (idx: number, delta: number) => {
    const updated = [...posCart];
    const newQty = updated[idx].quantity + delta;
    if (newQty <= 0) {
      updated.splice(idx, 1);
    } else {
      updated[idx].quantity = newQty;
      const rate = updated[idx].mrp * (1 - updated[idx].discountPercent / 100);
      updated[idx].totalAmount = Number((newQty * rate).toFixed(2));
    }
    setPosCart(updated);
  };

  const handleHoldCart = () => {
    if (posCart.length === 0) return;
    const holdRef = `HOLD-${Math.floor(1000 + Math.random() * 9000)}`;
    const newHeld: PosHeldCart = {
      id: `hold_${Date.now()}`,
      ref: holdRef,
      customer: posCustomerName || 'Queue Customer',
      time: 'Just now',
      itemsCount: posCart.length,
      total: cartNetPayable,
      items: [...posCart],
    };
    const updated = [newHeld, ...heldCarts];
    setHeldCarts(updated);
    saveStoredHeldCarts(updated);
    setPosCart([]);
  };

  const handleResumeCart = (held: PosHeldCart) => {
    setPosCart(held.items);
    const updated = heldCarts.filter((h) => h.id !== held.id);
    setHeldCarts(updated);
    saveStoredHeldCarts(updated);
  };

  const handleCompleteSale = () => {
    if (posCart.length === 0) return;

    const sale = recordPosSale({
      customerName: posCustomerName,
      items: posCart,
      subtotal: cartSubtotal,
      netPayable: cartNetPayable,
      paymentMethod: posPaymentMethod,
      cashTendered: Number(posCashAmount) || cartNetPayable,
      upiReceived: Number(posUpiAmount) || 0,
    });

    setLastCompletedBill(sale);
    setPosReceiptModalOpen(true);
    setPosCart([]);
    reloadData();
  };

  // --- Handlers: Orders & Invoices ---
  const handleCreateOrder = () => {
    const book = catalogueBooks.find((b) => b.sku === orderBookSku);
    const party = tradeParties.find((p) => p.name === orderCustomerName);
    const qty = Number(orderQty) || 50;

    const discount =
      orderChannel === 'WHOLESALE'
        ? 40
        : orderChannel === 'DISTRIBUTOR'
        ? 40
        : orderChannel === 'DEALER'
        ? 25
        : 20;

    const mrp = book ? book.mrp : 495.0;
    const rate = Number((mrp * (1 - discount / 100)).toFixed(2));
    const totalAmount = Number((qty * rate).toFixed(2));
    const freight = Number(orderFreight) || 0;

    const line: OrderLineItem = {
      id: 'oli_' + Date.now(),
      sku: orderBookSku,
      title: book ? book.title : orderBookSku,
      mrp,
      discountPercent: discount,
      unitPrice: rate,
      quantity: qty,
      totalAmount,
    };

    saveOrderItem({
      customerId: party ? party.id : 'pty_gen',
      customerName: orderCustomerName,
      customerGstin: party ? party.gstin : '07AAAAA0000A1Z5',
      channel: orderChannel,
      freightCharges: freight,
      items: [line],
      notes: orderNotes,
    });

    setNewOrderModalOpen(false);
    reloadData();
  };

  const handleConvertOrderToInvoice = (order: SalesOrderItem) => {
    const invoiceLines: InvoiceLineItem[] = order.items.map((it) => ({
      id: 'ili_' + Date.now() + Math.random().toString(36).substring(2, 5),
      sku: it.sku,
      title: it.title,
      hsnCode: '4901',
      mrp: it.mrp,
      discountPercent: it.discountPercent,
      unitPrice: it.unitPrice,
      quantity: it.quantity,
      taxRate: 0,
      taxAmount: 0,
      totalAmount: it.totalAmount,
    }));

    saveInvoiceItem({
      orderId: order.id,
      orderNumber: order.orderNumber,
      customerId: order.customerId,
      customerName: order.customerName,
      customerGstin: order.customerGstin,
      channel: order.channel,
      freightCharges: order.freightCharges,
      dispatchWarehouseName: order.warehouseName,
      paymentMethod: 'CREDIT',
      items: invoiceLines,
    });

    // Update order status to INVOICED
    saveOrderItem({
      ...order,
      status: 'INVOICED',
    });

    reloadData();
    setActiveTab('invoices');
    alert(`Successfully generated Tax Invoice from ${order.orderNumber}! Stock decremented and GL voucher posted.`);
  };

  const handleCreateInvoiceDirect = () => {
    const book = catalogueBooks.find((b) => b.sku === invBookSku);
    const party = tradeParties.find((p) => p.name === invCustomerName);
    const qty = Number(invQty) || 50;

    const discount =
      invChannel === 'WHOLESALE'
        ? 40
        : invChannel === 'DISTRIBUTOR'
        ? 40
        : invChannel === 'DEALER'
        ? 25
        : 20;

    const mrp = book ? book.mrp : 495.0;
    const rate = Number((mrp * (1 - discount / 100)).toFixed(2));
    const totalAmount = Number((qty * rate).toFixed(2));
    const freight = Number(invFreight) || 0;

    const line: InvoiceLineItem = {
      id: 'ili_' + Date.now(),
      sku: invBookSku,
      title: book ? book.title : invBookSku,
      hsnCode: '4901',
      mrp,
      discountPercent: discount,
      unitPrice: rate,
      quantity: qty,
      taxRate: 0,
      taxAmount: 0,
      totalAmount,
    };

    saveInvoiceItem({
      customerId: party ? party.id : 'pty_gen',
      customerName: invCustomerName,
      customerGstin: party ? party.gstin : '07AAAAA0000A1Z5',
      customerAddress: party ? `${party.city}, ${party.state}` : 'Delhi, India',
      channel: invChannel,
      freightCharges: freight,
      paymentMethod: invPaymentMethod,
      items: [line],
    });

    setNewInvoiceModalOpen(false);
    reloadData();
  };

  // --- Handlers: Challans, Returns & Receipts ---
  const handleCreateChallan = () => {
    saveChallanItem({
      customerName: challanCustomer,
      transporter: challanTransporter,
      vehicleNumber: challanVehicle,
      itemsCount: Number(challanCopies) || 50,
      status: 'DISPATCHED',
      notes: 'Cargo sealed and verified with logistics airway consignment',
    });
    setNewChallanModalOpen(false);
    reloadData();
  };

  const handleCreateReturn = () => {
    const inv = invoices.find((i) => i.invoiceNumber === returnInvoiceNo);
    saveReturnItem({
      invoiceNumber: returnInvoiceNo,
      customerName: inv ? inv.customerName : 'Oxford Book Store & Distributors Ltd.',
      reason: returnReason,
      totalAmount: Number(returnAmount) || 0,
      sku: returnSku,
      quantityReturned: Number(returnQty) || 0,
    });
    setNewReturnModalOpen(false);
    reloadData();
  };

  const handleCreateReceipt = () => {
    saveReceiptItem({
      customerName: rcptCustomerName,
      invoiceNumber: rcptInvoiceNo,
      amount: Number(rcptAmount) || 0,
      paymentMethod: rcptMethod,
      bankName: rcptBank,
      reference: rcptRef,
    });
    setNewReceiptModalOpen(false);
    reloadData();
  };

  const openCustomerStatementDrawer = (custName: string) => {
    setSelectedStatementCustomerName(custName);
    setStatementDrawerOpen(true);
  };

  // --- CSV Export Helper ---
  const exportToCsv = (filename: string, rows: Record<string, any>[]) => {
    if (!rows || rows.length === 0) {
      alert('No data available to export.');
      return;
    }
    const headers = Object.keys(rows[0]);
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [
        headers.join(','),
        ...rows.map((row) =>
          headers
            .map((header) => {
              const val = row[header] ?? '';
              const stringVal = String(val).replace(/"/g, '""');
              return `"${stringVal}"`;
            })
            .join(',')
        ),
      ].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${filename}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Enterprise Page Header */}
      <PageHeader
        title="Sales & Invoicing / POS Management"
        description="Wholesale Sales Orders, GST Tax Invoices, High-Speed POS Retail Terminal, Delivery Challans, Credit Notes, and Debtors Receivables Ageing"
        breadcrumbs={[
          { label: 'Dashboard', href: '/' },
          { label: 'Sales & Invoicing', href: '/sales' },
        ]}
        actions={
          <div className="flex items-center flex-wrap gap-2.5">
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Printer className="h-4 w-4" />}
              onClick={() => setActiveTab('pos')}
            >
              POS Terminal
            </Button>
            <Button
              variant="secondary"
              size="sm"
              leftIcon={<FileText className="h-4 w-4" />}
              onClick={() => setNewInvoiceModalOpen(true)}
            >
              + Generate Tax Invoice
            </Button>
            <Button
              variant="primary"
              size="sm"
              leftIcon={<Plus className="h-4 w-4" />}
              style={{ backgroundColor: brand.primaryColor }}
              className="text-white hover:opacity-90"
              onClick={() => setNewOrderModalOpen(true)}
            >
              + New Sales Order
            </Button>
          </div>
        }
      />

      {/* Dynamic KPI Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card
          className="p-4 bg-white shadow-sm"
          style={{ borderLeftWidth: '4px', borderLeftColor: brand.primaryColor }}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Total Invoiced Sales
            </span>
            <div
              className="p-2 rounded-lg"
              style={{
                backgroundColor: `${brand.primaryColor}15`,
                color: brand.primaryColor,
              }}
            >
              <TrendingUp className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900">
            ₹{totalSalesRevenue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="mt-1 flex items-center text-xs text-emerald-600 font-medium">
            <ArrowUpRight className="h-3 w-3 mr-0.5" /> Across {invoices.length} posted invoices & bills
          </div>
        </Card>

        <Card
          className="p-4 bg-white shadow-sm"
          style={{ borderLeftWidth: '4px', borderLeftColor: brand.deepColor }}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Retail POS Counter
            </span>
            <div
              className="p-2 rounded-lg"
              style={{
                backgroundColor: `${brand.deepColor}15`,
                color: brand.deepColor,
              }}
            >
              <ShoppingBag className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900">
            ₹{retailPosSales.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="mt-1 text-xs text-slate-500">
            Counter Terminal 01 (Central Outlet)
          </div>
        </Card>

        <Card
          className="p-4 bg-white shadow-sm"
          style={{ borderLeftWidth: '4px', borderLeftColor: brand.coralColor }}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Debtors Outstanding
            </span>
            <div
              className="p-2 rounded-lg"
              style={{
                backgroundColor: `${brand.coralColor}15`,
                color: brand.coralColor,
              }}
            >
              <AlertTriangle className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900">
            ₹{totalReceivablesDue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="mt-1 text-xs text-amber-600 font-medium">
            Receivables from trade accounts
          </div>
        </Card>

        <Card
          className="p-4 bg-white shadow-sm"
          style={{ borderLeftWidth: '4px', borderLeftColor: brand.accentColor }}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Gross Margin (Profit)
            </span>
            <div
              className="p-2 rounded-lg"
              style={{
                backgroundColor: `${brand.accentColor}15`,
                color: brand.accentColor,
              }}
            >
              <Percent className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900">
            ₹{grossMarginProfit.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="mt-1 text-xs text-emerald-600 font-medium">
            {grossMarginPercentage}% estimated margin over COGS
          </div>
        </Card>
      </div>

      {/* Tabs Navigation */}
      <div className="flex border-b border-slate-200 gap-1 overflow-x-auto text-sm font-medium">
        <button
          onClick={() => setActiveTab('pos')}
          className={`px-4 py-2.5 flex items-center gap-2 border-b-2 font-medium transition-colors whitespace-nowrap ${
            activeTab === 'pos'
              ? 'font-semibold'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
          style={
            activeTab === 'pos'
              ? { borderBottomColor: brand.primaryColor, color: brand.primaryColor }
              : {}
          }
        >
          <Barcode className="h-4 w-4" />
          Retail POS Terminal
          <span className="px-1.5 py-0.5 text-xs rounded bg-purple-100 text-[#690BA8] font-bold">Fast</span>
        </button>

        <button
          onClick={() => setActiveTab('orders')}
          className={`px-4 py-2.5 flex items-center gap-2 border-b-2 font-medium transition-colors whitespace-nowrap ${
            activeTab === 'orders'
              ? 'font-semibold'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
          style={
            activeTab === 'orders'
              ? { borderBottomColor: brand.primaryColor, color: brand.primaryColor }
              : {}
          }
        >
          <FileText className="h-4 w-4" />
          Sales Orders ({orders.length})
        </button>

        <button
          onClick={() => setActiveTab('invoices')}
          className={`px-4 py-2.5 flex items-center gap-2 border-b-2 font-medium transition-colors whitespace-nowrap ${
            activeTab === 'invoices'
              ? 'font-semibold'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
          style={
            activeTab === 'invoices'
              ? { borderBottomColor: brand.primaryColor, color: brand.primaryColor }
              : {}
          }
        >
          <FileText className="h-4 w-4" />
          Tax Invoices ({invoices.length})
        </button>

        <button
          onClick={() => setActiveTab('challans')}
          className={`px-4 py-2.5 flex items-center gap-2 border-b-2 font-medium transition-colors whitespace-nowrap ${
            activeTab === 'challans'
              ? 'font-semibold'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
          style={
            activeTab === 'challans'
              ? { borderBottomColor: brand.primaryColor, color: brand.primaryColor }
              : {}
          }
        >
          <Truck className="h-4 w-4" />
          Delivery Challans ({challans.length})
        </button>

        <button
          onClick={() => setActiveTab('returns')}
          className={`px-4 py-2.5 flex items-center gap-2 border-b-2 font-medium transition-colors whitespace-nowrap ${
            activeTab === 'returns'
              ? 'font-semibold'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
          style={
            activeTab === 'returns'
              ? { borderBottomColor: brand.primaryColor, color: brand.primaryColor }
              : {}
          }
        >
          <RotateCcw className="h-4 w-4" />
          Credit Notes / Returns ({returns.length})
        </button>

        <button
          onClick={() => setActiveTab('receipts')}
          className={`px-4 py-2.5 flex items-center gap-2 border-b-2 font-medium transition-colors whitespace-nowrap ${
            activeTab === 'receipts'
              ? 'font-semibold'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
          style={
            activeTab === 'receipts'
              ? { borderBottomColor: brand.primaryColor, color: brand.primaryColor }
              : {}
          }
        >
          <CreditCard className="h-4 w-4" />
          Customer Receipts ({receipts.length})
        </button>

        <button
          onClick={() => setActiveTab('ageing')}
          className={`px-4 py-2.5 flex items-center gap-2 border-b-2 font-medium transition-colors whitespace-nowrap ${
            activeTab === 'ageing'
              ? 'font-semibold'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
          style={
            activeTab === 'ageing'
              ? { borderBottomColor: brand.primaryColor, color: brand.primaryColor }
              : {}
          }
        >
          <Clock className="h-4 w-4" />
          Customer Ageing & Statements
        </button>

        <button
          onClick={() => setActiveTab('reports')}
          className={`px-4 py-2.5 flex items-center gap-2 border-b-2 font-medium transition-colors whitespace-nowrap ${
            activeTab === 'reports'
              ? 'font-semibold'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
          style={
            activeTab === 'reports'
              ? { borderBottomColor: brand.primaryColor, color: brand.primaryColor }
              : {}
          }
        >
          <TrendingUp className="h-4 w-4" />
          Sales Analytics & Margins
        </button>
      </div>

      {/* ===================================================================== */}
      {/* TAB 1: RETAIL POINT OF SALE (POS) TERMINAL */}
      {/* ===================================================================== */}
      {activeTab === 'pos' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Side: Barcode Scanner & Cart Items */}
          <div className="lg:col-span-8 space-y-4">
            <Card className="p-4 bg-white shadow-sm border border-slate-200">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Barcode className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Scan ISBN-13 Barcode or SKU (e.g. 9788177091877 or BK-PHY-HCV-01)..."
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#690BA8] font-mono"
                    value={posScanQuery}
                    onChange={(e) => setPosScanQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && posScanQuery) {
                        const found = catalogueBooks.find(
                          (b) =>
                            b.sku.toLowerCase() === posScanQuery.toLowerCase() ||
                            b.isbn13 === posScanQuery
                        );
                        if (found) {
                          handleScanOrAdd({
                            sku: found.sku,
                            title: found.title,
                            mrp: found.mrp,
                            hsnCode: found.hsnSacCode,
                            taxRate: found.taxRate,
                          });
                          setPosScanQuery('');
                        } else {
                          alert(`Book with barcode/SKU "${posScanQuery}" not found in catalogue.`);
                        }
                      }
                    }}
                  />
                </div>
                <Button
                  variant="primary"
                  style={{ backgroundColor: brand.primaryColor }}
                  className="text-white hover:opacity-90"
                  onClick={() => {
                    const found =
                      catalogueBooks.find(
                        (b) =>
                          b.sku.toLowerCase() === posScanQuery.toLowerCase() ||
                          b.isbn13 === posScanQuery
                      ) || catalogueBooks[0];
                    if (found) {
                      handleScanOrAdd({
                        sku: found.sku,
                        title: found.title,
                        mrp: found.mrp,
                        hsnCode: found.hsnSacCode,
                        taxRate: found.taxRate,
                      });
                      setPosScanQuery('');
                    }
                  }}
                >
                  Add Item
                </Button>
              </div>

              {/* Quick Pick Shortcuts */}
              <div className="mt-3 flex items-center gap-2 overflow-x-auto text-xs text-slate-600 pb-1">
                <span className="font-semibold text-slate-400 uppercase whitespace-nowrap">
                  Quick Add:
                </span>
                {quickCatalog.map((b) => (
                  <button
                    key={b.sku}
                    onClick={() => handleScanOrAdd(b)}
                    className="px-2.5 py-1 bg-purple-50 hover:bg-purple-100 rounded-md font-medium whitespace-nowrap transition-colors"
                    style={{ color: brand.primaryColor }}
                  >
                    + {b.title.slice(0, 22)}... (₹{b.mrp})
                  </button>
                ))}
              </div>
            </Card>

            {/* Cart Table */}
            <Card className="bg-white shadow-sm border border-slate-200 overflow-hidden">
              <div className="p-3 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
                <span className="font-semibold text-sm text-slate-800 flex items-center gap-2">
                  <ShoppingBag className="h-4 w-4" style={{ color: brand.primaryColor }} />
                  Active Cart Items ({posCart.length})
                </span>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    leftIcon={<PauseCircle className="h-3.5 w-3.5" />}
                    onClick={handleHoldCart}
                    disabled={posCart.length === 0}
                  >
                    Hold Cart
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-rose-600 hover:text-rose-700 text-xs"
                    onClick={() => setPosCart([])}
                    disabled={posCart.length === 0}
                  >
                    Clear
                  </Button>
                </div>
              </div>

              {posCart.length === 0 ? (
                <div className="p-12 text-center text-slate-400">
                  <Barcode className="h-12 w-12 mx-auto stroke-1 text-slate-300 mb-2" />
                  <p className="font-medium text-slate-600">Cart is empty</p>
                  <p className="text-xs">Scan a book barcode or click one of the quick add buttons above</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 text-slate-600 text-xs uppercase border-b border-slate-200">
                      <tr>
                        <th className="py-2.5 px-4">Book Title & SKU</th>
                        <th className="py-2.5 px-3 text-right">MRP</th>
                        <th className="py-2.5 px-3 text-center">Disc %</th>
                        <th className="py-2.5 px-3 text-center">Quantity</th>
                        <th className="py-2.5 px-3 text-right">Rate</th>
                        <th className="py-2.5 px-4 text-right">Amount</th>
                        <th className="py-2.5 px-2"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {posCart.map((item, idx) => (
                        <tr key={item.id} className="hover:bg-slate-50">
                          <td className="py-3 px-4">
                            <div className="font-medium text-slate-900">{item.title}</div>
                            <div className="text-xs font-mono text-slate-500">{item.sku}</div>
                          </td>
                          <td className="py-3 px-3 text-right text-slate-700 font-mono">
                            ₹{item.mrp.toFixed(2)}
                          </td>
                          <td className="py-3 px-3 text-center">
                            <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-xs rounded font-medium">
                              {item.discountPercent}%
                            </span>
                          </td>
                          <td className="py-3 px-3">
                            <div className="flex items-center justify-center gap-1">
                              <button
                                onClick={() => updateCartQty(idx, -1)}
                                className="w-6 h-6 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center font-bold"
                              >
                                -
                              </button>
                              <span className="w-8 text-center font-semibold text-slate-800">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => updateCartQty(idx, 1)}
                                className="w-6 h-6 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center font-bold"
                              >
                                +
                              </button>
                            </div>
                          </td>
                          <td className="py-3 px-3 text-right text-slate-700 font-mono">
                            ₹{item.unitPrice.toFixed(2)}
                          </td>
                          <td className="py-3 px-4 text-right font-semibold text-slate-900 font-mono">
                            ₹{item.totalAmount.toFixed(2)}
                          </td>
                          <td className="py-3 px-2 text-right">
                            <button
                              onClick={() => {
                                const copy = [...posCart];
                                copy.splice(idx, 1);
                                setPosCart(copy);
                              }}
                              className="text-slate-400 hover:text-rose-500"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>

            {/* Held Carts Bar */}
            {heldCarts.length > 0 && (
              <Card className="p-3 bg-amber-50/60 border border-amber-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <PauseCircle className="h-4 w-4 text-amber-600" />
                    <span className="text-xs font-semibold text-amber-900">
                      Parked / Held Carts ({heldCarts.length})
                    </span>
                  </div>
                </div>
                <div className="mt-2 flex gap-2 overflow-x-auto">
                  {heldCarts.map((h) => (
                    <div
                      key={h.id}
                      className="px-3 py-1.5 bg-white border border-amber-300 rounded-lg flex items-center gap-3 text-xs shadow-xs"
                    >
                      <div>
                        <span className="font-mono font-bold text-slate-800">{h.ref}</span>
                        <div className="text-slate-500">
                          {h.itemsCount} items · ₹{h.total.toFixed(2)}
                        </div>
                      </div>
                      <Button
                        variant="primary"
                        size="sm"
                        className="bg-amber-600 hover:bg-amber-700 text-white text-xs px-2 py-1 h-auto"
                        leftIcon={<PlayCircle className="h-3 w-3" />}
                        onClick={() => handleResumeCart(h)}
                      >
                        Resume
                      </Button>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>

          {/* Right Side: Bill Summary & Settlement */}
          <div className="lg:col-span-4 space-y-4">
            <Card className="p-5 bg-white shadow-sm border border-slate-200 space-y-4">
              <h3 className="font-semibold text-slate-900 text-base pb-2 border-b border-slate-100 flex items-center justify-between">
                <span>Billing Summary</span>
                <span className="text-xs font-normal text-slate-500 font-mono">Terminal: 01 (Central)</span>
              </h3>

              <FormField label="Customer Name / Phone">
                <Input
                  value={posCustomerName}
                  onChange={(e) => setPosCustomerName(e.target.value)}
                  placeholder="Retail Walk-in Customer"
                />
              </FormField>

              <div className="space-y-2 text-sm text-slate-600">
                <div className="flex justify-between">
                  <span>Subtotal Taxable</span>
                  <span className="font-mono font-medium text-slate-800">₹{cartSubtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>GST Output Tax (HSN 4901 0%)</span>
                  <span className="font-mono font-medium text-slate-800">₹0.00</span>
                </div>
                <div className="flex justify-between">
                  <span>Round Off</span>
                  <span className="font-mono font-medium text-slate-800">₹0.00</span>
                </div>
                <div className="pt-2 border-t border-slate-200 flex justify-between text-base font-bold text-slate-900">
                  <span>Net Payable</span>
                  <span className="text-xl font-mono" style={{ color: brand.primaryColor }}>
                    ₹{cartNetPayable.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              {/* Payment Method Selector */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <label className="text-xs font-semibold text-slate-600 uppercase">Payment Mode</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPosPaymentMethod('CASH')}
                    className={`p-2.5 rounded-lg border text-xs font-semibold text-center transition-all ${
                      posPaymentMethod === 'CASH'
                        ? 'border-purple-600 bg-purple-50 text-purple-800'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    Cash Tendered
                  </button>
                  <button
                    type="button"
                    onClick={() => setPosPaymentMethod('CARD')}
                    className={`p-2.5 rounded-lg border text-xs font-semibold text-center transition-all ${
                      posPaymentMethod === 'CARD'
                        ? 'border-purple-600 bg-purple-50 text-purple-800'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    Credit / Debit Card
                  </button>
                  <button
                    type="button"
                    onClick={() => setPosPaymentMethod('UPI')}
                    className={`p-2.5 rounded-lg border text-xs font-semibold text-center transition-all ${
                      posPaymentMethod === 'UPI'
                        ? 'border-purple-600 bg-purple-50 text-purple-800'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    UPI / QR Code
                  </button>
                  <button
                    type="button"
                    onClick={() => setPosPaymentMethod('SPLIT_PAYMENT')}
                    className={`p-2.5 rounded-lg border text-xs font-semibold text-center transition-all ${
                      posPaymentMethod === 'SPLIT_PAYMENT'
                        ? 'border-purple-600 bg-purple-50 text-purple-800'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    Split Payment
                  </button>
                </div>
              </div>

              {/* Split Fields if chosen */}
              {posPaymentMethod === 'SPLIT_PAYMENT' && (
                <div className="p-3 bg-purple-50/50 rounded-lg border border-purple-100 space-y-2 text-xs">
                  <div className="font-semibold text-slate-700">Split Breakdown</div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-slate-500">Cash Amount</span>
                      <input
                        type="number"
                        className="w-full mt-1 px-2 py-1 bg-white border border-slate-300 rounded text-slate-800 font-mono text-xs"
                        value={posCashAmount}
                        onChange={(e) => setPosCashAmount(e.target.value)}
                      />
                    </div>
                    <div>
                      <span className="text-slate-500">UPI Amount</span>
                      <input
                        type="number"
                        className="w-full mt-1 px-2 py-1 bg-white border border-slate-300 rounded text-slate-800 font-mono text-xs"
                        value={posUpiAmount}
                        onChange={(e) => setPosUpiAmount(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Action Button: Print Receipt & Settle */}
              <Button
                variant="primary"
                size="lg"
                style={{ backgroundColor: brand.primaryColor }}
                className="w-full text-white py-3 font-semibold shadow-md flex items-center justify-center gap-2 hover:opacity-90"
                disabled={posCart.length === 0}
                onClick={handleCompleteSale}
              >
                <Printer className="h-5 w-5" />
                Complete Sale & Print Bill (₹{cartNetPayable})
              </Button>
            </Card>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* TAB 2: SALES ORDERS */}
      {/* ===================================================================== */}
      {activeTab === 'orders' && (
        <Card className="bg-white shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-3">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search sales orders..."
                  value={orderSearchTerm}
                  onChange={(e) => setOrderSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[#690BA8]"
                />
              </div>

              <select
                className="px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white font-medium text-slate-700"
                value={customerFilter}
                onChange={(e) => setCustomerFilter(e.target.value)}
              >
                <option value="ALL">All Customers & Wholesalers</option>
                {tradeParties.map((p) => (
                  <option key={p.id} value={p.name}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                leftIcon={<Download className="h-4 w-4" />}
                onClick={() =>
                  exportToCsv(
                    'kibo360_sales_orders',
                    filteredOrders.map((o) => ({
                      Order_No: o.orderNumber,
                      Quotation_Ref: o.quotationRef,
                      Customer_Name: o.customerName,
                      GSTIN: o.customerGstin,
                      Channel: o.channel,
                      Order_Date: o.orderDate,
                      Delivery_Due_Date: o.deliveryDueDate,
                      Items_Count: o.itemsCount,
                      Subtotal: o.subtotal,
                      Freight_Charges: o.freightCharges,
                      Grand_Total: o.grandTotal,
                      Status: o.status,
                    }))
                  )
                }
              >
                Export Orders (CSV)
              </Button>
              <Button
                variant="primary"
                size="sm"
                leftIcon={<Plus className="h-4 w-4" />}
                style={{ backgroundColor: brand.primaryColor }}
                className="text-white hover:opacity-90"
                onClick={() => setNewOrderModalOpen(true)}
              >
                + New Sales Order
              </Button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-600 text-xs uppercase border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Order No & Ref</th>
                  <th className="py-3 px-4">Customer Name</th>
                  <th className="py-3 px-3">Channel</th>
                  <th className="py-3 px-3">Order Date</th>
                  <th className="py-3 px-3">Delivery Due</th>
                  <th className="py-3 px-3 text-right">Grand Total</th>
                  <th className="py-3 px-3 text-center">Status</th>
                  <th className="py-3 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-slate-500 text-sm">
                      No sales orders found matching your search.
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((o) => (
                    <tr key={o.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-900 font-mono">{o.orderNumber}</div>
                        <div className="text-xs text-slate-500">Ref: {o.quotationRef || '-'}</div>
                      </td>
                      <td className="py-3.5 px-4 font-medium text-slate-900">
                        {o.customerName}
                        {o.customerGstin && (
                          <div className="text-[11px] font-mono text-slate-500">{o.customerGstin}</div>
                        )}
                      </td>
                      <td className="py-3.5 px-3">
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-700 text-xs font-semibold rounded">
                          {o.channel}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 text-slate-600">{o.orderDate}</td>
                      <td className="py-3.5 px-3 text-slate-600">{o.deliveryDueDate}</td>
                      <td className="py-3.5 px-3 text-right font-semibold font-mono text-slate-900">
                        ₹{o.grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3.5 px-3 text-center">
                        <Badge
                          variant={
                            o.status === 'CONFIRMED' || o.status === 'INVOICED'
                              ? 'success'
                              : o.status === 'PROCESSING'
                              ? 'purple'
                              : 'warning'
                          }
                        >
                          {o.status}
                        </Badge>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        {o.status !== 'INVOICED' ? (
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-xs text-purple-700 border-purple-200 hover:bg-purple-50"
                            onClick={() => handleConvertOrderToInvoice(o)}
                          >
                            Generate Invoice
                          </Button>
                        ) : (
                          <span className="text-xs text-slate-400 font-medium">Invoiced</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* ===================================================================== */}
      {/* TAB 3: TAX INVOICES */}
      {/* ===================================================================== */}
      {activeTab === 'invoices' && (
        <Card className="bg-white shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-3">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search invoices, voucher..."
                  value={invoiceSearchTerm}
                  onChange={(e) => setInvoiceSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[#690BA8]"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                leftIcon={<Download className="h-4 w-4" />}
                onClick={() =>
                  exportToCsv(
                    'kibo360_sales_tax_invoices',
                    filteredInvoices.map((inv) => ({
                      Invoice_Number: inv.invoiceNumber,
                      Order_Number: inv.orderNumber,
                      Customer_Name: inv.customerName,
                      Channel: inv.channel,
                      Invoice_Date: inv.date,
                      Due_Date: inv.dueDate,
                      Grand_Total: inv.grandTotal,
                      Paid_Amount: inv.paidAmount,
                      Balance_Due: inv.balanceDue,
                      GL_Voucher: inv.voucherNumber,
                      Payment_Method: inv.paymentMethod,
                      Status: inv.status,
                    }))
                  )
                }
              >
                Export Invoices (CSV)
              </Button>
              <Button
                variant="primary"
                size="sm"
                leftIcon={<Plus className="h-4 w-4" />}
                style={{ backgroundColor: brand.primaryColor }}
                className="text-white hover:opacity-90"
                onClick={() => setNewInvoiceModalOpen(true)}
              >
                + Generate Tax Invoice
              </Button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-600 text-xs uppercase border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Invoice Number</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-3">Channel</th>
                  <th className="py-3 px-3">Invoice Date</th>
                  <th className="py-3 px-3">Due Date</th>
                  <th className="py-3 px-3 text-right">Net Payable</th>
                  <th className="py-3 px-3 text-right">Balance Due</th>
                  <th className="py-3 px-3 text-center">GL Voucher</th>
                  <th className="py-3 px-3 text-center">Status</th>
                  <th className="py-3 px-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredInvoices.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="py-8 text-center text-slate-500 text-sm">
                      No tax invoices found matching your search.
                    </td>
                  </tr>
                ) : (
                  filteredInvoices.map((inv) => (
                    <tr key={inv.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4 font-mono font-semibold text-slate-900">
                        {inv.invoiceNumber}
                        {inv.orderNumber && (
                          <div className="text-[10px] text-slate-400">Order: {inv.orderNumber}</div>
                        )}
                      </td>
                      <td className="py-3 px-4 font-medium text-slate-800">
                        {inv.customerName}
                        {inv.customerGstin && (
                          <div className="text-[10px] font-mono text-slate-400">{inv.customerGstin}</div>
                        )}
                      </td>
                      <td className="py-3 px-3 text-xs text-slate-600">{inv.channel}</td>
                      <td className="py-3 px-3 text-slate-600">{inv.date}</td>
                      <td className="py-3 px-3 text-slate-600">{inv.dueDate}</td>
                      <td className="py-3 px-3 text-right font-mono font-medium text-slate-900">
                        ₹{inv.grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                      <td
                        className={`py-3 px-3 text-right font-mono font-semibold ${
                          inv.balanceDue > 0 ? 'text-rose-600' : 'text-emerald-600'
                        }`}
                      >
                        ₹{inv.balanceDue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span
                          className="px-2 py-0.5 font-mono text-xs rounded font-medium"
                          style={{
                            backgroundColor: `${brand.primaryColor}15`,
                            color: brand.primaryColor,
                          }}
                        >
                          {inv.voucherNumber}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <Badge
                          variant={
                            inv.status === 'PAID'
                              ? 'success'
                              : inv.status === 'PARTIALLY_PAID'
                              ? 'warning'
                              : 'coral'
                          }
                        >
                          {inv.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-3 text-center">
                        {inv.balanceDue > 0 ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-xs text-purple-700 hover:text-purple-900"
                            onClick={() => {
                              setRcptCustomerName(inv.customerName);
                              setRcptInvoiceNo(inv.invoiceNumber);
                              setRcptAmount(String(inv.balanceDue));
                              setNewReceiptModalOpen(true);
                            }}
                          >
                            Receive Payment
                          </Button>
                        ) : (
                          <span className="text-xs text-emerald-600 font-medium">Cleared</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* ===================================================================== */}
      {/* TAB 4: DELIVERY CHALLANS */}
      {/* ===================================================================== */}
      {activeTab === 'challans' && (
        <Card className="bg-white shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-3">
            <div>
              <h3 className="font-semibold text-slate-800">Delivery Challans & Dispatch Tracking</h3>
              <p className="text-xs text-slate-500">
                Track consignment cargo movements, transporter Lorry Receipts (LR), and vehicle registrations
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                leftIcon={<Download className="h-4 w-4" />}
                onClick={() =>
                  exportToCsv(
                    'kibo360_delivery_challans',
                    challans.map((c) => ({
                      Challan_No: c.challanNumber,
                      Order_No: c.orderNumber,
                      Invoice_No: c.invoiceNumber,
                      Customer_Name: c.customerName,
                      Transporter: c.transporter,
                      LR_Number: c.lrNumber,
                      Vehicle_No: c.vehicleNumber,
                      Dispatch_Date: c.dispatchDate,
                      Copies_Count: c.itemsCount,
                      Status: c.status,
                    }))
                  )
                }
              >
                Export Challans (CSV)
              </Button>
              <Button
                variant="primary"
                size="sm"
                leftIcon={<Plus className="h-4 w-4" />}
                style={{ backgroundColor: brand.primaryColor }}
                className="text-white hover:opacity-90"
                onClick={() => setNewChallanModalOpen(true)}
              >
                + New Delivery Challan
              </Button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-600 text-xs uppercase border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Challan Number</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-3">Transporter</th>
                  <th className="py-3 px-3">LR Number</th>
                  <th className="py-3 px-3">Vehicle No</th>
                  <th className="py-3 px-3">Dispatch Date</th>
                  <th className="py-3 px-3 text-center">Copies</th>
                  <th className="py-3 px-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {challans.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4 font-mono font-semibold text-slate-900">
                      {c.challanNumber}
                      {c.orderNumber && (
                        <div className="text-[10px] text-slate-400">Order: {c.orderNumber}</div>
                      )}
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-800">{c.customerName}</td>
                    <td className="py-3 px-3 text-slate-600">{c.transporter}</td>
                    <td className="py-3 px-3 font-mono text-xs text-slate-700">{c.lrNumber}</td>
                    <td className="py-3 px-3 font-mono text-xs text-slate-700">{c.vehicleNumber}</td>
                    <td className="py-3 px-3 text-slate-600">{c.dispatchDate}</td>
                    <td className="py-3 px-3 text-center font-semibold text-slate-800">
                      {c.itemsCount.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <Badge variant="success">{c.status}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* ===================================================================== */}
      {/* TAB 5: SALES RETURNS & CREDIT NOTES */}
      {/* ===================================================================== */}
      {activeTab === 'returns' && (
        <Card className="bg-white shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-3">
            <div>
              <h3 className="font-semibold text-slate-800">Sales Returns & Credit Notes</h3>
              <p className="text-xs text-slate-500">
                Restores warehouse inventory balances and automatically posts credit note reversal vouchers to GL
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                leftIcon={<Download className="h-4 w-4" />}
                onClick={() =>
                  exportToCsv(
                    'kibo360_sales_returns_credit_notes',
                    returns.map((ret) => ({
                      Credit_Note_No: ret.creditNoteNumber,
                      Ref_Invoice: ret.invoiceNumber,
                      Customer_Name: ret.customerName,
                      Return_Date: ret.returnDate,
                      Reason: ret.reason,
                      Total_Refunded: ret.totalAmount,
                      GL_Voucher: ret.voucherNumber,
                      Status: ret.status,
                    }))
                  )
                }
              >
                Export Credit Notes (CSV)
              </Button>
              <Button
                variant="primary"
                size="sm"
                leftIcon={<Plus className="h-4 w-4" />}
                style={{ backgroundColor: brand.primaryColor }}
                className="text-white hover:opacity-90"
                onClick={() => setNewReturnModalOpen(true)}
              >
                + Post Credit Note
              </Button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-600 text-xs uppercase border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Credit Note No</th>
                  <th className="py-3 px-4">Ref Invoice</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-3">Return Reason</th>
                  <th className="py-3 px-3 text-right">Total Refunded</th>
                  <th className="py-3 px-3 text-center">GL Voucher</th>
                  <th className="py-3 px-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {returns.map((ret) => (
                  <tr key={ret.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4 font-mono font-semibold text-slate-900">
                      {ret.creditNoteNumber}
                    </td>
                    <td className="py-3 px-4 font-mono text-xs text-slate-600">{ret.invoiceNumber}</td>
                    <td className="py-3 px-4 font-medium text-slate-800">{ret.customerName}</td>
                    <td className="py-3 px-3 text-xs text-slate-600">{ret.reason}</td>
                    <td className="py-3 px-3 text-right font-mono font-semibold text-rose-600">
                      ₹{ret.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span
                        className="px-2 py-0.5 font-mono text-xs rounded font-medium"
                        style={{
                          backgroundColor: `${brand.primaryColor}15`,
                          color: brand.primaryColor,
                        }}
                      >
                        {ret.voucherNumber}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <Badge variant="success">{ret.status}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* ===================================================================== */}
      {/* TAB 6: CUSTOMER RECEIPTS */}
      {/* ===================================================================== */}
      {activeTab === 'receipts' && (
        <Card className="bg-white shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-3">
            <div>
              <h3 className="font-semibold text-slate-800">Customer Receipts & Settlements</h3>
              <p className="text-xs text-slate-500">
                Track payments received from trade debtors via Bank NEFT/RTGS, UPI, or Cheque with live balance deduction
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                leftIcon={<Download className="h-4 w-4" />}
                onClick={() =>
                  exportToCsv(
                    'kibo360_customer_receipts',
                    receipts.map((rcpt) => ({
                      Receipt_No: rcpt.receiptNumber,
                      Customer_Name: rcpt.customerName,
                      Invoice_Ref: rcpt.invoiceNumber,
                      Date: rcpt.date,
                      Payment_Method: rcpt.paymentMethod,
                      Bank_Deposited: rcpt.bankName,
                      Amount_Received: rcpt.amount,
                      Reference_No: rcpt.reference,
                      GL_Voucher: rcpt.voucherNumber,
                    }))
                  )
                }
              >
                Export Receipts (CSV)
              </Button>
              <Button
                variant="primary"
                size="sm"
                leftIcon={<Plus className="h-4 w-4" />}
                style={{ backgroundColor: brand.primaryColor }}
                className="text-white hover:opacity-90"
                onClick={() => setNewReceiptModalOpen(true)}
              >
                + Record Customer Receipt
              </Button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-600 text-xs uppercase border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Receipt Number</th>
                  <th className="py-3 px-4">Customer Name</th>
                  <th className="py-3 px-3">Date</th>
                  <th className="py-3 px-3">Payment Method</th>
                  <th className="py-3 px-3">Deposited In</th>
                  <th className="py-3 px-3 text-right">Amount Received</th>
                  <th className="py-3 px-3 text-center">GL Voucher</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {receipts.map((rcpt) => (
                  <tr key={rcpt.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4 font-mono font-semibold text-slate-900">
                      {rcpt.receiptNumber}
                      {rcpt.invoiceNumber && (
                        <div className="text-[10px] text-slate-400">Inv: {rcpt.invoiceNumber}</div>
                      )}
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-800">{rcpt.customerName}</td>
                    <td className="py-3 px-3 text-slate-600">{rcpt.date}</td>
                    <td className="py-3 px-3 text-xs text-slate-700">{rcpt.paymentMethod}</td>
                    <td className="py-3 px-3 text-xs text-slate-600">{rcpt.bankName}</td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-emerald-600">
                      ₹{rcpt.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span
                        className="px-2 py-0.5 font-mono text-xs rounded font-medium"
                        style={{
                          backgroundColor: `${brand.primaryColor}15`,
                          color: brand.primaryColor,
                        }}
                      >
                        {rcpt.voucherNumber}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* ===================================================================== */}
      {/* TAB 7: CUSTOMER AGEING & STATEMENTS */}
      {/* ===================================================================== */}
      {activeTab === 'ageing' && (
        <Card className="bg-white shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-3">
            <div>
              <h3 className="font-semibold text-slate-800">Accounts Receivable Debtors Ageing Analysis</h3>
              <p className="text-xs text-slate-500">
                Dynamic debtor ageing buckets based on invoice due dates and payments
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Download className="h-4 w-4" />}
              onClick={() =>
                exportToCsv(
                  'kibo360_debtors_ageing',
                  ageingList.map((a) => ({
                    Customer_Name: a.customerName,
                    GSTIN: a.gstin,
                    Credit_Limit: a.creditLimit,
                    Current_Due: a.current,
                    Days_1_30: a.days1to30,
                    Days_31_60: a.days31to60,
                    Days_61_90: a.days61to90,
                    Days_90_Plus: a.days90Plus,
                    Total_Outstanding_Due: a.totalDue,
                  }))
                )
              }
            >
              Export Ageing (CSV)
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-600 text-xs uppercase border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Customer & GSTIN</th>
                  <th className="py-3 px-3 text-right">Credit Limit</th>
                  <th className="py-3 px-3 text-right">Current (0-30d)</th>
                  <th className="py-3 px-3 text-right">1-30 Days</th>
                  <th className="py-3 px-3 text-right">31-60 Days</th>
                  <th className="py-3 px-3 text-right">61-90 Days</th>
                  <th className="py-3 px-3 text-right">90+ Days</th>
                  <th className="py-3 px-3 text-right">Total Due</th>
                  <th className="py-3 px-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {ageingList.map((a, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-medium text-slate-900">{a.customerName}</div>
                      <div className="text-xs font-mono text-slate-500">{a.gstin}</div>
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-slate-600">
                      ₹{a.creditLimit.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-slate-700">
                      ₹{a.current.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-slate-700">
                      ₹{a.days1to30.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-slate-700">
                      ₹{a.days31to60.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-slate-700">
                      ₹{a.days61to90.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-slate-700">
                      ₹{a.days90Plus.toLocaleString('en-IN')}
                    </td>
                    <td
                      className="py-3 px-3 text-right font-mono font-bold"
                      style={{ color: brand.primaryColor }}
                    >
                      ₹{a.totalDue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs"
                        onClick={() => openCustomerStatementDrawer(a.customerName)}
                      >
                        Statement
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* ===================================================================== */}
      {/* TAB 8: SALES ANALYTICS & MARGINS */}
      {/* ===================================================================== */}
      {activeTab === 'reports' && (
        <div className="space-y-6">
          <Card className="p-4 bg-white shadow-sm border border-slate-200">
            <div className="flex justify-between items-center mb-3">
              <div>
                <h3 className="font-semibold text-slate-800 text-sm">
                  Gross Margin & Profitability by Book SKU
                </h3>
                <p className="text-xs text-slate-500">
                  Calculated against live Weighted Average Cost (WAC) inventory valuations
                </p>
              </div>

              <Button
                variant="outline"
                size="sm"
                leftIcon={<Download className="h-4 w-4" />}
                onClick={() =>
                  exportToCsv(
                    'kibo360_sales_sku_margins',
                    skuAnalytics.map((s) => ({
                      SKU: s.sku,
                      Title: s.title,
                      Quantity_Sold: s.qty,
                      Revenue: s.revenue,
                      Estimated_COGS: s.totalCogs,
                      Gross_Margin: s.margin,
                      Margin_Percent: `${s.marginPct}%`,
                    }))
                  )
                }
              >
                Export Margins (CSV)
              </Button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-600 text-xs uppercase border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-4">SKU Code</th>
                    <th className="py-2.5 px-4">Book Title</th>
                    <th className="py-2.5 px-3 text-center">Quantity Sold</th>
                    <th className="py-2.5 px-3 text-right">Revenue</th>
                    <th className="py-2.5 px-3 text-right">Est. COGS</th>
                    <th className="py-2.5 px-3 text-right">Gross Margin (Profit)</th>
                    <th className="py-2.5 px-3 text-center">Margin %</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {skuAnalytics.map((row) => (
                    <tr key={row.sku} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4 font-mono text-xs font-semibold">{row.sku}</td>
                      <td className="py-3 px-4 font-medium text-slate-900">{row.title}</td>
                      <td className="py-3 px-3 text-center font-semibold">{row.qty}</td>
                      <td className="py-3 px-3 text-right font-mono">
                        ₹{row.revenue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3 px-3 text-right font-mono text-slate-500">
                        ₹{row.totalCogs.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3 px-3 text-right font-mono font-bold text-emerald-600">
                        ₹{row.margin.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-xs rounded font-bold">
                          {row.marginPct}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL 1: 80MM ESC/POS THERMAL RECEIPT PREVIEW */}
      {/* ===================================================================== */}
      <Modal
        isOpen={posReceiptModalOpen}
        onClose={() => setPosReceiptModalOpen(false)}
        title="POS Cashier Bill & ESC/POS Thermal Receipt"
        maxWidth="md"
      >
        <div className="space-y-4">
          <div className="p-4 bg-slate-900 text-emerald-400 font-mono text-xs rounded-lg overflow-x-auto whitespace-pre leading-relaxed shadow-inner">
{`================================================
                  KIBO360                       
       ${brand.companyName || 'Apex Educational Publishers'}              
    Central Retail Bookstore & Depot Depot       
           GSTIN: 07AAAAA0000A1Z5                
================================================
Bill No: ${lastCompletedBill?.billNumber || 'POS/2026/00003'}  Date: ${lastCompletedBill?.date || new Date().toISOString().slice(0, 10)}
Time: ${lastCompletedBill?.time || '14:30'}  Terminal: POS-01
Cashier: Pooja Sharma
Customer: ${lastCompletedBill?.customerName || 'Retail Walk-in Customer'}
------------------------------------------------
Item                       Qty    Rate    Amount
------------------------------------------------
${(lastCompletedBill?.items || posCart)
  .map(
    (i) =>
      `${i.title.slice(0, 24).padEnd(24, ' ')}  ${String(i.quantity).padStart(3, ' ')}  ${i.unitPrice.toFixed(2).padStart(7, ' ')}  ${i.totalAmount.toFixed(2).padStart(8, ' ')}`
  )
  .join('\n')}
------------------------------------------------
Subtotal Taxable:                   ₹${(lastCompletedBill?.subtotal || cartSubtotal).toFixed(2)}
GST Output Tax (HSN 4901 0%):       ₹0.00
Round Off:                          ₹0.00
NET PAYABLE:                        ₹${(lastCompletedBill?.netPayable || cartNetPayable).toFixed(2)}
------------------------------------------------
Payment Method: ${lastCompletedBill?.paymentMethod || posPaymentMethod}
Cash Tendered: ₹${(lastCompletedBill?.cashTendered || Number(posCashAmount) || 0).toFixed(2)}
UPI Received: ₹${(lastCompletedBill?.upiReceived || Number(posUpiAmount) || 0).toFixed(2)}
General Ledger Voucher: ${lastCompletedBill?.voucherNumber || 'SV/2026/POS-0001'}
================================================
    Thank you for purchasing with KIBO360!      
   Books once sold cannot be returned without   
       original invoice within 7 days.          
================================================`}
          </div>

          <div className="flex justify-between items-center pt-2">
            <span className="text-xs text-slate-500 font-mono">
              Status: POSTED to GL · Stock Decremented
            </span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setPosReceiptModalOpen(false)}>
                Close
              </Button>
              <Button
                variant="primary"
                size="sm"
                style={{ backgroundColor: brand.primaryColor }}
                className="text-white hover:opacity-90"
                leftIcon={<Printer className="h-4 w-4" />}
                onClick={() => {
                  window.print();
                  setPosReceiptModalOpen(false);
                }}
              >
                Print 80mm Slip
              </Button>
            </div>
          </div>
        </div>
      </Modal>

      {/* ===================================================================== */}
      {/* MODAL 2: NEW SALES ORDER */}
      {/* ===================================================================== */}
      <Modal
        isOpen={newOrderModalOpen}
        onClose={() => setNewOrderModalOpen(false)}
        title="Create New Sales Order"
        maxWidth="lg"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Customer Name" required>
              <select
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
                value={orderCustomerName}
                onChange={(e) => setOrderCustomerName(e.target.value)}
              >
                {tradeParties.map((p) => (
                  <option key={p.id} value={p.name}>
                    {p.name} ({p.partyType})
                  </option>
                ))}
              </select>
            </FormField>

            <FormField label="Sales Channel" required>
              <select
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
                value={orderChannel}
                onChange={(e) => setOrderChannel(e.target.value as any)}
              >
                <option value="WHOLESALE">Wholesale (40% discount)</option>
                <option value="DISTRIBUTOR">Distributor (40% discount)</option>
                <option value="DEALER">Dealer (25% discount)</option>
                <option value="INSTITUTION_SCHOOL">Institution / School (20% discount)</option>
              </select>
            </FormField>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Select Book Title" required>
              <select
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
                value={orderBookSku}
                onChange={(e) => setOrderBookSku(e.target.value)}
              >
                {catalogueBooks.map((b) => (
                  <option key={b.id} value={b.sku}>
                    {b.title} (MRP: ₹{b.mrp})
                  </option>
                ))}
              </select>
            </FormField>

            <FormField label="Order Quantity" required>
              <Input
                type="number"
                value={orderQty}
                onChange={(e) => setOrderQty(e.target.value)}
                placeholder="e.g. 50"
              />
            </FormField>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Freight Charges (₹)">
              <Input
                type="number"
                value={orderFreight}
                onChange={(e) => setOrderFreight(e.target.value)}
                placeholder="400"
              />
            </FormField>

            <FormField label="Order Notes / Dispatch Instructions">
              <Input
                value={orderNotes}
                onChange={(e) => setOrderNotes(e.target.value)}
                placeholder="Consignment via VRL Logistics"
              />
            </FormField>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <Button variant="outline" size="sm" onClick={() => setNewOrderModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              style={{ backgroundColor: brand.primaryColor }}
              className="text-white hover:opacity-90"
              onClick={handleCreateOrder}
            >
              Confirm Sales Order
            </Button>
          </div>
        </div>
      </Modal>

      {/* ===================================================================== */}
      {/* MODAL 3: GENERATE TAX INVOICE */}
      {/* ===================================================================== */}
      <Modal
        isOpen={newInvoiceModalOpen}
        onClose={() => setNewInvoiceModalOpen(false)}
        title="Generate Direct Sales Tax Invoice"
        maxWidth="lg"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Customer Name" required>
              <select
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
                value={invCustomerName}
                onChange={(e) => setInvCustomerName(e.target.value)}
              >
                {tradeParties.map((p) => (
                  <option key={p.id} value={p.name}>
                    {p.name}
                  </option>
                ))}
              </select>
            </FormField>

            <FormField label="Sales Channel" required>
              <select
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
                value={invChannel}
                onChange={(e) => setInvChannel(e.target.value as any)}
              >
                <option value="WHOLESALE">Wholesale (40% discount)</option>
                <option value="DISTRIBUTOR">Distributor (40% discount)</option>
                <option value="DEALER">Dealer (25% discount)</option>
                <option value="INSTITUTION_SCHOOL">Institution / School (20% discount)</option>
              </select>
            </FormField>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Select Book SKU" required>
              <select
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
                value={invBookSku}
                onChange={(e) => setInvBookSku(e.target.value)}
              >
                {catalogueBooks.map((b) => (
                  <option key={b.id} value={b.sku}>
                    {b.title} (MRP: ₹{b.mrp})
                  </option>
                ))}
              </select>
            </FormField>

            <FormField label="Invoice Quantity" required>
              <Input
                type="number"
                value={invQty}
                onChange={(e) => setInvQty(e.target.value)}
                placeholder="e.g. 50"
              />
            </FormField>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Payment Method">
              <select
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
                value={invPaymentMethod}
                onChange={(e) => setInvPaymentMethod(e.target.value as any)}
              >
                <option value="CREDIT">Credit (30 Days Payment Terms)</option>
                <option value="BANK_TRANSFER">Bank Transfer (NEFT/RTGS)</option>
                <option value="CASH">Immediate Cash</option>
                <option value="UPI">UPI Payment</option>
              </select>
            </FormField>

            <FormField label="Freight Charges (₹)">
              <Input
                type="number"
                value={invFreight}
                onChange={(e) => setInvFreight(e.target.value)}
                placeholder="350"
              />
            </FormField>
          </div>

          <div className="p-3 bg-purple-50 text-purple-950 rounded-lg text-xs font-medium">
            Generating this invoice automatically deducts inventory stock, logs an outward sale in the bin card, and posts a balanced double-entry voucher (SV) in the General Ledger.
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <Button variant="outline" size="sm" onClick={() => setNewInvoiceModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              style={{ backgroundColor: brand.primaryColor }}
              className="text-white hover:opacity-90"
              onClick={handleCreateInvoiceDirect}
            >
              Issue Tax Invoice
            </Button>
          </div>
        </div>
      </Modal>

      {/* ===================================================================== */}
      {/* MODAL 4: NEW DELIVERY CHALLAN */}
      {/* ===================================================================== */}
      <Modal
        isOpen={newChallanModalOpen}
        onClose={() => setNewChallanModalOpen(false)}
        title="Create New Delivery Challan"
        maxWidth="md"
      >
        <div className="space-y-4">
          <FormField label="Customer Name" required>
            <select
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
              value={challanCustomer}
              onChange={(e) => setChallanCustomer(e.target.value)}
            >
              {tradeParties.map((p) => (
                <option key={p.id} value={p.name}>
                  {p.name}
                </option>
              ))}
            </select>
          </FormField>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Transporter Name" required>
              <Input
                value={challanTransporter}
                onChange={(e) => setChallanTransporter(e.target.value)}
                placeholder="e.g. VRL Logistics"
              />
            </FormField>

            <FormField label="Vehicle Number" required>
              <Input
                value={challanVehicle}
                onChange={(e) => setChallanVehicle(e.target.value)}
                placeholder="MH-04-AZ-4521"
              />
            </FormField>
          </div>

          <FormField label="Total Copies in Dispatch" required>
            <Input
              type="number"
              value={challanCopies}
              onChange={(e) => setChallanCopies(e.target.value)}
              placeholder="50"
            />
          </FormField>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <Button variant="outline" size="sm" onClick={() => setNewChallanModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              style={{ backgroundColor: brand.primaryColor }}
              className="text-white hover:opacity-90"
              onClick={handleCreateChallan}
            >
              Issue Delivery Challan
            </Button>
          </div>
        </div>
      </Modal>

      {/* ===================================================================== */}
      {/* MODAL 5: NEW SALES RETURN / CREDIT NOTE */}
      {/* ===================================================================== */}
      <Modal
        isOpen={newReturnModalOpen}
        onClose={() => setNewReturnModalOpen(false)}
        title="Issue Sales Return Credit Note"
        maxWidth="md"
      >
        <div className="space-y-4">
          <FormField label="Reference Tax Invoice" required>
            <select
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
              value={returnInvoiceNo}
              onChange={(e) => setReturnInvoiceNo(e.target.value)}
            >
              {invoices.map((inv) => (
                <option key={inv.id} value={inv.invoiceNumber}>
                  {inv.invoiceNumber} - {inv.customerName} (₹{inv.grandTotal})
                </option>
              ))}
            </select>
          </FormField>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Select Book SKU">
              <select
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
                value={returnSku}
                onChange={(e) => setReturnSku(e.target.value)}
              >
                {catalogueBooks.map((b) => (
                  <option key={b.id} value={b.sku}>
                    {b.title} ({b.sku})
                  </option>
                ))}
              </select>
            </FormField>

            <FormField label="Returned Copies Qty">
              <Input
                type="number"
                value={returnQty}
                onChange={(e) => setReturnQty(e.target.value)}
                placeholder="5"
              />
            </FormField>
          </div>

          <FormField label="Refund / Credit Amount (₹)" required>
            <Input
              type="number"
              step="0.01"
              value={returnAmount}
              onChange={(e) => setReturnAmount(e.target.value)}
              placeholder="1485.00"
            />
          </FormField>

          <FormField label="Return Reason / Inspection Notes" required>
            <Input
              value={returnReason}
              onChange={(e) => setReturnReason(e.target.value)}
              placeholder="Defective binding / transit damage"
            />
          </FormField>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <Button variant="outline" size="sm" onClick={() => setNewReturnModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              style={{ backgroundColor: brand.primaryColor }}
              className="text-white hover:opacity-90"
              onClick={handleCreateReturn}
            >
              Post Credit Note
            </Button>
          </div>
        </div>
      </Modal>

      {/* ===================================================================== */}
      {/* MODAL 6: RECORD CUSTOMER RECEIPT */}
      {/* ===================================================================== */}
      <Modal
        isOpen={newReceiptModalOpen}
        onClose={() => setNewReceiptModalOpen(false)}
        title="Record Customer Payment Receipt"
        maxWidth="md"
      >
        <div className="space-y-4">
          <FormField label="Customer Name" required>
            <select
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
              value={rcptCustomerName}
              onChange={(e) => setRcptCustomerName(e.target.value)}
            >
              {tradeParties.map((p) => (
                <option key={p.id} value={p.name}>
                  {p.name}
                </option>
              ))}
            </select>
          </FormField>

          <FormField label="Invoice Allocation (Optional)">
            <select
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
              value={rcptInvoiceNo}
              onChange={(e) => setRcptInvoiceNo(e.target.value)}
            >
              <option value="">On Account Settlement (Unallocated)</option>
              {invoices
                .filter((i) => !rcptCustomerName || i.customerName === rcptCustomerName)
                .map((i) => (
                  <option key={i.id} value={i.invoiceNumber}>
                    {i.invoiceNumber} - Bal: ₹{i.balanceDue}
                  </option>
                ))}
            </select>
          </FormField>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Amount Received (₹)" required>
              <Input
                type="number"
                step="0.01"
                value={rcptAmount}
                onChange={(e) => setRcptAmount(e.target.value)}
                placeholder="13715.00"
              />
            </FormField>

            <FormField label="Payment Method" required>
              <select
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
                value={rcptMethod}
                onChange={(e) => setRcptMethod(e.target.value as any)}
              >
                <option value="BANK_TRANSFER_NEFT_RTGS">Bank NEFT / RTGS</option>
                <option value="UPI">UPI / QR Code</option>
                <option value="CHEQUE">Cheque Clearance</option>
                <option value="CASH">Cash Counter</option>
              </select>
            </FormField>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Deposited Bank Account">
              <Input
                value={rcptBank}
                onChange={(e) => setRcptBank(e.target.value)}
                placeholder="HDFC Bank Corporate A/c"
              />
            </FormField>

            <FormField label="UTR / Ref Number">
              <Input
                value={rcptRef}
                onChange={(e) => setRcptRef(e.target.value)}
                placeholder="NEFT/202611/98982"
              />
            </FormField>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <Button variant="outline" size="sm" onClick={() => setNewReceiptModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              style={{ backgroundColor: brand.primaryColor }}
              className="text-white hover:opacity-90"
              onClick={handleCreateReceipt}
            >
              Post Customer Receipt
            </Button>
          </div>
        </div>
      </Modal>

      {/* ===================================================================== */}
      {/* DRAWER: CUSTOMER STATEMENT */}
      {/* ===================================================================== */}
      <Drawer
        isOpen={statementDrawerOpen}
        onClose={() => setStatementDrawerOpen(false)}
        title={`Customer Statement: ${selectedStatementCustomerName}`}
        width="lg"
      >
        <div className="space-y-4 p-4">
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex justify-between items-center text-xs">
            <div>
              <span className="font-semibold text-slate-700">Account:</span> {selectedStatementCustomerName}
            </div>
            <div>
              <span className="font-semibold text-slate-700">Closing Balance:</span>{' '}
              <span
                className={`font-bold font-mono ${
                  (currentCustomerStatement?.closingBalance || 0) > 0
                    ? 'text-rose-600'
                    : 'text-emerald-600'
                }`}
              >
                ₹{(currentCustomerStatement?.closingBalance || 0).toLocaleString('en-IN', {
                  minimumFractionDigits: 2,
                })}{' '}
                {(currentCustomerStatement?.closingBalance || 0) > 0 ? 'Dr (Due)' : '(Settled)'}
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-600 uppercase border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Reference</th>
                  <th className="py-2.5 px-3">Description</th>
                  <th className="py-2.5 px-2 text-right">Debit (₹)</th>
                  <th className="py-2.5 px-2 text-right">Credit (₹)</th>
                  <th className="py-2.5 px-3 text-right">Balance (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {currentCustomerStatement?.entries.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-6 text-center text-slate-400">
                      No transactions recorded for this customer account.
                    </td>
                  </tr>
                ) : (
                  currentCustomerStatement?.entries.map((e, idx) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="py-2.5 px-3 text-slate-600">{e.date}</td>
                      <td
                        className="py-2.5 px-3 font-mono font-medium"
                        style={{ color: brand.primaryColor }}
                      >
                        {e.ref}
                      </td>
                      <td className="py-2.5 px-3 text-slate-700">{e.desc}</td>
                      <td className="py-2.5 px-2 text-right font-mono text-slate-900">
                        {e.debit > 0 ? `₹${e.debit.toLocaleString('en-IN')}` : '-'}
                      </td>
                      <td className="py-2.5 px-2 text-right font-mono text-emerald-600 font-semibold">
                        {e.credit > 0 ? `₹${e.credit.toLocaleString('en-IN')}` : '-'}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                        ₹{e.balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </Drawer>
    </div>
  );
};
