import { userTransactionsApi } from "./api";
import { normalizeTR, hintEnglishCategoryName } from "./categoryMap";

let _cache = null;
let _ts = 0;

export async function getCategoriesCached() {
  const now = Date.now();
  if (_cache && now - _ts < 5 * 60 * 1000) return _cache;

  const { data } = await userTransactionsApi.get("/api/transaction-categories");
  // Beklenen: [{ id, name, type }] (type: "EXPENSE" | "INCOME")
  _cache = Array.isArray(data) ? data : data?.items || [];
  _ts = now;
  return _cache;
}

/** trCategory → { id, name, type } (ilgili tipe uygun) */
export async function mapTRCategoryToApi(
  trCategory,
  desiredType /* 'expense'|'income' */
) {
  const all = await getCategoriesCached();
  const apiType = String(desiredType).toUpperCase(); // 'EXPENSE' | 'INCOME'
  const list = all.filter((c) => String(c.type).toUpperCase() === apiType);

  const hintEn = hintEnglishCategoryName(trCategory);
  if (hintEn) {
    const hit = list.find(
      (c) => (c.name || "").toLowerCase() === hintEn.toLowerCase()
    );
    if (hit) return { id: hit.id, name: hit.name, type: hit.type };
  }

  const nTr = normalizeTR(trCategory);
  let best = null,
    bestScore = 0;
  for (const c of list) {
    const nName = normalizeTR(c.name);
    let score = 0;
    if (nName === nTr) score = 3;
    else if (nName.includes(nTr) || nTr.includes(nName)) score = 2;
    else if (nName.split(" ").some((w) => nTr.includes(w))) score = 1;
    if (score > bestScore) {
      bestScore = score;
      best = c;
    }
  }
  if (best) return { id: best.id, name: best.name, type: best.type };

  const other = list.find((c) => normalizeTR(c.name) === "other");
  if (other) return { id: other.id, name: other.name, type: other.type };

  return { id: null, name: hintEn || "Other", type: apiType };
}
