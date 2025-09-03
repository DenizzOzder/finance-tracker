import { useState } from "react";
import { findBestAnswer } from "../../bot/matcher.js";

export default function RuleBot() {
  const [msgs, setMsgs] = useState([
    {
      role: "assistant",
      content:
        'Merhaba! 👋 Ne hakkında yardım edeyim? (örn: "toplam gider", "kur", "gider ekle")',
    },
  ]);
  const [input, setInput] = useState("");

  const send = () => {
    const q = input.trim();
    if (!q) return;
    const userMsg = { role: "user", content: q };
    const best = findBestAnswer(q, { threshold: 0.35 });

    const reply = best
      ? { role: "assistant", content: best.answer }
      : {
          role: "assistant",
          content:
            'Bunu tam anlayamadım 🤔 Daha net yazabilir misin? Örn: "toplam gider", "kur".',
        };

    setMsgs((prev) => [...prev, userMsg, reply]);
    setInput("");
  };

  return (
    <div className="fixed bottom-4 right-4 w-80 rounded-2xl shadow-xl border bg-white">
      <div className="p-3 border-b font-medium">💬 BudgetBot (Basit)</div>
      <div className="h-80 overflow-y-auto p-3 space-y-2 text-sm">
        {msgs.map((m, i) => (
          <div
            key={i}
            className={m.role === "user" ? "text-right" : "text-left"}
          >
            <span
              className={`inline-block px-3 py-2 rounded-xl ${
                m.role === "user" ? "bg-gray-900 text-white" : "bg-gray-100"
              }`}
            >
              {m.content}
            </span>
          </div>
        ))}
      </div>
      <div className="p-2 flex gap-2">
        <input
          className="flex-1 border rounded-xl px-3 py-2"
          placeholder="Örn: toplam gider"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
        />
        <button
          className="px-3 py-2 rounded-xl bg-black text-white"
          onClick={send}
        >
          Gönder
        </button>
      </div>
    </div>
  );
}
