// Mock completo do tRPC client que usa localStorage
import { useState, useCallback, useEffect } from 'react';

// ==================== STORAGE ====================
const STORAGE_KEYS = {
  EVENTOS: 'calendario_eventos',
  RESPONSAVEIS: 'calendario_responsaveis',
  ANIVERSARIOS: 'calendario_aniversarios',
  CONFIGURACOES: 'calendario_configuracoes',
};

// ==================== EVENTOS ====================
function getEventos(ano?: number, mes?: number) {
  const stored = localStorage.getItem(STORAGE_KEYS.EVENTOS);
  let eventos = stored ? JSON.parse(stored) : [];
  
  // Normalizar estrutura: converter dataInicio para dataEvento se necessário
  eventos = eventos.map((e: any) => {
    if (e.dataInicio && !e.dataEvento) {
      return {
        ...e,
        dataEvento: e.dataInicio,
        horaInicio: e.dataInicio ? new Date(e.dataInicio).toTimeString().slice(0, 5) : null,
        horaFim: e.dataFim ? new Date(e.dataFim).toTimeString().slice(0, 5) : null,
        tipoEvento: e.tipo || e.tipoEvento,
        responsavelNome: e.responsavel || e.responsavelNome,
      };
    }
    return e;
  });
  
  if (ano) {
    eventos = eventos.filter((e: any) => {
      const data = new Date(e.dataEvento || e.dataInicio);
      return data.getFullYear() === ano;
    });
  }
  
  if (mes) {
    eventos = eventos.filter((e: any) => {
      const data = new Date(e.dataEvento || e.dataInicio);
      return data.getMonth() + 1 === mes;
    });
  }
  
  return eventos;
}

function createEvento(input: any) {
  const eventos = getEventos();
  const newId = eventos.length > 0 ? Math.max(...eventos.map((e: any) => e.id)) + 1 : 1;
  const newEvento = { ...input, id: newId };
  eventos.push(newEvento);
  localStorage.setItem(STORAGE_KEYS.EVENTOS, JSON.stringify(eventos));
  window.dispatchEvent(new Event('storage'));
  return newEvento;
}

function updateEvento(input: any) {
  const { id, ...data } = input;
  const eventos = getEventos();
  const index = eventos.findIndex((e: any) => e.id === id);
  if (index === -1) throw new Error('Evento não encontrado');
  
  eventos[index] = { ...eventos[index], ...data };
  localStorage.setItem(STORAGE_KEYS.EVENTOS, JSON.stringify(eventos));
  window.dispatchEvent(new Event('storage'));
  return eventos[index];
}

function deleteEvento(input: { id: number }) {
  const eventos = getEventos();
  const filtered = eventos.filter((e: any) => e.id !== input.id);
  localStorage.setItem(STORAGE_KEYS.EVENTOS, JSON.stringify(filtered));
  window.dispatchEvent(new Event('storage'));
  return { success: true };
}

// ==================== RESPONSÁVEIS ====================
function getResponsaveis(apenasAtivos?: boolean) {
  const stored = localStorage.getItem(STORAGE_KEYS.RESPONSAVEIS);
  let responsaveis = stored ? JSON.parse(stored) : [];
  
  if (apenasAtivos) {
    responsaveis = responsaveis.filter((r: any) => r.ativo === 1);
  }
  
  return responsaveis;
}

function createResponsavel(input: any) {
  const responsaveis = getResponsaveis();
  const newId = responsaveis.length > 0 ? Math.max(...responsaveis.map((r: any) => r.id)) + 1 : 1;
  const newResponsavel = { ...input, id: newId, ativo: 1 };
  responsaveis.push(newResponsavel);
  localStorage.setItem(STORAGE_KEYS.RESPONSAVEIS, JSON.stringify(responsaveis));
  window.dispatchEvent(new Event('storage'));
  return newResponsavel;
}

function updateResponsavel(input: any) {
  const { id, ...data } = input;
  const responsaveis = getResponsaveis();
  const index = responsaveis.findIndex((r: any) => r.id === id);
  if (index === -1) throw new Error('Responsável não encontrado');
  
  responsaveis[index] = { ...responsaveis[index], ...data };
  localStorage.setItem(STORAGE_KEYS.RESPONSAVEIS, JSON.stringify(responsaveis));
  window.dispatchEvent(new Event('storage'));
  return responsaveis[index];
}

function deleteResponsavel(input: { id: number }) {
  const responsaveis = getResponsaveis();
  const filtered = responsaveis.filter((r: any) => r.id !== input.id);
  localStorage.setItem(STORAGE_KEYS.RESPONSAVEIS, JSON.stringify(filtered));
  window.dispatchEvent(new Event('storage'));
  return { success: true };
}

// ==================== ANIVERSÁRIOS ====================
function getAniversarios(apenasAtivos?: boolean) {
  const stored = localStorage.getItem(STORAGE_KEYS.ANIVERSARIOS);
  let aniversarios = stored ? JSON.parse(stored) : [];
  
  if (apenasAtivos) {
    aniversarios = aniversarios.filter((a: any) => a.ativo === 1);
  }
  
  return aniversarios;
}

function createAniversario(input: any) {
  const aniversarios = getAniversarios();
  const newId = aniversarios.length > 0 ? Math.max(...aniversarios.map((a: any) => a.id)) + 1 : 1;
  const newAniversario = { ...input, id: newId, ativo: 1 };
  aniversarios.push(newAniversario);
  localStorage.setItem(STORAGE_KEYS.ANIVERSARIOS, JSON.stringify(aniversarios));
  window.dispatchEvent(new Event('storage'));
  return newAniversario;
}

function updateAniversario(input: any) {
  const { id, ...data } = input;
  const aniversarios = getAniversarios();
  const index = aniversarios.findIndex((a: any) => a.id === id);
  if (index === -1) throw new Error('Aniversário não encontrado');
  
  aniversarios[index] = { ...aniversarios[index], ...data };
  localStorage.setItem(STORAGE_KEYS.ANIVERSARIOS, JSON.stringify(aniversarios));
  window.dispatchEvent(new Event('storage'));
  return aniversarios[index];
}

function deleteAniversario(input: { id: number }) {
  const aniversarios = getAniversarios();
  const filtered = aniversarios.filter((a: any) => a.id !== input.id);
  localStorage.setItem(STORAGE_KEYS.ANIVERSARIOS, JSON.stringify(filtered));
  window.dispatchEvent(new Event('storage'));
  return { success: true };
}

// ==================== CONFIGURAÇÕES ====================
function getConfiguracoes() {
  const stored = localStorage.getItem(STORAGE_KEYS.CONFIGURACOES);
  return stored ? JSON.parse(stored) : {
    titulo: 'Calendário Gerencial CGTIC - 2026',
    subtitulo: 'Controle de Eventos, Prazos e Responsáveis',
    rodape: ''
  };
}

function updateConfiguracoes(input: any) {
  localStorage.setItem(STORAGE_KEYS.CONFIGURACOES, JSON.stringify(input));
  window.dispatchEvent(new Event('storage'));
  return input;
}

// ==================== HOOKS ====================
function useQuery(queryFn: () => any, deps: any[] = []) {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refetch = useCallback(() => {
    setIsLoading(true);
    try {
      const result = queryFn();
      setData(result);
    } catch (error) {
      console.error('Query error:', error);
    } finally {
      setIsLoading(false);
    }
  }, [queryFn]);

  useEffect(() => {
    refetch();
    
    // Listen for storage changes
    const handleStorage = () => refetch();
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, [refetch, ...deps]);

  return { data, isLoading, refetch };
}

function useMutation(mutationFn: (input: any) => any, options?: { onSuccess?: () => void }) {
  const [isLoading, setIsLoading] = useState(false);

  const mutate = useCallback(
    async (input: any) => {
      setIsLoading(true);
      try {
        const result = mutationFn(input);
        options?.onSuccess?.();
        return result;
      } catch (error) {
        console.error('Mutation error:', error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [mutationFn, options]
  );

  return { mutate, isLoading };
}

// ==================== MOCK TRPC CLIENT ====================
export const trpc = {
  eventos: {
    list: {
      useQuery: (input?: { ano?: number; mes?: number }) => 
        useQuery(() => getEventos(input?.ano, input?.mes), [input?.ano, input?.mes]),
    },
    create: {
      useMutation: (options?: { onSuccess?: () => void }) =>
        useMutation(createEvento, options),
    },
    update: {
      useMutation: (options?: { onSuccess?: () => void }) =>
        useMutation(updateEvento, options),
    },
    delete: {
      useMutation: (options?: { onSuccess?: () => void }) =>
        useMutation(deleteEvento, options),
    },
  },
  responsaveis: {
    list: {
      useQuery: (input?: { apenasAtivos?: boolean }) =>
        useQuery(() => getResponsaveis(input?.apenasAtivos), [input?.apenasAtivos]),
    },
    create: {
      useMutation: (options?: { onSuccess?: () => void }) =>
        useMutation(createResponsavel, options),
    },
    update: {
      useMutation: (options?: { onSuccess?: () => void }) =>
        useMutation(updateResponsavel, options),
    },
    delete: {
      useMutation: (options?: { onSuccess?: () => void }) =>
        useMutation(deleteResponsavel, options),
    },
  },
  aniversarios: {
    list: {
      useQuery: (input?: { apenasAtivos?: boolean }) =>
        useQuery(() => getAniversarios(input?.apenasAtivos), [input?.apenasAtivos]),
    },
    create: {
      useMutation: (options?: { onSuccess?: () => void }) =>
        useMutation(createAniversario, options),
    },
    update: {
      useMutation: (options?: { onSuccess?: () => void }) =>
        useMutation(updateAniversario, options),
    },
    delete: {
      useMutation: (options?: { onSuccess?: () => void }) =>
        useMutation(deleteAniversario, options),
    },
  },
  configuracoes: {
    getAll: {
      useQuery: () => useQuery(() => getConfiguracoes(), []),
    },
    update: {
      useMutation: (options?: { onSuccess?: () => void }) =>
        useMutation(updateConfiguracoes, options),
    },
  },
  useUtils: () => ({
    eventos: {
      list: {
        invalidate: () => window.dispatchEvent(new Event('storage')),
      },
    },
    responsaveis: {
      list: {
        invalidate: () => window.dispatchEvent(new Event('storage')),
      },
    },
    aniversarios: {
      list: {
        invalidate: () => window.dispatchEvent(new Event('storage')),
      },
    },
    configuracoes: {
      getAll: {
        invalidate: () => window.dispatchEvent(new Event('storage')),
      },
    },
  }),
};
