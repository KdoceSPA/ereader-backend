import { z } from 'zod';
import { Level, Status, FileType } from '@prisma/client';

export const createBookSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255),
  description: z.string().optional(),
  levels: z.array(z.nativeEnum(Level)).min(1, 'At least one level is required'),
  coverImage: z.string().optional(),
  fileUrl: z.string().min(1, 'File URL is required'),
  fileType: z.nativeEnum(FileType).optional().default(FileType.epub),
  status: z.nativeEnum(Status).optional().default(Status.active),
});

export const updateBookSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  description: z.string().optional(),
  levels: z.array(z.nativeEnum(Level)).min(1, 'At least one level is required').optional(),
  coverImage: z.string().optional(),
  fileUrl: z.string().optional(),
  fileType: z.nativeEnum(FileType).optional(),
  status: z.nativeEnum(Status).optional(),
});

export const levelParamSchema = z.nativeEnum(Level);

export type CreateBookInput = z.infer<typeof createBookSchema>;
export type UpdateBookInput = z.infer<typeof updateBookSchema>;
