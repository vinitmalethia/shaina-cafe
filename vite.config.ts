import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

type StoredOrder = {
  id: string;
  createdAt?: string;
  [key: string]: unknown;
};

const localOrders: StoredOrder[] = [];
const orderClients = new Set<{ write: (chunk: string) => void }>();

const sendJson = (res: any, statusCode: number, data: unknown) => {
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(data));
};

const readJsonBody = (req: any) => new Promise<any>((resolve, reject) => {
  let raw = '';

  req.on('data', (chunk: Buffer) => {
    raw += chunk.toString();
  });

  req.on('end', () => {
    try {
      resolve(raw ? JSON.parse(raw) : {});
    } catch (error) {
      reject(error);
    }
  });

  req.on('error', reject);
});

const broadcastOrders = () => {
  const payload = `data: ${JSON.stringify(localOrders)}\n\n`;
  orderClients.forEach(client => client.write(payload));
};

const getOrderIdFromUrl = (url = '') => {
  const match = url.match(/^\/api\/orders\/([^/?#]+)/);
  return match ? decodeURIComponent(match[1]) : null;
};

const localOrderApiPlugin = () => ({
  name: 'local-order-api',
  configureServer(server: any) {
    server.middlewares.use(async (req: any, res: any, next: any) => {
      const url = req.url?.split('?')[0];
      const orderId = getOrderIdFromUrl(url);

      if (url === '/api/orders' && req.method === 'GET') {
        sendJson(res, 200, localOrders);
        return;
      }

      if (url === '/api/orders/stream' && req.method === 'GET') {
        res.writeHead(200, {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          Connection: 'keep-alive'
        });
        res.write(`data: ${JSON.stringify(localOrders)}\n\n`);
        orderClients.add(res);
        req.on('close', () => orderClients.delete(res));
        return;
      }

      if (url === '/api/orders' && req.method === 'POST') {
        try {
          const body = await readJsonBody(req);
          const order = {
            ...body,
            id: body.id || `local-server-${Date.now()}`,
            createdAt: body.createdAt || new Date().toISOString()
          };

          localOrders.unshift(order);
          localOrders.sort((a, b) => new Date(String(b.createdAt || 0)).getTime() - new Date(String(a.createdAt || 0)).getTime());
          broadcastOrders();
          sendJson(res, 201, order);
        } catch (error) {
          sendJson(res, 400, { error: 'Invalid order payload' });
        }
        return;
      }

      if (orderId && req.method === 'PATCH') {
        try {
          const body = await readJsonBody(req);
          const orderIndex = localOrders.findIndex(order => order.id === orderId);

          if (orderIndex === -1) {
            sendJson(res, 404, { error: 'Order not found' });
            return;
          }

          localOrders[orderIndex] = {
            ...localOrders[orderIndex],
            ...body,
            id: orderId
          };
          broadcastOrders();
          sendJson(res, 200, localOrders[orderIndex]);
        } catch (error) {
          sendJson(res, 400, { error: 'Invalid order update payload' });
        }
        return;
      }

      next();
    });
  }
});

export default defineConfig({
  plugins: [localOrderApiPlugin(), react()],
  server: {
    host: true
  }
});
