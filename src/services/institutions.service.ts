import { prisma } from '../config/db';
import { CreateInstitutionInput, UpdateInstitutionInput } from '../schemas/institution.schema';

export async function getAllInstitutions() {
  return prisma.institution.findMany({ orderBy: { createdAt: 'desc' } });
}

export async function getInstitutionById(id: number) {
  const institution = await prisma.institution.findUnique({ where: { id } });
  if (!institution) {
    throw Object.assign(new Error('Institution not found'), { status: 404 });
  }
  return institution;
}

export async function createInstitution(data: CreateInstitutionInput) {
  return prisma.institution.create({ data });
}

export async function updateInstitution(id: number, data: UpdateInstitutionInput) {
  await getInstitutionById(id);
  return prisma.institution.update({ where: { id }, data });
}

export async function deleteInstitution(id: number) {
  await getInstitutionById(id);
  return prisma.institution.delete({ where: { id } });
}

export async function getInstitutionBooks(institutionId: number) {
  await getInstitutionById(institutionId);
  const links = await prisma.institutionBook.findMany({
    where: { institutionId },
    include: { book: { include: { levels: true } } },
  });
  return links.map((l) => {
    const { levels, ...rest } = l.book;
    const flatLevels = levels.map((bl) => bl.level);
    // `level` (singular) se mantiene por compatibilidad con APKs ya instalados.
    return { ...rest, levels: flatLevels, level: flatLevels[0] ?? null };
  });
}

export async function addBookToInstitution(institutionId: number, bookId: number) {
  await getInstitutionById(institutionId);

  const book = await prisma.book.findUnique({ where: { id: bookId } });
  if (!book) {
    throw Object.assign(new Error('Book not found'), { status: 404 });
  }

  return prisma.institutionBook.create({
    data: { institutionId, bookId },
  });
}

export async function removeBookFromInstitution(institutionId: number, bookId: number) {
  const link = await prisma.institutionBook.findUnique({
    where: { institutionId_bookId: { institutionId, bookId } },
  });

  if (!link) {
    throw Object.assign(new Error('Book not linked to institution'), { status: 404 });
  }

  return prisma.institutionBook.delete({
    where: { institutionId_bookId: { institutionId, bookId } },
  });
}
