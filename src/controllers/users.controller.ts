import { Request, Response, NextFunction } from 'express';
import { createUserSchema } from '../schemas/user.schema';
import { getAllUsers, createUser, deleteUser } from '../services/users.service';

export async function listUsers(req: Request, res: Response, next: NextFunction) {
  try {
    const users = await getAllUsers();
    res.json(users);
  } catch (err) {
    next(err);
  }
}

export async function createUserHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const data = createUserSchema.parse(req.body);
    const user = await createUser(data);
    res.status(201).json(user);
  } catch (err) {
    next(err);
  }
}

export async function deleteUserHandler(req: Request, res: Response, next: NextFunction) {
  try {
    await deleteUser(Number(req.params.id));
    res.status(204).end();
  } catch (err) {
    next(err);
  }
}
