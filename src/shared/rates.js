import axios from "axios";

const mono = axios.create({
  baseURL: "https://api.monobank.ua",
  // Monobank bu uç noktada auth gerektirmiyor
});

// 5 dk cache
let _cacheGraph = null;
let _cacheTS = 0;

// ISO 4217 numeric → alpha kod eşlemesi (sık kullanılanlar)
const NUM2ALPHA = {
  980: "UAH",
  840: "USD",
  978: "EUR",
  826: "GBP",
  949: "TRY",
  985: "PLN",
  756: "CHF",
  203: "CZK",
  348: "HUF",
  392: "JPY",
  124: "CAD",
  36: "AUD",
  643: "RUB",
  156: "CNY",
  784: "AED",
  702: "SGD",
};

function asAlpha(code) {
  const n = Number(code);
  if (!Number.isNaN(n) && NUM2ALPHA[n]) return NUM2ALPHA[n];
  // bilinmeyen numeric kodu da ALPHA gibi gösterme:
  if (!Number.isNaN(n)) return String(n);
  return String(code).toUpperCase();
}

/**
 * Monobank cevabı örnek satır:
 * {
 *   "currencyCodeA": 840,
 *   "currencyCodeB": 980,
 *   "date": 1719938406,
 *   "rateBuy": 40.05,
 *   "rateSell": 40.55,
 *   "rateCross": 40.30
 * }
 *
 * A/B "rateCross" varsa direkt A per B (B başına A?) — Monobank pratikte
 * UAH karşısında A'nın UAH fiyatını verir. Biz "to per from" oranı istiyoruz.
 * Bu implementasyonda şunu yapıyoruz:
 * - mid = rateCross || (rateBuy+rateSell)/2 || rateBuy || rateSell
 * - A -> B için edge = mid
 * - B -> A için edge = 1/mid
 */
function buildGraphFromMonobank(rows) {
  const graph = {}; // graph[from][to] = to per from

  const addEdge = (from, to, rate) => {
    if (!graph[from]) graph[from] = {};
    graph[from][to] = rate;
  };

  for (const row of rows || []) {
    const A = asAlpha(row.currencyCodeA);
    const B = asAlpha(row.currencyCodeB);

    let mid = null;
    if (typeof row.rateCross === "number") mid = row.rateCross;
    else if (
      typeof row.rateBuy === "number" &&
      typeof row.rateSell === "number"
    ) {
      mid = (row.rateBuy + row.rateSell) / 2;
    } else if (typeof row.rateBuy === "number") mid = row.rateBuy;
    else if (typeof row.rateSell === "number") mid = row.rateSell;

    if (!A || !B || !mid || mid <= 0) continue;

    // A -> B = mid, B -> A = 1/mid
    addEdge(A, B, mid);
    addEdge(B, A, 1 / mid);
  }

  return graph;
}

/**
 * Monobank'tan grafiği alıp cache'ler.
 * Dönüş: { base: 'UAH' | <tahmin>, graph }
 */
export async function getRatesCached() {
  const now = Date.now();
  if (_cacheGraph && now - _cacheTS < 5 * 60 * 1000) {
    const base = _cacheGraph["UAH"] ? "UAH" : Object.keys(_cacheGraph)[0];
    return { base, graph: _cacheGraph };
  }

  const { data } = await mono.get("/bank/currency");
  const graph = buildGraphFromMonobank(data);
  _cacheGraph = graph;
  _cacheTS = now;

  const base = graph["UAH"] ? "UAH" : Object.keys(graph)[0];
  return { base, graph };
}

/**
 * İki para birimi arasında oran döndürür: 1 FROM kaç TO eder?
 * Örn: getRate('USD','TRY') → TRY per USD
 */
export async function getRate(from, to) {
  const F = String(from).toUpperCase();
  const T = String(to).toUpperCase();
  if (F === T) return 1;

  const { graph } = await getRatesCached();

  // 1) Doğrudan kenar
  if (graph[F] && typeof graph[F][T] === "number") return graph[F][T];

  // 2) Ortak pivot ile (UAH, USD, EUR, TRY sırayla dene)
  const pivots = ["UAH", "USD", "EUR", "TRY"];
  for (const P of pivots) {
    if (graph[F]?.[P] && graph[P]?.[T]) {
      return graph[F][P] * graph[P][T];
    }
  }

  // 3) Genel pivot araması (ilk uygun ortak düğüm)
  if (graph[F]) {
    for (const P of Object.keys(graph[F])) {
      if (graph[P]?.[T]) {
        return graph[F][P] * graph[P][T];
      }
    }
  }

  throw new Error(`Rate not available for ${F}/${T}`);
}
