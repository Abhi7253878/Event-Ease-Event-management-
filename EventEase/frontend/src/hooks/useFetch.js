import { useCallback, useEffect, useState } from 'react';
import api, { errMsg } from '../services/api';
export default function useFetch(url, deps = []) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const load = useCallback(() => {
    if (!url) return;
    setLoading(true); setError('');
    api.get(url).then(r => setData(r.data)).catch(e => setError(errMsg(e))).finally(() => setLoading(false));
  }, [url]); // eslint-disable-line
  useEffect(load, [load, ...deps]); // eslint-disable-line
  return { data, loading, error, reload: load };
}
