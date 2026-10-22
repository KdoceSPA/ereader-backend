import bcrypt from 'bcryptjs';
import { Role } from '@prisma/client';
import { prisma } from '../config/db';
import { CreateUserInput, UpdateUserInput } from '../schemas/user.schema';

type AuthUser = { id: number; role: Role; institutionId: number | null };

const userSelect = {
  id: true,
  email: true,
  role: true,
  institutionId: true,
  createdAt: true,
} as const;

async function assertManageable(targetId: number, user: AuthUser) {
  if (user.role === 'admin') return;

  if (targetId === user.id) {
    throw Object.assign(new Error('User not found'), { status: 404 });
  }

  const target = await prisma.user.findUnique({ where: { id: targetId } });
  if (
    !target ||
    target.role !== 'content' ||
    target.institutionId !== user.institutionId
  ) {
    throw Object.assign(new Error('User not found'), { status: 404 });
  }
}

export async function getAllUsers(user: AuthUser) {
  return prisma.user.findMany({
    where:
      user.role === 'content'
        ? { role: 'content', institutionId: user.institutionId ?? -1 }
        : undefined,
    select: userSelect,
    orderBy: { createdAt: 'desc' },
  });
}

export async function createUser(data: CreateUserInput, user: AuthUser) {
  const hashed = await bcrypt.hash(data.password, 10);

  if (user.role === 'content') {
    if (!user.institutionId) {
      throw Object.assign(
        new Error('Content user must belong to an institution to create users'),
        { status: 400 }
      );
    }
    return prisma.user.create({
      data: { email: data.email, password: hashed, role: 'content', institutionId: user.institutionId },
      select: userSelect,
    });
  }

  return prisma.user.create({
    data: {
      email: data.email,
      password: hashed,
      role: data.role,
      institutionId: data.institutionId ?? null,
    },
    select: userSelect,
  });
}

export async function updateUser(id: number, data: UpdateUserInput, user: AuthUser) {
  await assertManageable(id, user);

  if (user.role === 'content') {
    const { email, password } = data;
    return prisma.user.update({
      where: { id },
      data: {
        ...(email ? { email } : {}),
        ...(password ? { password: await bcrypt.hash(password, 10) } : {}),
      },
      select: userSelect,
    });
  }

  return prisma.user.update({
    where: { id },
    data: {
      ...(data.email ? { email: data.email } : {}),
      ...(data.password ? { password: await bcrypt.hash(data.password, 10) } : {}),
      ...(data.role ? { role: data.role } : {}),
      ...(data.institutionId !== undefined ? { institutionId: data.institutionId } : {}),
    },
    select: userSelect,
  });
}

export async function deleteUser(id: number, user: AuthUser) {
  await assertManageable(id, user);
  await prisma.user.delete({ where: { id } });
}
