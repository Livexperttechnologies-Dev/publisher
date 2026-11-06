import { Request, Response, NextFunction } from 'express';
import { booksService } from './books.service';
import {
  createBookSchema,
  updateBookSchema,
  createAuthorSchema,
  createPublisherSchema,
  createTaxonomySchema,
  createPartySchema,
  bulkImportSchema,
} from './books.validator';

export class BooksController {
  // --------------------------------------------------------------------------
  // BOOKS
  // --------------------------------------------------------------------------
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const { page, limit, search, category, subject, language, authorId, publisherId, status, parentTitleId } = req.query;
      const companyId = (req as any).user?.companyId;

      const result = await booksService.getAll({
        page: page ? Number(page) : 1,
        limit: limit ? Number(limit) : 50,
        search: search as string,
        category: category as string,
        subject: subject as string,
        language: language as string,
        authorId: authorId as string,
        publisherId: publisherId as string,
        status: status as string,
        parentTitleId: parentTitleId as string,
        companyId,
      });

      return res.status(200).json({
        success: true,
        data: result.items,
        meta: {
          total: result.total,
          page: page ? Number(page) : 1,
          limit: limit ? Number(limit) : 50,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const item = await booksService.getById(id);
      if (!item) {
        return res.status(404).json({ success: false, message: 'Book record not found' });
      }
      return res.status(200).json({ success: true, data: item });
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const validated = createBookSchema.parse(req.body);
      const companyId = (req as any).user?.companyId || 'cmp_default_publisher';
      const created = await booksService.create(validated, companyId);
      return res.status(201).json({ success: true, data: created, message: 'Book created successfully' });
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const validated = updateBookSchema.parse(req.body);
      const companyId = (req as any).user?.companyId;
      const updated = await booksService.update(id, validated, companyId);
      return res.status(200).json({ success: true, data: updated, message: 'Book updated successfully' });
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const companyId = (req as any).user?.companyId;
      const result = await booksService.delete(id, companyId);
      return res.status(200).json({ success: true, message: result.message });
    } catch (error) {
      next(error);
    }
  }

  async getEditions(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const result = await booksService.getEditionsAndFormats(id);
      return res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async bulkImport(req: Request, res: Response, next: NextFunction) {
    try {
      const validated = bulkImportSchema.parse(req.body);
      const companyId = (req as any).user?.companyId || 'cmp_default_publisher';
      const result = await booksService.bulkImport(validated.items, companyId, validated.duplicateHandling);

      const status = result.errors.length > 0 && result.successfulCount === 0 ? 400 : 200;
      return res.status(status).json({
        success: result.successfulCount > 0,
        data: result,
        message: `Import processed: ${result.successfulCount} imported, ${result.failedCount} errors.`,
      });
    } catch (error) {
      next(error);
    }
  }

  async exportCatalogue(req: Request, res: Response, next: NextFunction) {
    try {
      const companyId = (req as any).user?.companyId;
      const { csv, count } = await booksService.exportCatalogue(companyId);

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="book-catalogue-${Date.now()}.csv"`);
      return res.status(200).send(csv);
    } catch (error) {
      next(error);
    }
  }

  // --------------------------------------------------------------------------
  // AUTHORS
  // --------------------------------------------------------------------------
  async getAuthors(req: Request, res: Response, next: NextFunction) {
    try {
      const companyId = (req as any).user?.companyId;
      const authors = await booksService.getAuthors(companyId);
      return res.status(200).json({ success: true, data: authors });
    } catch (error) {
      next(error);
    }
  }

  async getAuthorById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const author = await booksService.getAuthorById(id);
      if (!author) {
        return res.status(404).json({ success: false, message: 'Author not found' });
      }
      return res.status(200).json({ success: true, data: author });
    } catch (error) {
      next(error);
    }
  }

  async createAuthor(req: Request, res: Response, next: NextFunction) {
    try {
      const validated = createAuthorSchema.parse(req.body);
      const companyId = (req as any).user?.companyId || 'cmp_default_publisher';
      const created = await booksService.createAuthor(validated, companyId);
      return res.status(201).json({ success: true, data: created, message: 'Author created successfully' });
    } catch (error) {
      next(error);
    }
  }

  // --------------------------------------------------------------------------
  // PUBLISHERS
  // --------------------------------------------------------------------------
  async getPublishers(req: Request, res: Response, next: NextFunction) {
    try {
      const companyId = (req as any).user?.companyId;
      const publishers = await booksService.getPublishers(companyId);
      return res.status(200).json({ success: true, data: publishers });
    } catch (error) {
      next(error);
    }
  }

  async getPublisherById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const publisher = await booksService.getPublisherById(id);
      if (!publisher) {
        return res.status(404).json({ success: false, message: 'Publisher not found' });
      }
      return res.status(200).json({ success: true, data: publisher });
    } catch (error) {
      next(error);
    }
  }

  async createPublisher(req: Request, res: Response, next: NextFunction) {
    try {
      const validated = createPublisherSchema.parse(req.body);
      const companyId = (req as any).user?.companyId || 'cmp_default_publisher';
      const created = await booksService.createPublisher(validated, companyId);
      return res.status(201).json({ success: true, data: created, message: 'Publisher created successfully' });
    } catch (error) {
      next(error);
    }
  }

  // --------------------------------------------------------------------------
  // TAXONOMIES
  // --------------------------------------------------------------------------
  async getTaxonomies(req: Request, res: Response, next: NextFunction) {
    try {
      const { type } = req.query;
      const companyId = (req as any).user?.companyId;
      const list = await booksService.getTaxonomies(type as string, companyId);
      return res.status(200).json({ success: true, data: list });
    } catch (error) {
      next(error);
    }
  }

  async createTaxonomy(req: Request, res: Response, next: NextFunction) {
    try {
      const validated = createTaxonomySchema.parse(req.body);
      const companyId = (req as any).user?.companyId || 'cmp_default_publisher';
      const created = await booksService.createTaxonomy(validated, companyId);
      return res.status(201).json({ success: true, data: created, message: 'Taxonomy item created' });
    } catch (error) {
      next(error);
    }
  }

  // --------------------------------------------------------------------------
  // PARTIES (CUSTOMERS, SUPPLIERS, DISTRIBUTORS, ETC.)
  // --------------------------------------------------------------------------
  async getParties(req: Request, res: Response, next: NextFunction) {
    try {
      const { type } = req.query;
      const companyId = (req as any).user?.companyId;
      const list = await booksService.getParties(type as string, companyId);
      return res.status(200).json({ success: true, data: list });
    } catch (error) {
      next(error);
    }
  }

  async getPartyById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const party = await booksService.getPartyById(id);
      if (!party) {
        return res.status(404).json({ success: false, message: 'Party not found' });
      }
      return res.status(200).json({ success: true, data: party });
    } catch (error) {
      next(error);
    }
  }

  async createParty(req: Request, res: Response, next: NextFunction) {
    try {
      const validated = createPartySchema.parse(req.body);
      const companyId = (req as any).user?.companyId || 'cmp_default_publisher';
      const created = await booksService.createParty(validated, companyId);
      return res.status(201).json({ success: true, data: created, message: 'Party created successfully' });
    } catch (error) {
      next(error);
    }
  }
}

export const booksController = new BooksController();
