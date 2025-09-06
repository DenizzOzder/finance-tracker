/* filepath: src/components/RuleBot/RuleBotWidget.jsx */
import { useEffect, useRef, useState } from "react";
import s from "./RuleBotWidget.module.css";
import { findBestAnswer } from "../../bot/matcher";
import { detectMonthFromText } from "../../features/chat/monthParser";
import { parseTransactionInput } from "../../bot/nlpTransaction";
import { parseCurrencyQuery } from "../../bot/currencyParser";

import { createTransaction } from "../../shared/transaction";
import { getRate, getRatesCached } from "../../shared/rates";
import { useMonthlySummary } from "../../features/chat/useMonthlySummary";

// Redux + thunks
import { useDispatch, useSelector } from "react-redux";
import {
  deleteTransaction,
  getTransactions,
} from "../../redux/transactions/operations";

// 🔹 Dönem özeti için doğrudan API çağrısı yapacağız
import { userTransactionsApi } from "../../shared/api";

export default function RuleBotWidget() {
  const dispatch = useDispatch();
  const items = useSelector((s) => s.transactions.items);

  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState([
    {
      role: "assistant",
      content:
        'Merhaba! 👋 Örn: "gider 100 tl market", "gelir 2500 maaş", "bu ay gider", "100 usd kaç tl", "usd tl", "kur", "son işlemi sil"',
    },
  ]);
  const [input, setInput] = useState("");
  const [unread, setUnread] = useState(0);
  const [month, setMonth] = useState(() => {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    return `${y}-${m}`;
  });
  const panelRef = useRef(null);
  const messagesRef = useRef(null);

  const { data: snapshot, loading, error, refetch } = useMonthlySummary(month);

  function scrollToBottom() {
    requestAnimationFrame(() => {
      const el = messagesRef.current;
      if (!el) return;
      el.scrollTop = el.scrollHeight;
    });
  }

  useEffect(() => {
    if (open) scrollToBottom();
  }, [open]);

  useEffect(() => {
    scrollToBottom();
  }, [msgs]);

  useEffect(() => {
    const onDown = (e) => {
      if (!open) return;
      if (panelRef.current && !panelRef.current.contains(e.target))
        setOpen(false);
    };
    window.addEventListener("mousedown", onDown);
    return () => window.removeEventListener("mousedown", onDown);
  }, [open]);

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (!open && msgs.length) {
      const last = msgs[msgs.length - 1];
      if (last.role === "assistant") setUnread((u) => u + 1);
    }
  }, [msgs, open]);

  const push = (m) => setMsgs((prev) => [...prev, m]);

  const send = async () => {
    const q = input.trim();
    if (!q) return;

    push({ role: "user", content: q });
    setInput("");

    /* 0) Son işlemi sil */
    if (/son\s*i(?:ş|s)lemi\s*sil/i.test(q)) {
      if (!items || items.length === 0) {
        push({ role: "assistant", content: "ℹ️ Silinecek işlem bulunamadı." });
        return;
      }
      const lastTx = items.reduce((acc, cur) => {
        const da = Date.parse(acc?.transactionDate || acc?.createdAt || 0);
        const db = Date.parse(cur?.transactionDate || cur?.createdAt || 0);
        return db >= da ? cur : acc;
      }, items[0]);

      push({
        role: "assistant",
        content: `🔄 Son işlem siliniyor: ${lastTx?.comment ?? "(isimsiz)"} ${
          lastTx?.amount ?? ""
        }`,
      });

      try {
        await dispatch(deleteTransaction(lastTx.id)).unwrap();
        await dispatch(getTransactions()).unwrap();
        await refetch();
        push({ role: "assistant", content: "✅ Son işlem başarıyla silindi." });
      } catch (e) {
        const msg = e?.message || "Silme işlemi başarısız.";
        push({ role: "assistant", content: `❌ ${msg}` });
      }
      return;
    }

    /* 1) Doğal dilden gider/gelir ekleme */
    const parsedTx = parseTransactionInput(q);
    if (parsedTx) {
      const detectedMonth = parsedTx.transactionDate.slice(0, 7);
      if (detectedMonth !== month) setMonth(detectedMonth);

      push({ role: "assistant", content: "🔄 İşlemi ekliyorum..." });
      try {
        await createTransaction(parsedTx);
        await refetch(); // özet
        await dispatch(getTransactions()).unwrap(); // liste

        const cleanLabel =
          (parsedTx.category || "Other").charAt(0).toUpperCase() +
          (parsedTx.category || "Other").slice(1);
        const displayTL = new Intl.NumberFormat("tr-TR", {
          style: "currency",
          currency: "TRY",
          maximumFractionDigits: 0,
        }).format(Math.abs(parsedTx.amount));

        push({
          role: "assistant",
          content: `✅ ${
            parsedTx.type === "expense" ? "Gider" : "Gelir"
          } eklendi: ${cleanLabel} ${displayTL} (${parsedTx.transactionDate})`,
        });
      } catch (e) {
        const msg =
          e?.response?.data?.message || e?.message || "İşlem eklenemedi.";
        push({ role: "assistant", content: `❌ ${msg}` });
      }
      return;
    }

    /* 2) Döviz/çevrim */
    const cq = parseCurrencyQuery(q);
    if (cq) {
      try {
        if (cq.kind === "convert") {
          const r = await getRate(cq.from, cq.to);
          const out = cq.amount * r;
          const fmt = (val, code, max = 4) =>
            new Intl.NumberFormat("tr-TR", {
              maximumFractionDigits: max,
            }).format(val) +
            " " +
            code;
          push({
            role: "assistant",
            content: `💱 ${fmt(cq.amount, cq.from)} ≈ ${fmt(out, cq.to)}  (1 ${
              cq.from
            } ≈ ${fmt(r, cq.to, 6)})`,
          });
        } else if (cq.kind === "rate") {
          const { base } = await getRatesCached();
          if (cq.base && cq.quote) {
            const r = await getRate(cq.base, cq.quote);
            const fmt = (val, code) =>
              new Intl.NumberFormat("tr-TR", {
                maximumFractionDigits: 6,
              }).format(val) +
              " " +
              code;
            push({
              role: "assistant",
              content: `💹 1 ${cq.base} ≈ ${fmt(r, cq.quote)}  (baz: ${base})`,
            });
          } else {
            const pairs = [
              ["USD", "TRY"],
              ["EUR", "TRY"],
              ["GBP", "TRY"],
            ];
            const lines = [];
            for (const [a, b] of pairs) {
              try {
                const r = await getRate(a, b);
                lines.push(
                  `• 1 ${a} ≈ ${new Intl.NumberFormat("tr-TR", {
                    maximumFractionDigits: 4,
                  }).format(r)} ${b}`
                );
              } catch {}
            }
            if (lines.length) {
              push({
                role: "assistant",
                content: `💱 Güncel kurlar:\n${lines.join("\n")}`,
              });
            } else {
              push({
                role: "assistant",
                content: "💱 Kur bilgisi şu an alınamadı.",
              });
            }
          }
        }
      } catch (e) {
        const msg =
          e?.response?.data?.message || e?.message || "Kur bilgisi alınamadı.";
        push({ role: "assistant", content: `❌ ${msg}` });
      }
      return;
    }

    /* 3) Dönem algılama → ÖZET MESAJ YAZ */
    const detected = detectMonthFromText(q);
    if (detected) {
      push({
        role: "assistant",
        content: `🗓️ ${detected} dönemi için verileri getiriyorum…`,
      });

      try {
        // detected => "YYYY-MM"
        const [yStr, mStr] = detected.split("-");
        const year = Number(yStr) || new Date().getFullYear();
        const monthNum = Number(mStr) || new Date().getMonth() + 1;

        const { data: s } = await userTransactionsApi.get(
          `/api/transactions-summary?month=${monthNum}&year=${year}`
        );

        // Toplamlar
        const income =
          typeof s?.incomeTotal === "number"
            ? s.incomeTotal
            : typeof s?.incomeSummary === "number"
            ? s.incomeSummary
            : 0;

        const expense =
          typeof s?.expenseTotal === "number"
            ? s.expenseTotal
            : typeof s?.expenseSummary === "number"
            ? s.expenseSummary
            : 0;

        // Kategori bazlı giderler
        let catList = Array.isArray(s?.topCategories)
          ? s.topCategories.map((c) => ({ name: c.name, amount: c.amount }))
          : Array.isArray(s?.categoriesSummary)
          ? s.categoriesSummary
              .filter((c) => String(c.type || "").toUpperCase() === "EXPENSE")
              .map((c) => ({ name: c.name, amount: c.total }))
          : [];

        catList = catList
          .slice()
          .sort((a, b) => (b.amount || 0) - (a.amount || 0))
          .slice(0, 5);

        const fmt = (n) =>
          new Intl.NumberFormat("tr-TR", {
            style: "currency",
            currency: "TRY",
            maximumFractionDigits: 0,
          }).format(Math.abs(Number(n) || 0));

        const lines = [
          `📊 ${detected} özeti:`,
          `• Toplam Harcanan: ${fmt(expense)}`,
          `• Toplam Gelir: ${fmt(income)}`,
        ];

        if (catList.length) {
          lines.push("• Kategori Bazında Harcama:");
          for (const c of catList) {
            lines.push(`   - ${c.name}: ${fmt(c.amount)}`);
          }
        } else {
          lines.push("• Kategori Bazında Harcama: veri yok");
        }

        push({ role: "assistant", content: lines.join("\n") });
        setMonth(detected); // UI'daki (YYYY-MM) etiketi güncellensin
      } catch (e) {
        const msg =
          e?.response?.data?.message ||
          e?.message ||
          "Bu dönem verileri alınamadı.";
        push({ role: "assistant", content: `❌ ${msg}` });
      }
      return;
    }

    /* 4) Snapshot tabanlı Q&A */
    if (loading) {
      push({
        role: "assistant",
        content: `🗓️ ${month} verilerini getiriyorum…`,
      });
      return;
    }
    if (error) {
      const msg =
        error?.response?.data?.message ||
        error?.message ||
        "Verilerini çekerken bir hata oluştu.";
      push({ role: "assistant", content: `❌ ${msg}` });
      return;
    }
    if (!snapshot) {
      push({
        role: "assistant",
        content:
          "ℹ️ Bu dönem için veriye erişemedim. Giriş yaptıktan sonra tekrar dener misin?",
      });
      return;
    }

    const usdRateFallback = 33;
    const best = findBestAnswer(q, { snapshot, usdRate: usdRateFallback });
    push(
      best
        ? { role: "assistant", content: best.answer }
        : {
            role: "assistant",
            content:
              '🤔 Anlayamadım. Örn: "gider 100 tl market", "gelir 2500 maaş", "geçen ay gider", "100 usd kaç tl", "usd tl", "kur", "son işlemi sil"',
          }
    );
  };

  return (
    <>
      {!open && (
        <button
          aria-label="Sohbeti aç"
          className={s.launcher}
          onClick={() => {
            setOpen(true);
            setUnread(0);
          }}
          title={`Aktif dönem: ${month}`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className={s.icon}
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M4 5a3 3 0 0 1 3-3h10a3 3 0 0 1 3 3v9a3 3 0 0 1-3 3H9.4l-3.3 2.5A1 1 0 0 1 4 18.7V5zm4 5h8a1 1 0 1 0 0-2H8a1 1 0 1 0 0 2zm0 4h5a1 1 0 1 0 0-2H8a1 1 0 1 0 0 2z" />
          </svg>
          {unread > 0 && <span className={s.badge}>{unread}</span>}
        </button>
      )}

      {open && (
        <div
          ref={panelRef}
          className={s.panel}
          role="dialog"
          aria-label="Canlı destek sohbet penceresi"
        >
          <div className={s.header}>
            <div className={s.title}>
              💬 FakirBot{" "}
              <span style={{ color: "#A1A1AA", fontWeight: 400 }}>
                ({month})
              </span>
            </div>
            <button
              aria-label="Kapat"
              className={s.iconBtn}
              onClick={() => setOpen(false)}
              title="Kapat"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className={s.iconSmall}
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M6 12h12v2H6z" />
              </svg>
            </button>
          </div>

          <div className={s.messages} ref={messagesRef}>
            {msgs.map((m, i) => (
              <div
                key={i}
                className={m.role === "user" ? s.rowRight : s.rowLeft}
              >
                <span
                  className={`${s.bubble} ${
                    m.role === "user" ? s.bubbleUser : s.bubbleBot
                  }`}
                >
                  {m.content}
                </span>
              </div>
            ))}
          </div>

          <div className={s.inputBar}>
            <input
              className={s.input}
              placeholder='Örn: "gider 100 tl market", "gelir 2500 maaş", "geçen ay gider", "100 usd kaç tl", "usd tl", "son işlemi sil"'
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              autoFocus
            />
            <button className={s.sendBtn} onClick={send}>
              Gönder
            </button>
          </div>
        </div>
      )}
    </>
  );
}
