import { booksService } from './books.service';

describe('Books Module Tests', () => {
  it('should fetch list of books records with seed catalogue', async () => {
    const result = await booksService.getAll();
    expect(result).toBeDefined();
    expect(result.items.length).toBeGreaterThan(0);
    expect(result.items[0].status).toBe('ACTIVE');
  });

  it('should fetch single book by valid id', async () => {
    const all = await booksService.getAll();
    const firstBook = all.items[0];
    const item = await booksService.getById(firstBook.id);
    expect(item).toBeDefined();
    expect(item?.id).toBe(firstBook.id);
    expect(item?.mrp).toBeGreaterThan(0);
  });

  it('should prevent duplicate SKU creation', async () => {
    const all = await booksService.getAll();
    const existing = all.items[0];

    await expect(
      booksService.create({
        title: 'Duplicate SKU Test Title',
        sku: existing.sku,
        mrp: 500,
        authorName: 'Test Author',
        publisherName: 'Test Publisher',
        subject: 'Math',
        category: 'Academic',
      })
    ).rejects.toThrow(/already exists in the catalogue/);
  });

  it('should group multiple editions and languages of same title', async () => {
    const result = await booksService.getEditionsAndFormats('bk_math_12_eng_pb');
    expect(result).toBeDefined();
    expect(result.primaryBook.title).toContain('Mathematics for Class XII');
    expect(result.editionsAndFormats.length).toBeGreaterThanOrEqual(2);
    // Verified both English and Hindi editions exist in the group
    const languages = result.editionsAndFormats.map((b) => b.language);
    expect(languages).toContain('English');
    expect(languages).toContain('Hindi');
  });

  it('should support Author and Publisher masters', async () => {
    const authors = await booksService.getAuthors();
    expect(authors.length).toBeGreaterThan(0);
    expect(authors[0].royaltyRate).toBeGreaterThan(0);

    const publishers = await booksService.getPublishers();
    expect(publishers.length).toBeGreaterThan(0);
  });
});
