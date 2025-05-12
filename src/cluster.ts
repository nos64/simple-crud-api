import cluster from 'cluster';
import os from 'os';
import { createServer, IncomingMessage, ServerResponse } from 'http';

import { PORT } from './config';
import { router } from './router';
import { initDB } from './sharedDB';

const numCPUs = os.cpus().length;

if (cluster.isPrimary) {
  console.log(`Master ${process.pid} is running`);

  // Start balancer
  const loadBalancer = createServer((req, res) => {
    const workerPort = PORT + (cluster.worker?.id || 1);
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const proxy = require('http').request(
      {
        hostname: 'localhost',
        port: workerPort,
        path: req.url,
        method: req.method,
        headers: req.headers,
      },
      (workerRes: {
        statusCode: number;
        headers: string | undefined;
        pipe: (
          arg0: ServerResponse<IncomingMessage> & { req: IncomingMessage },
        ) => void;
      }) => {
        res.writeHead(workerRes.statusCode || 500, workerRes.headers);
        workerRes.pipe(res);
      },
    );

    proxy.on('error', (err: NodeJS.ErrnoException) => {
      console.error('Proxy error:', err);
      res.writeHead(502);
      res.end('Bad Gateway');
    });

    req.pipe(proxy);
  });

  loadBalancer.listen(PORT, () => {
    console.log(`Load balancer running on port ${PORT}`);
  });

  // Start workers
  for (let i = 1; i <= numCPUs; i++) {
    const workerPort = PORT + i;
    cluster.fork({ WORKER_PORT: workerPort });
  }

  // Update DB
  cluster.on('message', (worker, msg) => {
    if (msg.type === 'db_update') {
      for (const id in cluster.workers) {
        if (id !== worker.id.toString()) {
          cluster.workers[id]?.send(msg);
        }
      }
    }
  });

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  cluster.on('exit', (worker, _code, _signal) => {
    console.log(`Worker ${worker.process.pid} died. Restarting...`);
    cluster.fork();
  });
} else {
  const workerPort = parseInt(process.env.WORKER_PORT || `${PORT + 1}`);

  initDB();

  const server = createServer((req, res) => {
    router(req, res);
  });

  server.listen(workerPort, () => {
    console.log(`Worker ${process.pid} listening on port ${workerPort}`);
  });

  server.on('error', (err: NodeJS.ErrnoException) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`Port ${workerPort} already in use`);
      process.exit(1);
    }
  });
}
