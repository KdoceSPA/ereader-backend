import { z } from 'zod';
import { Level, Status } from '@prisma/client';

export const createBookSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255),
  description: z.string().optional(),
  level: z.nativeEnum(Level),
  coverImage: z.string().optional(),
  fileUrl: z.string().min(1, 'File URL is required'),
  status: z.nativeEnum(Status).optional().default(Status.active),
});

export const updateBookSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  description: z.string().optional(),
  level: z.nativeEnum(Level).optional(),
  coverImage: z.string().optional(),
  fileUrl: z.string().optional(),
  status: z.nativeEnum(Status).optional(),
});

export type CreateBookInput = z.infer<typeof createBookSchema>;
export type UpdateBookInput = z.infer<typeof updateBookSchema>;
