// Türkçe isim/simge → ISO kodları
const NAME2CODE = {
  tl: "TRY",
  try: "TRY",
  "₺": "TRY",
  lira: "TRY",
  "türk lirası": "TRY",
  dolar: "USD",
  $: "USD",
  usd: "USD",
  usdt: "USD",
  "amerika doları": "USD",
  euro: "EUR",
  "€": "EUR",
  eur: "EUR",
  avro: "EUR",
  sterlin: "GBP",
  gbp: "GBP",
  paund: "GBP",
  pound: "GBP",
  yen: "JPY",
  jpy: "JPY",
  ruble: "RUB",
  rub: "RUB",
  frank: "CHF",
  chf: "CHF",
};

function normCode(s) {
  if (!s) return null;
  const k = s.toLowerCase();
  if (NAME2CODE[k]) return NAME2CODE[k];
  // 2-3 harfli doğrudan kod verilmiş olabilir
  if (/^[a-z]{3}$/i.test(k)) return k.toUpperCase();
  return null;
}

function parseAmount(text) {
  // 100,50   1.000,25   125.5   200
  let s = text.replace(/\s/g, "");
  // Türkçe ondalık virgülü noktaya çevir (ama binlikleri de kaldır)
  // Örn: 1.234,56 -> 1234.56
  s = s.replace(/\.(?=\d{3}(\D|$))/g, ""); // binlik noktasını sil
  s = s.replace(/,/, "."); // ilk virgülü noktaya
  const m = s.match(/([0-9]+(?:\.[0-9]+)?)/);
  return m ? Number(m[1]) : null;
}

/**
 * Kullanıcı metninde kur/çevrim isteğini yakalar.
 * Dönüş:
 *  - { kind: "convert", amount, from, to }
 *  - { kind: "rate", base?, quote? }  (örn "usd kuru", "euro tl", "kur ne?")
 *  - null (kurla ilgili değil)
 */
export function parseCurrencyQuery(input) {
  if (!input) return null;
  const s = input.toLowerCase();

  // Anahtar kelimeler: kur, döviz, kaç, ->, çevir vb.
  const mentionsCurrency =
    /\b(kur|döviz|usd|euro|eur|dolar|tl|try|sterlin|gbp|yen|jpy|frank|chf)\b|[$€₺]/.test(
      s
    );

  if (!mentionsCurrency) return null;

  // "X -> Y" şeklinde ise doğrudan dönüşüm dene
  const arrow = s.match(/([a-z₺$€]+)\s*->\s*([a-z₺$€]+)/i);
  if (arrow) {
    const from = normCode(arrow[1]);
    const to = normCode(arrow[2]);
    const amount = parseAmount(s) ?? 1;
    if (from && to) return { kind: "convert", amount, from, to };
  }

  // "... kaç tl" / "... kaç dolar"
  const howMuch = s.match(/(\d[\d.,]*)\s*([a-z₺$€]+)?.*?\bkaç\s+([a-z₺$€]+)\b/);
  if (howMuch) {
    const amount = parseAmount(howMuch[1]);
    const from = normCode(howMuch[2]) || "USD"; // "100 kaç tl" -> varsayılan USD'den TRY'ye
    const to = normCode(howMuch[3]) || "TRY";
    if (amount && from && to) return { kind: "convert", amount, from, to };
  }

  // "100 usd kaç tl" benzeri
  const amountFirst = s.match(/(\d[\d.,]*)\s*([a-z₺$€]+)\s+kaç\s+([a-z₺$€]+)/);
  if (amountFirst) {
    const amount = parseAmount(amountFirst[1]);
    const from = normCode(amountFirst[2]);
    const to = normCode(amountFirst[3]);
    if (amount && from && to) return { kind: "convert", amount, from, to };
  }

  // "usd tl", "euro tl", "usd kuru" → oran sorusu
  const pair = s.match(/\b([a-z₺$€]+)\s+([a-z₺$€]+)\b/);
  if (pair) {
    const a = normCode(pair[1]);
    const b = normCode(pair[2]);
    if (a && b && a !== b) return { kind: "rate", base: a, quote: b };
  }

  // "usd kuru" "euro kuru"
  const solo = s.match(/\b([a-z₺$€]+)\s+kuru\b/);
  if (solo) {
    const a = normCode(solo[1]);
    if (a) return { kind: "rate", base: a, quote: "TRY" };
  }

  // sadece "kur" veya "döviz" → popüler çiftleri göster
  if (/\b(kur|döviz)\b/.test(s)) {
    return { kind: "rate" }; // genel görünüm
  }

  return null;
}
