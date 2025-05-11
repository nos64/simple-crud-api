import http from 'http';

import { PORT } from './config';
import { router } from './router';

const server = http.createServer((req, res) => {
  router(req, res);
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export { server };
