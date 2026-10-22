import { Request, Response, NextFunction } from 'express';
import { createUserSchema, updateUserSchema } from '../schemas/user.schema';
import { getAllUsers, createUser, updateUser, deleteUser } from '../services/users.service';

export async function listUsers(req: Request, res: Response, next: NextFunction) {
  try {
    const users = await getAllUsers(req.user!);
    res.json(users);
  } catch (err) {
    next(err);
  }
}

export async function createUserHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const data = createUserSchema.parse(req.body);
    const user = await createUser(data, req.user!);
    res.status(201).json(user);
  } catch (err) {
    next(err);
  }
}

export async function updateUserHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const data = updateUserSchema.parse(req.body);
    const user = await updateUser(Number(req.params.id), data, req.user!);
    res.json(user);
  } catch (err) {
    next(err);
  }
}

export async function deleteUserHandler(req: Request, res: Response, next: NextFunction) {
  try {
    await deleteUser(Number(req.params.id), req.user!);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
}
