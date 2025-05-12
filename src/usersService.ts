import { v4 as uuidv4 } from 'uuid';

import { getDB, updateDB } from './sharedDB';

import { type User } from './user.types';

export const getUsers = async (): Promise<User[]> => {
  return Array.from(getDB().values());
};

export const getUser = async (id: string): Promise<User | undefined> => {
  return getDB().get(id);
};

export const createUser = async (userData: Omit<User, 'id'>): Promise<User> => {
  const id = uuidv4();
  const newUser = { id, ...userData };
  updateDB(id, newUser);

  return newUser;
};

export const updateUser = async (
  id: string,
  userData: Partial<User>,
): Promise<User | undefined> => {
  const user = getDB().get(id);
  if (!user) return undefined;

  const updatedUser = { ...user, ...userData, id };
  updateDB(id, updatedUser);

  return updatedUser;
};

export const deleteUser = async (id: string): Promise<boolean> => {
  const exists = getDB().has(id);
  if (exists) {
    updateDB(id, null);
  }

  return exists;
};
