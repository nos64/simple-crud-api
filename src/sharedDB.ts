import { type User } from './user.types';

let sharedDB = new Map<string, User>();
const pendingUpdates: Array<[string, User | null]> = [];

export const isMultiMode = process.env.MULTI === 'true';

export const initDB = (initialData?: string) => {
  if (initialData) {
    sharedDB = new Map(JSON.parse(initialData));

    if (isMultiMode && process.send) {
      process.send({
        type: 'db_snapshot',
        data: initialData,
      });
    }
  }

  if (!isMultiMode) return;

  process.on('message', (msg: unknown) => {
    if (typeof msg === 'object' && msg !== null && 'type' in msg) {
      const message = msg as {
        type: string;
        updates?: Array<[string, User | null]>;
      };
      if (message.type === 'db_update' && message.updates) {
        message.updates.forEach(([key, value]) => {
          if (value === null) {
            sharedDB.delete(key);
          } else {
            sharedDB.set(key, value);
          }
        });
      }
    }
  });
};

export const getDB = () => sharedDB;

export const updateDB = (key: string, value: User | null) => {
  pendingUpdates.push([key, value]);
  if (value === null) {
    sharedDB.delete(key);
  } else {
    sharedDB.set(key, value);
  }

  if (isMultiMode && process.send) {
    try {
      process.send({
        type: 'db_update',
        updates: [[key, value]],
      });
    } catch (err) {
      console.error('DB sync error:', err);
    }
  }
};
