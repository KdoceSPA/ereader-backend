import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { requireRole } from '../middleware/requireRole';
import { upload } from '../middleware/upload';
import { uploadFiles, downloadBook } from '../controllers/upload.controller';

const router = Router();

router.use(authenticate);

// Upload: admin and content can upload
router.post(
  '/',
  requireRole('admin', 'content'),
  upload.fields([
    { name: 'epub', maxCount: 1 },
    { name: 'cover', maxCount: 1 },
  ]),
  uploadFiles
);

// Download with multi-tenant check
router.get('/download/:bookId', requireRole('admin', 'content'), downloadBook);

export default router;
