import { useCallback, useEffect, useState } from "react";
import { fetchTransactions } from "../api/transactionApi";
import { ApiError } from "../api/httpClient";
import type { Transaction } from "../types/transaction";

export function useTransactionHistory(token: string | null, email: string | null) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!token || !email) return;
    setIsLoading(true);
    setError(null);
    try {
      const list = await fetchTransactions(email, token);
      setTransactions(list);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No pudimos obtener tu historial.");
    } finally {
      setIsLoading(false);
    }
  }, [token, email]);

  useEffect(() => {
    load();
  }, [load]);

  return { transactions, isLoading, error, refresh: load };
}
