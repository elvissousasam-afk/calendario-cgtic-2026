import { describe, expect, it, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// Mock do banco de dados
vi.mock("./db", () => ({
  getEventos: vi.fn().mockResolvedValue([
    {
      id: 1,
      titulo: "Reunião de Planejamento",
      descricao: "Reunião mensal",
      dataEvento: new Date("2026-01-15"),
      horaInicio: "09:00",
      horaFim: "10:00",
      tipoEvento: "reuniao",
      cor: "#3B82F6",
      responsavelId: 1,
      responsavelNome: "João Silva",
      criadoPorId: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]),
  getEventoById: vi.fn().mockResolvedValue({
    id: 1,
    titulo: "Reunião de Planejamento",
    descricao: "Reunião mensal",
    dataEvento: new Date("2026-01-15"),
    horaInicio: "09:00",
    horaFim: "10:00",
    tipoEvento: "reuniao",
    cor: "#3B82F6",
    responsavelId: 1,
    responsavelNome: "João Silva",
    criadoPorId: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  }),
  createEvento: vi.fn().mockResolvedValue({
    id: 2,
    titulo: "Novo Evento",
    descricao: "Descrição do evento",
    dataEvento: new Date("2026-02-20"),
    horaInicio: "14:00",
    horaFim: "15:00",
    tipoEvento: "evento",
    cor: "#10B981",
    responsavelId: null,
    responsavelNome: null,
    criadoPorId: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  }),
  updateEvento: vi.fn().mockResolvedValue({
    id: 1,
    titulo: "Reunião Atualizada",
    descricao: "Descrição atualizada",
    dataEvento: new Date("2026-01-15"),
    horaInicio: "10:00",
    horaFim: "11:00",
    tipoEvento: "reuniao",
    cor: "#3B82F6",
    responsavelId: 1,
    responsavelNome: "João Silva",
    criadoPorId: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  }),
  deleteEvento: vi.fn().mockResolvedValue({ success: true }),
}));

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(): TrpcContext {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "test-user",
    email: "test@example.com",
    name: "Test User",
    loginMethod: "manus",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  return {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: vi.fn(),
    } as unknown as TrpcContext["res"],
  };
}

function createPublicContext(): TrpcContext {
  return {
    user: null,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: vi.fn(),
    } as unknown as TrpcContext["res"],
  };
}

describe("eventos router", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("eventos.list", () => {
    it("retorna lista de eventos sem autenticação", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.eventos.list({});

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
      expect(result[0]).toHaveProperty("titulo");
      expect(result[0]).toHaveProperty("dataEvento");
    });

    it("retorna eventos filtrados por ano e mês", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.eventos.list({ ano: 2026, mes: 1 });

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe("eventos.get", () => {
    it("retorna um evento específico por ID", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.eventos.get({ id: 1 });

      expect(result).toBeDefined();
      expect(result?.id).toBe(1);
      expect(result?.titulo).toBe("Reunião de Planejamento");
    });
  });

  describe("eventos.create", () => {
    it("cria um novo evento com autenticação", async () => {
      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.eventos.create({
        titulo: "Novo Evento",
        dataEvento: "2026-02-20",
        descricao: "Descrição do evento",
        horaInicio: "14:00",
        horaFim: "15:00",
        tipoEvento: "evento",
        cor: "#10B981",
      });

      expect(result).toBeDefined();
      expect(result?.titulo).toBe("Novo Evento");
    });

    it("falha ao criar evento sem autenticação", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      await expect(
        caller.eventos.create({
          titulo: "Novo Evento",
          dataEvento: "2026-02-20",
        })
      ).rejects.toThrow();
    });
  });

  describe("eventos.update", () => {
    it("atualiza um evento existente com autenticação", async () => {
      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.eventos.update({
        id: 1,
        titulo: "Reunião Atualizada",
        descricao: "Descrição atualizada",
      });

      expect(result).toBeDefined();
      expect(result?.titulo).toBe("Reunião Atualizada");
    });

    it("falha ao atualizar evento sem autenticação", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      await expect(
        caller.eventos.update({
          id: 1,
          titulo: "Tentativa de Atualização",
        })
      ).rejects.toThrow();
    });
  });

  describe("eventos.delete", () => {
    it("exclui um evento com autenticação", async () => {
      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.eventos.delete({ id: 1 });

      expect(result).toEqual({ success: true });
    });

    it("falha ao excluir evento sem autenticação", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      await expect(caller.eventos.delete({ id: 1 })).rejects.toThrow();
    });
  });
});
