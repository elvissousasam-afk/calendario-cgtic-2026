import type { VercelRequest, VercelResponse } from '@vercel/node';
import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import { appRouter } from '../server/routers-memory';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Configurar CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, trpc-batch-mode');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    // Converter VercelRequest para Request Web API
    const url = new URL(req.url || '', `https://${req.headers.host}`);
    
    const request = new Request(url.toString(), {
      method: req.method || 'GET',
      headers: new Headers(req.headers as any),
      body: req.method !== 'GET' && req.method !== 'HEAD' && req.body 
        ? JSON.stringify(req.body) 
        : undefined,
    });

    const response = await fetchRequestHandler({
      endpoint: '/api',
      req: request,
      router: appRouter,
      createContext: () => ({
        req: req as any,
        res: res as any,
        user: null,
      }),
    });

    // Copiar status e headers da resposta
    res.status(response.status);
    response.headers.forEach((value, key) => {
      res.setHeader(key, value);
    });
    
    // Enviar body
    const body = await response.text();
    res.send(body);
  } catch (error: any) {
    console.error('[API Error]', error);
    res.status(500).json({ 
      error: {
        message: error.message || 'Internal server error',
        code: 'INTERNAL_SERVER_ERROR'
      }
    });
  }
}
