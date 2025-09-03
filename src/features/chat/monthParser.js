function clampMonth(n) {
  return Math.min(12, Math.max(1, n));
}
function ymString(d) {
  return d.toISOString().slice(0, 7);
}

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

export function detectMonthFromText(text, now = new Date()) {
  if (!text) return null;
  const s = text.toLowerCase().trim();

  if (/\bbu\s+ay\b/.test(s)) return ymString(now);
  if (/\b(geçen|önceki)\s+ay\b/.test(s))
    return ymString(new Date(now.getFullYear(), now.getMonth() - 1, 1));

  const nAgo = s.match(/(\d+)\s+ay\s+önce/);
  if (nAgo) {
    const n = parseInt(nAgo[1], 10);
    return ymString(new Date(now.getFullYear(), now.getMonth() - n, 1));
  }

  const iso = s.match(/(\d{4})[-/](\d{1,2})/);
  if (iso) {
    const year = Number(iso[1]);
    const mon = clampMonth(Number(iso[2]));
    return `${year}-${String(mon).padStart(2, "0")}`;
  }

  for (let i = 0; i < 12; i++) {
    if (s.includes(MONTHS_TR[i])) {
      const year = now.getFullYear();
      const mon = i + 1;
      return `${year}-${String(mon).padStart(2, "0")}`;
    }
  }

  const dot = s.match(/(\d{1,2})\.(\d{4})/);
  if (dot) {
    const mon = clampMonth(Number(dot[1]));
    const year = Number(dot[2]);
    return `${year}-${String(mon).padStart(2, "0")}`;
  }

  return null;
}
