export interface PublishingProject {
  id: string;
  projectNumber: string;
  title: string;
  subtitle?: string;
  language: string;
  edition: string;
  category: string;
  status:
    | 'PROPOSAL'
    | 'MANUSCRIPT_SUBMITTED'
    | 'EDITORIAL_REVIEW'
    | 'TYPESETTING_PROOF'
    | 'PRE_PRESS'
    | 'PRINT_PRODUCTION'
    | 'PUBLISHED'
    | 'ARCHIVED';
  authorName: string;
  editorName: string;
  isbnAllocated?: string;
  targetPublicationDate?: string;
  plannedPrintRun: number;
  targetMrp: number;
  estimatedPages: number;
  manuscriptWordCount?: number;
  notes?: string;
}

export interface ProductionOrder {
  id: string;
  orderNumber: string;
  sku: string;
  title: string;
  edition: string;
  printRun: number;
  goodCopiesProduced: number;
  rejectedCopiesCount: number;
  sheetSize: string;
  paperGsm: number;
  paperType: string;
  coverGsm: number;
  coverFinishing: string;
  bindingType: string;
  pagesCount: number;
  formsCount: number;
  reamsRequired: number;
  platesRequired: number;
  status:
    | 'PLANNING'
    | 'MATERIAL_ISSUED'
    | 'PRINTING_IN_PROGRESS'
    | 'BINDING_IN_PROGRESS'
    | 'QA_INSPECTION'
    | 'COMPLETED'
    | 'CANCELLED';
  pressVendorName?: string;
  bindingVendorName?: string;
  standardCostPerCopy: number;
  totalProductionCost: number;
  perCopyCost: number;
  voucherNumber?: string;
  completedDate?: string;
}

export interface VendorJobOrder {
  id: string;
  jobOrderNumber: string;
  productionOrderId: string;
  jobType: 'PRINTING' | 'BINDING' | 'COVER_FINISHING' | 'PACKAGING';
  vendorName: string;
  orderDate: string;
  status: 'ISSUED' | 'IN_PROGRESS' | 'DELIVERED' | 'CANCELLED';
  itemsDeliveredCount: number;
  jobWorkRate: number;
  totalJobCharges: number;
  vendorInvoiceNumber?: string;
  voucherNumber?: string;
}

export interface QualityInspection {
  id: string;
  inspectionNumber: string;
  productionOrderId: string;
  inspectedBy: string;
  inspectionDate: string;
  sampleSize: number;
  approvedCopies: number;
  rejectedCopies: number;
  printRegistrationPass: boolean;
  inkDensityPass: boolean;
  bindingAdhesionPass: boolean;
  pageSequencePass: boolean;
  trimmingPass: boolean;
  overallStatus: 'PASSED' | 'PASSED_WITH_CONCESSION' | 'REJECTED';
  remarks?: string;
}

export const INITIAL_PROJECTS: PublishingProject[] = [
  {
    id: 'prj_01',
    projectNumber: 'PRJ/2026/0001',
    title: 'Concepts of Physics (Part 1)',
    subtitle: 'Mechanics, Thermodynamics & Waves',
    language: 'English',
    edition: '3rd Classic Edition',
    category: 'Competitive Exams (JEE / NEET)',
    status: 'PUBLISHED',
    authorName: 'Prof. Harish Chandra Verma',
    editorName: 'Editorial Production Lead',
    isbnAllocated: '9788177091877',
    plannedPrintRun: 5000,
    targetMrp: 495.0,
    estimatedPages: 462,
    manuscriptWordCount: 185000,
    notes: 'Premier flagship title in JEE Advanced Physics Foundation',
  },
  {
    id: 'prj_02',
    projectNumber: 'PRJ/2026/0002',
    title: 'Mathematics Olympiad & Advanced Calculus Guide',
    subtitle: 'Senior Secondary Honors Curriculum',
    language: 'English',
    edition: '1st Edition',
    category: 'Higher Mathematics',
    status: 'EDITORIAL_REVIEW',
    authorName: 'Dr. R. D. Sharma',
    editorName: 'Senior Commissioning Editor',
    isbnAllocated: '9788177099955',
    plannedPrintRun: 3000,
    targetMrp: 595.0,
    estimatedPages: 512,
    manuscriptWordCount: 210000,
    notes: 'Commissioned for national Olympiad aspirants and STEM honors',
  },
  {
    id: 'prj_03',
    projectNumber: 'PRJ/2026/0003',
    title: 'Advanced Physical Chemistry & Reaction Kinetics',
    subtitle: 'Thermodynamics, Electrochemistry & Quantum Chemistry',
    language: 'English',
    edition: '5th Revised Edition',
    category: 'Higher Education & Reference',
    status: 'PRINT_PRODUCTION',
    authorName: 'Dr. O. P. Tandon',
    editorName: 'Senior STEM Acquisitions Editor',
    isbnAllocated: '9788126700011',
    plannedPrintRun: 4000,
    targetMrp: 950.0,
    estimatedPages: 840,
    manuscriptWordCount: 320000,
    notes: 'Benchmark university reference work',
  },
];

export const INITIAL_ORDERS: ProductionOrder[] = [
  {
    id: 'prod_01',
    orderNumber: 'PROD/2026/0001',
    sku: 'BK-PHY-HCV-01',
    title: 'Concepts of Physics (Part 1)',
    edition: '3rd Classic Edition',
    printRun: 5000,
    goodCopiesProduced: 4950,
    rejectedCopiesCount: 50,
    sheetSize: '23x36 inches',
    paperGsm: 70,
    paperType: 'Maplitho Natural Shade 70 GSM',
    coverGsm: 300,
    coverFinishing: 'Thermal Matte Lamination + Spot UV + Emboss',
    bindingType: 'Section Sewn & Perfect Bound',
    pagesCount: 462,
    formsCount: 29,
    reamsRequired: 304.5,
    platesRequired: 29,
    status: 'COMPLETED',
    pressVendorName: 'Thomson Press India Ltd. (Okhla Plant)',
    bindingVendorName: 'Replika Press & Automated Bindery Ltd.',
    standardCostPerCopy: 165.0,
    totalProductionCost: 792000.0,
    perCopyCost: 160.0,
    voucherNumber: 'JV/2026/0002',
    completedDate: '2026-11-04',
  },
  {
    id: 'prod_02',
    orderNumber: 'PROD/2026/0002',
    sku: 'BK-MATH-12-RD-01',
    title: 'Senior Secondary School Mathematics (Class 12 - Vol 1 & 2)',
    edition: '2026-27 Revised & Enlarged Edition',
    printRun: 4000,
    goodCopiesProduced: 3960,
    rejectedCopiesCount: 40,
    sheetSize: '23x36 inches',
    paperGsm: 70,
    paperType: 'Maplitho Natural Shade 70 GSM',
    coverGsm: 300,
    coverFinishing: 'Thermal Matte Lamination + Spot UV + Emboss',
    bindingType: 'Section Sewn & Perfect Bound',
    pagesCount: 1248,
    formsCount: 78,
    reamsRequired: 655.2,
    platesRequired: 78,
    status: 'COMPLETED',
    pressVendorName: 'Thomson Press India Ltd.',
    bindingVendorName: 'Replika Press & Automated Bindery Ltd.',
    standardCostPerCopy: 285.0,
    totalProductionCost: 1045440.0,
    perCopyCost: 264.0,
    voucherNumber: 'JV/2026/0883',
    completedDate: '2026-11-05',
  },
  {
    id: 'prod_03',
    orderNumber: 'PROD/2026/0003',
    sku: 'BK-CHEM-ADV-01',
    title: 'Advanced Physical Chemistry & Reaction Kinetics',
    edition: '5th Revised Edition',
    printRun: 3000,
    goodCopiesProduced: 0,
    rejectedCopiesCount: 0,
    sheetSize: '25x38 inches',
    paperGsm: 80,
    paperType: 'Super Print Maplitho 80 GSM',
    coverGsm: 350,
    coverFinishing: 'Gloss Lamination + Gold Foil Stamping',
    bindingType: 'Hardcover Deluxe Case Binding',
    pagesCount: 840,
    formsCount: 53,
    reamsRequired: 333.9,
    platesRequired: 53,
    status: 'PRINTING_IN_PROGRESS',
    pressVendorName: 'Classic Offset Printers & Binders',
    bindingVendorName: 'Classic Offset Printers & Binders',
    standardCostPerCopy: 380.0,
    totalProductionCost: 0,
    perCopyCost: 0,
  },
];

export const INITIAL_JOBS: VendorJobOrder[] = [
  {
    id: 'job_01',
    jobOrderNumber: 'JOB/2026/0001',
    productionOrderId: 'prod_01',
    jobType: 'PRINTING',
    vendorName: 'Thomson Press India Ltd. (Okhla Plant)',
    orderDate: '2026-11-01',
    status: 'DELIVERED',
    itemsDeliveredCount: 5000,
    jobWorkRate: 35.0,
    totalJobCharges: 175000.0,
    vendorInvoiceNumber: 'TP-INV-2026-9081',
    voucherNumber: 'JV/2026/0882',
  },
  {
    id: 'job_02',
    jobOrderNumber: 'JOB/2026/0002',
    productionOrderId: 'prod_01',
    jobType: 'BINDING',
    vendorName: 'Replika Press & Automated Bindery Ltd.',
    orderDate: '2026-11-02',
    status: 'DELIVERED',
    itemsDeliveredCount: 4950,
    jobWorkRate: 20.0,
    totalJobCharges: 99000.0,
    vendorInvoiceNumber: 'RP-BIND-2026-4412',
    voucherNumber: 'JV/2026/0884',
  },
  {
    id: 'job_03',
    jobOrderNumber: 'JOB/2026/0003',
    productionOrderId: 'prod_03',
    jobType: 'PRINTING',
    vendorName: 'Classic Offset Printers & Binders',
    orderDate: '2026-11-04',
    status: 'IN_PROGRESS',
    itemsDeliveredCount: 0,
    jobWorkRate: 42.0,
    totalJobCharges: 126000.0,
  },
];

export const INITIAL_INSPECTIONS: QualityInspection[] = [
  {
    id: 'qa_01',
    inspectionNumber: 'QA/2026/0001',
    productionOrderId: 'prod_01',
    inspectedBy: 'Chief Quality Inspector (BIS Standard)',
    inspectionDate: '2026-11-04',
    sampleSize: 100,
    approvedCopies: 4950,
    rejectedCopies: 50,
    printRegistrationPass: true,
    inkDensityPass: true,
    bindingAdhesionPass: true,
    pageSequencePass: true,
    trimmingPass: true,
    overallStatus: 'PASSED_WITH_CONCESSION',
    remarks: '50 copies rejected due to guillotine knife alignment drift. 4,950 copies passed with pristine quality.',
  },
  {
    id: 'qa_02',
    inspectionNumber: 'QA/2026/0002',
    productionOrderId: 'prod_02',
    inspectedBy: 'Senior Production QA Lead',
    inspectionDate: '2026-11-05',
    sampleSize: 150,
    approvedCopies: 3960,
    rejectedCopies: 40,
    printRegistrationPass: true,
    inkDensityPass: true,
    bindingAdhesionPass: true,
    pageSequencePass: true,
    trimmingPass: true,
    overallStatus: 'PASSED',
    remarks: 'Vol 1 & 2 binding spine strength and thread sewing fully tested to exceed standard stress benchmarks.',
  },
];

const PROJECTS_KEY = 'kibo360_publishing_projects_v2';
const ORDERS_KEY = 'kibo360_production_orders_v2';
const JOBS_KEY = 'kibo360_vendor_jobs_v2';
const INSPECTIONS_KEY = 'kibo360_qa_inspections_v2';

// --- PROJECTS HELPERS ---
export function getStoredProjects(): PublishingProject[] {
  try {
    const raw = localStorage.getItem(PROJECTS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}
  saveStoredProjects(INITIAL_PROJECTS);
  return INITIAL_PROJECTS;
}

export function saveStoredProjects(projects: PublishingProject[]): void {
  try {
    localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects));
  } catch {}
}

export function saveProjectItem(project: Partial<PublishingProject> & { title: string; authorName: string }): PublishingProject {
  const current = getStoredProjects();
  if (project.id) {
    const updated = current.map((p) => (p.id === project.id ? ({ ...p, ...project } as PublishingProject) : p));
    saveStoredProjects(updated);
    return updated.find((p) => p.id === project.id)!;
  } else {
    const year = new Date().getFullYear();
    const count = current.length + 1;
    const projectNumber = `PRJ/${year}/${String(count).padStart(4, '0')}`;
    const created: PublishingProject = {
      id: 'prj_' + Date.now(),
      projectNumber,
      title: project.title,
      subtitle: project.subtitle,
      language: project.language || 'English',
      edition: project.edition || '1st Edition',
      category: project.category || 'Academic & Higher Education',
      status: project.status || 'EDITORIAL_REVIEW',
      authorName: project.authorName,
      editorName: project.editorName || 'Senior Production Editor',
      isbnAllocated: project.isbnAllocated,
      plannedPrintRun: Number(project.plannedPrintRun) || 3000,
      targetMrp: Number(project.targetMrp) || 495.0,
      estimatedPages: Number(project.estimatedPages) || 400,
      manuscriptWordCount: Number(project.manuscriptWordCount) || 150000,
      notes: project.notes,
    };
    saveStoredProjects([created, ...current]);
    return created;
  }
}

export function deleteProjectItem(id: string): void {
  const current = getStoredProjects();
  saveStoredProjects(current.filter((p) => p.id !== id));
}

// --- ORDERS HELPERS ---
export function getStoredOrders(): ProductionOrder[] {
  try {
    const raw = localStorage.getItem(ORDERS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}
  saveStoredOrders(INITIAL_ORDERS);
  return INITIAL_ORDERS;
}

export function saveStoredOrders(orders: ProductionOrder[]): void {
  try {
    localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
  } catch {}
}

export function saveOrderItem(order: Partial<ProductionOrder> & { title: string; sku: string }): ProductionOrder {
  const current = getStoredOrders();
  const pagesCount = Number(order.pagesCount) || 400;
  const printRun = Number(order.printRun) || 3000;
  const formsCount = Math.ceil(pagesCount / 16);
  const reamsRequired = Number(((formsCount * (printRun / 500)) * 1.05).toFixed(2));

  if (order.id) {
    const updated = current.map((o) => (o.id === order.id ? ({ ...o, ...order } as ProductionOrder) : o));
    saveStoredOrders(updated);
    return updated.find((o) => o.id === order.id)!;
  } else {
    const year = new Date().getFullYear();
    const count = current.length + 1;
    const orderNumber = `PROD/${year}/${String(count).padStart(4, '0')}`;
    const standardCost = Number(order.standardCostPerCopy) || 160.0;
    const totalCost = Number(order.totalProductionCost) || (standardCost * printRun);

    const created: ProductionOrder = {
      id: 'prod_' + Date.now(),
      orderNumber,
      sku: order.sku,
      title: order.title,
      edition: order.edition || '1st Edition',
      printRun,
      goodCopiesProduced: Number(order.goodCopiesProduced) || 0,
      rejectedCopiesCount: Number(order.rejectedCopiesCount) || 0,
      sheetSize: order.sheetSize || '23x36 inches',
      paperGsm: Number(order.paperGsm) || 70,
      paperType: order.paperType || 'Maplitho Natural Shade 70 GSM',
      coverGsm: Number(order.coverGsm) || 300,
      coverFinishing: order.coverFinishing || 'Thermal Matte Lamination + Spot UV',
      bindingType: order.bindingType || 'Section Sewn & Perfect Bound',
      pagesCount,
      formsCount,
      reamsRequired,
      platesRequired: formsCount,
      status: order.status || 'PLANNING',
      pressVendorName: order.pressVendorName || 'Thomson Press India Ltd.',
      bindingVendorName: order.bindingVendorName || 'Replika Press & Automated Bindery Ltd.',
      standardCostPerCopy: standardCost,
      totalProductionCost: totalCost,
      perCopyCost: printRun > 0 ? Number((totalCost / printRun).toFixed(2)) : 0,
    };
    saveStoredOrders([created, ...current]);
    return created;
  }
}

export function deleteOrderItem(id: string): void {
  const current = getStoredOrders();
  saveStoredOrders(current.filter((o) => o.id !== id));
}

// --- JOBS HELPERS ---
export function getStoredJobs(): VendorJobOrder[] {
  try {
    const raw = localStorage.getItem(JOBS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}
  saveStoredJobs(INITIAL_JOBS);
  return INITIAL_JOBS;
}

export function saveStoredJobs(jobs: VendorJobOrder[]): void {
  try {
    localStorage.setItem(JOBS_KEY, JSON.stringify(jobs));
  } catch {}
}

export function saveJobItem(job: Partial<VendorJobOrder> & { vendorName: string; jobType: VendorJobOrder['jobType'] }): VendorJobOrder {
  const current = getStoredJobs();
  const rate = Number(job.jobWorkRate) || 0;
  const count = Number(job.itemsDeliveredCount) || 1000;
  const total = Number(job.totalJobCharges) || (rate * count);

  if (job.id) {
    const updated = current.map((j) => (j.id === job.id ? ({ ...j, ...job } as VendorJobOrder) : j));
    saveStoredJobs(updated);
    return updated.find((j) => j.id === job.id)!;
  } else {
    const year = new Date().getFullYear();
    const jCount = current.length + 1;
    const jobOrderNumber = `JOB/${year}/${String(jCount).padStart(4, '0')}`;
    const created: VendorJobOrder = {
      id: 'job_' + Date.now(),
      jobOrderNumber,
      productionOrderId: job.productionOrderId || 'prod_01',
      jobType: job.jobType,
      vendorName: job.vendorName,
      orderDate: job.orderDate || new Date().toISOString().slice(0, 10),
      status: job.status || 'ISSUED',
      itemsDeliveredCount: count,
      jobWorkRate: rate,
      totalJobCharges: total,
      vendorInvoiceNumber: job.vendorInvoiceNumber,
    };
    saveStoredJobs([created, ...current]);
    return created;
  }
}

export function deleteJobItem(id: string): void {
  const current = getStoredJobs();
  saveStoredJobs(current.filter((j) => j.id !== id));
}

// --- QA INSPECTIONS HELPERS ---
export function getStoredInspections(): QualityInspection[] {
  try {
    const raw = localStorage.getItem(INSPECTIONS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}
  saveStoredInspections(INITIAL_INSPECTIONS);
  return INITIAL_INSPECTIONS;
}

export function saveStoredInspections(inspections: QualityInspection[]): void {
  try {
    localStorage.setItem(INSPECTIONS_KEY, JSON.stringify(inspections));
  } catch {}
}

export function saveInspectionItem(item: Partial<QualityInspection> & { inspectedBy: string }): QualityInspection {
  const current = getStoredInspections();
  if (item.id) {
    const updated = current.map((i) => (i.id === item.id ? ({ ...i, ...item } as QualityInspection) : i));
    saveStoredInspections(updated);
    return updated.find((i) => i.id === item.id)!;
  } else {
    const year = new Date().getFullYear();
    const qCount = current.length + 1;
    const inspectionNumber = `QA/${year}/${String(qCount).padStart(4, '0')}`;
    const created: QualityInspection = {
      id: 'qa_' + Date.now(),
      inspectionNumber,
      productionOrderId: item.productionOrderId || 'prod_01',
      inspectedBy: item.inspectedBy,
      inspectionDate: item.inspectionDate || new Date().toISOString().slice(0, 10),
      sampleSize: Number(item.sampleSize) || 100,
      approvedCopies: Number(item.approvedCopies) || 4950,
      rejectedCopies: Number(item.rejectedCopies) || 50,
      printRegistrationPass: item.printRegistrationPass ?? true,
      inkDensityPass: item.inkDensityPass ?? true,
      bindingAdhesionPass: item.bindingAdhesionPass ?? true,
      pageSequencePass: item.pageSequencePass ?? true,
      trimmingPass: item.trimmingPass ?? true,
      overallStatus: item.overallStatus || 'PASSED',
      remarks: item.remarks,
    };
    saveStoredInspections([created, ...current]);
    return created;
  }
}

export function deleteInspectionItem(id: string): void {
  const current = getStoredInspections();
  saveStoredInspections(current.filter((i) => i.id !== id));
}

// Reset Publishing to Defaults
export function resetPublishingToDefaults(): void {
  saveStoredProjects(INITIAL_PROJECTS);
  saveStoredOrders(INITIAL_ORDERS);
  saveStoredJobs(INITIAL_JOBS);
  saveStoredInspections(INITIAL_INSPECTIONS);
}
