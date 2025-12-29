import { eq, and, gte, lte, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { 
  InsertUser, users, 
  eventos, InsertEvento, Evento,
  responsaveis, InsertResponsavel, Responsavel,
  aniversarios, InsertAniversario, Aniversario,
  configuracoes
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ==================== USERS ====================

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// ==================== EVENTOS ====================

export async function getEventos(ano?: number, mes?: number) {
  const db = await getDb();
  if (!db) return [];

  let query = db.select({
    id: eventos.id,
    titulo: eventos.titulo,
    descricao: eventos.descricao,
    dataEvento: eventos.dataEvento,
    horaInicio: eventos.horaInicio,
    horaFim: eventos.horaFim,
    tipoEvento: eventos.tipoEvento,
    cor: eventos.cor,
    responsavelId: eventos.responsavelId,
    responsavelNome: responsaveis.nome,
    criadoPorId: eventos.criadoPorId,
    createdAt: eventos.createdAt,
    updatedAt: eventos.updatedAt,
  })
  .from(eventos)
  .leftJoin(responsaveis, eq(eventos.responsavelId, responsaveis.id));

  if (ano && mes) {
    const startDate = new Date(`${ano}-${String(mes).padStart(2, '0')}-01`);
    const lastDay = new Date(ano, mes, 0).getDate();
    const endDate = new Date(`${ano}-${String(mes).padStart(2, '0')}-${lastDay}`);
    return await query.where(
      and(
        gte(eventos.dataEvento, startDate),
        lte(eventos.dataEvento, endDate)
      )
    );
  }

  return await query;
}

export async function getEventoById(id: number) {
  const db = await getDb();
  if (!db) return null;

  const result = await db.select({
    id: eventos.id,
    titulo: eventos.titulo,
    descricao: eventos.descricao,
    dataEvento: eventos.dataEvento,
    horaInicio: eventos.horaInicio,
    horaFim: eventos.horaFim,
    tipoEvento: eventos.tipoEvento,
    cor: eventos.cor,
    responsavelId: eventos.responsavelId,
    responsavelNome: responsaveis.nome,
    criadoPorId: eventos.criadoPorId,
    createdAt: eventos.createdAt,
    updatedAt: eventos.updatedAt,
  })
  .from(eventos)
  .leftJoin(responsaveis, eq(eventos.responsavelId, responsaveis.id))
  .where(eq(eventos.id, id))
  .limit(1);

  return result.length > 0 ? result[0] : null;
}

export async function createEvento(evento: InsertEvento) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(eventos).values(evento);
  const insertId = result[0].insertId;
  return await getEventoById(insertId);
}

export async function updateEvento(id: number, evento: Partial<InsertEvento>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(eventos).set(evento).where(eq(eventos.id, id));
  return await getEventoById(id);
}

export async function deleteEvento(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.delete(eventos).where(eq(eventos.id, id));
  return { success: true };
}

// ==================== RESPONSÁVEIS ====================

export async function getResponsaveis(apenasAtivos = true) {
  const db = await getDb();
  if (!db) return [];

  if (apenasAtivos) {
    return await db.select().from(responsaveis).where(eq(responsaveis.ativo, 1));
  }
  return await db.select().from(responsaveis);
}

export async function createResponsavel(responsavel: InsertResponsavel) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(responsaveis).values(responsavel);
  const insertId = result[0].insertId;
  const created = await db.select().from(responsaveis).where(eq(responsaveis.id, insertId)).limit(1);
  return created[0];
}

export async function updateResponsavel(id: number, responsavel: Partial<InsertResponsavel>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(responsaveis).set(responsavel).where(eq(responsaveis.id, id));
  const updated = await db.select().from(responsaveis).where(eq(responsaveis.id, id)).limit(1);
  return updated[0];
}

export async function deleteResponsavel(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(responsaveis).set({ ativo: 0 }).where(eq(responsaveis.id, id));
  return { success: true };
}

// ==================== ANIVERSÁRIOS ====================

export async function getAniversarios(apenasAtivos = true) {
  const db = await getDb();
  if (!db) return [];

  if (apenasAtivos) {
    return await db.select().from(aniversarios).where(eq(aniversarios.ativo, 1));
  }
  return await db.select().from(aniversarios);
}

export async function getAniversariosDoMes(mes: number) {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(aniversarios).where(
    and(
      eq(aniversarios.ativo, 1),
      sql`MONTH(${aniversarios.dataNascimento}) = ${mes}`
    )
  );
}

export async function createAniversario(aniversario: InsertAniversario) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(aniversarios).values(aniversario);
  const insertId = result[0].insertId;
  const created = await db.select().from(aniversarios).where(eq(aniversarios.id, insertId)).limit(1);
  return created[0];
}

export async function updateAniversario(id: number, aniversario: Partial<InsertAniversario>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(aniversarios).set(aniversario).where(eq(aniversarios.id, id));
  const updated = await db.select().from(aniversarios).where(eq(aniversarios.id, id)).limit(1);
  return updated[0];
}

export async function deleteAniversario(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(aniversarios).set({ ativo: 0 }).where(eq(aniversarios.id, id));
  return { success: true };
}

// ==================== CONFIGURAÇÕES ====================

export async function getConfiguracao(chave: string) {
  const db = await getDb();
  if (!db) return null;

  const result = await db.select().from(configuracoes).where(eq(configuracoes.chave, chave)).limit(1);
  return result.length > 0 ? result[0].valor : null;
}

export async function setConfiguracao(chave: string, valor: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.insert(configuracoes).values({ chave, valor }).onDuplicateKeyUpdate({
    set: { valor }
  });
  return { success: true };
}

export async function getAllConfiguracoes() {
  const db = await getDb();
  if (!db) return {};

  const result = await db.select().from(configuracoes);
  const config: Record<string, string> = {};
  result.forEach(c => {
    if (c.valor) config[c.chave] = c.valor;
  });
  return config;
}

export async function setMultipleConfiguracoes(configs: Record<string, string>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  for (const [chave, valor] of Object.entries(configs)) {
    await db.insert(configuracoes).values({ chave, valor }).onDuplicateKeyUpdate({
      set: { valor }
    });
  }
  return { success: true };
}
