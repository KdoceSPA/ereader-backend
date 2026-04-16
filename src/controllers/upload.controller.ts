import { Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs';
import { prisma } from '../config/db';
import { env } from '../config/env';

export async function uploadFiles(req: Request, res: Response, next: NextFunction) {
  try {
    const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;

    if (!files) {
      res.status(400).json({ error: 'No files uploaded' });
      return;
    }

    const result: Record<string, string> = {};

    if (files.epub?.[0]) {
      const epubFile = files.epub[0];
      result.fileUrl = `/storage/books/${epubFile.filename}`;
    }

    if (files.cover?.[0]) {
      const coverFile = files.cover[0];
      result.coverImage = `/storage/covers/${coverFile.filename}`;
    }

    res.json({ message: 'Files uploaded successfully', ...result });
  } catch (err) {
    next(err);
  }
}

export async function downloadBook(req: Request, res: Response, next: NextFunction) {
  try {
    const bookId = Number(req.params.bookId);
    const user = req.user!;

    const book = await prisma.book.findUnique({ where: { id: bookId } });
    if (!book) {
      res.status(404).json({ error: 'Book not found' });
      return;
    }

    // Multi-tenant check: content role users can only access books linked to their institution
    if (user.role === 'content') {
      if (!user.institutionId) {
        res.status(403).json({ error: 'No institution assigned' });
        return;
      }

      const link = await prisma.institutionBook.findUnique({
        where: {
          institutionId_bookId: {
            institutionId: user.institutionId,
            bookId,
          },
        },
      });

      if (!link) {
        res.status(403).json({ error: 'Book not available for your institution' });
        return;
      }
    }

    // Resolve file path
    const relativePath = book.fileUrl.replace(/^\/storage\//, '');
    const filePath = path.resolve(env.STORAGE_PATH, relativePath);

    if (!fs.existsSync(filePath)) {
      res.status(404).json({ error: 'File not found on server' });
      return;
    }

    res.download(filePath);
  } catch (err) {
    next(err);
  }
}
