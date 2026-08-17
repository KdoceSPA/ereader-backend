import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { env } from '../config/env';

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let folder: string;

    if (file.fieldname === 'epub') {
      folder = path.join(env.STORAGE_PATH, 'books');
    } else if (file.fieldname === 'cover') {
      folder = path.join(env.STORAGE_PATH, 'covers');
    } else {
      return cb(new Error(`Unknown fieldname: ${file.fieldname}`), '');
    }

    fs.mkdirSync(folder, { recursive: true });
    cb(null, folder);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  },
});

function fileFilter(
  req: Express.Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) {
  if (file.fieldname === 'epub') {
    const isEpub = file.mimetype === 'application/epub+zip' || file.originalname.endsWith('.epub');
    const isPdf = file.mimetype === 'application/pdf' || file.originalname.endsWith('.pdf');
    if (isEpub || isPdf) {
      cb(null, true);
    } else {
      cb(new Error('Only .epub or .pdf files are allowed for the epub field'));
    }
  } else if (file.fieldname === 'cover') {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed for the cover field'));
    }
  } else {
    cb(new Error(`Unknown field: ${file.fieldname}`));
  }
}

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50 MB
  },
});
