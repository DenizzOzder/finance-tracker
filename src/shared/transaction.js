import { userTransactionsApi } from "./api";
import { mapTRCategoryToApi } from "./categoriesService";

function mapTypeForApi(type) {
  return String(type).toUpperCase(); // "EXPENSE" | "INCOME"
}

/**
 * parsedTR: { type:'expense'|'income', amount, category, transactionDate, comment? }
 * CreateTransactionDto:
 * { transactionDate, type, categoryId, comment, amount }
 */
// function mapTypeForApi(type) {
//   return String(type).toUpperCase(); // "EXPENSE" | "INCOME"
// }

export async function createTransaction(parsedTR) {
  const mapped = await mapTRCategoryToApi(parsedTR.category, parsedTR.type);
  if (!mapped.id)
    throw new Error("Kategori bulunamadı. Lütfen geçerli bir kategori girin.");
  if (!parsedTR.transactionDate)
    throw new Error("Geçerli bir tarih bulunamadı.");

  const apiType = mapTypeForApi(parsedTR.type);

  // ▲ İşaret düzeltmesi (kritik)
  const rawAmount = Number(parsedTR.amount);
  if (isNaN(rawAmount) || rawAmount <= 0) throw new Error("Tutar geçersiz.");
  const amount =
    apiType === "EXPENSE" ? -Math.abs(rawAmount) : Math.abs(rawAmount);

  const payload = {
    transactionDate: parsedTR.transactionDate, // "YYYY-MM-DD"
    type: apiType, // "EXPENSE" | "INCOME"
    categoryId: mapped.id, // zorunlu
    comment: parsedTR.comment || "",
    amount, // ← işareti doğru
  };

  const { data } = await userTransactionsApi.post("/api/transactions", payload);
  return data;
}
