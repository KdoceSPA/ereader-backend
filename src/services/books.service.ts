import { Role } from '@prisma/client';
import { prisma } from '../config/db';
import { CreateBookInput, UpdateBookInput } from '../schemas/book.schema';

type AuthUser = { role: Role; institutionId: number | null };

async function assertOwnership(bookId: number, user: AuthUser) {
  if (user.role !== 'content') return;
  const link = await prisma.institutionBook.findFirst({
    where: { bookId, institutionId: user.institutionId ?? -1 },
  });
  if (!link) {
    throw Object.assign(new Error('Book not found'), { status: 404 });
  }
}

export async function getAllBooks(user: AuthUser) {
  return prisma.book.findMany({
    where:
      user.role === 'content'
        ? { institutions: { some: { institutionId: user.institutionId ?? -1 } } }
        : undefined,
    orderBy: { createdAt: 'desc' },
  });
}

export async function getBookById(id: number, user: AuthUser) {
  const book = await prisma.book.findUnique({ where: { id } });
  if (!book) {
    throw Object.assign(new Error('Book not found'), { status: 404 });
  }
  await assertOwnership(id, user);
  return book;
}

export async function createBook(data: CreateBookInput, user: AuthUser) {
  if (user.role === 'content') {
    if (!user.institutionId) {
      throw Object.assign(
        new Error('Content user must belong to an institution to create books'),
        { status: 400 }
      );
    }
    return prisma.$transaction(async (tx) => {
      const book = await tx.book.create({ data });
      await tx.institutionBook.create({
        data: { bookId: book.id, institutionId: user.institutionId! },
      });
      return book;
    });
  }
  return prisma.book.create({ data });
}

export async function updateBook(id: number, data: UpdateBookInput, user: AuthUser) {
  await getBookById(id, user);
  return prisma.book.update({ where: { id }, data });
}

export async function deleteBook(id: number) {
  const book = await prisma.book.findUnique({ where: { id } });
  if (!book) {
    throw Object.assign(new Error('Book not found'), { status: 404 });
  }
  return prisma.book.delete({ where: { id } });
}
