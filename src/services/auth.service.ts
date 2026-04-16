import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/db';
import { env } from '../config/env';
import { LoginInput } from '../schemas/auth.schema';

export async function login(data: LoginInput) {
  const user = await prisma.user.findUnique({
    where: { email: data.email },
  });

  if (!user) {
    throw Object.assign(new Error('Invalid credentials'), { status: 401 });
  }

  const passwordValid = await bcrypt.compare(data.password, user.password);
  if (!passwordValid) {
    throw Object.assign(new Error('Invalid credentials'), { status: 401 });
  }

  const token = jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
      institutionId: user.institutionId,
    },
    env.JWT_SECRET,
    { expiresIn: '7d' }
  );

  return {
    token,
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      institutionId: user.institutionId,
    },
  };
}
