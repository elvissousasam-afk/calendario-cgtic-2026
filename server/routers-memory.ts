import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db-memory";

export const appRouter = router({
  system: systemRouter,
  
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  // ==================== EVENTOS ====================
  eventos: router({
    list: publicProcedure
      .input(z.object({
        ano: z.number().optional(),
        mes: z.number().optional(),
      }).optional())
      .query(async ({ input }) => {
        return await db.getEventos(input?.ano, input?.mes);
      }),

    get: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await db.getEventoById(input.id);
      }),

    create: publicProcedure
      .input(z.object({
        titulo: z.string().min(1),
        descricao: z.string().optional(),
        dataEvento: z.string(),
        horaInicio: z.string().optional(),
        horaFim: z.string().optional(),
        tipoEvento: z.enum(["reuniao", "prazo", "evento", "feriado", "aniversario", "outro"]).optional(),
        cor: z.string().optional(),
        responsavelId: z.number().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const evento = await db.createEvento({
          ...input,
          dataEvento: new Date(input.dataEvento),
          criadoPorId: ctx.user?.id || null,
        });
        return evento;
      }),

    update: publicProcedure
      .input(z.object({
        id: z.number(),
        titulo: z.string().min(1).optional(),
        descricao: z.string().optional(),
        dataEvento: z.string().optional(),
        horaInicio: z.string().optional(),
        horaFim: z.string().optional(),
        tipoEvento: z.enum(["reuniao", "prazo", "evento", "feriado", "aniversario", "outro"]).optional(),
        cor: z.string().optional(),
        responsavelId: z.number().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, dataEvento, ...rest } = input;
        const data: Record<string, unknown> = { ...rest };
        if (dataEvento) {
          data.dataEvento = new Date(dataEvento);
        }
        return await db.updateEvento(id, data);
      }),

    delete: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        return await db.deleteEvento(input.id);
      }),
  }),

  // ==================== RESPONSÁVEIS ====================
  responsaveis: router({
    list: publicProcedure
      .input(z.object({ apenasAtivos: z.boolean().optional() }).optional())
      .query(async ({ input }) => {
        return await db.getResponsaveis(input?.apenasAtivos ?? true);
      }),

    create: publicProcedure
      .input(z.object({
        nome: z.string().min(1),
        email: z.string().email().optional(),
        cargo: z.string().optional(),
        setor: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        return await db.createResponsavel(input);
      }),

    update: publicProcedure
      .input(z.object({
        id: z.number(),
        nome: z.string().min(1).optional(),
        email: z.string().email().optional(),
        cargo: z.string().optional(),
        setor: z.string().optional(),
        ativo: z.number().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        return await db.updateResponsavel(id, data);
      }),

    delete: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        return await db.deleteResponsavel(input.id);
      }),
  }),

  // ==================== ANIVERSÁRIOS ====================
  aniversarios: router({
    list: publicProcedure
      .input(z.object({ apenasAtivos: z.boolean().optional() }).optional())
      .query(async ({ input }) => {
        return await db.getAniversarios(input?.apenasAtivos ?? true);
      }),

    listByMonth: publicProcedure
      .input(z.object({ mes: z.number() }))
      .query(async ({ input }) => {
        return await db.getAniversariosDoMes(input.mes);
      }),

    create: publicProcedure
      .input(z.object({
        nome: z.string().min(1),
        dataNascimento: z.string(),
        setor: z.string().optional(),
        cargo: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        return await db.createAniversario({
          ...input,
          dataNascimento: new Date(input.dataNascimento),
        });
      }),

    update: publicProcedure
      .input(z.object({
        id: z.number(),
        nome: z.string().min(1).optional(),
        dataNascimento: z.string().optional(),
        setor: z.string().optional(),
        cargo: z.string().optional(),
        ativo: z.number().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, dataNascimento, ...rest } = input;
        const data: Record<string, unknown> = { ...rest };
        if (dataNascimento) {
          data.dataNascimento = new Date(dataNascimento);
        }
        return await db.updateAniversario(id, data);
      }),

    delete: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        return await db.deleteAniversario(input.id);
      }),
  }),

  // ==================== CONFIGURAÇÕES ====================
  configuracoes: router({
    getAll: publicProcedure.query(async () => {
      const configs = await db.getConfiguracoes();
      const result: Record<string, string> = {};
      configs.forEach(c => {
        result[c.chave] = c.valor;
      });
      return result;
    }),

    set: publicProcedure
      .input(z.object({
        chave: z.string(),
        valor: z.string(),
      }))
      .mutation(async ({ input }) => {
        return await db.setConfiguracao(input.chave, input.valor);
      }),

    setMultiple: publicProcedure
      .input(z.record(z.string()))
      .mutation(async ({ input }) => {
        return await db.setMultiplasConfiguracoes(input);
      }),
  }),

  // ==================== NOTIFICAÇÕES (STUB) ====================
  notificacoes: router({
    sendUpcoming: publicProcedure.mutation(async () => {
      return { success: true, message: "Notificações não disponíveis em modo offline" };
    }),
    sendBirthdays: publicProcedure.mutation(async () => {
      return { success: true, message: "Notificações não disponíveis em modo offline" };
    }),
    sendDailySummary: publicProcedure.mutation(async () => {
      return { success: true, message: "Notificações não disponíveis em modo offline" };
    }),
  }),
});

export type AppRouter = typeof appRouter;
