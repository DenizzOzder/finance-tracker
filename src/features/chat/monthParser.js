// filepath: src/features/chat/monthParser.js

// Ay adları (TR) -> 0-based ay index
const TR_MONTHS = {
  ocak: 0,
  şubat: 1,
  subat: 1,
  mart: 2,
  nisan: 3,
  mayıs: 4,
  mayis: 4,
  haziran: 5,
  temmuz: 6,
  ağustos: 7,
  agustos: 7,
  eylül: 8,
  eylul: 8,
  ekim: 9,
  kasım: 10,
  kasim: 10,
  aralık: 11,
  aralik: 11,
};

function fmtYYYYMMLocal(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}

function shiftMonthLocal(baseDate, delta) {
  // delta: +1 sonraki ay, -1 önceki ay
  return new Date(baseDate.getFullYear(), baseDate.getMonth() + delta, 1);
}

/**
 * Metinden YYYY-MM döndürür (örn: "bu ay", "geçen ay", "temmuz 2025", "ağustos").
 * Eşleşme yoksa null.
 */
export function detectMonthFromText(text, now = new Date()) {
  if (!text) return null;
  const t = text.toLowerCase().trim();

  // Hızlı kalıplar
  if (/\bbu\s+ay\b/.test(t)) {
    return fmtYYYYMMLocal(now);
  }
  if (/\b(geçen|gecen|önceki|onceki)\s+ay\b/.test(t)) {
    return fmtYYYYMMLocal(shiftMonthLocal(now, -1));
  }
  if (/\b(gelecek|sonraki)\s+ay\b/.test(t)) {
    return fmtYYYYMMLocal(shiftMonthLocal(now, +1));
  }

  // "YYYY-MM" doğrudan verilmişse
  const yyyymm = t.match(/\b(20\d{2})[-/.](0[1-9]|1[0-2])\b/);
  if (yyyymm) {
    const y = Number(yyyymm[1]);
    const m = Number(yyyymm[2]);
    return `${y}-${String(m).padStart(2, "0")}`;
  }

  // yıl yoksa bu yıl varsay, ancak ay gelecekteyse "en yakın geçmiş yıl"ı alma — istenen bu yıl olsun
  const monthName = Object.keys(TR_MONTHS).find((k) => t.includes(k));
  if (monthName) {
    const idx = TR_MONTHS[monthName]; // 0-based
    // explicit yıl var mı?
    const yMatch = t.match(/\b(20\d{2})\b/);
    const y = yMatch ? Number(yMatch[1]) : now.getFullYear();
    return `${y}-${String(idx + 1).padStart(2, "0")}`;
  }

  return null;
}
