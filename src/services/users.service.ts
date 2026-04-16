import bcrypt from 'bcryptjs';
import { prisma } from '../config/db';
import { CreateUserInput } from '../schemas/user.schema';

export async function getAllUsers() {
  return prisma.user.findMany({
    select: {
      id: true,
      email: true,
      role: true,
      institutionId: true,
      createdAt: true,
    },
    orderBy: { createdAt: 'desc' },
  });
}

export async function createUser(data: CreateUserInput) {
  const hashed = await bcrypt.hash(data.password, 10);
  return prisma.user.create({
    data: {
      email: data.email,
      password: hashed,
      role: data.role,
      institutionId: data.institutionId ?? null,
    },
    select: {
      id: true,
      email: true,
      role: true,
      institutionId: true,
      createdAt: true,
    },
  });
}

export async function deleteUser(id: number) {
  await prisma.user.delete({ where: { id } });
}
