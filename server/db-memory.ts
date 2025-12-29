// Armazenamento em memória para quando não há banco de dados
// Os dados serão perdidos quando o servidor reiniciar, mas funciona para demonstração

interface Evento {
  id: number;
  titulo: string;
  descricao: string | null;
  dataEvento: Date;
  horaInicio: string | null;
  horaFim: string | null;
  tipoEvento: string;
  cor: string | null;
  responsavelId: number | null;
  responsavelNome?: string | null;
  criadoPorId: number | null;
  createdAt?: Date;
  updatedAt?: Date;
}

interface Responsavel {
  id: number;
  nome: string;
  email: string | null;
  cargo: string | null;
  setor: string | null;
  ativo: number;
}

interface Aniversario {
  id: number;
  nome: string;
  dataNascimento: Date;
  setor: string | null;
  cargo: string | null;
  ativo: number;
}

// Dados em memória
let eventos: Evento[] = [
  {
    id: 1,
    titulo: "Revisão de Contratos de TI",
    descricao: null,
    dataEvento: new Date("2026-01-20T14:00:00"),
    horaInicio: "14:00",
    horaFim: "17:00",
    tipoEvento: "prazo",
    cor: null,
    responsavelId: null,
    responsavelNome: "Paloma",
    criadoPorId: null,
  },
  {
    id: 2,
    titulo: "Encontro da equipe",
    descricao: null,
    dataEvento: new Date("2026-02-03T11:13:00"),
    horaInicio: "11:13",
    horaFim: "12:16",
    tipoEvento: "reuniao",
    cor: null,
    responsavelId: null,
    responsavelNome: "SMIT/CGTIC/CA",
    criadoPorId: null,
  },
  {
    id: 3,
    titulo: "Treinamento de Segurança da Informação",
    descricao: null,
    dataEvento: new Date("2026-02-10T09:00:00"),
    horaInicio: "09:00",
    horaFim: "18:00",
    tipoEvento: "prazo",
    cor: null,
    responsavelId: null,
    responsavelNome: "Dennis",
    criadoPorId: null,
  },
  {
    id: 4,
    titulo: "Reunião Mensal",
    descricao: null,
    dataEvento: new Date("2026-02-25T08:00:00"),
    horaInicio: "08:00",
    horaFim: "09:00",
    tipoEvento: "reuniao",
    cor: null,
    responsavelId: null,
    responsavelNome: "Paloma",
    criadoPorId: null,
  },
  {
    id: 5,
    titulo: "Atualização de Infraestrutura",
    descricao: null,
    dataEvento: new Date("2026-03-05T08:00:00"),
    horaInicio: "08:00",
    horaFim: "18:00",
    tipoEvento: "evento",
    cor: null,
    responsavelId: null,
    responsavelNome: "André",
    criadoPorId: null,
  },
  {
    id: 6,
    titulo: "Workshop de Inovação",
    descricao: null,
    dataEvento: new Date("2026-04-12T09:00:00"),
    horaInicio: "09:00",
    horaFim: "17:00",
    tipoEvento: "reuniao",
    cor: null,
    responsavelId: null,
    responsavelNome: "Felipe Ferrari",
    criadoPorId: null,
  },
  {
    id: 7,
    titulo: "Auditoria de Sistemas",
    descricao: null,
    dataEvento: new Date("2026-05-08T09:00:00"),
    horaInicio: "09:00",
    horaFim: "18:00",
    tipoEvento: "prazo",
    cor: null,
    responsavelId: null,
    responsavelNome: "Alexander",
    criadoPorId: null,
  },
  {
    id: 8,
    titulo: "Reunião Semestral CGTIC",
    descricao: null,
    dataEvento: new Date("2026-06-15T09:00:00"),
    horaInicio: "09:00",
    horaFim: "12:00",
    tipoEvento: "reuniao",
    cor: null,
    responsavelId: null,
    responsavelNome: "Noguchi",
    criadoPorId: null,
  },
  {
    id: 9,
    titulo: "Implementação de Novos Sistemas",
    descricao: null,
    dataEvento: new Date("2026-07-20T08:00:00"),
    horaInicio: "08:00",
    horaFim: "18:00",
    tipoEvento: "evento",
    cor: null,
    responsavelId: null,
    responsavelNome: "Felipe Camodeca",
    criadoPorId: null,
  },
  {
    id: 10,
    titulo: "Avaliação de Performance",
    descricao: null,
    dataEvento: new Date("2026-08-10T09:00:00"),
    horaInicio: "09:00",
    horaFim: "17:00",
    tipoEvento: "reuniao",
    cor: null,
    responsavelId: null,
    responsavelNome: "Paloma",
    criadoPorId: null,
  },
  {
    id: 11,
    titulo: "Semana de Tecnologia",
    descricao: null,
    dataEvento: new Date("2026-09-18T08:00:00"),
    horaInicio: "08:00",
    horaFim: "14:00",
    tipoEvento: "evento",
    cor: null,
    responsavelId: null,
    responsavelNome: "Felipe Ferrari",
    criadoPorId: null,
  },
  {
    id: 12,
    titulo: "Backup e Recuperação - Testes",
    descricao: null,
    dataEvento: new Date("2026-10-12T08:00:00"),
    horaInicio: "08:00",
    horaFim: "18:00",
    tipoEvento: "evento",
    cor: null,
    responsavelId: null,
    responsavelNome: "André",
    criadoPorId: null,
  },
  {
    id: 13,
    titulo: "Planejamento Orçamentário 2027",
    descricao: null,
    dataEvento: new Date("2026-11-20T09:00:00"),
    horaInicio: "09:00",
    horaFim: "17:00",
    tipoEvento: "reuniao",
    cor: null,
    responsavelId: null,
    responsavelNome: "Paloma",
    criadoPorId: null,
  },
  {
    id: 14,
    titulo: "Encerramento e Balanço Anual",
    descricao: null,
    dataEvento: new Date("2026-12-15T09:00:00"),
    horaInicio: "09:00",
    horaFim: "12:00",
    tipoEvento: "reuniao",
    cor: null,
    responsavelId: null,
    responsavelNome: "Noguchi",
    criadoPorId: null,
  },
];

let responsaveis: Responsavel[] = [];
let aniversarios: Aniversario[] = [];

let nextEventoId = 15;
let nextResponsavelId = 1;
let nextAniversarioId = 1;

// ==================== EVENTOS ====================

export async function getEventos(ano?: number, mes?: number) {
  let filtered = [...eventos];
  
  if (ano && mes) {
    filtered = filtered.filter(e => {
      const data = e.dataEvento;
      return data.getFullYear() === ano && data.getMonth() + 1 === mes;
    });
  }
  
  return filtered;
}

export async function getEventoById(id: number) {
  return eventos.find(e => e.id === id) || null;
}

export async function createEvento(evento: any) {
  const newEvento: Evento = {
    id: nextEventoId++,
    titulo: evento.titulo,
    descricao: evento.descricao || null,
    dataEvento: new Date(evento.dataEvento),
    horaInicio: evento.horaInicio || null,
    horaFim: evento.horaFim || null,
    tipoEvento: evento.tipoEvento || "evento",
    cor: evento.cor || null,
    responsavelId: evento.responsavelId || null,
    responsavelNome: null,
    criadoPorId: evento.criadoPorId || null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  
  eventos.push(newEvento);
  return newEvento;
}

export async function updateEvento(id: number, data: any) {
  const index = eventos.findIndex(e => e.id === id);
  if (index === -1) return null;
  
  eventos[index] = {
    ...eventos[index],
    ...data,
    updatedAt: new Date(),
  };
  
  return eventos[index];
}

export async function deleteEvento(id: number) {
  const index = eventos.findIndex(e => e.id === id);
  if (index === -1) return { success: false };
  
  eventos.splice(index, 1);
  return { success: true };
}

// ==================== RESPONSÁVEIS ====================

export async function getResponsaveis(apenasAtivos = true) {
  if (apenasAtivos) {
    return responsaveis.filter(r => r.ativo === 1);
  }
  return responsaveis;
}

export async function createResponsavel(data: any) {
  const newResponsavel: Responsavel = {
    id: nextResponsavelId++,
    nome: data.nome,
    email: data.email || null,
    cargo: data.cargo || null,
    setor: data.setor || null,
    ativo: 1,
  };
  
  responsaveis.push(newResponsavel);
  return newResponsavel;
}

export async function updateResponsavel(id: number, data: any) {
  const index = responsaveis.findIndex(r => r.id === id);
  if (index === -1) return null;
  
  responsaveis[index] = {
    ...responsaveis[index],
    ...data,
  };
  
  return responsaveis[index];
}

export async function deleteResponsavel(id: number) {
  const index = responsaveis.findIndex(r => r.id === id);
  if (index === -1) return { success: false };
  
  responsaveis.splice(index, 1);
  return { success: true };
}

// ==================== ANIVERSÁRIOS ====================

export async function getAniversarios(apenasAtivos = true) {
  if (apenasAtivos) {
    return aniversarios.filter(a => a.ativo === 1);
  }
  return aniversarios;
}

export async function getAniversariosDoMes(mes: number) {
  return aniversarios.filter(a => {
    const data = a.dataNascimento;
    return data.getMonth() + 1 === mes;
  });
}

export async function createAniversario(data: any) {
  const newAniversario: Aniversario = {
    id: nextAniversarioId++,
    nome: data.nome,
    dataNascimento: new Date(data.dataNascimento),
    setor: data.setor || null,
    cargo: data.cargo || null,
    ativo: 1,
  };
  
  aniversarios.push(newAniversario);
  return newAniversario;
}

export async function updateAniversario(id: number, data: any) {
  const index = aniversarios.findIndex(a => a.id === id);
  if (index === -1) return null;
  
  aniversarios[index] = {
    ...aniversarios[index],
    ...data,
  };
  
  return aniversarios[index];
}

export async function deleteAniversario(id: number) {
  const index = aniversarios.findIndex(a => a.id === id);
  if (index === -1) return { success: false };
  
  aniversarios.splice(index, 1);
  return { success: true };
}

// ==================== CONFIGURAÇÕES ====================

const configuracoes: Record<string, string> = {
  titulo: "Calendário Gerencial CGTIC - 2026",
  subtitulo: "Controle de Eventos, Prazos e Responsáveis",
  rodape: "",
};

export async function getConfiguracoes() {
  return Object.entries(configuracoes).map(([chave, valor]) => ({
    chave,
    valor,
  }));
}

export async function setConfiguracao(chave: string, valor: string) {
  configuracoes[chave] = valor;
  return { chave, valor };
}

export async function setMultiplasConfiguracoes(configs: Record<string, string>) {
  Object.assign(configuracoes, configs);
  return { success: true };
}

// Funções stub para compatibilidade
export async function upsertUser() {}
export async function getUserByOpenId() { return undefined; }
