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
  Package,
  Plus,
  Download,
  Filter,
  CheckCircle2,
  Clock,
  Truck,
  FileText,
  AlertTriangle,
  RotateCcw,
  Barcode,
  Search,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  TrendingUp,
  Building,
  Layers,
  ArrowRightLeft,
  ClipboardCheck,
  FileSpreadsheet,
  Printer,
  Sparkles,
  Percent,
  Warehouse as WarehouseIcon,
  Trash2,
  Edit,
  Info,
  Calendar,
  DollarSign,
  Boxes,
  Check,
} from 'lucide-react';
import {
  StockItem,
  WarehouseItem,
  StockTransferItem,
  StockMovementItem,
  CycleCountAuditItem,
  StockAdjustmentItem,
  AuditLineItem,
  getStoredWarehouses,
  saveWarehouseItem,
  deleteWarehouseItem,
  getStoredStocks,
  saveStockItem,
  deleteStockItem,
  getStoredTransfers,
  createTransfer,
  receiveTransfer,
  getStoredMovements,
  recordStockMovement,
  getStoredAudits,
  saveAuditItem,
  deleteAuditItem,
  getStoredAdjustments,
  saveAdjustmentItem,
  deleteAdjustmentItem,
  calculateValuationAndAgeing,
} from '../services/inventoryService';
import { getStoredBooks } from '../services/catalogueService';

export const InventoryPage: React.FC = () => {
  const { brand } = useBrand();

  // Active Tab
  const [activeTab, setActiveTab] = useState<
    'stocks' | 'transfers' | 'movements' | 'audits' | 'adjustments' | 'barcodes' | 'valuation' | 'warehouses'
  >('stocks');

  // Core Data States
  const [warehouses, setWarehouses] = useState<WarehouseItem[]>(() => getStoredWarehouses());
  const [stocks, setStocks] = useState<StockItem[]>(() => getStoredStocks());
  const [transfers, setTransfers] = useState<StockTransferItem[]>(() => getStoredTransfers());
  const [movements, setMovements] = useState<StockMovementItem[]>(() => getStoredMovements());
  const [audits, setAudits] = useState<CycleCountAuditItem[]>(() => getStoredAudits());
  const [adjustments, setAdjustments] = useState<StockAdjustmentItem[]>(() => getStoredAdjustments());

  // Catalogue Books for dropdowns
  const catalogueBooks = useMemo(() => getStoredBooks(), []);

  // Filter & Search States
  const [selectedWarehouseFilter, setSelectedWarehouseFilter] = useState<string>('all');
  const [stockSearchTerm, setStockSearchTerm] = useState<string>('');
  const [stockStatusFilter, setStockStatusFilter] = useState<string>('ALL');
  const [movementTypeFilter, setMovementTypeFilter] = useState<string>('ALL');

  // Modals States
  const [stockModalOpen, setStockModalOpen] = useState(false);
  const [editingStock, setEditingStock] = useState<StockItem | null>(null);

  const [transferModalOpen, setTransferModalOpen] = useState(false);
  const [receiveModalOpen, setReceiveModalOpen] = useState(false);
  const [selectedTransferToReceive, setSelectedTransferToReceive] = useState<StockTransferItem | null>(null);

  const [auditModalOpen, setAuditModalOpen] = useState(false);
  const [auditLines, setAuditLines] = useState<AuditLineItem[]>([]);

  const [adjModalOpen, setAdjModalOpen] = useState(false);

  const [warehouseModalOpen, setWarehouseModalOpen] = useState(false);
  const [editingWarehouse, setEditingWarehouse] = useState<WarehouseItem | null>(null);

  // Bin Card Drawer State
  const [ledgerDrawerOpen, setLedgerDrawerOpen] = useState(false);
  const [selectedLedgerSku, setSelectedLedgerSku] = useState<string>('');

  // Barcode State
  const [barcodeSku, setBarcodeSku] = useState<string>(stocks[0]?.sku || 'BK-PHY-HCV-01');
  const [barcodeFormat, setBarcodeFormat] = useState<'CODE128' | 'EAN13'>('CODE128');
  const [barcodeLabelType, setBarcodeLabelType] = useState<'PRODUCT_LABEL' | 'SHELF_RACK_LABEL'>('PRODUCT_LABEL');
  const [labelQty, setLabelQty] = useState('1');

  // --- Form States for Inward / Stock Modal ---
  const [stockBookSku, setStockBookSku] = useState('');
  const [stockWarehouseId, setStockWarehouseId] = useState('');
  const [stockRackShelf, setStockRackShelf] = useState('');
  const [stockBatchNo, setStockBatchNo] = useState('');
  const [stockOnHand, setStockOnHand] = useState('');
  const [stockReorderLevel, setStockReorderLevel] = useState('200');
  const [stockWacCost, setStockWacCost] = useState('160.00');
  const [stockMrp, setStockMrp] = useState('495.00');

  // --- Form States for New Transfer Modal ---
  const [trfFrom, setTrfFrom] = useState('');
  const [trfTo, setTrfTo] = useState('');
  const [trfSku, setTrfSku] = useState('');
  const [trfQty, setTrfQty] = useState('100');
  const [trfTransporter, setTrfTransporter] = useState('VRL Logistics India Ltd.');
  const [trfLrNumber, setTrfLrNumber] = useState('');
  const [trfVehicleNumber, setTrfVehicleNumber] = useState('MH-04-AZ-4521');
  const [trfRemarks, setTrfRemarks] = useState('');

  // --- Form States for Receive Transfer Modal ---
  const [receiveGoodCopies, setReceiveGoodCopies] = useState('');
  const [receiveDamagedCopies, setReceiveDamagedCopies] = useState('0');
  const [receiveNotes, setReceiveNotes] = useState('');

  // --- Form States for Adjustment Modal ---
  const [adjWarehouseId, setAdjWarehouseId] = useState('');
  const [adjType, setAdjType] = useState<StockAdjustmentItem['type']>('DAMAGE_WRITEOFF');
  const [adjSku, setAdjSku] = useState('');
  const [adjPhysicalQty, setAdjPhysicalQty] = useState('');
  const [adjVarianceQty, setAdjVarianceQty] = useState('-5');
  const [adjReason, setAdjReason] = useState('Damaged during handling in warehouse storage');

  // --- Form States for Warehouse Master Modal ---
  const [whName, setWhName] = useState('');
  const [whCity, setWhCity] = useState('');
  const [whState, setWhState] = useState('Delhi');
  const [whAddress, setWhAddress] = useState('');
  const [whPincode, setWhPincode] = useState('');
  const [whType, setWhType] = useState<WarehouseItem['type']>('BRANCH_GODOWN');
  const [whManager, setWhManager] = useState('');
  const [whPhone, setWhPhone] = useState('');
  const [whCapacity, setWhCapacity] = useState('25000');
  const [whUtilization, setWhUtilization] = useState('65');

  // Refresh helper
  const reloadData = () => {
    setWarehouses(getStoredWarehouses());
    setStocks(getStoredStocks());
    setTransfers(getStoredTransfers());
    setMovements(getStoredMovements());
    setAudits(getStoredAudits());
    setAdjustments(getStoredAdjustments());
  };

  // Dynamic Valuation & Ageing Data
  const valuationData = useMemo(() => {
    return calculateValuationAndAgeing(stocks);
  }, [stocks]);

  // Dynamic KPIs
  const totalStockValue = useMemo(() => {
    return stocks.reduce((acc, s) => acc + s.onHand * s.wacCost, 0);
  }, [stocks]);

  const totalCopiesCount = useMemo(() => {
    return stocks.reduce((acc, s) => acc + s.onHand, 0);
  }, [stocks]);

  const totalReservedCount = useMemo(() => {
    return stocks.reduce((acc, s) => acc + s.reserved, 0);
  }, [stocks]);

  const reorderAlertsCount = useMemo(() => {
    return stocks.filter((s) => s.onHand <= s.reorderLevel).length;
  }, [stocks]);

  // Filtered Stocks
  const filteredStocks = useMemo(() => {
    return stocks.filter((s) => {
      const matchWh =
        selectedWarehouseFilter === 'all' ||
        s.warehouseId === selectedWarehouseFilter ||
        s.warehouseName.toLowerCase().includes(selectedWarehouseFilter.toLowerCase());

      const matchSearch =
        !stockSearchTerm ||
        s.title.toLowerCase().includes(stockSearchTerm.toLowerCase()) ||
        s.sku.toLowerCase().includes(stockSearchTerm.toLowerCase()) ||
        s.isbn.includes(stockSearchTerm) ||
        s.rackShelf.toLowerCase().includes(stockSearchTerm.toLowerCase());

      const matchStatus =
        stockStatusFilter === 'ALL' || s.status === stockStatusFilter;

      return matchWh && matchSearch && matchStatus;
    });
  }, [stocks, selectedWarehouseFilter, stockSearchTerm, stockStatusFilter]);

  // Filtered Movements
  const filteredMovements = useMemo(() => {
    return movements.filter((m) => {
      if (movementTypeFilter !== 'ALL' && m.type !== movementTypeFilter) return false;
      if (selectedWarehouseFilter !== 'all') {
        const whObj = warehouses.find((w) => w.id === selectedWarehouseFilter);
        if (whObj && !m.wh.toLowerCase().includes(whObj.name.toLowerCase())) return false;
      }
      return true;
    });
  }, [movements, movementTypeFilter, selectedWarehouseFilter, warehouses]);

  // Selected book for Barcode Designer
  const selectedBarcodeItem = useMemo(() => {
    const fromStock = stocks.find((s) => s.sku === barcodeSku);
    if (fromStock) return fromStock;
    const fromCat = catalogueBooks.find((b) => b.sku === barcodeSku);
    if (fromCat) {
      return {
        sku: fromCat.sku,
        title: fromCat.title,
        isbn: fromCat.isbn13,
        rackShelf: fromCat.rackShelf || 'RACK-A1-01',
        mrp: fromCat.mrp,
        warehouseName: fromCat.warehouseId || 'Central Depot',
      };
    }
    return {
      sku: 'BK-PHY-HCV-01',
      title: 'Concepts of Physics (Part 1 - Classic Edition)',
      isbn: '9788177091877',
      rackShelf: 'RACK-A1-01',
      mrp: 495.0,
      warehouseName: 'Central Depot',
    };
  }, [stocks, catalogueBooks, barcodeSku]);

  // --- Handlers ---
  const handleOpenNewStockModal = () => {
    setEditingStock(null);
    const firstBook = catalogueBooks[0] || null;
    const firstWh = warehouses[0] || null;
    setStockBookSku(firstBook ? firstBook.sku : 'BK-PHY-HCV-01');
    setStockWarehouseId(firstWh ? firstWh.id : 'wh_central_press_depot');
    setStockRackShelf('RACK-A1-01');
    setStockBatchNo(`BATCH-${new Date().getFullYear()}-01`);
    setStockOnHand('500');
    setStockReorderLevel('100');
    setStockWacCost(firstBook ? String(firstBook.purchaseCost || 160) : '160');
    setStockMrp(firstBook ? String(firstBook.mrp || 495) : '495');
    setStockModalOpen(true);
  };

  const handleOpenEditStockModal = (s: StockItem) => {
    setEditingStock(s);
    setStockBookSku(s.sku);
    setStockWarehouseId(s.warehouseId);
    setStockRackShelf(s.rackShelf);
    setStockBatchNo(s.batchNo);
    setStockOnHand(String(s.onHand));
    setStockReorderLevel(String(s.reorderLevel));
    setStockWacCost(String(s.wacCost));
    setStockMrp(String(s.mrp));
    setStockModalOpen(true);
  };

  const handleSaveStock = () => {
    const selectedBook = catalogueBooks.find((b) => b.sku === stockBookSku);
    const selectedWh = warehouses.find((w) => w.id === stockWarehouseId);

    const title = selectedBook ? selectedBook.title : editingStock ? editingStock.title : 'Book Title';
    const isbn = selectedBook ? selectedBook.isbn13 : editingStock ? editingStock.isbn : '9788177091877';
    const whName = selectedWh ? selectedWh.name : editingStock ? editingStock.warehouseName : 'Central Depot';

    saveStockItem({
      id: editingStock?.id,
      bookId: selectedBook?.id,
      sku: stockBookSku,
      title,
      isbn,
      warehouseId: stockWarehouseId,
      warehouseName: whName,
      rackShelf: stockRackShelf,
      batchNo: stockBatchNo,
      onHand: Number(stockOnHand) || 0,
      reserved: editingStock ? editingStock.reserved : 0,
      reorderLevel: Number(stockReorderLevel) || 100,
      wacCost: Number(stockWacCost) || 160,
      mrp: Number(stockMrp) || 495,
    });

    setStockModalOpen(false);
    reloadData();
  };

  const handleDeleteStock = (id: string, title: string) => {
    if (window.confirm(`Are you sure you want to remove stock record for "${title}"?`)) {
      deleteStockItem(id);
      reloadData();
    }
  };

  const handleOpenNewTransfer = () => {
    const fromWh = warehouses[0]?.id || '';
    const toWh = warehouses[1]?.id || warehouses[0]?.id || '';
    setTrfFrom(fromWh);
    setTrfTo(toWh);
    const sourceStocks = stocks.filter((s) => s.warehouseId === fromWh);
    setTrfSku(sourceStocks[0]?.sku || stocks[0]?.sku || 'BK-PHY-HCV-01');
    setTrfQty('100');
    setTrfTransporter('VRL Logistics India Ltd.');
    setTrfLrNumber(`VRL-LR-${Math.floor(100000 + Math.random() * 900000)}`);
    setTrfVehicleNumber('MH-04-AZ-4521');
    setTrfRemarks('Depot replenishment dispatch');
    setTransferModalOpen(true);
  };

  const handleCreateTransfer = () => {
    const sourceWh = warehouses.find((w) => w.id === trfFrom);
    const destWh = warehouses.find((w) => w.id === trfTo);
    if (!sourceWh || !destWh) {
      alert('Please select valid source and destination warehouses.');
      return;
    }
    if (sourceWh.id === destWh.id) {
      alert('Source and destination warehouses cannot be identical.');
      return;
    }
    const stockItem = stocks.find((s) => s.sku === trfSku && s.warehouseId === trfFrom);
    const title = stockItem ? stockItem.title : trfSku;
    const qty = Number(trfQty) || 50;

    if (stockItem && qty > stockItem.available) {
      alert(`Transfer quantity (${qty}) exceeds available stock (${stockItem.available}).`);
      return;
    }

    createTransfer({
      fromWarehouseId: sourceWh.id,
      fromWarehouseName: sourceWh.name,
      toWarehouseId: destWh.id,
      toWarehouseName: destWh.name,
      sku: trfSku,
      title,
      copiesDispatched: qty,
      transporter: trfTransporter,
      lrNumber: trfLrNumber,
      vehicleNumber: trfVehicleNumber,
      remarks: trfRemarks,
    });

    setTransferModalOpen(false);
    reloadData();
  };

  const handleOpenReceiveModal = (trf: StockTransferItem) => {
    setSelectedTransferToReceive(trf);
    setReceiveGoodCopies(String(trf.copiesDispatched));
    setReceiveDamagedCopies('0');
    setReceiveNotes('Consignment arrived in sound condition with unbroken depot seal.');
    setReceiveModalOpen(true);
  };

  const handleProcessReceiveTransfer = () => {
    if (!selectedTransferToReceive) return;
    const good = Number(receiveGoodCopies) || 0;
    const damaged = Number(receiveDamagedCopies) || 0;

    receiveTransfer(selectedTransferToReceive.id, good, damaged, receiveNotes);
    setReceiveModalOpen(false);
    reloadData();
  };

  const handleOpenNewAdjustment = () => {
    const defaultWh = warehouses[0]?.id || '';
    setAdjWarehouseId(defaultWh);
    const whStocks = stocks.filter((s) => s.warehouseId === defaultWh);
    const targetStock = whStocks[0] || stocks[0];
    setAdjSku(targetStock?.sku || 'BK-PHY-HCV-01');
    setAdjPhysicalQty(targetStock ? String(targetStock.onHand - 5) : '5545');
    setAdjVarianceQty('-5');
    setAdjType('DAMAGE_WRITEOFF');
    setAdjReason('5 copies water-damaged during depot monsoon handling');
    setAdjModalOpen(true);
  };

  const handleCreateAdjustment = () => {
    const wh = warehouses.find((w) => w.id === adjWarehouseId);
    if (!wh) {
      alert('Please select a valid warehouse.');
      return;
    }
    const stockItem = stocks.find((s) => s.sku === adjSku && s.warehouseId === adjWarehouseId);
    const systemQty = stockItem ? stockItem.onHand : 0;
    const physicalQty = Number(adjPhysicalQty) || systemQty;
    const varianceQty = physicalQty - systemQty;
    const unitCost = stockItem ? stockItem.wacCost : 160;

    saveAdjustmentItem({
      warehouseId: wh.id,
      warehouse: wh.name,
      sku: adjSku,
      title: stockItem ? stockItem.title : adjSku,
      type: adjType,
      systemQty,
      physicalQty,
      varianceQty: varianceQty !== 0 ? varianceQty : Number(adjVarianceQty) || -1,
      unitCost,
      reason: adjReason,
    });

    setAdjModalOpen(false);
    reloadData();
  };

  // --- Audit Handlers ---
  const handleOpenNewAudit = () => {
    const wh = warehouses[0];
    const whStocks = stocks.filter((s) => s.warehouseId === (wh?.id || ''));
    const initialLines: AuditLineItem[] = whStocks.map((s) => ({
      sku: s.sku,
      title: s.title,
      systemBookQty: s.onHand,
      physicalCountQty: s.onHand,
      varianceQty: 0,
      unitCost: s.wacCost,
      varianceValue: 0,
      status: 'MATCHED',
    }));

    setAuditLines(initialLines);
    setAuditModalOpen(true);
  };

  const handleUpdateAuditLinePhysical = (index: number, count: number) => {
    const updated = [...auditLines];
    const line = updated[index];
    const varianceQty = count - line.systemBookQty;
    const varianceValue = Number((varianceQty * line.unitCost).toFixed(2));
    const status: AuditLineItem['status'] =
      varianceQty === 0 ? 'MATCHED' : varianceQty < 0 ? 'SHORTAGE' : 'SURPLUS';

    updated[index] = {
      ...line,
      physicalCountQty: count,
      varianceQty,
      varianceValue,
      status,
    };
    setAuditLines(updated);
  };

  const handleSaveAuditSession = () => {
    const wh = warehouses[0];
    saveAuditItem({
      warehouseId: wh.id,
      warehouse: wh.name,
      scheduledBy: 'Internal Audit & Stocktaking Team',
      lines: auditLines,
      notes: 'Quarterly Physical Count Verification',
    });
    setAuditModalOpen(false);
    reloadData();
  };

  const handlePostDiscrepancyToAdjustments = (audit: CycleCountAuditItem) => {
    const discrepancyLines = audit.lines.filter((l) => l.varianceQty !== 0);
    if (discrepancyLines.length === 0) {
      alert('No discrepancies flagged in this cycle count audit session.');
      return;
    }

    discrepancyLines.forEach((line) => {
      saveAdjustmentItem({
        warehouseId: audit.warehouseId,
        warehouse: audit.warehouse,
        sku: line.sku,
        title: line.title,
        type: line.varianceQty < 0 ? 'DAMAGE_WRITEOFF' : 'SURPLUS_FOUND',
        systemQty: line.systemBookQty,
        physicalQty: line.physicalCountQty,
        varianceQty: line.varianceQty,
        unitCost: line.unitCost,
        reason: `Reconciliation from audit session ${audit.auditNumber}: ${line.status} of ${Math.abs(line.varianceQty)} copies`,
      });
    });

    reloadData();
    alert(`Successfully reconciled ${discrepancyLines.length} audit lines into general ledger journal vouchers!`);
  };

  // --- Warehouse Master Handlers ---
  const handleOpenNewWarehouse = () => {
    setEditingWarehouse(null);
    setWhName('');
    setWhCity('');
    setWhState('Delhi');
    setWhAddress('');
    setWhPincode('');
    setWhType('BRANCH_GODOWN');
    setWhManager('');
    setWhPhone('+91 ');
    setWhCapacity('25000');
    setWhUtilization('60');
    setWarehouseModalOpen(true);
  };

  const handleOpenEditWarehouse = (w: WarehouseItem) => {
    setEditingWarehouse(w);
    setWhName(w.name);
    setWhCity(w.city);
    setWhState(w.state);
    setWhAddress(w.address);
    setWhPincode(w.pincode);
    setWhType(w.type);
    setWhManager(w.managerName);
    setWhPhone(w.contactPhone);
    setWhCapacity(String(w.totalCapacitySqFt));
    setWhUtilization(String(w.currentUtilizationPct));
    setWarehouseModalOpen(true);
  };

  const handleSaveWarehouse = () => {
    if (!whName || !whCity) {
      alert('Please enter warehouse depot name and city.');
      return;
    }
    saveWarehouseItem({
      id: editingWarehouse?.id,
      name: whName,
      city: whCity,
      state: whState,
      address: whAddress,
      pincode: whPincode,
      type: whType,
      managerName: whManager,
      contactPhone: whPhone,
      totalCapacitySqFt: Number(whCapacity) || 10000,
      currentUtilizationPct: Number(whUtilization) || 50,
      status: 'ACTIVE',
    });
    setWarehouseModalOpen(false);
    reloadData();
  };

  const handleDeleteWarehouse = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to remove Godown Depot: "${name}"?`)) {
      deleteWarehouseItem(id);
      reloadData();
    }
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
        title="Inventory & Godowns Management"
        description="Multi-Warehouse Stock Levels, Rack & Shelf Locations, Inter-Depot Transfers, FIFO & WAC Valuation, Physical Stocktaking, and Dynamic Barcode Generation"
        breadcrumbs={[
          { label: 'Dashboard', href: '/' },
          { label: 'Inventory & Godowns', href: '/inventory' },
        ]}
        actions={
          <div className="flex items-center flex-wrap gap-2.5">
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Printer className="h-4 w-4" />}
              onClick={() => setActiveTab('barcodes')}
            >
              Print Barcode Labels
            </Button>
            <Button
              variant="secondary"
              size="sm"
              leftIcon={<ArrowRightLeft className="h-4 w-4" />}
              onClick={handleOpenNewTransfer}
            >
              New Stock Transfer
            </Button>
            <Button
              variant="primary"
              size="sm"
              leftIcon={<Plus className="h-4 w-4" />}
              style={{ backgroundColor: brand.primaryColor }}
              className="text-white hover:opacity-90"
              onClick={handleOpenNewStockModal}
            >
              + Inward / Add Stock
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
              Total Book Stock Value
            </span>
            <div
              className="p-2 rounded-lg"
              style={{
                backgroundColor: `${brand.primaryColor}15`,
                color: brand.primaryColor,
              }}
            >
              <Package className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900">
            ₹{totalStockValue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="mt-1 text-xs text-slate-500">
            Across {stocks.length} active inventory SKU lots
          </div>
        </Card>

        <Card
          className="p-4 bg-white shadow-sm"
          style={{ borderLeftWidth: '4px', borderLeftColor: brand.deepColor }}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Physical Stock Count
            </span>
            <div
              className="p-2 rounded-lg"
              style={{
                backgroundColor: `${brand.deepColor}15`,
                color: brand.deepColor,
              }}
            >
              <Layers className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900">
            {totalCopiesCount.toLocaleString('en-IN')} Copies
          </div>
          <div className="mt-1 text-xs text-emerald-600 font-medium">
            Stored in {warehouses.length} regional warehouse godowns
          </div>
        </Card>

        <Card
          className="p-4 bg-white shadow-sm"
          style={{ borderLeftWidth: '4px', borderLeftColor: brand.coralColor }}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Reserved for Orders
            </span>
            <div
              className="p-2 rounded-lg"
              style={{
                backgroundColor: `${brand.coralColor}15`,
                color: brand.coralColor,
              }}
            >
              <ShieldCheck className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900">
            {totalReservedCount.toLocaleString('en-IN')} Copies
          </div>
          <div className="mt-1 text-xs text-slate-500">
            Committed to wholesale dispatch orders
          </div>
        </Card>

        <Card
          className="p-4 bg-white shadow-sm"
          style={{ borderLeftWidth: '4px', borderLeftColor: brand.accentColor }}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Reorder Alerts
            </span>
            <div
              className="p-2 rounded-lg"
              style={{
                backgroundColor: `${brand.accentColor}15`,
                color: brand.accentColor,
              }}
            >
              <AlertTriangle className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900">
            {reorderAlertsCount} {reorderAlertsCount === 1 ? 'Title' : 'Titles'} Below Minimum
          </div>
          <div className="mt-1 text-xs text-amber-600 font-medium">
            {reorderAlertsCount > 0 ? 'Print run or replenishment suggested' : 'All stocks at healthy levels'}
          </div>
        </Card>
      </div>

      {/* Tabs Navigation */}
      <div className="flex border-b border-slate-200 gap-1 overflow-x-auto text-sm font-medium">
        <button
          onClick={() => setActiveTab('stocks')}
          className={`px-4 py-2.5 flex items-center gap-2 border-b-2 font-medium transition-colors whitespace-nowrap ${
            activeTab === 'stocks'
              ? 'font-semibold'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
          style={
            activeTab === 'stocks'
              ? { borderBottomColor: brand.primaryColor, color: brand.primaryColor }
              : {}
          }
        >
          <Building className="h-4 w-4" />
          Warehouse Stocks ({stocks.length})
        </button>

        <button
          onClick={() => setActiveTab('transfers')}
          className={`px-4 py-2.5 flex items-center gap-2 border-b-2 font-medium transition-colors whitespace-nowrap ${
            activeTab === 'transfers'
              ? 'font-semibold'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
          style={
            activeTab === 'transfers'
              ? { borderBottomColor: brand.primaryColor, color: brand.primaryColor }
              : {}
          }
        >
          <ArrowRightLeft className="h-4 w-4" />
          Stock Transfers ({transfers.length})
        </button>

        <button
          onClick={() => setActiveTab('movements')}
          className={`px-4 py-2.5 flex items-center gap-2 border-b-2 font-medium transition-colors whitespace-nowrap ${
            activeTab === 'movements'
              ? 'font-semibold'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
          style={
            activeTab === 'movements'
              ? { borderBottomColor: brand.primaryColor, color: brand.primaryColor }
              : {}
          }
        >
          <Clock className="h-4 w-4" />
          Movements & Bin Cards ({movements.length})
        </button>

        <button
          onClick={() => setActiveTab('audits')}
          className={`px-4 py-2.5 flex items-center gap-2 border-b-2 font-medium transition-colors whitespace-nowrap ${
            activeTab === 'audits'
              ? 'font-semibold'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
          style={
            activeTab === 'audits'
              ? { borderBottomColor: brand.primaryColor, color: brand.primaryColor }
              : {}
          }
        >
          <ClipboardCheck className="h-4 w-4" />
          Cycle Counts & Audits ({audits.length})
        </button>

        <button
          onClick={() => setActiveTab('adjustments')}
          className={`px-4 py-2.5 flex items-center gap-2 border-b-2 font-medium transition-colors whitespace-nowrap ${
            activeTab === 'adjustments'
              ? 'font-semibold'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
          style={
            activeTab === 'adjustments'
              ? { borderBottomColor: brand.primaryColor, color: brand.primaryColor }
              : {}
          }
        >
          <RotateCcw className="h-4 w-4" />
          Damage Adjustments ({adjustments.length})
        </button>

        <button
          onClick={() => setActiveTab('barcodes')}
          className={`px-4 py-2.5 flex items-center gap-2 border-b-2 font-medium transition-colors whitespace-nowrap ${
            activeTab === 'barcodes'
              ? 'font-semibold'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
          style={
            activeTab === 'barcodes'
              ? { borderBottomColor: brand.primaryColor, color: brand.primaryColor }
              : {}
          }
        >
          <Barcode className="h-4 w-4" />
          Barcode Designer
        </button>

        <button
          onClick={() => setActiveTab('valuation')}
          className={`px-4 py-2.5 flex items-center gap-2 border-b-2 font-medium transition-colors whitespace-nowrap ${
            activeTab === 'valuation'
              ? 'font-semibold'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
          style={
            activeTab === 'valuation'
              ? { borderBottomColor: brand.primaryColor, color: brand.primaryColor }
              : {}
          }
        >
          <FileSpreadsheet className="h-4 w-4" />
          FIFO vs WAC & Ageing
        </button>

        <button
          onClick={() => setActiveTab('warehouses')}
          className={`px-4 py-2.5 flex items-center gap-2 border-b-2 font-medium transition-colors whitespace-nowrap ${
            activeTab === 'warehouses'
              ? 'font-semibold'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
          style={
            activeTab === 'warehouses'
              ? { borderBottomColor: brand.primaryColor, color: brand.primaryColor }
              : {}
          }
        >
          <WarehouseIcon className="h-4 w-4" />
          Godowns Master ({warehouses.length})
        </button>
      </div>

      {/* ===================================================================== */}
      {/* TAB 1: MULTI-WAREHOUSE STOCKS OVERVIEW */}
      {/* ===================================================================== */}
      {activeTab === 'stocks' && (
        <Card className="bg-white shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-4 border-b border-slate-200 flex flex-col md:flex-row justify-between items-center gap-3">
            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search SKU, title, ISBN, rack..."
                  value={stockSearchTerm}
                  onChange={(e) => setStockSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[#690BA8]"
                />
              </div>

              <select
                className="px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white font-medium text-slate-700"
                value={selectedWarehouseFilter}
                onChange={(e) => setSelectedWarehouseFilter(e.target.value)}
              >
                <option value="all">All Warehouses (Consolidated)</option>
                {warehouses.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name} ({w.city})
                  </option>
                ))}
              </select>

              <select
                className="px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white font-medium text-slate-700"
                value={stockStatusFilter}
                onChange={(e) => setStockStatusFilter(e.target.value)}
              >
                <option value="ALL">All Stock Levels</option>
                <option value="IN_STOCK">In Stock</option>
                <option value="LOW_STOCK">Low Stock (Alert)</option>
                <option value="OUT_OF_STOCK">Out of Stock</option>
              </select>
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto justify-end">
              <Button
                variant="outline"
                size="sm"
                leftIcon={<Download className="h-4 w-4" />}
                onClick={() =>
                  exportToCsv(
                    'kibo360_stocks_summary',
                    filteredStocks.map((s) => ({
                      SKU: s.sku,
                      Title: s.title,
                      ISBN: s.isbn,
                      Warehouse: s.warehouseName,
                      Rack_Shelf: s.rackShelf,
                      Batch_No: s.batchNo,
                      On_Hand: s.onHand,
                      Reserved: s.reserved,
                      Available: s.available,
                      WAC_Cost: s.wacCost,
                      Total_Valuation: Number((s.onHand * s.wacCost).toFixed(2)),
                      Status: s.status,
                    }))
                  )
                }
              >
                Export Stocks (CSV)
              </Button>
              <Button
                variant="primary"
                size="sm"
                leftIcon={<Plus className="h-4 w-4" />}
                style={{ backgroundColor: brand.primaryColor }}
                className="text-white hover:opacity-90"
                onClick={handleOpenNewStockModal}
              >
                Inward Stock
              </Button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-600 text-xs uppercase border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Book Title & SKU</th>
                  <th className="py-3 px-3">Warehouse & Rack</th>
                  <th className="py-3 px-3 text-right">On Hand</th>
                  <th className="py-3 px-3 text-right">Reserved</th>
                  <th className="py-3 px-3 text-right">Available</th>
                  <th className="py-3 px-3 text-right">WAC Cost</th>
                  <th className="py-3 px-4 text-right">Total Valuation</th>
                  <th className="py-3 px-3 text-center">Status</th>
                  <th className="py-3 px-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredStocks.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-8 text-center text-slate-500 text-sm">
                      No stock items found matching the selected filters.
                    </td>
                  </tr>
                ) : (
                  filteredStocks.map((s) => (
                    <tr key={s.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-900">{s.title}</div>
                        <div className="text-xs font-mono text-slate-500">
                          SKU: {s.sku} | ISBN: {s.isbn} {s.batchNo ? `| ${s.batchNo}` : ''}
                        </div>
                      </td>
                      <td className="py-3.5 px-3">
                        <div className="text-xs font-medium text-slate-800">{s.warehouseName}</div>
                        <div
                          className="text-xs font-mono font-semibold"
                          style={{ color: brand.primaryColor }}
                        >
                          {s.rackShelf}
                        </div>
                      </td>
                      <td className="py-3.5 px-3 text-right font-mono font-bold text-slate-900">
                        {s.onHand.toLocaleString('en-IN')}
                      </td>
                      <td className="py-3.5 px-3 text-right font-mono text-amber-600">
                        {s.reserved.toLocaleString('en-IN')}
                      </td>
                      <td className="py-3.5 px-3 text-right font-mono font-semibold text-emerald-600">
                        {s.available.toLocaleString('en-IN')}
                      </td>
                      <td className="py-3.5 px-3 text-right font-mono text-slate-700">
                        ₹{s.wacCost.toFixed(2)}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900">
                        ₹{(s.onHand * s.wacCost).toLocaleString('en-IN', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </td>
                      <td className="py-3.5 px-3 text-center">
                        <Badge
                          variant={
                            s.status === 'IN_STOCK'
                              ? 'success'
                              : s.status === 'LOW_STOCK'
                              ? 'warning'
                              : 'coral'
                          }
                        >
                          {s.status === 'IN_STOCK'
                            ? 'In Stock'
                            : s.status === 'LOW_STOCK'
                            ? 'Low Stock'
                            : 'Out of Stock'}
                        </Badge>
                      </td>
                      <td className="py-3.5 px-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-xs font-medium text-purple-700 hover:text-purple-900"
                            onClick={() => {
                              setSelectedLedgerSku(s.sku);
                              setLedgerDrawerOpen(true);
                            }}
                          >
                            Bin Card
                          </Button>
                          <button
                            onClick={() => handleOpenEditStockModal(s)}
                            className="p-1 text-slate-400 hover:text-slate-700 rounded transition-colors"
                            title="Edit Stock Record"
                          >
                            <Edit className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteStock(s.id, s.title)}
                            className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors"
                            title="Remove Stock Item"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
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
      {/* TAB 2: STOCK TRANSFERS */}
      {/* ===================================================================== */}
      {activeTab === 'transfers' && (
        <Card className="bg-white shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-3">
            <div>
              <h3 className="font-semibold text-slate-800">Warehouse-to-Warehouse Stock Transfers</h3>
              <p className="text-xs text-slate-500">
                Track dispatches in transit, arrivals, and transit damage discrepancies with automatic inventory reconciliation
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                leftIcon={<Download className="h-4 w-4" />}
                onClick={() =>
                  exportToCsv(
                    'kibo360_transfers_register',
                    transfers.map((t) => ({
                      Transfer_No: t.transferNumber,
                      Source_Warehouse: t.fromWarehouseName,
                      Destination_Warehouse: t.toWarehouseName,
                      SKU: t.sku,
                      Title: t.title,
                      Dispatch_Date: t.dispatchDate,
                      Transporter: t.transporter,
                      LR_Number: t.lrNumber,
                      Dispatched: t.copiesDispatched,
                      Received: t.copiesReceived,
                      Damaged: t.copiesDamaged,
                      Discrepancy: t.discrepancy,
                      Status: t.status,
                    }))
                  )
                }
              >
                Export Register (CSV)
              </Button>
              <Button
                variant="primary"
                size="sm"
                leftIcon={<Plus className="h-4 w-4" />}
                style={{ backgroundColor: brand.primaryColor }}
                className="text-white hover:opacity-90"
                onClick={handleOpenNewTransfer}
              >
                New Transfer Dispatch
              </Button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-600 text-xs uppercase border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Transfer Number</th>
                  <th className="py-3 px-4">Source Warehouse</th>
                  <th className="py-3 px-4">Destination Warehouse</th>
                  <th className="py-3 px-3">Transporter & LR</th>
                  <th className="py-3 px-3 text-center">Dispatched</th>
                  <th className="py-3 px-3 text-center">Received</th>
                  <th className="py-3 px-3 text-center">Damaged</th>
                  <th className="py-3 px-3 text-center">Status</th>
                  <th className="py-3 px-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {transfers.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-8 text-center text-slate-500 text-sm">
                      No stock transfers found. Click "New Transfer Dispatch" to begin.
                    </td>
                  </tr>
                ) : (
                  transfers.map((t) => (
                    <tr key={t.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-mono font-semibold text-slate-900">{t.transferNumber}</div>
                        <div className="text-xs text-slate-500 font-mono">
                          {t.sku} • {t.dispatchDate}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-xs font-medium text-slate-700">
                        {t.fromWarehouseName}
                      </td>
                      <td className="py-3.5 px-4 text-xs font-medium text-slate-700">
                        {t.toWarehouseName}
                      </td>
                      <td className="py-3.5 px-3">
                        <div className="text-xs text-slate-800 font-medium">{t.transporter}</div>
                        <div className="text-xs font-mono text-slate-500">{t.lrNumber}</div>
                      </td>
                      <td className="py-3.5 px-3 text-center font-mono font-bold text-slate-800">
                        {t.copiesDispatched.toLocaleString('en-IN')}
                      </td>
                      <td className="py-3.5 px-3 text-center font-mono font-bold text-emerald-600">
                        {t.copiesReceived.toLocaleString('en-IN')}
                      </td>
                      <td className="py-3.5 px-3 text-center font-mono text-rose-600 font-semibold">
                        {t.copiesDamaged}
                      </td>
                      <td className="py-3.5 px-3 text-center">
                        <Badge
                          variant={
                            t.status === 'COMPLETED'
                              ? 'success'
                              : t.status === 'PARTIALLY_RECEIVED'
                              ? 'warning'
                              : 'purple'
                          }
                        >
                          {t.status.replace(/_/g, ' ')}
                        </Badge>
                      </td>
                      <td className="py-3.5 px-3 text-center">
                        {t.status === 'DISPATCHED_IN_TRANSIT' ? (
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-xs font-medium text-emerald-700 border-emerald-300 hover:bg-emerald-50"
                            leftIcon={<Check className="h-3.5 w-3.5" />}
                            onClick={() => handleOpenReceiveModal(t)}
                          >
                            Receive at Depot
                          </Button>
                        ) : (
                          <span className="text-xs text-slate-400 font-medium">Reconciled</span>
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
      {/* TAB 3: STOCK MOVEMENTS / BIN CARDS */}
      {/* ===================================================================== */}
      {activeTab === 'movements' && (
        <Card className="bg-white shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-4 border-b border-slate-200 flex flex-col md:flex-row justify-between items-center gap-3">
            <div>
              <h3 className="font-semibold text-slate-800">
                Chronological Stock Movement Ledger (Bin Cards)
              </h3>
              <p className="text-xs text-slate-500">
                Complete tamper-proof audit trail of every inward, sale dispatch, inter-depot transfer, and damage adjustment
              </p>
            </div>
            <div className="flex items-center gap-3">
              <select
                className="px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white font-medium text-slate-700"
                value={movementTypeFilter}
                onChange={(e) => setMovementTypeFilter(e.target.value)}
              >
                <option value="ALL">All Movement Types</option>
                <option value="INWARD_PURCHASE">Inward Purchase / Press</option>
                <option value="TRANSFER_RECEIPT">Transfer Receipt</option>
                <option value="OUTWARD_TRANSFER">Outward Transfer</option>
                <option value="OUTWARD_SALE">Outward Wholesale / Sale</option>
                <option value="DAMAGE_WRITEOFF">Damage Write-Off</option>
                <option value="CYCLE_COUNT_ADJUSTMENT">Cycle Count Reconciliation</option>
              </select>

              <Button
                variant="outline"
                size="sm"
                leftIcon={<Download className="h-4 w-4" />}
                onClick={() =>
                  exportToCsv(
                    'kibo360_stock_movements',
                    filteredMovements.map((m) => ({
                      Date: m.date,
                      Warehouse: m.wh,
                      SKU: m.sku,
                      Title: m.title,
                      Type: m.type,
                      Reference_No: m.ref,
                      Inward_Qty: m.in,
                      Outward_Qty: m.out,
                      Balance: m.bal,
                      Unit_Rate: m.rate,
                      Notes: m.notes,
                    }))
                  )
                }
              >
                Export Bin Cards (CSV)
              </Button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-600 text-xs uppercase border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Date & Time</th>
                  <th className="py-3 px-3">Warehouse</th>
                  <th className="py-3 px-3">SKU & Movement Type</th>
                  <th className="py-3 px-3">Reference No</th>
                  <th className="py-3 px-3 text-right">Inward (+)</th>
                  <th className="py-3 px-3 text-right">Outward (-)</th>
                  <th className="py-3 px-3 text-right">Balance</th>
                  <th className="py-3 px-4 text-right">Unit Rate</th>
                  <th className="py-3 px-4">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredMovements.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-8 text-center text-slate-500 text-sm">
                      No stock movement records found for the selected filter.
                    </td>
                  </tr>
                ) : (
                  filteredMovements.map((m) => (
                    <tr key={m.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4 text-xs font-mono text-slate-600">{m.date}</td>
                      <td className="py-3 px-3 text-xs text-slate-700 font-medium">{m.wh}</td>
                      <td className="py-3 px-3">
                        <span className="font-mono text-xs font-semibold text-slate-900">{m.sku}</span>
                        <div className="text-xs text-slate-500">{m.type.replace(/_/g, ' ')}</div>
                      </td>
                      <td className="py-3 px-3 font-mono text-xs text-purple-700 font-medium">
                        {m.ref}
                      </td>
                      <td className="py-3 px-3 text-right font-mono font-semibold text-emerald-600">
                        {m.in > 0 ? `+${m.in.toLocaleString('en-IN')}` : '-'}
                      </td>
                      <td className="py-3 px-3 text-right font-mono font-semibold text-rose-600">
                        {m.out > 0 ? `-${m.out.toLocaleString('en-IN')}` : '-'}
                      </td>
                      <td className="py-3 px-3 text-right font-mono font-bold text-slate-900">
                        {m.bal.toLocaleString('en-IN')}
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-slate-700">
                        ₹{m.rate.toFixed(2)}
                      </td>
                      <td className="py-3 px-4 text-xs text-slate-500 max-w-xs truncate">
                        {m.notes || '-'}
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
      {/* TAB 4: CYCLE COUNTS & PHYSICAL AUDITS */}
      {/* ===================================================================== */}
      {activeTab === 'audits' && (
        <Card className="bg-white shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-3">
            <div>
              <h3 className="font-semibold text-slate-800">
                Physical Stocktaking & Cycle Count Audits
              </h3>
              <p className="text-xs text-slate-500">
                Periodic physical count vs system book inventory discrepancy audit and direct reconciliation
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                leftIcon={<Download className="h-4 w-4" />}
                onClick={() =>
                  exportToCsv(
                    'kibo360_cycle_counts_audit',
                    audits.map((a) => ({
                      Audit_Session: a.auditNumber,
                      Warehouse: a.warehouse,
                      Date: a.date,
                      Auditor: a.scheduledBy,
                      Items_Audited: a.itemsCount,
                      Matched: a.matched,
                      Variance_Count: a.variance,
                      Net_Variance_Value: a.netVarianceValue,
                      Status: a.status,
                    }))
                  )
                }
              >
                Export Audits (CSV)
              </Button>
              <Button
                variant="primary"
                size="sm"
                leftIcon={<Plus className="h-4 w-4" />}
                style={{ backgroundColor: brand.primaryColor }}
                className="text-white hover:opacity-90"
                onClick={handleOpenNewAudit}
              >
                New Cycle Count Audit
              </Button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-600 text-xs uppercase border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Audit Session</th>
                  <th className="py-3 px-4">Warehouse Depot</th>
                  <th className="py-3 px-3">Audit Date</th>
                  <th className="py-3 px-3">Auditor Lead</th>
                  <th className="py-3 px-3 text-center">Items Audited</th>
                  <th className="py-3 px-3 text-center">Matched</th>
                  <th className="py-3 px-3 text-center">Variance Count</th>
                  <th className="py-3 px-4 text-right">Net Variance Value</th>
                  <th className="py-3 px-3 text-center">Status</th>
                  <th className="py-3 px-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {audits.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="py-8 text-center text-slate-500 text-sm">
                      No cycle count audits recorded yet.
                    </td>
                  </tr>
                ) : (
                  audits.map((a) => (
                    <tr key={a.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-semibold text-slate-900">
                        {a.auditNumber}
                      </td>
                      <td className="py-3.5 px-4 text-xs font-medium text-slate-700">
                        {a.warehouse}
                      </td>
                      <td className="py-3.5 px-3 text-slate-600 font-mono text-xs">{a.date}</td>
                      <td className="py-3.5 px-3 text-xs text-slate-700">{a.scheduledBy}</td>
                      <td className="py-3.5 px-3 text-center font-bold font-mono text-slate-800">
                        {a.itemsCount}
                      </td>
                      <td className="py-3.5 px-3 text-center font-bold font-mono text-emerald-600">
                        {a.matched}
                      </td>
                      <td className="py-3.5 px-3 text-center font-bold font-mono text-rose-600">
                        {a.variance}
                      </td>
                      <td
                        className={`py-3.5 px-4 text-right font-mono font-bold ${
                          a.netVarianceValue < 0 ? 'text-rose-600' : 'text-emerald-600'
                        }`}
                      >
                        ₹{a.netVarianceValue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3.5 px-3 text-center">
                        <Badge variant={a.status === 'RECONCILED' ? 'success' : 'coral'}>
                          {a.status === 'RECONCILED' ? 'Reconciled' : 'Discrepancy Flagged'}
                        </Badge>
                      </td>
                      <td className="py-3.5 px-3 text-center">
                        {a.status === 'RECONCILED' || a.variance === 0 ? (
                          <span className="text-xs text-slate-400">Clean</span>
                        ) : (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-xs text-purple-700 hover:text-purple-900"
                            onClick={() => handlePostDiscrepancyToAdjustments(a)}
                          >
                            Post to GL
                          </Button>
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
      {/* TAB 5: ADJUSTMENTS & DAMAGE WRITE-OFFS */}
      {/* ===================================================================== */}
      {activeTab === 'adjustments' && (
        <Card className="bg-white shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-3">
            <div>
              <h3 className="font-semibold text-slate-800">
                Stock Adjustments & Damage Write-Offs
              </h3>
              <p className="text-xs text-slate-500">
                Reconciled adjustments posted directly to General Ledger journal vouchers (JV) with zero manual double entry
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                leftIcon={<Download className="h-4 w-4" />}
                onClick={() =>
                  exportToCsv(
                    'kibo360_stock_adjustments',
                    adjustments.map((adj) => ({
                      Adjustment_No: adj.adjustmentNumber,
                      Warehouse: adj.warehouse,
                      Type: adj.type,
                      Date: adj.date,
                      SKU: adj.sku,
                      Reason: adj.reason,
                      Variance_Qty: adj.varianceQty,
                      Unit_Cost: adj.unitCost,
                      Variance_Value: adj.varianceValue,
                      GL_Voucher: adj.voucherNumber,
                      Status: adj.status,
                    }))
                  )
                }
              >
                Export Adjustments (CSV)
              </Button>
              <Button
                variant="primary"
                size="sm"
                leftIcon={<Plus className="h-4 w-4" />}
                style={{ backgroundColor: brand.primaryColor }}
                className="text-white hover:opacity-90"
                onClick={handleOpenNewAdjustment}
              >
                New Adjustment
              </Button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-600 text-xs uppercase border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Adjustment No</th>
                  <th className="py-3 px-4">Warehouse</th>
                  <th className="py-3 px-3">Type</th>
                  <th className="py-3 px-3">Reason / Justification</th>
                  <th className="py-3 px-3 text-center">Variance Qty</th>
                  <th className="py-3 px-4 text-right">Variance Value</th>
                  <th className="py-3 px-3 text-center">GL Voucher</th>
                  <th className="py-3 px-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {adjustments.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-slate-500 text-sm">
                      No stock adjustments posted yet.
                    </td>
                  </tr>
                ) : (
                  adjustments.map((adj) => (
                    <tr key={adj.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-semibold text-slate-900">
                        {adj.adjustmentNumber}
                        <div className="text-[11px] text-slate-500 font-normal">
                          {adj.sku} • {adj.date}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-xs font-medium text-slate-700">
                        {adj.warehouse}
                      </td>
                      <td className="py-3.5 px-3">
                        <span className="px-2 py-0.5 bg-rose-50 text-rose-700 text-xs font-semibold rounded">
                          {adj.type.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 text-xs text-slate-600 max-w-xs">{adj.reason}</td>
                      <td
                        className={`py-3.5 px-3 text-center font-mono font-bold ${
                          adj.varianceQty < 0 ? 'text-rose-600' : 'text-emerald-600'
                        }`}
                      >
                        {adj.varianceQty > 0 ? `+${adj.varianceQty}` : adj.varianceQty}
                      </td>
                      <td
                        className={`py-3.5 px-4 text-right font-mono font-bold ${
                          adj.varianceValue < 0 ? 'text-rose-600' : 'text-emerald-600'
                        }`}
                      >
                        ₹{adj.varianceValue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3.5 px-3 text-center">
                        <span
                          className="px-2 py-0.5 font-mono text-xs rounded font-medium"
                          style={{
                            backgroundColor: `${brand.primaryColor}15`,
                            color: brand.primaryColor,
                          }}
                        >
                          {adj.voucherNumber}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 text-center">
                        <Badge variant="success">{adj.status}</Badge>
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
      {/* TAB 6: BARCODE & SHELF LABEL GENERATOR */}
      {/* ===================================================================== */}
      {activeTab === 'barcodes' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 space-y-4">
            <Card className="p-5 bg-white shadow-sm border border-slate-200 space-y-4">
              <h3 className="font-semibold text-slate-900 text-base pb-2 border-b border-slate-100 flex items-center gap-2">
                <Barcode className="h-5 w-5" style={{ color: brand.primaryColor }} />
                Barcode Label Configuration
              </h3>

              <div className="space-y-3">
                <FormField label="Target SKU / Book Title" required>
                  <select
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
                    value={barcodeSku}
                    onChange={(e) => setBarcodeSku(e.target.value)}
                  >
                    {stocks.map((s) => (
                      <option key={s.id} value={s.sku}>
                        {s.title} ({s.sku}) - Loc: {s.rackShelf}
                      </option>
                    ))}
                    {catalogueBooks
                      .filter((b) => !stocks.some((s) => s.sku === b.sku))
                      .map((b) => (
                        <option key={b.id} value={b.sku}>
                          {b.title} ({b.sku}) - Catalogue
                        </option>
                      ))}
                  </select>
                </FormField>

                <div className="grid grid-cols-2 gap-3">
                  <FormField label="Barcode Format">
                    <select
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
                      value={barcodeFormat}
                      onChange={(e) => setBarcodeFormat(e.target.value as any)}
                    >
                      <option value="CODE128">Code-128 (Alphanumeric SKU)</option>
                      <option value="EAN13">EAN-13 (Standard ISBN-13)</option>
                    </select>
                  </FormField>

                  <FormField label="Label Template">
                    <select
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
                      value={barcodeLabelType}
                      onChange={(e) => setBarcodeLabelType(e.target.value as any)}
                    >
                      <option value="PRODUCT_LABEL">Product Label (50x25mm)</option>
                      <option value="SHELF_RACK_LABEL">Shelf / Bin Label (100x40mm)</option>
                    </select>
                  </FormField>
                </div>

                <FormField label="Number of Labels to Print">
                  <Input
                    type="number"
                    value={labelQty}
                    onChange={(e) => setLabelQty(e.target.value)}
                    placeholder="1"
                  />
                </FormField>
              </div>

              <div className="pt-2">
                <Button
                  variant="primary"
                  className="w-full text-white flex items-center justify-center gap-2 hover:opacity-90"
                  style={{ backgroundColor: brand.primaryColor }}
                  leftIcon={<Printer className="h-4 w-4" />}
                  onClick={() => {
                    window.print();
                  }}
                >
                  Print Thermal Labels ({labelQty} {Number(labelQty) === 1 ? 'Copy' : 'Copies'})
                </Button>
              </div>
            </Card>
          </div>

          <div className="lg:col-span-7">
            <Card className="p-5 bg-white shadow-sm border border-slate-200 space-y-3">
              <h3 className="font-semibold text-slate-800 text-sm pb-2 border-b border-slate-100 flex items-center justify-between">
                <span>Printable Vector Label Preview</span>
                <span className="text-xs text-slate-500 font-mono">
                  {barcodeLabelType === 'PRODUCT_LABEL' ? '50mm × 25mm Zebra/Citizen' : '100mm × 40mm Shelf Bin'}
                </span>
              </h3>

              <div className="p-8 bg-slate-100 rounded-lg flex items-center justify-center min-h-[300px]">
                <div
                  className={`bg-white border-2 border-dashed border-slate-400 rounded-md shadow-sm space-y-2 p-4 ${
                    barcodeLabelType === 'PRODUCT_LABEL' ? 'w-80' : 'w-96'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <span
                      className="text-xs font-bold font-serif uppercase tracking-wider"
                      style={{ color: brand.deepColor }}
                    >
                      {brand.companyName || 'KIBO360 PUBLISHING'}
                    </span>
                    <span
                      className="text-xs font-bold"
                      style={{ color: brand.coralColor }}
                    >
                      MRP: ₹{Number(selectedBarcodeItem.mrp || 495).toFixed(2)}
                    </span>
                  </div>

                  <div className="font-semibold text-xs text-slate-900 leading-tight">
                    {selectedBarcodeItem.title}
                  </div>

                  <div className="text-[10px] font-mono text-slate-500 flex justify-between">
                    <span>SKU: {selectedBarcodeItem.sku}</span>
                    <span>Loc: {selectedBarcodeItem.rackShelf}</span>
                  </div>

                  {/* High Quality Barcode Lines Simulation */}
                  <div className="pt-2 border-t border-slate-200 flex flex-col items-center">
                    <div className="h-11 w-full bg-slate-900 flex items-center justify-between px-3 py-1">
                      <div className="h-9 w-1.5 bg-white"></div>
                      <div className="h-9 w-0.5 bg-white"></div>
                      <div className="h-9 w-1 bg-white"></div>
                      <div className="h-9 w-2 bg-white"></div>
                      <div className="h-9 w-0.5 bg-white"></div>
                      <div className="h-9 w-1.5 bg-white"></div>
                      <div className="h-9 w-0.5 bg-white"></div>
                      <div className="h-9 w-2 bg-white"></div>
                      <div className="h-9 w-1 bg-white"></div>
                      <div className="h-9 w-0.5 bg-white"></div>
                      <div className="h-9 w-1.5 bg-white"></div>
                      <div className="h-9 w-2 bg-white"></div>
                      <div className="h-9 w-1 bg-white"></div>
                      <div className="h-9 w-0.5 bg-white"></div>
                      <div className="h-9 w-1.5 bg-white"></div>
                    </div>
                    <span className="text-[11px] font-mono font-bold tracking-widest text-slate-900 mt-1">
                      {barcodeFormat === 'EAN13'
                        ? selectedBarcodeItem.isbn
                        : selectedBarcodeItem.sku}
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* TAB 7: INVENTORY VALUATION (FIFO VS WAC) & AGEING */}
      {/* ===================================================================== */}
      {activeTab === 'valuation' && (
        <div className="space-y-6">
          {/* Ageing Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="p-4 bg-emerald-50 border border-emerald-200">
              <span className="text-xs font-semibold uppercase text-emerald-800">
                Active Stock (&lt; 30 Days)
              </span>
              <div className="mt-2 text-xl font-bold text-emerald-950 font-mono">
                ₹{valuationData.activeValue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </div>
              <div className="text-xs text-emerald-700 mt-1">High inventory turnover rate</div>
            </Card>

            <Card className="p-4 bg-blue-50 border border-blue-200">
              <span className="text-xs font-semibold uppercase text-blue-800">
                Normal Turnover (30-90 Days)
              </span>
              <div className="mt-2 text-xl font-bold text-blue-950 font-mono">
                ₹{valuationData.normalValue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </div>
              <div className="text-xs text-blue-700 mt-1">Standard academic sales cycle</div>
            </Card>

            <Card className="p-4 bg-amber-50 border border-amber-200">
              <span className="text-xs font-semibold uppercase text-amber-800">
                Slow-Moving (91-180 Days)
              </span>
              <div className="mt-2 text-xl font-bold text-amber-950 font-mono">
                ₹{valuationData.slowMovingValue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </div>
              <div className="text-xs text-amber-700 mt-1">Recommend dealer discount push</div>
            </Card>

            <Card className="p-4 bg-rose-50 border border-rose-200">
              <span className="text-xs font-semibold uppercase text-rose-800">
                Dead Stock (&gt; 180 Days)
              </span>
              <div className="mt-2 text-xl font-bold text-rose-950 font-mono">
                ₹{valuationData.deadStockValue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </div>
              <div className="text-xs text-rose-700 mt-1">Provisioning or pulp candidate</div>
            </Card>
          </div>

          <Card className="p-5 bg-white shadow-sm border border-slate-200">
            <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-3">
              <div>
                <h3 className="font-semibold text-slate-800 text-base">
                  Dynamic Inventory Valuation: FIFO vs Weighted Average Cost (WAC)
                </h3>
                <p className="text-xs text-slate-500">
                  Total WAC: ₹{valuationData.totalWacValue.toLocaleString('en-IN', { minimumFractionDigits: 2 })} | Total FIFO: ₹{valuationData.totalFifoValue.toLocaleString('en-IN', { minimumFractionDigits: 2 })} | Net Delta: ₹{valuationData.netDelta > 0 ? `+${valuationData.netDelta.toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : valuationData.netDelta.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </p>
              </div>

              <Button
                variant="outline"
                size="sm"
                leftIcon={<Download className="h-4 w-4" />}
                onClick={() =>
                  exportToCsv(
                    'kibo360_valuation_and_ageing',
                    valuationData.items.map((i) => ({
                      SKU: i.sku,
                      Title: i.title,
                      Warehouse: i.warehouseName,
                      Physical_On_Hand: i.onHand,
                      WAC_Rate: i.wacCost,
                      WAC_Total_Value: i.wacTotalValue,
                      FIFO_Total_Value: i.fifoTotalValue,
                      Valuation_Delta: i.valuationDelta,
                      Age_Days: i.ageDays,
                      Age_Bucket: i.ageBucket,
                      Age_Status: i.ageStatus,
                    }))
                  )
                }
              >
                Export Valuation (CSV)
              </Button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-600 text-xs uppercase border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-4">SKU & Book Title</th>
                    <th className="py-2.5 px-3">Warehouse</th>
                    <th className="py-2.5 px-3 text-right">Physical On Hand</th>
                    <th className="py-2.5 px-3 text-right">WAC Rate</th>
                    <th className="py-2.5 px-4 text-right">WAC Total Value</th>
                    <th className="py-2.5 px-4 text-right">FIFO Total Value</th>
                    <th className="py-2.5 px-3 text-right">Valuation Delta</th>
                    <th className="py-2.5 px-3 text-center">Ageing Bucket</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {valuationData.items.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-medium text-slate-900">{item.title}</div>
                        <div className="text-xs font-mono text-slate-500">{item.sku}</div>
                      </td>
                      <td className="py-3 px-3 text-xs text-slate-700">{item.warehouseName}</td>
                      <td className="py-3 px-3 text-right font-mono font-bold">
                        {item.onHand.toLocaleString('en-IN')}
                      </td>
                      <td className="py-3 px-3 text-right font-mono text-slate-700">
                        ₹{item.wacCost.toFixed(2)}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                        ₹{item.wacTotalValue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                      <td
                        className="py-3 px-4 text-right font-mono font-bold"
                        style={{ color: brand.primaryColor }}
                      >
                        ₹{item.fifoTotalValue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                      <td
                        className={`py-3 px-3 text-right font-mono font-semibold ${
                          item.valuationDelta > 0
                            ? 'text-emerald-600'
                            : item.valuationDelta < 0
                            ? 'text-rose-600'
                            : 'text-slate-400'
                        }`}
                      >
                        {item.valuationDelta > 0
                          ? `+₹${item.valuationDelta.toFixed(2)}`
                          : `₹${item.valuationDelta.toFixed(2)}`}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <Badge
                          variant={
                            item.ageStatus === 'ACTIVE'
                              ? 'success'
                              : item.ageStatus === 'NORMAL'
                              ? 'purple'
                              : item.ageStatus === 'SLOW_MOVING'
                              ? 'warning'
                              : 'coral'
                          }
                        >
                          {item.ageBucket}
                        </Badge>
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
      {/* TAB 8: WAREHOUSE GODOWNS MASTER */}
      {/* ===================================================================== */}
      {activeTab === 'warehouses' && (
        <Card className="bg-white shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-3">
            <div>
              <h3 className="font-semibold text-slate-800">
                Warehouse Godowns & Regional Distribution Hubs
              </h3>
              <p className="text-xs text-slate-500">
                Configure regional storage depots, square footage capacities, in-charges, and utilization percentages
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                leftIcon={<Download className="h-4 w-4" />}
                onClick={() =>
                  exportToCsv(
                    'kibo360_warehouses_master',
                    warehouses.map((w) => ({
                      Code: w.code,
                      Name: w.name,
                      City: w.city,
                      State: w.state,
                      Type: w.type,
                      Manager: w.managerName,
                      Phone: w.contactPhone,
                      Capacity_SqFt: w.totalCapacitySqFt,
                      Utilization_Pct: w.currentUtilizationPct,
                      Status: w.status,
                    }))
                  )
                }
              >
                Export Depots (CSV)
              </Button>
              <Button
                variant="primary"
                size="sm"
                leftIcon={<Plus className="h-4 w-4" />}
                style={{ backgroundColor: brand.primaryColor }}
                className="text-white hover:opacity-90"
                onClick={handleOpenNewWarehouse}
              >
                + Add Godown / Depot
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
            {warehouses.map((w) => (
              <div
                key={w.id}
                className="p-4 border border-slate-200 rounded-lg hover:shadow-md transition-shadow bg-slate-50/50 space-y-3"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-semibold text-slate-900 text-sm">{w.name}</h4>
                    <span className="text-xs font-mono text-purple-700 font-medium">{w.code}</span>
                  </div>
                  <Badge variant={w.type === 'CENTRAL_DEPOT' ? 'purple' : 'slate'}>
                    {w.type.replace(/_/g, ' ')}
                  </Badge>
                </div>

                <div className="text-xs text-slate-600 space-y-1">
                  <div>
                    <span className="font-medium text-slate-700">Location:</span> {w.city}, {w.state}
                  </div>
                  <div>
                    <span className="font-medium text-slate-700">Manager:</span> {w.managerName} ({w.contactPhone})
                  </div>
                  <div>
                    <span className="font-medium text-slate-700">Address:</span> {w.address} - {w.pincode}
                  </div>
                </div>

                {/* Capacity Bar */}
                <div className="space-y-1 pt-1">
                  <div className="flex justify-between text-xs text-slate-600">
                    <span>Capacity: {w.totalCapacitySqFt.toLocaleString()} sq.ft.</span>
                    <span className="font-semibold font-mono text-slate-800">
                      {w.currentUtilizationPct}% Utilized
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        w.currentUtilizationPct > 80
                          ? 'bg-rose-500'
                          : w.currentUtilizationPct > 60
                          ? 'bg-amber-500'
                          : 'bg-emerald-500'
                      }`}
                      style={{ width: `${w.currentUtilizationPct}%` }}
                    ></div>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs"
                    onClick={() => handleOpenEditWarehouse(w)}
                  >
                    Edit Depot
                  </Button>
                  {w.type !== 'CENTRAL_DEPOT' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs text-rose-600 hover:text-rose-800"
                      onClick={() => handleDeleteWarehouse(w.id, w.name)}
                    >
                      Delete
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* ===================================================================== */}
      {/* MODAL 1: ADD / INWARD / EDIT STOCK ITEM */}
      {/* ===================================================================== */}
      <Modal
        isOpen={stockModalOpen}
        onClose={() => setStockModalOpen(false)}
        title={editingStock ? 'Edit Stock Record' : 'Inward / Add Warehouse Stock'}
        maxWidth="lg"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Target Book (Catalogue)" required>
              <select
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
                value={stockBookSku}
                onChange={(e) => {
                  setStockBookSku(e.target.value);
                  const b = catalogueBooks.find((book) => book.sku === e.target.value);
                  if (b) {
                    setStockWacCost(String(b.purchaseCost || 160));
                    setStockMrp(String(b.mrp || 495));
                  }
                }}
              >
                {catalogueBooks.map((b) => (
                  <option key={b.id} value={b.sku}>
                    {b.title} ({b.sku})
                  </option>
                ))}
              </select>
            </FormField>

            <FormField label="Warehouse Godown Depot" required>
              <select
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
                value={stockWarehouseId}
                onChange={(e) => setStockWarehouseId(e.target.value)}
              >
                {warehouses.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name} ({w.city})
                  </option>
                ))}
              </select>
            </FormField>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Rack / Shelf Bin Location" required>
              <Input
                value={stockRackShelf}
                onChange={(e) => setStockRackShelf(e.target.value)}
                placeholder="e.g. RACK-A1-02"
              />
            </FormField>

            <FormField label="Batch / Lot Number">
              <Input
                value={stockBatchNo}
                onChange={(e) => setStockBatchNo(e.target.value)}
                placeholder="e.g. BATCH-2026-P01"
              />
            </FormField>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <FormField label="Physical On-Hand Quantity" required>
              <Input
                type="number"
                value={stockOnHand}
                onChange={(e) => setStockOnHand(e.target.value)}
                placeholder="e.g. 500"
              />
            </FormField>

            <FormField label="Reorder Threshold" required>
              <Input
                type="number"
                value={stockReorderLevel}
                onChange={(e) => setStockReorderLevel(e.target.value)}
                placeholder="e.g. 150"
              />
            </FormField>

            <FormField label="Unit WAC Cost (₹)" required>
              <Input
                type="number"
                step="0.01"
                value={stockWacCost}
                onChange={(e) => setStockWacCost(e.target.value)}
                placeholder="e.g. 160.00"
              />
            </FormField>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Printed MRP (₹)" required>
              <Input
                type="number"
                step="0.01"
                value={stockMrp}
                onChange={(e) => setStockMrp(e.target.value)}
                placeholder="e.g. 495.00"
              />
            </FormField>

            <div className="flex items-center text-xs text-slate-500 pt-6">
              Total Inward Value: ₹
              {(Number(stockOnHand || 0) * Number(stockWacCost || 0)).toLocaleString('en-IN', {
                minimumFractionDigits: 2,
              })}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <Button variant="outline" size="sm" onClick={() => setStockModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              style={{ backgroundColor: brand.primaryColor }}
              className="text-white hover:opacity-90"
              onClick={handleSaveStock}
            >
              {editingStock ? 'Save Changes' : 'Confirm Inward Stock'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* ===================================================================== */}
      {/* MODAL 2: NEW INTER-WAREHOUSE STOCK TRANSFER */}
      {/* ===================================================================== */}
      <Modal
        isOpen={transferModalOpen}
        onClose={() => setTransferModalOpen(false)}
        title="Dispatch Inter-Warehouse Stock Transfer"
        maxWidth="lg"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Source Warehouse (Dispatched From)" required>
              <select
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
                value={trfFrom}
                onChange={(e) => setTrfFrom(e.target.value)}
              >
                {warehouses.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name} ({w.city})
                  </option>
                ))}
              </select>
            </FormField>

            <FormField label="Destination Warehouse (Delivered To)" required>
              <select
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
                value={trfTo}
                onChange={(e) => setTrfTo(e.target.value)}
              >
                {warehouses.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name} ({w.city})
                  </option>
                ))}
              </select>
            </FormField>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Select Book Title / SKU" required>
              <select
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
                value={trfSku}
                onChange={(e) => setTrfSku(e.target.value)}
              >
                {stocks
                  .filter((s) => s.warehouseId === trfFrom)
                  .map((s) => (
                    <option key={s.id} value={s.sku}>
                      {s.title} (Avail: {s.available})
                    </option>
                  ))}
                {stocks.filter((s) => s.warehouseId === trfFrom).length === 0 && (
                  <option value="">No items available in source godown</option>
                )}
              </select>
            </FormField>

            <FormField label="Quantity to Transfer" required>
              <Input
                type="number"
                value={trfQty}
                onChange={(e) => setTrfQty(e.target.value)}
                placeholder="e.g. 100"
              />
            </FormField>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <FormField label="Logistics Transporter">
              <Input
                value={trfTransporter}
                onChange={(e) => setTrfTransporter(e.target.value)}
                placeholder="e.g. VRL Logistics"
              />
            </FormField>

            <FormField label="LR / Consignment Number">
              <Input
                value={trfLrNumber}
                onChange={(e) => setTrfLrNumber(e.target.value)}
                placeholder="e.g. VRL-LR-987410"
              />
            </FormField>

            <FormField label="Vehicle / Truck Number">
              <Input
                value={trfVehicleNumber}
                onChange={(e) => setTrfVehicleNumber(e.target.value)}
                placeholder="e.g. MH-04-AZ-4521"
              />
            </FormField>
          </div>

          <FormField label="Remarks / Dispatch Notes">
            <Input
              value={trfRemarks}
              onChange={(e) => setTrfRemarks(e.target.value)}
              placeholder="e.g. Seasonal book fair replenishment"
            />
          </FormField>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <Button variant="outline" size="sm" onClick={() => setTransferModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              style={{ backgroundColor: brand.primaryColor }}
              className="text-white hover:opacity-90"
              onClick={handleCreateTransfer}
            >
              Dispatch Inter-Godown Transfer
            </Button>
          </div>
        </div>
      </Modal>

      {/* ===================================================================== */}
      {/* MODAL 3: RECEIVE INTER-WAREHOUSE TRANSFER */}
      {/* ===================================================================== */}
      <Modal
        isOpen={receiveModalOpen}
        onClose={() => setReceiveModalOpen(false)}
        title={`Receive Consignment: ${selectedTransferToReceive?.transferNumber}`}
        maxWidth="md"
      >
        <div className="space-y-4">
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-1">
            <div>
              <span className="font-semibold text-slate-700">Book SKU:</span>{' '}
              {selectedTransferToReceive?.sku} - {selectedTransferToReceive?.title}
            </div>
            <div>
              <span className="font-semibold text-slate-700">Dispatched:</span>{' '}
              <span className="font-bold text-slate-900">
                {selectedTransferToReceive?.copiesDispatched} Copies
              </span>{' '}
              from {selectedTransferToReceive?.fromWarehouseName}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Sound Copies Received" required>
              <Input
                type="number"
                value={receiveGoodCopies}
                onChange={(e) => setReceiveGoodCopies(e.target.value)}
                placeholder="Good condition"
              />
            </FormField>

            <FormField label="Damaged in Cargo Transit">
              <Input
                type="number"
                value={receiveDamagedCopies}
                onChange={(e) => setReceiveDamagedCopies(e.target.value)}
                placeholder="0"
              />
            </FormField>
          </div>

          <FormField label="Receiver's Verification Remarks">
            <Input
              value={receiveNotes}
              onChange={(e) => setReceiveNotes(e.target.value)}
              placeholder="e.g. Carton seal intact, verified by storekeeper"
            />
          </FormField>

          <div className="p-2.5 bg-purple-50 text-purple-900 rounded-lg text-xs">
            Any transit damaged copies entered will automatically generate an adjustment entry and journal voucher in general ledger.
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <Button variant="outline" size="sm" onClick={() => setReceiveModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              style={{ backgroundColor: brand.primaryColor }}
              className="text-white hover:opacity-90"
              onClick={handleProcessReceiveTransfer}
            >
              Confirm Receipt into Godown
            </Button>
          </div>
        </div>
      </Modal>

      {/* ===================================================================== */}
      {/* MODAL 4: CYCLE COUNT PHYSICAL AUDIT */}
      {/* ===================================================================== */}
      <Modal
        isOpen={auditModalOpen}
        onClose={() => setAuditModalOpen(false)}
        title="Schedule & Record Physical Stocktaking Session"
        maxWidth="2xl"
      >
        <div className="space-y-4">
          <div className="flex justify-between items-center text-xs text-slate-600 pb-2 border-b border-slate-100">
            <div>
              <span className="font-medium text-slate-800">Target Warehouse:</span>{' '}
              {warehouses[0]?.name}
            </div>
            <div>
              <span className="font-medium text-slate-800">Date:</span>{' '}
              {new Date().toISOString().slice(0, 10)}
            </div>
          </div>

          <div className="max-h-72 overflow-y-auto space-y-3">
            {auditLines.map((line, idx) => (
              <div
                key={idx}
                className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex flex-col sm:flex-row justify-between items-center gap-3 text-xs"
              >
                <div className="w-full sm:w-1/2">
                  <div className="font-semibold text-slate-900">{line.title}</div>
                  <div className="text-slate-500 font-mono">
                    SKU: {line.sku} | System: {line.systemBookQty}
                  </div>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <div>
                    <label className="text-[10px] text-slate-500 block">Physical Count</label>
                    <input
                      type="number"
                      value={line.physicalCountQty}
                      onChange={(e) =>
                        handleUpdateAuditLinePhysical(idx, parseInt(e.target.value) || 0)
                      }
                      className="w-24 px-2 py-1 border border-slate-300 rounded font-mono text-center font-bold"
                    />
                  </div>

                  <div className="w-20 text-right">
                    <span
                      className={`font-mono font-bold ${
                        line.varianceQty === 0
                          ? 'text-emerald-600'
                          : line.varianceQty < 0
                          ? 'text-rose-600'
                          : 'text-amber-600'
                      }`}
                    >
                      {line.varianceQty > 0 ? `+${line.varianceQty}` : line.varianceQty}
                    </span>
                    <div className="text-[10px] text-slate-400">{line.status}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <Button variant="outline" size="sm" onClick={() => setAuditModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              style={{ backgroundColor: brand.primaryColor }}
              className="text-white hover:opacity-90"
              onClick={handleSaveAuditSession}
            >
              Save Audit Results
            </Button>
          </div>
        </div>
      </Modal>

      {/* ===================================================================== */}
      {/* MODAL 5: STOCK ADJUSTMENT & WRITE-OFF */}
      {/* ===================================================================== */}
      <Modal
        isOpen={adjModalOpen}
        onClose={() => setAdjModalOpen(false)}
        title="Post Stock Adjustment & General Ledger Reversal"
        maxWidth="lg"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Depot Location" required>
              <select
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
                value={adjWarehouseId}
                onChange={(e) => setAdjWarehouseId(e.target.value)}
              >
                {warehouses.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name} ({w.city})
                  </option>
                ))}
              </select>
            </FormField>

            <FormField label="Adjustment Category" required>
              <select
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
                value={adjType}
                onChange={(e) => setAdjType(e.target.value as any)}
              >
                <option value="DAMAGE_WRITEOFF">Damage Write-Off (Transit/Water/Pulp)</option>
                <option value="CYCLE_COUNT_RECONCILIATION">Physical Cycle Count Reconciliation</option>
                <option value="SHRINKAGE_LOST">Pilferage & Shrinkage Loss</option>
                <option value="OBSOLETE_EXPIRED">Obsolete / Outdated Syllabus Edition</option>
                <option value="SURPLUS_FOUND">Surplus Stock Found</option>
              </select>
            </FormField>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Select Book SKU" required>
              <select
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
                value={adjSku}
                onChange={(e) => {
                  setAdjSku(e.target.value);
                  const st = stocks.find(
                    (s) => s.sku === e.target.value && s.warehouseId === adjWarehouseId
                  );
                  if (st) {
                    setAdjPhysicalQty(String(st.onHand - 5));
                  }
                }}
              >
                {stocks
                  .filter((s) => !adjWarehouseId || s.warehouseId === adjWarehouseId)
                  .map((s) => (
                    <option key={s.id} value={s.sku}>
                      {s.title} ({s.sku}) - On Hand: {s.onHand}
                    </option>
                  ))}
              </select>
            </FormField>

            <FormField label="New Physical Count (or Resulting Balance)" required>
              <Input
                type="number"
                value={adjPhysicalQty}
                onChange={(e) => setAdjPhysicalQty(e.target.value)}
                placeholder="e.g. 5545"
              />
            </FormField>
          </div>

          <FormField label="Adjustment Justification / Reason" required>
            <Input
              value={adjReason}
              onChange={(e) => setAdjReason(e.target.value)}
              placeholder="e.g. Water damage during depot roof leak"
            />
          </FormField>

          <div className="p-3 bg-purple-50 text-purple-950 rounded-lg text-xs font-medium">
            Note: Posting this adjustment directly updates warehouse inventory, records movement in the bin card, and posts a balanced General Ledger journal entry (JV) debiting Loss on Damaged Stock and crediting Finished Inventory.
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <Button variant="outline" size="sm" onClick={() => setAdjModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              style={{ backgroundColor: brand.primaryColor }}
              className="text-white hover:opacity-90"
              onClick={handleCreateAdjustment}
            >
              Post Adjustment Voucher
            </Button>
          </div>
        </div>
      </Modal>

      {/* ===================================================================== */}
      {/* MODAL 6: WAREHOUSE GODOWNS MASTER */}
      {/* ===================================================================== */}
      <Modal
        isOpen={warehouseModalOpen}
        onClose={() => setWarehouseModalOpen(false)}
        title={editingWarehouse ? 'Edit Warehouse Depot' : 'Add New Warehouse Godown'}
        maxWidth="lg"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Depot Name" required>
              <Input
                value={whName}
                onChange={(e) => setWhName(e.target.value)}
                placeholder="e.g. Eastern Zonal Hub (Kolkata)"
              />
            </FormField>

            <FormField label="Depot Type" required>
              <select
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
                value={whType}
                onChange={(e) => setWhType(e.target.value as any)}
              >
                <option value="CENTRAL_DEPOT">Central Depot (HQ)</option>
                <option value="BRANCH_GODOWN">Branch Regional Godown</option>
                <option value="RETAIL_OUTLET">Retail Bookstore Outlet</option>
                <option value="DAMAGED_HOLD">Quarantine / Damaged Hold</option>
                <option value="TRANSIT_HUB">Transit Logistics Hub</option>
              </select>
            </FormField>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <FormField label="City" required>
              <Input
                value={whCity}
                onChange={(e) => setWhCity(e.target.value)}
                placeholder="e.g. Kolkata"
              />
            </FormField>

            <FormField label="State" required>
              <Input
                value={whState}
                onChange={(e) => setWhState(e.target.value)}
                placeholder="e.g. West Bengal"
              />
            </FormField>

            <FormField label="Pincode">
              <Input
                value={whPincode}
                onChange={(e) => setWhPincode(e.target.value)}
                placeholder="e.g. 700001"
              />
            </FormField>
          </div>

          <FormField label="Complete Postal Address">
            <Input
              value={whAddress}
              onChange={(e) => setWhAddress(e.target.value)}
              placeholder="e.g. College Street Logistics Warehouse Complex"
            />
          </FormField>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Manager Name">
              <Input
                value={whManager}
                onChange={(e) => setWhManager(e.target.value)}
                placeholder="e.g. Pradip Roy"
              />
            </FormField>

            <FormField label="Contact Phone">
              <Input
                value={whPhone}
                onChange={(e) => setWhPhone(e.target.value)}
                placeholder="+91 98000 00000"
              />
            </FormField>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Total Storage Capacity (Sq. Ft.)">
              <Input
                type="number"
                value={whCapacity}
                onChange={(e) => setWhCapacity(e.target.value)}
                placeholder="e.g. 25000"
              />
            </FormField>

            <FormField label="Estimated Utilization (%)">
              <Input
                type="number"
                value={whUtilization}
                onChange={(e) => setWhUtilization(e.target.value)}
                placeholder="e.g. 65"
              />
            </FormField>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <Button variant="outline" size="sm" onClick={() => setWarehouseModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              style={{ backgroundColor: brand.primaryColor }}
              className="text-white hover:opacity-90"
              onClick={handleSaveWarehouse}
            >
              {editingWarehouse ? 'Save Changes' : 'Create Warehouse Depot'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* ===================================================================== */}
      {/* DRAWER: BIN CARD STOCK LEDGER */}
      {/* ===================================================================== */}
      <Drawer
        isOpen={ledgerDrawerOpen}
        onClose={() => setLedgerDrawerOpen(false)}
        title={`Bin Card Stock Ledger: ${selectedLedgerSku}`}
        width="lg"
      >
        <div className="space-y-4 p-4">
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex justify-between items-center text-xs">
            <div>
              <span className="font-semibold text-slate-700">SKU:</span> {selectedLedgerSku}
            </div>
            <div>
              <span className="font-semibold text-slate-700">Current Balance:</span>{' '}
              <span className="font-bold font-mono text-emerald-600">
                {stocks
                  .filter((s) => s.sku === selectedLedgerSku)
                  .reduce((acc, s) => acc + s.onHand, 0)
                  .toLocaleString('en-IN')}{' '}
                Copies
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-600 uppercase border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Warehouse</th>
                  <th className="py-2.5 px-3">Type</th>
                  <th className="py-2.5 px-3">Ref</th>
                  <th className="py-2.5 px-2 text-right">In (+)</th>
                  <th className="py-2.5 px-2 text-right">Out (-)</th>
                  <th className="py-2.5 px-3 text-right">Bal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {movements
                  .filter((m) => m.sku === selectedLedgerSku)
                  .map((m) => (
                    <tr key={m.id} className="hover:bg-slate-50">
                      <td className="py-2.5 px-3 text-slate-600">{m.date}</td>
                      <td className="py-2.5 px-3 text-slate-700 font-medium">{m.wh}</td>
                      <td className="py-2.5 px-3 text-slate-700">{m.type.replace(/_/g, ' ')}</td>
                      <td
                        className="py-2.5 px-3 font-mono font-medium"
                        style={{ color: brand.primaryColor }}
                      >
                        {m.ref}
                      </td>
                      <td className="py-2.5 px-2 text-right font-mono text-emerald-600 font-semibold">
                        {m.in > 0 ? `+${m.in}` : '-'}
                      </td>
                      <td className="py-2.5 px-2 text-right font-mono text-rose-600 font-semibold">
                        {m.out > 0 ? `-${m.out}` : '-'}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                        {m.bal}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      </Drawer>
    </div>
  );
};
