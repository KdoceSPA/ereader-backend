import { prisma } from '../config/db';
import { CreateBookInput, UpdateBookInput } from '../schemas/book.schema';

export async function getAllBooks() {
  return prisma.book.findMany({
    orderBy: { createdAt: 'desc' },
  });
}

export async function getBookById(id: number) {
  const book = await prisma.book.findUnique({ where: { id } });
  if (!book) {
    throw Object.assign(new Error('Book not found'), { status: 404 });
  }
  return book;
}

export async function createBook(data: CreateBookInput) {
  return prisma.book.create({ data });
}

export async function updateBook(id: number, data: UpdateBookInput) {
  await getBookById(id);
  return prisma.book.update({ where: { id }, data });
}

export async function deleteBook(id: number) {
  await getBookById(id);
  return prisma.book.delete({ where: { id } });
}
