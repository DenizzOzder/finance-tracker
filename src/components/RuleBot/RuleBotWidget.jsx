import { useEffect, useRef, useState } from "react";
import s from "./RuleBotWidget.module.css";

import { findBestAnswer } from "../../bot/matcher";
import { detectMonthFromText } from "../../features/chat/monthParser";
import { parseTransactionInput } from "../../bot/nlpTransaction";
import { createTransaction } from "../../shared/transaction";
import { useMonthlySnapshot } from "../../features/chat/useMonthlySummary";

export default function RuleBotWidget() {
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState([
    {
      role: "assistant",
      content:
        'Merhaba! 👋 Örn: "bu ay gider", "geçen ay gelir", "gider 100 tl market", "dün 85 tl ulaşım" yazabilirsin.',
    },
  ]);
  const [input, setInput] = useState("");
  const [unread, setUnread] = useState(0);
  const [month, setMonth] = useState(() =>
    new Date().toISOString().slice(0, 7)
  ); // aktif dönem
  const panelRef = useRef(null);

  const { data: snapshot, loading, error, refetch } = useMonthlySnapshot(month);

  useEffect(() => {
    const onDown = (e) => {
      if (open && panelRef.current && !panelRef.current.contains(e.target))
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

    const userMsg = { role: "user", content: q };
    push(userMsg);
    setInput("");

    // 1) Doğal dilden işlem dene
    const parsed = parseTransactionInput(q);
    if (parsed) {
      const detectedMonth = parsed.transactionDate.slice(0, 7);
      if (detectedMonth !== month) setMonth(detectedMonth);

      push({ role: "assistant", content: "🔄 İşlemi ekliyorum..." });
      try {
        await createTransaction(parsed);
        refetch();
        push({
          role: "assistant",
          content: `✅ ${
            parsed.type === "expense" ? "Gider" : "Gelir"
          } eklendi: ${parsed.amount} TL — ${parsed.category} (${
            parsed.transactionDate
          })`,
        });
      } catch (e) {
        const msg =
          e?.response?.data?.message || e?.message || "İşlem eklenemedi.";
        push({ role: "assistant", content: `❌ ${msg}` });
      }
      return;
    }

    // 2) Dönem algıla
    const detected = detectMonthFromText(q);
    if (detected && detected !== month) {
      setMonth(detected);
      push({
        role: "assistant",
        content: `🗓️ ${detected} dönemi için verileri getiriyorum…`,
      });
      return;
    }

    // 3) Q&A
    if (loading)
      return push({
        role: "assistant",
        content: `🗓️ ${month} verilerini getiriyorum…`,
      });
    if (error) {
      const msg =
        error?.response?.data?.message ||
        error?.message ||
        "Verilerini çekerken bir hata oluştu.";
      return push({ role: "assistant", content: `❌ ${msg}` });
    }
    if (!snapshot)
      return push({
        role: "assistant",
        content:
          "ℹ️ Bu dönem için veriye erişemedim. Giriş yaptıktan sonra tekrar dener misin?",
      });

    const usdRate = 33;
    const best = findBestAnswer(q, { snapshot, usdRate });
    push(
      best
        ? { role: "assistant", content: best.answer }
        : {
            role: "assistant",
            content: `🤔 Anlayamadım. Örn: "gider 100 tl market", "gelir 2500 maaş", "geçen ay gider".`,
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
              💬 BudgetBot{" "}
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

          <div className={s.messages}>
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
              placeholder='Örn: "gider 100 tl market", "gelir 2500 maaş", "geçen ay gider"'
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
