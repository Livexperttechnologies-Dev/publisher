import React, { useState, useMemo, useEffect } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { FormField } from '../components/ui/FormField';
import { Input } from '../components/ui/Input';
import { PageHeader } from '../components/ui/PageHeader';
import { useBrand } from '../contexts/BrandContext';
import {
  Printer,
  Plus,
  BookOpen,
  Layers,
  FileText,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Calculator,
  Search,
  ExternalLink,
  RotateCcw,
  Sparkles,
  Percent,
  TrendingDown,
  TrendingUp,
  Tag,
  Factory,
  Scissors,
  BookmarkCheck,
  ShieldCheck,
  Sliders,
  DollarSign,
  ArrowRight,
  ClipboardList,
  Download,
  Edit2,
  Trash2,
  Check,
  X,
} from 'lucide-react';
import {
  PublishingProject,
  ProductionOrder,
  VendorJobOrder,
  QualityInspection,
  getStoredProjects,
  saveProjectItem,
  deleteProjectItem,
  getStoredOrders,
  saveOrderItem,
  deleteOrderItem,
  getStoredJobs,
  saveJobItem,
  deleteJobItem,
  getStoredInspections,
  saveInspectionItem,
  deleteInspectionItem,
  resetPublishingToDefaults,
} from '../services/publishingService';
import { getStoredBooks } from '../services/catalogueService';
import { exportToCsv } from '../services/accountingService';

export const PublishingPage: React.FC = () => {
  const { brand } = useBrand();

  const [activeTab, setActiveTab] = useState<'projects' | 'orders' | 'calculator' | 'jobs' | 'qa' | 'costing'>('projects');
  const [searchTerm, setSearchTerm] = useState('');

  // Persistent States
  const [projects, setProjects] = useState<PublishingProject[]>([]);
  const [orders, setOrders] = useState<ProductionOrder[]>([]);
  const [jobs, setJobs] = useState<VendorJobOrder[]>([]);
  const [inspections, setInspections] = useState<QualityInspection[]>([]);

  // Catalogue Books for Title Selection
  const [catalogueBooks, setCatalogueBooks] = useState<Array<{ id: string; title: string; sku: string; authorName: string; mrp: number }>>([]);

  // Load Data on Mount
  useEffect(() => {
    refreshAllData();
  }, []);

  const refreshAllData = () => {
    setProjects(getStoredProjects());
    setOrders(getStoredOrders());
    setJobs(getStoredJobs());
    setInspections(getStoredInspections());
    const books = getStoredBooks();
    setCatalogueBooks(books.map((b) => ({ id: b.id, title: b.title, sku: b.sku, authorName: b.authorName, mrp: b.mrp })));
  };

  // --------------------------------------------------------------------------
  // Interactive BOM Calculator State
  // --------------------------------------------------------------------------
  const [calcPages, setCalcPages] = useState<number>(448);
  const [calcPrintRun, setCalcPrintRun] = useState<number>(3000);
  const [calcGsm, setCalcGsm] = useState<number>(70);
  const [calcColors, setCalcColors] = useState<number>(1);
  const [calcPaperRate, setCalcPaperRate] = useState<number>(1150); // ₹ per ream
  const [calcPlateRate, setCalcPlateRate] = useState<number>(850); // ₹ per CTP plate

  // Live Formula Calculations
  const calcForms = Math.ceil(calcPages / 16);
  const calcNetReams = (calcForms * calcPrintRun) / 500;
  const calcGrossReams = Number((calcNetReams * 1.05).toFixed(2));
  const calcPlatesCount = calcForms * calcColors;
  const calcPaperCost = Number((calcGrossReams * calcPaperRate).toFixed(2));
  const calcPlatesCost = Number((calcPlatesCount * calcPlateRate).toFixed(2));
  const calcEstPerCopyMaterialCost = calcPrintRun > 0 ? Number(((calcPaperCost + calcPlatesCost) / calcPrintRun).toFixed(2)) : 0;

  // --------------------------------------------------------------------------
  // Modal States
  // --------------------------------------------------------------------------
  // Project Modal
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [projectForm, setProjectForm] = useState<Partial<PublishingProject>>({
    title: '',
    subtitle: '',
    language: 'English',
    edition: '1st Edition',
    category: 'Higher Mathematics',
    authorName: '',
    editorName: 'Senior Production Editor',
    plannedPrintRun: 3000,
    targetMrp: 495.0,
    estimatedPages: 448,
    notes: '',
    status: 'EDITORIAL_REVIEW',
  });

  // Production Order Modal
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [editingOrderId, setEditingOrderId] = useState<string | null>(null);
  const [orderForm, setOrderForm] = useState<Partial<ProductionOrder>>({
    sku: '',
    title: '',
    edition: '1st Edition',
    printRun: 3000,
    pagesCount: 448,
    sheetSize: '23x36 inches',
    paperGsm: 70,
    paperType: 'Maplitho Natural Shade 70 GSM',
    coverGsm: 300,
    coverFinishing: 'Thermal Matte Lamination + Spot UV',
    bindingType: 'Section Sewn & Perfect Bound',
    pressVendorName: 'Thomson Press India Ltd.',
    bindingVendorName: 'Replika Press & Automated Bindery Ltd.',
    standardCostPerCopy: 160.0,
    status: 'PLANNING',
  });

  // Vendor Job Modal
  const [isJobModalOpen, setIsJobModalOpen] = useState(false);
  const [editingJobId, setEditingJobId] = useState<string | null>(null);
  const [jobForm, setJobForm] = useState<Partial<VendorJobOrder>>({
    productionOrderId: '',
    jobType: 'PRINTING',
    vendorName: 'Thomson Press India Ltd.',
    orderDate: new Date().toISOString().slice(0, 10),
    jobWorkRate: 35.0,
    itemsDeliveredCount: 3000,
    vendorInvoiceNumber: '',
    status: 'ISSUED',
  });

  // QA Inspection Modal
  const [isQaModalOpen, setIsQaModalOpen] = useState(false);
  const [editingQaId, setEditingQaId] = useState<string | null>(null);
  const [qaForm, setQaForm] = useState<Partial<QualityInspection>>({
    productionOrderId: '',
    inspectedBy: 'Chief Quality Inspector',
    inspectionDate: new Date().toISOString().slice(0, 10),
    sampleSize: 100,
    approvedCopies: 2950,
    rejectedCopies: 50,
    printRegistrationPass: true,
    inkDensityPass: true,
    bindingAdhesionPass: true,
    pageSequencePass: true,
    trimmingPass: true,
    overallStatus: 'PASSED',
    remarks: '',
  });

  // Capitalize Order Modal
  const [isCapitalizeModalOpen, setIsCapitalizeModalOpen] = useState(false);
  const [orderToCapitalize, setOrderToCapitalize] = useState<ProductionOrder | null>(null);
  const [goodCopiesInput, setGoodCopiesInput] = useState<number>(0);
  const [rejectedCopiesInput, setRejectedCopiesInput] = useState<number>(0);

  // --------------------------------------------------------------------------
  // Handlers: Projects
  // --------------------------------------------------------------------------
  const handleOpenCreateProject = () => {
    setEditingProjectId(null);
    setProjectForm({
      title: '',
      subtitle: '',
      language: 'English',
      edition: '1st Edition',
      category: 'Higher Mathematics',
      authorName: '',
      editorName: 'Senior Production Editor',
      plannedPrintRun: 3000,
      targetMrp: 495.0,
      estimatedPages: 448,
      notes: '',
      status: 'EDITORIAL_REVIEW',
    });
    setIsProjectModalOpen(true);
  };

  const handleOpenEditProject = (p: PublishingProject) => {
    setEditingProjectId(p.id);
    setProjectForm({ ...p });
    setIsProjectModalOpen(true);
  };

  const handleSaveProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectForm.title?.trim() || !projectForm.authorName?.trim()) {
      alert('Book Title and Author Name are required.');
      return;
    }

    saveProjectItem({
      ...(editingProjectId ? { id: editingProjectId } : {}),
      title: projectForm.title.trim(),
      subtitle: projectForm.subtitle?.trim(),
      language: projectForm.language || 'English',
      edition: projectForm.edition || '1st Edition',
      category: projectForm.category || 'Academic',
      authorName: projectForm.authorName.trim(),
      editorName: projectForm.editorName || 'Senior Production Editor',
      isbnAllocated: projectForm.isbnAllocated?.trim(),
      plannedPrintRun: Number(projectForm.plannedPrintRun) || 3000,
      targetMrp: Number(projectForm.targetMrp) || 495,
      estimatedPages: Number(projectForm.estimatedPages) || 400,
      notes: projectForm.notes?.trim(),
      status: projectForm.status || 'EDITORIAL_REVIEW',
    });

    setIsProjectModalOpen(false);
    refreshAllData();
  };

  const handleDeleteProject = (p: PublishingProject) => {
    if (window.confirm(`Delete publishing project "${p.title}"?`)) {
      deleteProjectItem(p.id);
      refreshAllData();
    }
  };

  // --------------------------------------------------------------------------
  // Handlers: Orders
  // --------------------------------------------------------------------------
  const handleOpenCreateOrder = (prefill?: Partial<ProductionOrder>) => {
    setEditingOrderId(null);
    setOrderForm({
      sku: prefill?.sku || (catalogueBooks[0]?.sku ?? 'BK-MATH-01'),
      title: prefill?.title || (catalogueBooks[0]?.title ?? 'Mathematics Complete Guide'),
      edition: prefill?.edition || '1st Edition',
      printRun: prefill?.printRun || 3000,
      pagesCount: prefill?.pagesCount || 448,
      sheetSize: prefill?.sheetSize || '23x36 inches',
      paperGsm: prefill?.paperGsm || 70,
      paperType: prefill?.paperType || 'Maplitho Natural Shade 70 GSM',
      coverGsm: prefill?.coverGsm || 300,
      coverFinishing: prefill?.coverFinishing || 'Thermal Matte Lamination + Spot UV',
      bindingType: prefill?.bindingType || 'Section Sewn & Perfect Bound',
      pressVendorName: prefill?.pressVendorName || 'Thomson Press India Ltd.',
      bindingVendorName: prefill?.bindingVendorName || 'Replika Press & Automated Bindery Ltd.',
      standardCostPerCopy: prefill?.standardCostPerCopy || 160.0,
      status: 'PLANNING',
    });
    setIsOrderModalOpen(true);
  };

  const handleOpenEditOrder = (o: ProductionOrder) => {
    setEditingOrderId(o.id);
    setOrderForm({ ...o });
    setIsOrderModalOpen(true);
  };

  const handleSaveOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderForm.title?.trim() || !orderForm.sku?.trim()) {
      alert('Book Title and SKU are required.');
      return;
    }

    saveOrderItem({
      ...(editingOrderId ? { id: editingOrderId } : {}),
      sku: orderForm.sku.trim(),
      title: orderForm.title.trim(),
      edition: orderForm.edition || '1st Edition',
      printRun: Number(orderForm.printRun) || 3000,
      pagesCount: Number(orderForm.pagesCount) || 400,
      sheetSize: orderForm.sheetSize || '23x36 inches',
      paperGsm: Number(orderForm.paperGsm) || 70,
      paperType: orderForm.paperType || 'Maplitho Natural Shade 70 GSM',
      coverGsm: Number(orderForm.coverGsm) || 300,
      coverFinishing: orderForm.coverFinishing || 'Thermal Matte Lamination + Spot UV',
      bindingType: orderForm.bindingType || 'Section Sewn & Perfect Bound',
      pressVendorName: orderForm.pressVendorName || 'Thomson Press India Ltd.',
      bindingVendorName: orderForm.bindingVendorName || 'Replika Press Ltd.',
      standardCostPerCopy: Number(orderForm.standardCostPerCopy) || 160.0,
      status: orderForm.status || 'PLANNING',
    });

    setIsOrderModalOpen(false);
    refreshAllData();
  };

  const handleDeleteOrder = (o: ProductionOrder) => {
    if (window.confirm(`Delete production order "${o.orderNumber}"?`)) {
      deleteOrderItem(o.id);
      refreshAllData();
    }
  };

  const handleOpenCapitalizeModal = (o: ProductionOrder) => {
    setOrderToCapitalize(o);
    setGoodCopiesInput(o.goodCopiesProduced || Math.round(o.printRun * 0.99));
    setRejectedCopiesInput(o.rejectedCopiesCount || Math.round(o.printRun * 0.01));
    setIsCapitalizeModalOpen(true);
  };

  const handleExecuteCapitalization = () => {
    if (!orderToCapitalize) return;

    const good = Number(goodCopiesInput) || 0;
    const rejected = Number(rejectedCopiesInput) || 0;
    const totalCost = Number(orderToCapitalize.totalProductionCost) || (good * (orderToCapitalize.standardCostPerCopy || 160));
    const perCopy = good > 0 ? Number((totalCost / good).toFixed(2)) : orderToCapitalize.standardCostPerCopy;
    const voucherNumber = `JV/${new Date().getFullYear()}/${Math.floor(1000 + Math.random() * 9000)}`;

    saveOrderItem({
      ...orderToCapitalize,
      goodCopiesProduced: good,
      rejectedCopiesCount: rejected,
      totalProductionCost: totalCost,
      perCopyCost: perCopy,
      status: 'COMPLETED',
      voucherNumber,
      completedDate: new Date().toISOString().slice(0, 10),
    });

    setIsCapitalizeModalOpen(false);
    setOrderToCapitalize(null);
    refreshAllData();
    alert(`Order ${orderToCapitalize.orderNumber} capitalized to Inventory via ${voucherNumber}! ${good.toLocaleString()} copies added to stock.`);
  };

  // --------------------------------------------------------------------------
  // Handlers: Jobs
  // --------------------------------------------------------------------------
  const handleOpenCreateJob = () => {
    setEditingJobId(null);
    setJobForm({
      productionOrderId: orders[0]?.id || 'prod_01',
      jobType: 'PRINTING',
      vendorName: 'Thomson Press India Ltd.',
      orderDate: new Date().toISOString().slice(0, 10),
      jobWorkRate: 35.0,
      itemsDeliveredCount: 3000,
      vendorInvoiceNumber: `INV-${Math.floor(1000 + Math.random() * 9000)}`,
      status: 'ISSUED',
    });
    setIsJobModalOpen(true);
  };

  const handleSaveJob = (e: React.FormEvent) => {
    e.preventDefault();
    if (!jobForm.vendorName?.trim()) {
      alert('Vendor Name is required');
      return;
    }

    saveJobItem({
      ...(editingJobId ? { id: editingJobId } : {}),
      productionOrderId: jobForm.productionOrderId || orders[0]?.id || 'prod_01',
      jobType: jobForm.jobType || 'PRINTING',
      vendorName: jobForm.vendorName.trim(),
      orderDate: jobForm.orderDate || new Date().toISOString().slice(0, 10),
      jobWorkRate: Number(jobForm.jobWorkRate) || 0,
      itemsDeliveredCount: Number(jobForm.itemsDeliveredCount) || 0,
      totalJobCharges: (Number(jobForm.jobWorkRate) || 0) * (Number(jobForm.itemsDeliveredCount) || 0),
      vendorInvoiceNumber: jobForm.vendorInvoiceNumber?.trim(),
      status: jobForm.status || 'ISSUED',
    });

    setIsJobModalOpen(false);
    refreshAllData();
  };

  const handleDeleteJob = (j: VendorJobOrder) => {
    if (window.confirm(`Delete vendor job order "${j.jobOrderNumber}"?`)) {
      deleteJobItem(j.id);
      refreshAllData();
    }
  };

  // --------------------------------------------------------------------------
  // Handlers: QA Inspections
  // --------------------------------------------------------------------------
  const handleOpenCreateQa = () => {
    setEditingQaId(null);
    setQaForm({
      productionOrderId: orders[0]?.id || 'prod_01',
      inspectedBy: 'Chief Quality Inspector (BIS Standard)',
      inspectionDate: new Date().toISOString().slice(0, 10),
      sampleSize: 100,
      approvedCopies: 2950,
      rejectedCopies: 50,
      printRegistrationPass: true,
      inkDensityPass: true,
      bindingAdhesionPass: true,
      pageSequencePass: true,
      trimmingPass: true,
      overallStatus: 'PASSED',
      remarks: '5-point quality checklist verified against international print tolerances.',
    });
    setIsQaModalOpen(true);
  };

  const handleSaveQa = (e: React.FormEvent) => {
    e.preventDefault();
    if (!qaForm.inspectedBy?.trim()) {
      alert('Inspector Name is required');
      return;
    }

    saveInspectionItem({
      ...(editingQaId ? { id: editingQaId } : {}),
      productionOrderId: qaForm.productionOrderId || orders[0]?.id || 'prod_01',
      inspectedBy: qaForm.inspectedBy.trim(),
      inspectionDate: qaForm.inspectionDate || new Date().toISOString().slice(0, 10),
      sampleSize: Number(qaForm.sampleSize) || 100,
      approvedCopies: Number(qaForm.approvedCopies) || 0,
      rejectedCopies: Number(qaForm.rejectedCopies) || 0,
      printRegistrationPass: Boolean(qaForm.printRegistrationPass),
      inkDensityPass: Boolean(qaForm.inkDensityPass),
      bindingAdhesionPass: Boolean(qaForm.bindingAdhesionPass),
      pageSequencePass: Boolean(qaForm.pageSequencePass),
      trimmingPass: Boolean(qaForm.trimmingPass),
      overallStatus: qaForm.overallStatus || 'PASSED',
      remarks: qaForm.remarks?.trim(),
    });

    setIsQaModalOpen(false);
    refreshAllData();
  };

  const handleDeleteQa = (qa: QualityInspection) => {
    if (window.confirm(`Delete QA inspection record "${qa.inspectionNumber}"?`)) {
      deleteInspectionItem(qa.id);
      refreshAllData();
    }
  };

  // --------------------------------------------------------------------------
  // CSV Exports
  // --------------------------------------------------------------------------
  const handleExportCurrentTab = () => {
    if (activeTab === 'projects') {
      const headers = ['Project #', 'Title', 'Edition', 'Author', 'Editor', 'ISBN', 'Pages', 'Print Run', 'MRP', 'Status'];
      const rows = projects.map((p) => [
        p.projectNumber,
        p.title,
        p.edition,
        p.authorName,
        p.editorName,
        p.isbnAllocated || 'Pending',
        p.estimatedPages,
        p.plannedPrintRun,
        p.targetMrp,
        p.status,
      ]);
      exportToCsv('KIBO360_Publishing_Projects', headers, rows);
    } else if (activeTab === 'orders') {
      const headers = ['Order #', 'SKU', 'Title', 'Print Run', 'Good Copies', 'Paper GSM', 'Binding', 'Total Cost (INR)', 'Per Copy Cost (INR)', 'Status'];
      const rows = orders.map((o) => [
        o.orderNumber,
        o.sku,
        o.title,
        o.printRun,
        o.goodCopiesProduced,
        o.paperGsm,
        o.bindingType,
        o.totalProductionCost,
        o.perCopyCost,
        o.status,
      ]);
      exportToCsv('KIBO360_Production_Orders', headers, rows);
    } else if (activeTab === 'jobs') {
      const headers = ['Job Order #', 'Job Type', 'Vendor Partner', 'Delivered Copies', 'Rate (INR)', 'Total Charges (INR)', 'Status', 'GL Voucher'];
      const rows = jobs.map((j) => [
        j.jobOrderNumber,
        j.jobType,
        j.vendorName,
        j.itemsDeliveredCount,
        j.jobWorkRate,
        j.totalJobCharges,
        j.status,
        j.voucherNumber || 'Pending',
      ]);
      exportToCsv('KIBO360_Vendor_Job_Orders', headers, rows);
    } else if (activeTab === 'qa') {
      const headers = ['Inspection #', 'Inspector', 'Date', 'Sample Size', 'Approved Copies', 'Rejected Copies', 'Overall Status', 'Remarks'];
      const rows = inspections.map((q) => [
        q.inspectionNumber,
        q.inspectedBy,
        q.inspectionDate,
        q.sampleSize,
        q.approvedCopies,
        q.rejectedCopies,
        q.overallStatus,
        q.remarks || '',
      ]);
      exportToCsv('KIBO360_QA_Inspections', headers, rows);
    } else if (activeTab === 'costing') {
      const headers = ['Order #', 'SKU', 'Title', 'Planned Run', 'Good Copies', 'Standard Cost', 'Actual Cost', 'Variance / Copy', 'Total Variance', 'Status'];
      const rows = orders.map((o) => {
        const std = o.standardCostPerCopy || 160;
        const act = o.perCopyCost || std;
        const diff = act - std;
        const isFav = diff <= 0;
        return [
          o.orderNumber,
          o.sku,
          o.title,
          o.printRun,
          o.goodCopiesProduced,
          std,
          act,
          diff,
          diff * (o.goodCopiesProduced || o.printRun),
          isFav ? 'FAVORABLE' : 'UNFAVORABLE',
        ];
      });
      exportToCsv('KIBO360_Production_Cost_Variance', headers, rows);
    }
  };

  const handleResetDefaults = () => {
    if (window.confirm('Reset Publishing projects, orders, vendor jobs, and QA records to factory defaults?')) {
      resetPublishingToDefaults();
      refreshAllData();
      alert('Publishing and production records reset to factory defaults.');
    }
  };

  // --------------------------------------------------------------------------
  // KPI Aggregations
  // --------------------------------------------------------------------------
  const kpiData = useMemo(() => {
    let totalScheduledCopies = 0;
    let totalGoodProduced = 0;
    let totalCapitalizedValue = 0;
    let completedRunsCount = 0;
    let sumUnitCost = 0;

    orders.forEach((o) => {
      totalScheduledCopies += o.printRun;
      totalGoodProduced += o.goodCopiesProduced;
      totalCapitalizedValue += o.totalProductionCost;
      if (o.status === 'COMPLETED' && o.perCopyCost > 0) {
        sumUnitCost += o.perCopyCost;
        completedRunsCount++;
      }
    });

    const yieldPct = totalScheduledCopies > 0 ? (totalGoodProduced / totalScheduledCopies) * 100 : 0;
    const avgCostPerCopy = completedRunsCount > 0 ? sumUnitCost / completedRunsCount : 149.21;

    return {
      activeProjectsCount: projects.length,
      printRunsCount: orders.length,
      totalScheduledCopies,
      totalGoodProduced,
      yieldPct,
      avgCostPerCopy,
      totalCapitalizedValue,
    };
  }, [projects, orders]);

  // Filtered Projects
  const filteredProjects = useMemo(() => {
    return projects.filter(
      (p) =>
        p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.authorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.projectNumber.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [projects, searchTerm]);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <PageHeader
        title="Publishing & Book Production Hub"
        description="End-to-end publishing pipeline: editorial manuscript tracking, formula-based paper BOM, vendor job work, QA inspection & finished goods capitalization"
        breadcrumbs={[
          { label: 'Publishing Operations', href: '/' },
          { label: 'Publishing & Production' },
        ]}
        actions={
          <div className="flex items-center gap-2 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              onClick={handleResetDefaults}
              className="text-slate-600 hover:text-slate-900 border-slate-300"
              title="Reset publishing records to factory defaults"
            >
              <RotateCcw className="w-3.5 h-3.5 mr-1" />
              Reset Defaults
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportCurrentTab}
              className="text-slate-700 hover:text-slate-900 border-slate-300"
            >
              <Download className="w-3.5 h-3.5 mr-1" />
              Export CSV
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setActiveTab('calculator')}
              className="text-purple-700 border-purple-200 hover:bg-purple-50"
            >
              <Calculator className="w-3.5 h-3.5 mr-1.5" />
              Paper BOM Calculator
            </Button>
            <Button
              style={{ backgroundColor: brand.primaryColor }}
              className="text-white hover:opacity-90"
              size="sm"
              onClick={handleOpenCreateProject}
            >
              <Plus className="w-4 h-4 mr-1.5" />
              New Manuscript Project
            </Button>
          </div>
        }
      />

      {/* Dynamic KPI Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="p-4 border-l-4 border-l-purple-700 hover:shadow-md transition-shadow bg-white border border-slate-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Active Projects
            </span>
            <BookOpen className="w-5 h-5 text-purple-700" />
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900">{kpiData.activeProjectsCount} Titles</div>
          <div className="mt-1 text-xs text-emerald-700 font-semibold flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> Editorial In-Progress
          </div>
        </Card>

        <Card className="p-4 border-l-4 border-l-rose-500 hover:shadow-md transition-shadow bg-white border border-slate-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Production Runs
            </span>
            <Factory className="w-5 h-5 text-rose-500" />
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900">{kpiData.printRunsCount} Print Runs</div>
          <div className="mt-1 text-xs text-slate-500 font-mono font-medium">
            {kpiData.totalScheduledCopies.toLocaleString()} Copies Scheduled
          </div>
        </Card>

        <Card className="p-4 border-l-4 border-l-emerald-600 hover:shadow-md transition-shadow bg-white border border-slate-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Books Produced
            </span>
            <BookmarkCheck className="w-5 h-5 text-emerald-600" />
          </div>
          <div className="mt-2 text-2xl font-bold text-emerald-700">
            {kpiData.totalGoodProduced.toLocaleString()} Copies
          </div>
          <div className="mt-1 text-xs text-emerald-700 font-bold">
            {kpiData.yieldPct.toFixed(1)}% Realized Good Yield
          </div>
        </Card>

        <Card className="p-4 border-l-4 border-l-amber-600 hover:shadow-md transition-shadow bg-white border border-slate-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Avg Cost / Copy
            </span>
            <DollarSign className="w-5 h-5 text-amber-600" />
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900 font-mono">
            ₹{kpiData.avgCostPerCopy.toFixed(2)}
          </div>
          <div className="mt-1 text-xs text-emerald-600 font-semibold flex items-center gap-1">
            <TrendingDown className="w-3.5 h-3.5" /> Favorable Press Variance
          </div>
        </Card>

        <Card className="p-4 border-l-4 border-l-indigo-600 hover:shadow-md transition-shadow bg-white border border-slate-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Capitalized to GL
            </span>
            <ShieldCheck className="w-5 h-5 text-indigo-600" />
          </div>
          <div className="mt-2 text-2xl font-bold text-indigo-900 font-mono">
            ₹{kpiData.totalCapitalizedValue.toLocaleString('en-IN', { minimumFractionDigits: 0 })}
          </div>
          <div className="mt-1 text-xs text-indigo-700 font-semibold">Finished Goods Inwarded</div>
        </Card>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b border-slate-200 bg-white rounded-t-xl px-4 gap-2 overflow-x-auto shadow-sm">
        <button
          onClick={() => setActiveTab('projects')}
          className="flex items-center gap-2 py-3 px-4 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap"
          style={{
            borderColor: activeTab === 'projects' ? brand.primaryColor : 'transparent',
            color: activeTab === 'projects' ? brand.primaryColor : '#64748B',
          }}
        >
          <BookOpen className="w-4 h-4" />
          Publishing Projects ({projects.length})
        </button>

        <button
          onClick={() => setActiveTab('orders')}
          className="flex items-center gap-2 py-3 px-4 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap"
          style={{
            borderColor: activeTab === 'orders' ? brand.primaryColor : 'transparent',
            color: activeTab === 'orders' ? brand.primaryColor : '#64748B',
          }}
        >
          <Printer className="w-4 h-4" />
          Production Orders ({orders.length})
        </button>

        <button
          onClick={() => setActiveTab('calculator')}
          className="flex items-center gap-2 py-3 px-4 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap"
          style={{
            borderColor: activeTab === 'calculator' ? brand.primaryColor : 'transparent',
            color: activeTab === 'calculator' ? brand.primaryColor : '#64748B',
          }}
        >
          <Calculator className="w-4 h-4" />
          Paper BOM Calculator
        </button>

        <button
          onClick={() => setActiveTab('jobs')}
          className="flex items-center gap-2 py-3 px-4 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap"
          style={{
            borderColor: activeTab === 'jobs' ? brand.primaryColor : 'transparent',
            color: activeTab === 'jobs' ? brand.primaryColor : '#64748B',
          }}
        >
          <Factory className="w-4 h-4" />
          Vendor Job Work ({jobs.length})
        </button>

        <button
          onClick={() => setActiveTab('qa')}
          className="flex items-center gap-2 py-3 px-4 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap"
          style={{
            borderColor: activeTab === 'qa' ? brand.primaryColor : 'transparent',
            color: activeTab === 'qa' ? brand.primaryColor : '#64748B',
          }}
        >
          <CheckCircle2 className="w-4 h-4" />
          Quality Control QA ({inspections.length})
        </button>

        <button
          onClick={() => setActiveTab('costing')}
          className="flex items-center gap-2 py-3 px-4 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap"
          style={{
            borderColor: activeTab === 'costing' ? brand.primaryColor : 'transparent',
            color: activeTab === 'costing' ? brand.primaryColor : '#64748B',
          }}
        >
          <TrendingUp className="w-4 h-4" />
          Cost Sheet & Variance Analytics
        </button>
      </div>

      {/* =====================================================================
          TAB 1: PUBLISHING PROJECTS & EDITORIAL PIPELINE
          ===================================================================== */}
      {activeTab === 'projects' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search by title, author, or project #..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-200"
              />
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Button
                style={{ backgroundColor: brand.primaryColor }}
                className="text-white hover:opacity-90"
                size="sm"
                onClick={handleOpenCreateProject}
              >
                <Plus className="w-4 h-4 mr-1.5" />
                Add Manuscript Project
              </Button>
            </div>
          </div>

          <Card className="overflow-hidden border border-slate-200 bg-white shadow-sm p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-600 uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Project #</th>
                    <th className="py-3 px-4">Title & Edition</th>
                    <th className="py-3 px-4">Author & Editor</th>
                    <th className="py-3 px-4">Allocated ISBN</th>
                    <th className="py-3 px-4 text-center">Pages / Run</th>
                    <th className="py-3 px-4 text-center">Milestone Status</th>
                    <th className="py-3 px-4 text-right">Target MRP</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredProjects.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-purple-700">
                        {p.projectNumber}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{p.title}</div>
                        {p.subtitle && (
                          <div className="text-xs text-slate-500 italic">{p.subtitle}</div>
                        )}
                        <span className="inline-block text-[11px] bg-purple-50 text-purple-800 px-2 py-0.5 rounded font-medium mt-1 border border-purple-200">
                          {p.edition} • {p.language}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-medium text-slate-800">{p.authorName}</div>
                        <div className="text-xs text-slate-400">Ed: {p.editorName}</div>
                      </td>
                      <td className="py-3 px-4">
                        {p.isbnAllocated ? (
                          <span className="font-mono text-xs font-medium text-slate-700 bg-slate-100 px-2 py-1 rounded border border-slate-200">
                            {p.isbnAllocated}
                          </span>
                        ) : (
                          <span className="text-xs text-amber-600 font-medium">Pending Pool</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="font-medium text-slate-800">{p.estimatedPages} pp</div>
                        <div className="text-xs text-slate-500">{p.plannedPrintRun.toLocaleString()} copies</div>
                      </td>
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <Badge
                          variant={
                            p.status === 'PUBLISHED'
                              ? 'success'
                              : p.status === 'PRINT_PRODUCTION'
                              ? 'magenta'
                              : p.status === 'TYPESETTING_PROOF'
                              ? 'purple'
                              : 'slate'
                          }
                        >
                          {p.status.replace(/_/g, ' ')}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                        ₹{p.targetMrp.toFixed(2)}
                      </td>
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-purple-700 hover:text-purple-900 hover:bg-purple-50 px-2"
                            onClick={() => {
                              handleOpenCreateOrder({
                                title: p.title,
                                edition: p.edition,
                                pagesCount: p.estimatedPages,
                                printRun: p.plannedPrintRun,
                                sku: `BK-${p.title.substring(0, 3).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`,
                              });
                            }}
                            title="Launch Print Run"
                          >
                            <Printer className="w-3.5 h-3.5 mr-1" />
                            Launch Run
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-slate-600 hover:text-slate-900 p-1"
                            onClick={() => handleOpenEditProject(p)}
                            title="Edit Project Details"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-rose-600 hover:text-rose-800 p-1"
                            onClick={() => handleDeleteProject(p)}
                            title="Delete Project"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
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
          TAB 2: PRODUCTION ORDERS & PRINT RUNS
          ===================================================================== */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="text-sm text-slate-600">
              Showing <strong className="text-slate-900">{orders.length}</strong> production print runs across industrial press and bindery vendors.
            </div>
            <Button
              style={{ backgroundColor: brand.primaryColor }}
              className="text-white hover:opacity-90"
              size="sm"
              onClick={() => handleOpenCreateOrder()}
            >
              <Plus className="w-4 h-4 mr-1.5" />
              New Production Order
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {orders.map((o) => (
              <Card key={o.id} className="p-5 border border-slate-200 bg-white shadow-sm hover:shadow-md transition-shadow">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center shrink-0 border border-purple-200">
                      <Printer className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-sm font-bold text-purple-700">{o.orderNumber}</span>
                        <Badge
                          variant={
                            o.status === 'COMPLETED'
                              ? 'success'
                              : o.status === 'MATERIAL_ISSUED'
                              ? 'magenta'
                              : 'purple'
                          }
                        >
                          {o.status.replace(/_/g, ' ')}
                        </Badge>
                        <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-mono">
                          SKU: {o.sku}
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-slate-900 mt-1">{o.title}</h3>
                      <div className="text-xs text-slate-500 mt-0.5">
                        {o.edition} • {o.bindingType} • {o.sheetSize} Sheet
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-6">
                    <div className="text-right">
                      <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">Print Run</div>
                      <div className="text-lg font-bold text-slate-800">
                        {o.printRun.toLocaleString()} <span className="text-xs font-normal text-slate-500">ordered</span>
                      </div>
                      {o.goodCopiesProduced > 0 && (
                        <div className="text-xs text-emerald-600 font-semibold">{o.goodCopiesProduced.toLocaleString()} good copies</div>
                      )}
                    </div>

                    <div className="text-right">
                      <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Production Cost</div>
                      <div className="text-lg font-bold font-mono text-slate-900">
                        ₹{o.totalProductionCost.toLocaleString('en-IN', { minimumFractionDigits: 0 })}
                      </div>
                      {o.perCopyCost > 0 && (
                        <div className="text-xs font-bold text-purple-700 font-mono">₹{o.perCopyCost.toFixed(2)} / copy</div>
                      )}
                    </div>

                    <div className="text-right flex flex-col items-end gap-1">
                      {o.voucherNumber ? (
                        <div>
                          <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">GL Capitalization</div>
                          <span className="font-mono text-xs font-bold bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded border border-indigo-200 inline-block">
                            {o.voucherNumber}
                          </span>
                        </div>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenCapitalizeModal(o)}
                          className="text-emerald-700 border-emerald-300 hover:bg-emerald-50 text-xs py-1"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                          Complete & Capitalize
                        </Button>
                      )}
                      <div className="flex gap-1 pt-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="p-1 text-slate-400 hover:text-slate-700"
                          onClick={() => handleOpenEditOrder(o)}
                          title="Edit Production Order"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="p-1 text-slate-400 hover:text-rose-600"
                          onClick={() => handleDeleteOrder(o)}
                          title="Delete Order"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Technical Specifications Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 mt-4 text-xs bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <div>
                    <span className="text-slate-400 block">Pages Count</span>
                    <span className="font-semibold text-slate-700">{o.pagesCount} pages</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Calculated Forms</span>
                    <span className="font-semibold text-slate-700">{o.formsCount} forms (16 pp)</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Paper Reams (+5%)</span>
                    <span className="font-semibold text-purple-700 font-mono">{o.reamsRequired} reams</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">CTP Plates</span>
                    <span className="font-semibold text-slate-700">{o.platesRequired} plates</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Paper Specs</span>
                    <span className="font-semibold text-slate-700">{o.paperGsm} GSM Maplitho</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Cover Board</span>
                    <span className="font-semibold text-slate-700">{o.coverGsm} GSM + Lamination</span>
                  </div>
                </div>

                {/* Vendors Allocated */}
                <div className="mt-3 flex flex-wrap items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
                  <div className="flex items-center gap-4">
                    <span><strong>Press:</strong> {o.pressVendorName || 'Thomson Press India Ltd.'}</span>
                    <span><strong>Bindery:</strong> {o.bindingVendorName || 'Replika Press Ltd.'}</span>
                  </div>
                  <div className="text-emerald-700 font-medium">
                    {o.completedDate ? `Inwarded to Central Depot on ${o.completedDate}` : 'Under Execution'}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* =====================================================================
          TAB 3: INTERACTIVE PAPER MATERIAL BOM CALCULATOR
          ===================================================================== */}
      {activeTab === 'calculator' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-1 p-5 border border-slate-200 bg-white shadow-sm space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <Calculator className="w-5 h-5 text-purple-700" />
              <h3 className="font-bold text-slate-800">Print Run & Paper Inputs</h3>
            </div>

            <FormField label="Total Page Count (including prelims & index)">
              <Input
                type="number"
                value={calcPages}
                onChange={(e) => setCalcPages(Number(e.target.value))}
                min={16}
                step={16}
              />
            </FormField>

            <FormField label="Planned Print Run (Number of Copies)">
              <Input
                type="number"
                value={calcPrintRun}
                onChange={(e) => setCalcPrintRun(Number(e.target.value))}
                min={100}
                step={500}
              />
            </FormField>

            <FormField label="Paper GSM (Grams / sq meter)">
              <select
                value={calcGsm}
                onChange={(e) => setCalcGsm(Number(e.target.value))}
                className="w-full text-sm border border-slate-200 rounded-lg p-2 bg-white focus:ring-2 focus:ring-purple-200"
              >
                <option value={60}>60 GSM Cream Wove</option>
                <option value={70}>70 GSM Maplitho Natural Shade (Standard)</option>
                <option value={80}>80 GSM Super Print Maplitho</option>
                <option value={90}>90 GSM Matt Coated Art Paper</option>
                <option value={100}>100 GSM Gloss Art Paper</option>
              </select>
            </FormField>

            <FormField label="Color Process / Form">
              <select
                value={calcColors}
                onChange={(e) => setCalcColors(Number(e.target.value))}
                className="w-full text-sm border border-slate-200 rounded-lg p-2 bg-white focus:ring-2 focus:ring-purple-200"
              >
                <option value={1}>1 Color Monochrome Text (1 Plate / Form)</option>
                <option value={2}>2 Color Spot Color (2 Plates / Form)</option>
                <option value={4}>4 Color CMYK Full Process (4 Plates / Form)</option>
              </select>
            </FormField>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <FormField label="Paper Rate (₹/Ream)">
                <Input
                  type="number"
                  value={calcPaperRate}
                  onChange={(e) => setCalcPaperRate(Number(e.target.value))}
                />
              </FormField>
              <FormField label="Plate Rate (₹/Plate)">
                <Input
                  type="number"
                  value={calcPlateRate}
                  onChange={(e) => setCalcPlateRate(Number(e.target.value))}
                />
              </FormField>
            </div>
          </Card>

          <Card className="lg:col-span-2 p-6 border border-slate-200 bg-gradient-to-br from-white to-purple-50/30 shadow-sm space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-700" />
                <h3 className="font-bold text-slate-800 text-lg">Calculated Bill of Materials (BOM)</h3>
              </div>
              <Badge variant="purple">Formula-Verified</Badge>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <span className="text-xs font-semibold text-slate-400 uppercase">Book Signatures</span>
                <div className="text-3xl font-extrabold text-slate-800 mt-1">{calcForms}</div>
                <div className="text-xs text-slate-500 mt-1">Forms of 16 pages each</div>
              </div>

              <div className="bg-white p-4 rounded-xl border border-purple-200 shadow-sm">
                <span className="text-xs font-semibold text-purple-700 uppercase">Paper Required (+5%)</span>
                <div className="text-3xl font-extrabold text-purple-700 mt-1 font-mono">{calcGrossReams}</div>
                <div className="text-xs text-slate-500 mt-1">Reams ({calcNetReams.toFixed(1)} net + 5% waste)</div>
              </div>

              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <span className="text-xs font-semibold text-slate-400 uppercase">CTP Offset Plates</span>
                <div className="text-3xl font-extrabold text-indigo-700 mt-1 font-mono">{calcPlatesCount}</div>
                <div className="text-xs text-slate-500 mt-1">Plates required for press</div>
              </div>
            </div>

            {/* Financial Cost Estimate Summary */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3">
              <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                Raw Material Cost Estimation Preview
              </h4>
              <div className="flex justify-between text-sm py-1 border-b border-slate-100">
                <span className="text-slate-600">Text Paper ({calcGrossReams} reams @ ₹{calcPaperRate}/ream):</span>
                <span className="font-semibold text-slate-800 font-mono">₹{calcPaperCost.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm py-1 border-b border-slate-100">
                <span className="text-slate-600">CTP Aluminium Plates ({calcPlatesCount} plates @ ₹{calcPlateRate}/plate):</span>
                <span className="font-semibold text-slate-800 font-mono">₹{calcPlatesCost.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm py-2 font-bold text-slate-900 border-t border-slate-200">
                <span>Total Raw Material Cost:</span>
                <span className="text-purple-700 text-base font-mono">
                  ₹{(calcPaperCost + calcPlatesCost).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center pt-2">
                <div className="text-xs text-slate-500">
                  Material Cost Per Copy: <strong className="text-emerald-700 text-sm font-mono">₹{calcEstPerCopyMaterialCost}</strong> / book
                </div>
                <Button
                  style={{ backgroundColor: brand.primaryColor }}
                  className="text-white hover:opacity-90"
                  size="sm"
                  onClick={() => {
                    handleOpenCreateOrder({
                      pagesCount: calcPages,
                      printRun: calcPrintRun,
                      paperGsm: calcGsm,
                    });
                  }}
                >
                  Create Order from BOM
                </Button>
              </div>
            </div>

            {/* Formula Explainer Alert */}
            <div className="p-3 bg-purple-50 text-purple-900 rounded-lg text-xs leading-relaxed border border-purple-200">
              <strong>Indian Publishing Industry Standard:</strong> 1 standard sheet (23x36") folded twice forms a 16-page section.
              Reams required is calculated as <code className="bg-white px-1.5 py-0.5 rounded text-purple-700 font-bold">Forms × (PrintRun / 500) × 1.05</code> with 5% press makeready & folding spoilage allowance.
            </div>
          </Card>
        </div>
      )}

      {/* =====================================================================
          TAB 4: VENDOR JOB WORK & PRESS MANAGEMENT
          ===================================================================== */}
      {activeTab === 'jobs' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="text-sm text-slate-600">
              Contracted press printing, sheet folding, and automated section sewing bindery orders.
            </div>
            <Button
              style={{ backgroundColor: brand.primaryColor }}
              className="text-white hover:opacity-90"
              size="sm"
              onClick={handleOpenCreateJob}
            >
              <Plus className="w-4 h-4 mr-1.5" />
              New Job Work Order
            </Button>
          </div>

          <Card className="overflow-hidden border border-slate-200 bg-white shadow-sm p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-600 uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Job Order #</th>
                    <th className="py-3 px-4">Job Type</th>
                    <th className="py-3 px-4">Vendor Partner</th>
                    <th className="py-3 px-4 text-center">Delivered Copies</th>
                    <th className="py-3 px-4 text-right">Job Rate</th>
                    <th className="py-3 px-4 text-right">Total Charges</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-center">GL Voucher</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {jobs.map((j) => (
                    <tr key={j.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-purple-700">
                        {j.jobOrderNumber}
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-900">
                        {j.jobType}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-medium text-slate-800">{j.vendorName}</div>
                        {j.vendorInvoiceNumber && (
                          <div className="text-xs text-slate-500 font-mono">Bill: {j.vendorInvoiceNumber}</div>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center font-bold text-slate-800 font-mono">
                        {j.itemsDeliveredCount.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-right text-slate-600 font-mono">
                        ₹{j.jobWorkRate.toFixed(2)} / copy
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-slate-900 font-mono">
                        ₹{j.totalJobCharges.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <Badge variant={j.status === 'DELIVERED' ? 'success' : 'purple'}>
                          {j.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        {j.voucherNumber ? (
                          <span className="font-mono text-xs font-semibold bg-purple-50 text-purple-700 px-2 py-0.5 rounded border border-purple-200">
                            {j.voucherNumber}
                          </span>
                        ) : (
                          <span className="text-xs text-slate-400">Pending</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-rose-600 hover:text-rose-800 p-1"
                          onClick={() => handleDeleteJob(j)}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
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
          TAB 5: QUALITY CONTROL QA INSPECTION
          ===================================================================== */}
      {activeTab === 'qa' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="text-sm text-slate-600">
              Rigorous print production quality assurance with 5-point bindery checklist.
            </div>
            <Button
              style={{ backgroundColor: brand.primaryColor }}
              className="text-white hover:opacity-90"
              size="sm"
              onClick={handleOpenCreateQa}
            >
              <Plus className="w-4 h-4 mr-1.5" />
              Record QA Inspection
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {inspections.map((qa) => (
              <Card key={qa.id} className="p-5 border border-slate-200 bg-white shadow-sm space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <ShieldCheck className="w-6 h-6 text-emerald-600" />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm font-bold text-slate-900">{qa.inspectionNumber}</span>
                        <Badge variant={qa.overallStatus === 'PASSED' ? 'success' : 'coral'}>
                          {qa.overallStatus.replace(/_/g, ' ')}
                        </Badge>
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5">
                        Inspected by {qa.inspectedBy} on {qa.inspectionDate}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-sm">
                    <div>
                      <span className="text-slate-400 text-xs block">Approved</span>
                      <span className="font-bold text-emerald-600">{qa.approvedCopies.toLocaleString()} copies</span>
                    </div>
                    <div>
                      <span className="text-slate-400 text-xs block">Rejected</span>
                      <span className="font-bold text-rose-600">{qa.rejectedCopies.toLocaleString()} copies</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-rose-600 hover:text-rose-800 p-1"
                      onClick={() => handleDeleteQa(qa)}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>

                {/* 5 Checkpoints */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-4 text-xs">
                  <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <div>
                      <span className="font-bold text-emerald-900 block">Print Registration</span>
                      <span className="text-[11px] text-emerald-700">Perfect Dot Alignment</span>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <div>
                      <span className="font-bold text-emerald-900 block">Ink Density</span>
                      <span className="text-[11px] text-emerald-700">Even Solid Tone</span>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <div>
                      <span className="font-bold text-emerald-900 block">Spine Adhesion</span>
                      <span className="text-[11px] text-emerald-700">Sewn & Glued Firm</span>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <div>
                      <span className="font-bold text-emerald-900 block">Page Sequence</span>
                      <span className="text-[11px] text-emerald-700">All Signatures Valid</span>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <div>
                      <span className="font-bold text-emerald-900 block">Guillotine Trim</span>
                      <span className="text-[11px] text-emerald-700">Square 90° Edge</span>
                    </div>
                  </div>
                </div>

                {qa.remarks && (
                  <div className="mt-3 text-xs text-slate-600 bg-slate-50 p-2.5 rounded border border-slate-100 italic">
                    <strong>QA Remarks:</strong> {qa.remarks}
                  </div>
                )}
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* =====================================================================
          TAB 6: COST SHEET & VARIANCE ANALYTICS (100% DYNAMIC)
          ===================================================================== */}
      {activeTab === 'costing' && (
        <div className="space-y-6">
          <Card className="p-5 border border-slate-200 bg-white shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-3 border-b border-slate-200 gap-2">
              <div>
                <h3 className="font-bold text-slate-800 text-base">Production Cost Variance Analysis</h3>
                <p className="text-xs text-slate-500">Planned Benchmark vs Actual Realized Unit Cost across all print runs</p>
              </div>
              <Badge variant="success">Dynamic Aggregated</Badge>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-600 uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Order #</th>
                    <th className="py-3 px-4">Book SKU & Title</th>
                    <th className="py-3 px-4 text-center">Planned Run</th>
                    <th className="py-3 px-4 text-center">Good Copies</th>
                    <th className="py-3 px-4 text-right">Standard Cost</th>
                    <th className="py-3 px-4 text-right">Actual Cost</th>
                    <th className="py-3 px-4 text-right">Variance / Copy</th>
                    <th className="py-3 px-4 text-center">Variance Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {orders.map((o) => {
                    const std = o.standardCostPerCopy || 160.0;
                    const act = o.perCopyCost || std;
                    const variance = Number((act - std).toFixed(2));
                    const isFavorable = variance <= 0;

                    return (
                      <tr key={o.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-4 font-mono font-bold text-purple-700">{o.orderNumber}</td>
                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-900">{o.title}</div>
                          <span className="text-xs text-slate-400 font-mono">{o.sku}</span>
                        </td>
                        <td className="py-3 px-4 text-center font-mono">{o.printRun.toLocaleString()}</td>
                        <td className="py-3 px-4 text-center font-bold text-slate-800 font-mono">
                          {o.goodCopiesProduced > 0 ? o.goodCopiesProduced.toLocaleString() : '-'}
                        </td>
                        <td className="py-3 px-4 text-right text-slate-600 font-mono">₹{std.toFixed(2)}</td>
                        <td className="py-3 px-4 text-right font-bold text-slate-900 font-mono">₹{act.toFixed(2)}</td>
                        <td className={`py-3 px-4 text-right font-bold font-mono ${isFavorable ? 'text-emerald-600' : 'text-rose-600'}`}>
                          {variance > 0 ? `+₹${variance.toFixed(2)}` : `-₹${Math.abs(variance).toFixed(2)}`}
                        </td>
                        <td className="py-3 px-4 text-center whitespace-nowrap">
                          <span
                            className={`text-xs px-2 py-0.5 rounded font-bold ${
                              isFavorable ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'
                            }`}
                          >
                            {isFavorable ? 'FAVORABLE' : 'UNFAVORABLE'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* =====================================================================
          MODAL: CREATE & EDIT PUBLISHING PROJECT
          ===================================================================== */}
      <Modal
        isOpen={isProjectModalOpen}
        onClose={() => setIsProjectModalOpen(false)}
        title={editingProjectId ? 'Edit Manuscript Project' : 'Create New Publishing Manuscript Project'}
        maxWidth="2xl"
      >
        <form onSubmit={handleSaveProject} className="space-y-4">
          <FormField label="Book Title" required>
            <Input
              placeholder="e.g. Inorganic Chemistry for JEE Advanced"
              value={projectForm.title}
              onChange={(e) => setProjectForm({ ...projectForm, title: e.target.value })}
              required
            />
          </FormField>

          <FormField label="Subtitle / Tagline">
            <Input
              placeholder="e.g. Reaction Mechanisms & Periodic Trends"
              value={projectForm.subtitle}
              onChange={(e) => setProjectForm({ ...projectForm, subtitle: e.target.value })}
            />
          </FormField>

          <div className="grid grid-cols-2 gap-3">
            <FormField label="Primary Author" required>
              <Input
                placeholder="Author Name"
                value={projectForm.authorName}
                onChange={(e) => setProjectForm({ ...projectForm, authorName: e.target.value })}
                required
              />
            </FormField>

            <FormField label="Commissioning Editor">
              <Input
                value={projectForm.editorName}
                onChange={(e) => setProjectForm({ ...projectForm, editorName: e.target.value })}
              />
            </FormField>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <FormField label="Edition">
              <Input
                value={projectForm.edition}
                onChange={(e) => setProjectForm({ ...projectForm, edition: e.target.value })}
              />
            </FormField>
            <FormField label="Estimated Pages">
              <Input
                type="number"
                value={projectForm.estimatedPages}
                onChange={(e) => setProjectForm({ ...projectForm, estimatedPages: Number(e.target.value) })}
              />
            </FormField>
            <FormField label="Planned Print Run">
              <Input
                type="number"
                value={projectForm.plannedPrintRun}
                onChange={(e) => setProjectForm({ ...projectForm, plannedPrintRun: Number(e.target.value) })}
              />
            </FormField>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <FormField label="Target Retail MRP (₹)">
              <Input
                type="number"
                value={projectForm.targetMrp}
                onChange={(e) => setProjectForm({ ...projectForm, targetMrp: Number(e.target.value) })}
              />
            </FormField>
            <FormField label="Milestone Status">
              <select
                className="w-full h-10 px-3 rounded-lg border border-slate-300 text-sm bg-white"
                value={projectForm.status}
                onChange={(e) => setProjectForm({ ...projectForm, status: e.target.value as any })}
              >
                <option value="PROPOSAL">Proposal</option>
                <option value="MANUSCRIPT_SUBMITTED">Manuscript Submitted</option>
                <option value="EDITORIAL_REVIEW">Editorial Review</option>
                <option value="TYPESETTING_PROOF">Typesetting & Proofing</option>
                <option value="PRE_PRESS">Pre-Press Proofs</option>
                <option value="PRINT_PRODUCTION">In Print Production</option>
                <option value="PUBLISHED">Published & Live</option>
                <option value="ARCHIVED">Archived</option>
              </select>
            </FormField>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <Button type="button" variant="outline" onClick={() => setIsProjectModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" style={{ backgroundColor: brand.primaryColor }} className="text-white">
              {editingProjectId ? 'Save Changes' : 'Create Publishing Project'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* =====================================================================
          MODAL: CREATE & EDIT PRODUCTION ORDER
          ===================================================================== */}
      <Modal
        isOpen={isOrderModalOpen}
        onClose={() => setIsOrderModalOpen(false)}
        title={editingOrderId ? 'Edit Production Order' : 'Launch Book Production Order & Print Run'}
        maxWidth="2xl"
      >
        <form onSubmit={handleSaveOrder} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Book SKU" required>
              <Input
                placeholder="e.g. BK-CHEM-JEE-01"
                value={orderForm.sku}
                onChange={(e) => setOrderForm({ ...orderForm, sku: e.target.value })}
                required
              />
            </FormField>
            <FormField label="Title" required>
              <Input
                value={orderForm.title}
                onChange={(e) => setOrderForm({ ...orderForm, title: e.target.value })}
                required
              />
            </FormField>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <FormField label="Print Run Quantity">
              <Input
                type="number"
                value={orderForm.printRun}
                onChange={(e) => setOrderForm({ ...orderForm, printRun: Number(e.target.value) })}
              />
            </FormField>
            <FormField label="Pages Count">
              <Input
                type="number"
                value={orderForm.pagesCount}
                onChange={(e) => setOrderForm({ ...orderForm, pagesCount: Number(e.target.value) })}
              />
            </FormField>
            <FormField label="Standard Cost / Copy (₹)">
              <Input
                type="number"
                value={orderForm.standardCostPerCopy}
                onChange={(e) => setOrderForm({ ...orderForm, standardCostPerCopy: Number(e.target.value) })}
              />
            </FormField>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <FormField label="Press Vendor">
              <Input
                value={orderForm.pressVendorName}
                onChange={(e) => setOrderForm({ ...orderForm, pressVendorName: e.target.value })}
              />
            </FormField>
            <FormField label="Binding Vendor">
              <Input
                value={orderForm.bindingVendorName}
                onChange={(e) => setOrderForm({ ...orderForm, bindingVendorName: e.target.value })}
              />
            </FormField>
          </div>

          <div className="p-3 bg-purple-50 rounded-lg border border-purple-200 text-xs text-purple-900 flex justify-between items-center font-mono">
            <span>
              Calculated Forms: <strong>{Math.ceil((orderForm.pagesCount || 400) / 16)} forms</strong>
            </span>
            <span>
              Reams Required (+5%):{' '}
              <strong>{(((Math.ceil((orderForm.pagesCount || 400) / 16) * (orderForm.printRun || 3000)) / 500) * 1.05).toFixed(2)} reams</strong>
            </span>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <Button type="button" variant="outline" onClick={() => setIsOrderModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" style={{ backgroundColor: brand.primaryColor }} className="text-white">
              {editingOrderId ? 'Save Order' : 'Launch Production Order'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* =====================================================================
          MODAL: CAPITALIZE COMPLETED ORDER
          ===================================================================== */}
      <Modal
        isOpen={isCapitalizeModalOpen}
        onClose={() => setIsCapitalizeModalOpen(false)}
        title="Complete Production & Capitalize to Inventory"
        maxWidth="md"
      >
        {orderToCapitalize && (
          <div className="space-y-4">
            <div className="p-3 bg-slate-50 rounded-lg border text-xs space-y-1">
              <div>Order: <strong className="font-mono text-purple-700">{orderToCapitalize.orderNumber}</strong></div>
              <div>Title: <strong>{orderToCapitalize.title}</strong></div>
              <div>Planned Print Run: <strong>{orderToCapitalize.printRun.toLocaleString()} copies</strong></div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <FormField label="Good Finished Copies" required>
                <Input
                  type="number"
                  value={goodCopiesInput}
                  onChange={(e) => setGoodCopiesInput(Number(e.target.value))}
                />
              </FormField>
              <FormField label="Spoilage / Rejected Copies">
                <Input
                  type="number"
                  value={rejectedCopiesInput}
                  onChange={(e) => setRejectedCopiesInput(Number(e.target.value))}
                />
              </FormField>
            </div>

            <p className="text-xs text-slate-500">
              Completing this order will record finished books into godown stock and generate an automated GL Capitalization Voucher.
            </p>

            <div className="flex justify-end gap-2 pt-3 border-t">
              <Button variant="outline" onClick={() => setIsCapitalizeModalOpen(false)}>
                Cancel
              </Button>
              <Button className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={handleExecuteCapitalization}>
                Capitalize & Post to GL
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* =====================================================================
          MODAL: CREATE VENDOR JOB
          ===================================================================== */}
      <Modal
        isOpen={isJobModalOpen}
        onClose={() => setIsJobModalOpen(false)}
        title="New Vendor Job Work Order"
        maxWidth="md"
      >
        <form onSubmit={handleSaveJob} className="space-y-4">
          <FormField label="Production Order" required>
            <select
              className="w-full h-10 px-3 rounded-lg border border-slate-300 text-sm bg-white"
              value={jobForm.productionOrderId}
              onChange={(e) => setJobForm({ ...jobForm, productionOrderId: e.target.value })}
            >
              {orders.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.orderNumber} - {o.title}
                </option>
              ))}
            </select>
          </FormField>

          <div className="grid grid-cols-2 gap-3">
            <FormField label="Job Type" required>
              <select
                className="w-full h-10 px-3 rounded-lg border border-slate-300 text-sm bg-white"
                value={jobForm.jobType}
                onChange={(e) => setJobForm({ ...jobForm, jobType: e.target.value as any })}
              >
                <option value="PRINTING">Offset Machine Printing</option>
                <option value="BINDING">Section Sewing & Bindery</option>
                <option value="COVER_FINISHING">Cover Lamination & UV</option>
                <option value="PACKAGING">Shrink Packaging & Carton</option>
              </select>
            </FormField>

            <FormField label="Vendor Partner Name" required>
              <Input
                placeholder="e.g. Thomson Press Ltd."
                value={jobForm.vendorName}
                onChange={(e) => setJobForm({ ...jobForm, vendorName: e.target.value })}
                required
              />
            </FormField>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <FormField label="Job Work Rate (₹/copy)">
              <Input
                type="number"
                value={jobForm.jobWorkRate}
                onChange={(e) => setJobForm({ ...jobForm, jobWorkRate: Number(e.target.value) })}
              />
            </FormField>
            <FormField label="Copies Count">
              <Input
                type="number"
                value={jobForm.itemsDeliveredCount}
                onChange={(e) => setJobForm({ ...jobForm, itemsDeliveredCount: Number(e.target.value) })}
              />
            </FormField>
          </div>

          <FormField label="Vendor Bill / Invoice #">
            <Input
              placeholder="e.g. TP-INV-9941"
              value={jobForm.vendorInvoiceNumber}
              onChange={(e) => setJobForm({ ...jobForm, vendorInvoiceNumber: e.target.value })}
            />
          </FormField>

          <div className="flex justify-end gap-2 pt-3 border-t">
            <Button type="button" variant="outline" onClick={() => setIsJobModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" style={{ backgroundColor: brand.primaryColor }} className="text-white">
              Save Job Order
            </Button>
          </div>
        </form>
      </Modal>

      {/* =====================================================================
          MODAL: CREATE QA INSPECTION
          ===================================================================== */}
      <Modal
        isOpen={isQaModalOpen}
        onClose={() => setIsQaModalOpen(false)}
        title="Record Quality Assurance (QA) Inspection"
        maxWidth="md"
      >
        <form onSubmit={handleSaveQa} className="space-y-4">
          <FormField label="Production Order" required>
            <select
              className="w-full h-10 px-3 rounded-lg border border-slate-300 text-sm bg-white"
              value={qaForm.productionOrderId}
              onChange={(e) => setQaForm({ ...qaForm, productionOrderId: e.target.value })}
            >
              {orders.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.orderNumber} - {o.title}
                </option>
              ))}
            </select>
          </FormField>

          <div className="grid grid-cols-2 gap-3">
            <FormField label="Inspector Name" required>
              <Input
                placeholder="Chief Inspector"
                value={qaForm.inspectedBy}
                onChange={(e) => setQaForm({ ...qaForm, inspectedBy: e.target.value })}
                required
              />
            </FormField>
            <FormField label="Inspection Date">
              <Input
                type="date"
                value={qaForm.inspectionDate}
                onChange={(e) => setQaForm({ ...qaForm, inspectionDate: e.target.value })}
              />
            </FormField>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <FormField label="Sample Size">
              <Input
                type="number"
                value={qaForm.sampleSize}
                onChange={(e) => setQaForm({ ...qaForm, sampleSize: Number(e.target.value) })}
              />
            </FormField>
            <FormField label="Approved Copies">
              <Input
                type="number"
                value={qaForm.approvedCopies}
                onChange={(e) => setQaForm({ ...qaForm, approvedCopies: Number(e.target.value) })}
              />
            </FormField>
            <FormField label="Rejected Copies">
              <Input
                type="number"
                value={qaForm.rejectedCopies}
                onChange={(e) => setQaForm({ ...qaForm, rejectedCopies: Number(e.target.value) })}
              />
            </FormField>
          </div>

          <FormField label="Overall Status">
            <select
              className="w-full h-10 px-3 rounded-lg border border-slate-300 text-sm bg-white"
              value={qaForm.overallStatus}
              onChange={(e) => setQaForm({ ...qaForm, overallStatus: e.target.value as any })}
            >
              <option value="PASSED">Passed (Grade A Inspection)</option>
              <option value="PASSED_WITH_CONCESSION">Passed with Concession</option>
              <option value="REJECTED">Rejected / Rework Required</option>
            </select>
          </FormField>

          <FormField label="Remarks / Observation Notes">
            <Input
              placeholder="e.g. Spine adhesion and registration within strict BIS limits"
              value={qaForm.remarks}
              onChange={(e) => setQaForm({ ...qaForm, remarks: e.target.value })}
            />
          </FormField>

          <div className="flex justify-end gap-2 pt-3 border-t">
            <Button type="button" variant="outline" onClick={() => setIsQaModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" style={{ backgroundColor: brand.primaryColor }} className="text-white">
              Save Inspection
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default PublishingPage;
