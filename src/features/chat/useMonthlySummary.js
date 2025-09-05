// src/features/chat/useMonthlySummary.js
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { userTransactionsApi } from "../../shared/api";

// GET /api/transactions-summary?month=<1-12>&year=<YYYY>
async function fetchSummaryRequest(monthYYYYMM) {
  const [y, m] = monthYYYYMM.split("-").map(Number);
  const { data } = await userTransactionsApi.get("/api/transactions-summary", {
    params: { month: m, year: y },
  });
  return data;
}

// API cevabını matcher'ın beklediği şekle çevir
function toSnapshot(summary, monthStr) {
  if (!summary) return null;

  // income / expense toplamları
  const incomeTotal =
    typeof summary.incomeSummary === "number"
      ? summary.incomeSummary
      : (summary.categoriesSummary || [])
          .filter((c) => (c.type || "").toUpperCase() === "INCOME")
          .reduce((a, b) => a + (Number(b.total) || 0), 0);

  const expenseTotal =
    typeof summary.expenseSummary === "number"
      ? summary.expenseSummary
      : (summary.categoriesSummary || [])
          .filter((c) => (c.type || "").toUpperCase() === "EXPENSE")
          .reduce((a, b) => a + (Number(b.total) || 0), 0);

  // en çok harcanan 3 kategori
  const expenseCats = (summary.categoriesSummary || []).filter(
    (c) => (c.type || "").toUpperCase() === "EXPENSE"
  );
  const topCategories = expenseCats
    .map((c) => ({ name: c.name, amount: Number(c.total) || 0 }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 3);

  return { month: monthStr, incomeTotal, expenseTotal, topCategories };
}

export function useMonthlySummary(month /* "YYYY-MM" */) {
  const isLoggedIn = useSelector((s) => s.auth.isLoggedIn);

  const [data, setData] = useState(null); // <- snapshot döndüreceğiz
  const [loading, setLoad] = useState(false);
  const [error, setErr] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let alive = true;
    async function run() {
      if (!isLoggedIn || !month) {
        if (alive) setData(null);
        return;
      }
      setLoad(true);
      setErr(null);
      try {
        const raw = await fetchSummaryRequest(month);
        const snap = toSnapshot(raw, month);
        if (alive) setData(snap);
      } catch (e) {
        if (alive) setErr(e);
      } finally {
        if (alive) setLoad(false);
      }
    }
    run();
    return () => {
      alive = false;
    };
  }, [isLoggedIn, month, refreshKey]);

  const refetch = () => setRefreshKey((k) => k + 1);

  return { data, loading, error, refetch };
}
