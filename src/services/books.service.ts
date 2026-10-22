import { Role, Level } from '@prisma/client';
import { prisma } from '../config/db';
import { CreateBookInput, UpdateBookInput } from '../schemas/book.schema';

type AuthUser = { id: number; role: Role; institutionId: number | null };

const bookInclude = { levels: true } as const;

function toBookResponse<T extends { levels: { level: Level }[] }>(book: T) {
  const { levels, ...rest } = book;
  const flatLevels = levels.map((l) => l.level);
  // `level` (singular) se mantiene por compatibilidad con APKs ya instalados
  // que todavía esperan ese campo en vez de `levels`.
  return { ...rest, levels: flatLevels, level: flatLevels[0] ?? null };
}

async function assertVisible(bookId: number, user: AuthUser) {
  if (user.role !== 'content') return;
  const link = await prisma.institutionBook.findFirst({
    where: { bookId, institutionId: user.institutionId ?? -1 },
  });
  if (!link) {
    throw Object.assign(new Error('Book not found'), { status: 404 });
  }
}

function assertEditable(book: { createdByUserId: number | null }, user: AuthUser) {
  if (user.role === 'content' && book.createdByUserId !== user.id) {
    throw Object.assign(new Error('Book not found'), { status: 404 });
  }
}

export async function getAllBooks(user: AuthUser) {
  const books = await prisma.book.findMany({
    where:
      user.role === 'content'
        ? { institutions: { some: { institutionId: user.institutionId ?? -1 } } }
        : undefined,
    orderBy: { createdAt: 'desc' },
    include: bookInclude,
  });
  return books.map(toBookResponse);
}

export async function getBookById(id: number, user: AuthUser) {
  const book = await prisma.book.findUnique({ where: { id }, include: bookInclude });
  if (!book) {
    throw Object.assign(new Error('Book not found'), { status: 404 });
  }
  await assertVisible(id, user);
  return toBookResponse(book);
}

export async function createBook(data: CreateBookInput, user: AuthUser) {
  const { levels, ...bookData } = data;

  if (user.role === 'content') {
    if (!user.institutionId) {
      throw Object.assign(
        new Error('Content user must belong to an institution to create books'),
        { status: 400 }
      );
    }
    return prisma.$transaction(async (tx) => {
      const book = await tx.book.create({ data: { ...bookData, createdByUserId: user.id } });
      await tx.bookLevel.createMany({
        data: levels.map((level) => ({ bookId: book.id, level })),
      });
      await tx.institutionBook.create({
        data: { bookId: book.id, institutionId: user.institutionId! },
      });
      const full = await tx.book.findUniqueOrThrow({
        where: { id: book.id },
        include: bookInclude,
      });
      return toBookResponse(full);
    });
  }

  return prisma.$transaction(async (tx) => {
    const book = await tx.book.create({ data: bookData });
    await tx.bookLevel.createMany({
      data: levels.map((level) => ({ bookId: book.id, level })),
    });
    const full = await tx.book.findUniqueOrThrow({
      where: { id: book.id },
      include: bookInclude,
    });
    return toBookResponse(full);
  });
}

export async function updateBook(id: number, data: UpdateBookInput, user: AuthUser) {
  const book = await getBookById(id, user);
  assertEditable(book, user);

  const { levels, ...bookData } = data;

  return prisma.$transaction(async (tx) => {
    await tx.book.update({ where: { id }, data: bookData });

    if (levels) {
      await tx.bookLevel.deleteMany({ where: { bookId: id } });
      await tx.bookLevel.createMany({
        data: levels.map((level) => ({ bookId: id, level })),
      });
    }

    const full = await tx.book.findUniqueOrThrow({
      where: { id },
      include: bookInclude,
    });
    return toBookResponse(full);
  });
}

export async function deleteBook(id: number, user: AuthUser) {
  const book = await getBookById(id, user);
  assertEditable(book, user);
  return prisma.book.delete({ where: { id } });
}

export async function removeBookLevel(id: number, level: Level, user: AuthUser) {
  const book = await getBookById(id, user);
  assertEditable(book, user);

  if (!book.levels.includes(level)) {
    throw Object.assign(new Error('Level not associated with this book'), { status: 404 });
  }

  if (book.levels.length === 1) {
    await prisma.book.delete({ where: { id } });
    return { deleted: true as const };
  }

  await prisma.bookLevel.delete({ where: { bookId_level: { bookId: id, level } } });
  return { deleted: false as const };
}
