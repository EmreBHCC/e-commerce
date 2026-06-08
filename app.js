/* ShopX – app.js */

// ── STATE ──────────────────────────────────────────────────
const State = {
  gender: null, budget: null, budgetLabel: '',
  cart: [], favorites: [], logs: [],
  logFilter: 'all', logOpen: false, logFilterOpen: false,
  currentBannerSlide: 0, bannerTotal: 0,
  bannerInterval: null, countdownInterval: null,
  countdownSecs: 3 * 3600 + 24 * 60,
  sessionStart: Date.now(),
  modalProduct: null, modalQty: 1,
  checkoutStep: 1, selectedPayment: 'card',
  currentCategoryProducts: [], currentCategoryTitle: '',
  flashPopupInterval: null, flashPopupTimer: null, flashPopupSecs: 0,
  logoClickCount: 0, logoClickTimer: null,
  searchTimeout: null, helpCurrentTab: 'faq',
  // Finansal profil
  salary: 0, monthlyCredit: 0, monthlyDebt: 0, creditLimit: 0,
  // Bütçe seçim geçici state
  _pendingBudget: null, _pendingBudgetLabel: '',
  // Teslimat bilgileri (ödeme adımında kart adı için)
  deliveryName: '',
  // Amaç bildirisi
  pendingCartId: null, pendingCartQty: 1, pendingFromModal: false,
  // Yeni özellikler
  couponCode: null,
  membership: 'bronze',
  giftBalance: 150,
  giftApplied: 0,
  compareList: [],
};

// ── DATA ──────────────────────────────────────────────────
// Not: products dizileri yedek olarak tutulur.
// Gerçek ürünler DummyJSON API'den çekilir (PRODUCTS_CACHE).
// nav, categories, banners, promos burada tanımlıdır —
// category id'leri DUMMYJSON_CAT_MAP ile tam eşleşmeli.
const DATA = {
  female: {
    // ── NAV ──
    // DummyJSON'dan gelen female kategorileri:
    //   elbise (womens-dresses + tops)
    //   ayakkabi (womens-shoes)
    //   canta (womens-bags)
    //   makyaj (beauty)
    //   cilt (skin-care)
    //   parfum (fragrances)
    //   taki (womens-jewellery + womens-watches + sunglasses)
    //   spor (sports-accessories)
    nav: [
      { label: 'Tümü',              cat: 'tumu' },
      { label: 'Elbise & Üstler',   cat: 'elbise' },
      { label: 'Ayakkabı',          cat: 'ayakkabi' },
      { label: 'Çanta',             cat: 'canta' },
      { label: 'Makyaj',            cat: 'makyaj' },
      { label: 'Cilt Bakımı',       cat: 'cilt' },
      { label: 'Parfüm',            cat: 'parfum' },
      { label: 'Takı & Aksesuar',   cat: 'taki' },
      { label: 'Spor',              cat: 'spor' },
      { label: '🔥 İndirim',        cat: 'indirim', sale: true },
    ],
    // ── KATEGORİ DAİRELERİ ──
    categories: [
      { icon: '👗', label: 'Elbise',        id: 'elbise'   },
      { icon: '👠', label: 'Ayakkabı',      id: 'ayakkabi' },
      { icon: '👜', label: 'Çanta',         id: 'canta'    },
      { icon: '💄', label: 'Makyaj',        id: 'makyaj'   },
      { icon: '🧴', label: 'Cilt Bakımı',   id: 'cilt'     },
      { icon: '🌸', label: 'Parfüm',        id: 'parfum'   },
      { icon: '💍', label: 'Takı',          id: 'taki'     },
      { icon: '🏃‍♀️', label: 'Spor',       id: 'spor'     },
    ],
    // ── BANNER ──
    banners: [
      { bg: 'linear-gradient(135deg,#6a0735 0%,#c2187a 50%,#ff9ec6 100%)', label: 'YENİ SEZON 2026',   title: 'İlkbahar<br>Koleksiyonu',     sub: 'Elbise, üstler ve daha fazlası',  cta: 'Keşfet',          emoji: '👗', cat: 'elbise'   },
      { bg: 'linear-gradient(135deg,#0d47a1 0%,#7b1fa2 50%,#e91e8c 100%)', label: 'AKSESUAR FIRSATLARI', title: 'Çanta & Takı<br>Koleksiyonu', sub: 'Büyük indirimler sizi bekliyor', cta: 'Alışverişe Başla', emoji: '👜', cat: 'canta'    },
      { bg: 'linear-gradient(135deg,#1b5e20 0%,#388e3c 50%,#a5d6a7 100%)', label: 'GÜZELLİK DÜNYASI',  title: 'Premium<br>Cilt Bakımı',      sub: 'Dünyaca ünlü markalar burada',    cta: 'Ürünlere Bak',    emoji: '🧴', cat: 'cilt'     },
    ],
    // ── PROMO ──
    promos: [
      { bg: 'linear-gradient(135deg,#880e4f,#c2187a)',  title: 'Yeni Elbiseler',      desc: 'Bu sezonun en trend modelleri', cat: 'elbise'   },
      { bg: 'linear-gradient(135deg,#4a148c,#7b1fa2)',  title: 'Güzellik Fırsatları', desc: 'Makyaj ve cilt bakımında büyük indirim', cat: 'makyaj'   },
      { bg: 'linear-gradient(135deg,#bf360c,#e64a19)',  title: 'Takı & Aksesuar',    desc: 'Çanta, takı ve gözlük kampanyaları', cat: 'taki'     },
    ],
    // ── YEDEK ÜRÜNLER (DummyJSON çalışmazsa kullanılır) ──
    products: [
      { id: 'f1',  name: 'Çiçekli Midi Elbise',       brand: 'Zara',         price: 649,  oldPrice: 1099, img: '👗', badge: 'sale', rating: 4.7, reviews: 342,  desc: 'Şık çiçek baskısı, body-fit kesim, %100 viskon.',        cat: 'elbise'   },
      { id: 'f2',  name: 'Deri Makyaj Çantası',        brand: 'Aldo',         price: 289,  oldPrice: 459,  img: '👜', badge: 'hot',  rating: 4.5, reviews: 217,  desc: 'İtalyan deri görünümlü, altın aplike detaylı.',           cat: 'canta'    },
      { id: 'f3',  name: 'Mat Ruj Seti 8\'li',         brand: 'MAC',          price: 435,  oldPrice: null, img: '💄', badge: 'new',  rating: 4.9, reviews: 891,  desc: '8 farklı sezon tonu, uzun kalıcılıklı, vegan formula.',   cat: 'makyaj'   },
      { id: 'f4',  name: 'Yüksek Topuklu Sandalet',    brand: 'Steve Madden', price: 879,  oldPrice: 1249, img: '👠', badge: 'sale', rating: 4.3, reviews: 156,  desc: 'Şık bilek askılı, 9 cm topuklu sandalet.',               cat: 'ayakkabi' },
      { id: 'f5',  name: 'Hyaluronik Asit Serum',      brand: 'CeraVe',       price: 299,  oldPrice: 399,  img: '🧴', badge: null,   rating: 4.8, reviews: 1243, desc: 'Yoğun nemlendirici, dermatoloji onaylı.',                 cat: 'cilt'     },
      { id: 'f6',  name: 'Altın Kaplama Kolye Set',    brand: 'Giulio',       price: 524,  oldPrice: 780,  img: '💍', badge: 'sale', rating: 4.6, reviews: 489,  desc: '3\'lü kolye set, 18 ayar altın kaplama.',                cat: 'taki'     },
      { id: 'f7',  name: 'Yoga Tayt Seti',             brand: 'Nike',         price: 749,  oldPrice: 999,  img: '🏃‍♀️', badge: 'hot', rating: 4.7, reviews: 672, desc: 'Dri-FIT teknolojili, yüksek bel.',                      cat: 'spor'     },
      { id: 'f8',  name: 'Retinol Gece Kremi',         brand: 'L\'Oréal',     price: 189,  oldPrice: 259,  img: '🧴', badge: null,   rating: 4.5, reviews: 321,  desc: 'Gece boyunca kırışıklık azaltıcı, cilt yenileyici.',     cat: 'cilt'     },
      { id: 'f9',  name: 'Platform Spor Ayakkabı',     brand: 'Adidas',       price: 1299, oldPrice: 1699, img: '👠', badge: 'sale', rating: 4.8, reviews: 543,  desc: 'Ultra Boost taban, platform tasarım.',                    cat: 'ayakkabi' },
      { id: 'f10', name: 'Çiçek Parfümü Kadın 100ml',  brand: 'Chanel',       price: 1890, oldPrice: 2490, img: '🌸', badge: 'sale', rating: 4.9, reviews: 1102, desc: 'Çiçeksi notalar, uzun kalıcılık, şık şişe.',              cat: 'parfum'   },
    ],
  },

  male: {
    // ── NAV ──
    // DummyJSON'dan gelen male kategorileri:
    //   gomlek (mens-shirts + tops)
    //   spor-ayak (mens-shoes)
    //   saat (mens-watches + sunglasses)
    //   telefon (smartphones)
    //   gaming (laptops + mobile-accessories + tablets)
    //   outdoor (sports-accessories)
    nav: [
      { label: 'Tümü',                cat: 'tumu' },
      { label: 'Gömlek & Üstler',     cat: 'gomlek'   },
      { label: 'Ayakkabı',            cat: 'spor-ayak'},
      { label: 'Saat & Güneş Gözlüğü', cat: 'saat'   },
      { label: 'Akıllı Telefonlar',   cat: 'telefon'  },
      { label: 'Gaming & Laptop',     cat: 'gaming'   },
      { label: 'Tablet',              cat: 'tablet'   },
      { label: 'Outdoor & Spor',      cat: 'outdoor'  },
      { label: '🔥 Kampanyalar',      cat: 'kampanya', sale: true },
    ],
    // ── KATEGORİ DAİRELERİ ──
    categories: [
      { icon: '👕', label: 'Gömlek & Üstler',    id: 'gomlek'    },
      { icon: '👟', label: 'Ayakkabı',            id: 'spor-ayak' },
      { icon: '⌚', label: 'Saat & Aksesuar',     id: 'saat'      },
      { icon: '📱', label: 'Akıllı Telefonlar',   id: 'telefon'   },
      { icon: '🎮', label: 'Gaming & Laptop',     id: 'gaming'    },
      { icon: '📟', label: 'Tablet',              id: 'tablet'    },
      { icon: '🏕️', label: 'Outdoor & Spor',     id: 'outdoor'   },
      { icon: '😎', label: 'Güneş Gözlüğü',      id: 'gozluk'    },
    ],
    // ── BANNER ──
    banners: [
      { bg: 'linear-gradient(135deg,#0a1f4e 0%,#1565c0 50%,#039be5 100%)', label: 'YENİ SEZON 2026',  title: 'Erkek<br>Koleksiyonu',       sub: 'Gömlek, üstler ve daha fazlası',  cta: 'Keşfet',          emoji: '👕', cat: 'gomlek'    },
      { bg: 'linear-gradient(135deg,#1a237e 0%,#283593 50%,#1976d2 100%)', label: 'TEKNOLOJİ FIRSATI', title: 'Telefon &<br>Gaming Dünyası', sub: 'En iyi donanımlar burada',        cta: 'Mağazaya Git',    emoji: '📱', cat: 'telefon'   },
      { bg: 'linear-gradient(135deg,#1b1b2e 0%,#004d40 50%,#00695c 100%)', label: 'OUTDOOR SEZONU',   title: 'Spor &<br>Outdoor Ekipmanları', sub: 'Profesyonel outdoor markaları', cta: 'İncele',          emoji: '🏕️', cat: 'outdoor'  },
    ],
    // ── PROMO ──
    promos: [
      { bg: 'linear-gradient(135deg,#1a237e,#1565c0)',  title: 'Gaming & Laptop',   desc: 'Donanımda büyük fırsatlar',      cat: 'gaming'    },
      { bg: 'linear-gradient(135deg,#263238,#37474f)',  title: 'Akıllı Telefonlar', desc: 'En yeni modeller, en iyi fiyat', cat: 'telefon'   },
      { bg: 'linear-gradient(135deg,#004d40,#00695c)',  title: 'Outdoor & Spor',    desc: 'Yeni sezon ekipmanları',         cat: 'outdoor'   },
    ],
    // ── YEDEK ÜRÜNLER ──
    products: [
      { id: 'm1',  name: 'Slim Fit Denim Pantolon',     brand: 'Levi\'s',   price: 799,  oldPrice: 1099, img: '👖', badge: 'sale', rating: 4.8, reviews: 1023, desc: 'Slim fit, stretch denim, 5 cep model.',              cat: 'gomlek'    },
      { id: 'm2',  name: 'Gaming Kulaklık 7.1',         brand: 'Razer',     price: 1599, oldPrice: 2199, img: '🎧', badge: 'hot',  rating: 4.9, reviews: 756,  desc: 'USB 7.1 surround, RGB aydınlatma.',                  cat: 'gaming'    },
      { id: 'm3',  name: 'Akıllı Spor Saat',            brand: 'Garmin',    price: 3299, oldPrice: 4199, img: '⌚', badge: 'new',  rating: 4.7, reviews: 432,  desc: 'GPS, kalp atışı sensörü, 14 gün pil.',              cat: 'saat'      },
      { id: 'm4',  name: 'Air Jordan Retro High',       brand: 'Nike',      price: 2499, oldPrice: 3299, img: '👟', badge: 'sale', rating: 4.9, reviews: 2312, desc: 'Orijinal renk blokajı, gerçek deri.',                cat: 'spor-ayak' },
      { id: 'm5',  name: 'Mekanik Oyun Klavyesi',       brand: 'Corsair',   price: 2199, oldPrice: null, img: '⌨️', badge: 'hot',  rating: 4.8, reviews: 891,  desc: 'Cherry MX Red, RGB, alüminyum gövde.',              cat: 'gaming'    },
      { id: 'm6',  name: 'Oversize Kapüşon Sweat',      brand: 'Champion',  price: 549,  oldPrice: 799,  img: '👕', badge: null,   rating: 4.6, reviews: 654,  desc: 'Oversize kalıp, fleece iç yüzey.',                  cat: 'gomlek'    },
      { id: 'm7',  name: 'Pro Gaming Mouse',            brand: 'Logitech',  price: 899,  oldPrice: 1199, img: '🖱️', badge: 'sale', rating: 4.9, reviews: 1456, desc: 'HERO 25K sensör, 25600 DPI, şarj edilebilir.',      cat: 'gaming'    },
      { id: 'm8',  name: 'Akıllı Tablet 10"',           brand: 'Samsung',   price: 5490, oldPrice: 6990, img: '📟', badge: 'sale', rating: 4.7, reviews: 831,  desc: '10 inç AMOLED, 256GB, kalem destekli.',             cat: 'tablet'    },
      { id: 'm9',  name: 'Kablosuz Kulaklık NC',        brand: 'Sony',      price: 4299, oldPrice: 5499, img: '🎵', badge: 'sale', rating: 4.9, reviews: 3241, desc: 'WH-1000XM5, aktif gürültü engelleme, 30 saat pil.', cat: 'gaming'    },
      { id: 'm10', name: 'Running Pro Spor Ayakkabı',   brand: 'Adidas',    price: 1699, oldPrice: 2199, img: '🏃', badge: 'new',  rating: 4.8, reviews: 876,  desc: 'Ultraboost 23, karbon plaka, maraton optimize.',    cat: 'spor-ayak' },
    ],
  },
};

// Budget price limits
const BUDGET_LIMITS = { low: [0, 500], medium: [500, 1500], high: [1500, 3500], luxury: [3500, 99999], any: [0, 99999] };

// ── DİNAMİK KARGO EŞİĞİ ──────────────────────────────────
function calcFreeShipThreshold() {
  const products = getProducts(State.gender);
  if (!products || products.length === 0) return 150;
  const avg = products.reduce((s, p) => s + p.price, 0) / products.length;
  // Ortalama fiyatın ~%80'i, 100 TL'nin katlarına yuvarlanır
  return Math.max(150, Math.round(avg * 0.8 / 100) * 100);
}

function calcShippingCost() {
  const products = getProducts(State.gender);
  if (!products || products.length === 0) return 29.90;
  const avg = products.reduce((s, p) => s + p.price, 0) / products.length;
  // Ortalama fiyatın ~%2.5'i, 5 TL'nin katlarına yuvarlanır (15–99 TL arası)
  return Math.min(99, Math.max(15, Math.round(avg * 0.025 / 5) * 5));
}

function updateShippingTopbar() {
  const el = document.getElementById('topbar-ship-text');
  if (!el) return;
  const threshold = calcFreeShipThreshold();
  const cost = calcShippingCost();
  el.textContent = `🚚 ${threshold.toLocaleString('tr-TR')} TL üzeri ücretsiz kargo (altı ${cost} TL)`;
}

// ── ÜYELİK SEVİYELERİ ────────────────────────────────────
const MEMBERSHIPS = {
  bronze:   { label: 'Bronz',  icon: '🥉', discount: 0,  freeShipping: false, cls: 'mem-bronze'   },
  silver:   { label: 'Gümüş', icon: '🥈', discount: 5,  freeShipping: false, cls: 'mem-silver'   },
  gold:     { label: 'Altın',  icon: '🥇', discount: 10, freeShipping: true,  cls: 'mem-gold'     },
  platinum: { label: 'Platin', icon: '💎', discount: 15, freeShipping: true,  cls: 'mem-platinum' },
};

// ── KUPON KODLARI ─────────────────────────────────────────
const COUPONS = {
  'SHOPX10':   { type: 'percent',  value: 10, label: '%10 İndirim Kuponu'         },
  'ILKALIS20': { type: 'percent',  value: 20, label: '%20 İlk Alışveriş İndirimi' },
  'KARGO':     { type: 'shipping', value: 0,  label: 'Ücretsiz Kargo'             },
  'HEDIYE50':  { type: 'fixed',    value: 50, label: '50 TL Hediye İndirimi'      },
  'SHOPX5':    { type: 'percent',  value: 5,  label: '%5 Ek İndirim'              },
};

// ── HARCAMA KADEMELERİ ────────────────────────────────────
const SPEND_TIERS = [
  { min: 500,  discount: 3,  freeShipping: false, label: '%3 indirim'                   },
  { min: 1000, discount: 5,  freeShipping: false, label: '%5 indirim'                   },
  { min: 2000, discount: 8,  freeShipping: true,  label: '%8 indirim + ücretsiz kargo'  },
  { min: 3000, discount: 10, freeShipping: true,  label: '%10 indirim + ücretsiz kargo' },
];

// ── GÖRSEL YARDIMCISI ────────────────────────────────────
// URL ise <img>, değilse emoji span döndürür.
// emojiSize: emoji için font-size (ör. '2rem')
function renderImg(img, alt, emojiSize) {
  if (img && (img.startsWith('http') || img.startsWith('/'))) {
    return `<img src="${img}" alt="${alt || ''}" style="width:100%;height:100%;object-fit:cover;border-radius:inherit;" loading="lazy" onerror="this.replaceWith(Object.assign(document.createElement('span'),{textContent:'🛍',style:'font-size:${emojiSize||'2rem'};display:flex;align-items:center;justify-content:center;width:100%;height:100%;'}))">`;
  }
  return `<span style="font-size:${emojiSize||'2rem'};display:flex;align-items:center;justify-content:center;width:100%;height:100%;">${img || '🛍'}</span>`;
}

// ── DUMMYJSON ENTEGRASYONU ────────────────────────────────

// DummyJSON kategori → uygulama içi kategori eşlemesi
// Female ve male ayrı eşlemeler — aynı DummyJSON kategorisi farklı iç kategorilere gidebilir
const DUMMYJSON_CAT_MAP = {
  female: {
    'womens-dresses':    'elbise',
    'tops':              'elbise',
    'womens-shoes':      'ayakkabi',
    'womens-bags':       'canta',
    'beauty':            'makyaj',
    'skin-care':         'cilt',
    'fragrances':        'parfum',   // nav ve category id ile eşleşmeli
    'womens-jewellery':  'taki',
    'womens-watches':    'taki',
    'sports-accessories':'spor',
    'sunglasses':        'taki',
  },
  male: {
    'mens-shirts':       'gomlek',
    'mens-shoes':        'spor-ayak',
    'mens-watches':      'saat',
    'sunglasses':        'gozluk',
    'smartphones':       'telefon',
    'laptops':           'gaming',
    'mobile-accessories':'gaming',
    'tablets':           'tablet',
    'sports-accessories':'outdoor',
  },
};

// Kadın için çekilecek DummyJSON kategorileri
// (DUMMYJSON_CAT_MAP.female ile tam örtüşmeli)
const FEMALE_CATS = [
  'womens-dresses', 'tops',
  'womens-shoes',
  'womens-bags',
  'beauty',
  'skin-care',
  'fragrances',
  'womens-jewellery', 'womens-watches',
  'sports-accessories',
  'sunglasses',
];

// Erkek için çekilecek DummyJSON kategorileri
// (DUMMYJSON_CAT_MAP.male ile tam örtüşmeli)
const MALE_CATS = [
  'mens-shirts',
  'mens-shoes',
  'mens-watches', 'sunglasses',
  'smartphones',
  'laptops', 'mobile-accessories',
  'tablets',
  'sports-accessories',
];

const USD_TO_TRY = 38; // 1 USD ≈ 38 TL

// DummyJSON ürününü uygulama formatına dönüştür
function transformDJProduct(p, gender) {
  const catMap = DUMMYJSON_CAT_MAP[gender];
  const cat = catMap[p.category] || (gender === 'female' ? 'elbise' : 'gomlek');

  // Fiyatı TL'ye çevir, 10'a yuvarla
  const price = Math.round((p.price * USD_TO_TRY) / 10) * 10;

  // İndirimli ürünlerde orijinal fiyatı hesapla
  let oldPrice = null;
  if (p.discountPercentage && p.discountPercentage > 4) {
    oldPrice = Math.round((price / (1 - p.discountPercentage / 100)) / 10) * 10;
  }

  // Badge belirle
  let badge = null;
  if (p.discountPercentage >= 20)    badge = 'sale';
  else if (p.stock <= 20)            badge = 'hot';
  else if (p.id % 7 === 0)           badge = 'new';

  // Gerçekçi görünen yorum sayısı
  const reviews = (p.reviews && p.reviews.length > 0)
    ? p.reviews.length * 47 + p.stock * 11
    : p.stock * 23 + 80;

  return {
    id:       `dj_${p.id}`,
    name:     p.title,
    brand:    p.brand || 'ShopX',
    price,
    oldPrice,
    img:      p.thumbnail,   // Artık emoji değil, gerçek URL
    badge,
    rating:   Math.round(p.rating * 10) / 10,
    reviews,
    desc:     p.description,
    cat,
  };
}

// Ürün önbelleği – bir kez çek, her seferinde yeniden istek atma
const PRODUCTS_CACHE = { female: null, male: null };

// Belirli bir cinsiyet için DummyJSON'dan ürün çek
async function fetchDJProducts(gender) {
  if (PRODUCTS_CACHE[gender]) return PRODUCTS_CACHE[gender];  // Önbellekten dön

  const cats = gender === 'female' ? FEMALE_CATS : MALE_CATS;

  showProductsSkeleton();  // Yükleniyor göstergesi

  try {
    // Tüm kategorileri paralel olarak çek
    const results = await Promise.all(
      cats.map(cat =>
        fetch(`https://dummyjson.com/products/category/${cat}?limit=12&select=id,title,description,price,discountPercentage,rating,stock,brand,category,thumbnail,reviews`)
          .then(r => r.ok ? r.json() : { products: [] })
          .then(d => d.products || [])
          .catch(() => [])
      )
    );

    // Düzleştir ve dönüştür
    const all = results.flat().map(p => transformDJProduct(p, gender));

    // Tekrarları temizle (id bazında)
    const seen = new Set();
    const unique = all.filter(p => { if (seen.has(p.id)) return false; seen.add(p.id); return true; });

    PRODUCTS_CACHE[gender] = unique;
    logAction(`DummyJSON: ${unique.length} ürün yüklendi (${gender})`, 'system');
    return unique;

  } catch (err) {
    logAction(`DummyJSON hatası: ${err.message} — yerel veri kullanılıyor`, 'system');
    return DATA[gender].products;  // Hata olursa yerel veriye dön
  }
}

// Bir cinsiyet için aktif ürün listesini döndür (önbellek veya yerel)
function getProducts(gender) {
  return PRODUCTS_CACHE[gender] || DATA[gender].products;
}

// ── SKELETON LOADER ───────────────────────────────────────
function showProductsSkeleton() {
  const skeletonCard = `
    <div class="product-card skeleton-card">
      <div class="product-img-wrap skeleton-box" style="aspect-ratio:1"></div>
      <div class="product-body" style="gap:8px;display:flex;flex-direction:column">
        <div class="skeleton-box" style="height:10px;width:50%;border-radius:4px"></div>
        <div class="skeleton-box" style="height:13px;width:90%;border-radius:4px"></div>
        <div class="skeleton-box" style="height:13px;width:70%;border-radius:4px"></div>
        <div class="skeleton-box" style="height:18px;width:55%;border-radius:4px;margin-top:4px"></div>
      </div>
    </div>`;
  ['flash-products-grid','recommended-products-grid','more-products-grid'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.innerHTML = Array(5).fill(skeletonCard).join('');
  });
}

function hideProductsSkeleton() {
  document.querySelectorAll('.skeleton-card').forEach(el => el.remove());
}

// ── SOCKET.IO BAĞLANTISI ─────────────────────────────────
const socket = io();

socket.on('connect', () => {
  socket.emit('identify', { role: 'shop' });
  console.log('[ShopX] Sunucuya bağlanıldı');
});

socket.on('disconnect', () => {
  console.log('[ShopX] Sunucu bağlantısı kesildi');
});

// Admin panelinden oturum durumu bildirimi
socket.on('session_status', (data) => {
  _showNoSessionWarning(!data?.active);
});

// Admin panelinden gelen uzak komutları dinle
socket.on('command', (data) => {
  const { cmd } = data;
  switch (cmd) {
    case 'SHOW_FLASH_POPUP':   showFlashPopup(); break;
    case 'CLOSE_FLASH_POPUP':  closeFlashPopup(); break;
    case 'SIMULATE_OFFLINE':   _showOfflineOverlay(true); break;
    case 'SIMULATE_ONLINE':    _showOfflineOverlay(false); break;
    case 'BANNER_PREV':        slideBanner(-1); break;
    case 'BANNER_NEXT':        slideBanner(1); break;
    case 'BANNER_SLIDE_0':     goToSlide(0); break;
    case 'BANNER_SLIDE_1':     goToSlide(1); break;
    case 'BANNER_SLIDE_2':     goToSlide(2); break;
    case 'GO_HOME':            goHome(); break;
    case 'OPEN_CART':          openCart(); break;
    case 'OPEN_CHECKOUT':      openCheckout(); break;
    case 'OPEN_HELP':          openHelp(); break;
    case 'SCROLL_TO_TOP':      window.scrollTo({ top: 0, behavior: 'smooth' }); break;
    case 'SHOW_TOAST':
      showToast(data.msg || '📢 Mesaj', data.toastType || 'info');
      break;
    case 'SHOW_CUSTOM_POPUP':
      _showCustomAdminPopup(data.title, data.body);
      break;
    case 'SESSION_STARTED':
      _showNoSessionWarning(false);
      logAction(`Oturum başlatıldı: "${data.name || ''}"`, 'system');
      etShowCalibration();
      break;
    case 'SESSION_STOPPED':
      resetToInitial();
      break;
    default: break;
  }
  socket.emit('ack', { cmd });
});

// Canlılık sinyali – 3 saniyede bir
setInterval(() => socket.emit('heartbeat'), 3000);

// ── EYE-TRACKER KALİBRASYON ──────────────────────────
// Aktif dot indeksleri: dot-3 ve dot-5 kaldırıldı
const ET_DOT_IDS    = [4, 0, 1, 2, 6, 7, 8]; // tıklama SIRASI: önce merkez
const ET_TOTAL      = ET_DOT_IDS.length;       // 7
const _etClicks     = {};                       // {idx: clickCount}
const ET_CLICKS_NEEDED = 5;
let _etCountdownTimer = null;

function etShowCalibration() {
  ET_DOT_IDS.forEach(i => {
    _etClicks[i] = 0;
    const dot = document.getElementById('et-dot-' + i);
    if (!dot) return;
    dot.classList.remove('et-dot-done', 'et-dot-active');
    dot.textContent = '';
    if (i === 4) {
      dot.classList.remove('et-dot-locked');
      dot.classList.add('et-dot-center');
      dot.style.pointerEvents = 'auto';
      dot.textContent = ET_CLICKS_NEEDED;
    } else {
      dot.classList.add('et-dot-locked');
      dot.style.pointerEvents = 'none';
    }
  });

  const doneEl = document.getElementById('et-calib-done');
  if (doneEl) doneEl.textContent = '0';

  document.getElementById('et-countdown-screen').style.display = 'block';
  document.getElementById('et-dot-screen').style.display = 'none';
  document.getElementById('et-calib-overlay').style.display = 'block';

  let secs = 3;
  const numEl = document.getElementById('et-cd-num');
  if (numEl) numEl.textContent = secs;

  if (_etCountdownTimer) clearInterval(_etCountdownTimer);
  _etCountdownTimer = setInterval(() => {
    secs--;
    if (secs > 0) {
      if (numEl) numEl.textContent = secs;
    } else {
      clearInterval(_etCountdownTimer);
      _etCountdownTimer = null;
      _etUnlockDots();
    }
  }, 1000);
}

function _etUnlockDots() {
  document.getElementById('et-countdown-screen').style.display = 'none';
  document.getElementById('et-dot-screen').style.display = 'block';
  ET_DOT_IDS.forEach(i => {
    const dot = document.getElementById('et-dot-' + i);
    if (!dot) return;
    dot.classList.remove('et-dot-locked');
    dot.style.pointerEvents = 'auto';
    dot.style.opacity = '';
    if (i !== 4) dot.textContent = ET_CLICKS_NEEDED;
  });
}

function etDotClick(idx) {
  if (!ET_DOT_IDS.includes(idx)) return;
  if ((_etClicks[idx] || 0) >= ET_CLICKS_NEEDED) return;
  const dot = document.getElementById('et-dot-' + idx);
  if (!dot || dot.classList.contains('et-dot-locked')) return;
  dot.classList.remove('et-dot-center');
  _etClicks[idx] = (_etClicks[idx] || 0) + 1;

  dot.classList.add('et-dot-active');
  setTimeout(() => dot.classList.remove('et-dot-active'), 400);

  if (_etClicks[idx] >= ET_CLICKS_NEEDED) {
    dot.textContent = '';
    dot.classList.add('et-dot-done');
    const done = ET_DOT_IDS.filter(i => (_etClicks[i] || 0) >= ET_CLICKS_NEEDED).length;
    const doneEl = document.getElementById('et-calib-done');
    if (doneEl) doneEl.textContent = done;

    // Merkez tamamlandı → offset kalibrasyonu tetikle
    if (idx === 4) socket.emit('calibration_complete', { centerOnly: true });

    if (done === ET_TOTAL) setTimeout(etFinishCalibration, 600);
  } else {
    dot.textContent = ET_CLICKS_NEEDED - _etClicks[idx];
  }
}

function etFinishCalibration() {
  document.getElementById('et-calib-overlay').style.display = 'none';
  socket.emit('calibration_complete', {});
  logAction('Eye-tracker kalibrasyonu tamamlandı', 'system');
}

// ── TARAYICI GAZE CURSOR ─────────────────────────────
(function () {
  let _gc = null;

  function _getGazeCursor() {
    if (!_gc) {
      _gc = document.createElement('div');
      _gc.id = 'browser-gaze-cursor';
      _gc.style.cssText = [
        'position:fixed',
        'width:36px',
        'height:36px',
        'border-radius:50%',
        'border:3px solid cyan',
        'background:rgba(255,0,0,0.25)',
        'pointer-events:none',
        'z-index:2147483647',
        'transform:translate(-50%,-50%)',
        'display:none',
        'transition:left .05s linear,top .05s linear',
      ].join(';');
      document.body.appendChild(_gc);
    }
    return _gc;
  }

  socket.on('gaze_position', function (data) {
    const el = _getGazeCursor();
    // eye-tracker ekran koordinatları → tarayıcı viewport koordinatları
    const winLeft  = window.screenX  ?? window.screenLeft ?? 0;
    const winTop   = window.screenY  ?? window.screenTop  ?? 0;
    const topChrome = window.outerHeight - window.innerHeight; // tab bar + adres çubuğu
    const bx = data.x - winLeft;
    const by = data.y - winTop - topChrome;
    el.style.left    = Math.max(0, bx) + 'px';
    el.style.top     = Math.max(0, by) + 'px';
    el.style.display = 'block';
  });

  // Session bitince gaze cursor gizle
  socket.on('command', function (data) {
    if (data && data.cmd === 'SESSION_STOPPED') {
      const el = document.getElementById('browser-gaze-cursor');
      if (el) el.style.display = 'none';
    }
  });
})();

// ── NO-SESSION WARNING BANNER ─────────────────────────
function _showNoSessionWarning(show) {
  let banner = document.getElementById('no-session-banner');
  if (!banner) {
    banner = document.createElement('div');
    banner.id = 'no-session-banner';
    banner.className = 'no-session-banner';
    banner.innerHTML = `
      <span class="nsb-icon">⚠️</span>
      <span class="nsb-text">Bu oturum <strong>kayıt altına alınmıyor</strong>. Admin panelinden bir oturum başlatın.</span>
      <button class="nsb-close" onclick="document.getElementById('no-session-banner').style.display='none'" title="Kapat">✕</button>
    `;
    document.body.appendChild(banner);
  }
  banner.style.display = show ? 'flex' : 'none';
}

// ── SITE RESET (oturum bittiğinde) ────────────────────
function resetToInitial() {
  // Tüm interval/timer temizle
  clearInterval(State.bannerInterval);
  clearInterval(State.countdownInterval);
  clearInterval(State.flashPopupInterval);
  clearTimeout(State.flashPopupTimer);
  clearTimeout(State.searchTimeout);
  clearTimeout(State.logoClickTimer);

  // State sıfırla
  State.gender = null;
  State.budget = null;
  State.budgetLabel = '';
  State.cart = [];
  State.favorites = [];
  State.logs = [];
  State.currentBannerSlide = 0;
  State.modalProduct = null;
  State.modalQty = 1;
  State.checkoutStep = 1;
  State.pendingCartId = null;
  State.pendingCartQty = 1;
  State.pendingFromModal = false;
  State.sessionStart = Date.now();
  State._pendingBudget = null;
  State._pendingBudgetLabel = '';
  State.deliveryName = '';
  State.salary = 0;
  State.monthlyCredit = 0;
  State.monthlyDebt = 0;
  State.creditLimit = 0;
  State.couponCode = null;
  State.membership = 'bronze';
  State.giftBalance = 150;
  State.giftApplied = 0;
  State.compareList = [];

  // Tüm açık modal/overlay/drawer kapat
  const compareBar = document.getElementById('compare-bar');
  if (compareBar) compareBar.style.display = 'none';
  const memBadge = document.getElementById('mem-badge-header');
  if (memBadge) memBadge.style.display = 'none';
  [
    'product-modal','cart-drawer','fav-drawer','checkout-modal',
    'help-modal','info-modal','purpose-modal','financial-modal',
    'account-modal','budget-filter-modal','order-tracking-modal',
    'flash-popup', 'admin-offline-overlay', 'admin-custom-popup',
    'compare-modal', 'log-panel',
  ].forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    el.classList.remove('open', 'active');
    el.style.display = 'none';
  });

  // Overlay'leri kapat
  document.querySelectorAll('.modal-overlay, .drawer-overlay, .purpose-overlay, #purpose-overlay')
    .forEach(el => el.classList.remove('active'));

  // Body class & overflow sıfırla
  document.body.className = '';
  document.body.style.overflow = '';
  document.getElementById('gender-screen')?.classList.remove('step2-mode');

  // Ürün önbelleğini sıfırla (yeni denek farklı ürünler görsün)
  if (typeof PRODUCTS_CACHE !== 'undefined') {
    PRODUCTS_CACHE.female = null;
    PRODUCTS_CACHE.male = null;
  }

  // Sepet ve favori UI güncelle
  updateCartUI();
  updateFavUI();

  // Cinsiyet ekranını göster
  document.getElementById('gender-step-1').classList.remove('hidden');
  document.getElementById('gender-step-2').classList.add('hidden');

  const ss = document.getElementById('shop-screen');
  ss.style.transition = 'opacity 0.35s ease';
  ss.style.opacity = '0';
  setTimeout(() => {
    ss.classList.add('hidden');
    ss.style.opacity = '';
    ss.style.transition = '';

    const gs = document.getElementById('gender-screen');
    gs.classList.remove('hidden');
    gs.style.opacity = '0';
    gs.style.transform = 'scale(0.96)';
    setTimeout(() => {
      gs.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
      gs.style.opacity = '1';
      gs.style.transform = 'scale(1)';
    }, 20);
  }, 350);

  // Uyarı bannerini göster
  _showNoSessionWarning(true);

  logAction('Site sıfırlandı – yeni denek için hazır', 'system');
}

// ── OFFLINE OVERLAY ───────────────────────────────────
function _showOfflineOverlay(show) {
  let overlay = document.getElementById('admin-offline-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'admin-offline-overlay';
    overlay.style.cssText = [
      'position:fixed','inset:0','z-index:99999',
      'background:rgba(10,14,30,0.97)',
      'display:flex','flex-direction:column',
      'align-items:center','justify-content:center',
      'font-family:Inter,sans-serif','text-align:center',
      'color:#e2e8f0','gap:16px','padding:24px',
    ].join(';');
    overlay.innerHTML = `
      <div style="font-size:4rem">📵</div>
      <div style="font-size:1.4rem;font-weight:800">İnternet Bağlantısı Kesildi</div>
      <div style="font-size:.9rem;color:#94a3b8;max-width:320px;line-height:1.5">
        Bağlantınızı kontrol edip tekrar deneyin.
      </div>
      <div style="margin-top:8px;width:48px;height:48px;border:4px solid #6366f1;border-top-color:transparent;border-radius:50%;animation:spin 1s linear infinite"></div>
    `;
    const style = document.createElement('style');
    style.textContent = '@keyframes spin{to{transform:rotate(360deg)}}';
    document.head.appendChild(style);
    document.body.appendChild(overlay);
  }
  overlay.style.display = show ? 'flex' : 'none';
  if (show) logAction('⚠️ Simüle: İnternet bağlantısı kesildi', 'system');
  else logAction('✅ Simüle: İnternet bağlantısı geri geldi', 'system');
}

// ── CUSTOM ADMIN POPUP ────────────────────────────────
function _showCustomAdminPopup(title, body) {
  let popup = document.getElementById('admin-custom-popup');
  if (!popup) {
    popup = document.createElement('div');
    popup.id = 'admin-custom-popup';
    popup.style.cssText = [
      'position:fixed','inset:0','z-index:99998',
      'background:rgba(0,0,0,0.75)',
      'display:flex','align-items:center','justify-content:center',
      'padding:24px','font-family:Inter,sans-serif',
    ].join(';');
    document.body.appendChild(popup);
  }
  popup.innerHTML = `
    <div style="background:#1c2540;border:1px solid rgba(99,102,241,.4);border-radius:16px;padding:28px 32px;max-width:420px;width:100%;text-align:center;box-shadow:0 0 40px rgba(99,102,241,.3)">
      <div style="font-size:2.2rem;margin-bottom:12px">📢</div>
      <h2 style="color:#e2e8f0;font-size:1.25rem;font-weight:800;margin-bottom:10px">${title || ''}</h2>
      <p style="color:#94a3b8;font-size:.9rem;line-height:1.6;margin-bottom:20px">${body || ''}</p>
      <button onclick="document.getElementById('admin-custom-popup').style.display='none'" style="padding:10px 24px;background:#6366f1;color:#fff;border:none;border-radius:8px;font-weight:700;font-size:.9rem;cursor:pointer;font-family:inherit">Tamam</button>
    </div>`;
  popup.style.display = 'flex';
  logAction(`Admin popup gösterildi: ${title}`, 'system');
}

// ── LOGGER ────────────────────────────────────────────────
function getLogType(msg) {
  const m = msg.toLowerCase();
  if (m.includes('sepet') || m.includes('ödeme') || m.includes('cart')) return 'cart';
  if (m.includes('ürün') || m.includes('favori') || m.includes('product')) return 'product';
  if (m.includes('arama') || m.includes('search') || m.includes('ara')) return 'search';
  if (m.includes('kategori') || m.includes('nav') || m.includes('sayfa') || m.includes('banner') || m.includes('tümü')) return 'navigation';
  if (m.includes('cinsiyet') || m.includes('giriş') || m.includes('gender') || m.includes('seçim') || m.includes('bütçe') || m.includes('sistem')) return 'system';
  return 'ui';
}

function logAction(msg, type) {
  const now = new Date();
  const time = now.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const logType = type || getLogType(msg);
  const entry = { id: Date.now() + '_' + Math.random().toString(36).substr(2, 5), time, timestamp: now.toISOString(), msg, type: logType, gender: State.gender, cartSize: State.cart.reduce((s, i) => s + i.qty, 0) };
  State.logs.unshift(entry);
  renderLogEntry(entry);
  updateLogCount();
  // 📡 Sunucuya gönder → admin'e ilet
  socket.emit('log', entry);
}

function renderLogEntry(entry) {
  const container = document.getElementById('log-entries');
  if (!container) return;
  const shouldHide = State.logFilter !== 'all' && entry.type !== State.logFilter;
  const el = document.createElement('div');
  el.className = `log-entry type-${entry.type}${shouldHide ? ' hidden' : ''}`;
  el.dataset.type = entry.type;
  el.innerHTML = `<span class="log-time">${entry.time}</span><span class="log-type-tag type-tag-${entry.type}">${entry.type}</span><span class="log-msg">${entry.msg}</span>`;
  container.prepend(el);
}

function updateLogCount() {
  const el = document.getElementById('log-total-count');
  if (el) el.textContent = `${State.logs.length} log kaydı`;
}

// ── GENDER SELECTION ──────────────────────────────────────
function selectGender(gender) {
  State.gender = gender;
  logAction(`Cinsiyet seçimi: ${gender === 'female' ? 'Kadın' : 'Erkek'}`, 'system');
  // Logo / tagline / stats'ı gizle — step 2 tüm ekrana sığsın
  document.getElementById('gender-screen').classList.add('step2-mode');
  document.getElementById('gender-step-1').classList.add('hidden');
  document.getElementById('budget-gender-icon').textContent = gender === 'female' ? '👩' : '👨';
  document.getElementById('gender-step-2').classList.remove('hidden');
}

// Bütçe butonunu vurgula (anında geçiş yapmaz)
function highlightBudget(val, label) {
  State._pendingBudget = val;
  State._pendingBudgetLabel = label;
  document.querySelectorAll('.budget-btn').forEach(btn => btn.classList.remove('selected'));
  const map = { low: 'budget-1', medium: 'budget-2', high: 'budget-3', luxury: 'budget-4' };
  if (map[val]) document.getElementById(map[val])?.classList.add('selected');
  // "Alışverişe Başla" butonunu aktif et
  const btn = document.getElementById('budget-confirm-btn');
  if (btn) { btn.classList.add('active'); }
}

// "Alışverişe Başla" butonundan çağrılır
function goToShopFromBudget() {
  // Finansal profil oku ve kaydet (slider değerleri)
  const salary = parseFloat(document.getElementById('gs-fin-salary')?.value) || 0;
  const credit = parseFloat(document.getElementById('gs-fin-credit')?.value) || 0;
  const debt   = parseFloat(document.getElementById('gs-fin-debt')?.value)   || 0;
  const limit  = parseFloat(document.getElementById('gs-fin-limit')?.value)  || 0;
  State.salary        = salary;
  State.monthlyCredit = credit;
  State.monthlyDebt   = debt;
  State.creditLimit   = limit;

  if (salary > 0) {
    const net = salary - credit - debt;
    logAction(
      `Finansal profil: Maaş ${salary.toLocaleString('tr-TR')} TL | ` +
      `Kredi ${credit.toLocaleString('tr-TR')} TL | ` +
      `Gider ${debt.toLocaleString('tr-TR')} TL | ` +
      `Kredi Limiti ${limit.toLocaleString('tr-TR')} TL | ` +
      `Net Harcanabilir ${net.toLocaleString('tr-TR')} TL`,
      'system'
    );
  } else {
    logAction('Finansal profil girilmedi — tüm ürünler gösteriliyor', 'system');
  }

  selectBudget('any', '');
}

function selectBudget(val, label) {
  State.budget = val;
  State.budgetLabel = label;
  logAction(`Bütçe seçildi: ${label}`, 'system');
  document.body.classList.add(State.gender === 'female' ? 'theme-female' : 'theme-male');
  const gs = document.getElementById('gender-screen');
  gs.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
  gs.style.opacity = '0'; gs.style.transform = 'scale(0.96)';
  setTimeout(() => {
    gs.classList.add('hidden');
    initShop();
    const ss = document.getElementById('shop-screen');
    ss.classList.remove('hidden');
    ss.style.opacity = '0';
    setTimeout(() => { ss.style.transition = 'opacity 0.4s ease'; ss.style.opacity = '1'; }, 20);
    startFlashPopups();
  }, 500);
}

function switchGender() {
  logAction('Kategori değiştirme ekranına gidildi', 'navigation');
  clearInterval(State.bannerInterval); clearInterval(State.countdownInterval);
  clearInterval(State.flashPopupInterval); clearInterval(State.flashPopupTimer);
  State.gender = null; State.budget = null; State.currentBannerSlide = 0;
  State._pendingBudget = null; State._pendingBudgetLabel = '';
  // Bütçe butonlarını ve finansal alanları sıfırla
  document.querySelectorAll('.budget-btn').forEach(b => b.classList.remove('selected'));
  const confirmBtn = document.getElementById('budget-confirm-btn');
  if (confirmBtn) confirmBtn.classList.remove('active');
  [
    ['gs-fin-salary', 'gs-fin-salary-disp'],
    ['gs-fin-credit', 'gs-fin-credit-disp'],
    ['gs-fin-debt',   'gs-fin-debt-disp'],
    ['gs-fin-limit',  'gs-fin-limit-disp'],
  ].forEach(([id, dispId]) => {
    const el = document.getElementById(id);
    if (el) { el.value = 0; updateSlider(el, dispId); }
  });
  document.body.className = '';
  const ss = document.getElementById('shop-screen');
  ss.style.transition = 'opacity 0.35s ease'; ss.style.opacity = '0';
  setTimeout(() => {
    ss.classList.add('hidden');
    document.getElementById('gender-step-1').classList.remove('hidden');
    document.getElementById('gender-step-2').classList.add('hidden');
    const gs = document.getElementById('gender-screen');
    gs.classList.remove('hidden', 'step2-mode'); gs.style.opacity = '0'; gs.style.transform = 'scale(0.96)';
    setTimeout(() => { gs.style.transition = 'opacity 0.4s ease, transform 0.4s ease'; gs.style.opacity = '1'; gs.style.transform = 'scale(1)'; }, 20);
  }, 350);
}

// ── SHOP INIT ─────────────────────────────────────────────
async function initShop() {
  const d = DATA[State.gender];

  // Statik kısımları hemen kur (nav, kategori, banner, promo)
  buildNav(d.nav);
  buildCategories(d.categories);
  buildBanners(d.banners);
  buildPromos(d.promos);
  updateGenderBadge();
  updateBudgetBanner();
  startCountdown();
  startBannerAuto();
  startSessionTimer();
  updateCartUI();
  updateFavUI();

  logAction(`Mağaza yükleniyor – ${State.gender === 'female' ? 'Kadın' : 'Erkek'} | Bütçe: ${State.budgetLabel || 'Belirtilmedi'}`, 'system');

  // Ürünleri DummyJSON'dan çek (skeleton gösterilerek)
  const products = await fetchDJProducts(State.gender);

  // Skeleton'ları temizle ve gerçek ürünleri yükle
  buildFlashProducts(products.slice(0, 5));
  buildRecommendedProducts(getFilteredByBudget(products).slice(0, 5));
  buildMoreProducts(products.slice(5, 15));
  updateShippingTopbar();

  logAction(`Mağaza hazır – ${products.length} ürün yüklendi`, 'system');
}

function getFilteredByBudget(products) {
  if (!State.budget || State.budget === 'any') return products;
  const [min, max] = BUDGET_LIMITS[State.budget] || [0, 99999];
  return products.filter(p => p.price >= min && p.price <= max);
}

function updateGenderBadge() {
  const b = document.getElementById('gender-badge');
  if (b) b.textContent = State.gender === 'female' ? 'Kadın' : 'Erkek';
}

function updateBudgetBanner() {
  const lbl = document.getElementById('budget-banner-label');
  const sub = document.getElementById('budget-banner-sub');
  if (!lbl || !sub) return;
  const netIncome = State.salary - State.monthlyCredit - State.monthlyDebt;
  if (netIncome > 0) {
    lbl.textContent = `💰 ${netIncome.toLocaleString('tr-TR')} TL harcanabilir gelir`;
    sub.textContent = 'Profilini güncellemek için tıkla';
  } else {
    lbl.textContent = '💰 Finansal Profiline Göre Ürünler';
    sub.textContent = 'Profilini güncellemek için tıkla';
  }
}

// ── NAV ───────────────────────────────────────────────────
function buildNav(items) {
  const list = document.getElementById('nav-list');
  list.innerHTML = items.map(item => `<li><a href="#" id="nav-${item.cat}" ${item.sale ? 'class="sale-tag"' : ''} onclick="navClick('${item.cat}','${item.label}'); return false;">${item.label}</a></li>`).join('');
}

function navClick(cat, label) {
  logAction(`Navigasyon: ${label} tıklandı`, 'navigation');
  document.querySelectorAll('.nav-list li a').forEach(a => a.classList.remove('active'));
  const el = document.getElementById(`nav-${cat}`);
  if (el) el.classList.add('active');
  const products = getProducts(State.gender);
  let filtered;
  if (cat === 'tumu') {
    // "Tümü" — tüm ürünleri göster
    filtered = products;
  } else if (cat === 'indirim' || cat === 'kampanya') {
    // İndirimli ürünler
    filtered = products.filter(p => p.badge === 'sale' || p.oldPrice);
  } else {
    // Belirli kategori
    filtered = products.filter(p => p.cat === cat);
  }
  if (filtered.length === 0) filtered = products;
  showCategoryPage(cat, label, filtered);
}

// ── CATEGORIES ────────────────────────────────────────────
function buildCategories(cats) {
  const grid = document.getElementById('categories-grid');
  grid.innerHTML = cats.map(c => `<div class="category-card" id="cat-${c.id}" onclick="categoryClick('${c.id}','${c.label}')" tabindex="0"><div class="cat-icon-wrap">${c.icon}</div><span class="cat-label">${c.label}</span></div>`).join('');
}

function categoryClick(id, label) {
  logAction(`Kategori seçildi: ${label}`, 'navigation');
  const products = getProducts(State.gender);
  let filtered = products.filter(p => p.cat === id);
  if (filtered.length === 0) filtered = products;
  showCategoryPage(id, label, filtered);
}

// ── CATEGORY PAGE VIEW ────────────────────────────────────
function showCategoryPage(cat, title, products) {
  if (!products) {
    const all = getProducts(State.gender);
    if (cat === 'flash') products = all.slice(0, 5);
    else if (cat === 'recommended') products = getFilteredByBudget(all);
    else if (cat === 'bestseller') products = all.slice(5);
    else products = all;
  }
  logAction(`Kategori sayfası: "${title}" (${products.length} ürün)`, 'navigation');
  State.currentCategoryProducts = [...products];
  State.currentCategoryTitle = title;
  document.getElementById('home-view').classList.add('hidden');
  const cv = document.getElementById('category-view');
  cv.classList.remove('hidden');
  document.getElementById('category-view-title').textContent = title;
  document.getElementById('product-count-label').textContent = `${products.length} ürün`;
  document.getElementById('sort-select').value = 'default';
  renderCategoryProducts(products);
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function renderCategoryProducts(products) {
  const grid = document.getElementById('category-products-grid');
  if (!grid) return;
  if (products.length === 0) {
    grid.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:60px;color:var(--text-muted)"><div style="font-size:3rem;margin-bottom:12px">🔍</div><p style="font-size:1rem;font-weight:600">Bu kategoride ürün bulunamadı</p></div>`;
    return;
  }
  grid.innerHTML = products.map(p => buildProductCard(p, 'category')).join('');
}

function sortProducts(val) {
  let sorted = [...State.currentCategoryProducts];
  if (val === 'price-asc') sorted.sort((a, b) => a.price - b.price);
  else if (val === 'price-desc') sorted.sort((a, b) => b.price - a.price);
  else if (val === 'rating') sorted.sort((a, b) => b.rating - a.rating);
  else if (val === 'reviews') sorted.sort((a, b) => b.reviews - a.reviews);
  logAction(`Sıralama değiştirildi: ${val}`, 'ui');
  renderCategoryProducts(sorted);
}

function goHome() {
  logAction('Ana sayfaya dönüldü', 'navigation');
  document.getElementById('category-view').classList.add('hidden');
  document.getElementById('home-view').classList.remove('hidden');
  document.querySelectorAll('.nav-list li a').forEach(a => a.classList.remove('active'));
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ── BANNERS ───────────────────────────────────────────────
function buildBanners(banners) {
  const slidesEl = document.getElementById('banner-slides');
  const dotsEl = document.getElementById('slider-dots');
  slidesEl.innerHTML = banners.map((b, i) => `
    <div class="banner-slide" style="background:${b.bg};" onclick="showCategoryPage('${b.cat}','${b.label}')">
      <div style="position:absolute;right:8%;top:50%;transform:translateY(-50%);font-size:10rem;opacity:0.22;pointer-events:none;filter:drop-shadow(0 12px 32px rgba(0,0,0,0.3));animation:bcfloat 4s ease-in-out infinite">${b.emoji}</div>
      <div class="banner-slide-content">
        <span class="banner-slide-label">${b.label}</span>
        <h2 class="banner-slide-title">${b.title}</h2>
        <p class="banner-slide-sub">${b.sub}</p>
        <button class="banner-cta" onclick="event.stopPropagation();showCategoryPage('${b.cat}','${b.label}')">${b.cta} →</button>
      </div>
    </div>`).join('');
  dotsEl.innerHTML = banners.map((_, i) => `<div class="slider-dot ${i === 0 ? 'active' : ''}" onclick="goToSlide(${i})"></div>`).join('');
  State.bannerTotal = banners.length;
}

function slideBanner(dir) {
  State.currentBannerSlide = (State.currentBannerSlide + dir + State.bannerTotal) % State.bannerTotal;
  applyBannerSlide();
  logAction(`Banner kaydırıldı: Slayt ${State.currentBannerSlide + 1}`, 'navigation');
}

function goToSlide(i) {
  State.currentBannerSlide = i; applyBannerSlide();
}

function applyBannerSlide() {
  const el = document.getElementById('banner-slides');
  if (el) el.style.transform = `translateX(-${State.currentBannerSlide * 100}%)`;
  document.querySelectorAll('.slider-dot').forEach((d, i) => d.classList.toggle('active', i === State.currentBannerSlide));
}

function startBannerAuto() {
  clearInterval(State.bannerInterval);
  State.bannerInterval = setInterval(() => { State.currentBannerSlide = (State.currentBannerSlide + 1) % State.bannerTotal; applyBannerSlide(); }, 5000);
}

// ── PRODUCT CARD ──────────────────────────────────────────
// Onaylı / süper satıcı rozeti
const VERIFIED_BRANDS = new Set([
  'Nike','Adidas','Samsung','Sony','Apple','Zara','MAC','CeraVe',
  "L'Oréal",'Chanel','Razer','Corsair','Logitech','Garmin',
  "Levi's",'Champion','Steve Madden','Aldo','Giulio',
]);
function getSellerBadge(brand, id) {
  if (VERIFIED_BRANDS.has(brand)) return '<span class="seller-badge seller-verified">✓ Onaylı Satıcı</span>';
  const code = id.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  if (code % 4 === 0) return '<span class="seller-badge seller-super">⭐ Süper Satıcı</span>';
  return '';
}

function getOpportunityLabel(p, section) {
  if (section === 'flash') return '<span class="opp-badge opp-flash">⚡ Flaş Fiyat</span>';
  if (p.reviews > 800)    return '<span class="opp-badge opp-hot">🔥 Çok Satan</span>';
  if (p.badge === 'hot')  return '<span class="opp-badge opp-limited">⏰ Sınırlı Stok</span>';
  const code = p.id.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  if (code % 7 === 0) return '<span class="opp-badge opp-gift">🎁 Hediye Paket</span>';
  if (code % 5 === 0) return '<span class="opp-badge opp-deal">💥 Süper Fırsat</span>';
  return null;
}

// Üyelik avantaj şeridi (ürün kartı alt kısmı)
function getMemberBenefit(price) {
  const mem = MEMBERSHIPS[State.membership];
  if (mem.discount === 0) {
    // Bronz: upgrade teşviki
    return `<div class="product-member-strip member-upgrade">🥈 Üye ol → <strong>%5</strong> indirim kazan</div>`;
  }
  const memberPrice = Math.round(price * (1 - mem.discount / 100));
  const shipLine = mem.freeShipping ? ' + ücretsiz kargo' : '';
  return `<div class="product-member-strip member-active">${mem.icon} ${mem.label} fiyatı: <strong>${memberPrice.toLocaleString('tr-TR')} TL</strong>${shipLine}</div>`;
}

function buildProductCard(p, section) {
  const discount = p.oldPrice ? Math.round((1 - p.price / p.oldPrice) * 100) : null;
  const isFav = State.favorites.includes(p.id);
  const isCompared = State.compareList.includes(p.id);
  const imgHtml = renderImg(p.img, p.name, '5rem');
  const oppLabel = getOpportunityLabel(p, section);
  const sellerBadge = getSellerBadge(p.brand, p.id);
  const memberBenefit = getMemberBenefit(p.price);
  return `
  <div class="product-card" id="pcard-${p.id}" onclick="openProduct('${p.id}')" data-section="${section}">
    <div class="product-img-wrap">
      ${p.badge ? `<span class="product-badge badge-${p.badge}">${p.badge === 'sale' ? 'İndirim' : p.badge === 'new' ? 'Yeni' : 'Popüler'}</span>` : ''}
      ${discount ? `<span class="product-discount-badge">%${discount} İNDİRİM</span>` : ''}
      <button class="product-fav-btn ${isFav ? 'active' : ''}" id="fav-btn-${p.id}" onclick="event.stopPropagation();toggleFavorite('${p.id}')" aria-label="Favorilere ekle">${isFav ? '❤️' : '🤍'}</button>
      <button class="product-compare-btn ${isCompared ? 'active' : ''}" id="cmp-btn-${p.id}" onclick="event.stopPropagation();addToCompare('${p.id}')" title="Karşılaştır">⚖️</button>
      ${imgHtml}
    </div>
    ${oppLabel ? `<div class="product-opportunity">${oppLabel}</div>` : ''}
    <div class="product-body">
      <div class="product-brand-row">
        <span class="product-brand">${p.brand}</span>
        ${sellerBadge}
      </div>
      <div class="product-name">${p.name}</div>
      <div class="product-rating">
        <span class="stars">${'★'.repeat(Math.floor(p.rating))}${'☆'.repeat(5 - Math.floor(p.rating))}</span>
        <span class="rating-count">(${p.reviews.toLocaleString('tr-TR')})</span>
      </div>
      <div class="product-price-row">
        <span class="product-price">${p.price.toLocaleString('tr-TR')} TL</span>
        ${p.oldPrice ? `<span class="product-old-price">${p.oldPrice.toLocaleString('tr-TR')} TL</span>` : ''}
        ${discount ? `<span class="product-discount">%${discount}</span>` : ''}
      </div>
      ${memberBenefit}
      <div class="product-free-ship">${p.price >= calcFreeShipThreshold() ? '✓ Ücretsiz kargo' : `🚚 ${calcFreeShipThreshold().toLocaleString('tr-TR')} TL üzeri ücretsiz`}</div>
      <button class="product-add-btn" onclick="event.stopPropagation();askPurposeThenAdd('${p.id}')">Sepete Ekle</button>
    </div>
  </div>`;
}

function buildFlashProducts(products) { document.getElementById('flash-products-grid').innerHTML = products.map(p => buildProductCard(p, 'flash')).join(''); }
function buildRecommendedProducts(products) {
  document.getElementById('recommended-title').textContent = State.gender === 'female' ? '💅 Sana Özel Öneriler' : '🎯 Sana Özel Öneriler';
  document.getElementById('recommended-products-grid').innerHTML = (products.length ? products : getProducts(State.gender).slice(0, 5)).sort(() => Math.random() - 0.5).map(p => buildProductCard(p, 'recommended')).join('');
}
function buildMoreProducts(products) { document.getElementById('more-products-grid').innerHTML = products.map(p => buildProductCard(p, 'more')).join(''); }

function buildPromos(promos) {
  document.getElementById('promo-grid').innerHTML = promos.map(p => `<div class="promo-card" style="background:${p.bg}" onclick="showCategoryPage('${p.cat}','${p.title}'); return false;"><h3>${p.title}</h3><p>${p.desc}</p></div>`).join('');
}

// ── PRODUCT MODAL ─────────────────────────────────────────
function openProduct(id) {
  const p = getProducts(State.gender).find(x => x.id === id);
  if (!p) return;
  State.modalProduct = p; State.modalQty = 1;
  logAction(`Ürün görüntülendi: ${p.name} (${p.brand}) – ${p.price} TL`, 'product');
  const discount = p.oldPrice ? Math.round((1 - p.price / p.oldPrice) * 100) : null;
  const isFav = State.favorites.includes(p.id);
  const isCompared = State.compareList.includes(p.id);
  const modalImgHtml = renderImg(p.img, p.name, '9rem');
  document.getElementById('product-modal-inner').innerHTML = `
    <div class="modal-img-side">${modalImgHtml}</div>
    <div class="modal-info-side">
      <div class="modal-brand-row">
        <span class="modal-brand">${p.brand}</span>
        ${getSellerBadge(p.brand, p.id)}
      </div>
      <h2 class="modal-name">${p.name}</h2>
      <div class="modal-rating">
        <span class="stars">${'★'.repeat(Math.floor(p.rating))}${'☆'.repeat(5 - Math.floor(p.rating))}</span>
        <span style="font-size:.85rem;font-weight:600">${p.rating}</span>
        <span style="font-size:.8rem;color:var(--text-muted)">(${p.reviews} değerlendirme)</span>
      </div>
      <div class="modal-price-row">
        <span class="modal-price">${p.price.toLocaleString('tr-TR')} TL</span>
        ${p.oldPrice ? `<span class="modal-old-price">${p.oldPrice.toLocaleString('tr-TR')} TL</span>` : ''}
        ${discount ? `<span class="modal-discount" style="animation:pulseBadge 2.2s ease-in-out infinite">%${discount} İndirim</span>` : ''}
      </div>
      ${(() => { const mem = MEMBERSHIPS[State.membership]; return mem.discount > 0 ? `<div style="font-size:.8rem;color:var(--green);font-weight:700;margin-bottom:8px">${mem.icon} ${mem.label} fiyatın: ${Math.round(p.price*(1-mem.discount/100)).toLocaleString('tr-TR')} TL</div>` : ''; })()}
      <p class="modal-desc">${p.desc}</p>
      <div class="modal-member-benefits">
        ${Object.entries(MEMBERSHIPS).filter(([,v]) => v.discount > 0).map(([key, val]) => {
          const mPrice = Math.round(p.price * (1 - val.discount / 100));
          return `<div class="mmb-row ${State.membership === key ? 'mmb-active' : ''}">
            <span class="mmb-icon">${val.icon}</span>
            <span class="mmb-label">${val.label}</span>
            <span class="mmb-price">${mPrice.toLocaleString('tr-TR')} TL</span>
            ${val.freeShipping ? '<span class="mmb-ship">🚚 Ücretsiz kargo</span>' : ''}
            ${State.membership === key ? '<span class="mmb-badge">Aktif</span>' : ''}
          </div>`;
        }).join('')}
      </div>
      <div class="modal-qty-row">
        <span class="modal-qty-label">Adet:</span>
        <div class="modal-qty-controls">
          <button class="qty-btn" onclick="changeModalQty(-1)">−</button>
          <span class="qty-num" id="modal-qty-val">1</span>
          <button class="qty-btn" onclick="changeModalQty(1)">+</button>
        </div>
      </div>
      <div class="modal-actions">
        <button class="modal-add-cart" onclick="askPurposeThenAddFromModal()">🛒 Sepete Ekle</button>
        <button class="modal-fav-btn ${isFav ? 'active' : ''}" id="modal-fav-btn" onclick="toggleFavorite('${p.id}',true)">${isFav ? '❤️' : '🤍'}</button>
        <button class="modal-fav-btn ${isCompared ? 'active' : ''}" onclick="addToCompare('${p.id}')" title="Karşılaştırma listesine ekle">⚖️</button>
      </div>
      ${_buildAIReviewHTML(p)}
    </div>`;
  document.getElementById('product-overlay').classList.add('active');
  document.getElementById('product-modal').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeProduct() {
  document.getElementById('product-overlay').classList.remove('active');
  document.getElementById('product-modal').classList.remove('open');
  document.body.style.overflow = '';
  logAction('Ürün detay modalı kapatıldı', 'ui');
  State.modalProduct = null;
}

function changeModalQty(dir) {
  State.modalQty = Math.max(1, State.modalQty + dir);
  const el = document.getElementById('modal-qty-val');
  if (el) el.textContent = State.modalQty;
  logAction(`Ürün adedi değiştirildi: ${State.modalQty}`, 'product');
}

function addToCartFromModal() {
  if (!State.modalProduct) return;
  for (let i = 0; i < State.modalQty; i++) addToCart(State.modalProduct.id, false);
  showToast(`✅ ${State.modalProduct.name} (${State.modalQty} adet) sepete eklendi`, 'success');
  closeProduct();
}

function askPurposeThenAddFromModal() {
  if (!State.modalProduct) return;
  State.pendingCartId = State.modalProduct.id;
  State.pendingCartQty = State.modalQty;
  State.pendingFromModal = true;
  openPurposeModal(State.modalProduct);
}

// ── CART ──────────────────────────────────────────────────
function addToCart(id, showToastFlag = true) {
  const p = getProducts(State.gender).find(x => x.id === id);
  if (!p) return;
  const existing = State.cart.find(i => i.product.id === id);
  if (existing) { existing.qty++; logAction(`Sepette adet artırıldı: ${p.name} → ${existing.qty}`, 'cart'); }
  else { State.cart.push({ product: p, qty: 1 }); logAction(`Sepete eklendi: ${p.name} – ${p.price} TL`, 'cart'); }
  updateCartUI();
  if (showToastFlag) showToast(`🛒 ${p.name} sepete eklendi!`, 'success');
}

function removeFromCart(id) {
  const item = State.cart.find(i => i.product.id === id);
  if (item) logAction(`Sepetten çıkarıldı: ${item.product.name}`, 'cart');
  State.cart = State.cart.filter(i => i.product.id !== id);
  updateCartUI(); renderCartItems();
}

function changeQty(id, dir) {
  const item = State.cart.find(i => i.product.id === id);
  if (!item) return;
  item.qty += dir;
  if (item.qty <= 0) { removeFromCart(id); return; }
  logAction(`Sepet adedi: ${item.product.name} → ${item.qty}`, 'cart');
  updateCartUI(); renderCartItems();
}

// ── SEPET TOPLAMI HESAPLAMA ───────────────────────────────
function calcCartTotals() {
  const subtotal = State.cart.reduce((s, i) => s + i.product.price * i.qty, 0);
  const mem = MEMBERSHIPS[State.membership];
  const memDiscount = Math.round(subtotal * mem.discount / 100);

  let tier = null;
  for (const t of SPEND_TIERS) { if (subtotal >= t.min) tier = t; }
  const tierDiscount = tier ? Math.round(subtotal * tier.discount / 100) : 0;

  let couponAmt = 0, couponFreeShip = false;
  if (State.couponCode && COUPONS[State.couponCode]) {
    const c = COUPONS[State.couponCode];
    if      (c.type === 'percent')  couponAmt = Math.round(subtotal * c.value / 100);
    else if (c.type === 'fixed')    couponAmt = Math.min(c.value, subtotal);
    else if (c.type === 'shipping') couponFreeShip = true;
  }

  const totalDiscountAmt = memDiscount + tierDiscount + couponAmt;
  const afterDiscount = Math.max(0, subtotal - totalDiscountAmt);
  const giftApplied = Math.min(State.giftApplied, afterDiscount);
  const priceBeforeShipping = Math.max(0, afterDiscount - giftApplied);

  const freeShipThreshold = calcFreeShipThreshold();
  const shippingCost = calcShippingCost();
  const freeShipping = priceBeforeShipping >= freeShipThreshold || mem.freeShipping
    || (tier && tier.freeShipping) || couponFreeShip || subtotal === 0;
  const shipping = freeShipping ? 0 : shippingCost;
  const total = priceBeforeShipping + shipping;

  return { subtotal, memDiscount, tierDiscount, couponAmt, giftApplied,
    shipping, total, freeShipping, afterDiscount, tier, totalDiscountAmt, mem };
}

function updateCartUI() {
  const count = State.cart.reduce((s, i) => s + i.qty, 0);
  const el = document.getElementById('cart-count'); if (el) el.textContent = count;
  const emp = document.getElementById('cart-empty'); if (emp) emp.style.display = State.cart.length ? 'none' : 'flex';

  const t = calcCartTotals();

  const st = document.getElementById('cart-subtotal');
  if (st) st.textContent = t.subtotal.toLocaleString('tr-TR') + ' TL';

  // İndirim satırları
  const dr = document.getElementById('cart-discount-rows');
  if (dr) {
    let rows = '';
    if (t.memDiscount > 0) {
      rows += `<div class="cart-summary-row discount-summary-row"><span>${t.mem.icon} ${t.mem.label} Üyelik İndirimi</span><span class="discount-amount">−${t.memDiscount.toLocaleString('tr-TR')} TL</span></div>`;
    }
    if (t.tierDiscount > 0 && t.tier) {
      rows += `<div class="cart-summary-row discount-summary-row"><span>🎯 Alışveriş İndirimi (${t.tier.label})</span><span class="discount-amount">−${t.tierDiscount.toLocaleString('tr-TR')} TL</span></div>`;
    }
    if (t.couponAmt > 0 && State.couponCode) {
      const c = COUPONS[State.couponCode];
      rows += `<div class="cart-summary-row discount-summary-row"><span>🎟 Kupon (${State.couponCode})</span><span class="discount-amount">−${t.couponAmt.toLocaleString('tr-TR')} TL</span></div>`;
    }
    if (t.giftApplied > 0) {
      rows += `<div class="cart-summary-row discount-summary-row"><span>🎁 Hediye Para</span><span class="discount-amount">−${t.giftApplied.toLocaleString('tr-TR')} TL</span></div>`;
    }
    dr.innerHTML = rows;
  }

  const sh = document.getElementById('cart-shipping');
  if (sh) { sh.textContent = t.freeShipping ? 'Ücretsiz' : `${calcShippingCost().toLocaleString('tr-TR')} TL`; sh.className = t.freeShipping ? 'free-shipping' : ''; }

  const tp = document.getElementById('cart-total-price');
  if (tp) tp.textContent = t.total.toLocaleString('tr-TR') + ' TL';

  _renderTierBanner(t);
  _renderGiftSection(t);

  // Kupon durumu koruma
  if (State.couponCode && COUPONS[State.couponCode]) {
    const status = document.getElementById('coupon-status');
    if (status && !status.querySelector('.coupon-ok')) {
      const c = COUPONS[State.couponCode];
      status.innerHTML = `<span class="coupon-ok">✅ ${c.label} uygulandı <button class="coupon-remove-btn" onclick="removeCoupon()">Kaldır</button></span>`;
    }
  }

  // Finansal etki göstergesi
  const fi = document.getElementById('cart-financial-impact');
  if (fi) {
    const net = State.salary - State.monthlyCredit - State.monthlyDebt;
    if (State.salary > 0 && net > 0 && t.subtotal > 0) {
      const pct = Math.round((t.total / net) * 100);
      const cls = pct > 50 ? 'warn' : pct > 25 ? 'caution' : 'ok';
      fi.style.display = 'block';
      fi.className = `cart-financial-impact ${cls}`;
      fi.innerHTML = `💡 Bu alışveriş harcanabilir gelirinizin <strong>%${pct}'ine</strong> denk geliyor`;
    } else { fi.style.display = 'none'; }
  }
  updateBudgetBar();
}

function _renderTierBanner(t) {
  const banner = document.getElementById('cart-tier-banner');
  if (!banner || t.subtotal === 0) { if (banner) banner.style.display = 'none'; return; }

  const threshold = calcFreeShipThreshold();
  const shipCost  = calcShippingCost();
  const nextTier  = SPEND_TIERS.find(tier => t.subtotal < tier.min);

  // Kargo ücretsizliği için eksik tutar (üyelik/kuponla zaten ücretsizse gösterme)
  const shipNeeded = !t.freeShipping && t.subtotal < threshold
    ? `<div class="tier-banner-msg" style="color:rgba(255,255,255,.65)">🚚 <strong>${(threshold - t.subtotal).toLocaleString('tr-TR')} TL</strong> daha ekle → kargo ücretsiz (şu an: ${shipCost} TL)</div>`
    : '';

  if (t.tier) {
    const nextMsg = nextTier
      ? `<div class="tier-banner-msg">🎯 <strong>${(nextTier.min - t.subtotal).toLocaleString('tr-TR')} TL</strong> daha → <strong>${nextTier.label}</strong></div>`
      : `<div class="tier-banner-msg">🏆 En yüksek indirim seviyesindesin!</div>`;
    const pct = nextTier ? Math.round((t.subtotal / nextTier.min) * 100) : 100;
    banner.style.display = 'block';
    banner.innerHTML = `<div class="tier-active-label">✓ ${t.tier.label} aktif</div>${nextMsg}${shipNeeded}<div class="tier-progress-bar"><div class="tier-progress-fill" style="width:${pct}%"></div></div>`;
  } else {
    const first = SPEND_TIERS[0];
    const pct   = Math.min(100, Math.round((t.subtotal / first.min) * 100));
    banner.style.display = 'block';
    banner.innerHTML = `<div class="tier-banner-msg">💡 <strong>${(first.min - t.subtotal).toLocaleString('tr-TR')} TL</strong> daha → <strong>${first.label}</strong></div>${shipNeeded}<div class="tier-progress-bar"><div class="tier-progress-fill" style="width:${pct}%"></div></div>`;
  }
}

function _renderGiftSection(t) {
  const section = document.getElementById('cart-gift-section');
  if (!section) return;
  if (State.giftBalance <= 0 || t.subtotal === 0) { section.style.display = 'none'; return; }
  section.style.display = 'flex';
  if (State.giftApplied > 0) {
    section.innerHTML = `<div class="gift-section-text">🎁 <strong>${State.giftApplied.toLocaleString('tr-TR')} TL</strong> hediye para uygulandı</div><button class="gift-remove-btn" onclick="removeGiftBalance()">Kaldır</button>`;
  } else {
    section.innerHTML = `<div class="gift-section-text">🎁 <strong>${State.giftBalance.toLocaleString('tr-TR')} TL</strong> hediye paran var!</div><button class="gift-apply-btn" onclick="applyGiftBalance()">Uygula</button>`;
  }
}

// ── KUPON FONKSİYONLARI ────────────────────────────────────
function applyCoupon() {
  const input = document.getElementById('coupon-input');
  const code = input ? input.value.trim().toUpperCase() : '';
  const status = document.getElementById('coupon-status');
  if (!code) return;
  if (!COUPONS[code]) {
    if (status) status.innerHTML = `<span class="coupon-err">❌ Geçersiz kupon kodu</span>`;
    return;
  }
  State.couponCode = code;
  const c = COUPONS[code];
  if (status) status.innerHTML = `<span class="coupon-ok">✅ ${c.label} uygulandı <button class="coupon-remove-btn" onclick="removeCoupon()">Kaldır</button></span>`;
  if (input) input.value = '';
  updateCartUI();
  logAction(`Kupon uygulandı: ${code}`, 'cart');
  showToast(`🎟 ${c.label} uygulandı!`, 'success');
}

function removeCoupon() {
  State.couponCode = null;
  const status = document.getElementById('coupon-status');
  if (status) status.textContent = '';
  updateCartUI();
  logAction('Kupon kaldırıldı', 'cart');
}

// ── HEDİYE PARA FONKSİYONLARI ────────────────────────────
function applyGiftBalance() {
  if (State.giftBalance <= 0) return;
  State.giftApplied = State.giftBalance;
  updateCartUI();
  logAction(`Hediye para uygulandı: ${State.giftApplied} TL`, 'cart');
  showToast(`🎁 ${State.giftApplied.toLocaleString('tr-TR')} TL hediye para uygulandı!`, 'success');
}

function removeGiftBalance() {
  State.giftApplied = 0;
  updateCartUI();
  logAction('Hediye para kaldırıldı', 'cart');
}

// ── ÜYELİK FONKSİYONLARI ─────────────────────────────────
function selectMembership(level) {
  State.membership = level;
  const mem = MEMBERSHIPS[level];
  document.querySelectorAll('.membership-card').forEach(c => c.classList.remove('active'));
  const card = document.getElementById(`mem-card-${level}`);
  if (card) { card.classList.add('active'); card.querySelector('.membership-card-check') && (card.querySelector('.membership-card-check').textContent = '✓ Aktif'); }
  updateCartUI();
  _updateMembershipBadge();
  logAction(`Üyelik seviyesi değiştirildi: ${mem.label}`, 'system');
  showToast(`${mem.icon} ${mem.label} üyeliğine geçildi!`, 'success');
}

function _updateMembershipBadge() {
  const mem = MEMBERSHIPS[State.membership];
  let badge = document.getElementById('mem-badge-header');
  if (!badge) {
    badge = document.createElement('span');
    badge.id = 'mem-badge-header';
    const genderBadge = document.getElementById('gender-badge');
    if (genderBadge) genderBadge.parentNode.insertBefore(badge, genderBadge.nextSibling);
    else return;
  }
  badge.className = `membership-badge-header ${mem.cls}`;
  badge.textContent = `${mem.icon} ${mem.label}`;
  badge.style.display = State.membership === 'bronze' ? 'none' : '';
}

// ── KARŞILAŞTIRMA FONKSİYONLARI ──────────────────────────
function addToCompare(id) {
  if (State.compareList.includes(id)) { removeFromCompare(id); return; }
  if (State.compareList.length >= 3) { showToast('Maksimum 3 ürün karşılaştırabilirsiniz', 'info'); return; }
  State.compareList.push(id);
  const btn = document.getElementById(`cmp-btn-${id}`);
  if (btn) btn.classList.add('active');
  _updateCompareBar();
  logAction(`Karşılaştırmaya eklendi: ${id}`, 'product');
}

function removeFromCompare(id) {
  State.compareList = State.compareList.filter(x => x !== id);
  const btn = document.getElementById(`cmp-btn-${id}`);
  if (btn) btn.classList.remove('active');
  _updateCompareBar();
}

function clearCompare() {
  State.compareList.forEach(id => { const b = document.getElementById(`cmp-btn-${id}`); if (b) b.classList.remove('active'); });
  State.compareList = [];
  _updateCompareBar();
}

function _updateCompareBar() {
  const bar = document.getElementById('compare-bar');
  if (!bar) return;
  if (State.compareList.length === 0) { bar.style.display = 'none'; return; }
  bar.style.display = 'block';
  const countEl = document.getElementById('compare-count');
  if (countEl) countEl.textContent = State.compareList.length;
  const products = getProducts(State.gender);
  const items = document.getElementById('compare-bar-items');
  if (!items) return;
  let html = '';
  State.compareList.forEach(id => {
    const p = products.find(x => x.id === id);
    if (!p) return;
    const imgHtml = p.img && p.img.startsWith('http')
      ? `<img src="${p.img}" style="width:24px;height:24px;object-fit:cover;border-radius:4px">`
      : `<span style="font-size:1.1rem">${p.img}</span>`;
    html += `<div class="compare-bar-item">${imgHtml}<span class="compare-bar-item-name">${p.name}</span><button class="compare-item-remove" onclick="removeFromCompare('${id}')">✕</button></div>`;
  });
  for (let i = State.compareList.length; i < 3; i++) html += `<div class="compare-bar-slot">+ Ürün Ekle</div>`;
  items.innerHTML = html;
}

function openCompareModal() {
  if (State.compareList.length < 2) { showToast('Karşılaştırmak için en az 2 ürün ekleyin', 'info'); return; }
  const products = getProducts(State.gender);
  const prods = State.compareList.map(id => products.find(p => p.id === id)).filter(Boolean);
  const cols = `130px ${Array(prods.length).fill('1fr').join(' ')}`;
  const rows = [
    { label: 'Ürün',     fn: p => `<div class="compare-product-head"><div class="compare-product-img">${p.img && p.img.startsWith('http') ? `<img src="${p.img}" style="width:60px;height:60px;object-fit:cover;border-radius:8px">` : p.img}</div><div class="compare-product-name">${p.name}</div><div class="compare-product-brand">${p.brand}</div></div>` },
    { label: 'Fiyat',    fn: p => `<div class="compare-price-cell">${p.price.toLocaleString('tr-TR')} TL${p.oldPrice ? `<div class="product-old-price" style="font-size:.72rem">${p.oldPrice.toLocaleString('tr-TR')} TL</div>` : ''}</div>` },
    { label: 'İndirim',  fn: p => p.oldPrice ? `<span class="product-discount" style="font-size:.8rem;padding:3px 7px">%${Math.round((1-p.price/p.oldPrice)*100)} İndirim</span>` : '—' },
    { label: 'Puan',     fn: p => `<span class="stars" style="font-size:.9rem">${'★'.repeat(Math.floor(p.rating))}</span> <strong>${p.rating}</strong>` },
    { label: 'Yorum',    fn: p => `${p.reviews.toLocaleString('tr-TR')} değerlendirme` },
    { label: 'Kargo',    fn: _ => `<span style="color:var(--green);font-weight:700">✓ Ücretsiz</span>` },
    { label: 'İşlem',    fn: p => `<button class="compare-add-btn" onclick="askPurposeThenAdd('${p.id}');closeCompareModal()">Sepete Ekle</button>` },
  ];
  let html = `<h2 class="compare-modal-title">⚖️ Ürün Karşılaştırma</h2><div class="compare-table">`;
  rows.forEach(row => {
    html += `<div class="compare-row" style="grid-template-columns:${cols}">`;
    html += `<div class="compare-cell compare-header-cell">${row.label}</div>`;
    prods.forEach(p => { html += `<div class="compare-cell">${row.fn(p)}</div>`; });
    html += `</div>`;
  });
  html += `</div>`;
  document.getElementById('compare-content').innerHTML = html;
  const m = document.getElementById('compare-modal');
  m.style.display = 'block';
  document.getElementById('compare-overlay').classList.add('active');
  setTimeout(() => m.classList.add('open'), 10);
  document.body.style.overflow = 'hidden';
  logAction('Karşılaştırma modalı açıldı', 'ui');
}

function closeCompareModal() {
  const m = document.getElementById('compare-modal');
  if (!m) return;
  m.classList.remove('open');
  setTimeout(() => { m.style.display = 'none'; }, 300);
  document.getElementById('compare-overlay').classList.remove('active');
  document.body.style.overflow = '';
}

// ── BUDGET TRACKER BAR ────────────────────────────────────
function updateBudgetBar() {
  const bar = document.getElementById('budget-tracker-bar');
  if (!bar) return;

  const netIncome   = State.salary - State.monthlyCredit - State.monthlyDebt;
  const creditLimit = State.creditLimit;
  const totalPrice  = State.cart.reduce((s, i) => s + i.product.price * i.qty, 0);

  // Bar yalnızca finansal veri girilmişse ve sepet doluysa görünür
  const hasNet    = netIncome > 0;
  const hasCredit = creditLimit > 0;

  if ((!hasNet && !hasCredit) || State.cart.length === 0) {
    bar.classList.remove('btb-visible', 'btb-exceeded-mode', 'btb-warn');
    document.getElementById('main-content')?.style.removeProperty('padding-bottom');
    return;
  }

  bar.classList.add('btb-visible');
  document.getElementById('main-content').style.paddingBottom = '72px';

  // Birincil limit: net gelir (varsa), yoksa kredi limiti
  const primaryLimit = hasNet ? netIncome : creditLimit;
  const pct          = Math.min(100, Math.round((totalPrice / primaryLimit) * 100));
  const exceeded     = totalPrice > primaryLimit;
  const over         = Math.max(0, totalPrice - primaryLimit);

  const progState = document.getElementById('btb-progress-state');
  const excState  = document.getElementById('btb-exceeded-state');

  if (exceeded) {
    bar.classList.add('btb-exceeded-mode');
    bar.classList.remove('btb-warn');
    progState.style.display = 'none';
    excState.style.display  = 'flex';
    const limitLabel = hasNet ? 'net gelirin' : 'kredi limitin';
    document.getElementById('btb-over-msg').textContent =
      `${limitLabel}i ${over.toLocaleString('tr-TR')} TL aştın`;
  } else {
    bar.classList.remove('btb-exceeded-mode');
    progState.style.display = 'flex';
    excState.style.display  = 'none';

    const fill = document.getElementById('btb-fill');
    fill.style.width = pct + '%';

    if (pct >= 90) {
      fill.style.background = 'linear-gradient(to right, #22c55e, #f59e0b, #ef4444)';
      bar.classList.add('btb-warn');
      document.getElementById('btb-icon').textContent      = '⚠️';
      document.getElementById('btb-subtitle').textContent  = 'Limite yaklaşıyorsun!';
    } else if (pct >= 65) {
      fill.style.background = 'linear-gradient(to right, #22c55e, #f59e0b)';
      bar.classList.add('btb-warn');
      document.getElementById('btb-icon').textContent      = '💰';
      document.getElementById('btb-subtitle').textContent  = hasNet
        ? `Net Gelir: ${netIncome.toLocaleString('tr-TR')} TL` : 'Kredi Limiti';
    } else {
      fill.style.background = 'linear-gradient(to right, #22c55e, #4ade80)';
      bar.classList.remove('btb-warn');
      document.getElementById('btb-icon').textContent      = '💰';
      document.getElementById('btb-subtitle').textContent  = hasNet
        ? `Net Gelir: ${netIncome.toLocaleString('tr-TR')} TL` : 'Kredi Limiti';
    }

    document.getElementById('btb-amounts').textContent =
      `${totalPrice.toLocaleString('tr-TR')} / ${primaryLimit.toLocaleString('tr-TR')} TL`;
    document.getElementById('btb-pct').textContent = `%${pct}`;
  }

  // Kredi limiti alt satırı
  const creditLine = document.getElementById('btb-credit-line');
  if (creditLine) {
    if (hasCredit && hasNet) {
      const cPct      = Math.min(100, Math.round((totalPrice / creditLimit) * 100));
      const cExceeded = totalPrice > creditLimit;
      creditLine.style.display = 'block';
      creditLine.innerHTML = cExceeded
        ? `💳 Kredi limitin aşıldı! (${totalPrice.toLocaleString('tr-TR')} / ${creditLimit.toLocaleString('tr-TR')} TL)`
        : `💳 Kredi Limiti: ${totalPrice.toLocaleString('tr-TR')} / ${creditLimit.toLocaleString('tr-TR')} TL · %${cPct}`;
      creditLine.classList.toggle('btb-credit-exceeded', cExceeded);
    } else {
      creditLine.style.display = 'none';
    }
  }
}

function openBudgetUpgradeModal() {
  const netIncome  = State.salary - State.monthlyCredit - State.monthlyDebt;
  const totalPrice = State.cart.reduce((s, i) => s + i.product.price * i.qty, 0);
  const over       = Math.max(0, totalPrice - netIncome);

  document.getElementById('budget-upgrade-content').innerHTML = `
    <div class="bum-header">
      <div class="bum-icon">⚠️</div>
      <h3 class="bum-title">Net Gelir Aşıldı</h3>
      <p class="bum-sub">
        Sepet tutarın <strong>${totalPrice.toLocaleString('tr-TR')} TL</strong>,
        net gelirini <strong>${over.toLocaleString('tr-TR')} TL</strong> aşıyor.
      </p>
    </div>
    <div class="bum-calc-card">
      <div class="bum-calc-row">
        <span>Aylık Net Maaş</span>
        <strong>${State.salary.toLocaleString('tr-TR')} TL</strong>
      </div>
      <div class="bum-calc-row bum-debit">
        <span>Kredi Ödemesi</span>
        <strong>− ${State.monthlyCredit.toLocaleString('tr-TR')} TL</strong>
      </div>
      <div class="bum-calc-row bum-debit">
        <span>Sabit Giderler</span>
        <strong>− ${State.monthlyDebt.toLocaleString('tr-TR')} TL</strong>
      </div>
      <div class="bum-calc-row bum-net">
        <span>Harcanabilir Gelir</span>
        <strong>${netIncome.toLocaleString('tr-TR')} TL</strong>
      </div>
    </div>
    <div class="bum-tiers">
      <button class="bum-tier-btn" onclick="openFinancialModal(); closeBudgetUpgradeModal();">
        <span class="bum-tier-icon">✏️</span>
        <div class="bum-tier-info">
          <span class="bum-tier-label">Finansal Profili Güncelle</span>
          <span class="bum-tier-desc">Gelir bilgilerini yeniden düzenle</span>
        </div>
        <span class="bum-tier-arrow">→</span>
      </button>
      <button class="bum-tier-btn" onclick="openCheckout(); closeBudgetUpgradeModal();">
        <span class="bum-tier-icon">🛍</span>
        <div class="bum-tier-info">
          <span class="bum-tier-label">Yine de Devam Et</span>
          <span class="bum-tier-desc">Limiti aşarak ödemeye geç</span>
        </div>
        <span class="bum-tier-arrow">→</span>
      </button>
    </div>
    <button class="bum-cancel-btn" onclick="closeBudgetUpgradeModal()">Vazgeç</button>
  `;

  const m = document.getElementById('budget-upgrade-modal');
  const o = document.getElementById('budget-upgrade-overlay');
  m.style.display = 'block';
  o.classList.add('active');
  setTimeout(() => m.classList.add('open'), 10);
  logAction('Bütçe artırma modalı açıldı', 'system');
}

function closeBudgetUpgradeModal() {
  const m = document.getElementById('budget-upgrade-modal');
  const o = document.getElementById('budget-upgrade-overlay');
  if (!m) return;
  m.classList.remove('open');
  o.classList.remove('active');
  setTimeout(() => { m.style.display = 'none'; }, 350);
}

function applyBudgetUpgrade(val, label) {
  State.budget = val;
  State.budgetLabel = label;
  logAction(`Bütçe limiti artırıldı: ${label}`, 'system');
  updateBudgetBanner();
  buildRecommendedProducts(getFilteredByBudget(getProducts(State.gender)).slice(0, 5));
  closeBudgetUpgradeModal();
  updateBudgetBar();
  showToast(`📈 Bütçe "${label}" olarak güncellendi`, 'success');
}

function renderCartItems() {
  const container = document.getElementById('cart-items');
  if (!container) return;
  container.innerHTML = State.cart.map(item => {
    const p = item.product;
    return `<div class="cart-item" id="cart-item-${p.id}">
      <div class="cart-item-img">${renderImg(p.img, p.name, '2rem')}</div>
      <div class="cart-item-info">
        <div class="cart-item-name">${p.brand} – ${p.name}</div>
        <div class="cart-item-price">${p.price.toLocaleString('tr-TR')} TL</div>
        <div class="cart-item-controls">
          <button class="qty-btn" onclick="changeQty('${p.id}',-1)">−</button>
          <span class="qty-num">${item.qty}</span>
          <button class="qty-btn" onclick="changeQty('${p.id}',1)">+</button>
        </div>
      </div>
      <button class="item-delete-btn" onclick="removeFromCart('${p.id}')">🗑</button>
    </div>`;
  }).join('');
}

function openCart() {
  renderCartItems();
  document.getElementById('cart-overlay').classList.add('active');
  document.getElementById('cart-drawer').classList.add('open');
  document.body.style.overflow = 'hidden';
  logAction('Sepet açıldı', 'cart');
}

function closeCart() {
  document.getElementById('cart-overlay').classList.remove('active');
  document.getElementById('cart-drawer').classList.remove('open');
  document.body.style.overflow = '';
  logAction('Sepet kapatıldı', 'cart');
}

// ── FAVORITES ─────────────────────────────────────────────
function toggleFavorite(id, fromModal = false) {
  const p = getProducts(State.gender).find(x => x.id === id);
  if (!p) return;
  if (State.favorites.includes(id)) {
    State.favorites = State.favorites.filter(f => f !== id);
    logAction(`Favorilerden çıkarıldı: ${p.name}`, 'product');
    showToast(`💔 ${p.name} favorilerden çıkarıldı`, 'info');
    updateFavBtn(id, false, fromModal);
  } else {
    State.favorites.push(id);
    logAction(`Favorilere eklendi: ${p.name}`, 'product');
    showToast(`❤️ ${p.name} favorilere eklendi!`, 'success');
    updateFavBtn(id, true, fromModal);
  }
  updateFavUI(); renderFavItems();
}

function updateFavBtn(id, isFav, fromModal) {
  const cardBtn = document.getElementById(`fav-btn-${id}`);
  if (cardBtn) { cardBtn.innerHTML = isFav ? '❤️' : '🤍'; cardBtn.classList.toggle('active', isFav); }
  if (fromModal) {
    const mb = document.getElementById('modal-fav-btn');
    if (mb) { mb.innerHTML = isFav ? '❤️' : '🤍'; mb.classList.toggle('active', isFav); }
  }
}

function updateFavUI() {
  const el = document.getElementById('fav-count');
  if (el) el.textContent = State.favorites.length;
}

function renderFavItems() {
  const container = document.getElementById('fav-items');
  if (!container) return;
  const favProducts = State.favorites.map(id => getProducts(State.gender).find(p => p.id === id)).filter(Boolean);
  container.innerHTML = favProducts.map(p => `
    <div class="fav-item" id="fav-item-${p.id}">
      <div class="fav-item-img">${renderImg(p.img, p.name, '2rem')}</div>
      <div class="cart-item-info">
        <div class="fav-item-name">${p.brand} – ${p.name}</div>
        <div class="fav-item-price">${p.price.toLocaleString('tr-TR')} TL</div>
      </div>
      <div style="display:flex;flex-direction:column;gap:6px">
        <button class="item-delete-btn" style="background:#e0e7ff;color:var(--accent)" onclick="askPurposeThenAdd('${p.id}')">🛒</button>
        <button class="item-delete-btn" onclick="toggleFavorite('${p.id}')">🗑</button>
      </div>
    </div>`).join('');
  const emp = document.getElementById('fav-empty');
  if (emp) emp.style.display = favProducts.length ? 'none' : 'flex';
}

function openFavorites() {
  renderFavItems();
  document.getElementById('fav-overlay').classList.add('active');
  document.getElementById('fav-drawer').classList.add('open');
  document.body.style.overflow = 'hidden';
  logAction(`Favoriler açıldı (${State.favorites.length} ürün)`, 'product');
}

function closeFavorites() {
  document.getElementById('fav-overlay').classList.remove('active');
  document.getElementById('fav-drawer').classList.remove('open');
  document.body.style.overflow = '';
  logAction('Favoriler kapatıldı', 'ui');
}

// ── SEARCH ────────────────────────────────────────────────
function handleSearchInput(value) {
  clearTimeout(State.searchTimeout);
  const sugBox = document.getElementById('search-suggestions');
  if (!value.trim()) { sugBox.style.display = 'none'; return; }
  State.searchTimeout = setTimeout(() => {
    logAction(`Arama yapıldı: "${value}"`, 'search');
    const matches = getProducts(State.gender).filter(p =>
      p.name.toLowerCase().includes(value.toLowerCase()) ||
      p.brand.toLowerCase().includes(value.toLowerCase()) ||
      p.cat.toLowerCase().includes(value.toLowerCase())
    ).slice(0, 5);
    if (!matches.length) { sugBox.style.display = 'none'; return; }
    sugBox.innerHTML = matches.map(p => `
      <div class="search-suggestion-item" onclick="document.getElementById('search-suggestions').style.display='none'; openProduct('${p.id}')">
        <span>${p.img}</span>
        <span><strong>${p.brand}</strong> – ${p.name}</span>
        <span style="margin-left:auto;font-size:.8rem;font-weight:700;color:var(--accent)">${p.price.toLocaleString('tr-TR')} TL</span>
      </div>`).join('');
    sugBox.style.display = 'block';
  }, 300);
}

function doSearch() {
  const q = document.getElementById('search-input').value.trim();
  if (!q) return;
  logAction(`Arama çubuğu gönderildi: "${q}"`, 'search');
  document.getElementById('search-suggestions').style.display = 'none';
  const matches = getProducts(State.gender).filter(p =>
    p.name.toLowerCase().includes(q.toLowerCase()) ||
    p.brand.toLowerCase().includes(q.toLowerCase())
  );
  showCategoryPage('search', `"${q}" Arama Sonuçları`, matches);
  document.getElementById('search-input').value = '';
}

// ── CHECKOUT SIMULATION ───────────────────────────────────
function openCheckout() {
  if (State.cart.length === 0) { showToast('⚠️ Sepetiniz boş!', 'error'); return; }
  closeCart();
  logAction(`Ödeme başlatıldı – ${State.cart.length} çeşit ürün`, 'cart');
  State.checkoutStep = 1;
  const m = document.getElementById('checkout-modal');
  m.style.display = 'block';
  document.getElementById('checkout-overlay').classList.add('active');
  setTimeout(() => m.classList.add('open'), 10);
  document.body.style.overflow = 'hidden';
  renderCheckoutStep(1);
}

function closeCheckout() {
  const m = document.getElementById('checkout-modal');
  m.classList.remove('open');
  setTimeout(() => { m.style.display = 'none'; }, 300);
  document.getElementById('checkout-overlay').classList.remove('active');
  document.body.style.overflow = '';
  logAction('Ödeme ekranı kapatıldı', 'cart');
}

function setCheckoutStepUI(step) {
  [1, 2, 3, 4].forEach(s => {
    const el = document.getElementById(`cstep-${s}`);
    if (!el) return;
    el.classList.remove('active', 'done');
    if (s < step) el.classList.add('done');
    else if (s === step) el.classList.add('active');
  });
  document.querySelectorAll('.checkout-step-line').forEach((l, i) => l.classList.toggle('done', i + 1 < step));
}

function renderCheckoutStep(step) {
  setCheckoutStepUI(step);
  const body = document.getElementById('checkout-body');
  const total = State.cart.reduce((s, i) => s + i.product.price * i.qty, 0);
  const cartHTML = `<div class="checkout-cart-items">${State.cart.map(item => `
    <div class="checkout-cart-item">
      <div class="checkout-cart-item-img">${renderImg(item.product.img, item.product.name, '2.2rem')}</div>
      <div><div class="checkout-cart-item-name">${item.product.name}</div><div class="checkout-cart-item-qty">${item.product.brand} · ${item.qty} adet</div></div>
      <span class="checkout-cart-item-price">${(item.product.price * item.qty).toLocaleString('tr-TR')} TL</span>
    </div>`).join('')}</div>
    <div class="checkout-summary">
      <div class="checkout-summary-row"><span>Ara Toplam</span><span>${total.toLocaleString('tr-TR')} TL</span></div>
      <div class="checkout-summary-row"><span>Kargo</span><span style="color:#22c55e">Ücretsiz</span></div>
      <div class="checkout-summary-row total"><span>Genel Toplam</span><span>${total.toLocaleString('tr-TR')} TL</span></div>
    </div>`;

  if (step === 1) {
    body.innerHTML = `<h3 class="checkout-title">🛒 Sipariş Özeti</h3>${cartHTML}
      <button class="checkout-next-btn" onclick="renderCheckoutStep(2)">Devam Et →</button>
      <span class="checkout-back-link" onclick="closeCheckout(); openCart();">← Sepete Dön</span>`;
    logAction('Ödeme Adım 1: Sepet özeti gösterildi', 'cart');
  } else if (step === 2) {
    body.innerHTML = `<h3 class="checkout-title">📍 Teslimat Bilgileri</h3>
      <div class="checkout-form">
        <div class="form-row">
          <div class="form-group"><label class="form-label">Ad</label><input class="form-input" id="f-name" placeholder="Adınız" /></div>
          <div class="form-group"><label class="form-label">Soyad</label><input class="form-input" id="f-surname" placeholder="Soyadınız" /></div>
        </div>
        <div class="form-group"><label class="form-label">Telefon</label><input class="form-input" id="f-phone" placeholder="05xx xxx xx xx" /></div>
        <div class="form-group"><label class="form-label">Adres</label><input class="form-input" id="f-address" placeholder="Mahalle, Cadde, Sokak, No" /></div>
        <div class="form-row">
          <div class="form-group"><label class="form-label">İl</label>
            <select class="form-select" id="f-city">
              <option>İstanbul</option><option>Ankara</option><option>İzmir</option>
              <option>Bursa</option><option>Antalya</option><option>Adana</option>
            </select>
          </div>
          <div class="form-group"><label class="form-label">Posta Kodu</label><input class="form-input" id="f-zip" placeholder="34000" maxlength="5" /></div>
        </div>
        <div class="form-group"><label class="form-label">Teslimat Notu (isteğe bağlı)</label><input class="form-input" id="f-note" placeholder="Kapıcıya bırakın..." /></div>
      </div>
      <button class="checkout-next-btn" onclick="submitAddress()">Ödemeye Geç →</button>
      <span class="checkout-back-link" onclick="renderCheckoutStep(1)">← Geri Dön</span>`;
    logAction('Ödeme Adım 2: Adres formu gösterildi', 'cart');
  } else if (step === 3) {
    const net = State.salary - State.monthlyCredit - State.monthlyDebt;
    const hasFinancial = State.salary > 0;
    const pct = (hasFinancial && net > 0) ? Math.round((total / net) * 100) : null;
    const pctColor = pct === null ? '#94a3b8' : pct > 50 ? '#e53935' : pct > 25 ? '#f59e0b' : '#22c55e';
    const pctLabel = pct === null ? '—' : `%${pct}`;
    const affordLabel = pct === null ? 'Finansal profil girilmedi' :
      pct > 100 ? '⚠️ Harcanabilir geliri aşıyor' :
      pct > 50  ? '⚠️ Gelirinizin yarısından fazlası' :
      pct > 25  ? '💡 Dikkatli harcama bölgesi' :
                  '✅ Bütçe içinde';

    // Kayıtlı kart üret
    const card = _generateSavedCard();

    body.innerHTML = `
      <h3 class="checkout-title">💳 Ödeme</h3>

      ${hasFinancial ? `
      <div class="sim-section-title">Kayıtlı Kartınız</div>
      <div class="saved-card-wrap">
        <div class="credit-card cc-${card.brandKey}">
          <div class="cc-top-row">
            <div class="cc-brand">${card.brandName}</div>
            <div class="cc-chip-icon">▣</div>
          </div>
          <div class="cc-number">•••• &nbsp;•••• &nbsp;•••• &nbsp;${card.last4}</div>
          <div class="cc-bottom-row">
            <div class="cc-holder-block">
              <div class="cc-small-label">Kart Sahibi</div>
              <div class="cc-small-val">${card.name}</div>
            </div>
            <div class="cc-expiry-block">
              <div class="cc-small-label">Son Kullanma</div>
              <div class="cc-small-val">${card.expiry}</div>
            </div>
          </div>
        </div>
        ${card.cardLimit > 0 ? `
        <div class="cc-limit-panel">
          <div class="cc-limit-row"><span>Kart Limiti</span><strong>${card.cardLimit.toLocaleString('tr-TR')} TL</strong></div>
          <div class="cc-limit-row"><span>Kullanılabilir</span><strong class="cc-available">${card.available.toLocaleString('tr-TR')} TL</strong></div>
          <div class="cc-limit-row highlight"><span>Bu Alışveriş</span><strong style="color:${pctColor}">${total.toLocaleString('tr-TR')} TL</strong></div>
        </div>` : ''}
      </div>` : `
      <div class="sim-no-financial">
        Finansal profil girilmedi — standart ödeme ile devam edilecek.
      </div>`}

      <div class="sim-section-title">Sipariş Özeti</div>
      ${cartHTML}

      ${hasFinancial ? `
      <div class="sim-section-title">Finansal Değerlendirme</div>
      <div class="sim-financial-grid">
        <div class="sim-fin-row"><span>Aylık Maaş</span><strong>${State.salary.toLocaleString('tr-TR')} TL</strong></div>
        <div class="sim-fin-row debit"><span>Kredi Ödemesi</span><strong>−${State.monthlyCredit.toLocaleString('tr-TR')} TL</strong></div>
        <div class="sim-fin-row debit"><span>Aylık Gider</span><strong>−${State.monthlyDebt.toLocaleString('tr-TR')} TL</strong></div>
        <div class="sim-fin-row net"><span>Harcanabilir Gelir</span><strong style="color:${net >= 0 ? '#22c55e' : '#e53935'}">${net.toLocaleString('tr-TR')} TL</strong></div>
      </div>
      <div class="sim-result-card">
        <div class="sim-result-row">
          <span>Sepet Tutarı</span>
          <strong style="color:var(--accent);font-size:1.1rem">${total.toLocaleString('tr-TR')} TL</strong>
        </div>
        <div class="sim-result-row">
          <span>Gelirin Yüzdesi</span>
          <strong style="color:${pctColor};font-size:1.1rem">${pctLabel}</strong>
        </div>
        <div class="sim-verdict" style="border-color:${pctColor}">${affordLabel}</div>
      </div>` : ''}

      <button class="checkout-next-btn" onclick="processPayment()">
        🔒 ${hasFinancial ? card.brandName + ' Kartla Öde' : 'Ödemeyi Tamamla'}
      </button>
      <span class="checkout-back-link" onclick="renderCheckoutStep(2)">← Geri Dön</span>`;
    logAction(`Ödeme Adım 3: ${hasFinancial ? 'Kayıtlı kart gösterildi' : 'Finansal profil yok'} – Sepet: ${total.toLocaleString('tr-TR')} TL${pct !== null ? ', Gelir %' + pct : ''}`, 'cart');
  }
}

function submitAddress() {
  const name    = document.getElementById('f-name')?.value.trim();
  const surname = document.getElementById('f-surname')?.value.trim();
  const addr    = document.getElementById('f-address')?.value.trim();
  if (!name || !addr) { showToast('⚠️ Lütfen Ad ve Adres alanlarını doldurun', 'error'); return; }
  State.deliveryName = `${name}${surname ? ' ' + surname : ''}`.toUpperCase();
  logAction(`Adres girildi: ${name}, ${document.getElementById('f-city')?.value}`, 'cart');
  renderCheckoutStep(3);
}

function selectPaymentMethod(method) {
  State.selectedPayment = method;
  document.querySelectorAll('.payment-method-option').forEach(el => el.classList.remove('selected'));
  const el = document.getElementById(`pm-${method}`);
  if (el) el.classList.add('selected');
  const cd = document.getElementById('card-details');
  if (cd) cd.style.display = method === 'card' ? 'flex' : 'none';
  logAction(`Ödeme yöntemi: ${method}`, 'cart');
}

function formatCard(input) {
  let v = input.value.replace(/\D/g, '');
  v = v.match(/.{1,4}/g)?.join(' ') || v;
  input.value = v;
}

function processPayment() {
  logAction('Ödeme işlemi başlatıldı', 'cart');
  const body = document.getElementById('checkout-body');
  setCheckoutStepUI(4);
  body.innerHTML = `<div class="payment-processing"><div class="payment-spinner"></div><h3>Ödemeniz İşleniyor...</h3><p>Lütfen bekleyin, güvenli ödeme sistemi devreye alınıyor</p></div>`;
  setTimeout(() => {
    const simNo = 'SX' + Date.now().toString().slice(-8);
    const total = State.cart.reduce((s, i) => s + i.product.price * i.qty, 0);
    const itemCount = State.cart.reduce((s, i) => s + i.qty, 0);
    const net = State.salary - State.monthlyCredit - State.monthlyDebt;
    const pct = (State.salary > 0 && net > 0) ? Math.round((total / net) * 100) : null;
    const pctColor = pct === null ? '#94a3b8' : pct > 50 ? '#e53935' : pct > 25 ? '#f59e0b' : '#22c55e';
    logAction(`Simülasyon tamamlandı: #${simNo} – ${total.toLocaleString('tr-TR')} TL, Gelir %${pct ?? '?'}`, 'cart');
    body.innerHTML = `
      <div class="order-success">
        <div class="order-success-icon">✅</div>
        <h2>Siparişiniz Alındı!</h2>
        <p>Teşekkürler! Siparişiniz başarıyla oluşturuldu.</p>
        <div class="order-number-box">
          <div class="order-number-label">Sipariş Numarası</div>
          <div class="order-number">#${simNo}</div>
        </div>
        <div class="order-details-grid">
          <div class="order-detail-item"><div class="order-detail-label">Ürün Sayısı</div><div class="order-detail-value">${itemCount} adet</div></div>
          <div class="order-detail-item"><div class="order-detail-label">Sepet Tutarı</div><div class="order-detail-value" style="color:var(--accent)">${total.toLocaleString('tr-TR')} TL</div></div>
          ${State.salary > 0 ? `
          <div class="order-detail-item"><div class="order-detail-label">Harcanabilir Gelir</div><div class="order-detail-value">${net.toLocaleString('tr-TR')} TL</div></div>
          <div class="order-detail-item"><div class="order-detail-label">Gelirin Yüzdesi</div><div class="order-detail-value" style="color:${pctColor}">%${pct}</div></div>` : ''}
        </div>
        <button class="order-continue-btn" onclick="closeCheckout(); clearCartAfterOrder()">Alışverişe Devam Et</button>
      </div>`;
  }, 2500);
}

function clearCartAfterOrder() {
  State.cart = [];
  updateCartUI();
  renderCartItems();
  showToast('🎉 Alışverişiniz tamamlandı!', 'success');
}

// ── SAVED CARD GENERATOR ─────────────────────────────────
function _generateSavedCard() {
  const salary = State.salary;
  const credit = State.monthlyCredit;
  const debt   = State.monthlyDebt;

  // Kart markasını maaşa göre belirle
  let brandName, brandKey;
  if (salary >= 30000)      { brandName = 'American Express'; brandKey = 'amex'; }
  else if (salary >= 15000) { brandName = 'Mastercard';       brandKey = 'mc';   }
  else                      { brandName = 'Visa';             brandKey = 'visa'; }

  // Son 4 hane (maaştan deterministik üret)
  const seed  = Math.abs(salary * 37 + 4217);
  const last4 = String((seed % 9000) + 1000);

  // Kart limiti: kullanıcı girdiyse onu kullan, yoksa maaştan hesapla
  const cardLimit = State.creditLimit > 0
    ? State.creditLimit
    : credit > 0
      ? Math.round(credit * 12 / 1000) * 1000
      : salary > 0 ? Math.round(salary * 1.5 / 1000) * 1000 : 0;
  const used      = Math.round(debt * 3 / 1000) * 1000;
  const available = Math.max(0, cardLimit - used);

  // Son kullanma tarihi (3 yıl ilerisi)
  const now     = new Date();
  const expMon  = String(now.getMonth() + 1).padStart(2, '0');
  const expYear = String(now.getFullYear() + 3).slice(-2);
  const expiry  = `${expMon}/${expYear}`;

  const name = State.deliveryName || 'KART SAHİBİ';

  return { brandName, brandKey, last4, cardLimit, available, expiry, name };
}

// ── FLASH SALE POPUP ──────────────────────────────────────
function startFlashPopups() {
  // First popup after 20 seconds, then random 45-90s intervals
  setTimeout(() => showFlashPopup(), 20000);
  State.flashPopupInterval = setInterval(() => {
    const wait = 45000 + Math.random() * 45000;
    setTimeout(() => showFlashPopup(), wait);
  }, 120000);
}

function showFlashPopup() {
  const saleProducts = getProducts(State.gender).filter(p => p.oldPrice);
  if (!saleProducts.length) return;
  const p = saleProducts[Math.floor(Math.random() * saleProducts.length)];
  const discount = Math.round((1 - p.price / p.oldPrice) * 100);
  const flashPrice = Math.round(p.price * 0.8);
  logAction(`Flaş indirim pop-up gösterildi: ${p.name}`, 'ui');

  document.getElementById('flash-popup-body').innerHTML = `
    <div class="flash-popup-img">${renderImg(p.img, p.name, '3.5rem')}</div>
    <div class="flash-popup-info">
      <div class="flash-popup-brand">${p.brand}</div>
      <div class="flash-popup-name">${p.name}</div>
      <div class="flash-popup-price-row">
        <span class="flash-popup-price">${flashPrice.toLocaleString('tr-TR')} TL</span>
        <span class="flash-popup-old">${p.price.toLocaleString('tr-TR')} TL</span>
        <span class="flash-popup-discount">%${discount + 20}</span>
      </div>
    </div>`;

  const footer = document.querySelector('.flash-popup-footer');
  const oldBtn = footer.querySelector('.flash-popup-buy');
  if (oldBtn) oldBtn.remove();
  const btn = document.createElement('button');
  btn.className = 'flash-popup-buy';
  btn.textContent = 'Hemen Al!';
  btn.onclick = () => { addToCart(p.id); closeFlashPopup(); logAction(`Flaş indirimden satın alındı: ${p.name}`, 'cart'); };
  footer.appendChild(btn);

  State.flashPopupSecs = 120;
  const popup = document.getElementById('flash-popup');
  popup.style.display = 'block';
  setTimeout(() => popup.classList.add('visible'), 10);
  updateFlashTimer();

  clearInterval(State.flashPopupTimer);
  State.flashPopupTimer = setInterval(() => {
    State.flashPopupSecs--;
    updateFlashTimer();
    if (State.flashPopupSecs <= 0) closeFlashPopup();
  }, 1000);
}

function updateFlashTimer() {
  const m = Math.floor(State.flashPopupSecs / 60);
  const s = State.flashPopupSecs % 60;
  const el = document.getElementById('flash-popup-timer');
  if (el) el.textContent = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function closeFlashPopup() {
  clearInterval(State.flashPopupTimer);
  const popup = document.getElementById('flash-popup');
  popup.classList.remove('visible');
  setTimeout(() => { popup.style.display = 'none'; }, 450);
  logAction('Flaş indirim pop-up kapatıldı', 'ui');
}

// ── HELP MODAL ────────────────────────────────────────────
function openHelp() {
  logAction('Yardım merkezi açıldı', 'ui');
  const m = document.getElementById('help-modal');
  m.style.display = 'block';
  document.getElementById('help-overlay').classList.add('active');
  setTimeout(() => m.classList.add('open'), 10);
  document.body.style.overflow = 'hidden';
  renderHelpContent('faq');
}

function closeHelp() {
  const m = document.getElementById('help-modal');
  m.classList.remove('open');
  setTimeout(() => { m.style.display = 'none'; }, 300);
  document.getElementById('help-overlay').classList.remove('active');
  document.body.style.overflow = '';
}

function switchHelpTab(tab, btn) {
  State.helpCurrentTab = tab;
  document.querySelectorAll('.help-tab').forEach(t => t.classList.remove('active'));
  btn.classList.add('active');
  renderHelpContent(tab);
  logAction(`Yardım sekmesi: ${tab}`, 'ui');
}

function renderHelpContent(tab) {
  const el = document.getElementById('help-content');
  const faqs = {
    faq: [
      { q: 'Siparişim ne zaman kargoya verilir?', a: 'Siparişleriniz genellikle 1-2 iş günü içinde kargoya verilir. Kargo takip bilgisi SMS ve e-posta ile iletilir.' },
      { q: 'İade nasıl yapılır?', a: 'Ürün teslim tarihinden itibaren 14 gün içinde iade talep edebilirsiniz. Ürün kullanılmamış ve orijinal ambalajında olmalıdır.' },
      { q: 'Hangi ödeme yöntemleri kabul edilir?', a: 'Kredi kartı, banka kartı, havale/EFT ve kapıda ödeme seçenekleri mevcuttur. Kredi kartında 12 taksit imkânı sunulmaktadır.' },
      { q: 'Kargo ücreti ne kadar?', a: '150 TL ve üzeri siparişlerinizde kargo ücretsizdir. 150 TL altı siparişlerde 29,90 TL kargo ücreti uygulanır.' },
      { q: 'Ürün değişimi yapabilir miyim?', a: 'Evet, boyut, renk gibi değişim talepleri için müşteri hizmetlerimizle iletişime geçebilirsiniz. Değişim bedelsizdir.' },
    ],
    shipping: `<h4>🚚 Kargo Bilgileri</h4><p>Standart teslimat süresi 2-4 iş günüdür. Hızlı teslimat seçeneği ile aynı gün veya ertesi gün teslim mümkündür.</p><p style="margin-top:12px"><strong>Kargo Firmaları:</strong> Yurtiçi Kargo, MNG Kargo, Aras Kargo</p>`,
    return: `<h4>🔄 İade ve Değişim</h4><p>14 gün içinde koşulsuz iade ve değişim hakkınız bulunmaktadır. İade kargo bedeli firmamıza aittir.</p>`,
    contact: `<h4>📞 İletişim</h4><p>Müşteri Hizmetleri: 0850 xxx xx xx</p><p>E-posta: destek@shopx.com.tr</p><p>Çalışma saatleri: Hafta içi 09:00 – 18:00</p>`,
  };

  if (tab === 'faq') {
    el.innerHTML = faqs.faq.map(f => `<div class="faq-item"><div class="faq-q">${f.q}</div><div class="faq-a">${f.a}</div></div>`).join('');
  } else {
    el.innerHTML = `<div style="font-size:.88rem;color:var(--text-secondary);line-height:1.7">${faqs[tab] || ''}</div>`;
  }
}

// ── ORDER TRACKING ────────────────────────────────────────
function openOrderTracking() {
  logAction('Sipariş takibi açıldı', 'ui');
  const modal = document.getElementById('tracking-modal');
  modal.style.display = 'block';
  document.getElementById('tracking-overlay').classList.add('active');
  setTimeout(() => modal.classList.add('open'), 10);
  document.getElementById('tracking-content').innerHTML = `
    <h2 class="info-modal-title">📦 Sipariş Takibi</h2>
    <div class="checkout-form">
      <div class="form-group"><label class="form-label">Sipariş Numarası</label><input class="form-input" id="track-no" placeholder="SX12345678" /></div>
      <div class="form-group"><label class="form-label">Telefon / E-posta</label><input class="form-input" id="track-contact" placeholder="05xx xxx xx xx" /></div>
    </div>
    <button class="checkout-next-btn" onclick="submitTracking()">Sorgula</button>
    <div id="track-result" style="margin-top:16px"></div>`;
  document.body.style.overflow = 'hidden';
}

function closeOrderTracking() {
  const modal = document.getElementById('tracking-modal');
  modal.classList.remove('open');
  setTimeout(() => { modal.style.display = 'none'; }, 300);
  document.getElementById('tracking-overlay').classList.remove('active');
  document.body.style.overflow = '';
}

function submitTracking() {
  const no = document.getElementById('track-no')?.value.trim();
  if (!no) { showToast('⚠️ Sipariş numarasını girin', 'error'); return; }
  logAction(`Sipariş sorgulandı: ${no}`, 'ui');
  const statuses = ['Siparişiniz alındı', 'Paketleniyor', 'Kargoya verildi – Yurtiçi Kargo', 'Dağıtıma çıktı', 'Teslim edildi'];
  const status = statuses[Math.floor(Math.random() * statuses.length)];
  document.getElementById('track-result').innerHTML = `
    <div style="background:var(--surface-2);border-radius:var(--radius-md);padding:16px;border-left:4px solid var(--accent)">
      <div style="font-size:.75rem;color:var(--text-muted);font-weight:700;text-transform:uppercase;letter-spacing:1px;margin-bottom:6px">Sipariş Durumu</div>
      <div style="font-size:1rem;font-weight:700">${status}</div>
      <div style="font-size:.78rem;color:var(--text-muted);margin-top:4px">Tahmini Teslimat: Bugün 14:00 – 18:00</div>
    </div>`;
}

// ── INFO MODAL ────────────────────────────────────────────
const INFO_CONTENT = {
  about: { title: '🏢 Hakkımızda', body: '<p>ShopX, 2020 yılında kurulan Türkiye\'nin hızla büyüyen e-ticaret platformudur. 10 milyon ürün, 50 bin satıcı ve 15 milyonun üzerinde kayıtlı kullanıcı ile hizmet veriyoruz.</p><h4>Misyonumuz</h4><p>En iyi alışveriş deneyimini en uygun fiyatlarla sunmak.</p>' },
  career: { title: '💼 Kariyer', body: '<p>ShopX ailesine katılmak ister misiniz? Teknoloji, pazarlama, lojistik ve müşteri hizmetleri alanlarında açık pozisyonlarımız var.</p><h4>Başvuru</h4><p>kariyer@shopx.com.tr adresine CV\'nizi gönderin.</p>' },
  press: { title: '📰 Basın', body: '<p>Basın bültenleri, haberler ve medya materyalleri için basın@shopx.com.tr adresine ulaşabilirsiniz.</p>' },
  investor: { title: '📈 Yatırımcı İlişkileri', body: '<p>Finansal raporlar ve yatırımcı bilgileri için ir@shopx.com.tr adresine ulaşabilirsiniz.</p>' },
  return: { title: '🔄 İade & Değişim', body: '<h4>İade Koşulları</h4><ul><li>14 gün içinde iade hakkı</li><li>Kullanılmamış ürün</li><li>Orijinal ambalaj</li></ul><h4>İade Süreci</h4><p>Uygulamanızın "Siparişlerim" bölümünden iade talebi oluşturabilirsiniz.</p>' },
  contact: { title: '📞 İletişim', body: '<p><strong>Müşteri Hizmetleri:</strong> 0850 xxx xx xx</p><p><strong>E-posta:</strong> destek@shopx.com.tr</p><p><strong>Adres:</strong> Maslak Mah. Büyükdere Cad. No:255 Sarıyer/İstanbul</p>' },
  privacy: { title: '🔒 Gizlilik Politikası', body: '<p>ShopX olarak kişisel verilerinizin gizliliğini ön planda tutuyoruz. Verileriniz KVKK kapsamında korunmaktadır.</p>' },
  kvkk: { title: '⚖️ KVKK Aydınlatma', body: '<p>6698 sayılı Kişisel Verilerin Korunması Kanunu kapsamında, kişisel verileriniz ShopX tarafından işlenmektedir.</p>' },
  terms: { title: '📋 Kullanım Koşulları', body: '<p>ShopX\'i kullanmaya devam etmeniz, kullanım koşullarımızı kabul ettiğiniz anlamına gelir. Tüm alışverişler Türk Hukuku\'na tabidir.</p>' },
};

function openInfoModal(key) {
  const info = INFO_CONTENT[key];
  if (!info) return;
  logAction(`Bilgi sayfası açıldı: ${key}`, 'ui');
  const m = document.getElementById('info-modal');
  m.style.display = 'block';
  document.getElementById('info-overlay').classList.add('active');
  setTimeout(() => m.classList.add('open'), 10);
  document.getElementById('info-content').innerHTML = `<h2 class="info-modal-title">${info.title}</h2><div class="info-modal-body">${info.body}</div>`;
  document.body.style.overflow = 'hidden';
}

function closeInfoModal() {
  const m = document.getElementById('info-modal');
  m.classList.remove('open');
  setTimeout(() => { m.style.display = 'none'; }, 300);
  document.getElementById('info-overlay').classList.remove('active');
  document.body.style.overflow = '';
}

// ── PURCHASE PURPOSE ──────────────────────────────────────
const PURPOSE_OPTIONS = [
  { id: 'need',    label: 'İhtiyacım var',               icon: '✅' },
  { id: 'deal',    label: 'İndirimde gördüm',             icon: '🏷️' },
  { id: 'gift',    label: 'Hediye alıyorum',              icon: '🎁' },
  { id: 'reward',  label: 'Kendimi ödüllendiriyorum',     icon: '🌟' },
  { id: 'impulse', label: 'Anlık karar / dürtüsel alım',  icon: '⚡' },
];

function askPurposeThenAdd(id) {
  const p = getProducts(State.gender).find(x => x.id === id);
  if (!p) return;
  State.pendingCartId = id;
  State.pendingCartQty = 1;
  State.pendingFromModal = false;
  openPurposeModal(p);
}

function openPurposeModal(p) {
  const m = document.getElementById('purpose-modal');
  m.style.display = 'block';
  document.getElementById('purpose-overlay').classList.add('active');
  setTimeout(() => m.classList.add('open'), 10);
  const priceStr = p.price ? p.price.toLocaleString('tr-TR') + ' ₺' : '';
  const oldPriceStr = p.oldPrice ? p.oldPrice.toLocaleString('tr-TR') + ' ₺' : '';
  document.getElementById('purpose-content').innerHTML = `
    <div class="purpose-header">
      <div class="purpose-product-preview">
        <div class="purpose-product-img">${renderImg(p.img, p.name, '2.8rem')}</div>
        <div class="purpose-product-info">
          <div class="purpose-product-name">${p.name}</div>
          <div class="purpose-product-prices">
            <span class="purpose-product-price">${priceStr}</span>
            ${oldPriceStr ? `<span class="purpose-product-old">${oldPriceStr}</span>` : ''}
          </div>
        </div>
      </div>
      <div class="purpose-question">🎯 Bu ürünü neden alıyorsunuz?</div>
    </div>
    <div class="purpose-options">
      ${PURPOSE_OPTIONS.map(o => `
        <div class="purpose-option" onclick="confirmPurpose('${o.id}','${o.label}')">
          <span class="purpose-icon">${o.icon}</span>
          <span class="purpose-label">${o.label}</span>
        </div>`).join('')}
    </div>
    <div class="purpose-custom-row">
      <input class="form-input" id="purpose-custom-input" placeholder="Veya kendi nedeninizi yazın..." maxlength="100" />
      <button class="purpose-custom-btn" onclick="confirmCustomPurpose()">Devam →</button>
    </div>
    <button class="purpose-skip" onclick="confirmPurpose('skip','Belirtilmedi')">Atla</button>`;
  document.body.style.overflow = 'hidden';
}

function closePurposeModal() {
  const m = document.getElementById('purpose-modal');
  m.classList.remove('open');
  setTimeout(() => { m.style.display = 'none'; }, 300);
  document.getElementById('purpose-overlay').classList.remove('active');
  document.body.style.overflow = '';
  State.pendingCartId = null;
}

function confirmPurpose(purposeId, purposeLabel) {
  const id = State.pendingCartId;
  const qty = State.pendingCartQty;
  const fromModal = State.pendingFromModal;
  closePurposeModal();
  if (!id) return;
  const p = getProducts(State.gender).find(x => x.id === id);
  if (!p) return;
  if (purposeId !== 'skip') {
    logAction(`Satın alma amacı: "${purposeLabel}" – ${p.name}`, 'product');
  }
  if (fromModal) {
    for (let i = 0; i < qty; i++) addToCart(id, false);
    showToast(`✅ ${p.name} (${qty} adet) sepete eklendi`, 'success');
    closeProduct();
  } else {
    addToCart(id);
  }
}

function confirmCustomPurpose() {
  const val = document.getElementById('purpose-custom-input')?.value.trim();
  if (!val) { showToast('⚠️ Lütfen bir neden yazın veya seçeneklerden birini seçin', 'error'); return; }
  confirmPurpose('custom', val);
}

// ── FINANCIAL PROFILE ─────────────────────────────────────
function openFinancialModal() {
  logAction('Finansal profil açıldı', 'ui');
  const m = document.getElementById('financial-modal');
  m.style.display = 'block';
  document.getElementById('financial-overlay').classList.add('active');
  setTimeout(() => m.classList.add('open'), 10);
  const net = State.salary - State.monthlyCredit - State.monthlyDebt;
  const hasData = State.salary > 0;
  document.getElementById('financial-content').innerHTML = `
    <h2 class="info-modal-title">💳 Finansal Profilim</h2>
    <p style="color:var(--text-muted);font-size:.88rem;margin-bottom:20px">Bu bilgiler ödeme adımında bütçe değerlendirmesi için kullanılır.</p>
    <div class="checkout-form">
      <div class="form-group">
        <label class="form-label">Aylık Net Maaş (TL)</label>
        <input class="form-input" id="fin-salary" type="number" min="0" placeholder="örn: 15000" value="${State.salary || ''}" />
      </div>
      <div class="form-group">
        <label class="form-label">Aylık Kredi Ödemesi (TL)</label>
        <input class="form-input" id="fin-credit" type="number" min="0" placeholder="örn: 2000" value="${State.monthlyCredit || ''}" />
      </div>
      <div class="form-group">
        <label class="form-label">Aylık Borç (TL)</label>
        <input class="form-input" id="fin-debt" type="number" min="0" placeholder="örn: 1500" value="${State.monthlyDebt || ''}" />
      </div>
    </div>
    ${hasData ? `
    <div class="financial-summary">
      <div class="financial-summary-row"><span>Aylık Maaş</span><strong>${State.salary.toLocaleString('tr-TR')} TL</strong></div>
      <div class="financial-summary-row debit"><span>Kredi Ödemesi</span><strong>−${State.monthlyCredit.toLocaleString('tr-TR')} TL</strong></div>
      <div class="financial-summary-row debit"><span>Aylık Borç</span><strong>−${State.monthlyDebt.toLocaleString('tr-TR')} TL</strong></div>
      <div class="financial-summary-row net"><span>Harcanabilir Gelir</span><strong style="color:${net >= 0 ? 'var(--accent)' : '#e53935'}">${net.toLocaleString('tr-TR')} TL</strong></div>
    </div>` : ''}
    <button class="checkout-next-btn" onclick="saveFinancial()">Kaydet</button>`;
  document.body.style.overflow = 'hidden';
}

function closeFinancialModal() {
  const m = document.getElementById('financial-modal');
  m.classList.remove('open');
  setTimeout(() => { m.style.display = 'none'; }, 300);
  document.getElementById('financial-overlay').classList.remove('active');
  document.body.style.overflow = '';
}

function saveFinancial() {
  const salary = parseFloat(document.getElementById('fin-salary')?.value) || 0;
  const credit = parseFloat(document.getElementById('fin-credit')?.value) || 0;
  const debt   = parseFloat(document.getElementById('fin-debt')?.value) || 0;
  State.salary = salary;
  State.monthlyCredit = credit;
  State.monthlyDebt = debt;
  logAction(`Finansal profil güncellendi: Maaş ${salary.toLocaleString('tr-TR')} TL, Kredi ${credit.toLocaleString('tr-TR')} TL, Borç ${debt.toLocaleString('tr-TR')} TL`, 'system');
  closeFinancialModal();
  updateCartUI();
  showToast('✅ Finansal profil kaydedildi', 'success');
}

// ── AI ÜRÜN ANALİZİ ───────────────────────────────────────
function _generateAIReview(p) {
  const discount = p.oldPrice ? Math.round((1 - p.price / p.oldPrice) * 100) : 0;

  let score = 0;
  if (p.rating >= 4.8) score += 3;
  else if (p.rating >= 4.5) score += 2;
  else if (p.rating >= 4.0) score += 1;

  if (p.reviews > 1000) score += 2;
  else if (p.reviews > 300) score += 1;

  if (discount >= 20) score += 2;
  else if (discount >= 8) score += 1;

  const premiumBrands = new Set(['Nike','Adidas','Samsung','Sony','Apple','Chanel','MAC','CeraVe',
    'Zara','Razer','Corsair','Logitech','Garmin',"L'Oréal","Levi's",'Champion','Steve Madden']);
  if (premiumBrands.has(p.brand)) score += 1;

  const pros = [];
  const cons = [];

  if (p.rating >= 4.7) pros.push('Yüksek müşteri memnuniyeti');
  else if (p.rating >= 4.3) pros.push('İyi kullanıcı puanı');

  if (p.reviews > 1000) pros.push(`${p.reviews.toLocaleString('tr-TR')} değerlendirme güvencesi`);
  else if (p.reviews > 200) pros.push('Yeterli kullanıcı deneyimi var');

  if (discount >= 20) pros.push(`%${discount} ile güçlü indirim`);
  else if (discount > 0) pros.push(`%${discount} indirim mevcut`);

  if (premiumBrands.has(p.brand)) pros.push(`${p.brand} marka güvencesi`);
  if (p.badge === 'new') pros.push('Yeni sezon ürünü');

  if (p.rating < 4.4) cons.push('Puan biraz daha yüksek olabilirdi');
  if (p.reviews < 100) cons.push('Henüz sınırlı kullanıcı yorumu');
  if (!p.oldPrice) cons.push('İndirim uygulanmıyor şu an');
  if (p.price > 3000 && score < 5) cons.push('Yüksek fiyat segmentinde yer alıyor');
  if (cons.length === 0) cons.push('Stok durumu yakından takip edilmeli');

  let assessment, emoji;
  if (score >= 7) {
    assessment = 'Mükemmel bir seçim! Müşteri memnuniyeti, indirim oranı ve marka güvencesi bir arada. Bu kategorinin en güçlü ürünlerinden biri.';
    emoji = '🌟';
  } else if (score >= 5) {
    assessment = 'Güvenle tercih edilebilecek kaliteli bir ürün. Fiyat-performans dengesi oldukça tatmin edici düzeyde.';
    emoji = '👍';
  } else if (score >= 3) {
    assessment = 'Ortalama performanslı bir ürün. Satın almadan önce kullanıcı yorumlarını detaylı incelemenizi öneririm.';
    emoji = '🤔';
  } else {
    assessment = 'Dikkatli değerlendirmenizi öneririm. Aynı kategoride daha iyi alternatifler mevcut olabilir.';
    emoji = '⚠️';
  }

  const pct = Math.min(Math.round((score / 8) * 100), 97);
  return { assessment, emoji, pros, cons, score: pct };
}

function _buildAIReviewHTML(p) {
  const r = _generateAIReview(p);
  const prosHTML = r.pros.map(x => `<div class="ai-review-list-item"><span>✓</span><span>${x}</span></div>`).join('');
  const consHTML = r.cons.map(x => `<div class="ai-review-list-item"><span>·</span><span>${x}</span></div>`).join('');
  return `
  <div class="ai-review-card">
    <div class="ai-review-header">
      <div class="ai-review-icon">🤖</div>
      <span class="ai-review-title">AI Ürün Analizi</span>
      <span class="ai-review-badge">ShopX AI</span>
    </div>
    <div class="ai-review-assessment">${r.emoji} ${r.assessment}</div>
    <div class="ai-review-lists">
      <div class="ai-review-pros">
        <div class="ai-review-list-title">✅ Artılar</div>
        ${prosHTML}
      </div>
      <div class="ai-review-cons">
        <div class="ai-review-list-title">⚠️ Eksiler</div>
        ${consHTML}
      </div>
    </div>
    <div class="ai-review-score">
      <span class="ai-review-score-label">AI Skoru</span>
      <div class="ai-review-score-bar"><div class="ai-review-score-fill" style="width:${r.score}%"></div></div>
      <span class="ai-review-score-val">${r.score}/100</span>
    </div>
  </div>`;
}

// ── SANAL ASİSTAN ─────────────────────────────────────────
// ── SANAL ASİSTAN – Dinamik Yanıtlar ──────────────────────
function _vaStats() {
  const products = getProducts(State.gender);
  if (!products || products.length === 0) return null;

  const prices    = products.map(p => p.price);
  const avgPrice  = Math.round(prices.reduce((a, b) => a + b, 0) / prices.length);
  const minPrice  = Math.min(...prices);
  const maxPrice  = Math.max(...prices);

  const discounted = products.filter(p => p.oldPrice);
  const avgDiscount = discounted.length
    ? Math.round(discounted.reduce((s, p) => s + (1 - p.price / p.oldPrice) * 100, 0) / discounted.length)
    : 0;
  const maxDiscount = discounted.length
    ? Math.round(Math.max(...discounted.map(p => (1 - p.price / p.oldPrice) * 100)))
    : 0;

  const bestDeal   = [...discounted].sort((a, b) => (1 - b.price / b.oldPrice) - (1 - a.price / a.oldPrice)).slice(0, 3);
  const topRated   = [...products].sort((a, b) => b.rating - a.rating).slice(0, 3);
  const mostSold   = [...products].sort((a, b) => b.reviews - a.reviews).slice(0, 3);
  const cheapest   = [...products].sort((a, b) => a.price - b.price).slice(0, 3);

  // Kaç ürün alınca kargo ücretsiz?
  const unitsForFreeShip = Math.ceil(150 / avgPrice);
  const mem = MEMBERSHIPS[State.membership];

  return { avgPrice, minPrice, maxPrice, avgDiscount, maxDiscount,
    bestDeal, topRated, mostSold, cheapest, discounted, products,
    unitsForFreeShip, mem };
}

function _buildVAResponses() {
  const s = _vaStats();
  if (!s) {
    return [
      { id: 'kargo',  q: 'Kargo ne zaman ücretsiz?',      a: 'Ürün fiyatlarına göre hesaplanan eşiği aşan siparişlerde kargo ücretsizdir. 🥈 Gümüş üye ve üzeri her siparişte ücretsiz kargo!' },
      { id: 'iade',   q: 'İade nasıl yapılır?',            a: '14 gün içinde iade hakkınız var. Yardım → İade bölümüne bakın.' },
      { id: 'uyelik', q: 'Üyelik avantajları neler?',      a: '🥈 Gümüş %5 · 🥇 Altın %10+ücretsiz kargo · 💎 Platin %15+ücretsiz kargo' },
      { id: 'kupon',  q: 'Kupon kodu var mı?',             a: 'SHOPX10 · ILKALIS20 · KARGO · HEDIYE50 · SHOPX5' },
    ];
  }

  const fmt = n => n.toLocaleString('tr-TR');

  return [
    {
      id: 'kargo',
      q: 'Kargo ne zaman ücretsiz?',
      a: (() => {
           const thr  = calcFreeShipThreshold();
           const cost = calcShippingCost();
           const units = Math.ceil(thr / s.avgPrice);
           return `Kargo bedeli bilgisi:\n\n`
             + `• <strong>${fmt(thr)} TL ve üzeri</strong> alışverişlerde ücretsiz\n`
             + `• Kargo bedeli: <strong>${cost} TL</strong>\n`
             + `• Kategorimizde ortalama ürün fiyatı <strong>${fmt(s.avgPrice)} TL</strong> — `
             + (units <= 1 ? `tek ürünle kargo ücretsiz!` : `<strong>${units} ürün</strong> alarak bedavaya düşer`)
             + `\n\n${s.mem.freeShipping
                 ? `✅ ${s.mem.icon} ${s.mem.label} üyeliğiniz her siparişte ücretsiz kargo sağlar!`
                 : `🥈 Gümüş üye veya üstü her siparişte ücretsiz kargo.`}`
             + `\n\nSepette <strong>KARGO</strong> kupon koduyla da ücretsiz kargo alabilirsiniz.`;
         })(),
    },
    {
      id: 'indirim',
      q: 'Şu anki indirimler neler?',
      a: `Güncel indirim özeti:\n\n`
       + `📊 İndirimli ürün sayısı: <strong>${s.discounted.length}</strong>\n`
       + `📉 Ortalama indirim: <strong>%${s.avgDiscount}</strong>\n`
       + `🔥 En yüksek indirim: <strong>%${s.maxDiscount}</strong>\n\n`
       + `En iyi fırsatlar:\n`
       + s.bestDeal.map(p => `• ${p.name} → %${Math.round((1 - p.price / p.oldPrice) * 100)} indirim · <strong>${fmt(p.price)} TL</strong>`).join('\n'),
    },
    {
      id: 'fiyat',
      q: 'Fiyat aralığı nedir?',
      a: `Kategorimiz fiyat bilgisi:\n\n`
       + `💰 En düşük: <strong>${fmt(s.minPrice)} TL</strong>\n`
       + `💎 En yüksek: <strong>${fmt(s.maxPrice)} TL</strong>\n`
       + `📊 Ortalama: <strong>${fmt(s.avgPrice)} TL</strong>\n\n`
       + `En uygun fiyatlı ürünler:\n`
       + s.cheapest.map(p => `• ${p.name} — <strong>${fmt(p.price)} TL</strong>`).join('\n'),
    },
    {
      id: 'oneri',
      q: 'Ürün önerisi alabilir miyim?',
      a: `Size özel öneriler:\n\n`
       + `⭐ En yüksek puanlılar:\n`
       + s.topRated.map(p => `• ${p.name} · ${p.rating}/5 · <strong>${fmt(p.price)} TL</strong>`).join('\n')
       + `\n\n💬 En çok değerlendirilenler:\n`
       + s.mostSold.slice(0, 2).map(p => `• ${p.name} · ${fmt(p.reviews)} yorum`).join('\n'),
    },
    {
      id: 'uyelik',
      q: 'Üyelik avantajları neler?',
      a: `Ortalama ürün fiyatımız <strong>${fmt(s.avgPrice)} TL</strong> üzerinden üyelik kazançları:\n\n`
       + `🥉 Bronz: Normal fiyat (${fmt(s.avgPrice)} TL)\n`
       + `🥈 Gümüş: %5 indirim → <strong>${fmt(Math.round(s.avgPrice * 0.95))} TL</strong>\n`
       + `🥇 Altın: %10 indirim + ücretsiz kargo → <strong>${fmt(Math.round(s.avgPrice * 0.90))} TL</strong>\n`
       + `💎 Platin: %15 indirim + ücretsiz kargo → <strong>${fmt(Math.round(s.avgPrice * 0.85))} TL</strong>\n\n`
       + `Hesabım → Üyelik Seviyem bölümünden seçim yapabilirsiniz!`,
    },
    {
      id: 'kupon',
      q: 'Kupon kodu var mı?',
      a: `Aktif kupon kodları:\n\n`
       + `🎟 <strong>SHOPX10</strong> → %10 indirim\n`
       + `🎟 <strong>ILKALIS20</strong> → %20 ilk alışveriş indirimi\n`
       + `🎟 <strong>KARGO</strong> → Ücretsiz kargo\n`
       + `🎟 <strong>HEDIYE50</strong> → 50 TL indirim\n`
       + `🎟 <strong>SHOPX5</strong> → %5 ek indirim\n\n`
       + `Sepet ekranındaki "Kupon kodu" kutusuna yazıp uygulayın.`,
    },
    {
      id: 'iade',
      q: 'İade nasıl yapılır?',
      a: `İade koşulları:\n\n`
       + `• <strong>14 gün</strong> iade hakkınız bulunmaktadır\n`
       + `• Ürün orijinal ambalajında olmalıdır\n`
       + `• İade kargo ücreti alınmaz\n\n`
       + `Detaylar için: Üst menü → Yardım → İade & Değişim`,
    },
    {
      id: 'sepet',
      q: 'Sepetim ne durumda?',
      a: State.cart.length === 0
        ? `Sepetiniz şu an boş. Yukarıdaki önerilen ürünlere göz atabilirsiniz!\n\nOrtalama ürün fiyatımız <strong>${fmt(s.avgPrice)} TL</strong>.`
        : (() => {
            const t = calcCartTotals();
            return `Sepetinizde <strong>${State.cart.reduce((x,i)=>x+i.qty,0)} ürün</strong> var.\n\n`
              + `💰 Ara toplam: <strong>${fmt(t.subtotal)} TL</strong>\n`
              + `${t.totalDiscountAmt > 0 ? `🎉 İndirim: <strong>−${fmt(t.totalDiscountAmt)} TL</strong>\n` : ''}`
              + `🚚 Kargo: <strong>${t.freeShipping ? 'Ücretsiz' : '29,90 TL'}</strong>\n`
              + `✅ Toplam: <strong>${fmt(t.total)} TL</strong>`;
          })(),
    },
  ];
}

// Anahtar kelime → soru id eşlemesi
const VA_KEYWORDS = [
  { keys: ['kargo','kargo','teslimat','ücretsiz kargo','nakliye'], id: 'kargo'  },
  { keys: ['indirim','kampanya','fırsat','ucuz','sale','indirimli','iskonto'], id: 'indirim' },
  { keys: ['fiyat','para','bütçe','kaç tl','ne kadar','ücret'],   id: 'fiyat'  },
  { keys: ['öneri','tavsiye','ne alayım','iyi','beğen','popüler','öner'], id: 'oneri'  },
  { keys: ['üyelik','üye','gold','silver','platin','bronz','gümüş','altın'], id: 'uyelik' },
  { keys: ['kupon','kod','voucher','indirim kodu'],                id: 'kupon'  },
  { keys: ['iade','return','değişim','iptal'],                    id: 'iade'   },
  { keys: ['sepet','cart','toplam','ödeme'],                      id: 'sepet'  },
];

function toggleAssistant() {
  const panel = document.getElementById('va-panel');
  if (!panel) return;
  const isOpen = panel.classList.contains('va-open');
  if (isOpen) { closeAssistant(); return; }
  panel.classList.add('va-open');
  const badge = document.getElementById('va-badge');
  if (badge) badge.style.display = 'none';
  const msgs = document.getElementById('va-messages');
  if (msgs && msgs.children.length === 0) _vaWelcome();
  logAction('Sanal asistan açıldı', 'ui');
}

function closeAssistant() {
  const panel = document.getElementById('va-panel');
  if (panel) panel.classList.remove('va-open');
}

function _vaWelcome() {
  const s = _vaStats();
  const catName = State.gender === 'female' ? 'Kadın' : State.gender === 'male' ? 'Erkek' : '';
  const intro = s
    ? `Merhaba! 👋 Ben <strong>ShopX Asistanı</strong>.<br>${catName ? `<strong>${catName}</strong> kategorisinde ` : ''}${s.products.length} ürün, ortalama <strong>${s.avgPrice.toLocaleString('tr-TR')} TL</strong> ile hizmetinizdeyim!`
    : `Merhaba! 👋 Ben <strong>ShopX Asistanı</strong>. Size nasıl yardımcı olabilirim?`;
  _vaAddMsg('bot', intro);
  setTimeout(_vaShowQuickReplies, 700);
}

function _vaAddMsg(role, html, bubbleClass) {
  const msgs = document.getElementById('va-messages');
  if (!msgs) return;
  const div = document.createElement('div');
  div.className = `va-msg va-msg-${role} va-msg-in`;
  div.innerHTML = `<div class="va-bubble${bubbleClass ? ' ' + bubbleClass : ''}">${html.replace(/\n/g, '<br>')}</div>`;
  msgs.appendChild(div);
  msgs.scrollTop = msgs.scrollHeight;
}

function _vaTyping() {
  const msgs = document.getElementById('va-messages');
  if (!msgs) return null;
  const div = document.createElement('div');
  div.className = 'va-msg va-msg-bot va-msg-in';
  div.id = 'va-typing';
  div.innerHTML = '<div class="va-bubble va-typing-bubble"><span></span><span></span><span></span></div>';
  msgs.appendChild(div);
  msgs.scrollTop = msgs.scrollHeight;
  return div;
}

function _vaShowQuickReplies() {
  const qr = document.getElementById('va-quick-replies');
  if (!qr) return;
  qr.innerHTML = _buildVAResponses().map(item =>
    `<button class="va-qr-btn" onclick="vaAnswer('${item.id}')">${item.q}</button>`
  ).join('');
}

function vaAnswer(id) {
  const responses = _buildVAResponses();
  const item = responses.find(x => x.id === id);
  if (!item) return;
  const qr = document.getElementById('va-quick-replies');
  if (qr) qr.innerHTML = '';
  _vaAddMsg('user', item.q);
  const typing = _vaTyping();
  setTimeout(() => {
    if (typing) typing.remove();
    _vaAddMsg('bot', item.a);
    setTimeout(() => {
      _vaAddMsg('bot', 'Başka bir konuda yardımcı olabilir miyim?');
      setTimeout(_vaShowQuickReplies, 350);
    }, 700);
  }, 850);
  logAction(`Asistan sorusu: ${item.q}`, 'ui');
}

const VA_SELF_INTRO_KEYS = [
  'kimsin','kim sin','sen kimsin','sen kim','adın ne','ismin ne','ismin','tanıt kendini',
  'hangi yapay','claude','chatgpt','yapay zeka mısın','robot musun','asistan kimsin',
  'seni kim yaptı','nereden geliyorsun','seni tanıyalım',
];

const VA_SAD_RESPONSES = [
  'Üzgünüm, bu konuda size yardımcı olamıyorum 😢\n\nBen yalnızca ShopX alışveriş asistanıyım. Ürünler, kargo, indirimler veya üyelik konularında seve seve yardımcı olurum!',
  'Ah, bu soruyu cevaplayamıyorum 😔\n\nBu konu biraz dışımda kaldı. Ama alışveriş hakkında her şeyi biliyorum, sormaktan çekinme!',
  'Üzülüyorum ama bu konuda elimden bir şey gelmiyor 😢\n\nAlışveriş dışı konularda pek uzman değilim. Aşağıdan bir konu seçebilirsin!',
  'Keşke yardımcı olabilseydim... ama bu konu benim alanım dışında 😔\n\nÜrün önerisi, kampanyalar veya kargo hakkında sorularını bekliyorum!',
];

function sendVAMessage() {
  const input = document.getElementById('va-input');
  if (!input || !input.value.trim()) return;
  const raw  = input.value.trim();
  const text = raw.toLowerCase();
  input.value = '';
  const qr = document.getElementById('va-quick-replies');
  if (qr) qr.innerHTML = '';
  _vaAddMsg('user', raw);

  const typing = _vaTyping();

  // Kimlik sorusu kontrolü
  if (VA_SELF_INTRO_KEYS.some(k => text.includes(k))) {
    setTimeout(() => {
      if (typing) typing.remove();
      _vaAddMsg('bot',
        'Merhaba! Ben <strong>ShopX AI Asistanı</strong> 🤖\n\n'
        + 'ShopX\'in alışveriş deneyimini kolaylaştırmak için geliştirilen yapay zeka destekli asistanım. '
        + 'Ürün önerileri, fiyat analizi, kampanya bilgisi, kargo & iade konularında size yardımcı olmak için buradayım.\n\n'
        + '<em>Herhangi bir alışveriş sorunuz için bana yazabilirsiniz!</em>'
      );
      setTimeout(_vaShowQuickReplies, 400);
    }, 800);
    return;
  }

  // Anahtar kelime eşleştirme
  let matchedId = null;
  for (const entry of VA_KEYWORDS) {
    if (entry.keys.some(k => text.includes(k))) { matchedId = entry.id; break; }
  }

  setTimeout(() => {
    if (typing) typing.remove();
    if (matchedId) {
      const responses = _buildVAResponses();
      const item = responses.find(x => x.id === matchedId);
      if (item) { _vaAddMsg('bot', item.a); setTimeout(_vaShowQuickReplies, 350); return; }
    }
    // Konu dışı sorularda üzgün fallback
    const sad = VA_SAD_RESPONSES[Math.floor(Math.random() * VA_SAD_RESPONSES.length)];
    _vaAddMsg('bot', sad, 'va-sad');
    setTimeout(_vaShowQuickReplies, 400);
  }, 900);
}

// ── ACCOUNT MODAL ─────────────────────────────────────────
function openAccount() {
  logAction('Hesabım açıldı', 'ui');
  const m = document.getElementById('account-modal');
  m.style.display = 'block';
  document.getElementById('account-overlay').classList.add('active');
  setTimeout(() => m.classList.add('open'), 10);
  document.getElementById('account-content').innerHTML = `
    <h2 class="info-modal-title">👤 Hesabım</h2>

    <div class="gift-balance-card">
      <div class="gift-balance-info">
        <span class="gift-balance-label">🎁 Hediye Param</span>
        <span class="gift-balance-amount">${State.giftBalance.toLocaleString('tr-TR')} TL</span>
        <span class="gift-balance-note">Sepette kullanılabilir</span>
      </div>
      <span style="font-size:2.2rem">🎁</span>
    </div>

    <div class="membership-section">
      <div class="membership-section-title">⭐ Üyelik Seviyem</div>
      <div class="membership-cards">
        ${Object.entries(MEMBERSHIPS).map(([key, val]) => `
        <div class="membership-card ${State.membership === key ? 'active' : ''}" id="mem-card-${key}" onclick="selectMembership('${key}')">
          <div class="membership-card-icon">${val.icon}</div>
          <div class="membership-card-name">${val.label}</div>
          <div class="membership-card-info">${val.discount > 0 ? `%${val.discount} indirim` : 'Temel üyelik'}${val.freeShipping ? ' · Ücretsiz kargo' : ''}</div>
          <div class="membership-card-check">${State.membership === key ? '✓ Aktif' : ''}</div>
        </div>`).join('')}
      </div>
    </div>

    <div class="checkout-form" style="margin-top:4px">
      <div class="form-group"><label class="form-label">E-posta</label><input class="form-input" placeholder="ornek@email.com" /></div>
      <div class="form-group"><label class="form-label">Şifre</label><input class="form-input" type="password" placeholder="••••••••" /></div>
    </div>
    <button class="checkout-next-btn" onclick="fakeLogin()">Giriş Yap</button>
    <div style="text-align:center;margin-top:12px;font-size:.82rem;color:var(--text-muted)">Hesabın yok mu? <a href="#" style="color:var(--accent);font-weight:700" onclick="showToast('Kayıt sayfası yakında!','info')">Üye Ol</a></div>`;
  document.body.style.overflow = 'hidden';
}

function closeAccount() {
  const m = document.getElementById('account-modal');
  m.classList.remove('open');
  setTimeout(() => { m.style.display = 'none'; }, 300);
  document.getElementById('account-overlay').classList.remove('active');
  document.body.style.overflow = '';
}

function fakeLogin() {
  logAction('Giriş yapıldı (simülasyon)', 'system');
  closeAccount();
  showToast('✅ Giriş başarılı! Hoş geldiniz.', 'success');
}

// ── BUDGET FILTER MODAL ───────────────────────────────────
function openBudgetFilterModal() {
  logAction('Bütçe güncelleme modalı açıldı', 'ui');
  const m = document.getElementById('budget-filter-modal');
  m.style.display = 'block';
  document.getElementById('budget-filter-overlay').classList.add('active');
  setTimeout(() => m.classList.add('open'), 10);
  document.getElementById('budget-filter-content').innerHTML = `
    <h2 class="info-modal-title">💰 Bütçeni Güncelle</h2>
    <p style="color:var(--text-muted);font-size:.88rem;margin-bottom:20px">Önerilen ürünler bütçene göre filtrelenecek.</p>
    <div class="budget-options" style="max-width:100%">
      ${[['low', '500 TL Altı', '💸'], ['medium', '500-1500 TL', '💳'], ['high', '1500-3500 TL', '💰'], ['luxury', '3500+ TL', '👑'], ['any', 'Tümünü Göster', '🛍']].map(([val, label, em]) => `
      <div class="payment-method-option ${State.budget === val ? 'selected' : ''}" onclick="updateBudget('${val}','${label}')">
        <span class="payment-method-icon">${em}</span>
        <div class="payment-method-info"><div class="payment-method-name">${label}</div></div>
      </div>`).join('')}
    </div>`;
  document.body.style.overflow = 'hidden';
}

function closeBudgetFilterModal() {
  const m = document.getElementById('budget-filter-modal');
  m.classList.remove('open');
  setTimeout(() => { m.style.display = 'none'; }, 300);
  document.getElementById('budget-filter-overlay').classList.remove('active');
  document.body.style.overflow = '';
}

function updateBudget(val, label) {
  State.budget = val; State.budgetLabel = label;
  logAction(`Bütçe güncellendi: ${label}`, 'system');
  updateBudgetBanner();
  buildRecommendedProducts(getFilteredByBudget(getProducts(State.gender)).slice(0, 5));
  closeBudgetFilterModal();
  showToast(`💰 Bütçe "${label}" olarak güncellendi`, 'success');
}

// ── LOG PANEL (hidden access) ──────────────────────────────
function openLogPanel() {
  State.logOpen = true;
  const p = document.getElementById('log-panel');
  p.style.display = 'flex';
  setTimeout(() => p.classList.add('open'), 10);
  logAction('Sistem raporu açıldı', 'system');
}

function closeLogPanel() {
  State.logOpen = false;
  const p = document.getElementById('log-panel');
  p.classList.remove('open');
  setTimeout(() => { p.style.display = 'none'; }, 300);
}

function toggleLogFilter() {
  State.logFilterOpen = !State.logFilterOpen;
  document.getElementById('log-filter-bar').classList.toggle('open', State.logFilterOpen);
}

function filterLogs(type, btn) {
  State.logFilter = type;
  document.querySelectorAll('.log-filter-chip').forEach(c => c.classList.remove('active'));
  btn.classList.add('active');
  document.querySelectorAll('.log-entry').forEach(el => {
    el.classList.toggle('hidden', type !== 'all' && el.dataset.type !== type);
  });
}

function clearLogs() {
  if (!confirm('Tüm log kayıtlarını silmek istiyor musunuz?')) return;
  State.logs = [];
  document.getElementById('log-entries').innerHTML = '';
  updateLogCount();
  logAction('Loglar temizlendi', 'system');
}

function exportLogs() {
  const lines = State.logs.map(e => `[${e.timestamp}] [${e.type.toUpperCase()}] [${e.gender || 'genel'}] ${e.msg}`).join('\n');
  const blob = new Blob([`ShopX Sistem Aktivite Raporu\nTarih: ${new Date().toLocaleString('tr-TR')}\nToplam: ${State.logs.length} kayıt\n${'─'.repeat(60)}\n\n` + lines], { type: 'text/plain;charset=utf-8' });
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
  a.download = `shopx-activity-${Date.now()}.txt`; a.click();
  URL.revokeObjectURL(a.href);
  logAction(`Rapor indirildi (${State.logs.length} kayıt)`, 'system');
  showToast('📥 Aktivite raporu indirildi', 'success');
}

// ── LOGO SECRET CLICK ─────────────────────────────────────
function handleLogoClick() {
  logAction('Logo tıklandı', 'navigation');
  goHome();
  State.logoClickCount++;
  clearTimeout(State.logoClickTimer);
  State.logoClickTimer = setTimeout(() => { State.logoClickCount = 0; }, 1500);
  if (State.logoClickCount >= 5) {
    State.logoClickCount = 0;
    State.logOpen ? closeLogPanel() : openLogPanel();
  }
}

// ── TIMERS ────────────────────────────────────────────────
function startCountdown() {
  clearInterval(State.countdownInterval);
  State.countdownInterval = setInterval(() => {
    if (State.countdownSecs <= 0) { clearInterval(State.countdownInterval); return; }
    State.countdownSecs--;
    const h = Math.floor(State.countdownSecs / 3600), m = Math.floor((State.countdownSecs % 3600) / 60), s = State.countdownSecs % 60;
    const pad = n => String(n).padStart(2, '0');
    const he = document.getElementById('cd-h'), me = document.getElementById('cd-m'), se = document.getElementById('cd-s');
    if (he) he.textContent = pad(h); if (me) me.textContent = pad(m); if (se) se.textContent = pad(s);
  }, 1000);
}

function startSessionTimer() {
  setInterval(() => {
    const elapsed = Math.floor((Date.now() - State.sessionStart) / 1000);
    const m = Math.floor(elapsed / 60), s = elapsed % 60;
    const el = document.getElementById('log-session-time');
    if (el) el.textContent = `Oturum: ${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }, 1000);
}

// ── TOAST ─────────────────────────────────────────────────
function showToast(msg, type = 'info') {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = msg;
  container.appendChild(toast);
  setTimeout(() => { toast.classList.add('toast-out'); toast.addEventListener('animationend', () => toast.remove()); }, 3200);
}

// ── KEYBOARD ──────────────────────────────────────────────
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    closeProduct(); closeCart(); closeFavorites();
    closeCheckout(); closeHelp(); closeInfoModal();
    closeOrderTracking(); closeAccount(); closeBudgetFilterModal();
    closeFlashPopup();
    document.getElementById('search-suggestions').style.display = 'none';
  }
  // Secret: Ctrl+Shift+L opens log panel
  if (e.key === 'L' && e.ctrlKey && e.shiftKey) {
    e.preventDefault();
    State.logOpen ? closeLogPanel() : openLogPanel();
  }
});

document.addEventListener('click', e => {
  if (!e.target.closest('#search-container')) {
    const sug = document.getElementById('search-suggestions');
    if (sug) sug.style.display = 'none';
  }
});

// ── PAGE VISIBILITY ───────────────────────────────────────
document.addEventListener('visibilitychange', () => {
  if (State.gender) logAction(document.hidden ? 'Kullanıcı sayfadan ayrıldı' : 'Kullanıcı sayfaya geri döndü', 'system');
});

let lastScrollLog = 0;
window.addEventListener('scroll', () => {
  const now = Date.now();
  if (now - lastScrollLog > 4000 && State.gender) {
    lastScrollLog = now;
    const pct = Math.round((window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100);
    logAction(`Sayfa kaydırıldı: %${pct}`, 'ui');
  }
}, { passive: true });

// ── HOVER LOG ─────────────────────────────────────────────
const _hoverStart = {};
document.addEventListener('mouseover', e => {
  const card = e.target.closest('.product-card');
  if (!card || !State.gender) return;
  if (!_hoverStart[card.id]) _hoverStart[card.id] = Date.now();
}, { passive: true });

document.addEventListener('mouseout', e => {
  const card = e.target.closest('.product-card');
  if (!card) return;
  if (e.relatedTarget && card.contains(e.relatedTarget)) return;
  const start = _hoverStart[card.id];
  if (!start) return;
  delete _hoverStart[card.id];
  const ms = Date.now() - start;
  if (ms >= 1500 && State.gender) {
    const secs = (ms / 1000).toFixed(1);
    const pid = card.id.replace('pcard-', '');
    const p = getProducts(State.gender).find(x => x.id === pid);
    if (p) logAction(`Ürün üzerinde ${secs}s beklendi: ${p.name} (${p.brand})`, 'product');
  }
}, { passive: true });

// ── INIT ──────────────────────────────────────────────────
// ── SLIDER YARDIMCISİ ─────────────────────────────────────
function updateSlider(el, valId) {
  const pct = ((el.value - el.min) / (el.max - el.min)) * 100;
  el.style.setProperty('--fill', pct + '%');
  const valEl = document.getElementById(valId);
  if (valEl) valEl.textContent = parseInt(el.value).toLocaleString('tr-TR') + ' TL';
}

// ── GENDER SCREEN TEMA TOGGLE ─────────────────────────────
function toggleGenderTheme() {
  const screen = document.getElementById('gender-screen');
  const icon   = document.getElementById('toggle-icon');
  const label  = document.getElementById('toggle-label');
  const isLight = screen.classList.toggle('light-mode');
  icon.textContent  = isLight ? '🌙' : '☀️';
  label.textContent = isLight ? 'Koyu Tema' : 'Açık Tema';
  localStorage.setItem('shopx-gender-theme', isLight ? 'light' : 'dark');
}

function _applyGenderTheme() {
  const saved = localStorage.getItem('shopx-gender-theme');
  if (saved === 'light') {
    const screen = document.getElementById('gender-screen');
    const icon   = document.getElementById('toggle-icon');
    const label  = document.getElementById('toggle-label');
    screen.classList.add('light-mode');
    icon.textContent  = '🌙';
    label.textContent = 'Koyu Tema';
  }
}

window.addEventListener('DOMContentLoaded', () => {
  _applyGenderTheme();
  logAction('ShopX yüklendi – Cinsiyet seçim ekranı gösterildi', 'system');
  // Sunucu yanıt verene kadar uyarıyı göster; session_status gelince güncellenir
  _showNoSessionWarning(true);
});

// ── EXPOSE GLOBALS (for HTML onclick handlers) ─────────────
Object.assign(window, {
  selectGender, highlightBudget, goToShopFromBudget, selectBudget, switchGender,
  navClick, categoryClick, showCategoryPage, goHome, sortProducts,
  slideBanner, goToSlide,
  openProduct, closeProduct, changeModalQty, addToCartFromModal,
  addToCart, removeFromCart, changeQty, openCart, closeCart,
  toggleFavorite, openFavorites, closeFavorites,
  handleSearchInput, doSearch,
  openCheckout, closeCheckout, renderCheckoutStep, submitAddress,
  selectPaymentMethod, formatCard, processPayment, clearCartAfterOrder,
  openHelp, closeHelp, switchHelpTab,
  openOrderTracking, closeOrderTracking, submitTracking,
  openInfoModal, closeInfoModal,
  openAccount, closeAccount, fakeLogin,
  openBudgetFilterModal, closeBudgetFilterModal, updateBudget,
  askPurposeThenAdd, askPurposeThenAddFromModal, openPurposeModal, closePurposeModal, confirmPurpose, confirmCustomPurpose,
  openFinancialModal, closeFinancialModal, saveFinancial,
  openLogPanel, closeLogPanel, toggleLogFilter, filterLogs, clearLogs, exportLogs,
  showFlashPopup, closeFlashPopup,
  handleLogoClick,
  resetToInitial, _showNoSessionWarning,
  toggleGenderTheme,
  updateSlider,
  openBudgetUpgradeModal, closeBudgetUpgradeModal, applyBudgetUpgrade,
  applyCoupon, removeCoupon,
  applyGiftBalance, removeGiftBalance,
  selectMembership,
  addToCompare, removeFromCompare, clearCompare, openCompareModal, closeCompareModal,
  toggleAssistant, closeAssistant, vaAnswer, sendVAMessage,
});
