import http from 'http';

import { PORT } from './config';
import { router } from './router';

const server = http.createServer((req, res) => {
  router(req, res);
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

const cleanup = () => {
  console.log('Server closed');

  server.close(() => {
    process.exit(0);
  });
};

process.on('SIGTERM', cleanup);
process.on('SIGINT', cleanup);

export { server };
