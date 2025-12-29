import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, date, time } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Responsáveis - pessoas que podem ser atribuídas a eventos
 */
export const responsaveis = mysqlTable("responsaveis", {
  id: int("id").autoincrement().primaryKey(),
  nome: varchar("nome", { length: 255 }).notNull(),
  email: varchar("email", { length: 320 }),
  cargo: varchar("cargo", { length: 255 }),
  setor: varchar("setor", { length: 255 }),
  ativo: int("ativo").default(1).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Responsavel = typeof responsaveis.$inferSelect;
export type InsertResponsavel = typeof responsaveis.$inferInsert;

/**
 * Eventos do calendário
 */
export const eventos = mysqlTable("eventos", {
  id: int("id").autoincrement().primaryKey(),
  titulo: varchar("titulo", { length: 500 }).notNull(),
  descricao: text("descricao"),
  dataEvento: date("dataEvento").notNull(),
  horaInicio: time("horaInicio"),
  horaFim: time("horaFim"),
  tipoEvento: mysqlEnum("tipoEvento", [
    "reuniao",
    "prazo",
    "evento",
    "feriado",
    "aniversario",
    "outro"
  ]).default("evento").notNull(),
  cor: varchar("cor", { length: 7 }).default("#3B82F6"),
  responsavelId: int("responsavelId").references(() => responsaveis.id),
  criadoPorId: int("criadoPorId").references(() => users.id),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Evento = typeof eventos.$inferSelect;
export type InsertEvento = typeof eventos.$inferInsert;

/**
 * Aniversários
 */
export const aniversarios = mysqlTable("aniversarios", {
  id: int("id").autoincrement().primaryKey(),
  nome: varchar("nome", { length: 255 }).notNull(),
  dataNascimento: date("dataNascimento").notNull(),
  setor: varchar("setor", { length: 255 }),
  cargo: varchar("cargo", { length: 255 }),
  ativo: int("ativo").default(1).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Aniversario = typeof aniversarios.$inferSelect;
export type InsertAniversario = typeof aniversarios.$inferInsert;

/**
 * Configurações do sistema
 */
export const configuracoes = mysqlTable("configuracoes", {
  id: int("id").autoincrement().primaryKey(),
  chave: varchar("chave", { length: 100 }).notNull().unique(),
  valor: text("valor"),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Configuracao = typeof configuracoes.$inferSelect;
export type InsertConfiguracao = typeof configuracoes.$inferInsert;
