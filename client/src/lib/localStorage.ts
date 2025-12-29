// LocalStorage Manager para calendário offline
export interface Evento {
  id: number;
  titulo: string;
  descricao?: string;
  dataInicio: string;
  dataFim: string;
  tipo: string;
  responsavel?: string;
  cor?: string;
}

export interface Responsavel {
  id: number;
  nome: string;
  email?: string;
  cargo?: string;
  setor?: string;
  ativo: number;
}

export interface Aniversario {
  id: number;
  nome: string;
  dataNascimento: string;
  setor?: string;
  cargo?: string;
  ativo: number;
}

const STORAGE_KEYS = {
  EVENTOS: 'calendario_eventos',
  RESPONSAVEIS: 'calendario_responsaveis',
  ANIVERSARIOS: 'calendario_aniversarios',
};

// ==================== EVENTOS ====================

export function getEventos(ano?: number, mes?: number): Evento[] {
  const stored = localStorage.getItem(STORAGE_KEYS.EVENTOS);
  let eventos: Evento[] = stored ? JSON.parse(stored) : [];
  
  if (ano && mes) {
    eventos = eventos.filter(e => {
      const data = new Date(e.dataInicio);
      return data.getFullYear() === ano && data.getMonth() + 1 === mes;
    });
  }
  
  return eventos;
}

export function getEventoById(id: number): Evento | null {
  const eventos = getEventos();
  return eventos.find(e => e.id === id) || null;
}

export function createEvento(evento: Omit<Evento, 'id'>): Evento {
  const eventos = getEventos();
  const newId = eventos.length > 0 ? Math.max(...eventos.map(e => e.id)) + 1 : 1;
  const newEvento = { ...evento, id: newId };
  eventos.push(newEvento);
  localStorage.setItem(STORAGE_KEYS.EVENTOS, JSON.stringify(eventos));
  return newEvento;
}

export function updateEvento(id: number, data: Partial<Evento>): Evento | null {
  const eventos = getEventos();
  const index = eventos.findIndex(e => e.id === id);
  if (index === -1) return null;
  
  eventos[index] = { ...eventos[index], ...data };
  localStorage.setItem(STORAGE_KEYS.EVENTOS, JSON.stringify(eventos));
  return eventos[index];
}

export function deleteEvento(id: number): boolean {
  const eventos = getEventos();
  const filtered = eventos.filter(e => e.id !== id);
  if (filtered.length === eventos.length) return false;
  
  localStorage.setItem(STORAGE_KEYS.EVENTOS, JSON.stringify(filtered));
  return true;
}

// ==================== RESPONSÁVEIS ====================

export function getResponsaveis(apenasAtivos: boolean = true): Responsavel[] {
  const stored = localStorage.getItem(STORAGE_KEYS.RESPONSAVEIS);
  let responsaveis: Responsavel[] = stored ? JSON.parse(stored) : [];
  
  if (apenasAtivos) {
    responsaveis = responsaveis.filter(r => r.ativo === 1);
  }
  
  return responsaveis;
}

export function createResponsavel(responsavel: Omit<Responsavel, 'id' | 'ativo'>): Responsavel {
  const responsaveis = getResponsaveis(false);
  const newId = responsaveis.length > 0 ? Math.max(...responsaveis.map(r => r.id)) + 1 : 1;
  const newResponsavel = { ...responsavel, id: newId, ativo: 1 };
  responsaveis.push(newResponsavel);
  localStorage.setItem(STORAGE_KEYS.RESPONSAVEIS, JSON.stringify(responsaveis));
  return newResponsavel;
}

export function updateResponsavel(id: number, data: Partial<Responsavel>): Responsavel | null {
  const responsaveis = getResponsaveis(false);
  const index = responsaveis.findIndex(r => r.id === id);
  if (index === -1) return null;
  
  responsaveis[index] = { ...responsaveis[index], ...data };
  localStorage.setItem(STORAGE_KEYS.RESPONSAVEIS, JSON.stringify(responsaveis));
  return responsaveis[index];
}

export function deleteResponsavel(id: number): boolean {
  const responsaveis = getResponsaveis(false);
  const filtered = responsaveis.filter(r => r.id !== id);
  if (filtered.length === responsaveis.length) return false;
  
  localStorage.setItem(STORAGE_KEYS.RESPONSAVEIS, JSON.stringify(filtered));
  return true;
}

// ==================== ANIVERSÁRIOS ====================

export function getAniversarios(apenasAtivos: boolean = true): Aniversario[] {
  const stored = localStorage.getItem(STORAGE_KEYS.ANIVERSARIOS);
  let aniversarios: Aniversario[] = stored ? JSON.parse(stored) : [];
  
  if (apenasAtivos) {
    aniversarios = aniversarios.filter(a => a.ativo === 1);
  }
  
  return aniversarios;
}

export function getAniversariosDoMes(mes: number): Aniversario[] {
  const aniversarios = getAniversarios();
  return aniversarios.filter(a => {
    const data = new Date(a.dataNascimento);
    return data.getMonth() + 1 === mes;
  });
}

export function createAniversario(aniversario: Omit<Aniversario, 'id' | 'ativo'>): Aniversario {
  const aniversarios = getAniversarios(false);
  const newId = aniversarios.length > 0 ? Math.max(...aniversarios.map(a => a.id)) + 1 : 1;
  const newAniversario = { ...aniversario, id: newId, ativo: 1 };
  aniversarios.push(newAniversario);
  localStorage.setItem(STORAGE_KEYS.ANIVERSARIOS, JSON.stringify(aniversarios));
  return newAniversario;
}

export function updateAniversario(id: number, data: Partial<Aniversario>): Aniversario | null {
  const aniversarios = getAniversarios(false);
  const index = aniversarios.findIndex(a => a.id === id);
  if (index === -1) return null;
  
  aniversarios[index] = { ...aniversarios[index], ...data };
  localStorage.setItem(STORAGE_KEYS.ANIVERSARIOS, JSON.stringify(aniversarios));
  return aniversarios[index];
}

export function deleteAniversario(id: number): boolean {
  const aniversarios = getAniversarios(false);
  const filtered = aniversarios.filter(a => a.id !== id);
  if (filtered.length === aniversarios.length) return false;
  
  localStorage.setItem(STORAGE_KEYS.ANIVERSARIOS, JSON.stringify(filtered));
  return true;
}
