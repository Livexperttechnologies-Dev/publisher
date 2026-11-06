export interface BookItem {
  id: string;
  parentTitleId?: string;
  title: string;
  subtitle?: string;
  isbn10?: string;
  isbn13: string;
  sku: string;
  barcode?: string;
  authorId?: string;
  authorName: string;
  coAuthors?: string[];
  publisherId?: string;
  publisherName: string;
  edition: string;
  volume?: string;
  language: string;
  subject: string;
  category: string;
  subcategory?: string;
  publicationYear: number;
  numberOfPages: number;
  bindingType: string;
  bookSize: string;
  printingFormat: string;
  hsnSacCode: string;
  taxRate: number;
  mrp: number;
  wholesalePrice: number;
  dealerPrice: number;
  purchaseCost: number;
  openingStock: number;
  reorderLevel: number;
  warehouseId?: string;
  rackShelf?: string;
  description?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'OUT_OF_PRINT' | 'DISCONTINUED';
}

export interface AuthorItem {
  id: string;
  name: string;
  pseudonym?: string;
  bio?: string;
  email: string;
  phone: string;
  pan: string;
  bankDetails: {
    accountName: string;
    accountNumber: string;
    bankName: string;
    ifsc: string;
    branch?: string;
  };
  royaltyAgreementNumber: string;
  royaltyType: 'PERCENTAGE_ON_MRP' | 'PERCENTAGE_ON_NET_SALES' | 'FIXED_PER_COPY';
  royaltyRate: number;
  paymentTerms: string;
  bookCount: number;
}

export interface PublisherItem {
  id: string;
  name: string;
  code: string;
  contactPerson: string;
  email: string;
  phone: string;
  gstin: string;
  pan: string;
  city: string;
  state: string;
  paymentTerms: string;
  bookCount: number;
}

export interface TaxonomyItem {
  id: string;
  type: 'CATEGORY' | 'SUBJECT' | 'BINDING' | 'BOOK_SIZE' | 'DISCOUNT_SCHEME';
  code: string;
  name: string;
  description: string;
  metadata?: Record<string, any>;
}

export interface PartyItem {
  id: string;
  partyType: 'DISTRIBUTOR' | 'DEALER' | 'CUSTOMER' | 'INSTITUTION_SCHOOL' | 'SUPPLIER' | 'TRANSPORTER';
  name: string;
  code: string;
  contactPerson: string;
  phone: string;
  email: string;
  gstin: string;
  pan: string;
  city: string;
  state: string;
  creditLimit: number;
  creditDays: number;
  discountRate: number;
  paymentTerms: string;
}

export const INITIAL_BOOKS: BookItem[] = [
  {
    id: 'bk_math_12_eng_pb',
    parentTitleId: 'wrk_math_class_12',
    title: 'Senior Secondary School Mathematics (Class 12 - Vol 1 & 2)',
    subtitle: 'Comprehensive Reference with Exemplar Solutions & Board Solved Papers',
    isbn10: '8177099850',
    isbn13: '9788177099859',
    sku: 'BK-MATH-12-RD-01',
    barcode: '9788177099859',
    authorName: 'Dr. R. D. Sharma',
    publisherName: 'Apex Educational Publishers & Distributors Ltd.',
    edition: '2026-27 Revised & Enlarged Edition',
    volume: 'Vol 1 & 2 Complete Set',
    language: 'English',
    subject: 'Mathematics',
    category: 'Academic & School Textbooks',
    publicationYear: 2026,
    numberOfPages: 1248,
    bindingType: 'Paperback with Section Sewing',
    bookSize: 'Royal 8vo (240mm x 165mm)',
    printingFormat: '2 Colour Offset',
    hsnSacCode: '4901',
    taxRate: 0,
    mrp: 795,
    wholesalePrice: 477,
    dealerPrice: 596.25,
    purchaseCost: 285,
    openingStock: 12500,
    reorderLevel: 2500,
    warehouseId: 'Delhi Central Godown',
    rackShelf: 'Rack-M12-A4',
    description: 'Standard benchmark reference textbook for CBSE Class 12 Board examinations.',
    status: 'ACTIVE',
  },
  {
    id: 'bk_math_12_hindi_pb',
    parentTitleId: 'wrk_math_class_12',
    title: 'Uchhatar Madhyamik Ganit (Class 12 - Bhag 1 & 2)',
    subtitle: 'Sampoorna Hindi Sanskaran with NCERT Pariksha Prashnavali',
    isbn10: '8177099869',
    isbn13: '9788177099866',
    sku: 'BK-MATH-12-RD-HIN',
    barcode: '9788177099866',
    authorName: 'Dr. R. D. Sharma',
    publisherName: 'Apex Educational Publishers & Distributors Ltd.',
    edition: '2026 Edition',
    volume: 'Bhag 1 & 2',
    language: 'Hindi',
    subject: 'Mathematics',
    category: 'Academic & School Textbooks',
    publicationYear: 2026,
    numberOfPages: 1280,
    bindingType: 'Paperback with Section Sewing',
    bookSize: 'Royal 8vo (240mm x 165mm)',
    printingFormat: 'Single Colour Monotone',
    hsnSacCode: '4901',
    taxRate: 0,
    mrp: 695,
    wholesalePrice: 417,
    dealerPrice: 521.25,
    purchaseCost: 245,
    openingStock: 6500,
    reorderLevel: 1500,
    warehouseId: 'Delhi Central Godown',
    rackShelf: 'Rack-M12-B2',
    description: 'Hindi medium curriculum reference textbook for UP and CBSE Board students.',
    status: 'ACTIVE',
  },
  {
    id: 'bk_physics_part1',
    parentTitleId: 'wrk_physics_concept',
    title: 'Concepts of Physics (Part 1 - Mechanics & Thermodynamics)',
    subtitle: 'Theoretical Foundations and Solved Numerical Exercises',
    isbn10: '8177091876',
    isbn13: '9788177091877',
    sku: 'BK-PHY-HCV-01',
    barcode: '9788177091877',
    authorName: 'Prof. Harish Chandra Verma',
    publisherName: 'Apex Educational Publishers & Distributors Ltd.',
    edition: '3rd Standard Edition',
    volume: 'Part 1',
    language: 'English',
    subject: 'Physics',
    category: 'Academic & School Textbooks',
    publicationYear: 2026,
    numberOfPages: 462,
    bindingType: 'Paperback',
    bookSize: 'Royal 8vo (240mm x 165mm)',
    printingFormat: '2 Colour Offset',
    hsnSacCode: '4901',
    taxRate: 0,
    mrp: 495,
    wholesalePrice: 297,
    dealerPrice: 371.25,
    purchaseCost: 175,
    openingStock: 18400,
    reorderLevel: 4000,
    warehouseId: 'Delhi Central Godown',
    rackShelf: 'Rack-P01-C1',
    description: 'Foundational physics textbook revered by engineering aspirants across India.',
    status: 'ACTIVE',
  },
  {
    id: 'bk_chem_physical',
    parentTitleId: 'wrk_chem_physical',
    title: 'Advanced Physical Chemistry & Reaction Kinetics',
    subtitle: 'Thermodynamics, Electrochemistry, and Quantum Chemistry for B.Sc & M.Sc',
    isbn10: '8126700018',
    isbn13: '9788126700011',
    sku: 'BK-CHEM-ADV-01',
    barcode: '9788126700011',
    authorName: 'Dr. O. P. Tandon',
    publisherName: 'Apex Educational Publishers & Distributors Ltd.',
    edition: '5th Revised Edition',
    language: 'English',
    subject: 'Chemistry',
    category: 'Higher Education & Reference',
    publicationYear: 2025,
    numberOfPages: 840,
    bindingType: 'Hardcover Deluxe Case Binding',
    bookSize: 'Crown 4to (250mm x 190mm)',
    printingFormat: '4 Colour Illustrations',
    hsnSacCode: '4901',
    taxRate: 0,
    mrp: 950,
    wholesalePrice: 570,
    dealerPrice: 712.5,
    purchaseCost: 380,
    openingStock: 3200,
    reorderLevel: 800,
    warehouseId: 'Bhiwandi Godown',
    rackShelf: 'Rack-C04-D3',
    description: 'Comprehensive college chemistry curriculum benchmark textbook.',
    status: 'ACTIVE',
  },
];

export const INITIAL_AUTHORS: AuthorItem[] = [
  {
    id: 'auth_rd_sharma',
    name: 'Dr. R. D. Sharma',
    pseudonym: 'R.D.S.',
    bio: 'Distinguished Professor and Author of leading Mathematics textbooks in India.',
    email: 'rdsharma.math@gmail.com',
    phone: '+91 98110 44521',
    pan: 'ABCPS1234F',
    bankDetails: {
      accountName: 'Dr. R. D. Sharma',
      accountNumber: '918010023456789',
      bankName: 'HDFC Bank Ltd.',
      ifsc: 'HDFC0000053',
      branch: 'Connaught Place Branch, New Delhi',
    },
    royaltyAgreementNumber: 'AGR-2024-MATH-001',
    royaltyType: 'PERCENTAGE_ON_MRP',
    royaltyRate: 10.0,
    paymentTerms: 'Quarterly Settlement',
    bookCount: 2,
  },
  {
    id: 'auth_hc_verma',
    name: 'Prof. Harish Chandra Verma',
    bio: 'Renowned nuclear physicist and former Professor of Physics at IIT Kanpur.',
    email: 'hcverma.physics@iitk.ac.in',
    phone: '+91 94150 98765',
    pan: 'XYZPV5678K',
    bankDetails: {
      accountName: 'Harish Chandra Verma',
      accountNumber: '108933445566',
      bankName: 'State Bank of India',
      ifsc: 'SBIN0001161',
      branch: 'IIT Kanpur Campus, Kanpur',
    },
    royaltyAgreementNumber: 'AGR-2023-PHY-004',
    royaltyType: 'PERCENTAGE_ON_MRP',
    royaltyRate: 12.5,
    paymentTerms: 'Semi-Annual Settlement',
    bookCount: 1,
  },
  {
    id: 'auth_op_tandon',
    name: 'Dr. O. P. Tandon',
    bio: 'Renowned Chemistry educator and textbook author for undergraduate science.',
    email: 'optandon.chem@apexpublishers.com',
    phone: '+91 98290 12345',
    pan: 'LMNOP9012R',
    bankDetails: {
      accountName: 'Dr. O. P. Tandon',
      accountNumber: '000405123999',
      bankName: 'ICICI Bank Ltd.',
      ifsc: 'ICIC0000004',
      branch: 'Sector 18 Branch, Noida',
    },
    royaltyAgreementNumber: 'AGR-2025-CHEM-009',
    royaltyType: 'PERCENTAGE_ON_NET_SALES',
    royaltyRate: 15.0,
    paymentTerms: 'Annual Settlement',
    bookCount: 1,
  },
];

export const INITIAL_PUBLISHERS: PublisherItem[] = [
  {
    id: 'pub_apex',
    name: 'Apex Educational Publishers & Distributors Ltd.',
    code: 'PUB-APEX-01',
    contactPerson: 'Ajit Kumar (Managing Director)',
    email: 'publishing@apexpublishers.com',
    phone: '+91 11 4567 8900',
    gstin: '07AAAAA0000A1Z5',
    pan: 'AAACA1234D',
    city: 'New Delhi',
    state: 'Delhi',
    paymentTerms: '30 Days Net',
    bookCount: 4,
  },
  {
    id: 'pub_heritage',
    name: 'Heritage Academic Press & Universal Books',
    code: 'PUB-HERIT-02',
    contactPerson: 'Sudhir Sen',
    email: 'info@heritageacademic.in',
    phone: '+91 33 2244 5566',
    gstin: '19BBBBB1111B1Z2',
    pan: 'BBBCB5678E',
    city: 'Kolkata',
    state: 'West Bengal',
    paymentTerms: '45 Days Net',
    bookCount: 0,
  },
];

export const INITIAL_TAXONOMIES: TaxonomyItem[] = [
  { id: 'tax_1', type: 'CATEGORY', code: 'CAT-ACAD', name: 'Academic & School Textbooks', description: 'Curriculum-aligned K-12 and university textbooks' },
  { id: 'tax_2', type: 'CATEGORY', code: 'CAT-REF', name: 'Higher Education & Reference', description: 'Specialist academic monographs and reference encyclopedias' },
  { id: 'tax_3', type: 'CATEGORY', code: 'CAT-COMP', name: 'Competitive Exam Guides', description: 'JEE, NEET, UPSC, and Banking preparatory guides' },
  { id: 'tax_4', type: 'SUBJECT', code: 'SUB-MATH', name: 'Mathematics', description: 'Algebra, Calculus, Geometry, and Statistics' },
  { id: 'tax_5', type: 'SUBJECT', code: 'SUB-PHY', name: 'Physics', description: 'Mechanics, Optics, Thermodynamics, Electromagnetism' },
  { id: 'tax_6', type: 'SUBJECT', code: 'SUB-CHEM', name: 'Chemistry', description: 'Physical, Organic, and Inorganic Chemistry' },
  { id: 'tax_7', type: 'BINDING', code: 'BIND-PB', name: 'Paperback with Section Sewing', description: 'Perfect bound with thread sewn sections for durability' },
  { id: 'tax_8', type: 'BINDING', code: 'BIND-HC', name: 'Hardcover Deluxe Case Binding', description: 'Straw board hard bound with foil embossing' },
  { id: 'tax_9', type: 'BOOK_SIZE', code: 'SIZE-ROYAL', name: 'Royal 8vo (240mm x 165mm)', description: 'Industry standard for higher academic textbooks' },
  { id: 'tax_10', type: 'BOOK_SIZE', code: 'SIZE-CROWN', name: 'Crown 4to (250mm x 190mm)', description: 'Format suitable for illustrated reference works' },
  { id: 'tax_11', type: 'DISCOUNT_SCHEME', code: 'DISC-WH-40', name: 'Wholesale Trade Slab (40% Off MRP)', description: 'Primary wholesale distributor discount' },
  { id: 'tax_12', type: 'DISCOUNT_SCHEME', code: 'DISC-RET-25', name: 'Retail Bookstore Slab (25% Off MRP)', description: 'Direct over-the-counter retailer slab' },
];

export const INITIAL_PARTIES: PartyItem[] = [
  {
    id: 'pty_oxford',
    partyType: 'DISTRIBUTOR',
    name: 'Oxford Book Store & Distributors Ltd.',
    code: 'DIST-OXF-001',
    contactPerson: 'Rameshwar Dayal',
    phone: '+91 11 2341 5566',
    email: 'wholesale@oxfordbooks.in',
    gstin: '07AAACR1234A1Z1',
    pan: 'AAACR1234A',
    city: 'New Delhi',
    state: 'Delhi',
    creditLimit: 5000000,
    creditDays: 45,
    discountRate: 40.0,
    paymentTerms: 'RTGS / Cheque within 45 days',
  },
  {
    id: 'pty_dps',
    partyType: 'INSTITUTION_SCHOOL',
    name: 'Delhi Public School Society (Central Store)',
    code: 'INST-DPS-004',
    contactPerson: 'Smt. Ananya Sen (Headmistress)',
    phone: '+91 11 4356 7890',
    email: 'books@dpsmathuraroad.org',
    gstin: '07AAAAD1122D1Z9',
    pan: 'AAAAD1122D',
    city: 'New Delhi',
    state: 'Delhi',
    creditLimit: 2500000,
    creditDays: 30,
    discountRate: 20.0,
    paymentTerms: 'Payment on semester receipt',
  },
  {
    id: 'pty_paper_mill',
    partyType: 'SUPPLIER',
    name: 'Century Paper Mills & Board Suppliers',
    code: 'SUP-BILT-002',
    contactPerson: 'Gautam Thapar',
    phone: '+91 172 254 3321',
    email: 'sales@centurypaper.com',
    gstin: '03AAACB7788B1Z4',
    pan: 'AAACB7788B',
    city: 'Chandigarh',
    state: 'Punjab',
    creditLimit: 4000000,
    creditDays: 30,
    discountRate: 0,
    paymentTerms: 'Against LC / Advance',
  },
];

const BOOKS_KEY = 'kibo360_catalogue_books_v2';
const AUTHORS_KEY = 'kibo360_catalogue_authors_v2';
const PUBLISHERS_KEY = 'kibo360_catalogue_publishers_v2';
const TAXONOMIES_KEY = 'kibo360_catalogue_taxonomies_v2';
const PARTIES_KEY = 'kibo360_catalogue_parties_v2';

// Books Helpers
export function getStoredBooks(): BookItem[] {
  try {
    const raw = localStorage.getItem(BOOKS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}
  saveStoredBooks(INITIAL_BOOKS);
  return INITIAL_BOOKS;
}

export function saveStoredBooks(books: BookItem[]): void {
  try {
    localStorage.setItem(BOOKS_KEY, JSON.stringify(books));
  } catch {}
}

export function saveBookItem(book: Partial<BookItem> & { title: string; isbn13: string; sku: string }): BookItem {
  const current = getStoredBooks();
  if (book.id) {
    const updated = current.map((b) => (b.id === book.id ? ({ ...b, ...book } as BookItem) : b));
    saveStoredBooks(updated);
    return updated.find((b) => b.id === book.id)!;
  } else {
    const created: BookItem = {
      id: 'bk_' + Date.now(),
      parentTitleId: book.parentTitleId || 'wrk_' + Date.now(),
      title: book.title,
      subtitle: book.subtitle,
      isbn10: book.isbn10,
      isbn13: book.isbn13,
      sku: book.sku,
      barcode: book.barcode || book.isbn13,
      authorId: book.authorId,
      authorName: book.authorName || 'Staff Author',
      publisherId: book.publisherId,
      publisherName: book.publisherName || 'Apex Educational Publishers',
      edition: book.edition || '1st Edition',
      volume: book.volume,
      language: book.language || 'English',
      subject: book.subject || 'General',
      category: book.category || 'Academic & School Textbooks',
      publicationYear: Number(book.publicationYear) || new Date().getFullYear(),
      numberOfPages: Number(book.numberOfPages) || 100,
      bindingType: book.bindingType || 'Paperback with Section Sewing',
      bookSize: book.bookSize || 'Royal 8vo (240mm x 165mm)',
      printingFormat: book.printingFormat || '2 Colour Offset',
      hsnSacCode: book.hsnSacCode || '4901',
      taxRate: Number(book.taxRate) || 0,
      mrp: Number(book.mrp) || 0,
      wholesalePrice: Number(book.wholesalePrice) || Math.round((Number(book.mrp) || 0) * 0.6),
      dealerPrice: Number(book.dealerPrice) || Math.round((Number(book.mrp) || 0) * 0.75),
      purchaseCost: Number(book.purchaseCost) || Math.round((Number(book.mrp) || 0) * 0.35),
      openingStock: Number(book.openingStock) || 0,
      reorderLevel: Number(book.reorderLevel) || 100,
      warehouseId: book.warehouseId || 'Delhi Central Godown',
      rackShelf: book.rackShelf,
      description: book.description,
      status: book.status || 'ACTIVE',
    };
    saveStoredBooks([created, ...current]);
    return created;
  }
}

export function deleteBookItem(id: string): void {
  const current = getStoredBooks();
  saveStoredBooks(current.filter((b) => b.id !== id));
}

// Authors Helpers
export function getStoredAuthors(): AuthorItem[] {
  try {
    const raw = localStorage.getItem(AUTHORS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}
  saveStoredAuthors(INITIAL_AUTHORS);
  return INITIAL_AUTHORS;
}

export function saveStoredAuthors(authors: AuthorItem[]): void {
  try {
    localStorage.setItem(AUTHORS_KEY, JSON.stringify(authors));
  } catch {}
}

export function saveAuthorItem(author: Partial<AuthorItem> & { name: string; email: string; phone: string; pan: string }): AuthorItem {
  const current = getStoredAuthors();
  if (author.id) {
    const updated = current.map((a) => (a.id === author.id ? ({ ...a, ...author } as AuthorItem) : a));
    saveStoredAuthors(updated);
    return updated.find((a) => a.id === author.id)!;
  } else {
    const created: AuthorItem = {
      id: 'auth_' + Date.now(),
      name: author.name,
      pseudonym: author.pseudonym,
      bio: author.bio,
      email: author.email,
      phone: author.phone,
      pan: author.pan,
      bankDetails: author.bankDetails || {
        accountName: author.name,
        accountNumber: '9180100' + Math.floor(10000000 + Math.random() * 90000000),
        bankName: 'HDFC Bank Ltd.',
        ifsc: 'HDFC0000053',
        branch: 'Central Branch',
      },
      royaltyAgreementNumber: author.royaltyAgreementNumber || `AGR-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
      royaltyType: author.royaltyType || 'PERCENTAGE_ON_MRP',
      royaltyRate: Number(author.royaltyRate) || 10.0,
      paymentTerms: author.paymentTerms || 'Quarterly Settlement',
      bookCount: 0,
    };
    saveStoredAuthors([created, ...current]);
    return created;
  }
}

export function deleteAuthorItem(id: string): void {
  const current = getStoredAuthors();
  saveStoredAuthors(current.filter((a) => a.id !== id));
}

// Publishers Helpers
export function getStoredPublishers(): PublisherItem[] {
  try {
    const raw = localStorage.getItem(PUBLISHERS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}
  saveStoredPublishers(INITIAL_PUBLISHERS);
  return INITIAL_PUBLISHERS;
}

export function saveStoredPublishers(publishers: PublisherItem[]): void {
  try {
    localStorage.setItem(PUBLISHERS_KEY, JSON.stringify(publishers));
  } catch {}
}

export function savePublisherItem(pub: Partial<PublisherItem> & { name: string; code: string }): PublisherItem {
  const current = getStoredPublishers();
  if (pub.id) {
    const updated = current.map((p) => (p.id === pub.id ? ({ ...p, ...pub } as PublisherItem) : p));
    saveStoredPublishers(updated);
    return updated.find((p) => p.id === pub.id)!;
  } else {
    const created: PublisherItem = {
      id: 'pub_' + Date.now(),
      name: pub.name,
      code: pub.code,
      contactPerson: pub.contactPerson || 'Publishing Director',
      email: pub.email || 'contact@publisher.in',
      phone: pub.phone || '+91 11 0000 0000',
      gstin: pub.gstin || '07AAAAA0000A1Z5',
      pan: pub.pan || 'AAACA1234D',
      city: pub.city || 'New Delhi',
      state: pub.state || 'Delhi',
      paymentTerms: pub.paymentTerms || '30 Days Net',
      bookCount: 0,
    };
    saveStoredPublishers([created, ...current]);
    return created;
  }
}

export function deletePublisherItem(id: string): void {
  const current = getStoredPublishers();
  saveStoredPublishers(current.filter((p) => p.id !== id));
}

// Taxonomies Helpers
export function getStoredTaxonomies(): TaxonomyItem[] {
  try {
    const raw = localStorage.getItem(TAXONOMIES_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}
  saveStoredTaxonomies(INITIAL_TAXONOMIES);
  return INITIAL_TAXONOMIES;
}

export function saveStoredTaxonomies(tax: TaxonomyItem[]): void {
  try {
    localStorage.setItem(TAXONOMIES_KEY, JSON.stringify(tax));
  } catch {}
}

export function saveTaxonomyItem(item: Partial<TaxonomyItem> & { name: string; code: string; type: TaxonomyItem['type'] }): TaxonomyItem {
  const current = getStoredTaxonomies();
  if (item.id) {
    const updated = current.map((t) => (t.id === item.id ? ({ ...t, ...item } as TaxonomyItem) : t));
    saveStoredTaxonomies(updated);
    return updated.find((t) => t.id === item.id)!;
  } else {
    const created: TaxonomyItem = {
      id: 'tax_' + Date.now(),
      type: item.type,
      code: item.code,
      name: item.name,
      description: item.description || '',
    };
    saveStoredTaxonomies([created, ...current]);
    return created;
  }
}

export function deleteTaxonomyItem(id: string): void {
  const current = getStoredTaxonomies();
  saveStoredTaxonomies(current.filter((t) => t.id !== id));
}

// Parties Helpers
export function getStoredParties(): PartyItem[] {
  try {
    const raw = localStorage.getItem(PARTIES_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}
  saveStoredParties(INITIAL_PARTIES);
  return INITIAL_PARTIES;
}

export function saveStoredParties(parties: PartyItem[]): void {
  try {
    localStorage.setItem(PARTIES_KEY, JSON.stringify(parties));
  } catch {}
}

export function savePartyItem(party: Partial<PartyItem> & { name: string; code: string; partyType: PartyItem['partyType'] }): PartyItem {
  const current = getStoredParties();
  if (party.id) {
    const updated = current.map((p) => (p.id === party.id ? ({ ...p, ...party } as PartyItem) : p));
    saveStoredParties(updated);
    return updated.find((p) => p.id === party.id)!;
  } else {
    const created: PartyItem = {
      id: 'pty_' + Date.now(),
      partyType: party.partyType,
      name: party.name,
      code: party.code,
      contactPerson: party.contactPerson || 'Store In-charge',
      phone: party.phone || '+91 98000 00000',
      email: party.email || 'accounts@party.com',
      gstin: party.gstin || '07AAACR1234A1Z1',
      pan: party.pan || 'AAACR1234A',
      city: party.city || 'New Delhi',
      state: party.state || 'Delhi',
      creditLimit: Number(party.creditLimit) || 1000000,
      creditDays: Number(party.creditDays) || 30,
      discountRate: Number(party.discountRate) || 25,
      paymentTerms: party.paymentTerms || '30 Days Credit',
    };
    saveStoredParties([created, ...current]);
    return created;
  }
}

export function deletePartyItem(id: string): void {
  const current = getStoredParties();
  saveStoredParties(current.filter((p) => p.id !== id));
}

// Reset Everything in Catalogue to Factory Defaults
export function resetCatalogueToDefaults(): void {
  saveStoredBooks(INITIAL_BOOKS);
  saveStoredAuthors(INITIAL_AUTHORS);
  saveStoredPublishers(INITIAL_PUBLISHERS);
  saveStoredTaxonomies(INITIAL_TAXONOMIES);
  saveStoredParties(INITIAL_PARTIES);
}

// ISBN-13 Checksum Generator / Validator (EAN-13 Algorithm)
export function generateValidIsbn13(prefix: string = '97881'): string {
  // 978-81 is India book identifier prefix
  let base = prefix + String(Math.floor(1000000 + Math.random() * 9000000)).slice(0, 12 - prefix.length);
  while (base.length < 12) {
    base += '0';
  }
  
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    const digit = parseInt(base[i], 10);
    sum += i % 2 === 0 ? digit : digit * 3;
  }
  const checkDigit = (10 - (sum % 10)) % 10;
  return base + String(checkDigit);
}

export function validateIsbn13(isbn: string): boolean {
  const clean = isbn.replace(/[-\s]/g, '');
  if (clean.length !== 13 || !/^\d{13}$/.test(clean)) return false;
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    const digit = parseInt(clean[i], 10);
    sum += i % 2 === 0 ? digit : digit * 3;
  }
  const checkDigit = (10 - (sum % 10)) % 10;
  return checkDigit === parseInt(clean[12], 10);
}
