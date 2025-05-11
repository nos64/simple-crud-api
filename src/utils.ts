import { ServerResponse, IncomingMessage } from 'http';

import { type User } from './user.types';

export interface Error {
  error: string;
}

export const sendResponse = (
  res: ServerResponse,
  statusCode: number,
  data?: User | User[] | Error,
): void => {
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json');
  if (data) {
    res.end(JSON.stringify(data));
  } else {
    res.end();
  }
};

export const responseInvalidUserIdError = (res: ServerResponse) =>
  sendResponse(res, 400, { error: 'Invalid user ID format' });

export const responseUserNotFoundError = (res: ServerResponse) =>
  sendResponse(res, 404, { error: 'User not found' });

export const responseMissReqDataError = (res: ServerResponse) =>
  sendResponse(res, 400, { error: 'Missing required fields' });

export const responseServerError = (res: ServerResponse) =>
  sendResponse(res, 500, { error: 'Server error' });

export const parseRequestData = async (
  req: IncomingMessage,
): Promise<Partial<User>> => {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk.toString();
    });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (error) {
        reject(new Error('Invalid JSON'));
      }
    });
    req.on('error', reject);
  });
};

export function getUrlParams(url: string): { path: string; id?: string } {
  const parts = url.split('/').filter((part) => part);

  if (parts.length === 2 && parts[0] === 'api' && parts[1] === 'users') {
    return { path: 'users' };
  }

  if (parts.length === 3 && parts[0] === 'api' && parts[1] === 'users') {
    return { path: 'users', id: parts[2] };
  }

  return { path: 'notFound' };
}

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

export const isHttpMethod = (
  method: string | undefined,
): method is HttpMethod => {
  return ['GET', 'POST', 'PUT', 'DELETE'].includes(method || '');
};
