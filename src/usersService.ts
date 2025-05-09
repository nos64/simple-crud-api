import { v4 as uuidv4 } from 'uuid';

import { type User } from 'user.types';

const users = new Map<string, User>();

export const getUsers = async (): Promise<User[]> => {
  return Array.from(users.values());
};

export const getUser = async (id: string): Promise<User | undefined> => {
  return users.get(id);
};

export const createUser = async (userData: Omit<User, 'id'>): Promise<User> => {
  const id = uuidv4();
  const newUser: User = { id, ...userData };
  users.set(id, newUser);

  return newUser;
};

export const updateUser = async (
  id: string,
  userData: Partial<User>,
): Promise<User | undefined> => {
  const user = users.get(id);
  if (!user) return undefined;

  const updatedUser = { ...user, ...userData, id };
  users.set(id, updatedUser);

  return updatedUser;
};

export const deleteUser = async (id: string): Promise<boolean> =>
  users.delete(id);
