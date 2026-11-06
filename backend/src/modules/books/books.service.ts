import {
  BookItem,
  AuthorItem,
  PublisherItem,
  MasterTaxonomyItem,
  PartyItem,
  BooksQueryFilters,
  BulkImportResult,
  BulkImportError,
} from './books.types';
import { AppError } from '../../middleware/errorHandler';

// In-Memory Storage Maps for Fast Multi-Tenant Testing & Production Sync
const booksStore = new Map<string, BookItem>();
const authorsStore = new Map<string, AuthorItem>();
const publishersStore = new Map<string, PublisherItem>();
const taxonomiesStore = new Map<string, MasterTaxonomyItem>();
const partiesStore = new Map<string, PartyItem>();

export class BooksService {
  constructor() {
    this.seedDefaultMasters();
  }

  // --------------------------------------------------------------------------
  // SEED INITIAL MASTER DATA
  // --------------------------------------------------------------------------
  private seedDefaultMasters() {
    const defaultCompanyId = 'cmp_default_publisher';

    // 1. Authors
    const defaultAuthors: AuthorItem[] = [
      {
        id: 'auth_sharma_rd',
        companyId: defaultCompanyId,
        name: 'Dr. R. D. Sharma',
        pseudonym: 'Prof. Sharma',
        bio: 'Distinguished Professor and Author of leading Mathematics textbooks in India.',
        email: 'rdsharma@academicauthors.org',
        phone: '+91-98110-12345',
        address: 'B-42, Gulmohar Park',
        city: 'New Delhi',
        state: 'Delhi',
        country: 'India',
        pan: 'AAAPS1234C',
        bankDetails: {
          accountName: 'Dr. R. D. Sharma',
          accountNumber: '918010045678912',
          bankName: 'HDFC Bank Ltd.',
          ifsc: 'HDFC0000123',
          branch: 'Green Park, New Delhi',
        },
        royaltyAgreementNumber: 'AGR-AUTH-2024-001',
        royaltyStartDate: '2024-04-01T00:00:00.000Z',
        royaltyEndDate: '2029-03-31T23:59:59.000Z',
        royaltyType: 'PERCENTAGE_ON_MRP',
        royaltyRate: 12.5,
        paymentTerms: 'Semi-Annual',
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'auth_hc_verma',
        companyId: defaultCompanyId,
        name: 'Prof. H. C. Verma',
        pseudonym: 'HCV',
        bio: 'Renowned Experimental Physicist, Academician, and Padma Shri Awardee.',
        email: 'hcverma@iitkphysics.ac.in',
        phone: '+91-98390-54321',
        address: 'IIT Campus, Kalyanpur',
        city: 'Kanpur',
        state: 'Uttar Pradesh',
        country: 'India',
        pan: 'ABCPH5678K',
        bankDetails: {
          accountName: 'Harish Chandra Verma',
          accountNumber: '10892345098',
          bankName: 'State Bank of India',
          ifsc: 'SBIN0001161',
          branch: 'IIT Kanpur Branch',
        },
        royaltyAgreementNumber: 'AGR-AUTH-2023-018',
        royaltyStartDate: '2023-01-01T00:00:00.000Z',
        royaltyEndDate: '2028-12-31T23:59:59.000Z',
        royaltyType: 'PERCENTAGE_ON_MRP',
        royaltyRate: 15.0,
        paymentTerms: 'Quarterly',
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'auth_premchand',
        companyId: defaultCompanyId,
        name: 'Munshi Premchand (Literary Trust)',
        pseudonym: 'Nawab Rai',
        bio: 'Pioneer of modern Hindi and Urdu literature.',
        email: 'premchand.trust@bhasha.in',
        phone: '+91-94520-88990',
        address: 'Lamhi Heritage Complex',
        city: 'Varanasi',
        state: 'Uttar Pradesh',
        country: 'India',
        pan: 'AABTP7890M',
        bankDetails: {
          accountName: 'Premchand Memorial Sahitya Trust',
          accountNumber: '302456712390',
          bankName: 'Punjab National Bank',
          ifsc: 'PUNB0123400',
          branch: 'Cantonment, Varanasi',
        },
        royaltyAgreementNumber: 'AGR-TRUST-2020-004',
        royaltyStartDate: '2020-01-01T00:00:00.000Z',
        royaltyEndDate: '2030-12-31T23:59:59.000Z',
        royaltyType: 'PERCENTAGE_ON_NET_SALES',
        royaltyRate: 10.0,
        paymentTerms: 'Annual',
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    defaultAuthors.forEach((a) => authorsStore.set(a.id, a));

    // 2. Publishers
    const defaultPublishers: PublisherItem[] = [
      {
        id: 'pub_apex_publishing',
        companyId: defaultCompanyId,
        name: 'Apex Educational Publishers & Distributors Ltd.',
        code: 'APEX-PUB',
        contactPerson: 'Mr. R. K. Singhal, MD',
        email: 'md@apexpublishers.com',
        phone: '+91-11-2327-0001',
        website: 'https://www.apexpublishers.com',
        gstin: '07AAACA1234A1Z5',
        pan: 'AAACA1234A',
        address: '4735/22, Ansari Road, Daryaganj',
        city: 'New Delhi',
        state: 'Delhi',
        country: 'India',
        paymentTerms: 'Net 60',
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'pub_cambridge_press',
        companyId: defaultCompanyId,
        name: 'Cambridge Academic Publications Ltd.',
        code: 'CAM-ACAD',
        contactPerson: 'Ms. Elizabeth George',
        email: 'licensing@cambridgeacademic.co.in',
        phone: '+91-22-2654-8900',
        website: 'https://www.cambridgeacademic.co.in',
        gstin: '27AABBC5678C1Z2',
        pan: 'AABBC5678C',
        address: 'Bandra-Kurla Complex, Bandra East',
        city: 'Mumbai',
        state: 'Maharashtra',
        country: 'India',
        paymentTerms: 'Net 45',
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    defaultPublishers.forEach((p) => publishersStore.set(p.id, p));

    // 3. Auxiliary Masters & Taxonomies
    const defaultTaxonomies: MasterTaxonomyItem[] = [
      { id: 'tax_cat_01', companyId: defaultCompanyId, type: 'CATEGORY', code: 'CAT-ACAD', name: 'Academic & School Textbooks', isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      { id: 'tax_cat_02', companyId: defaultCompanyId, type: 'CATEGORY', code: 'CAT-COMP', name: 'Competitive Exams (JEE / NEET / UPSC)', isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      { id: 'tax_cat_03', companyId: defaultCompanyId, type: 'CATEGORY', code: 'CAT-LIT', name: 'Indian Classical Literature & Fiction', isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      { id: 'tax_sub_01', companyId: defaultCompanyId, type: 'SUBJECT', code: 'SUB-MATH', name: 'Mathematics', isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      { id: 'tax_sub_02', companyId: defaultCompanyId, type: 'SUBJECT', code: 'SUB-PHY', name: 'Physics & Applied Sciences', isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      { id: 'tax_sub_03', companyId: defaultCompanyId, type: 'SUBJECT', code: 'SUB-HIN', name: 'Hindi Literature & Sahitya', isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      { id: 'tax_lang_01', companyId: defaultCompanyId, type: 'LANGUAGE', code: 'LANG-ENG', name: 'English', isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      { id: 'tax_lang_02', companyId: defaultCompanyId, type: 'LANGUAGE', code: 'LANG-HIN', name: 'Hindi', isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      { id: 'tax_bind_01', companyId: defaultCompanyId, type: 'BINDING_TYPE', code: 'BIND-PB', name: 'Paperback (Perfect Bound)', isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      { id: 'tax_bind_02', companyId: defaultCompanyId, type: 'BINDING_TYPE', code: 'BIND-HC', name: 'Hardcover (Section Sewn with Jacket)', isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      { id: 'tax_paper_01', companyId: defaultCompanyId, type: 'PAPER_TYPE', code: 'PAP-70MAP', name: '70 GSM Super Maplitho Cream', metadata: { gsm: 70 }, isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      { id: 'tax_uom_01', companyId: defaultCompanyId, type: 'UOM', code: 'UOM-COP', name: 'Copies', isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      { id: 'tax_uom_02', companyId: defaultCompanyId, type: 'UOM', code: 'UOM-SET', name: 'Sets', isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      { id: 'tax_wh_01', companyId: defaultCompanyId, type: 'WAREHOUSE', code: 'WH-DEL-C', name: 'Delhi Central Depot', metadata: { city: 'New Delhi', capacityCartons: 50000 }, isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      { id: 'tax_rack_01', companyId: defaultCompanyId, type: 'RACK_SHELF', code: 'RACK-A1-03', name: 'Aisle A, Rack 01, Shelf 03', isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      { id: 'tax_disc_01', companyId: defaultCompanyId, type: 'DISCOUNT_SCHEME', code: 'DISC-DIST-40', name: 'National Distributor Slab (40% off MRP)', metadata: { discountPercent: 40 }, isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      { id: 'tax_disc_02', companyId: defaultCompanyId, type: 'DISCOUNT_SCHEME', code: 'DISC-RET-25', name: 'Bookstore Retailer Slab (25% off MRP)', metadata: { discountPercent: 25 }, isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    ];

    defaultTaxonomies.forEach((t) => taxonomiesStore.set(t.id, t));

    // 4. Party Masters (Customers, Suppliers, Dealers, Distributors, Schools, Transporters)
    const defaultParties: PartyItem[] = [
      {
        id: 'pty_dist_national',
        companyId: defaultCompanyId,
        partyType: 'DISTRIBUTOR',
        name: 'National Book Distributors Pvt. Ltd.',
        code: 'DIST-001',
        contactPerson: 'Vikas Aggarwal',
        email: 'sales@nationalbookdist.com',
        phone: '+91-11-2328-9900',
        mobile: '+91-98101-77889',
        gstin: '07AAACN5432D1Z9',
        pan: 'AAACN5432D',
        billingAddress: '4820/24, Prahlad Street, Ansari Road',
        shippingAddress: 'Godown No. 4, Transport Nagar, Azadpur',
        city: 'New Delhi',
        state: 'Delhi',
        stateCode: '07',
        pincode: '110002',
        creditLimit: 2500000.0,
        creditDays: 60,
        discountRate: 40.0,
        paymentTerms: 'Net 60',
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'pty_school_dps',
        companyId: defaultCompanyId,
        partyType: 'INSTITUTION_SCHOOL',
        name: 'Delhi Public School Educational Society',
        code: 'SCH-DPS-001',
        contactPerson: 'Bursar & Academic Head',
        email: 'books@dpsmathuraroad.org',
        phone: '+91-11-4356-1122',
        mobile: '+91-99100-33445',
        gstin: '07AAAAA0000A1Z5',
        pan: 'AAAAA0000A',
        billingAddress: 'Sector 12, R. K. Puram',
        city: 'New Delhi',
        state: 'Delhi',
        stateCode: '07',
        pincode: '110022',
        creditLimit: 1000000.0,
        creditDays: 30,
        discountRate: 20.0,
        paymentTerms: 'Net 30',
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'pty_supp_papermill',
        companyId: defaultCompanyId,
        partyType: 'SUPPLIER',
        name: 'Ballarpur Paper & Pulp Mills Ltd.',
        code: 'SUP-BILT-01',
        contactPerson: 'M. S. Oberoi',
        email: 'institutional@biltpaper.in',
        phone: '+91-124-409-9000',
        mobile: '+91-98711-22334',
        gstin: '06AAACB9876E1Z1',
        pan: 'AAACB9876E',
        billingAddress: 'First India Place, MG Road',
        city: 'Gurugram',
        state: 'Haryana',
        stateCode: '06',
        pincode: '122002',
        creditLimit: 5000000.0,
        creditDays: 45,
        discountRate: 5.0,
        paymentTerms: 'Net 45',
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'pty_trans_vrl',
        companyId: defaultCompanyId,
        partyType: 'TRANSPORTER',
        name: 'VRL Logistics Express Ltd.',
        code: 'TRN-VRL-01',
        contactPerson: 'Operations Controller',
        email: 'delhi.hub@vrllogistics.com',
        phone: '+91-11-2789-4455',
        gstin: '29AAACV4321F1ZX',
        pan: 'AAACV4321F',
        billingAddress: 'Hub No. 12, Ring Road Transport Centre',
        city: 'New Delhi',
        state: 'Delhi',
        creditLimit: 200000.0,
        creditDays: 15,
        discountRate: 0.0,
        paymentTerms: 'Fortnightly',
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    defaultParties.forEach((p) => partiesStore.set(p.id, p));

    // 5. Book Master Seed Catalog (Including multiple editions, languages, and formats of the same title)
    // Work / Parent Title 1: "Mathematics for Senior Secondary Class XII"
    const parentTitleMath = 'wrk_math_class_12';

    const defaultBooks: BookItem[] = [
      {
        id: 'bk_math_12_eng_pb',
        companyId: defaultCompanyId,
        parentTitleId: parentTitleMath,
        title: 'Mathematics for Class XII (Vol 1 & 2 Complete Set)',
        subtitle: 'Comprehensive CBSE & Competitive Foundation Guide',
        isbn10: '8177099850',
        isbn13: '9788177099859',
        sku: 'BK-MATH-12-ENG-PB',
        barcode: '9788177099859',
        authorId: 'auth_sharma_rd',
        authorName: 'Dr. R. D. Sharma',
        coAuthors: ['Prof. Sanjay Sharma'],
        publisherId: 'pub_apex_publishing',
        publisherName: 'Apex Educational Publishers & Distributors Ltd.',
        edition: '2026 Revised Edition',
        volume: 'Vol 1 & 2',
        language: 'English',
        subject: 'Mathematics',
        category: 'Academic & School Textbooks',
        subcategory: 'CBSE Grade 12',
        publicationDate: '2026-01-15T00:00:00.000Z',
        publicationYear: 2026,
        numberOfPages: 1248,
        bindingType: 'Paperback',
        bookSize: 'Royal 8vo',
        printingFormat: '2 Color',
        hsnSacCode: '4901',
        taxRate: 0.0,
        mrp: 995.0,
        wholesalePrice: 597.0, // 40% distributor margin
        dealerPrice: 746.25, // 25% dealer margin
        purchaseCost: 350.0, // Print & paper cost
        openingStock: 2500,
        reorderLevel: 250,
        warehouseId: 'tax_wh_01',
        rackShelf: 'RACK-A1-03',
        description: 'Standard benchmark reference textbook for CBSE Class 12 Board examinations and engineering entrance preparation.',
        status: 'ACTIVE',
        isActive: true,
        isDeleted: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'bk_math_12_hin_pb',
        companyId: defaultCompanyId,
        parentTitleId: parentTitleMath,
        title: 'कक्षा 12 के लिए गणित (भाग 1 एवं 2 सम्पूर्ण सेट)',
        subtitle: 'सीबीएसई एवं राज्य बोर्ड परीक्षाओं के लिए प्रामाणिक मार्गदर्शिका',
        isbn10: '8177099869',
        isbn13: '9788177099866',
        sku: 'BK-MATH-12-HIN-PB',
        barcode: '9788177099866',
        authorId: 'auth_sharma_rd',
        authorName: 'Dr. R. D. Sharma',
        coAuthors: ['डॉ. रामेश्वर प्रसाद'],
        publisherId: 'pub_apex_publishing',
        publisherName: 'Apex Educational Publishers & Distributors Ltd.',
        edition: '2026 प्रथम हिन्दी संस्करण',
        volume: 'भाग 1 एवं 2',
        language: 'Hindi',
        subject: 'Mathematics',
        category: 'Academic & School Textbooks',
        subcategory: 'State Boards & CBSE Hindi Medium',
        publicationDate: '2026-02-01T00:00:00.000Z',
        publicationYear: 2026,
        numberOfPages: 1280,
        bindingType: 'Paperback',
        bookSize: 'Royal 8vo',
        printingFormat: '2 Color',
        hsnSacCode: '4901',
        taxRate: 0.0,
        mrp: 950.0,
        wholesalePrice: 570.0,
        dealerPrice: 712.5,
        purchaseCost: 340.0,
        openingStock: 1800,
        reorderLevel: 200,
        warehouseId: 'tax_wh_01',
        rackShelf: 'RACK-A1-04',
        description: 'हिन्दी माध्यम के विद्यार्थियों हेतु पूर्ण पाठ्यक्रम पर आधारित उच्चस्तरीय गणित पाठ्यपुस्तक।',
        status: 'ACTIVE',
        isActive: true,
        isDeleted: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'bk_math_12_eng_hc',
        companyId: defaultCompanyId,
        parentTitleId: parentTitleMath,
        title: 'Mathematics for Class XII (Deluxe Library Edition)',
        subtitle: 'Hardbound Reference Edition for School Libraries & Lecturers',
        isbn10: '8177099877',
        isbn13: '9788177099873',
        sku: 'BK-MATH-12-ENG-HC',
        barcode: '9788177099873',
        authorId: 'auth_sharma_rd',
        authorName: 'Dr. R. D. Sharma',
        coAuthors: ['Prof. Sanjay Sharma'],
        publisherId: 'pub_apex_publishing',
        publisherName: 'Apex Educational Publishers & Distributors Ltd.',
        edition: '2026 Library Edition',
        volume: 'Vol 1 & 2 (Combined)',
        language: 'English',
        subject: 'Mathematics',
        category: 'Academic & School Textbooks',
        subcategory: 'Library & Institutional Reference',
        publicationDate: '2026-01-20T00:00:00.000Z',
        publicationYear: 2026,
        numberOfPages: 1264,
        bindingType: 'Hardcover',
        bookSize: 'Crown 4to',
        printingFormat: '4 Color Full Bleed',
        hsnSacCode: '4901',
        taxRate: 0.0,
        mrp: 1450.0,
        wholesalePrice: 870.0,
        dealerPrice: 1087.5,
        purchaseCost: 550.0,
        openingStock: 650,
        reorderLevel: 80,
        warehouseId: 'tax_wh_01',
        rackShelf: 'RACK-A1-05',
        description: 'Hardbound section sewn edition with gold foil stamping for institutional libraries.',
        status: 'ACTIVE',
        isActive: true,
        isDeleted: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      // Work 2: Concepts of Physics
      {
        id: 'bk_physics_part1',
        companyId: defaultCompanyId,
        parentTitleId: 'wrk_physics_hcv',
        title: 'Concepts of Physics (Part 1)',
        subtitle: 'Mechanics, Waves, Thermodynamics & Optics',
        isbn10: '8177091876',
        isbn13: '9788177091877',
        sku: 'BK-PHY-HCV-01',
        barcode: '9788177091877',
        authorId: 'auth_hc_verma',
        authorName: 'Prof. H. C. Verma',
        publisherId: 'pub_apex_publishing',
        publisherName: 'Apex Educational Publishers & Distributors Ltd.',
        edition: '3rd Classic Edition',
        volume: 'Part 1',
        language: 'English',
        subject: 'Physics & Applied Sciences',
        category: 'Competitive Exams (JEE / NEET / UPSC)',
        subcategory: 'JEE Advanced Foundation',
        publicationDate: '2025-06-01T00:00:00.000Z',
        publicationYear: 2025,
        numberOfPages: 462,
        bindingType: 'Paperback',
        bookSize: 'Royal 8vo',
        printingFormat: '2 Color',
        hsnSacCode: '4901',
        taxRate: 0.0,
        mrp: 495.0,
        wholesalePrice: 297.0,
        dealerPrice: 371.25,
        purchaseCost: 160.0,
        openingStock: 5000,
        reorderLevel: 500,
        warehouseId: 'tax_wh_01',
        rackShelf: 'RACK-B2-01',
        description: 'Indispensable physics classic for IIT-JEE aspirants with conceptual rigor and analytical problems.',
        status: 'ACTIVE',
        isActive: true,
        isDeleted: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      // Work 3: Godan by Munshi Premchand
      {
        id: 'bk_lit_godan_hin',
        companyId: defaultCompanyId,
        parentTitleId: 'wrk_godan_premchand',
        title: 'गोदान (उपन्यास)',
        subtitle: 'भारतीय कृषक जीवन की अमर महागाथा',
        isbn10: '8126700018',
        isbn13: '9788126700011',
        sku: 'BK-LIT-GODAN-HIN',
        barcode: '9788126700011',
        authorId: 'auth_premchand',
        authorName: 'Munshi Premchand (Literary Trust)',
        publisherId: 'pub_apex_publishing',
        publisherName: 'Apex Educational Publishers & Distributors Ltd.',
        edition: 'Centenary Commemorative Edition',
        language: 'Hindi',
        subject: 'Hindi Literature & Sahitya',
        category: 'Indian Classical Literature & Fiction',
        subcategory: 'Hindi Novel Masterpieces',
        publicationDate: '2025-01-01T00:00:00.000Z',
        publicationYear: 2025,
        numberOfPages: 368,
        bindingType: 'Paperback',
        bookSize: 'Demy 8vo',
        printingFormat: '1 Color',
        hsnSacCode: '4901',
        taxRate: 0.0,
        mrp: 275.0,
        wholesalePrice: 165.0,
        dealerPrice: 206.25,
        purchaseCost: 75.0,
        openingStock: 3200,
        reorderLevel: 300,
        warehouseId: 'tax_wh_01',
        rackShelf: 'RACK-C1-02',
        description: 'मुंशी प्रेमचंद का कालजयी उपन्यास जो भारतीय ग्रामीण समाज और किसान होरी के संघर्ष को चित्रित करता है।',
        status: 'ACTIVE',
        isActive: true,
        isDeleted: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    defaultBooks.forEach((b) => booksStore.set(b.id, b));
  }

  // --------------------------------------------------------------------------
  // BOOK CATALOGUE METHODS
  // --------------------------------------------------------------------------
  async getAll(filters?: BooksQueryFilters): Promise<{ items: BookItem[]; total: number }> {
    let list = Array.from(booksStore.values()).filter((b) => !b.isDeleted);

    if (filters?.companyId) {
      list = list.filter((b) => b.companyId === filters.companyId);
    }
    if (filters?.search) {
      const q = filters.search.toLowerCase().trim();
      list = list.filter(
        (b) =>
          b.title.toLowerCase().includes(q) ||
          b.sku.toLowerCase().includes(q) ||
          (b.isbn13 && b.isbn13.includes(q)) ||
          (b.isbn10 && b.isbn10.includes(q)) ||
          b.authorName.toLowerCase().includes(q) ||
          b.subject.toLowerCase().includes(q)
      );
    }
    if (filters?.category) {
      list = list.filter((b) => b.category === filters.category);
    }
    if (filters?.subject) {
      list = list.filter((b) => b.subject === filters.subject);
    }
    if (filters?.language) {
      list = list.filter((b) => b.language === filters.language);
    }
    if (filters?.authorId) {
      list = list.filter((b) => b.authorId === filters.authorId);
    }
    if (filters?.publisherId) {
      list = list.filter((b) => b.publisherId === filters.publisherId);
    }
    if (filters?.status) {
      list = list.filter((b) => b.status === filters.status);
    }
    if (filters?.parentTitleId) {
      list = list.filter((b) => b.parentTitleId === filters.parentTitleId);
    }

    const total = list.length;
    const page = filters?.page || 1;
    const limit = filters?.limit || 50;
    const startIndex = (page - 1) * limit;
    const items = list.slice(startIndex, startIndex + limit);

    return { items, total };
  }

  async getById(id: string): Promise<BookItem | null> {
    const book = booksStore.get(id);
    if (!book || book.isDeleted) return null;
    return book;
  }

  async create(data: Partial<BookItem>, companyId: string = 'cmp_default_publisher'): Promise<BookItem> {
    // 1. Duplicate SKU check
    const existingSku = Array.from(booksStore.values()).find(
      (b) => !b.isDeleted && b.companyId === companyId && b.sku.toLowerCase() === (data.sku || '').toLowerCase()
    );
    if (existingSku) {
      throw new AppError(`A book with SKU '${data.sku}' already exists in the catalogue.`, 409);
    }

    // 2. Duplicate ISBN-13 check
    if (data.isbn13) {
      const existingIsbn13 = Array.from(booksStore.values()).find(
        (b) => !b.isDeleted && b.companyId === companyId && b.isbn13 === data.isbn13
      );
      if (existingIsbn13) {
        throw new AppError(`A book with ISBN-13 '${data.isbn13}' already exists: "${existingIsbn13.title}".`, 409);
      }
    }

    // 3. Duplicate ISBN-10 check
    if (data.isbn10) {
      const existingIsbn10 = Array.from(booksStore.values()).find(
        (b) => !b.isDeleted && b.companyId === companyId && b.isbn10 === data.isbn10
      );
      if (existingIsbn10) {
        throw new AppError(`A book with ISBN-10 '${data.isbn10}' already exists: "${existingIsbn10.title}".`, 409);
      }
    }

    const id = 'bk_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
    const newBook: BookItem = {
      id,
      companyId,
      parentTitleId: data.parentTitleId || ('wrk_' + Date.now()),
      title: data.title!,
      subtitle: data.subtitle,
      isbn10: data.isbn10,
      isbn13: data.isbn13,
      sku: data.sku!,
      barcode: data.barcode || data.isbn13,
      authorId: data.authorId,
      authorName: data.authorName!,
      coAuthors: data.coAuthors || [],
      publisherId: data.publisherId,
      publisherName: data.publisherName!,
      edition: data.edition || '1st Edition',
      volume: data.volume,
      language: data.language || 'English',
      subject: data.subject || 'General',
      category: data.category || 'General',
      subcategory: data.subcategory,
      publicationDate: data.publicationDate || new Date().toISOString(),
      publicationYear: data.publicationYear || new Date().getFullYear(),
      numberOfPages: data.numberOfPages || 100,
      bindingType: data.bindingType || 'Paperback',
      bookSize: data.bookSize || 'Royal 8vo',
      printingFormat: data.printingFormat || '1 Color',
      hsnSacCode: data.hsnSacCode || '4901',
      taxRate: data.taxRate !== undefined ? data.taxRate : 0.0,
      mrp: data.mrp || 0,
      wholesalePrice: data.wholesalePrice || (data.mrp ? data.mrp * 0.6 : 0),
      dealerPrice: data.dealerPrice || (data.mrp ? data.mrp * 0.75 : 0),
      purchaseCost: data.purchaseCost || (data.mrp ? data.mrp * 0.35 : 0),
      openingStock: data.openingStock || 0,
      reorderLevel: data.reorderLevel !== undefined ? data.reorderLevel : 50,
      warehouseId: data.warehouseId,
      rackShelf: data.rackShelf,
      productImage: data.productImage,
      description: data.description,
      status: data.status || 'ACTIVE',
      isActive: true,
      isDeleted: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    booksStore.set(id, newBook);
    return newBook;
  }

  async update(id: string, data: Partial<BookItem>, companyId?: string): Promise<BookItem> {
    const book = booksStore.get(id);
    if (!book || book.isDeleted) {
      throw new AppError('Book record not found', 404);
    }
    if (companyId && book.companyId !== companyId) {
      throw new AppError('Access forbidden: Book belongs to another company entity.', 403);
    }

    // Check SKU conflict if changed
    if (data.sku && data.sku.toLowerCase() !== book.sku.toLowerCase()) {
      const existing = Array.from(booksStore.values()).find(
        (b) => !b.isDeleted && b.companyId === book.companyId && b.sku.toLowerCase() === data.sku!.toLowerCase() && b.id !== id
      );
      if (existing) {
        throw new AppError(`A book with SKU '${data.sku}' already exists.`, 409);
      }
    }

    // Check ISBN-13 conflict if changed
    if (data.isbn13 && data.isbn13 !== book.isbn13) {
      const existing = Array.from(booksStore.values()).find(
        (b) => !b.isDeleted && b.companyId === book.companyId && b.isbn13 === data.isbn13 && b.id !== id
      );
      if (existing) {
        throw new AppError(`A book with ISBN-13 '${data.isbn13}' already exists: "${existing.title}".`, 409);
      }
    }

    const updatedBook: BookItem = {
      ...book,
      ...data,
      updatedAt: new Date().toISOString(),
    };

    booksStore.set(id, updatedBook);
    return updatedBook;
  }

  async delete(id: string, companyId?: string): Promise<{ success: boolean; message: string }> {
    const book = booksStore.get(id);
    if (!book || book.isDeleted) {
      throw new AppError('Book record not found', 404);
    }
    if (companyId && book.companyId !== companyId) {
      throw new AppError('Access forbidden', 403);
    }

    book.isDeleted = true;
    book.isActive = false;
    book.updatedAt = new Date().toISOString();
    booksStore.set(id, book);

    return { success: true, message: `Book "${book.title}" successfully archived.` };
  }

  // --------------------------------------------------------------------------
  // MULTIPLE EDITIONS, LANGUAGES & FORMATS GROUPING
  // --------------------------------------------------------------------------
  async getEditionsAndFormats(bookId: string): Promise<{
    primaryBook: BookItem;
    editionsAndFormats: BookItem[];
  }> {
    const primary = booksStore.get(bookId);
    if (!primary || primary.isDeleted) {
      throw new AppError('Book record not found', 404);
    }

    const parentTitleId = primary.parentTitleId || primary.id;
    const editionsAndFormats = Array.from(booksStore.values()).filter(
      (b) => !b.isDeleted && (b.parentTitleId === parentTitleId || b.id === parentTitleId)
    );

    return {
      primaryBook: primary,
      editionsAndFormats,
    };
  }

  // --------------------------------------------------------------------------
  // BULK IMPORT & VALIDATION ENGINE
  // --------------------------------------------------------------------------
  async bulkImport(
    items: Array<Record<string, any>>,
    companyId: string = 'cmp_default_publisher',
    duplicateHandling: 'REJECT' | 'SKIP' | 'UPDATE' = 'REJECT'
  ): Promise<BulkImportResult> {
    const errors: BulkImportError[] = [];
    const importedItems: BookItem[] = [];

    // Track internal duplicates within the batch itself
    const batchSkus = new Set<string>();
    const batchIsbn13s = new Set<string>();

    for (let index = 0; index < items.length; index++) {
      const rowNum = index + 1;
      const raw = items[index];

      // 1. Mandatory fields
      if (!raw.title || typeof raw.title !== 'string' || !raw.title.trim()) {
        errors.push({ row: rowNum, column: 'title', value: raw.title, message: 'Title is mandatory and cannot be blank' });
      }
      if (!raw.sku || typeof raw.sku !== 'string' || !raw.sku.trim()) {
        errors.push({ row: rowNum, column: 'sku', value: raw.sku, message: 'SKU is mandatory' });
      }
      if (!raw.authorName || typeof raw.authorName !== 'string' || !raw.authorName.trim()) {
        errors.push({ row: rowNum, column: 'authorName', value: raw.authorName, message: 'Author Name is mandatory' });
      }
      if (!raw.publisherName || typeof raw.publisherName !== 'string' || !raw.publisherName.trim()) {
        errors.push({ row: rowNum, column: 'publisherName', value: raw.publisherName, message: 'Publisher Name is mandatory' });
      }

      const mrp = Number(raw.mrp);
      if (isNaN(mrp) || mrp <= 0) {
        errors.push({ row: rowNum, column: 'mrp', value: raw.mrp, message: 'MRP must be a valid positive decimal' });
      }

      // 2. Intra-batch duplicate check
      const normalizedSku = (raw.sku || '').trim().toLowerCase();
      if (normalizedSku) {
        if (batchSkus.has(normalizedSku)) {
          errors.push({ row: rowNum, column: 'sku', value: raw.sku, message: `Duplicate SKU '${raw.sku}' inside the same import file` });
        } else {
          batchSkus.add(normalizedSku);
        }
      }

      if (raw.isbn13) {
        const cleanIsbn13 = String(raw.isbn13).replace(/[- ]/g, '').trim();
        if (batchIsbn13s.has(cleanIsbn13)) {
          errors.push({ row: rowNum, column: 'isbn13', value: raw.isbn13, message: `Duplicate ISBN-13 '${raw.isbn13}' inside the same import file` });
        } else {
          batchIsbn13s.add(cleanIsbn13);
        }
      }

      // 3. Database existing duplicates check
      if (duplicateHandling === 'REJECT') {
        const existingSku = Array.from(booksStore.values()).find(
          (b) => !b.isDeleted && b.companyId === companyId && b.sku.toLowerCase() === normalizedSku
        );
        if (existingSku) {
          errors.push({
            row: rowNum,
            column: 'sku',
            value: raw.sku,
            message: `SKU '${raw.sku}' already exists in database (Title: "${existingSku.title}")`,
          });
        }

        if (raw.isbn13) {
          const cleanIsbn13 = String(raw.isbn13).replace(/[- ]/g, '').trim();
          const existingIsbn = Array.from(booksStore.values()).find(
            (b) => !b.isDeleted && b.companyId === companyId && b.isbn13 === cleanIsbn13
          );
          if (existingIsbn) {
            errors.push({
              row: rowNum,
              column: 'isbn13',
              value: raw.isbn13,
              message: `ISBN-13 '${raw.isbn13}' already exists in database (Title: "${existingIsbn.title}")`,
            });
          }
        }
      }
    }

    // If REJECT policy and errors exist, fail the batch
    if (duplicateHandling === 'REJECT' && errors.length > 0) {
      return {
        totalProcessed: items.length,
        successfulCount: 0,
        failedCount: errors.length,
        errors,
        importedItems: [],
      };
    }

    // Process valid rows
    for (let index = 0; index < items.length; index++) {
      const raw = items[index];
      const rowNum = index + 1;
      const rowHasError = errors.some((e) => e.row === rowNum);
      if (rowHasError) continue;

      const created = await this.create(
        {
          title: raw.title,
          subtitle: raw.subtitle,
          sku: raw.sku,
          isbn10: raw.isbn10,
          isbn13: raw.isbn13 ? String(raw.isbn13).replace(/[- ]/g, '') : undefined,
          authorName: raw.authorName,
          publisherName: raw.publisherName,
          edition: raw.edition || '1st Edition',
          language: raw.language || 'English',
          subject: raw.subject || 'General',
          category: raw.category || 'General',
          numberOfPages: Number(raw.numberOfPages) || 200,
          bindingType: raw.bindingType || 'Paperback',
          mrp: Number(raw.mrp),
          wholesalePrice: Number(raw.wholesalePrice) || Number(raw.mrp) * 0.6,
          dealerPrice: Number(raw.dealerPrice) || Number(raw.mrp) * 0.75,
          purchaseCost: Number(raw.purchaseCost) || Number(raw.mrp) * 0.35,
          openingStock: Number(raw.openingStock) || 0,
          reorderLevel: Number(raw.reorderLevel) || 50,
          status: raw.status || 'ACTIVE',
        },
        companyId
      );
      importedItems.push(created);
    }

    return {
      totalProcessed: items.length,
      successfulCount: importedItems.length,
      failedCount: items.length - importedItems.length,
      errors,
      importedItems,
    };
  }

  // --------------------------------------------------------------------------
  // BULK EXPORT ENGINE
  // --------------------------------------------------------------------------
  async exportCatalogue(companyId?: string): Promise<{ csv: string; count: number }> {
    let list = Array.from(booksStore.values()).filter((b) => !b.isDeleted);
    if (companyId) {
      list = list.filter((b) => b.companyId === companyId);
    }

    const headers = [
      'ID',
      'Title',
      'SKU',
      'ISBN-13',
      'ISBN-10',
      'Author',
      'Publisher',
      'Edition',
      'Language',
      'Subject',
      'Category',
      'Binding',
      'MRP',
      'Wholesale Price',
      'Dealer Price',
      'Purchase Cost',
      'Opening Stock',
      'Status',
    ];

    const rows = list.map((b) => [
      `"${b.id}"`,
      `"${b.title.replace(/"/g, '""')}"`,
      `"${b.sku}"`,
      `"${b.isbn13 || ''}"`,
      `"${b.isbn10 || ''}"`,
      `"${b.authorName.replace(/"/g, '""')}"`,
      `"${b.publisherName.replace(/"/g, '""')}"`,
      `"${b.edition}"`,
      `"${b.language}"`,
      `"${b.subject}"`,
      `"${b.category}"`,
      `"${b.bindingType}"`,
      b.mrp.toFixed(2),
      b.wholesalePrice.toFixed(2),
      b.dealerPrice.toFixed(2),
      b.purchaseCost.toFixed(2),
      b.openingStock,
      `"${b.status}"`,
    ]);

    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    return { csv, count: list.length };
  }

  // --------------------------------------------------------------------------
  // AUTHOR MASTER CRUD
  // --------------------------------------------------------------------------
  async getAuthors(companyId?: string): Promise<AuthorItem[]> {
    let list = Array.from(authorsStore.values()).filter((a) => !a.isDeleted);
    if (companyId) list = list.filter((a) => a.companyId === companyId);
    return list;
  }

  async getAuthorById(id: string): Promise<AuthorItem | null> {
    const author = authorsStore.get(id);
    if (!author || author.isDeleted) return null;
    return author;
  }

  async createAuthor(data: Partial<AuthorItem>, companyId: string = 'cmp_default_publisher'): Promise<AuthorItem> {
    const existing = Array.from(authorsStore.values()).find(
      (a) => !a.isDeleted && a.companyId === companyId && a.name.toLowerCase() === (data.name || '').toLowerCase()
    );
    if (existing) {
      throw new AppError(`Author with name "${data.name}" already exists.`, 409);
    }

    const id = 'auth_' + Date.now();
    const newAuthor: AuthorItem = {
      id,
      companyId,
      name: data.name!,
      pseudonym: data.pseudonym,
      bio: data.bio,
      email: data.email,
      phone: data.phone,
      address: data.address,
      city: data.city,
      state: data.state,
      country: data.country || 'India',
      pan: data.pan,
      bankDetails: data.bankDetails,
      royaltyAgreementNumber: data.royaltyAgreementNumber || `AGR-${Date.now().toString().slice(-4)}`,
      royaltyStartDate: data.royaltyStartDate || new Date().toISOString(),
      royaltyEndDate: data.royaltyEndDate,
      royaltyType: data.royaltyType || 'PERCENTAGE_ON_MRP',
      royaltyRate: data.royaltyRate !== undefined ? data.royaltyRate : 10.0,
      paymentTerms: data.paymentTerms || 'Annual',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    authorsStore.set(id, newAuthor);
    return newAuthor;
  }

  // --------------------------------------------------------------------------
  // PUBLISHER MASTER CRUD
  // --------------------------------------------------------------------------
  async getPublishers(companyId?: string): Promise<PublisherItem[]> {
    let list = Array.from(publishersStore.values()).filter((p) => !p.isDeleted);
    if (companyId) list = list.filter((p) => p.companyId === companyId);
    return list;
  }

  async getPublisherById(id: string): Promise<PublisherItem | null> {
    const pub = publishersStore.get(id);
    if (!pub || pub.isDeleted) return null;
    return pub;
  }

  async createPublisher(data: Partial<PublisherItem>, companyId: string = 'cmp_default_publisher'): Promise<PublisherItem> {
    const existing = Array.from(publishersStore.values()).find(
      (p) => !p.isDeleted && p.companyId === companyId && p.code.toLowerCase() === (data.code || '').toLowerCase()
    );
    if (existing) {
      throw new AppError(`Publisher with code "${data.code}" already exists.`, 409);
    }

    const id = 'pub_' + Date.now();
    const newPublisher: PublisherItem = {
      id,
      companyId,
      name: data.name!,
      code: data.code!,
      contactPerson: data.contactPerson,
      email: data.email,
      phone: data.phone,
      website: data.website,
      gstin: data.gstin,
      pan: data.pan,
      address: data.address,
      city: data.city,
      state: data.state,
      country: data.country || 'India',
      paymentTerms: data.paymentTerms || 'Net 60',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    publishersStore.set(id, newPublisher);
    return newPublisher;
  }

  // --------------------------------------------------------------------------
  // TAXONOMIES & AUXILIARY MASTERS
  // --------------------------------------------------------------------------
  async getTaxonomies(type?: string, companyId?: string): Promise<MasterTaxonomyItem[]> {
    let list = Array.from(taxonomiesStore.values()).filter((t) => t.isActive);
    if (companyId) list = list.filter((t) => t.companyId === companyId);
    if (type) list = list.filter((t) => t.type === type);
    return list;
  }

  async createTaxonomy(data: Partial<MasterTaxonomyItem>, companyId: string = 'cmp_default_publisher'): Promise<MasterTaxonomyItem> {
    const id = 'tax_' + Date.now();
    const item: MasterTaxonomyItem = {
      id,
      companyId,
      type: data.type!,
      code: data.code!,
      name: data.name!,
      description: data.description,
      metadata: data.metadata,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    taxonomiesStore.set(id, item);
    return item;
  }

  // --------------------------------------------------------------------------
  // PARTY MASTERS (CUSTOMERS, SUPPLIERS, DEALERS, DISTRIBUTORS, INSTITUTIONS)
  // --------------------------------------------------------------------------
  async getParties(partyType?: string, companyId?: string): Promise<PartyItem[]> {
    let list = Array.from(partiesStore.values()).filter((p) => !p.isDeleted);
    if (companyId) list = list.filter((p) => p.companyId === companyId);
    if (partyType) list = list.filter((p) => p.partyType === partyType);
    return list;
  }

  async getPartyById(id: string): Promise<PartyItem | null> {
    const party = partiesStore.get(id);
    if (!party || party.isDeleted) return null;
    return party;
  }

  async createParty(data: Partial<PartyItem>, companyId: string = 'cmp_default_publisher'): Promise<PartyItem> {
    const existing = Array.from(partiesStore.values()).find(
      (p) => !p.isDeleted && p.companyId === companyId && p.code.toLowerCase() === (data.code || '').toLowerCase()
    );
    if (existing) {
      throw new AppError(`Party with code "${data.code}" already exists.`, 409);
    }

    const id = 'pty_' + Date.now();
    const newParty: PartyItem = {
      id,
      companyId,
      partyType: data.partyType!,
      name: data.name!,
      code: data.code!,
      contactPerson: data.contactPerson,
      email: data.email,
      phone: data.phone,
      mobile: data.mobile,
      gstin: data.gstin,
      pan: data.pan,
      billingAddress: data.billingAddress,
      shippingAddress: data.shippingAddress,
      city: data.city,
      state: data.state,
      stateCode: data.stateCode,
      pincode: data.pincode,
      creditLimit: data.creditLimit !== undefined ? data.creditLimit : 500000.0,
      creditDays: data.creditDays !== undefined ? data.creditDays : 30,
      discountRate: data.discountRate !== undefined ? data.discountRate : 0.0,
      paymentTerms: data.paymentTerms || 'Net 30',
      bankDetails: data.bankDetails,
      transporterDetails: data.transporterDetails,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    partiesStore.set(id, newParty);
    return newParty;
  }

  // --------------------------------------------------------------------------
  // STOCK ADJUSTMENT (INWARD / OUTWARD FOR PURCHASES & INVENTORY)
  // --------------------------------------------------------------------------
  async adjustStock(bookIdOrSku: string, quantityDelta: number): Promise<BookItem | null> {
    let book = booksStore.get(bookIdOrSku);
    if (!book) {
      book = Array.from(booksStore.values()).find(
        (b) => !b.isDeleted && b.sku.toLowerCase() === bookIdOrSku.toLowerCase()
      );
    }
    if (!book) return null;

    book.openingStock = Math.max(0, Number(book.openingStock || 0) + quantityDelta);
    book.updatedAt = new Date().toISOString();
    booksStore.set(book.id, book);
    return book;
  }
}

export const booksService = new BooksService();
