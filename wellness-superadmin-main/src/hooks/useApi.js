import { useCallback, useEffect, useState } from "react";
import api from "../lib/api";

export function useApi(path, options = {}, deps = []) {
  const enabled = options.enabled ?? true;
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(Boolean(enabled));
  const [error, setError] = useState("");

  const fetchData = useCallback(async () => {
    if (!enabled || !path) {
      setLoading(false);
      return null;
    }
    setLoading(true);
    setError("");
    try {
      const response = await api.get(path);
      const next = response.data?.data ?? null;
      setData(next);
      return next;
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Request failed.");
      throw err;
    } finally {
      setLoading(false);
    }
  }, [enabled, path]);

  useEffect(() => {
    if (!enabled || !path) {
      setLoading(false);
      return;
    }
    fetchData().catch(() => undefined);
  }, [fetchData, enabled, path, ...deps]);

  return { data, loading, error, refetch: fetchData, setData };
}
