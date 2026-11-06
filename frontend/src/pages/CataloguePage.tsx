import React, { useState, useMemo, useEffect } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { Drawer } from '../components/ui/Drawer';
import { FormField } from '../components/ui/FormField';
import { StatusBadge } from '../components/ui/StatusBadge';
import { PageHeader } from '../components/ui/PageHeader';
import { useBrand } from '../contexts/BrandContext';
import {
  BookOpen,
  Plus,
  Search,
  Download,
  Upload,
  Feather,
  Building2,
  Users,
  Layers,
  FileSpreadsheet,
  AlertTriangle,
  CheckCircle2,
  Filter,
  Copy,
  ExternalLink,
  Tag,
  Warehouse,
  Percent,
  CreditCard,
  Truck,
  GraduationCap,
  Sparkles,
  Edit2,
  Trash2,
  RotateCcw,
  Barcode,
  Check,
  X,
} from 'lucide-react';
import {
  BookItem,
  AuthorItem,
  PublisherItem,
  TaxonomyItem,
  PartyItem,
  getStoredBooks,
  saveStoredBooks,
  saveBookItem,
  deleteBookItem,
  getStoredAuthors,
  saveStoredAuthors,
  saveAuthorItem,
  deleteAuthorItem,
  getStoredPublishers,
  saveStoredPublishers,
  savePublisherItem,
  deletePublisherItem,
  getStoredTaxonomies,
  saveStoredTaxonomies,
  saveTaxonomyItem,
  deleteTaxonomyItem,
  getStoredParties,
  saveStoredParties,
  savePartyItem,
  deletePartyItem,
  resetCatalogueToDefaults,
  generateValidIsbn13,
  validateIsbn13,
} from '../services/catalogueService';
import { exportToCsv } from '../services/accountingService';

export const CataloguePage: React.FC = () => {
  const { brand } = useBrand();

  const [activeTab, setActiveTab] = useState<'books' | 'authors' | 'publishers' | 'parties' | 'auxiliary' | 'import-export'>('books');

  // Master State from persistent local storage
  const [books, setBooks] = useState<BookItem[]>([]);
  const [authors, setAuthors] = useState<AuthorItem[]>([]);
  const [publishers, setPublishers] = useState<PublisherItem[]>([]);
  const [taxonomies, setTaxonomies] = useState<TaxonomyItem[]>([]);
  const [parties, setParties] = useState<PartyItem[]>([]);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('ALL');
  const [selectedLanguage, setSelectedLanguage] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [partyTypeFilter, setPartyTypeFilter] = useState('ALL');
  const [taxonomyTypeFilter, setTaxonomyTypeFilter] = useState('ALL');

  // Drawer: Multiple Editions
  const [isEditionsDrawerOpen, setIsEditionsDrawerOpen] = useState(false);
  const [selectedBookForEditions, setSelectedBookForEditions] = useState<BookItem | null>(null);

  // Modal: Book Form (Create & Edit)
  const [isBookModalOpen, setIsBookModalOpen] = useState(false);
  const [editingBookId, setEditingBookId] = useState<string | null>(null);
  const [bookForm, setBookForm] = useState<Partial<BookItem>>({
    title: '',
    subtitle: '',
    isbn10: '',
    isbn13: '',
    sku: '',
    authorName: '',
    publisherName: '',
    edition: '1st Edition',
    volume: '',
    language: 'English',
    subject: 'Mathematics',
    category: 'Academic & School Textbooks',
    numberOfPages: 350,
    bindingType: 'Paperback with Section Sewing',
    bookSize: 'Royal 8vo (240mm x 165mm)',
    printingFormat: '2 Colour Offset',
    hsnSacCode: '4901',
    taxRate: 0,
    mrp: 495,
    wholesalePrice: 297,
    dealerPrice: 371.25,
    purchaseCost: 175,
    openingStock: 1000,
    reorderLevel: 200,
    warehouseId: 'Delhi Central Godown',
    rackShelf: 'Rack-A1',
    description: '',
    status: 'ACTIVE',
  });

  // Modal: Author Form (Create & Edit)
  const [isAuthorModalOpen, setIsAuthorModalOpen] = useState(false);
  const [editingAuthorId, setEditingAuthorId] = useState<string | null>(null);
  const [authorForm, setAuthorForm] = useState<Partial<AuthorItem>>({
    name: '',
    pseudonym: '',
    bio: '',
    email: '',
    phone: '',
    pan: '',
    royaltyAgreementNumber: '',
    royaltyType: 'PERCENTAGE_ON_MRP',
    royaltyRate: 10.0,
    paymentTerms: 'Quarterly Settlement',
  });

  // Modal: Publisher Form (Create & Edit)
  const [isPublisherModalOpen, setIsPublisherModalOpen] = useState(false);
  const [editingPublisherId, setEditingPublisherId] = useState<string | null>(null);
  const [publisherForm, setPublisherForm] = useState<Partial<PublisherItem>>({
    name: '',
    code: '',
    contactPerson: '',
    email: '',
    phone: '',
    gstin: '',
    pan: '',
    city: 'New Delhi',
    state: 'Delhi',
    paymentTerms: '30 Days Net',
  });

  // Modal: Party Form (Create & Edit)
  const [isPartyModalOpen, setIsPartyModalOpen] = useState(false);
  const [editingPartyId, setEditingPartyId] = useState<string | null>(null);
  const [partyForm, setPartyForm] = useState<Partial<PartyItem>>({
    partyType: 'DISTRIBUTOR',
    name: '',
    code: '',
    contactPerson: '',
    phone: '',
    email: '',
    gstin: '',
    pan: '',
    city: 'New Delhi',
    state: 'Delhi',
    creditLimit: 1000000,
    creditDays: 30,
    discountRate: 25,
    paymentTerms: '30 Days Net',
  });

  // Modal: Taxonomy Form (Create & Edit)
  const [isTaxonomyModalOpen, setIsTaxonomyModalOpen] = useState(false);
  const [editingTaxonomyId, setEditingTaxonomyId] = useState<string | null>(null);
  const [taxonomyForm, setTaxonomyForm] = useState<Partial<TaxonomyItem>>({
    type: 'CATEGORY',
    code: '',
    name: '',
    description: '',
  });

  // Bulk Import State
  const [importText, setImportText] = useState('');
  const [importErrors, setImportErrors] = useState<Array<{ row: number; column: string; message: string }>>([]);
  const [importSuccessMessage, setImportSuccessMessage] = useState<string | null>(null);

  // Load Data on Mount
  useEffect(() => {
    refreshData();
  }, []);

  const refreshData = () => {
    const b = getStoredBooks();
    const a = getStoredAuthors();
    const p = getStoredPublishers();
    const t = getStoredTaxonomies();
    const pt = getStoredParties();

    setBooks(b);
    setAuthors(a);
    setPublishers(p);
    setTaxonomies(t);
    setParties(pt);
  };

  // Filtered Books
  const filteredBooks = useMemo(() => {
    return books.filter((b) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        b.title.toLowerCase().includes(q) ||
        b.sku.toLowerCase().includes(q) ||
        b.isbn13.includes(q) ||
        b.authorName.toLowerCase().includes(q) ||
        b.subject.toLowerCase().includes(q);

      const matchesSubject = selectedSubject === 'ALL' || b.subject === selectedSubject;
      const matchesLang = selectedLanguage === 'ALL' || b.language === selectedLanguage;
      const matchesStatus = selectedStatus === 'ALL' || b.status === selectedStatus;

      return matchesSearch && matchesSubject && matchesLang && matchesStatus;
    });
  }, [books, searchQuery, selectedSubject, selectedLanguage, selectedStatus]);

  // Grouped Editions
  const groupedEditions = useMemo(() => {
    if (!selectedBookForEditions) return [];
    const parentId = selectedBookForEditions.parentTitleId || selectedBookForEditions.id;
    return books.filter((b) => b.parentTitleId === parentId || b.id === parentId);
  }, [books, selectedBookForEditions]);

  // Dynamic Subjects & Languages list
  const availableSubjects = useMemo(() => {
    const set = new Set(books.map((b) => b.subject));
    return Array.from(set).sort();
  }, [books]);

  const availableLanguages = useMemo(() => {
    const set = new Set(books.map((b) => b.language));
    return Array.from(set).sort();
  }, [books]);

  // --- BOOK ACTIONS ---
  const handleOpenCreateBook = () => {
    setEditingBookId(null);
    const newIsbn = generateValidIsbn13();
    const defaultAuthor = authors[0]?.name || 'Dr. R. D. Sharma';
    const defaultPublisher = publishers[0]?.name || 'Apex Educational Publishers & Distributors Ltd.';

    setBookForm({
      title: '',
      subtitle: '',
      isbn10: '',
      isbn13: newIsbn,
      sku: 'BK-' + Math.floor(1000 + Math.random() * 9000),
      authorName: defaultAuthor,
      publisherName: defaultPublisher,
      edition: '1st Edition',
      volume: '',
      language: 'English',
      subject: 'Mathematics',
      category: 'Academic & School Textbooks',
      numberOfPages: 350,
      bindingType: 'Paperback with Section Sewing',
      bookSize: 'Royal 8vo (240mm x 165mm)',
      printingFormat: '2 Colour Offset',
      hsnSacCode: '4901',
      taxRate: 0,
      mrp: 495,
      wholesalePrice: 297,
      dealerPrice: 371.25,
      purchaseCost: 175,
      openingStock: 1000,
      reorderLevel: 200,
      warehouseId: 'Delhi Central Godown',
      rackShelf: 'Rack-A1',
      description: '',
      status: 'ACTIVE',
    });
    setIsBookModalOpen(true);
  };

  const handleOpenEditBook = (book: BookItem) => {
    setEditingBookId(book.id);
    setBookForm({ ...book });
    setIsBookModalOpen(true);
  };

  const handleSaveBook = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookForm.title?.trim() || !bookForm.sku?.trim() || !bookForm.isbn13?.trim()) {
      alert('Please fill mandatory fields: Title, SKU, and ISBN-13');
      return;
    }

    // Check duplicate SKU if creating new
    if (!editingBookId && books.some((b) => b.sku.toLowerCase() === bookForm.sku?.toLowerCase().trim())) {
      alert(`Duplicate SKU error: Book with SKU '${bookForm.sku}' already exists.`);
      return;
    }

    // Check duplicate ISBN-13 if creating new
    if (!editingBookId && books.some((b) => b.isbn13 === bookForm.isbn13?.trim())) {
      alert(`Duplicate ISBN error: Book with ISBN-13 '${bookForm.isbn13}' already exists in catalogue.`);
      return;
    }

    const saved = saveBookItem({
      ...(editingBookId ? { id: editingBookId } : {}),
      title: bookForm.title.trim(),
      subtitle: bookForm.subtitle?.trim(),
      isbn10: bookForm.isbn10?.trim(),
      isbn13: bookForm.isbn13.trim(),
      sku: bookForm.sku.trim(),
      authorName: bookForm.authorName || 'Staff Author',
      publisherName: bookForm.publisherName || 'Apex Educational Publishers',
      edition: bookForm.edition || '1st Edition',
      volume: bookForm.volume?.trim(),
      language: bookForm.language || 'English',
      subject: bookForm.subject || 'General',
      category: bookForm.category || 'Academic & School Textbooks',
      publicationYear: Number(bookForm.publicationYear) || 2026,
      numberOfPages: Number(bookForm.numberOfPages) || 100,
      bindingType: bookForm.bindingType || 'Paperback with Section Sewing',
      bookSize: bookForm.bookSize || 'Royal 8vo (240mm x 165mm)',
      printingFormat: bookForm.printingFormat || '2 Colour Offset',
      hsnSacCode: bookForm.hsnSacCode || '4901',
      taxRate: Number(bookForm.taxRate) || 0,
      mrp: Number(bookForm.mrp) || 0,
      wholesalePrice: Number(bookForm.wholesalePrice) || Math.round((Number(bookForm.mrp) || 0) * 0.6),
      dealerPrice: Number(bookForm.dealerPrice) || Math.round((Number(bookForm.mrp) || 0) * 0.75),
      purchaseCost: Number(bookForm.purchaseCost) || Math.round((Number(bookForm.mrp) || 0) * 0.35),
      openingStock: Number(bookForm.openingStock) || 0,
      reorderLevel: Number(bookForm.reorderLevel) || 100,
      warehouseId: bookForm.warehouseId || 'Delhi Central Godown',
      rackShelf: bookForm.rackShelf?.trim(),
      description: bookForm.description?.trim(),
      status: bookForm.status || 'ACTIVE',
    });

    setIsBookModalOpen(false);
    refreshData();
    alert(`Book title "${saved.title}" (${saved.sku}) saved successfully.`);
  };

  const handleDeleteBook = (book: BookItem) => {
    if (window.confirm(`Are you sure you want to delete book "${book.title}" (${book.sku})?`)) {
      deleteBookItem(book.id);
      refreshData();
    }
  };

  const handleToggleBookStatus = (book: BookItem) => {
    const nextStatusMap: Record<BookItem['status'], BookItem['status']> = {
      ACTIVE: 'OUT_OF_PRINT',
      OUT_OF_PRINT: 'DISCONTINUED',
      DISCONTINUED: 'ACTIVE',
      INACTIVE: 'ACTIVE',
    };
    saveBookItem({ ...book, status: nextStatusMap[book.status] });
    refreshData();
  };

  // --- AUTHOR ACTIONS ---
  const handleOpenCreateAuthor = () => {
    setEditingAuthorId(null);
    setAuthorForm({
      name: '',
      pseudonym: '',
      bio: '',
      email: '',
      phone: '',
      pan: '',
      royaltyAgreementNumber: `AGR-2026-${Math.floor(100 + Math.random() * 900)}`,
      royaltyType: 'PERCENTAGE_ON_MRP',
      royaltyRate: 10.0,
      paymentTerms: 'Quarterly Settlement',
    });
    setIsAuthorModalOpen(true);
  };

  const handleOpenEditAuthor = (author: AuthorItem) => {
    setEditingAuthorId(author.id);
    setAuthorForm({ ...author });
    setIsAuthorModalOpen(true);
  };

  const handleSaveAuthor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!authorForm.name?.trim()) {
      alert('Author Name is mandatory');
      return;
    }

    const saved = saveAuthorItem({
      ...(editingAuthorId ? { id: editingAuthorId } : {}),
      name: authorForm.name.trim(),
      pseudonym: authorForm.pseudonym?.trim(),
      bio: authorForm.bio?.trim(),
      email: authorForm.email?.trim() || 'author@academic.org',
      phone: authorForm.phone?.trim() || '+91 98000 00000',
      pan: authorForm.pan?.trim() || 'ABCDE1234F',
      royaltyAgreementNumber: authorForm.royaltyAgreementNumber || `AGR-2026-001`,
      royaltyType: authorForm.royaltyType || 'PERCENTAGE_ON_MRP',
      royaltyRate: Number(authorForm.royaltyRate) || 10.0,
      paymentTerms: authorForm.paymentTerms || 'Quarterly Settlement',
    });

    setIsAuthorModalOpen(false);
    refreshData();
    alert(`Author profile for "${saved.name}" saved successfully.`);
  };

  const handleDeleteAuthor = (author: AuthorItem) => {
    if (window.confirm(`Delete author "${author.name}"?`)) {
      deleteAuthorItem(author.id);
      refreshData();
    }
  };

  // --- PUBLISHER ACTIONS ---
  const handleOpenCreatePublisher = () => {
    setEditingPublisherId(null);
    setPublisherForm({
      name: '',
      code: 'PUB-' + Math.floor(10 + Math.random() * 90),
      contactPerson: '',
      email: '',
      phone: '',
      gstin: '',
      pan: '',
      city: 'New Delhi',
      state: 'Delhi',
      paymentTerms: '30 Days Net',
    });
    setIsPublisherModalOpen(true);
  };

  const handleOpenEditPublisher = (pub: PublisherItem) => {
    setEditingPublisherId(pub.id);
    setPublisherForm({ ...pub });
    setIsPublisherModalOpen(true);
  };

  const handleSavePublisher = (e: React.FormEvent) => {
    e.preventDefault();
    if (!publisherForm.name?.trim() || !publisherForm.code?.trim()) {
      alert('Publisher Name and Code are mandatory');
      return;
    }

    const saved = savePublisherItem({
      ...(editingPublisherId ? { id: editingPublisherId } : {}),
      name: publisherForm.name.trim(),
      code: publisherForm.code.trim(),
      contactPerson: publisherForm.contactPerson?.trim() || 'General Manager',
      email: publisherForm.email?.trim() || 'info@publisher.com',
      phone: publisherForm.phone?.trim() || '+91 11 0000 0000',
      gstin: publisherForm.gstin?.trim() || '07AAAAA0000A1Z5',
      pan: publisherForm.pan?.trim() || 'AAACA1234D',
      city: publisherForm.city?.trim() || 'New Delhi',
      state: publisherForm.state?.trim() || 'Delhi',
      paymentTerms: publisherForm.paymentTerms || '30 Days Net',
    });

    setIsPublisherModalOpen(false);
    refreshData();
    alert(`Publisher imprint "${saved.name}" saved successfully.`);
  };

  const handleDeletePublisher = (pub: PublisherItem) => {
    if (window.confirm(`Delete publisher "${pub.name}"?`)) {
      deletePublisherItem(pub.id);
      refreshData();
    }
  };

  // --- PARTY ACTIONS ---
  const handleOpenCreateParty = () => {
    setEditingPartyId(null);
    setPartyForm({
      partyType: 'DISTRIBUTOR',
      name: '',
      code: 'PTY-' + Math.floor(100 + Math.random() * 900),
      contactPerson: '',
      phone: '',
      email: '',
      gstin: '',
      pan: '',
      city: 'New Delhi',
      state: 'Delhi',
      creditLimit: 1000000,
      creditDays: 30,
      discountRate: 25,
      paymentTerms: '30 Days Net',
    });
    setIsPartyModalOpen(true);
  };

  const handleOpenEditParty = (party: PartyItem) => {
    setEditingPartyId(party.id);
    setPartyForm({ ...party });
    setIsPartyModalOpen(true);
  };

  const handleSaveParty = (e: React.FormEvent) => {
    e.preventDefault();
    if (!partyForm.name?.trim() || !partyForm.code?.trim()) {
      alert('Party Name and Code are mandatory');
      return;
    }

    const saved = savePartyItem({
      ...(editingPartyId ? { id: editingPartyId } : {}),
      partyType: partyForm.partyType || 'DISTRIBUTOR',
      name: partyForm.name.trim(),
      code: partyForm.code.trim(),
      contactPerson: partyForm.contactPerson?.trim() || 'Commercial Manager',
      phone: partyForm.phone?.trim() || '+91 98000 00000',
      email: partyForm.email?.trim() || 'contact@party.com',
      gstin: partyForm.gstin?.trim() || '07AAACR1234A1Z1',
      pan: partyForm.pan?.trim() || 'AAACR1234A',
      city: partyForm.city?.trim() || 'New Delhi',
      state: partyForm.state?.trim() || 'Delhi',
      creditLimit: Number(partyForm.creditLimit) || 1000000,
      creditDays: Number(partyForm.creditDays) || 30,
      discountRate: Number(partyForm.discountRate) || 25,
      paymentTerms: partyForm.paymentTerms || '30 Days Net',
    });

    setIsPartyModalOpen(false);
    refreshData();
    alert(`Trade Party "${saved.name}" (${saved.code}) saved successfully.`);
  };

  const handleDeleteParty = (party: PartyItem) => {
    if (window.confirm(`Delete party "${party.name}"?`)) {
      deletePartyItem(party.id);
      refreshData();
    }
  };

  // --- TAXONOMY ACTIONS ---
  const handleOpenCreateTaxonomy = () => {
    setEditingTaxonomyId(null);
    setTaxonomyForm({
      type: 'CATEGORY',
      code: 'CAT-' + Math.floor(100 + Math.random() * 900),
      name: '',
      description: '',
    });
    setIsTaxonomyModalOpen(true);
  };

  const handleSaveTaxonomy = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taxonomyForm.name?.trim() || !taxonomyForm.code?.trim()) {
      alert('Name and Code are required');
      return;
    }

    saveTaxonomyItem({
      ...(editingTaxonomyId ? { id: editingTaxonomyId } : {}),
      type: taxonomyForm.type || 'CATEGORY',
      code: taxonomyForm.code.trim(),
      name: taxonomyForm.name.trim(),
      description: taxonomyForm.description?.trim() || '',
    });

    setIsTaxonomyModalOpen(false);
    refreshData();
  };

  const handleDeleteTaxonomy = (tax: TaxonomyItem) => {
    if (window.confirm(`Delete taxonomy "${tax.name}"?`)) {
      deleteTaxonomyItem(tax.id);
      refreshData();
    }
  };

  // --- BULK IMPORT & VALIDATION ---
  const handleProcessBulkImport = () => {
    setImportErrors([]);
    setImportSuccessMessage(null);

    if (!importText.trim()) {
      alert('Please paste CSV data into the box.');
      return;
    }

    const lines = importText.trim().split('\n');
    const errors: Array<{ row: number; column: string; message: string }> = [];
    const validBooks: BookItem[] = [];

    const dataLines = lines[0].toLowerCase().includes('title') ? lines.slice(1) : lines;

    dataLines.forEach((line, idx) => {
      const rowNum = idx + 1;
      const parts = line.split(',').map((p) => p.trim().replace(/^"|"$/g, ''));
      if (parts.length < 5) {
        errors.push({
          row: rowNum,
          column: 'general',
          message: 'Insufficient columns. Expected at least: Title, SKU, ISBN-13, Author, MRP.',
        });
        return;
      }

      const [title, sku, isbn13, authorName, mrpStr, subject, language] = parts;

      if (!title) errors.push({ row: rowNum, column: 'title', message: 'Title is mandatory' });
      if (!sku) errors.push({ row: rowNum, column: 'sku', message: 'SKU is mandatory' });
      if (!isbn13 || isbn13.length !== 13) {
        errors.push({ row: rowNum, column: 'isbn13', message: 'ISBN-13 must be 13 digits' });
      }

      if (books.some((b) => b.sku.toLowerCase() === (sku || '').toLowerCase())) {
        errors.push({ row: rowNum, column: 'sku', message: `Duplicate SKU '${sku}' already exists` });
      }
      if (books.some((b) => b.isbn13 === isbn13)) {
        errors.push({ row: rowNum, column: 'isbn13', message: `Duplicate ISBN-13 '${isbn13}' already exists` });
      }

      const mrp = Number(mrpStr);
      if (isNaN(mrp) || mrp <= 0) {
        errors.push({ row: rowNum, column: 'mrp', message: 'MRP must be a positive number' });
      }

      if (errors.filter((e) => e.row === rowNum).length === 0) {
        validBooks.push({
          id: 'bk_' + Date.now() + '_' + idx,
          parentTitleId: 'wrk_bulk_' + Date.now(),
          title,
          sku,
          isbn13,
          authorName: authorName || 'Apex Editorial Staff',
          publisherName: 'Apex Educational Publishers & Distributors Ltd.',
          edition: '1st Edition',
          language: language || 'English',
          subject: subject || 'General',
          category: 'Academic & School Textbooks',
          publicationYear: 2026,
          numberOfPages: 250,
          bindingType: 'Paperback with Section Sewing',
          bookSize: 'Royal 8vo (240mm x 165mm)',
          printingFormat: '2 Colour Offset',
          hsnSacCode: '4901',
          taxRate: 0,
          mrp,
          wholesalePrice: Math.round(mrp * 0.6),
          dealerPrice: Math.round(mrp * 0.75),
          purchaseCost: Math.round(mrp * 0.35),
          openingStock: 500,
          reorderLevel: 100,
          status: 'ACTIVE',
        });
      }
    });

    if (errors.length > 0) {
      setImportErrors(errors);
    } else {
      const merged = [...validBooks, ...books];
      saveStoredBooks(merged);
      setBooks(merged);
      setImportSuccessMessage(`Successfully validated and imported all ${validBooks.length} book titles into catalogue!`);
      setImportText('');
    }
  };

  // --- CSV EXPORT FOR CURRENT TAB ---
  const handleExportCurrentTab = () => {
    if (activeTab === 'books') {
      const headers = ['Title', 'SKU', 'ISBN-13', 'Author', 'Publisher', 'Edition', 'Language', 'Subject', 'MRP (INR)', 'Wholesale (INR)', 'Stock', 'Status'];
      const rows = filteredBooks.map((b) => [
        b.title,
        b.sku,
        b.isbn13,
        b.authorName,
        b.publisherName,
        b.edition,
        b.language,
        b.subject,
        b.mrp,
        b.wholesalePrice,
        b.openingStock,
        b.status,
      ]);
      exportToCsv('KIBO360_Book_Catalogue', headers, rows);
    } else if (activeTab === 'authors') {
      const headers = ['Author Name', 'Pen Name', 'Email', 'Phone', 'PAN', 'Agreement No', 'Royalty Type', 'Royalty Rate (%)', 'Payment Terms'];
      const rows = authors.map((a) => [
        a.name,
        a.pseudonym || '-',
        a.email,
        a.phone,
        a.pan,
        a.royaltyAgreementNumber,
        a.royaltyType,
        a.royaltyRate,
        a.paymentTerms,
      ]);
      exportToCsv('KIBO360_Authors_Master', headers, rows);
    } else if (activeTab === 'publishers') {
      const headers = ['Publisher Name', 'Code', 'Contact Person', 'Email', 'Phone', 'GSTIN', 'City', 'State', 'Payment Terms'];
      const rows = publishers.map((p) => [
        p.name,
        p.code,
        p.contactPerson,
        p.email,
        p.phone,
        p.gstin,
        p.city,
        p.state,
        p.paymentTerms,
      ]);
      exportToCsv('KIBO360_Publishers_Master', headers, rows);
    } else if (activeTab === 'parties') {
      const headers = ['Party Type', 'Name', 'Code', 'Contact Person', 'Phone', 'Email', 'GSTIN', 'Credit Limit (INR)', 'Credit Days', 'Discount Rate (%)'];
      const rows = parties.map((pt) => [
        pt.partyType,
        pt.name,
        pt.code,
        pt.contactPerson,
        pt.phone,
        pt.email,
        pt.gstin,
        pt.creditLimit,
        pt.creditDays,
        pt.discountRate,
      ]);
      exportToCsv('KIBO360_Trade_Parties', headers, rows);
    } else if (activeTab === 'auxiliary') {
      const headers = ['Type', 'Code', 'Name', 'Description'];
      const rows = taxonomies.map((t) => [t.type, t.code, t.name, t.description]);
      exportToCsv('KIBO360_Taxonomies_Auxiliary', headers, rows);
    }
  };

  const handleResetDefaults = () => {
    if (window.confirm('Reset entire catalogue, authors, and master taxonomies to factory defaults?')) {
      resetCatalogueToDefaults();
      refreshData();
      alert('Catalogue master data has been reset to defaults.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Master Data & Book Catalogue"
        description="Centralized repository for Book titles, ISBNs, Authors, Royalties, Publishers, Taxonomies, and Party Masters"
        breadcrumbs={[
          { label: 'Publishing Operations', href: '/' },
          { label: 'Book Catalogue & ISBN' },
        ]}
        actions={
          <div className="flex items-center gap-2 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              onClick={handleResetDefaults}
              className="text-slate-600 hover:text-slate-900 border-slate-300"
              title="Reset catalogue to publishing factory defaults"
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
              onClick={() => setActiveTab('import-export')}
              className="text-purple-700 border-purple-200 hover:bg-purple-50"
            >
              <Upload className="w-3.5 h-3.5 mr-1" />
              Bulk Import
            </Button>
            <Button
              style={{ backgroundColor: brand.primaryColor }}
              className="text-white hover:opacity-90 transition-opacity"
              size="sm"
              onClick={handleOpenCreateBook}
            >
              <Plus className="w-4 h-4 mr-1.5" />
              New Book Title
            </Button>
          </div>
        }
      />

      {/* Tabs Navigation */}
      <div className="flex border-b border-slate-200 bg-white rounded-t-xl px-4 gap-2 overflow-x-auto shadow-sm">
        <button
          onClick={() => setActiveTab('books')}
          className="flex items-center gap-2 py-3 px-4 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap"
          style={{
            borderColor: activeTab === 'books' ? brand.primaryColor : 'transparent',
            color: activeTab === 'books' ? brand.primaryColor : '#64748B',
          }}
        >
          <BookOpen className="w-4 h-4" />
          Book Catalogue ({books.length})
        </button>
        <button
          onClick={() => setActiveTab('authors')}
          className="flex items-center gap-2 py-3 px-4 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap"
          style={{
            borderColor: activeTab === 'authors' ? brand.primaryColor : 'transparent',
            color: activeTab === 'authors' ? brand.primaryColor : '#64748B',
          }}
        >
          <Feather className="w-4 h-4" />
          Author Master ({authors.length})
        </button>
        <button
          onClick={() => setActiveTab('publishers')}
          className="flex items-center gap-2 py-3 px-4 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap"
          style={{
            borderColor: activeTab === 'publishers' ? brand.primaryColor : 'transparent',
            color: activeTab === 'publishers' ? brand.primaryColor : '#64748B',
          }}
        >
          <Building2 className="w-4 h-4" />
          Publisher Master ({publishers.length})
        </button>
        <button
          onClick={() => setActiveTab('parties')}
          className="flex items-center gap-2 py-3 px-4 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap"
          style={{
            borderColor: activeTab === 'parties' ? brand.primaryColor : 'transparent',
            color: activeTab === 'parties' ? brand.primaryColor : '#64748B',
          }}
        >
          <Users className="w-4 h-4" />
          Party Masters ({parties.length})
        </button>
        <button
          onClick={() => setActiveTab('auxiliary')}
          className="flex items-center gap-2 py-3 px-4 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap"
          style={{
            borderColor: activeTab === 'auxiliary' ? brand.primaryColor : 'transparent',
            color: activeTab === 'auxiliary' ? brand.primaryColor : '#64748B',
          }}
        >
          <Layers className="w-4 h-4" />
          Taxonomies & Auxiliary ({taxonomies.length})
        </button>
        <button
          onClick={() => setActiveTab('import-export')}
          className="flex items-center gap-2 py-3 px-4 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap"
          style={{
            borderColor: activeTab === 'import-export' ? brand.primaryColor : 'transparent',
            color: activeTab === 'import-export' ? brand.primaryColor : '#64748B',
          }}
        >
          <FileSpreadsheet className="w-4 h-4" />
          Bulk Import & Validation
        </button>
      </div>

      {/* ======================================================== */}
      {/* TAB 1: BOOK CATALOGUE MASTER                             */}
      {/* ======================================================== */}
      {activeTab === 'books' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <Card className="p-4 bg-white border border-slate-200 shadow-sm space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
              {/* Search */}
              <div className="md:col-span-5 relative">
                <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <Input
                  placeholder="Search title, ISBN-13, SKU, or author..."
                  className="pl-9 text-sm"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              {/* Subject Filter */}
              <div className="md:col-span-3">
                <select
                  className="w-full h-10 px-3 rounded-lg border border-slate-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-purple-200"
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                >
                  <option value="ALL">All Subjects ({availableSubjects.length})</option>
                  {availableSubjects.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              {/* Language Filter */}
              <div className="md:col-span-2">
                <select
                  className="w-full h-10 px-3 rounded-lg border border-slate-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-purple-200"
                  value={selectedLanguage}
                  onChange={(e) => setSelectedLanguage(e.target.value)}
                >
                  <option value="ALL">All Languages</option>
                  {availableLanguages.map((l) => (
                    <option key={l} value={l}>
                      {l}
                    </option>
                  ))}
                </select>
              </div>

              {/* Status Filter */}
              <div className="md:col-span-2">
                <select
                  className="w-full h-10 px-3 rounded-lg border border-slate-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-purple-200"
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                >
                  <option value="ALL">All Statuses</option>
                  <option value="ACTIVE">Active in Print</option>
                  <option value="OUT_OF_PRINT">Out of Print</option>
                  <option value="DISCONTINUED">Discontinued</option>
                </select>
              </div>
            </div>

            <div className="flex justify-between items-center text-xs text-slate-500 pt-2 border-t border-slate-100 flex-wrap gap-2">
              <span>
                Showing <strong className="text-slate-800">{filteredBooks.length}</strong> of{' '}
                <strong className="text-slate-800">{books.length}</strong> titles
              </span>

              {(searchQuery || selectedSubject !== 'ALL' || selectedLanguage !== 'ALL' || selectedStatus !== 'ALL') && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedSubject('ALL');
                    setSelectedLanguage('ALL');
                    setSelectedStatus('ALL');
                  }}
                  className="text-purple-700 hover:underline font-semibold"
                >
                  Clear Filters
                </button>
              )}
            </div>
          </Card>

          {/* Book Catalog Table */}
          <Card className="p-0 overflow-hidden border border-slate-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-700">
                <thead className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-600 uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Book Title & Details</th>
                    <th className="py-3 px-4">Identifiers (ISBN / SKU)</th>
                    <th className="py-3 px-4">Author & Imprint</th>
                    <th className="py-3 px-4">Edition / Language</th>
                    <th className="py-3 px-4 text-right">MRP (₹)</th>
                    <th className="py-3 px-4 text-right">Wholesale (₹)</th>
                    <th className="py-3 px-4 text-center">Stock</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredBooks.map((book) => (
                    <tr key={book.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{book.title}</div>
                        {book.subtitle && <div className="text-xs text-slate-500">{book.subtitle}</div>}
                        <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                          <span className="text-[11px] bg-purple-50 text-purple-700 px-2 py-0.5 rounded font-medium border border-purple-200">
                            {book.subject}
                          </span>
                          <span className="text-[11px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                            {book.bindingType}
                          </span>
                          <span className="text-[11px] text-slate-400">{book.numberOfPages} pages</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="font-mono text-xs font-bold text-slate-900">{book.isbn13}</div>
                        <div className="font-mono text-xs text-slate-500 font-medium">{book.sku}</div>
                        {book.isbn10 && <div className="text-[10px] text-slate-400 font-mono">ISBN-10: {book.isbn10}</div>}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                          <Feather className="w-3.5 h-3.5 text-purple-700" />
                          {book.authorName}
                        </div>
                        <div className="text-xs text-slate-500">{book.publisherName}</div>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="text-xs font-medium text-slate-800">{book.edition}</div>
                        <div className="text-xs text-slate-500">{book.language}</div>
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-slate-900 whitespace-nowrap">
                        ₹{book.mrp.toFixed(2)}
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-slate-600 whitespace-nowrap">
                        ₹{book.wholesalePrice.toFixed(2)}
                      </td>
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <span
                          className={`font-semibold text-xs px-2 py-0.5 rounded-full font-mono ${
                            book.openingStock <= book.reorderLevel
                              ? 'bg-rose-100 text-rose-800 border border-rose-200'
                              : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          }`}
                        >
                          {book.openingStock.toLocaleString()} copies
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <button
                          onClick={() => handleToggleBookStatus(book)}
                          title="Click to cycle status: Active -> Out of Print -> Discontinued"
                          className="cursor-pointer"
                        >
                          <StatusBadge status={book.status} />
                        </button>
                      </td>
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-purple-700 hover:text-purple-900 hover:bg-purple-50 px-2"
                            onClick={() => {
                              setSelectedBookForEditions(book);
                              setIsEditionsDrawerOpen(true);
                            }}
                            title="View Associated Formats & Editions"
                          >
                            <Layers className="w-3.5 h-3.5 mr-1" />
                            Editions
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-slate-600 hover:text-slate-900 px-2"
                            onClick={() => handleOpenEditBook(book)}
                            title="Edit Book Details"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-rose-600 hover:text-rose-800 hover:bg-rose-50 px-2"
                            onClick={() => handleDeleteBook(book)}
                            title="Delete Book"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredBooks.length === 0 && (
                    <tr>
                      <td colSpan={9} className="py-12 text-center text-slate-400">
                        No book titles found matching your search and filter criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 2: AUTHOR MASTER                                     */}
      {/* ======================================================== */}
      {activeTab === 'authors' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex-wrap gap-2">
            <div>
              <h3 className="font-bold text-slate-900 text-base">Author Master & Royalty Profiles</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Manage author contracts, PAN details for TDS compliance, and automated royalty calculation slabs.
              </p>
            </div>
            <Button
              style={{ backgroundColor: brand.primaryColor }}
              className="text-white hover:opacity-90"
              size="sm"
              onClick={handleOpenCreateAuthor}
            >
              <Plus className="w-4 h-4 mr-1.5" />
              Add Author
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {authors.map((author) => (
              <Card key={author.id} className="p-5 border border-slate-200 bg-white shadow-sm space-y-3 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-slate-900 text-base">{author.name}</h4>
                      {author.pseudonym && <p className="text-xs text-slate-500 italic">Pen Name: {author.pseudonym}</p>}
                    </div>
                    <Badge variant="purple" className="font-semibold">
                      {author.royaltyRate}% Royalty
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-600 line-clamp-2 mt-2">{author.bio || 'Author bio details.'}</p>

                  <div className="text-xs space-y-1.5 pt-3 mt-3 border-t border-slate-100 text-slate-700">
                    <div className="flex justify-between">
                      <span className="text-slate-400">PAN (for TDS):</span>
                      <span className="font-mono font-semibold text-slate-800">{author.pan}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Agreement No:</span>
                      <span className="font-mono text-slate-800">{author.royaltyAgreementNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Calculation Basis:</span>
                      <span className="text-slate-800 font-medium">{author.royaltyType.replace(/_/g, ' ')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Payment Terms:</span>
                      <span className="text-slate-800 font-medium">{author.paymentTerms}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Bank Details:</span>
                      <span className="font-mono text-slate-800">
                        {author.bankDetails?.bankName} (Ending {author.bankDetails?.accountNumber?.slice(-4) || 'XXXX'})
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex justify-between items-center text-xs text-slate-500">
                  <span>{author.bookCount} Registered Titles</span>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-slate-600 hover:text-slate-900 p-1 h-auto"
                      onClick={() => handleOpenEditAuthor(author)}
                      title="Edit Author Profile"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-rose-600 hover:text-rose-800 p-1 h-auto"
                      onClick={() => handleDeleteAuthor(author)}
                      title="Delete Author"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 3: PUBLISHER MASTER                                  */}
      {/* ======================================================== */}
      {activeTab === 'publishers' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex-wrap gap-2">
            <div>
              <h3 className="font-bold text-slate-900 text-base">Publisher & Imprint Master</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Directory of publishing entities, registered offices, State GSTINs, and institutional credit terms.
              </p>
            </div>
            <Button
              style={{ backgroundColor: brand.primaryColor }}
              className="text-white hover:opacity-90"
              size="sm"
              onClick={handleOpenCreatePublisher}
            >
              <Plus className="w-4 h-4 mr-1.5" />
              Add Publisher
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {publishers.map((pub) => (
              <Card key={pub.id} className="p-5 border border-slate-200 bg-white shadow-sm space-y-3 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-xs font-mono font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                        {pub.code}
                      </span>
                      <h4 className="font-bold text-slate-900 text-base mt-2">{pub.name}</h4>
                    </div>
                    <div className="flex items-center gap-1">
                      <Badge variant="slate">{pub.paymentTerms}</Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-slate-400 hover:text-slate-700 p-1 h-auto"
                        onClick={() => handleOpenEditPublisher(pub)}
                        title="Edit Publisher"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-slate-400 hover:text-rose-600 p-1 h-auto"
                        onClick={() => handleDeletePublisher(pub)}
                        title="Delete Publisher"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs pt-3 mt-3 border-t border-slate-100">
                    <div>
                      <span className="text-slate-400 block">Contact Person:</span>
                      <span className="font-medium text-slate-800">{pub.contactPerson}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Email:</span>
                      <span className="text-slate-800">{pub.email}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">GSTIN:</span>
                      <span className="font-mono text-slate-800 font-bold">{pub.gstin}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Location:</span>
                      <span className="text-slate-800">{pub.city}, {pub.state}</span>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 4: PARTY MASTERS (COMMERCIAL CONTACTS)               */}
      {/* ======================================================== */}
      {activeTab === 'parties' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex-wrap gap-2">
            <div>
              <h3 className="font-bold text-slate-900 text-base">Party Masters Directory</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Customers, Book Distributors, Institutional Schools, Paper Mills, and Logistics Transporters.
              </p>
            </div>
            <div className="flex gap-2">
              <select
                className="h-9 px-3 rounded-lg border border-slate-300 text-xs bg-white focus:outline-none"
                value={partyTypeFilter}
                onChange={(e) => setPartyTypeFilter(e.target.value)}
              >
                <option value="ALL">All Party Types</option>
                <option value="DISTRIBUTOR">Book Distributors</option>
                <option value="DEALER">Book Dealers / Retailers</option>
                <option value="INSTITUTION_SCHOOL">Schools & Universities</option>
                <option value="SUPPLIER">Paper & Print Suppliers</option>
                <option value="TRANSPORTER">Logistics Transporters</option>
              </select>
              <Button
                style={{ backgroundColor: brand.primaryColor }}
                className="text-white hover:opacity-90"
                size="sm"
                onClick={handleOpenCreateParty}
              >
                <Plus className="w-4 h-4 mr-1.5" />
                Add Party
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {parties
              .filter((p) => partyTypeFilter === 'ALL' || p.partyType === partyTypeFilter)
              .map((party) => (
                <Card key={party.id} className="p-5 border border-slate-200 bg-white shadow-sm space-y-3 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[11px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded uppercase border border-purple-200">
                          {party.partyType.replace(/_/g, ' ')}
                        </span>
                        <h4 className="font-bold text-slate-900 text-base mt-2">{party.name}</h4>
                        <p className="text-xs font-mono text-slate-400">Code: {party.code}</p>
                      </div>
                      <div className="flex items-center gap-1">
                        <Badge variant="slate">{party.paymentTerms}</Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-slate-400 hover:text-slate-700 p-1 h-auto"
                          onClick={() => handleOpenEditParty(party)}
                          title="Edit Trade Party"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-slate-400 hover:text-rose-600 p-1 h-auto"
                          onClick={() => handleDeleteParty(party)}
                          title="Delete Party"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs pt-3 mt-3 border-t border-slate-100">
                      <div>
                        <span className="text-slate-400 block">State GSTIN:</span>
                        <span className="font-mono text-slate-800 font-semibold">{party.gstin}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Credit Limit:</span>
                        <span className="font-bold text-slate-900">₹{party.creditLimit.toLocaleString('en-IN')}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Credit Days:</span>
                        <span className="text-slate-800">{party.creditDays} Days</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Discount Slab:</span>
                        <span className="font-bold text-emerald-700">{party.discountRate}% off MRP</span>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 5: TAXONOMIES & AUXILIARY CLASSIFICATIONS            */}
      {/* ======================================================== */}
      {activeTab === 'auxiliary' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex-wrap gap-2">
            <div>
              <h3 className="font-bold text-slate-900 text-base">Auxiliary Taxonomies & Classifications</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Configurable taxonomies for subjects, categories, binding formats, book sizes, and pricing slabs.
              </p>
            </div>
            <div className="flex gap-2">
              <select
                className="h-9 px-3 rounded-lg border border-slate-300 text-xs bg-white focus:outline-none"
                value={taxonomyTypeFilter}
                onChange={(e) => setTaxonomyTypeFilter(e.target.value)}
              >
                <option value="ALL">All Taxonomy Types</option>
                <option value="CATEGORY">Book Categories</option>
                <option value="SUBJECT">Subjects</option>
                <option value="BINDING">Binding Types</option>
                <option value="BOOK_SIZE">Trim Sizes</option>
                <option value="DISCOUNT_SCHEME">Discount Schemes</option>
              </select>
              <Button
                style={{ backgroundColor: brand.primaryColor }}
                className="text-white hover:opacity-90"
                size="sm"
                onClick={handleOpenCreateTaxonomy}
              >
                <Plus className="w-4 h-4 mr-1.5" />
                Add Taxonomy
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {taxonomies
              .filter((t) => taxonomyTypeFilter === 'ALL' || t.type === taxonomyTypeFilter)
              .map((tax) => (
                <Card key={tax.id} className="p-4 border border-slate-200 bg-white shadow-sm space-y-2 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-center">
                      <span className="text-[11px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded uppercase border border-purple-200">
                        {tax.type.replace(/_/g, ' ')}
                      </span>
                      <div className="flex items-center gap-1">
                        <span className="font-mono text-xs text-slate-400">{tax.code}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-slate-400 hover:text-rose-600 p-1 h-auto"
                          onClick={() => handleDeleteTaxonomy(tax)}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                    <h4 className="font-bold text-slate-900 text-sm mt-2">{tax.name}</h4>
                    <p className="text-xs text-slate-500 mt-1">{tax.description}</p>
                  </div>
                </Card>
              ))}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 6: BULK IMPORT & VALIDATION HUB                     */}
      {/* ======================================================== */}
      {activeTab === 'import-export' && (
        <div className="space-y-4">
          <Card className="p-6 bg-white border border-slate-200 shadow-sm space-y-4">
            <div>
              <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-purple-700" />
                Bulk Book Catalogue Import Engine
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Paste CSV/TSV data below. The engine verifies ISBN-13 checksums and SKU conflicts with line-by-line error reports before committing to the catalogue.
              </p>
            </div>

            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs text-slate-600 space-y-1">
              <span className="font-bold text-slate-800">CSV Column Structure:</span>
              <pre className="font-mono text-[11px] bg-white p-2.5 rounded border border-slate-200 overflow-x-auto text-purple-900">
                Title,SKU,ISBN-13,AuthorName,MRP,Subject,Language
              </pre>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Paste CSV Rows Below (or copy directly from Excel):
              </label>
              <textarea
                rows={8}
                className="w-full font-mono text-xs p-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-purple-200"
                placeholder={`Organic Chemistry Guide,BK-CHEM-101,9788177090123,Dr. O. P. Tandon,650,Chemistry,English\nInorganic Principles,BK-CHEM-102,9788177090124,Dr. O. P. Tandon,720,Chemistry,English`}
                value={importText}
                onChange={(e) => setImportText(e.target.value)}
              />
            </div>

            <div className="flex gap-2 flex-wrap">
              <Button
                style={{ backgroundColor: brand.primaryColor }}
                className="text-white hover:opacity-90"
                onClick={handleProcessBulkImport}
              >
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Validate & Import Catalog Batch
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setImportText(
                    `Mathematics for Class XI,BK-MATH-11-ENG,9788177091112,Dr. R. D. Sharma,895,Mathematics,English\nPhysics Exemplar Problems,BK-PHY-EX-12,9788177091113,Prof. H. C. Verma,520,Physics,English`
                  );
                }}
              >
                Load Sample Batch
              </Button>
            </div>

            {/* Error Diagnostics Report */}
            {importErrors.length > 0 && (
              <div className="bg-rose-50 border border-rose-200 rounded-lg p-4 space-y-2">
                <div className="flex items-center gap-2 text-rose-800 font-bold text-sm">
                  <AlertTriangle className="w-4 h-4" />
                  Import Rejected: {importErrors.length} Validation Errors Found
                </div>
                <div className="max-h-48 overflow-y-auto space-y-1">
                  {importErrors.map((err, i) => (
                    <div key={i} className="text-xs text-rose-700 font-mono">
                      • Line {err.row}: [{err.column}] {err.message}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Success Message */}
            {importSuccessMessage && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 text-emerald-800 text-sm font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                {importSuccessMessage}
              </div>
            )}
          </Card>
        </div>
      )}

      {/* ======================================================== */}
      {/* DRAWER: MULTIPLE EDITIONS, LANGUAGES & FORMATS GROUP     */}
      {/* ======================================================== */}
      <Drawer
        isOpen={isEditionsDrawerOpen}
        onClose={() => setIsEditionsDrawerOpen(false)}
        title="Multiple Editions & Formats Group"
        width="lg"
      >
        {selectedBookForEditions && (
          <div className="space-y-4">
            <div
              className="p-4 rounded-xl border"
              style={{
                backgroundColor: `${brand.primaryColor}08`,
                borderColor: `${brand.primaryColor}25`,
              }}
            >
              <span className="text-xs font-bold uppercase" style={{ color: brand.primaryColor }}>
                Work Title:
              </span>
              <h3 className="font-bold text-slate-900 text-base mt-0.5">{selectedBookForEditions.title}</h3>
              <p className="text-xs text-slate-500 mt-1">Author: {selectedBookForEditions.authorName}</p>
            </div>

            <div className="space-y-3">
              <h4 className="font-bold text-slate-800 text-sm">
                Associated Editions, Translations & Binding Formats ({groupedEditions.length}):
              </h4>

              {groupedEditions.map((ed) => (
                <div
                  key={ed.id}
                  className={`p-4 rounded-xl border text-xs space-y-2 ${
                    ed.id === selectedBookForEditions.id
                      ? 'border-purple-300 bg-purple-50/40'
                      : 'border-slate-200 bg-white'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="font-bold text-slate-900 text-sm">{ed.title}</span>
                      <div className="flex gap-2 mt-1">
                        <Badge variant="purple">{ed.language}</Badge>
                        <Badge variant="slate">{ed.bindingType}</Badge>
                        <span className="text-slate-500 font-medium">{ed.edition}</span>
                      </div>
                    </div>
                    <span className="font-bold font-mono text-slate-900 text-sm">₹{ed.mrp.toFixed(2)}</span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-slate-600 pt-2 border-t border-slate-100 font-mono">
                    <div>ISBN-13: {ed.isbn13}</div>
                    <div>SKU: {ed.sku}</div>
                    <div>Stock: {ed.openingStock} copies</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </Drawer>

      {/* ======================================================== */}
      {/* MODAL: CREATE & EDIT BOOK MASTER RECORD                 */}
      {/* ======================================================== */}
      <Modal
        isOpen={isBookModalOpen}
        onClose={() => setIsBookModalOpen(false)}
        title={editingBookId ? 'Edit Book Master Record' : 'Register New Book Master Record'}
        maxWidth="xl"
      >
        <form onSubmit={handleSaveBook} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="Book Title" required>
              <Input
                placeholder="e.g. Advanced Engineering Mathematics"
                value={bookForm.title}
                onChange={(e) => setBookForm({ ...bookForm, title: e.target.value })}
                required
              />
            </FormField>

            <FormField label="Subtitle">
              <Input
                placeholder="e.g. Metric Edition with Applied Solutions"
                value={bookForm.subtitle}
                onChange={(e) => setBookForm({ ...bookForm, subtitle: e.target.value })}
              />
            </FormField>

            <FormField label="Internal SKU / Book Code" required>
              <div className="flex gap-1.5">
                <Input
                  placeholder="e.g. BK-MATH-12-ENG-PB"
                  value={bookForm.sku}
                  onChange={(e) => setBookForm({ ...bookForm, sku: e.target.value })}
                  required
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setBookForm({
                      ...bookForm,
                      sku: `BK-${(bookForm.subject || 'GEN').substring(0, 4).toUpperCase()}-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
                    })
                  }
                  title="Auto-generate SKU"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                </Button>
              </div>
            </FormField>

            <FormField label="ISBN-13" required>
              <div className="flex gap-1.5">
                <Input
                  placeholder="e.g. 9788177099859"
                  value={bookForm.isbn13}
                  onChange={(e) => setBookForm({ ...bookForm, isbn13: e.target.value })}
                  required
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setBookForm({ ...bookForm, isbn13: generateValidIsbn13() })}
                  title="Auto-generate valid EAN-13 ISBN barcode"
                >
                  <Barcode className="w-3.5 h-3.5" />
                </Button>
              </div>
            </FormField>

            <FormField label="Primary Author" required>
              <select
                className="w-full h-10 px-3 rounded-lg border border-slate-300 text-sm focus:outline-none bg-white"
                value={bookForm.authorName}
                onChange={(e) => setBookForm({ ...bookForm, authorName: e.target.value })}
              >
                {authors.map((a) => (
                  <option key={a.id} value={a.name}>
                    {a.name} ({a.royaltyRate}% Royalty)
                  </option>
                ))}
              </select>
            </FormField>

            <FormField label="Publisher Imprint" required>
              <select
                className="w-full h-10 px-3 rounded-lg border border-slate-300 text-sm focus:outline-none bg-white"
                value={bookForm.publisherName}
                onChange={(e) => setBookForm({ ...bookForm, publisherName: e.target.value })}
              >
                {publishers.map((p) => (
                  <option key={p.id} value={p.name}>
                    {p.name}
                  </option>
                ))}
              </select>
            </FormField>

            <FormField label="Subject" required>
              <select
                className="w-full h-10 px-3 rounded-lg border border-slate-300 text-sm focus:outline-none bg-white"
                value={bookForm.subject}
                onChange={(e) => setBookForm({ ...bookForm, subject: e.target.value })}
              >
                <option value="Mathematics">Mathematics</option>
                <option value="Physics">Physics</option>
                <option value="Chemistry">Chemistry</option>
                <option value="Biology">Biology</option>
                <option value="Hindi Literature">Hindi Literature</option>
                <option value="English Literature">English Literature</option>
                <option value="Commerce & Accounting">Commerce & Accounting</option>
              </select>
            </FormField>

            <FormField label="Language" required>
              <select
                className="w-full h-10 px-3 rounded-lg border border-slate-300 text-sm focus:outline-none bg-white"
                value={bookForm.language}
                onChange={(e) => setBookForm({ ...bookForm, language: e.target.value })}
              >
                <option value="English">English</option>
                <option value="Hindi">Hindi (हिन्दी)</option>
                <option value="Bengali">Bengali</option>
                <option value="Marathi">Marathi</option>
                <option value="Tamil">Tamil</option>
              </select>
            </FormField>

            <FormField label="Binding Type">
              <select
                className="w-full h-10 px-3 rounded-lg border border-slate-300 text-sm focus:outline-none bg-white"
                value={bookForm.bindingType}
                onChange={(e) => setBookForm({ ...bookForm, bindingType: e.target.value })}
              >
                <option value="Paperback with Section Sewing">Paperback with Section Sewing</option>
                <option value="Hardcover Deluxe Case Binding">Hardcover Deluxe Case Binding</option>
                <option value="Spiral Bound">Spiral Bound</option>
                <option value="Center Stitched Pamphlet">Center Stitched Pamphlet</option>
              </select>
            </FormField>

            <FormField label="Book Size (Trim)">
              <select
                className="w-full h-10 px-3 rounded-lg border border-slate-300 text-sm focus:outline-none bg-white"
                value={bookForm.bookSize}
                onChange={(e) => setBookForm({ ...bookForm, bookSize: e.target.value })}
              >
                <option value="Royal 8vo (240mm x 165mm)">Royal 8vo (240mm x 165mm)</option>
                <option value="Crown 4to (250mm x 190mm)">Crown 4to (250mm x 190mm)</option>
                <option value="Demy 8vo (216mm x 138mm)">Demy 8vo (216mm x 138mm)</option>
                <option value="A4 (297mm x 210mm)">A4 (297mm x 210mm)</option>
              </select>
            </FormField>

            <FormField label="Maximum Retail Price (MRP ₹)" required>
              <Input
                type="number"
                placeholder="750.00"
                value={bookForm.mrp}
                onChange={(e) => {
                  const mrpVal = Number(e.target.value) || 0;
                  setBookForm({
                    ...bookForm,
                    mrp: mrpVal,
                    wholesalePrice: Math.round(mrpVal * 0.6),
                    dealerPrice: Math.round(mrpVal * 0.75),
                    purchaseCost: Math.round(mrpVal * 0.35),
                  });
                }}
                required
              />
            </FormField>

            <FormField label="Wholesale Price (₹) - Auto 40% Off">
              <Input
                type="number"
                value={bookForm.wholesalePrice}
                onChange={(e) => setBookForm({ ...bookForm, wholesalePrice: Number(e.target.value) })}
              />
            </FormField>

            <FormField label="Opening Stock Copies">
              <Input
                type="number"
                value={bookForm.openingStock}
                onChange={(e) => setBookForm({ ...bookForm, openingStock: Number(e.target.value) })}
              />
            </FormField>

            <FormField label="Reorder Level (Alert Threshold)">
              <Input
                type="number"
                value={bookForm.reorderLevel}
                onChange={(e) => setBookForm({ ...bookForm, reorderLevel: Number(e.target.value) })}
              />
            </FormField>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <Button type="button" variant="outline" onClick={() => setIsBookModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" style={{ backgroundColor: brand.primaryColor }} className="text-white">
              {editingBookId ? 'Save Changes' : 'Save Book to Master'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* ======================================================== */}
      {/* MODAL: CREATE & EDIT AUTHOR                              */}
      {/* ======================================================== */}
      <Modal
        isOpen={isAuthorModalOpen}
        onClose={() => setIsAuthorModalOpen(false)}
        title={editingAuthorId ? 'Edit Author Profile' : 'Add Author & Royalty Agreement'}
        maxWidth="lg"
      >
        <form onSubmit={handleSaveAuthor} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="Author Full Name" required>
              <Input
                placeholder="e.g. Dr. A. P. J. Kalam"
                value={authorForm.name}
                onChange={(e) => setAuthorForm({ ...authorForm, name: e.target.value })}
                required
              />
            </FormField>

            <FormField label="Pen Name / Pseudonym">
              <Input
                placeholder="Optional"
                value={authorForm.pseudonym}
                onChange={(e) => setAuthorForm({ ...authorForm, pseudonym: e.target.value })}
              />
            </FormField>

            <FormField label="PAN (Mandatory for TDS)">
              <Input
                placeholder="e.g. ABCDE1234F"
                value={authorForm.pan}
                onChange={(e) => setAuthorForm({ ...authorForm, pan: e.target.value })}
              />
            </FormField>

            <FormField label="Email Address">
              <Input
                placeholder="author@academic.org"
                value={authorForm.email}
                onChange={(e) => setAuthorForm({ ...authorForm, email: e.target.value })}
              />
            </FormField>

            <FormField label="Royalty Rate (% of MRP)">
              <Input
                type="number"
                placeholder="12.5"
                value={authorForm.royaltyRate}
                onChange={(e) => setAuthorForm({ ...authorForm, royaltyRate: Number(e.target.value) })}
              />
            </FormField>

            <FormField label="Payment Settlement Terms">
              <select
                className="w-full h-10 px-3 rounded-lg border border-slate-300 text-sm focus:outline-none bg-white"
                value={authorForm.paymentTerms}
                onChange={(e) => setAuthorForm({ ...authorForm, paymentTerms: e.target.value })}
              >
                <option value="Annual Settlement">Annual Settlement (March 31st)</option>
                <option value="Semi-Annual Settlement">Semi-Annual Settlement</option>
                <option value="Quarterly Settlement">Quarterly Settlement</option>
              </select>
            </FormField>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <Button type="button" variant="outline" onClick={() => setIsAuthorModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" style={{ backgroundColor: brand.primaryColor }} className="text-white">
              {editingAuthorId ? 'Save Changes' : 'Create Author Profile'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* ======================================================== */}
      {/* MODAL: CREATE & EDIT PUBLISHER                           */}
      {/* ======================================================== */}
      <Modal
        isOpen={isPublisherModalOpen}
        onClose={() => setIsPublisherModalOpen(false)}
        title={editingPublisherId ? 'Edit Publisher Imprint' : 'Add Publisher Imprint'}
        maxWidth="md"
      >
        <form onSubmit={handleSavePublisher} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <FormField label="Publisher Imprint Name" required>
                <Input
                  placeholder="e.g. Heritage Academic Press"
                  value={publisherForm.name}
                  onChange={(e) => setPublisherForm({ ...publisherForm, name: e.target.value })}
                  required
                />
              </FormField>
            </div>
            <FormField label="Publisher Code" required>
              <Input
                placeholder="e.g. PUB-HERIT"
                value={publisherForm.code}
                onChange={(e) => setPublisherForm({ ...publisherForm, code: e.target.value })}
                required
              />
            </FormField>
            <FormField label="Contact Person">
              <Input
                placeholder="e.g. Rajesh Kumar"
                value={publisherForm.contactPerson}
                onChange={(e) => setPublisherForm({ ...publisherForm, contactPerson: e.target.value })}
              />
            </FormField>
            <FormField label="Email">
              <Input
                placeholder="info@publisher.com"
                value={publisherForm.email}
                onChange={(e) => setPublisherForm({ ...publisherForm, email: e.target.value })}
              />
            </FormField>
            <FormField label="GSTIN">
              <Input
                placeholder="07AAAAA0000A1Z5"
                value={publisherForm.gstin}
                onChange={(e) => setPublisherForm({ ...publisherForm, gstin: e.target.value })}
              />
            </FormField>
          </div>
          <div className="flex justify-end gap-2 pt-3 border-t">
            <Button type="button" variant="outline" onClick={() => setIsPublisherModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" style={{ backgroundColor: brand.primaryColor }} className="text-white">
              {editingPublisherId ? 'Save Changes' : 'Save Publisher'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* ======================================================== */}
      {/* MODAL: CREATE & EDIT TRADE PARTY                         */}
      {/* ======================================================== */}
      <Modal
        isOpen={isPartyModalOpen}
        onClose={() => setIsPartyModalOpen(false)}
        title={editingPartyId ? 'Edit Trade Party' : 'Add Commercial Trade Party'}
        maxWidth="lg"
      >
        <form onSubmit={handleSaveParty} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="Party Type" required>
              <select
                className="w-full h-10 px-3 rounded-lg border border-slate-300 text-sm bg-white"
                value={partyForm.partyType}
                onChange={(e) => setPartyForm({ ...partyForm, partyType: e.target.value as any })}
              >
                <option value="DISTRIBUTOR">Book Distributor</option>
                <option value="DEALER">Retail Book Dealer</option>
                <option value="INSTITUTION_SCHOOL">School / College / Library</option>
                <option value="SUPPLIER">Paper Mill & Print Supplier</option>
                <option value="TRANSPORTER">Logistics Transporter</option>
              </select>
            </FormField>
            <FormField label="Party Legal Name" required>
              <Input
                placeholder="e.g. Oxford Book Store & Distributors"
                value={partyForm.name}
                onChange={(e) => setPartyForm({ ...partyForm, name: e.target.value })}
                required
              />
            </FormField>
            <FormField label="Party Code" required>
              <Input
                placeholder="e.g. DIST-OXF-001"
                value={partyForm.code}
                onChange={(e) => setPartyForm({ ...partyForm, code: e.target.value })}
                required
              />
            </FormField>
            <FormField label="Contact Person">
              <Input
                placeholder="e.g. Rameshwar Dayal"
                value={partyForm.contactPerson}
                onChange={(e) => setPartyForm({ ...partyForm, contactPerson: e.target.value })}
              />
            </FormField>
            <FormField label="GSTIN">
              <Input
                placeholder="07AAACR1234A1Z1"
                value={partyForm.gstin}
                onChange={(e) => setPartyForm({ ...partyForm, gstin: e.target.value })}
              />
            </FormField>
            <FormField label="Credit Limit (₹)">
              <Input
                type="number"
                placeholder="5000000"
                value={partyForm.creditLimit}
                onChange={(e) => setPartyForm({ ...partyForm, creditLimit: Number(e.target.value) })}
              />
            </FormField>
            <FormField label="Credit Days">
              <Input
                type="number"
                placeholder="45"
                value={partyForm.creditDays}
                onChange={(e) => setPartyForm({ ...partyForm, creditDays: Number(e.target.value) })}
              />
            </FormField>
            <FormField label="Discount Rate (% off MRP)">
              <Input
                type="number"
                placeholder="40"
                value={partyForm.discountRate}
                onChange={(e) => setPartyForm({ ...partyForm, discountRate: Number(e.target.value) })}
              />
            </FormField>
          </div>
          <div className="flex justify-end gap-2 pt-3 border-t">
            <Button type="button" variant="outline" onClick={() => setIsPartyModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" style={{ backgroundColor: brand.primaryColor }} className="text-white">
              {editingPartyId ? 'Save Changes' : 'Save Party'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* ======================================================== */}
      {/* MODAL: CREATE & EDIT TAXONOMY                            */}
      {/* ======================================================== */}
      <Modal
        isOpen={isTaxonomyModalOpen}
        onClose={() => setIsTaxonomyModalOpen(false)}
        title="Add Auxiliary Taxonomy"
        maxWidth="md"
      >
        <form onSubmit={handleSaveTaxonomy} className="space-y-4">
          <FormField label="Taxonomy Type" required>
            <select
              className="w-full h-10 px-3 rounded-lg border border-slate-300 text-sm bg-white"
              value={taxonomyForm.type}
              onChange={(e) => setTaxonomyForm({ ...taxonomyForm, type: e.target.value as any })}
            >
              <option value="CATEGORY">Book Category</option>
              <option value="SUBJECT">Subject</option>
              <option value="BINDING">Binding Type</option>
              <option value="BOOK_SIZE">Trim Size</option>
              <option value="DISCOUNT_SCHEME">Discount Scheme</option>
            </select>
          </FormField>
          <FormField label="Code" required>
            <Input
              placeholder="e.g. SUB-HIST"
              value={taxonomyForm.code}
              onChange={(e) => setTaxonomyForm({ ...taxonomyForm, code: e.target.value })}
              required
            />
          </FormField>
          <FormField label="Name" required>
            <Input
              placeholder="e.g. Indian History & Archaeology"
              value={taxonomyForm.name}
              onChange={(e) => setTaxonomyForm({ ...taxonomyForm, name: e.target.value })}
              required
            />
          </FormField>
          <FormField label="Description">
            <Input
              placeholder="e.g. Curriculum reference works"
              value={taxonomyForm.description}
              onChange={(e) => setTaxonomyForm({ ...taxonomyForm, description: e.target.value })}
            />
          </FormField>
          <div className="flex justify-end gap-2 pt-3 border-t">
            <Button type="button" variant="outline" onClick={() => setIsTaxonomyModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" style={{ backgroundColor: brand.primaryColor }} className="text-white">
              Save Taxonomy
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default CataloguePage;
