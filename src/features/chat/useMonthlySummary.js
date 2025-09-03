import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { userTransactionsApi } from "../../shared/api";

/* ---------------- Helpers ---------------- */

function parseYM(ym /* "YYYY-MM" */) {
  const [y, m] = String(ym).split("-");
  const year = Number(y);
  const monthNum = Number((m || "").replace(/^0+/, "")); // "09" -> 9
  return { year, monthNum, y, m: m || "" };
}

/** Backend şeması → snapshot */
export function buildSnapshotFromSummary(
  summary /* TransactionsSummarySerializer */,
  monthStr /* "YYYY-MM" */
) {
  const incomeTotal = Number(summary?.incomeSummary || 0);
  const expenseTotal = Number(summary?.expenseSummary || 0);

  const cats = Array.isArray(summary?.categoriesSummary)
    ? summary.categoriesSummary
    : [];
  const expenseCats = cats.filter(
    (c) => String(c.type).toUpperCase() === "EXPENSE"
  );

  const topCategories = expenseCats
    .map((c) => ({ name: c.name, amount: Number(c.total || 0) }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 3);

  let month = monthStr;
  if (!month) {
    const y = summary?.year;
    const m = summary?.month;
    if (typeof y === "number" && typeof m === "number") {
      month = `${y}-${String(m).padStart(2, "0")}`;
    }
  }

  return { month, incomeTotal, expenseTotal, topCategories };
}

/** Tüm işlemlerden frontend'de snapshot üretir (fallback) */
function buildSnapshotFromTransactions(allTx, ym /* "YYYY-MM" */) {
  const monthPrefix = ym + "-";
  const tx = Array.isArray(allTx) ? allTx : allTx?.items || [];

  const inMonth = tx.filter((t) =>
    String(t.transactionDate || t.date || "").startsWith(monthPrefix)
  );

  const incomeTotal = inMonth
    .filter((t) => String(t.type).toUpperCase() === "INCOME")
    .reduce((a, b) => a + Number(b.amount || 0), 0);

  const expenseTx = inMonth.filter(
    (t) => String(t.type).toUpperCase() === "EXPENSE"
  );
  const expenseTotal = expenseTx.reduce((a, b) => a + Number(b.amount || 0), 0);

  const byCat = {};
  for (const t of expenseTx) {
    const key = t.categoryName || t.category || "Other";
    byCat[key] = (byCat[key] || 0) + Number(t.amount || 0);
  }
  const topCategories = Object.entries(byCat)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([name, amount]) => ({ name, amount }));

  return { month: ym, incomeTotal, expenseTotal, topCategories };
}

/* --------------- Main Hooks --------------- */

/** Ham summary nesnesini döner (fallback’lerle). */
export function useMonthlySummary(month /* "YYYY-MM" */) {
  const isLoggedIn = useSelector((s) => s.auth.isLoggedIn);
  const [data, setData] = useState(null);
  const [loading, setLoad] = useState(false);
  const [error, setErr] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let alive = true;

    async function fetchSummary() {
      if (!isLoggedIn || !month) {
        if (alive) {
          setData(null);
          setErr(null);
          setLoad(false);
        }
        return;
      }
      setLoad(true);
      setErr(null);

      const { year, monthNum, y, m } = parseYM(month);

      // 1) ?month=<1-12>&year=<YYYY>
      try {
        const r1 = await userTransactionsApi.get("/api/transactions-summary", {
          params: { month: monthNum, year },
        });
        if (!alive) return;
        setData(r1.data);
        setLoad(false);
        return;
      } catch (e1) {
        const status1 = e1?.response?.status;
        if (status1 !== 400) {
          if (alive) {
            setErr(e1);
            setLoad(false);
          }
          return;
        }
        // 2) ?month=YYYY-MM
        try {
          const r2 = await userTransactionsApi.get(
            "/api/transactions-summary",
            {
              params: { month: `${y}-${m}` },
            }
          );
          if (!alive) return;
          setData(r2.data);
          setLoad(false);
          return;
        } catch (e2) {
          const status2 = e2?.response?.status;
          if (status2 !== 400) {
            if (alive) {
              setErr(e2);
              setLoad(false);
            }
            return;
          }
          // 3) Fallback: tüm işlemler → front-end özet
          try {
            const r3 = await userTransactionsApi.get("/api/transactions");
            if (!alive) return;
            const fallback = buildSnapshotFromTransactions(r3.data, month);
            setData({
              // Bu alanlar sadece bilgi amaçlı; snapshot’ı aşağıda üretirken kullanmayacağız
              __fallback__: true,
              __snapshot__: fallback,
              year,
              month: monthNum,
            });
            setLoad(false);
          } catch (e3) {
            if (alive) {
              setErr(e3);
              setLoad(false);
            }
          }
        }
      }
    }

    fetchSummary();
    return () => {
      alive = false;
    };
  }, [isLoggedIn, month, refreshKey]);

  const refetch = () => setRefreshKey((k) => k + 1);

  return { data, loading, error, refetch };
}

/** UI için hazır snapshot döner. */
export function useMonthlySnapshot(month /* "YYYY-MM" */) {
  const { data, loading, error, refetch } = useMonthlySummary(month);
  const snapshot = data?.__fallback__
    ? data.__snapshot__
    : data
    ? buildSnapshotFromSummary(data, month)
    : null;
  return { data: snapshot, loading, error, refetch };
}
