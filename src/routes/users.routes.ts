import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { requireRole } from '../middleware/requireRole';
import { listUsers, createUserHandler, deleteUserHandler } from '../controllers/users.controller';

const router = Router();

router.use(authenticate);
router.use(requireRole('admin'));

router.get('/', listUsers);
router.post('/', createUserHandler);
router.delete('/:id', deleteUserHandler);

export default router;
