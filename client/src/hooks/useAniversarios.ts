import { useLocalStorageQuery, useLocalStorageMutation } from './useLocalStorage';
import * as db from '../lib/localStorage';

const STORAGE_KEY = 'calendario_aniversarios';

export function useAniversariosList(input?: { apenasAtivos?: boolean }) {
  return useLocalStorageQuery(STORAGE_KEY, [], {});
}

export function useAniversariosCreate(options?: { onSuccess?: () => void }) {
  return useLocalStorageMutation(
    (input: any) => db.createAniversario(input),
    { onSuccess: options?.onSuccess }
  );
}

export function useAniversariosUpdate(options?: { onSuccess?: () => void }) {
  return useLocalStorageMutation(
    (input: any) => {
      const { id, ...data } = input;
      return db.updateAniversario(id, data);
    },
    { onSuccess: options?.onSuccess }
  );
}

export function useAniversariosDelete(options?: { onSuccess?: () => void }) {
  return useLocalStorageMutation(
    (input: { id: number }) => db.deleteAniversario(input.id),
    { onSuccess: options?.onSuccess }
  );
}
