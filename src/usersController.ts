import { ServerResponse, IncomingMessage } from 'http';
import { validate as validateId } from 'uuid';

import {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
} from './usersService';
import {
  sendResponse,
  responseServerError,
  responseInvalidUserIdError,
  responseUserNotFoundError,
  responseMissReqDataError,
  parseRequestData,
} from './utils';

export const handleGetUsers = async (res: ServerResponse): Promise<void> => {
  try {
    const users = await getUsers();
    sendResponse(res, 200, users);
  } catch (error) {
    responseServerError(res);
  }
};

export const handleGetUser = async (
  res: ServerResponse,
  userId: string,
): Promise<void> => {
  if (!validateId(userId)) {
    return responseInvalidUserIdError(res);
  }

  try {
    const user = await getUser(userId);
    if (!user) {
      return responseUserNotFoundError(res);
    }
    sendResponse(res, 200, user);
  } catch (error) {
    responseServerError(res);
  }
};

export const handleCreateUser = async (
  req: IncomingMessage,
  res: ServerResponse,
): Promise<void> => {
  try {
    const body = await parseRequestData(req);
    const { username, age, hobbies } = body;

    if (!username || !age || !hobbies) {
      return responseMissReqDataError(res);
    }

    const newUser = await createUser({ username, age, hobbies });
    sendResponse(res, 201, newUser);
  } catch (error) {
    responseServerError(res);
  }
};

export const handleUpdateUser = async (
  req: IncomingMessage,
  res: ServerResponse,
  userId: string,
): Promise<void> => {
  if (!validateId(userId)) {
    return responseInvalidUserIdError(res);
  }

  try {
    const body = await parseRequestData(req);
    const { username, age, hobbies } = body;

    const updatedUser = await updateUser(userId, {
      ...(username && { username }),
      ...(age && { age }),
      ...(hobbies && { hobbies }),
    });
    if (!updatedUser) {
      return responseUserNotFoundError(res);
    }
    sendResponse(res, 200, updatedUser);
  } catch (error) {
    responseServerError(res);
  }
};

export const handleDeleteUser = async (
  res: ServerResponse,
  userId: string,
): Promise<void> => {
  if (!validateId(userId)) {
    return responseInvalidUserIdError(res);
  }

  try {
    const deleted = await deleteUser(userId);
    if (!deleted) {
      return responseUserNotFoundError(res);
    }
    sendResponse(res, 204);
  } catch (error) {
    responseServerError(res);
  }
};
