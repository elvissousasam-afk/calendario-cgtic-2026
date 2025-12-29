import { useLocalStorageQuery, useLocalStorageMutation } from './useLocalStorage';
import * as db from '../lib/localStorage';

const STORAGE_KEY = 'calendario_responsaveis';

export function useResponsaveisList(input?: { apenasAtivos?: boolean }) {
  return useLocalStorageQuery(STORAGE_KEY, [], {});
}

export function useResponsaveisCreate(options?: { onSuccess?: () => void }) {
  return useLocalStorageMutation(
    (input: any) => db.createResponsavel(input),
    { onSuccess: options?.onSuccess }
  );
}

export function useResponsaveisUpdate(options?: { onSuccess?: () => void }) {
  return useLocalStorageMutation(
    (input: any) => {
      const { id, ...data } = input;
      return db.updateResponsavel(id, data);
    },
    { onSuccess: options?.onSuccess }
  );
}

export function useResponsaveisDelete(options?: { onSuccess?: () => void }) {
  return useLocalStorageMutation(
    (input: { id: number }) => db.deleteResponsavel(input.id),
    { onSuccess: options?.onSuccess }
  );
}
