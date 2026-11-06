import React, { useState, useMemo } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { FormField } from '../components/ui/FormField';
import { Input } from '../components/ui/Input';
import { PageHeader } from '../components/ui/PageHeader';
import { useBrand } from '../contexts/BrandContext';
import {
  Truck,
  Plus,
  Building,
  Store,
  DollarSign,
  FileText,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Search,
  ExternalLink,
  RotateCcw,
  Sparkles,
  Percent,
  TrendingDown,
  TrendingUp,
  Tag,
  ShieldCheck,
  Receipt,
  Package,
  Boxes,
  MapPin,
  Send,
  ClipboardCheck,
  Download,
  Trash2,
  Edit,
  ArrowRight,
  Check,
} from 'lucide-react';
import {
  DistributorItem,
  DealerItem,
  DistributionOrderItem,
  ConsignmentIssueItem,
  CommissionSettlementItem,
  getStoredDistributors,
  saveDistributorItem,
  deleteDistributorItem,
  getStoredDealers,
  saveDealerItem,
  deleteDealerItem,
  getStoredDistOrders,
  saveDistOrderItem,
  getStoredConsignments,
  saveConsignmentItem,
  settleConsignmentItem,
  getStoredCommissions,
  saveCommissionItem,
} from '../services/distributorService';
import { getStoredBooks, BookItem } from '../services/catalogueService';
import { getStoredWarehouses, WarehouseItem } from '../services/inventoryService';

export const DistributorsPage: React.FC = () => {
  const { brand } = useBrand();

  const [activeTab, setActiveTab] = useState<
    'distributors' | 'dealers' | 'orders' | 'consignments' | 'commissions'
  >('distributors');

  // Core Data States
  const [distributors, setDistributors] = useState<DistributorItem[]>(() => getStoredDistributors());
  const [dealers, setDealers] = useState<DealerItem[]>(() => getStoredDealers());
  const [orders, setOrders] = useState<DistributionOrderItem[]>(() => getStoredDistOrders());
  const [consignments, setConsignments] = useState<ConsignmentIssueItem[]>(() => getStoredConsignments());
  const [commissions, setCommissions] = useState<CommissionSettlementItem[]>(() => getStoredCommissions());

  // Linked Data
  const catalogueBooks = useMemo<BookItem[]>(() => getStoredBooks(), []);
  const warehouses = useMemo<WarehouseItem[]>(() => getStoredWarehouses(), []);

  // Filter & Search States
  const [searchTerm, setSearchTerm] = useState('');
  const [territoryFilter, setTerritoryFilter] = useState('ALL');
  const [dealerDistributorFilter, setDealerDistributorFilter] = useState('ALL');

  // Modal States
  const [isNewDistributorModalOpen, setIsNewDistributorModalOpen] = useState(false);
  const [editingDistributor, setEditingDistributor] = useState<DistributorItem | null>(null);

  const [isNewDealerModalOpen, setIsNewDealerModalOpen] = useState(false);
  const [editingDealer, setEditingDealer] = useState<DealerItem | null>(null);

  const [isNewOrderModalOpen, setIsNewOrderModalOpen] = useState(false);
  const [isNewConsignmentModalOpen, setIsNewConsignmentModalOpen] = useState(false);

  const [isSettleConsignmentModalOpen, setIsSettleConsignmentModalOpen] = useState(false);
  const [selectedConsignmentToSettle, setSelectedConsignmentToSettle] = useState<ConsignmentIssueItem | null>(null);
  const [settleSoldQty, setSettleSoldQty] = useState('100');
  const [settleReturnedQty, setSettleReturnedQty] = useState('0');

  const [isNewCommissionModalOpen, setIsNewCommissionModalOpen] = useState(false);

  // Form States: Distributor
  const [distCode, setDistCode] = useState('');
  const [distName, setDistName] = useState('');
  const [distTerritory, setDistTerritory] = useState<DistributorItem['territory']>('NORTH_INDIA');
  const [distCity, setDistCity] = useState('');
  const [distState, setDistState] = useState('Delhi');
  const [distAddress, setDistAddress] = useState('');
  const [distGstin, setDistGstin] = useState('07AAACR1234A1Z1');
  const [distPan, setDistPan] = useState('AAACR1234A');
  const [distCreditLimit, setDistCreditLimit] = useState('2500000');
  const [distCommissionPct, setDistCommissionPct] = useState('8.0');
  const [distDiscountPct, setDistDiscountPct] = useState('40.0');
  const [distContactPerson, setDistContactPerson] = useState('');
  const [distPhone, setDistPhone] = useState('+91 ');
  const [distEmail, setDistEmail] = useState('');

  // Form States: Dealer
  const [dlrCode, setDlrCode] = useState('');
  const [dlrName, setDlrName] = useState('');
  const [dlrClassification, setDlrClassification] = useState<DealerItem['classification']>('RETAIL_BOOKSTORE');
  const [dlrDistributorName, setDlrDistributorName] = useState('');
  const [dlrTerritory, setDlrTerritory] = useState('NORTH_INDIA');
  const [dlrCity, setDlrCity] = useState('');
  const [dlrState, setDlrState] = useState('Delhi');
  const [dlrCreditLimit, setDlrCreditLimit] = useState('500000');
  const [dlrDiscountPct, setDlrDiscountPct] = useState('30.0');
  const [dlrContactPerson, setDlrContactPerson] = useState('');
  const [dlrPhone, setDlrPhone] = useState('+91 ');
  const [dlrEmail, setDlrEmail] = useState('');

  // Form States: Order
  const [ordPartyName, setOrdPartyName] = useState('');
  const [ordType, setOrdType] = useState<DistributionOrderItem['orderType']>('DISTRIBUTOR_BULK');
  const [ordQty, setOrdQty] = useState('1000');
  const [ordDispatchedQty, setOrdDispatchedQty] = useState('500');
  const [ordAmount, setOrdAmount] = useState('297000');
  const [ordTransporter, setOrdTransporter] = useState('VRL Logistics India Ltd.');
  const [ordLrNumber, setOrdLrNumber] = useState('VRL-LR-99881');
  const [ordVehicle, setOrdVehicle] = useState('MH-04-AZ-4521');
  const [ordWarehouse, setOrdWarehouse] = useState('Central Press & Distribution Depot');

  // Form States: Consignment
  const [csgDistName, setCsgDistName] = useState('');
  const [csgSku, setCsgSku] = useState(catalogueBooks[0]?.sku || 'BK-PHY-HCV-01');
  const [csgQty, setCsgQty] = useState('1000');
  const [csgWarehouse, setCsgWarehouse] = useState('Central Press & Distribution Depot');

  // Form States: Commission
  const [commDistName, setCommDistName] = useState('');
  const [commPeriod, setCommPeriod] = useState('Q3 FY26-27 Commission Cycle');
  const [commTurnover, setCommTurnover] = useState('5000000');
  const [commBaseRate, setCommBaseRate] = useState('8.0');
  const [commBonusRate, setCommBonusRate] = useState('2.0');
  const [commNotes, setCommNotes] = useState('Secondary dealer network volume incentive');

  // Reload helper
  const reloadData = () => {
    setDistributors(getStoredDistributors());
    setDealers(getStoredDealers());
    setOrders(getStoredDistOrders());
    setConsignments(getStoredConsignments());
    setCommissions(getStoredCommissions());
  };

  // Dynamic KPIs
  const totalOutstandingDue = useMemo(() => {
    const distDue = distributors.reduce((acc, d) => acc + d.currentOutstanding, 0);
    const dlrDue = dealers.reduce((acc, d) => acc + d.currentOutstanding, 0);
    return distDue + dlrDue;
  }, [distributors, dealers]);

  const totalConsignmentCopiesOnHold = useMemo(() => {
    return consignments.reduce((acc, c) => acc + c.balanceOnHoldQuantity, 0);
  }, [consignments]);

  const totalConsignmentValuation = useMemo(() => {
    return consignments.reduce((acc, c) => acc + c.balanceOnHoldQuantity * c.mrp, 0);
  }, [consignments]);

  const totalCommissionsPayable = useMemo(() => {
    return commissions.reduce((acc, c) => acc + c.totalCommissionPayable, 0);
  }, [commissions]);

  // Filtered Distributors
  const filteredDistributors = useMemo(() => {
    return distributors.filter((d) => {
      const matchSearch =
        !searchTerm ||
        d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.distributorCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.city.toLowerCase().includes(searchTerm.toLowerCase());

      const matchTerritory =
        territoryFilter === 'ALL' || d.territory === territoryFilter;

      return matchSearch && matchTerritory;
    });
  }, [distributors, searchTerm, territoryFilter]);

  // Filtered Dealers
  const filteredDealers = useMemo(() => {
    return dealers.filter((dlr) => {
      const matchSearch =
        !searchTerm ||
        dlr.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        dlr.dealerCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        dlr.city.toLowerCase().includes(searchTerm.toLowerCase());

      const matchDist =
        dealerDistributorFilter === 'ALL' ||
        dlr.distributorName === dealerDistributorFilter;

      return matchSearch && matchDist;
    });
  }, [dealers, searchTerm, dealerDistributorFilter]);

  // --- Handlers: Distributor ---
  const handleOpenNewDistributor = () => {
    setEditingDistributor(null);
    setDistCode(`DIST-REG-${String(distributors.length + 1).padStart(2, '0')}`);
    setDistName('');
    setDistTerritory('NORTH_INDIA');
    setDistCity('');
    setDistState('Delhi');
    setDistAddress('');
    setDistGstin('07AAACR1234A1Z1');
    setDistPan('AAACR1234A');
    setDistCreditLimit('2500000');
    setDistCommissionPct('8.0');
    setDistDiscountPct('40.0');
    setDistContactPerson('');
    setDistPhone('+91 ');
    setDistEmail('');
    setIsNewDistributorModalOpen(true);
  };

  const handleOpenEditDistributor = (d: DistributorItem) => {
    setEditingDistributor(d);
    setDistCode(d.distributorCode);
    setDistName(d.name);
    setDistTerritory(d.territory);
    setDistCity(d.city);
    setDistState(d.state);
    setDistAddress(d.address || '');
    setDistGstin(d.gstin || '');
    setDistPan(d.pan || '');
    setDistCreditLimit(String(d.creditLimit));
    setDistCommissionPct(String(d.commissionPercentage));
    setDistDiscountPct(String(d.standardDiscountPercentage));
    setDistContactPerson(d.contactPerson);
    setDistPhone(d.phone);
    setDistEmail(d.email);
    setIsNewDistributorModalOpen(true);
  };

  const handleSaveDistributor = () => {
    if (!distName) {
      alert('Please enter distributor legal entity name.');
      return;
    }
    saveDistributorItem({
      id: editingDistributor?.id,
      distributorCode: distCode,
      name: distName,
      territory: distTerritory,
      city: distCity || 'New Delhi',
      state: distState,
      address: distAddress,
      gstin: distGstin,
      pan: distPan,
      creditLimit: Number(distCreditLimit) || 2500000,
      commissionPercentage: Number(distCommissionPct) || 8.0,
      standardDiscountPercentage: Number(distDiscountPct) || 40.0,
      contactPerson: distContactPerson || 'Regional Lead',
      phone: distPhone || '+91 98000 00000',
      email: distEmail || 'distributor@trade.in',
    });
    setIsNewDistributorModalOpen(false);
    reloadData();
  };

  const handleDeleteDistributor = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to remove distributor "${name}"?`)) {
      deleteDistributorItem(id);
      reloadData();
    }
  };

  // --- Handlers: Dealer ---
  const handleOpenNewDealer = () => {
    setEditingDealer(null);
    setDlrCode(`DLR-REG-${String(dealers.length + 101)}`);
    setDlrName('');
    setDlrClassification('RETAIL_BOOKSTORE');
    setDlrDistributorName(distributors[0]?.name || '');
    setDlrTerritory('NORTH_INDIA');
    setDlrCity('');
    setDlrState('Delhi');
    setDlrCreditLimit('500000');
    setDlrDiscountPct('30.0');
    setDlrContactPerson('');
    setDlrPhone('+91 ');
    setDlrEmail('');
    setIsNewDealerModalOpen(true);
  };

  const handleOpenEditDealer = (dlr: DealerItem) => {
    setEditingDealer(dlr);
    setDlrCode(dlr.dealerCode);
    setDlrName(dlr.name);
    setDlrClassification(dlr.classification);
    setDlrDistributorName(dlr.distributorName || '');
    setDlrTerritory(dlr.territory);
    setDlrCity(dlr.city);
    setDlrState(dlr.state);
    setDlrCreditLimit(String(dlr.creditLimit));
    setDlrDiscountPct(String(dlr.discountPercentage));
    setDlrContactPerson(dlr.contactPerson);
    setDlrPhone(dlr.phone);
    setDlrEmail(dlr.email || '');
    setIsNewDealerModalOpen(true);
  };

  const handleSaveDealer = () => {
    if (!dlrName) {
      alert('Please enter dealer name.');
      return;
    }
    saveDealerItem({
      id: editingDealer?.id,
      dealerCode: dlrCode,
      name: dlrName,
      classification: dlrClassification,
      distributorName: dlrDistributorName,
      territory: dlrTerritory,
      city: dlrCity || 'New Delhi',
      state: dlrState,
      creditLimit: Number(dlrCreditLimit) || 500000,
      discountPercentage: Number(dlrDiscountPct) || 30.0,
      contactPerson: dlrContactPerson || 'Store Manager',
      phone: dlrPhone || '+91 98000 00000',
      email: dlrEmail,
    });
    setIsNewDealerModalOpen(false);
    reloadData();
  };

  const handleDeleteDealer = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to remove dealer "${name}"?`)) {
      deleteDealerItem(id);
      reloadData();
    }
  };

  // --- Handlers: Orders ---
  const handleOpenNewOrder = () => {
    setOrdPartyName(distributors[0]?.name || dealers[0]?.name || '');
    setOrdType('DISTRIBUTOR_BULK');
    setOrdQty('1000');
    setOrdDispatchedQty('600');
    setOrdAmount('297000');
    setOrdTransporter('VRL Logistics India Ltd.');
    setOrdLrNumber(`VRL-LR-${Math.floor(100000 + Math.random() * 900000)}`);
    setOrdVehicle('MH-04-AZ-4521');
    setOrdWarehouse('Central Press & Distribution Depot');
    setIsNewOrderModalOpen(true);
  };

  const handleSaveOrder = () => {
    saveDistOrderItem({
      partyName: ordPartyName,
      orderType: ordType,
      totalQuantityOrdered: Number(ordQty) || 1000,
      totalQuantityDispatched: Number(ordDispatchedQty) || 0,
      netOrderAmount: Number(ordAmount) || 0,
      transporterInfo: ordTransporter,
      lrNumber: ordLrNumber,
      vehicleNumber: ordVehicle,
      warehouseName: ordWarehouse,
      status: Number(ordDispatchedQty) >= Number(ordQty) ? 'COMPLETED' : 'PARTIALLY_DISPATCHED',
    });
    setIsNewOrderModalOpen(false);
    reloadData();
  };

  // --- Handlers: Consignments ---
  const handleOpenNewConsignment = () => {
    setCsgDistName(distributors[0]?.name || '');
    setCsgSku(catalogueBooks[0]?.sku || 'BK-PHY-HCV-01');
    setCsgQty('1000');
    setCsgWarehouse('Central Press & Distribution Depot');
    setIsNewConsignmentModalOpen(true);
  };

  const handleSaveConsignment = () => {
    const book = catalogueBooks.find((b) => b.sku === csgSku);
    saveConsignmentItem({
      distributorName: csgDistName,
      sku: csgSku,
      title: book ? book.title : csgSku,
      mrp: book ? book.mrp : 495.0,
      totalIssuedQuantity: Number(csgQty) || 1000,
      warehouseName: csgWarehouse,
      notes: 'Consignment exhibition / regional promotion stock',
    });
    setIsNewConsignmentModalOpen(false);
    reloadData();
  };

  const handleOpenSettleConsignment = (csg: ConsignmentIssueItem) => {
    setSelectedConsignmentToSettle(csg);
    setSettleSoldQty(String(Math.min(100, csg.balanceOnHoldQuantity)));
    setSettleReturnedQty('0');
    setIsSettleConsignmentModalOpen(true);
  };

  const handleConfirmSettleConsignment = () => {
    if (!selectedConsignmentToSettle) return;
    settleConsignmentItem(
      selectedConsignmentToSettle.id,
      Number(settleSoldQty) || 0,
      Number(settleReturnedQty) || 0
    );
    setIsSettleConsignmentModalOpen(false);
    reloadData();
  };

  // --- Handlers: Commission ---
  const handleOpenNewCommission = () => {
    setCommDistName(distributors[0]?.name || '');
    setCommPeriod(`Q${Math.ceil((new Date().getMonth() + 1) / 3)} FY26-27 Commission Cycle`);
    setCommTurnover('5000000');
    setCommBaseRate('8.0');
    setCommBonusRate('2.0');
    setCommNotes('Territory sales accelerator bonus');
    setIsNewCommissionModalOpen(true);
  };

  const handleSaveCommission = () => {
    saveCommissionItem({
      distributorName: commDistName,
      period: commPeriod,
      secondaryTurnover: Number(commTurnover) || 5000000,
      baseCommissionRate: Number(commBaseRate) || 8.0,
      targetBonusRate: Number(commBonusRate) || 2.0,
      notes: commNotes,
    });
    setIsNewCommissionModalOpen(false);
    reloadData();
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
      {/* Top Header */}
      <PageHeader
        title="Distributor & Dealer Management Hub"
        description="Regional distribution networks, dealer wholesale slabs, consignment stock tracking, dispatch challans with LR tracking, overriding commissions, and channel profitability."
        breadcrumbs={[
          { label: 'Dashboard', href: '/' },
          { label: 'Distributors & Dealers', href: '/distributors' },
        ]}
        actions={
          <div className="flex items-center flex-wrap gap-2.5">
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Boxes className="w-4 h-4 text-[#690BA8]" />}
              onClick={() => setActiveTab('consignments')}
            >
              Consignment Stock
            </Button>
            <Button
              variant="secondary"
              size="sm"
              leftIcon={<Store className="w-4 h-4" />}
              onClick={handleOpenNewDealer}
            >
              + Register Dealer
            </Button>
            <Button
              variant="primary"
              size="sm"
              leftIcon={<Plus className="w-4 h-4" />}
              style={{ backgroundColor: brand.primaryColor }}
              className="text-white hover:opacity-90"
              onClick={handleOpenNewDistributor}
            >
              + Register Distributor
            </Button>
          </div>
        }
      />

      {/* KPI Overview Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card
          className="p-4 bg-white shadow-sm"
          style={{ borderLeftWidth: '4px', borderLeftColor: brand.primaryColor }}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Master Distributors
            </span>
            <div
              className="p-2 rounded-lg"
              style={{
                backgroundColor: `${brand.primaryColor}15`,
                color: brand.primaryColor,
              }}
            >
              <Building className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-800">
            {distributors.length} Regional Hubs
          </div>
          <div className="mt-1 text-xs text-emerald-600 font-medium flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> 4 Territories Covered
          </div>
        </Card>

        <Card
          className="p-4 bg-white shadow-sm"
          style={{ borderLeftWidth: '4px', borderLeftColor: brand.deepColor }}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Dealer Network
            </span>
            <div
              className="p-2 rounded-lg"
              style={{
                backgroundColor: `${brand.deepColor}15`,
                color: brand.deepColor,
              }}
            >
              <Store className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900">
            {dealers.length} Retailers
          </div>
          <div className="mt-1 text-xs text-slate-500">Prime & Institutional</div>
        </Card>

        <Card
          className="p-4 bg-white shadow-sm"
          style={{ borderLeftWidth: '4px', borderLeftColor: brand.accentColor }}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Consignment On-Hold
            </span>
            <div
              className="p-2 rounded-lg"
              style={{
                backgroundColor: `${brand.accentColor}15`,
                color: brand.accentColor,
              }}
            >
              <Boxes className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900">
            {totalConsignmentCopiesOnHold.toLocaleString('en-IN')} Copies
          </div>
          <div className="mt-1 text-xs text-purple-700 font-medium">
            ₹{totalConsignmentValuation.toLocaleString('en-IN', { minimumFractionDigits: 2 })} at MRP
          </div>
        </Card>

        <Card
          className="p-4 bg-white shadow-sm"
          style={{ borderLeftWidth: '4px', borderLeftColor: brand.coralColor }}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Total Outstanding
            </span>
            <div
              className="p-2 rounded-lg"
              style={{
                backgroundColor: `${brand.coralColor}15`,
                color: brand.coralColor,
              }}
            >
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900">
            ₹{totalOutstandingDue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
          <div className="mt-1 text-xs text-amber-700 font-medium">
            Within Authorized Credit Limits
          </div>
        </Card>

        <Card className="p-4 bg-white shadow-sm border-l-4 border-l-emerald-600">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Accrued Commission
            </span>
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-emerald-700">
            ₹{totalCommissionsPayable.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
          <div className="mt-1 text-xs text-emerald-600 font-medium">
            Overriding Commission Slabs
          </div>
        </Card>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b border-slate-200 gap-1 overflow-x-auto text-sm font-medium">
        <button
          onClick={() => setActiveTab('distributors')}
          className={`px-4 py-2.5 flex items-center gap-2 border-b-2 font-medium transition-colors whitespace-nowrap ${
            activeTab === 'distributors'
              ? 'font-semibold'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
          style={
            activeTab === 'distributors'
              ? { borderBottomColor: brand.primaryColor, color: brand.primaryColor }
              : {}
          }
        >
          <Building className="w-4 h-4" />
          Distributor Master ({distributors.length})
        </button>

        <button
          onClick={() => setActiveTab('dealers')}
          className={`px-4 py-2.5 flex items-center gap-2 border-b-2 font-medium transition-colors whitespace-nowrap ${
            activeTab === 'dealers'
              ? 'font-semibold'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
          style={
            activeTab === 'dealers'
              ? { borderBottomColor: brand.primaryColor, color: brand.primaryColor }
              : {}
          }
        >
          <Store className="w-4 h-4" />
          Dealer Network ({dealers.length})
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
          <Truck className="w-4 h-4" />
          Orders & LR Dispatches ({orders.length})
        </button>

        <button
          onClick={() => setActiveTab('consignments')}
          className={`px-4 py-2.5 flex items-center gap-2 border-b-2 font-medium transition-colors whitespace-nowrap ${
            activeTab === 'consignments'
              ? 'font-semibold'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
          style={
            activeTab === 'consignments'
              ? { borderBottomColor: brand.primaryColor, color: brand.primaryColor }
              : {}
          }
        >
          <Boxes className="w-4 h-4" />
          Consignment Stock ({consignments.length})
        </button>

        <button
          onClick={() => setActiveTab('commissions')}
          className={`px-4 py-2.5 flex items-center gap-2 border-b-2 font-medium transition-colors whitespace-nowrap ${
            activeTab === 'commissions'
              ? 'font-semibold'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
          style={
            activeTab === 'commissions'
              ? { borderBottomColor: brand.primaryColor, color: brand.primaryColor }
              : {}
          }
        >
          <DollarSign className="w-4 h-4" />
          Overriding Commissions & Targets ({commissions.length})
        </button>
      </div>

      {/* ===================================================================== */}
      {/* TAB 1: DISTRIBUTORS MASTER */}
      {/* ===================================================================== */}
      {activeTab === 'distributors' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search distributor, territory, city..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#690BA8]/20 focus:border-[#690BA8]"
                />
              </div>

              <select
                className="px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white font-medium text-slate-700"
                value={territoryFilter}
                onChange={(e) => setTerritoryFilter(e.target.value)}
              >
                <option value="ALL">All Territories</option>
                <option value="NORTH_INDIA">North India</option>
                <option value="WEST_INDIA">West India</option>
                <option value="SOUTH_INDIA">South India</option>
                <option value="EAST_INDIA">East India</option>
                <option value="NATIONAL">National Level</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                leftIcon={<Download className="w-4 h-4" />}
                onClick={() =>
                  exportToCsv(
                    'kibo360_distributors_master',
                    filteredDistributors.map((d) => ({
                      Code: d.distributorCode,
                      Name: d.name,
                      Territory: d.territory,
                      City: d.city,
                      State: d.state,
                      Credit_Limit: d.creditLimit,
                      Outstanding: d.currentOutstanding,
                      Discount_Pct: d.standardDiscountPercentage,
                      Commission_Pct: d.commissionPercentage,
                      Contact: d.contactPerson,
                      Phone: d.phone,
                      Email: d.email,
                      Status: d.status,
                    }))
                  )
                }
              >
                Export (CSV)
              </Button>
              <Button
                variant="primary"
                size="sm"
                leftIcon={<Plus className="w-4 h-4" />}
                style={{ backgroundColor: brand.primaryColor }}
                className="text-white hover:opacity-90"
                onClick={handleOpenNewDistributor}
              >
                + Register Distributor
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {filteredDistributors.map((d) => (
              <Card key={d.id} className="p-5 border border-slate-200 hover:shadow-md transition-shadow">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                  <div className="flex items-start gap-3">
                    <div
                      className="w-12 h-12 rounded-lg flex items-center justify-center shrink-0 border"
                      style={{
                        backgroundColor: `${brand.primaryColor}15`,
                        borderColor: `${brand.primaryColor}30`,
                        color: brand.primaryColor,
                      }}
                    >
                      <Building className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span
                          className="font-mono text-sm font-bold"
                          style={{ color: brand.primaryColor }}
                        >
                          {d.distributorCode}
                        </span>
                        <Badge variant="purple">{d.territory.replace(/_/g, ' ')}</Badge>
                        <span className="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-medium">
                          {d.city}, {d.state}
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-slate-800 mt-1">{d.name}</h3>
                      <div className="text-xs text-slate-500 mt-0.5">
                        Contact: {d.contactPerson} ({d.phone}) • {d.email}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-6">
                    <div className="text-right">
                      <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                        Trade Discount
                      </div>
                      <div className="text-lg font-bold" style={{ color: brand.primaryColor }}>
                        {d.standardDiscountPercentage}%{' '}
                        <span className="text-xs text-slate-400 font-normal">on MRP</span>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                        Overriding Comm.
                      </div>
                      <div className="text-lg font-bold text-emerald-700">
                        {d.commissionPercentage}%
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                        Credit Limit & Due
                      </div>
                      <div className="text-sm font-bold text-slate-800">
                        ₹{d.currentOutstanding.toLocaleString('en-IN')}{' '}
                        <span className="text-xs text-slate-400 font-normal">
                          / ₹{d.creditLimit.toLocaleString('en-IN')}
                        </span>
                      </div>
                      <span className="text-[11px] font-semibold text-amber-700">
                        {((d.currentOutstanding / d.creditLimit) * 100).toFixed(1)}% Utilized
                      </span>
                    </div>

                    <div className="flex items-center gap-1 border-l border-slate-200 pl-4">
                      <button
                        onClick={() => handleOpenEditDistributor(d)}
                        className="p-1.5 text-slate-400 hover:text-slate-700 rounded transition-colors"
                        title="Edit Distributor"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteDistributor(d.id, d.name)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded transition-colors"
                        title="Remove Distributor"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap items-center justify-between text-xs text-slate-600 pt-1">
                  <span>Authorized Primary Logistics Node • Direct Central Depot Access</span>
                  <span className="text-emerald-700 font-semibold">Active Master Contract</span>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* TAB 2: DEALER NETWORK */}
      {/* ===================================================================== */}
      {activeTab === 'dealers' && (
        <Card className="overflow-hidden border border-slate-200">
          <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-3">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search dealer, city, code..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#690BA8]/20 focus:border-[#690BA8]"
                />
              </div>

              <select
                className="px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white font-medium text-slate-700"
                value={dealerDistributorFilter}
                onChange={(e) => setDealerDistributorFilter(e.target.value)}
              >
                <option value="ALL">All Parent Distributors</option>
                {distributors.map((d) => (
                  <option key={d.id} value={d.name}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                leftIcon={<Download className="w-4 h-4" />}
                onClick={() =>
                  exportToCsv(
                    'kibo360_dealers_network',
                    filteredDealers.map((d) => ({
                      Dealer_Code: d.dealerCode,
                      Dealer_Name: d.name,
                      Classification: d.classification,
                      Parent_Distributor: d.distributorName,
                      Territory: d.territory,
                      City: d.city,
                      Discount_Percent: d.discountPercentage,
                      Outstanding: d.currentOutstanding,
                      Credit_Limit: d.creditLimit,
                      Contact: d.contactPerson,
                      Phone: d.phone,
                      Status: d.status,
                    }))
                  )
                }
              >
                Export (CSV)
              </Button>
              <Button
                variant="primary"
                size="sm"
                leftIcon={<Plus className="w-4 h-4" />}
                style={{ backgroundColor: brand.primaryColor }}
                className="text-white hover:opacity-90"
                onClick={handleOpenNewDealer}
              >
                + Register Dealer
              </Button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase">
                  <th className="py-3 px-4">Dealer Code & Name</th>
                  <th className="py-3 px-4">Classification</th>
                  <th className="py-3 px-4">Parent Distributor</th>
                  <th className="py-3 px-4">Territory / City</th>
                  <th className="py-3 px-4 text-right">Discount Slab</th>
                  <th className="py-3 px-4 text-right">Credit / Outstanding</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredDealers.map((dlr) => (
                  <tr key={dlr.id} className="hover:bg-slate-50/75 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-800">{dlr.name}</div>
                      <span
                        className="font-mono text-xs font-medium"
                        style={{ color: brand.primaryColor }}
                      >
                        {dlr.dealerCode}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant="magenta">{dlr.classification.replace(/_/g, ' ')}</Badge>
                    </td>
                    <td className="py-3 px-4 text-slate-700 text-xs">
                      {dlr.distributorName || 'Direct Account'}
                    </td>
                    <td className="py-3 px-4 text-slate-700">
                      {dlr.city} ({dlr.territory.replace(/_/g, ' ')})
                    </td>
                    <td
                      className="py-3 px-4 text-right font-bold"
                      style={{ color: brand.primaryColor }}
                    >
                      {dlr.discountPercentage}%
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="font-bold text-slate-800">
                        ₹{dlr.currentOutstanding.toLocaleString('en-IN')}
                      </div>
                      <div className="text-xs text-slate-400">
                        Limit: ₹{dlr.creditLimit.toLocaleString('en-IN')}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <Badge variant={dlr.status === 'ACTIVE' ? 'success' : 'slate'}>
                        {dlr.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => handleOpenEditDealer(dlr)}
                          className="p-1 text-slate-400 hover:text-slate-700 rounded transition-colors"
                          title="Edit Dealer"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteDealer(dlr.id, dlr.name)}
                          className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors"
                          title="Remove Dealer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
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

      {/* ===================================================================== */}
      {/* TAB 3: ORDERS & LR DISPATCHES */}
      {/* ===================================================================== */}
      {activeTab === 'orders' && (
        <Card className="overflow-hidden border border-slate-200">
          <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-3">
            <div>
              <h3 className="font-semibold text-slate-800">
                Bulk Distribution Orders & LR Consignments
              </h3>
              <p className="text-xs text-slate-500">
                Manage high-volume bulk dispatches with Lorry Receipt (LR) tracking and delivery milestones
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                leftIcon={<Download className="w-4 h-4" />}
                onClick={() =>
                  exportToCsv(
                    'kibo360_distribution_orders',
                    orders.map((o) => ({
                      Order_Number: o.orderNumber,
                      Party_Name: o.partyName,
                      Order_Type: o.orderType,
                      Order_Date: o.orderDate,
                      Due_Date: o.dispatchDueDate,
                      Ordered_Qty: o.totalQuantityOrdered,
                      Dispatched_Qty: o.totalQuantityDispatched,
                      Net_Value: o.netOrderAmount,
                      Transporter: o.transporterInfo,
                      LR_Number: o.lrNumber,
                      Status: o.status,
                    }))
                  )
                }
              >
                Export (CSV)
              </Button>
              <Button
                variant="primary"
                size="sm"
                leftIcon={<Plus className="w-4 h-4" />}
                style={{ backgroundColor: brand.primaryColor }}
                className="text-white hover:opacity-90"
                onClick={handleOpenNewOrder}
              >
                + New Bulk Order
              </Button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase">
                  <th className="py-3 px-4">Order #</th>
                  <th className="py-3 px-4">Channel Partner</th>
                  <th className="py-3 px-4 text-center">Ordered / Dispatched</th>
                  <th className="py-3 px-4 text-right">Net Value</th>
                  <th className="py-3 px-4">Transporter & Tracking</th>
                  <th className="py-3 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {orders.map((o) => (
                  <tr key={o.id} className="hover:bg-slate-50/75 transition-colors">
                    <td
                      className="py-3 px-4 font-mono font-bold"
                      style={{ color: brand.primaryColor }}
                    >
                      {o.orderNumber}
                      <div className="text-xs text-slate-400 font-normal">{o.orderDate}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-800">{o.partyName}</div>
                      <span className="text-xs text-slate-500">{o.orderType.replace(/_/g, ' ')}</span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="font-bold text-slate-800">
                        {o.totalQuantityDispatched.toLocaleString('en-IN')}
                      </span>
                      <span className="text-xs text-slate-400">
                        {' '}
                        / {o.totalQuantityOrdered.toLocaleString('en-IN')} copies
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-slate-900 font-mono">
                      ₹{o.netOrderAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 px-4 text-xs text-slate-700">
                      <div>{o.transporterInfo || 'Pending Allocation'}</div>
                      {o.lrNumber && (
                        <span className="font-mono text-purple-700 font-medium">LR: {o.lrNumber}</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <Badge variant={o.status === 'COMPLETED' ? 'success' : 'purple'}>
                        {o.status.replace(/_/g, ' ')}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* ===================================================================== */}
      {/* TAB 4: CONSIGNMENT STOCK MANAGEMENT */}
      {/* ===================================================================== */}
      {activeTab === 'consignments' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
            <div className="text-sm text-slate-600">
              Stock issued on consignment basis. Ownership remains with publisher until reported sold or returned.
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                leftIcon={<Download className="w-4 h-4" />}
                onClick={() =>
                  exportToCsv(
                    'kibo360_consignments_stock',
                    consignments.map((c) => ({
                      Issue_Number: c.issueNumber,
                      Distributor_Name: c.distributorName,
                      Issue_Date: c.issueDate,
                      SKU: c.sku,
                      Title: c.title,
                      MRP: c.mrp,
                      Issued_Qty: c.totalIssuedQuantity,
                      Sold_Qty: c.totalSoldQuantity,
                      Returned_Qty: c.totalReturnedQuantity,
                      Balance_On_Hold: c.balanceOnHoldQuantity,
                      Hold_Valuation: c.balanceOnHoldQuantity * c.mrp,
                      Status: c.status,
                    }))
                  )
                }
              >
                Export (CSV)
              </Button>
              <Button
                variant="primary"
                size="sm"
                leftIcon={<Plus className="w-4 h-4" />}
                style={{ backgroundColor: brand.primaryColor }}
                className="text-white hover:opacity-90"
                onClick={handleOpenNewConsignment}
              >
                + Issue Consignment Stock
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {consignments.map((c) => (
              <Card key={c.id} className="p-5 border border-slate-200">
                <div className="flex items-start justify-between pb-3 border-b border-slate-100">
                  <div>
                    <span
                      className="font-mono text-xs font-bold"
                      style={{ color: brand.primaryColor }}
                    >
                      {c.issueNumber}
                    </span>
                    <h3 className="font-bold text-slate-800 text-base mt-0.5">{c.distributorName}</h3>
                    <span className="text-xs text-slate-500">
                      {c.title} ({c.sku}) • Issued: {c.issueDate}
                    </span>
                  </div>
                  <Badge variant={c.status === 'RECONCILED' ? 'success' : 'purple'}>
                    {c.status.replace(/_/g, ' ')}
                  </Badge>
                </div>

                <div className="grid grid-cols-4 gap-2 my-4 text-center">
                  <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Issued</span>
                    <span className="text-base font-bold text-slate-800">
                      {c.totalIssuedQuantity.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="bg-emerald-50 p-2.5 rounded-lg border border-emerald-100">
                    <span className="text-[10px] uppercase font-bold text-emerald-700 block">Sold</span>
                    <span className="text-base font-bold text-emerald-800">
                      {c.totalSoldQuantity.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="bg-amber-50 p-2.5 rounded-lg border border-amber-100">
                    <span className="text-[10px] uppercase font-bold text-amber-700 block">Returned</span>
                    <span className="text-base font-bold text-amber-800">
                      {c.totalReturnedQuantity.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div
                    className="p-2.5 rounded-lg border"
                    style={{
                      backgroundColor: `${brand.primaryColor}10`,
                      borderColor: `${brand.primaryColor}30`,
                    }}
                  >
                    <span
                      className="text-[10px] uppercase font-bold block"
                      style={{ color: brand.primaryColor }}
                    >
                      On-Hold
                    </span>
                    <span className="text-base font-bold" style={{ color: brand.primaryColor }}>
                      {c.balanceOnHoldQuantity.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                <div className="text-xs text-slate-500 pt-2 border-t border-slate-100 flex justify-between items-center">
                  <span>
                    Current Valuation: <strong>₹{(c.balanceOnHoldQuantity * c.mrp).toLocaleString('en-IN')}</strong>
                  </span>
                  {c.balanceOnHoldQuantity > 0 ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs text-purple-700 hover:text-purple-900 font-semibold"
                      onClick={() => handleOpenSettleConsignment(c)}
                    >
                      Settle / Reconcile
                    </Button>
                  ) : (
                    <span className="text-emerald-700 font-semibold">Fully Reconciled</span>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* TAB 5: OVERRIDING COMMISSIONS & TARGETS */}
      {/* ===================================================================== */}
      {activeTab === 'commissions' && (
        <Card className="p-5 border border-slate-200">
          <div className="flex flex-col sm:flex-row items-center justify-between pb-3 border-b border-slate-200 gap-3">
            <div>
              <h3 className="font-bold text-slate-800 text-base">
                Overriding Commissions & Target Incentives
              </h3>
              <p className="text-xs text-slate-500">
                Secondary dealer sales commission & 2% volume target accelerators with direct GL posting
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                leftIcon={<Download className="w-4 h-4" />}
                onClick={() =>
                  exportToCsv(
                    'kibo360_distributor_commissions',
                    commissions.map((c) => ({
                      Settlement_No: c.settlementNumber,
                      Distributor: c.distributorName,
                      Period: c.period,
                      Turnover: c.secondaryTurnover,
                      Base_Rate: `${c.baseCommissionRate}%`,
                      Base_Amount: c.baseCommissionAmount,
                      Bonus_Rate: `${c.targetBonusRate}%`,
                      Bonus_Amount: c.targetBonusAmount,
                      Total_Payable: c.totalCommissionPayable,
                      GL_Voucher: c.voucherNumber,
                      Status: c.status,
                    }))
                  )
                }
              >
                Export (CSV)
              </Button>
              <Button
                variant="primary"
                size="sm"
                leftIcon={<Plus className="w-4 h-4" />}
                style={{ backgroundColor: brand.primaryColor }}
                className="text-white hover:opacity-90"
                onClick={handleOpenNewCommission}
              >
                + Settle Commission
              </Button>
            </div>
          </div>

          <div className="overflow-x-auto mt-4">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase">
                  <th className="py-3 px-4">Settlement #</th>
                  <th className="py-3 px-4">Distributor Partner</th>
                  <th className="py-3 px-4 text-right">Secondary Turnover</th>
                  <th className="py-3 px-4 text-right">Base Comm</th>
                  <th className="py-3 px-4 text-right">Target Bonus</th>
                  <th className="py-3 px-4 text-right">Total Payable</th>
                  <th className="py-3 px-4 text-center">GL Voucher</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {commissions.map((cms) => (
                  <tr key={cms.id} className="hover:bg-slate-50/75">
                    <td
                      className="py-3 px-4 font-mono font-bold"
                      style={{ color: brand.primaryColor }}
                    >
                      {cms.settlementNumber}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-800">{cms.distributorName}</div>
                      <span className="text-xs text-slate-500">{cms.period}</span>
                    </td>
                    <td className="py-3 px-4 text-right font-medium text-slate-800 font-mono">
                      ₹{cms.secondaryTurnover.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 px-4 text-right font-medium text-slate-800 font-mono">
                      ₹{cms.baseCommissionAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })} ({cms.baseCommissionRate}%)
                    </td>
                    <td className="py-3 px-4 text-right text-emerald-600 font-semibold font-mono">
                      +₹{cms.targetBonusAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })} ({cms.targetBonusRate}%)
                    </td>
                    <td
                      className="py-3 px-4 text-right font-bold text-base font-mono"
                      style={{ color: brand.primaryColor }}
                    >
                      ₹{cms.totalCommissionPayable.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="font-mono text-xs font-bold bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded border border-indigo-200">
                        {cms.voucherNumber}
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
      {/* MODAL 1: NEW / EDIT DISTRIBUTOR */}
      {/* ===================================================================== */}
      <Modal
        isOpen={isNewDistributorModalOpen}
        onClose={() => setIsNewDistributorModalOpen(false)}
        title={editingDistributor ? 'Edit Regional Distributor' : 'Register Master Regional Distributor'}
        maxWidth="2xl"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Distributor Code" required>
              <Input
                placeholder="e.g. DIST-EAST-04"
                value={distCode}
                onChange={(e) => setDistCode(e.target.value)}
              />
            </FormField>

            <FormField label="Distributor Legal Entity Name" required>
              <Input
                placeholder="e.g. Bengal Academic Book Hub Pvt Ltd"
                value={distName}
                onChange={(e) => setDistName(e.target.value)}
              />
            </FormField>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <FormField label="Territory">
              <select
                value={distTerritory}
                onChange={(e) => setDistTerritory(e.target.value as any)}
                className="w-full text-sm border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-[#690BA8]/20 focus:border-[#690BA8]"
              >
                <option value="NORTH_INDIA">North India</option>
                <option value="WEST_INDIA">West India</option>
                <option value="SOUTH_INDIA">South India</option>
                <option value="EAST_INDIA">East India</option>
                <option value="CENTRAL_INDIA">Central India</option>
                <option value="NATIONAL">National Level</option>
              </select>
            </FormField>

            <FormField label="City" required>
              <Input
                placeholder="e.g. Kolkata"
                value={distCity}
                onChange={(e) => setDistCity(e.target.value)}
              />
            </FormField>

            <FormField label="State" required>
              <Input
                placeholder="e.g. West Bengal"
                value={distState}
                onChange={(e) => setDistState(e.target.value)}
              />
            </FormField>
          </div>

          <FormField label="Office / Depot Address">
            <Input
              placeholder="e.g. College Street Logistics Hub"
              value={distAddress}
              onChange={(e) => setDistAddress(e.target.value)}
            />
          </FormField>

          <div className="grid grid-cols-3 gap-3">
            <FormField label="Credit Limit (₹)">
              <Input
                type="number"
                value={distCreditLimit}
                onChange={(e) => setDistCreditLimit(e.target.value)}
              />
            </FormField>
            <FormField label="Overriding Comm (%)">
              <Input
                type="number"
                step="0.1"
                value={distCommissionPct}
                onChange={(e) => setDistCommissionPct(e.target.value)}
              />
            </FormField>
            <FormField label="Trade Discount (%)">
              <Input
                type="number"
                step="0.1"
                value={distDiscountPct}
                onChange={(e) => setDistDiscountPct(e.target.value)}
              />
            </FormField>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <FormField label="Contact Person">
              <Input
                placeholder="e.g. Sourav Banerjee"
                value={distContactPerson}
                onChange={(e) => setDistContactPerson(e.target.value)}
              />
            </FormField>
            <FormField label="Contact Phone">
              <Input
                placeholder="+91 98000 00000"
                value={distPhone}
                onChange={(e) => setDistPhone(e.target.value)}
              />
            </FormField>
            <FormField label="Email Address">
              <Input
                placeholder="distributor@trade.in"
                value={distEmail}
                onChange={(e) => setDistEmail(e.target.value)}
              />
            </FormField>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Button variant="ghost" onClick={() => setIsNewDistributorModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              style={{ backgroundColor: brand.primaryColor }}
              className="text-white hover:opacity-90"
              onClick={handleSaveDistributor}
            >
              {editingDistributor ? 'Save Changes' : 'Register Distributor'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* ===================================================================== */}
      {/* MODAL 2: NEW / EDIT DEALER */}
      {/* ===================================================================== */}
      <Modal
        isOpen={isNewDealerModalOpen}
        onClose={() => setIsNewDealerModalOpen(false)}
        title={editingDealer ? 'Edit Dealer' : 'Register Retail / Institutional Dealer'}
        maxWidth="lg"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Dealer Code" required>
              <Input
                placeholder="e.g. DLR-KOL-104"
                value={dlrCode}
                onChange={(e) => setDlrCode(e.target.value)}
              />
            </FormField>

            <FormField label="Dealer Name" required>
              <Input
                placeholder="e.g. Presidency Book Store"
                value={dlrName}
                onChange={(e) => setDlrName(e.target.value)}
              />
            </FormField>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <FormField label="Classification">
              <select
                value={dlrClassification}
                onChange={(e) => setDlrClassification(e.target.value as any)}
                className="w-full text-sm border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-[#690BA8]/20 focus:border-[#690BA8]"
              >
                <option value="RETAIL_BOOKSTORE">Retail Bookstore</option>
                <option value="INSTITUTIONAL_SUPPLIER">Institutional Supplier</option>
                <option value="CHAIN_STORE">Chain Store Outlet</option>
                <option value="ONLINE_SELLER">Online Marketplace Seller</option>
              </select>
            </FormField>

            <FormField label="Parent Distributor">
              <select
                value={dlrDistributorName}
                onChange={(e) => setDlrDistributorName(e.target.value)}
                className="w-full text-sm border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-[#690BA8]/20 focus:border-[#690BA8]"
              >
                <option value="">Direct Account (No Parent)</option>
                {distributors.map((d) => (
                  <option key={d.id} value={d.name}>
                    {d.name}
                  </option>
                ))}
              </select>
            </FormField>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <FormField label="City" required>
              <Input
                placeholder="e.g. Kolkata"
                value={dlrCity}
                onChange={(e) => setDlrCity(e.target.value)}
              />
            </FormField>

            <FormField label="State" required>
              <Input
                placeholder="e.g. West Bengal"
                value={dlrState}
                onChange={(e) => setDlrState(e.target.value)}
              />
            </FormField>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <FormField label="Credit Limit (₹)">
              <Input
                type="number"
                value={dlrCreditLimit}
                onChange={(e) => setDlrCreditLimit(e.target.value)}
              />
            </FormField>

            <FormField label="Dealer Discount (%)">
              <Input
                type="number"
                step="0.5"
                value={dlrDiscountPct}
                onChange={(e) => setDlrDiscountPct(e.target.value)}
              />
            </FormField>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <FormField label="Contact Person">
              <Input
                placeholder="Contact Name"
                value={dlrContactPerson}
                onChange={(e) => setDlrContactPerson(e.target.value)}
              />
            </FormField>

            <FormField label="Contact Phone">
              <Input
                placeholder="+91 98000 00000"
                value={dlrPhone}
                onChange={(e) => setDlrPhone(e.target.value)}
              />
            </FormField>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Button variant="ghost" onClick={() => setIsNewDealerModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              style={{ backgroundColor: brand.primaryColor }}
              className="text-white hover:opacity-90"
              onClick={handleSaveDealer}
            >
              {editingDealer ? 'Save Changes' : 'Register Dealer'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* ===================================================================== */}
      {/* MODAL 3: NEW BULK DISTRIBUTION ORDER */}
      {/* ===================================================================== */}
      <Modal
        isOpen={isNewOrderModalOpen}
        onClose={() => setIsNewOrderModalOpen(false)}
        title="Create Bulk Distribution Order"
        maxWidth="lg"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Channel Partner" required>
              <select
                value={ordPartyName}
                onChange={(e) => setOrdPartyName(e.target.value)}
                className="w-full text-sm border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-[#690BA8]/20 focus:border-[#690BA8]"
              >
                {distributors.map((d) => (
                  <option key={d.id} value={d.name}>
                    {d.name} (Distributor)
                  </option>
                ))}
                {dealers.map((dlr) => (
                  <option key={dlr.id} value={dlr.name}>
                    {dlr.name} (Dealer)
                  </option>
                ))}
              </select>
            </FormField>

            <FormField label="Order Type">
              <select
                value={ordType}
                onChange={(e) => setOrdType(e.target.value as any)}
                className="w-full text-sm border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-[#690BA8]/20 focus:border-[#690BA8]"
              >
                <option value="DISTRIBUTOR_BULK">Distributor Bulk Order</option>
                <option value="DEALER_WHOLESALE">Dealer Wholesale Supply</option>
                <option value="CONSIGNMENT_REPLENISHMENT">Consignment Replenishment</option>
              </select>
            </FormField>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <FormField label="Ordered Quantity" required>
              <Input
                type="number"
                value={ordQty}
                onChange={(e) => setOrdQty(e.target.value)}
              />
            </FormField>

            <FormField label="Dispatched Quantity">
              <Input
                type="number"
                value={ordDispatchedQty}
                onChange={(e) => setOrdDispatchedQty(e.target.value)}
              />
            </FormField>

            <FormField label="Net Order Amount (₹)" required>
              <Input
                type="number"
                step="0.01"
                value={ordAmount}
                onChange={(e) => setOrdAmount(e.target.value)}
              />
            </FormField>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <FormField label="Transporter">
              <Input
                value={ordTransporter}
                onChange={(e) => setOrdTransporter(e.target.value)}
              />
            </FormField>

            <FormField label="LR Tracking Number">
              <Input
                value={ordLrNumber}
                onChange={(e) => setOrdLrNumber(e.target.value)}
              />
            </FormField>

            <FormField label="Vehicle Number">
              <Input
                value={ordVehicle}
                onChange={(e) => setOrdVehicle(e.target.value)}
              />
            </FormField>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Button variant="ghost" onClick={() => setIsNewOrderModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              style={{ backgroundColor: brand.primaryColor }}
              className="text-white hover:opacity-90"
              onClick={handleSaveOrder}
            >
              Confirm Bulk Order
            </Button>
          </div>
        </div>
      </Modal>

      {/* ===================================================================== */}
      {/* MODAL 4: NEW CONSIGNMENT ISSUE */}
      {/* ===================================================================== */}
      <Modal
        isOpen={isNewConsignmentModalOpen}
        onClose={() => setIsNewConsignmentModalOpen(false)}
        title="Issue Consignment Stock to Distributor"
        maxWidth="md"
      >
        <div className="space-y-4">
          <FormField label="Distributor" required>
            <select
              value={csgDistName}
              onChange={(e) => setCsgDistName(e.target.value)}
              className="w-full text-sm border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-[#690BA8]/20 focus:border-[#690BA8]"
            >
              {distributors.map((d) => (
                <option key={d.id} value={d.name}>
                  {d.name}
                </option>
              ))}
            </select>
          </FormField>

          <FormField label="Select Book SKU" required>
            <select
              value={csgSku}
              onChange={(e) => setCsgSku(e.target.value)}
              className="w-full text-sm border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-[#690BA8]/20 focus:border-[#690BA8]"
            >
              {catalogueBooks.map((b) => (
                <option key={b.id} value={b.sku}>
                  {b.title} (MRP: ₹{b.mrp})
                </option>
              ))}
            </select>
          </FormField>

          <FormField label="Total Copies to Issue" required>
            <Input
              type="number"
              value={csgQty}
              onChange={(e) => setCsgQty(e.target.value)}
            />
          </FormField>

          <FormField label="Dispatched From Warehouse">
            <select
              value={csgWarehouse}
              onChange={(e) => setCsgWarehouse(e.target.value)}
              className="w-full text-sm border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-[#690BA8]/20 focus:border-[#690BA8]"
            >
              {warehouses.map((w) => (
                <option key={w.id} value={w.name}>
                  {w.name}
                </option>
              ))}
            </select>
          </FormField>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Button variant="ghost" onClick={() => setIsNewConsignmentModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              style={{ backgroundColor: brand.primaryColor }}
              className="text-white hover:opacity-90"
              onClick={handleSaveConsignment}
            >
              Issue Consignment Stock
            </Button>
          </div>
        </div>
      </Modal>

      {/* ===================================================================== */}
      {/* MODAL 5: SETTLE CONSIGNMENT */}
      {/* ===================================================================== */}
      <Modal
        isOpen={isSettleConsignmentModalOpen}
        onClose={() => setIsSettleConsignmentModalOpen(false)}
        title={`Reconcile Consignment: ${selectedConsignmentToSettle?.issueNumber}`}
        maxWidth="md"
      >
        <div className="space-y-4">
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-1">
            <div>
              <span className="font-semibold text-slate-700">Distributor:</span>{' '}
              {selectedConsignmentToSettle?.distributorName}
            </div>
            <div>
              <span className="font-semibold text-slate-700">Book:</span>{' '}
              {selectedConsignmentToSettle?.title}
            </div>
            <div>
              <span className="font-semibold text-slate-700">Current Balance On-Hold:</span>{' '}
              <span className="font-bold font-mono text-purple-700">
                {selectedConsignmentToSettle?.balanceOnHoldQuantity} Copies
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Copies Reported Sold" required>
              <Input
                type="number"
                value={settleSoldQty}
                onChange={(e) => setSettleSoldQty(e.target.value)}
              />
            </FormField>

            <FormField label="Copies Returned to Depot" required>
              <Input
                type="number"
                value={settleReturnedQty}
                onChange={(e) => setSettleReturnedQty(e.target.value)}
              />
            </FormField>
          </div>

          <div className="text-xs text-slate-500">
            Copies returned to depot will be automatically restored into warehouse inventory.
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Button variant="ghost" onClick={() => setIsSettleConsignmentModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              style={{ backgroundColor: brand.primaryColor }}
              className="text-white hover:opacity-90"
              onClick={handleConfirmSettleConsignment}
            >
              Post Settlement
            </Button>
          </div>
        </div>
      </Modal>

      {/* ===================================================================== */}
      {/* MODAL 6: NEW COMMISSION SETTLEMENT */}
      {/* ===================================================================== */}
      <Modal
        isOpen={isNewCommissionModalOpen}
        onClose={() => setIsNewCommissionModalOpen(false)}
        title="Settle Distributor Overriding Commission"
        maxWidth="lg"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Distributor Partner" required>
              <select
                value={commDistName}
                onChange={(e) => setCommDistName(e.target.value)}
                className="w-full text-sm border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-[#690BA8]/20 focus:border-[#690BA8]"
              >
                {distributors.map((d) => (
                  <option key={d.id} value={d.name}>
                    {d.name}
                  </option>
                ))}
              </select>
            </FormField>

            <FormField label="Settlement Period / Quarter" required>
              <Input
                value={commPeriod}
                onChange={(e) => setCommPeriod(e.target.value)}
              />
            </FormField>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <FormField label="Secondary Turnover (₹)" required>
              <Input
                type="number"
                value={commTurnover}
                onChange={(e) => setCommTurnover(e.target.value)}
              />
            </FormField>

            <FormField label="Base Commission (%)" required>
              <Input
                type="number"
                step="0.1"
                value={commBaseRate}
                onChange={(e) => setCommBaseRate(e.target.value)}
              />
            </FormField>

            <FormField label="Target Bonus (%)" required>
              <Input
                type="number"
                step="0.1"
                value={commBonusRate}
                onChange={(e) => setCommBonusRate(e.target.value)}
              />
            </FormField>
          </div>

          <FormField label="Commission Settlement Notes">
            <Input
              value={commNotes}
              onChange={(e) => setCommNotes(e.target.value)}
              placeholder="e.g. FY26 volume sales milestone achieved"
            />
          </FormField>

          <div className="p-3 bg-purple-50 text-purple-950 rounded-lg text-xs font-medium">
            Estimated Commission Payable: ₹
            {(
              ((Number(commTurnover) || 0) *
                ((Number(commBaseRate) || 0) + (Number(commBonusRate) || 0))) /
              100
            ).toLocaleString('en-IN', { minimumFractionDigits: 2 })}{' '}
            • Posting automatically creates balanced General Ledger Journal Voucher (JV) debiting Commission Expense.
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Button variant="ghost" onClick={() => setIsNewCommissionModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              style={{ backgroundColor: brand.primaryColor }}
              className="text-white hover:opacity-90"
              onClick={handleSaveCommission}
            >
              Post Commission Voucher
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
