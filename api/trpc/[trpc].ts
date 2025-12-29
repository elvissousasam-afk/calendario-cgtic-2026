import type { VercelRequest, VercelResponse } from '@vercel/node';
import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import { appRouter } from '../../server/routers-memory';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Criar contexto mock (sem autenticação para simplificar)
  const createContext = () => ({
    req: req as any,
    res: res as any,
    user: null,
  });

  // Converter VercelRequest para Request padrão
  const url = new URL(req.url || '', `http://${req.headers.host}`);
  
  const request = new Request(url.toString(), {
    method: req.method,
    headers: req.headers as any,
    body: req.method !== 'GET' && req.method !== 'HEAD' ? JSON.stringify(req.body) : undefined,
  });

  const response = await fetchRequestHandler({
    endpoint: '/api/trpc',
    req: request,
    router: appRouter,
    createContext,
  });

  // Converter Response para VercelResponse
  res.status(response.status);
  response.headers.forEach((value, key) => {
    res.setHeader(key, value);
  });
  
  const body = await response.text();
  res.send(body);
}
