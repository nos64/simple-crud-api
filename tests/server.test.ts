import http from 'http';
import { v4 as uuidv4 } from 'uuid';

import { server } from '../src/server';
import * as usersService from '../src/usersService';

import { type User } from '../src/user.types';
import { type Error } from '../src/utils';

const PORT = process.env.PORT || 4000;
const API_URL = `http://localhost:${PORT}/api/users`;

type ApiResponse<T = User> = {
  status: number;
  body?: T | Error;
};

const makeRequest = <T = User>(
  method: string,
  url: string,
  data?: Partial<User>,
): Promise<ApiResponse<T>> => {
  return new Promise((resolve) => {
    const req = http.request(`${API_URL}${url}`, { method }, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        try {
          resolve({
            status: res.statusCode || 500,
            body: body ? JSON.parse(body) : undefined,
          });
        } catch (e) {
          resolve({
            status: 500,
            body: { error: 'Server error' },
          });
        }
      });
    });

    req.on('error', (err) => {
      resolve({
        status: 500,
        body: { error: err.message },
      });
    });

    if (data) {
      req.setHeader('Content-Type', 'application/json');
      req.write(JSON.stringify(data));
    }
    req.end();
  });
};

const isUser = (obj: User | Error | undefined): obj is User => {
  return obj !== undefined && 'id' in obj && typeof obj.id === 'string';
};

const isError = (obj: User | Error | undefined): obj is Error => {
  return obj !== undefined && 'error' in obj && typeof obj.error === 'string';
};

describe('Simple CRUD API', () => {
  let createdUserId: string;

  const invalidUserId = uuidv4();

  const newUser = {
    username: 'testUser',
    age: 20,
    hobbies: ['reading'],
  };

  beforeAll(() => {
    if (!server.listening) {
      server.listen(PORT);
    }
  });

  afterAll(() => {
    if (server.listening) {
      server.close();
    }
  });

  test('GET /api/users should return empty array initially', async () => {
    const { status, body } = await makeRequest<User[]>('GET', '');

    expect(status).toBe(200);
    expect(body).toEqual([]);
  });

  test('POST /api/users should create a new user', async () => {
    const { status, body } = await makeRequest('POST', '', newUser);

    expect(status).toBe(201);

    if (!isUser(body)) {
      throw new Error('Expected User but got error');
    }

    expect(body).toEqual({
      id: body.id,
      ...newUser,
    });

    createdUserId = body.id;
  });

  test('POST /api/users should return status code 400 if request body does not contain required fields', async () => {
    const { status, body } = await makeRequest('POST', '', {
      username: 'testUser',
    });

    expect(status).toBe(400);

    expect(isError(body)).toBeTruthy();

    if (isError(body)) {
      expect(body?.error).toEqual('Missing required fields');
    }
  });

  test('GET /api/users/{id} should return the created user', async () => {
    const { status, body } = await makeRequest('GET', `/${createdUserId}`);

    expect(status).toBe(200);

    if (!isUser(body)) {
      throw new Error('Expected User but got error');
    }

    expect(body.id).toBe(createdUserId);

    expect(body).toEqual({
      id: body.id,
      ...newUser,
    });
  });

  test('GET /api/users/{id} should return status code 400 if userId is invalid (not uuid)', async () => {
    const { status, body } = await makeRequest('GET', '/123');

    expect(status).toBe(400);

    expect(isError(body)).toBeTruthy();

    if (isError(body)) {
      expect(body?.error).toEqual('Invalid user ID format');
    }
  });

  test("GET /api/users/{id} should return status code 404 if record with id === userId doesn't exist", async () => {
    const { status, body } = await makeRequest('GET', `/${invalidUserId}`);

    expect(status).toBe(404);

    expect(isError(body)).toBeTruthy();

    if (isError(body)) {
      expect(body?.error).toEqual('User not found');
    }
  });

  test('PUT /api/users/{id} should update the user', async () => {
    const updatedUser = {
      username: 'updatedUser',
      age: 26,
      hobbies: ['running'],
    };

    const { status, body } = await makeRequest(
      'PUT',
      `/${createdUserId}`,
      updatedUser,
    );

    expect(status).toBe(200);

    if (!isUser(body)) {
      throw new Error('Expected User but got error');
    }

    expect(body).toEqual({
      id: body.id,
      ...updatedUser,
    });

    expect(body.id).toBe(createdUserId);
  });

  test('PUT /api/users/{id} should update the user (partial change of parameters)', async () => {
    const updatedUser = {
      age: 50,
    };

    const { status, body } = await makeRequest(
      'PUT',
      `/${createdUserId}`,
      updatedUser,
    );
    expect(status).toBe(200);

    if (!isUser(body)) {
      throw new Error('Expected User but got error');
    }

    expect(body).toMatchObject({
      id: body.id,
      ...updatedUser,
    });

    expect(body.id).toBe(createdUserId);
  });

  test('PUT /api/users/{id} should return status code 400 if userId is invalid (not uuid)', async () => {
    const { status, body } = await makeRequest('PUT', '/123');

    expect(status).toBe(400);

    expect(isError(body)).toBeTruthy();

    if (isError(body)) {
      expect(body?.error).toEqual('Invalid user ID format');
    }
  });

  test("PUT /api/users/{id} should return status code 404 if record with id === userId doesn't exist", async () => {
    const { status, body } = await makeRequest('PUT', `/${invalidUserId}`);

    expect(status).toBe(404);

    expect(isError(body)).toBeTruthy();

    if (isError(body)) {
      expect(body?.error).toEqual('User not found');
    }
  });

  test('DELETE /api/users/{id} should delete the user', async () => {
    const { status } = await makeRequest('DELETE', `/${createdUserId}`);

    expect(status).toBe(204);
  });

  test('DELETE /api/users/{id} should return status code 400 if userId is invalid (not uuid)', async () => {
    const { status, body } = await makeRequest('DELETE', '/123');

    expect(status).toBe(400);

    expect(isError(body)).toBeTruthy();

    if (isError(body)) {
      expect(body?.error).toEqual('Invalid user ID format');
    }
  });

  test("DELETE /api/users/{id} should return status code 404 if record with id === userId doesn't exist", async () => {
    const { status, body } = await makeRequest('DELETE', `/${invalidUserId}`);

    expect(status).toBe(404);

    expect(isError(body)).toBeTruthy();

    if (isError(body)) {
      expect(body?.error).toEqual('User not found');
    }
  });

  test('GET /api/users/{id} should return 404 after deletion', async () => {
    const { status, body } = await makeRequest('GET', `/${createdUserId}`);

    expect(status).toBe(404);

    expect(isError(body)).toBeTruthy();

    if (isError(body)) {
      expect(body?.error).toEqual('User not found');
    }
  });

  describe('Server side error handling', () => {
    let createUserSpy: jest.SpyInstance;

    beforeEach(() => {
      createUserSpy = jest
        .spyOn(usersService, 'createUser')
        .mockImplementation(usersService.createUser);
    });

    afterEach(() => {
      createUserSpy.mockRestore();
    });

    test('POST /api/users should return 500 when create fails', async () => {
      createUserSpy.mockRejectedValueOnce(new Error('Server error'));

      const { status, body } = await makeRequest('POST', '', newUser);

      expect(status).toBe(500);

      if (!isUser(body)) {
        expect(body?.error).toEqual('Server error');
      }
    });
  });
});
