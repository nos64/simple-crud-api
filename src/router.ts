import { IncomingMessage, ServerResponse } from 'http';

import {
  handleGetUsers,
  handleGetUser,
  handleCreateUser,
  handleUpdateUser,
  handleDeleteUser,
} from './usersController';
import { getUrlParams, isHttpMethod } from './utils';

export const router = (request: IncomingMessage, response: ServerResponse) => {
  const method = request.method?.toUpperCase();

  if (!isHttpMethod(method)) {
    response.statusCode = 400;
    response.end('Invalid HTTP method');

    return;
  }

  if (!request.url) {
    response.statusCode = 400;
    response.end('URL is required');

    return;
  }

  const { path, id } = getUrlParams(request.url || '');

  switch (true) {
    case method === 'GET' && path === 'users' && !id:
      handleGetUsers(response);

      break;

    case method === 'GET' && path === 'users' && !!id:
      handleGetUser(response, id);

      break;

    case method === 'POST' && path === 'users':
      handleCreateUser(request, response);

      break;

    case method === 'PUT' && path === 'users' && !!id:
      handleUpdateUser(request, response, id);

      break;

    case method === 'DELETE' && path === 'users' && !!id:
      handleDeleteUser(response, id);

      break;

    default:
      response.statusCode = 404;
      response.setHeader('Content-Type', 'application/json');
      response.end(
        JSON.stringify({
          error: 'You are trying to make a request to a non-existent endpoints',
        }),
      );
  }
};
