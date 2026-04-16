import { Request, Response, NextFunction } from 'express';
import { createInstitutionSchema, updateInstitutionSchema } from '../schemas/institution.schema';
import {
  getAllInstitutions,
  getInstitutionById,
  createInstitution,
  updateInstitution,
  deleteInstitution,
  getInstitutionBooks,
  addBookToInstitution,
  removeBookFromInstitution,
} from '../services/institutions.service';

export async function listInstitutions(req: Request, res: Response, next: NextFunction) {
  try {
    res.json(await getAllInstitutions());
  } catch (err) {
    next(err);
  }
}

export async function getInstitution(req: Request, res: Response, next: NextFunction) {
  try {
    res.json(await getInstitutionById(Number(req.params.id)));
  } catch (err) {
    next(err);
  }
}

export async function createInstitutionHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const data = createInstitutionSchema.parse(req.body);
    const institution = await createInstitution(data);
    res.status(201).json(institution);
  } catch (err) {
    next(err);
  }
}

export async function updateInstitutionHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const data = updateInstitutionSchema.parse(req.body);
    res.json(await updateInstitution(Number(req.params.id), data));
  } catch (err) {
    next(err);
  }
}

export async function deleteInstitutionHandler(req: Request, res: Response, next: NextFunction) {
  try {
    await deleteInstitution(Number(req.params.id));
    res.status(204).end();
  } catch (err) {
    next(err);
  }
}

export async function listInstitutionBooks(req: Request, res: Response, next: NextFunction) {
  try {
    res.json(await getInstitutionBooks(Number(req.params.id)));
  } catch (err) {
    next(err);
  }
}

export async function addBookToInstitutionHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const { bookId } = req.body;
    if (!bookId || typeof bookId !== 'number') {
      res.status(400).json({ error: 'bookId must be a number' });
      return;
    }
    const link = await addBookToInstitution(Number(req.params.id), bookId);
    res.status(201).json(link);
  } catch (err) {
    next(err);
  }
}

export async function removeBookFromInstitutionHandler(req: Request, res: Response, next: NextFunction) {
  try {
    await removeBookFromInstitution(Number(req.params.id), Number(req.params.bookId));
    res.status(204).end();
  } catch (err) {
    next(err);
  }
}
