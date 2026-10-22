import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { requireRole } from '../middleware/requireRole';
import {
  listBooks,
  getBook,
  createBookHandler,
  updateBookHandler,
  deleteBookHandler,
  removeBookLevelHandler,
} from '../controllers/books.controller';

const router = Router();

router.use(authenticate);

router.get('/', listBooks);
router.get('/:id', getBook);
router.post('/', requireRole('admin', 'content'), createBookHandler);
router.put('/:id', requireRole('admin', 'content'), updateBookHandler);
router.delete('/:id', requireRole('admin', 'content'), deleteBookHandler);
router.delete('/:id/levels/:level', requireRole('admin', 'content'), removeBookLevelHandler);

export default router;
