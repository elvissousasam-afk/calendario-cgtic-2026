import { useLocalStorageQuery, useLocalStorageMutation } from './useLocalStorage';
import * as db from '../lib/localStorage';

const STORAGE_KEY = 'calendario_eventos';

// Hook para listar eventos
export function useEventosList(input?: { ano?: number; mes?: number }) {
  return useLocalStorageQuery(
    STORAGE_KEY,
    [],
    { refetchOnWindowFocus: false }
  );
}

// Hook para criar evento
export function useEventosCreate(options?: { onSuccess?: () => void }) {
  return useLocalStorageMutation(
    (input: any) => {
      return db.createEvento(input);
    },
    {
      onSuccess: () => {
        options?.onSuccess?.();
      },
    }
  );
}

// Hook para atualizar evento
export function useEventosUpdate(options?: { onSuccess?: () => void }) {
  return useLocalStorageMutation(
    (input: any) => {
      const { id, ...data } = input;
      return db.updateEvento(id, data);
    },
    {
      onSuccess: () => {
        options?.onSuccess?.();
      },
    }
  );
}

// Hook para deletar evento
export function useEventosDelete(options?: { onSuccess?: () => void }) {
  return useLocalStorageMutation(
    (input: { id: number }) => {
      return db.deleteEvento(input.id);
    },
    {
      onSuccess: () => {
        options?.onSuccess?.();
      },
    }
  );
}
