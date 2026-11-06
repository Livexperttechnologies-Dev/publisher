import { Router } from 'express';
import { booksController } from './books.controller';
import { authenticateJwt } from '../../middleware/authMiddleware';

const router = Router();

// Apply Authentication Guard to all Master Data & Book Catalogue routes
router.use(authenticateJwt);

// Specialized operations (defined BEFORE /:id parameterized routes)
router.get('/export', (req, res, next) => booksController.exportCatalogue(req, res, next));
router.post('/bulk-import', (req, res, next) => booksController.bulkImport(req, res, next));

// Authors Master
router.get('/authors', (req, res, next) => booksController.getAuthors(req, res, next));
router.post('/authors', (req, res, next) => booksController.createAuthor(req, res, next));
router.get('/authors/:id', (req, res, next) => booksController.getAuthorById(req, res, next));

// Publishers Master
router.get('/publishers', (req, res, next) => booksController.getPublishers(req, res, next));
router.post('/publishers', (req, res, next) => booksController.createPublisher(req, res, next));
router.get('/publishers/:id', (req, res, next) => booksController.getPublisherById(req, res, next));

// Taxonomies & Auxiliary Masters
router.get('/taxonomies', (req, res, next) => booksController.getTaxonomies(req, res, next));
router.post('/taxonomies', (req, res, next) => booksController.createTaxonomy(req, res, next));

// Party Masters (Customers, Suppliers, Dealers, Distributors, Schools, Transporters)
router.get('/parties', (req, res, next) => booksController.getParties(req, res, next));
router.post('/parties', (req, res, next) => booksController.createParty(req, res, next));
router.get('/parties/:id', (req, res, next) => booksController.getPartyById(req, res, next));

// Book Catalogue Standard CRUD & Editions
router.get('/', (req, res, next) => booksController.getAll(req, res, next));
router.post('/', (req, res, next) => booksController.create(req, res, next));
router.get('/:id', (req, res, next) => booksController.getById(req, res, next));
router.put('/:id', (req, res, next) => booksController.update(req, res, next));
router.delete('/:id', (req, res, next) => booksController.delete(req, res, next));
router.get('/:id/editions', (req, res, next) => booksController.getEditions(req, res, next));

export const booksRoutes = router;
