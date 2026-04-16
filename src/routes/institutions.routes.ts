import { Router, Request, Response, NextFunction } from 'express';
import { authenticate } from '../middleware/auth';
import { requireRole } from '../middleware/requireRole';
import {
  listInstitutions,
  getInstitution,
  createInstitutionHandler,
  updateInstitutionHandler,
  deleteInstitutionHandler,
  listInstitutionBooks,
  addBookToInstitutionHandler,
  removeBookFromInstitutionHandler,
} from '../controllers/institutions.controller';

const router = Router();

router.use(authenticate);

function requireSelfOrAdmin(req: Request, res: Response, next: NextFunction): void {
  if (req.user!.role === 'admin') return next();
  if (req.user!.role === 'content' && req.user!.institutionId === Number(req.params.id)) return next();
  res.status(403).json({ error: 'Forbidden' });
}

router.get('/', requireRole('admin'), listInstitutions);
router.post('/', requireRole('admin'), createInstitutionHandler);
router.get('/:id', requireRole('admin'), getInstitution);
router.put('/:id', requireRole('admin'), updateInstitutionHandler);
router.delete('/:id', requireRole('admin'), deleteInstitutionHandler);

router.get('/:id/books', requireSelfOrAdmin, listInstitutionBooks);
router.post('/:id/books', requireRole('admin'), addBookToInstitutionHandler);
router.delete('/:id/books/:bookId', requireRole('admin'), removeBookFromInstitutionHandler);

export default router;
