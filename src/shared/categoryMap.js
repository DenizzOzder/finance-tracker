export function normalizeTR(s = "") {
  const map = {
    İ: "i",
    I: "i",
    ı: "i",
    Ş: "s",
    ş: "s",
    Ğ: "g",
    ğ: "g",
    Ü: "u",
    ü: "u",
    Ö: "o",
    ö: "o",
    Ç: "c",
    ç: "c",
  };
  return String(s)
    .replace(/[İIıŞşĞğÜüÖöÇç]/g, (m) => map[m] || m)
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

const TR_TO_EN_HINTS = [
  // Main Expenses
  {
    tr: [
      "temel gider",
      "temel harcama",
      "fatura",
      "elektrik",
      "su",
      "doğalgaz",
      "internet",
      "telefon",
      "kira",
      "aidat",
      "vergiler",
      "sigorta",
    ],
    en: "Main Expenses",
  },

  // Products (genel alışveriş/market/ürünler)
  {
    tr: [
      "market",
      "alışveriş",
      "bakkal",
      "migros",
      "carrefour",
      "gıda",
      "kırtasiye",
      "elektronik",
      "mağaza",
      "ürün",
      "ürünler",
    ],
    en: "Products",
  },

  // Car
  {
    tr: [
      "araba",
      "oto",
      "otomobil",
      "araç",
      "yakıt",
      "benzin",
      "motorin",
      "dizel",
      "otopark",
      "tamir",
      "bakım",
      "kasko",
      "trafik sigortası",
      "lastik",
    ],
    en: "Car",
  },

  // Self Care
  {
    tr: [
      "kişisel bakım",
      "bakım",
      "kozmetik",
      "kuaför",
      "berber",
      "cilt bakımı",
      "makyaj",
      "spa",
      "parfüm",
      "deodorant",
      "kişisel hijyen",
    ],
    en: "Self Care",
  },

  // Child Care
  {
    tr: [
      "çocuk",
      "bebek",
      "kreş",
      "anaokulu",
      "okul servisi",
      "oyuncak",
      "bez",
      "mama",
      "süt tozu",
      "çocuk bakımı",
    ],
    en: "Child Care",
  },

  // Household Products
  {
    tr: [
      "ev ürünleri",
      "temizlik malzemeleri",
      "deterjan",
      "çamaşır suyu",
      "kağıt havlu",
      "tuvalet kağıdı",
      "mutfak sarf",
      "ev eşyası",
    ],
    en: "Household Products",
  },

  // Education
  {
    tr: [
      "eğitim",
      "kurs",
      "okul",
      "üniversite",
      "ders",
      "kitap",
      "kırtasiye",
      "seminer",
      "sınav",
      "özel ders",
    ],
    en: "Education",
  },

  // Leisure
  {
    tr: [
      "hobi",
      "boş zaman",
      "gezi",
      "tatil",
      "seyahat",
      "spor",
      "kamp",
      "etkinlik",
      "aktivite",
    ],
    en: "Leisure",
  },

  // Other expenses
  {
    tr: ["diğer", "misc", "genel", "çeşitli"],
    en: "Other expenses",
  },

  // Entertainment
  {
    tr: [
      "eğlence",
      "sinema",
      "oyun",
      "netflix",
      "spotify",
      "konser",
      "tiyatro",
      "bar",
      "gece hayatı",
    ],
    en: "Entertainment",
  },
];

export function hintEnglishCategoryName(trCategory) {
  const n = normalizeTR(trCategory);
  for (const row of TR_TO_EN_HINTS) {
    for (const syn of row.tr) {
      if (n.includes(normalizeTR(syn))) return row.en;
    }
  }
  return null;
}
