import { userTransactionsApi } from "./api";
import { mapTRCategoryToApi } from "./categoriesService"; // TR -> API kategori map'i

function mapTypeForApi(type) {
  return String(type || "").toUpperCase();
}

function fmtTRY(n) {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    maximumFractionDigits: 0,
  }).format(n);
}

function capitalize(s) {
  if (!s) return "";
  return s.charAt(0).toUpperCase() + s.slice(1);
}
async function resolveCategoryFor(typeApi, trCategoryMaybe) {
  // Önce TR -> API map'i dene (hem gider hem gelir için çalışır)
  if (trCategoryMaybe) {
    const mapped = await mapTRCategoryToApi(
      trCategoryMaybe,
      typeApi.toLowerCase()
    );
    if (mapped?.id) return mapped; // { id, name }
  }
  // Giderde kategori zorunlu, buraya düştüyse hata ver
  if (typeApi === "EXPENSE") {
    throw new Error("Kategori bulunamadı. Lütfen geçerli bir kategori girin.");
  }
  // GELİR: fallback → kategorileri çek, ilk INCOME olanı kullan
  const { data: cats } = await userTransactionsApi.get(
    "/api/transaction-categories"
  );
  const incomeCat = (cats || []).find(
    (c) => String(c?.type || "").toUpperCase() === "INCOME"
  );

  if (!incomeCat?.id) {
    throw new Error("Gelir kategorisi bulunamadı.");
  }

  return { id: incomeCat.id, name: incomeCat.name || "Income" };
}

/**
 * parsedTR beklenen:
 * {
 *   type: "expense" | "income",
 *   amount: number (pozitif),
 *   category?: string (TR),
 *   transactionDate: "YYYY-MM-DD"
 * }
 */
export async function createTransaction(parsedTR) {
  if (!parsedTR?.transactionDate) {
    throw new Error("Geçerli bir tarih bulunamadı.");
  }

  const apiType = mapTypeForApi(parsedTR.type);
  if (apiType !== "EXPENSE" && apiType !== "INCOME") {
    throw new Error("İşlem tipi geçersiz (gider/gelir).");
  }

  const rawAmount = Number(parsedTR.amount);
  if (!Number.isFinite(rawAmount) || rawAmount <= 0) {
    throw new Error("Tutar geçersiz.");
  }

  // İşaret: gider negatif, gelir pozitif
  const amount =
    apiType === "EXPENSE" ? -Math.abs(rawAmount) : Math.abs(rawAmount);

  // ✅ Her iki tip için de categoryId zorunlu olduğundan çöz
  const mapped = await resolveCategoryFor(apiType, parsedTR.category);

  // Yorum: mümkünse mapped.name, değilse TR kategori ya da tip etiketi
  const labelRaw =
    (parsedTR.category && parsedTR.category.trim()) ||
    mapped?.name ||
    (apiType === "EXPENSE" ? "Other" : "Gelir");

  const shortComment = `${capitalize(labelRaw)}`;

  // 💾 payload — categoryId HER ZAMAN gönderiliyor
  const payload = {
    transactionDate: parsedTR.transactionDate, // "YYYY-MM-DD"
    type: apiType, // "EXPENSE" | "INCOME"
    categoryId: mapped.id, // ← zorunlu
    comment: shortComment,
    amount,
  };

  const { data } = await userTransactionsApi.post("/api/transactions", payload);
  return data;
}
