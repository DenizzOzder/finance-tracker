// Basit cevaplayıcı: sadece snapshot'a göre konuşur (qa.json yok)

export function findBestAnswer(userText, { snapshot, usdRate = 33 } = {}) {
  if (!userText || !snapshot) return null;
  const q = userText.toLowerCase();

  const fmtTL = (n) =>
    new Intl.NumberFormat("tr-TR", {
      style: "currency",
      currency: "TRY",
      maximumFractionDigits: 0,
    }).format(Number(n) || 0);

  const fmtUSD = (n) => {
    const rate = Number(usdRate) || 33;
    const usd = (Number(n) || 0) / rate;
    return new Intl.NumberFormat("tr-TR", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(usd);
  };

  if (q.includes("gider")) {
    return {
      answer: `📉 Bu ay (${snapshot.month}) toplam giderin: ${fmtTL(
        snapshot.expenseTotal
      )} (≈ ${fmtUSD(snapshot.expenseTotal)}).`,
    };
  }
  if (q.includes("gelir")) {
    return {
      answer: `📈 Bu ay (${snapshot.month}) toplam gelir: ${fmtTL(
        snapshot.incomeTotal
      )} (≈ ${fmtUSD(snapshot.incomeTotal)}).`,
    };
  }
  if (q.includes("kategori")) {
    const top = snapshot.topCategories?.[0];
    if (top)
      return {
        answer: `🏷️ En çok harcadığın kategori: ${top.name} — ${fmtTL(
          top.amount
        )}.`,
      };
    return { answer: "🏷️ Bu ay için gider kategorisi bulunamadı." };
  }
  if (
    q.includes("kur") ||
    q.includes("dolar") ||
    q.includes("usd") ||
    q.includes("euro")
  ) {
    return {
      answer:
        "💱 Güncel döviz kurları için uygulamada Menü → Kurlar sayfasını açabilirsin.",
    };
  }
  if (q.includes("bakiye") || q.includes("balance")) {
    const balance = (snapshot.incomeTotal || 0) - (snapshot.expenseTotal || 0);
    const sign = balance >= 0 ? "artıda" : "ekside";
    return { answer: `💼 Bu ay net bakiye ${sign}: ${fmtTL(balance)}.` };
  }

  return null;
}
