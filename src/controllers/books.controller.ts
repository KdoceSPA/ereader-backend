import { Request, Response, NextFunction } from 'express';
import { createBookSchema, updateBookSchema } from '../schemas/book.schema';
import { getAllBooks, getBookById, createBook, updateBook, deleteBook } from '../services/books.service';

export async function listBooks(req: Request, res: Response, next: NextFunction) {
  try {
    const books = await getAllBooks();
    res.json(books);
  } catch (err) {
    next(err);
  }
}

export async function getBook(req: Request, res: Response, next: NextFunction) {
  try {
    const book = await getBookById(Number(req.params.id));
    res.json(book);
  } catch (err) {
    next(err);
  }
}

export async function createBookHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const data = createBookSchema.parse(req.body);
    const book = await createBook(data);
    res.status(201).json(book);
  } catch (err) {
    next(err);
  }
}

export async function updateBookHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const data = updateBookSchema.parse(req.body);
    const book = await updateBook(Number(req.params.id), data);
    res.json(book);
  } catch (err) {
    next(err);
  }
}

export async function deleteBookHandler(req: Request, res: Response, next: NextFunction) {
  try {
    await deleteBook(Number(req.params.id));
    res.status(204).end();
  } catch (err) {
    next(err);
  }
}
