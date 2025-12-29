import { useState, useEffect, useCallback } from 'react';

// Hook para simular tRPC queries com localStorage
export function useLocalStorageQuery<T>(
  key: string,
  initialValue: T,
  options?: { refetchOnWindowFocus?: boolean }
) {
  const [data, setData] = useState<T>(initialValue);
  const [isLoading, setIsLoading] = useState(true);

  const refetch = useCallback(() => {
    try {
      const stored = localStorage.getItem(key);
      if (stored) {
        setData(JSON.parse(stored));
      } else {
        setData(initialValue);
      }
    } catch (error) {
      console.error(`Error loading ${key}:`, error);
      setData(initialValue);
    } finally {
      setIsLoading(false);
    }
  }, [key, initialValue]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  useEffect(() => {
    if (options?.refetchOnWindowFocus) {
      const handleFocus = () => refetch();
      window.addEventListener('focus', handleFocus);
      return () => window.removeEventListener('focus', handleFocus);
    }
  }, [options?.refetchOnWindowFocus, refetch]);

  return { data, isLoading, refetch };
}

// Hook para simular tRPC mutations com localStorage
export function useLocalStorageMutation<TInput, TOutput>(
  mutationFn: (input: TInput) => TOutput,
  options?: {
    onSuccess?: (data: TOutput) => void;
    onError?: (error: Error) => void;
  }
) {
  const [isLoading, setIsLoading] = useState(false);

  const mutate = useCallback(
    async (input: TInput) => {
      setIsLoading(true);
      try {
        const result = mutationFn(input);
        options?.onSuccess?.(result);
        return result;
      } catch (error) {
        options?.onError?.(error as Error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [mutationFn, options]
  );

  return { mutate, isLoading };
}
