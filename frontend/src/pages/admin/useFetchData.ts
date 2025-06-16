// hooks/useFetchData.ts
import { useState, useEffect } from 'react';

interface FetchResult<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
}

const API_BASE_URL = 'http://localhost/tfg/SafeUse/backend/api/public/index.php';

export function useFetchData<T>(
  route: string,
  transform?: (json: any) => T,
  deps: any[] = []
): FetchResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    const url = `${API_BASE_URL}?route=${route}`;

    fetch(url, { method: 'GET', credentials: 'include' })
      .then(async (res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        return transform ? transform(json) : (json as T);
      })
      .then((result) => {
        if (isMounted) {
          setData(result);
          setError(null);
        }
      })
      .catch((err) => {
        if (isMounted) setError(err as Error);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [url, ...deps]);

  return { data, loading, error };
}
