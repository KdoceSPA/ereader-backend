import { z } from 'zod';
import { Status } from '@prisma/client';

export const createInstitutionSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255),
  status: z.nativeEnum(Status).optional().default(Status.active),
});

export const updateInstitutionSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  status: z.nativeEnum(Status).optional(),
});

export type CreateInstitutionInput = z.infer<typeof createInstitutionSchema>;
export type UpdateInstitutionInput = z.infer<typeof updateInstitutionSchema>;
