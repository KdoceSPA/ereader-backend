import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { requireRole } from '../middleware/requireRole';
import {
  listUsers,
  createUserHandler,
  updateUserHandler,
  deleteUserHandler,
} from '../controllers/users.controller';

const router = Router();

router.use(authenticate);
router.use(requireRole('admin', 'content'));

router.get('/', listUsers);
router.post('/', createUserHandler);
router.put('/:id', updateUserHandler);
router.delete('/:id', deleteUserHandler);

export default router;
