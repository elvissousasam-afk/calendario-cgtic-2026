import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createHTTPHandler } from '@trpc/server/adapters/standalone';
import { appRouter } from '../server/routers-memory';

const handler = createHTTPHandler({
  router: appRouter,
  createContext: () => ({
    req: null as any,
    res: null as any,
    user: null,
  }),
});

export default async function (req: VercelRequest, res: VercelResponse) {
  // Configurar CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Converter VercelRequest para formato esperado pelo tRPC
  const url = new URL(req.url || '', `https://${req.headers.host}`);
  
  const request = new Request(url.toString(), {
    method: req.method || 'GET',
    headers: req.headers as any,
    body: req.method !== 'GET' && req.method !== 'HEAD' ? JSON.stringify(req.body) : undefined,
  });

  try {
    const response = await handler(request);
    
    res.status(response.status);
    response.headers.forEach((value, key) => {
      res.setHeader(key, value);
    });
    
    const body = await response.text();
    res.send(body);
  } catch (error: any) {
    console.error('[API Error]', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
}
