// Doğal dilden işlem çıkarır:
// "Gider: 100TL Market", "100 tl market harcaması", "gelir 2500 maaş", "dün 85 tl ulaşım"
// Döner: { type: 'expense'|'income', amount:number, category:string, transactionDate:'YYYY-MM-DD', comment?:string }

const MONTHS_TR = [
  "ocak",
  "şubat",
  "mart",
  "nisan",
  "mayıs",
  "haziran",
  "temmuz",
  "ağustos",
  "eylül",
  "ekim",
  "kasım",
  "aralık",
];

function toISODate(d) {
  return d.toISOString().slice(0, 10);
}

function parseDate(text) {
  const s = text.toLowerCase();
  const now = new Date();
  if (/\bbug[uü]n\b/.test(s)) return toISODate(now);
  if (/\bd[uü]n\b/.test(s))
    return toISODate(
      new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1)
    );

  const iso = s.match(/\b(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})\b/);
  if (iso)
    return `${iso[1]}-${String(iso[2]).padStart(2, "0")}-${String(
      iso[3]
    ).padStart(2, "0")}`;

  const dmy = s.match(/\b(\d{1,2})[-/.](\d{1,2})[-/.](\d{2,4})\b/);
  if (dmy) {
    const d = dmy[1],
      m = dmy[2],
      y = dmy[3].length === 2 ? `20${dmy[3]}` : dmy[3];
    return `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
  }

  const md = s.match(/\b(\d{1,2})\s+([a-zçğıöşü]+)\b/);
  if (md) {
    const day = Number(md[1]);
    const idx = MONTHS_TR.indexOf(md[2]);
    if (idx >= 0) {
      const y = now.getFullYear();
      const date = new Date(y, idx, day);
      if (!isNaN(date)) return toISODate(date);
    }
  }

  return toISODate(now);
}

function parseAmount(text) {
  const s = text.toLowerCase().replace(/[,]/g, "."); // 100,50 -> 100.50
  const m = s.match(
    /(?:₺|\btl\b|\btry\b)?\s*([0-9]+(?:\.[0-9]+)?)\s*(?:₺|\btl\b|\btry\b)?/i
  );
  if (!m) return null;
  return Number(m[1]);
}

export function parseTransactionInput(input) {
  if (!input) return null;
  const s = input.trim().toLowerCase();

  let type = s.startsWith("gider")
    ? "expense"
    : s.startsWith("gelir")
    ? "income"
    : null;
  if (!type) {
    if (/\b(harcama|gider|ödedim|alışveriş)\b/.test(s)) type = "expense";
    else if (/\b(gelir|kazanç|maaş|aldım)\b/.test(s)) type = "income";
  }
  if (!type) return null;

  const amount = parseAmount(s);
  if (amount == null || isNaN(amount) || amount <= 0) return null;

  const transactionDate = parseDate(s);

  // basit kategori yakalama
  let category = "Other";
  const after = s.split(String(amount))[1] || s.split("tl")[1] || "";
  const catMatch = after.match(/\b([a-zçğıöşü]{3,30})/i);
  if (catMatch) {
    const word = catMatch[1];
    if (
      ![
        "tl",
        "try",
        "harcama",
        "gider",
        "gelir",
        "ekle",
        "ekledim",
        "bugün",
        "dün",
      ].includes(word)
    ) {
      category = word.charAt(0).toUpperCase() + word.slice(1);
    }
  }

  return { type, amount, category, transactionDate, comment: input.trim() };
}
