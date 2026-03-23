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
};

// ── DATA ──────────────────────────────────────────────────
const DATA = {
  female: {
    nav: [
      { label: 'Kadın', cat: 'kadin' }, { label: 'Ayakkabı', cat: 'ayakkabi' },
      { label: 'Çanta & Aksesuar', cat: 'canta' }, { label: 'Güzellik', cat: 'guzellik' },
      { label: 'Spor', cat: 'spor' }, { label: 'Ev & Yaşam', cat: 'ev' },
      { label: 'Elektronik', cat: 'elektronik' }, { label: '🔥 İndirim', cat: 'indirim', sale: true },
    ],
    categories: [
      { icon: '👗', label: 'Elbise', id: 'elbise' }, { icon: '👠', label: 'Ayakkabı', id: 'ayakkabi' },
      { icon: '👜', label: 'Çanta', id: 'canta' }, { icon: '💄', label: 'Makyaj', id: 'makyaj' },
      { icon: '💅', label: 'Oje & Bakım', id: 'oje' }, { icon: '🧴', label: 'Cilt Bakımı', id: 'cilt' },
      { icon: '💍', label: 'Takı', id: 'taki' }, { icon: '🏋️‍♀️', label: 'Spor', id: 'spor' },
    ],
    banners: [
      { bg: 'linear-gradient(135deg,#6a0735 0%,#c2187a 50%,#ff9ec6 100%)', label: 'YENİ SEZON 2026', title: 'İlkbahar<br>Koleksiyonu', sub: 'Bin yeni ürün sizi bekliyor', cta: 'Keşfet', emoji: '🌸', cat: 'kadin' },
      { bg: 'linear-gradient(135deg,#0d47a1 0%,#7b1fa2 50%,#e91e8c 100%)', label: 'ÖZEL FİYATLAR', title: 'Çanta & Aksesuar<br>Fırsatları', sub: '%60\'a varan indirimler', cta: 'Alışverişe Başla', emoji: '👜', cat: 'canta' },
      { bg: 'linear-gradient(135deg,#1b5e20 0%,#388e3c 50%,#a5d6a7 100%)', label: 'GÜZELLİK DÜNYASI', title: 'Premium<br>Cilt Bakımı', sub: 'Dünyaca ünlü markalar burada', cta: 'Ürünlere Bak', emoji: '✨', cat: 'guzellik' },
    ],
    promos: [
      { bg: 'linear-gradient(135deg,#880e4f,#c2187a)', title: 'Yeni Gelenler', desc: 'Bu haftanın en yeni ürünleri', cat: 'kadin' },
      { bg: 'linear-gradient(135deg,#4a148c,#7b1fa2)', title: 'Güzellik Fırsatları', desc: '%50 indirimli ürünler', cat: 'guzellik' },
      { bg: 'linear-gradient(135deg,#bf360c,#e64a19)', title: 'Flash Satış', desc: 'Sadece 3 saat geçerli', cat: 'indirim' },
    ],
    products: [
      { id: 'f1', name: 'Çiçekli Midi Elbise', brand: 'Zara', price: 649, oldPrice: 1099, img: '👗', badge: 'sale', rating: 4.7, reviews: 342, desc: 'Şık çiçek baskısı ve body-fit kesimi ile bahar enerjisini yansıtan midi elbise. %100 viskon kumaş.', cat: 'elbise' },
      { id: 'f2', name: 'Deri Makyaj Çantası', brand: 'Aldo', price: 289, oldPrice: 459, img: '👜', badge: 'hot', rating: 4.5, reviews: 217, desc: 'İtalyan deri görünümlü, altın aplike detaylı, iç bölmeli makyaj çantası.', cat: 'canta' },
      { id: 'f3', name: 'Mat Ruj Seti 8\'li', brand: 'MAC', price: 435, oldPrice: null, img: '💄', badge: 'new', rating: 4.9, reviews: 891, desc: '8 farklı sezon tonu içeren uzun kalıcılıklı mat ruj seti. Vegan formula.', cat: 'makyaj' },
      { id: 'f4', name: 'Yüksek Topuklu Sandal', brand: 'Steve Madden', price: 879, oldPrice: 1249, img: '👠', badge: 'sale', rating: 4.3, reviews: 156, desc: 'Şık bilek askılı, 9cm topuklu sandalet. Yazın her kombinine uyar.', cat: 'ayakkabi' },
      { id: 'f5', name: 'Hyaluronik Asit Serum', brand: 'CeraVe', price: 299, oldPrice: 399, img: '🧴', badge: null, rating: 4.8, reviews: 1243, desc: 'Yoğun nemlendirici. Hassas ve kuru ciltler için dermatoloji onaylı.', cat: 'cilt' },
      { id: 'f6', name: 'Altın Kaplama Kolye Set', brand: 'Giulio', price: 524, oldPrice: 780, img: '💍', badge: 'sale', rating: 4.6, reviews: 489, desc: '3\'lü kolye set. 18 ayar altın kaplama. Alerjiye neden olmayan çelik alaşım.', cat: 'taki' },
      { id: 'f7', name: 'Yoga Tayt Seti', brand: 'Nike', price: 749, oldPrice: 999, img: '🏋️‍♀️', badge: 'hot', rating: 4.7, reviews: 672, desc: 'Esneme ve yoga için özel tasarlanmış, Dri-FIT teknolojili, yüksek bel tayt seti.', cat: 'spor' },
      { id: 'f8', name: 'Retinol Gece Kremi', brand: 'L\'Oréal', price: 189, oldPrice: 259, img: '✨', badge: null, rating: 4.5, reviews: 321, desc: 'Gece boyunca kırışıklıkları azaltan, cilt yenilemeyi destekleyen retinol bazlı krem.', cat: 'cilt' },
      { id: 'f9', name: 'Platform Spor Ayakkabı', brand: 'Adidas', price: 1299, oldPrice: 1699, img: '👟', badge: 'sale', rating: 4.8, reviews: 543, desc: 'Ultra Boost taban, platform tasarım. Hem şehir hem spor için ideal.', cat: 'ayakkabi' },
      { id: 'f10', name: 'Kadın Oversize Blazer', brand: 'Mango', price: 899, oldPrice: 1299, img: '👔', badge: 'new', rating: 4.6, reviews: 234, desc: 'Keten karışımlı kumaş, oversize kesim, klasik yaka ofis ve günlük kullanım.', cat: 'elbise' },
    ],
  },
  male: {
    nav: [
      { label: 'Erkek', cat: 'erkek' }, { label: 'Spor & Outdoor', cat: 'spor' },
      { label: 'Elektronik', cat: 'elektronik' }, { label: 'Ayakkabı', cat: 'ayakkabi' },
      { label: 'Saat & Aksesuar', cat: 'saat' }, { label: 'Outdoor & Kamp', cat: 'kamp' },
      { label: 'Oyun & Teknoloji', cat: 'oyun' }, { label: '🔥 Kampanyalar', cat: 'kampanya', sale: true },
    ],
    categories: [
      { icon: '👕', label: 'Üst Giyim', id: 'gomlek' }, { icon: '👖', label: 'Alt Giyim', id: 'alt' },
      { icon: '👟', label: 'Spor', id: 'spor-ayak' }, { icon: '🎮', label: 'Gaming', id: 'gaming' },
      { icon: '📱', label: 'Telefon', id: 'telefon' }, { icon: '⌚', label: 'Saat', id: 'saat' },
      { icon: '🎒', label: 'Çanta', id: 'erkek-canta' }, { icon: '🏕️', label: 'Outdoor', id: 'outdoor' },
    ],
    banners: [
      { bg: 'linear-gradient(135deg,#0a1f4e 0%,#1565c0 50%,#039be5 100%)', label: 'YENİ SEZON 2026', title: 'Erkek<br>Koleksiyonu', sub: 'En yeni spor ve günlük koleksiyonlar', cta: 'Keşfet', emoji: '👊', cat: 'erkek' },
      { bg: 'linear-gradient(135deg,#1a237e 0%,#283593 50%,#1976d2 100%)', label: 'GAMİNG FESTİVAL', title: 'Oyun<br>Dünyası', sub: 'En iyi gaming donanımları burada', cta: 'Mağazaya Git', emoji: '🎮', cat: 'oyun' },
      { bg: 'linear-gradient(135deg,#1b1b2e 0%,#004d40 50%,#00695c 100%)', label: 'OUTDOOR SEZONU', title: 'Dağ & Doğa<br>Ekipmanları', sub: 'Profesyonel outdoor markaları', cta: 'İncele', emoji: '🏕️', cat: 'kamp' },
    ],
    promos: [
      { bg: 'linear-gradient(135deg,#1a237e,#1565c0)', title: 'Gaming Haftası', desc: 'Donanımda büyük fırsatlar', cat: 'oyun' },
      { bg: 'linear-gradient(135deg,#263238,#37474f)', title: 'Spor Ekipmanları', desc: '%40\'a varan indirim', cat: 'spor' },
      { bg: 'linear-gradient(135deg,#004d40,#00695c)', title: 'Outdoor & Kamp', desc: 'Yeni sezon ekipmanları', cat: 'kamp' },
    ],
    products: [
      { id: 'm1', name: 'Slim Fit Denim Pantolon', brand: 'Levi\'s', price: 799, oldPrice: 1099, img: '👖', badge: 'sale', rating: 4.8, reviews: 1023, desc: 'Slim fit kesim, stretch denim kumaş. 5 cep model, koyu indigo yıkama.', cat: 'alt' },
      { id: 'm2', name: 'Gaming Kulaklık 7.1', brand: 'Razer', price: 1599, oldPrice: 2199, img: '🎧', badge: 'hot', rating: 4.9, reviews: 756, desc: 'USB 7.1 surround ses, konfor yastıklı, geri çekilebilir mikrofon. RGB aydınlatma.', cat: 'gaming' },
      { id: 'm3', name: 'Akıllı Spor Saat Pro', brand: 'Garmin', price: 3299, oldPrice: 4199, img: '⌚', badge: 'new', rating: 4.7, reviews: 432, desc: 'GPS takip, kalp atışı sensörü, 14 gün pil ömrü. 50m su geçirmez.', cat: 'saat' },
      { id: 'm4', name: 'Air Jordan Retro High', brand: 'Nike', price: 2499, oldPrice: 3299, img: '👟', badge: 'sale', rating: 4.9, reviews: 2312, desc: 'Kimseye yetmeyen Air Jordan Retro High OG. Orijinal renk blokajı, gerçek deri.', cat: 'spor-ayak' },
      { id: 'm5', name: 'Mekanik Oyun Klavyesi', brand: 'Corsair', price: 2199, oldPrice: null, img: '⌨️', badge: 'hot', rating: 4.8, reviews: 891, desc: 'Cherry MX Red switch, tam boyut, RGB per-key aydınlatma, alüminyum gövde.', cat: 'gaming' },
      { id: 'm6', name: 'Oversize Kapüşon Sweat', brand: 'Champion', price: 549, oldPrice: 799, img: '👕', badge: null, rating: 4.6, reviews: 654, desc: 'Oversize kalıp, fleece iç yüzey, önde kanguru cep. 5 renk seçeneği.', cat: 'gomlek' },
      { id: 'm7', name: 'Pro Gaming Mouse', brand: 'Logitech', price: 899, oldPrice: 1199, img: '🖱️', badge: 'sale', rating: 4.9, reviews: 1456, desc: 'HERO 25K sensör, 100-25600 DPI, 6 programlanabilir tuş, şarj edilebilir.', cat: 'gaming' },
      { id: 'm8', name: 'Dağcı Sırt Çantası 45L', brand: 'Decathlon', price: 1199, oldPrice: 1699, img: '🎒', badge: null, rating: 4.7, reviews: 324, desc: '45L kapasite, yağmur kılıfı dahil, laptop bölmeli, bel destek sistemi.', cat: 'outdoor' },
      { id: 'm9', name: 'Kablosuz Kulaklık NC', brand: 'Sony', price: 4299, oldPrice: 5499, img: '🎵', badge: 'sale', rating: 4.9, reviews: 3241, desc: 'WH-1000XM5 aktif gürültü engelleme, 30 saat pil, multipoint bağlantı.', cat: 'gaming' },
      { id: 'm10', name: 'Running Pro Spor Ayakkabı', brand: 'Adidas', price: 1699, oldPrice: 2199, img: '🏃', badge: 'new', rating: 4.8, reviews: 876, desc: 'Ultraboost 23, karbon plaka ara sole. Maraton ve günlük koşu için optimize.', cat: 'spor-ayak' },
    ],
  },
};

// Budget price limits
const BUDGET_LIMITS = { low: [0, 500], medium: [500, 1500], high: [1500, 3500], luxury: [3500, 99999], any: [0, 99999] };

// ── ADMIN BRIDGE (BroadcastChannel) ─────────────────────
const _adminBC = new BroadcastChannel('shopx_admin_bridge');

// Listen for commands from admin panel
_adminBC.onmessage = (event) => {
  const { type, cmd } = event.data || {};
  if (type === 'PING') {
    // Admin panel just connected – send heartbeat immediately
    _adminBC.postMessage({ type: 'HEARTBEAT' });
    return;
  }
  if (type !== 'COMMAND') return;

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
    case 'SHOW_TOAST': {
      const { msg, toastType } = event.data;
      showToast(msg || '📢 Mesaj', toastType || 'info');
      break;
    }
    case 'SHOW_CUSTOM_POPUP': {
      const { title, body } = event.data;
      _showCustomAdminPopup(title, body);
      break;
    }
    default: break;
  }
  // ACK back to admin
  _adminBC.postMessage({ type: 'ACK', payload: { cmd } });
};

// Send heartbeat every 3 seconds so admin knows main site is open
setInterval(() => _adminBC.postMessage({ type: 'HEARTBEAT' }), 3000);

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
  // 📡 Broadcast to admin panel
  _adminBC.postMessage({ type: 'LOG', payload: entry });
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
  // Show budget step
  document.getElementById('gender-step-1').classList.add('hidden');
  document.getElementById('budget-gender-icon').textContent = gender === 'female' ? '👩' : '👨';
  document.getElementById('gender-step-2').classList.remove('hidden');
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
  document.body.className = '';
  const ss = document.getElementById('shop-screen');
  ss.style.transition = 'opacity 0.35s ease'; ss.style.opacity = '0';
  setTimeout(() => {
    ss.classList.add('hidden');
    document.getElementById('gender-step-1').classList.remove('hidden');
    document.getElementById('gender-step-2').classList.add('hidden');
    const gs = document.getElementById('gender-screen');
    gs.classList.remove('hidden'); gs.style.opacity = '0'; gs.style.transform = 'scale(0.96)';
    setTimeout(() => { gs.style.transition = 'opacity 0.4s ease, transform 0.4s ease'; gs.style.opacity = '1'; gs.style.transform = 'scale(1)'; }, 20);
  }, 350);
}

// ── SHOP INIT ─────────────────────────────────────────────
function initShop() {
  const d = DATA[State.gender];
  buildNav(d.nav); buildCategories(d.categories); buildBanners(d.banners);
  buildFlashProducts(d.products.slice(0, 5));
  buildRecommendedProducts(getFilteredByBudget(d.products).slice(0, 5));
  buildMoreProducts(d.products.slice(5));
  buildPromos(d.promos);
  updateGenderBadge(); updateBudgetBanner();
  startCountdown(); startBannerAuto(); startSessionTimer();
  updateCartUI(); updateFavUI();
  logAction(`Mağaza yüklendi – ${State.gender === 'female' ? 'Kadın' : 'Erkek'} | Bütçe: ${State.budgetLabel || 'Belirtilmedi'}`, 'system');
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
  if (State.budgetLabel && State.budget !== 'any') {
    lbl.textContent = `💰 ${State.budgetLabel} bütçe için ürünler`;
    sub.textContent = 'Bütçeni değiştirmek için tıkla';
  } else {
    lbl.textContent = '💰 Bütçene Göre Ürünler';
    sub.textContent = 'Bütçe tercihin güncellemek için tıkla';
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
  const d = DATA[State.gender];
  let filtered = d.products;
  if (cat === 'indirim' || cat === 'kampanya') filtered = d.products.filter(p => p.badge === 'sale' || p.oldPrice);
  else filtered = d.products.filter(p => p.cat === cat || cat === d.nav[0].cat);
  if (filtered.length === 0) filtered = d.products;
  showCategoryPage(cat, label, filtered);
}

// ── CATEGORIES ────────────────────────────────────────────
function buildCategories(cats) {
  const grid = document.getElementById('categories-grid');
  grid.innerHTML = cats.map(c => `<div class="category-card" id="cat-${c.id}" onclick="categoryClick('${c.id}','${c.label}')" tabindex="0"><div class="cat-icon-wrap">${c.icon}</div><span class="cat-label">${c.label}</span></div>`).join('');
}

function categoryClick(id, label) {
  logAction(`Kategori seçildi: ${label}`, 'navigation');
  const d = DATA[State.gender];
  let filtered = d.products.filter(p => p.cat === id);
  if (filtered.length === 0) filtered = d.products;
  showCategoryPage(id, label, filtered);
}

// ── CATEGORY PAGE VIEW ────────────────────────────────────
function showCategoryPage(cat, title, products) {
  if (!products) {
    const d = DATA[State.gender];
    if (cat === 'flash') products = d.products.slice(0, 5);
    else if (cat === 'recommended') products = getFilteredByBudget(d.products);
    else if (cat === 'bestseller') products = d.products.slice(5);
    else products = d.products;
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
      <div style="position:absolute;right:10%;top:50%;transform:translateY(-50%);font-size:7rem;opacity:0.25;pointer-events:none">${b.emoji}</div>
      <div class="banner-slide-content">
        <span class="banner-slide-label">${b.label}</span>
        <h2 class="banner-slide-title">${b.title}</h2>
        <p class="banner-slide-sub">${b.sub}</p>
        <button class="banner-cta" onclick="event.stopPropagation();showCategoryPage('${b.cat}','${b.label}')">${b.cta}</button>
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
function buildProductCard(p, section) {
  const discount = p.oldPrice ? Math.round((1 - p.price / p.oldPrice) * 100) : null;
  const isFav = State.favorites.includes(p.id);
  return `
  <div class="product-card" id="pcard-${p.id}" onclick="openProduct('${p.id}')" data-section="${section}">
    <div class="product-img-wrap">
      ${p.badge ? `<span class="product-badge badge-${p.badge}">${p.badge === 'sale' ? 'İndirim' : p.badge === 'new' ? 'Yeni' : 'Popüler'}</span>` : ''}
      <button class="product-fav-btn ${isFav ? 'active' : ''}" id="fav-btn-${p.id}" onclick="event.stopPropagation();toggleFavorite('${p.id}')" aria-label="Favorilere ekle">${isFav ? '❤️' : '🤍'}</button>
      <div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:5rem;background:var(--surface-2);">${p.img}</div>
    </div>
    <div class="product-body">
      <div class="product-brand">${p.brand}</div>
      <div class="product-name">${p.name}</div>
      <div class="product-rating">
        <span class="stars">${'★'.repeat(Math.floor(p.rating))}${'☆'.repeat(5 - Math.floor(p.rating))}</span>
        <span class="rating-count">(${p.reviews})</span>
      </div>
      <div class="product-price-row">
        <span class="product-price">${p.price.toLocaleString('tr-TR')} TL</span>
        ${p.oldPrice ? `<span class="product-old-price">${p.oldPrice.toLocaleString('tr-TR')} TL</span>` : ''}
        ${discount ? `<span class="product-discount">%${discount}</span>` : ''}
      </div>
      <button class="product-add-btn" onclick="event.stopPropagation();addToCart('${p.id}')">🛒 Sepete Ekle</button>
    </div>
  </div>`;
}

function buildFlashProducts(products) { document.getElementById('flash-products-grid').innerHTML = products.map(p => buildProductCard(p, 'flash')).join(''); }
function buildRecommendedProducts(products) {
  document.getElementById('recommended-title').textContent = State.gender === 'female' ? '💅 Sana Özel Öneriler' : '🎯 Sana Özel Öneriler';
  document.getElementById('recommended-products-grid').innerHTML = (products.length ? products : DATA[State.gender].products.slice(0, 5)).sort(() => Math.random() - 0.5).map(p => buildProductCard(p, 'recommended')).join('');
}
function buildMoreProducts(products) { document.getElementById('more-products-grid').innerHTML = products.map(p => buildProductCard(p, 'more')).join(''); }

function buildPromos(promos) {
  document.getElementById('promo-grid').innerHTML = promos.map(p => `<div class="promo-card" style="background:${p.bg}" onclick="showCategoryPage('${p.cat}','${p.title}'); return false;"><h3>${p.title}</h3><p>${p.desc}</p></div>`).join('');
}

// ── PRODUCT MODAL ─────────────────────────────────────────
function openProduct(id) {
  const p = DATA[State.gender].products.find(x => x.id === id);
  if (!p) return;
  State.modalProduct = p; State.modalQty = 1;
  logAction(`Ürün görüntülendi: ${p.name} (${p.brand}) – ${p.price} TL`, 'product');
  const discount = p.oldPrice ? Math.round((1 - p.price / p.oldPrice) * 100) : null;
  const isFav = State.favorites.includes(p.id);
  document.getElementById('product-modal-inner').innerHTML = `
    <div class="modal-img-side"><div style="font-size:9rem;text-align:center;">${p.img}</div></div>
    <div class="modal-info-side">
      <div class="modal-brand">${p.brand}</div>
      <h2 class="modal-name">${p.name}</h2>
      <div class="modal-rating">
        <span class="stars">${'★'.repeat(Math.floor(p.rating))}${'☆'.repeat(5 - Math.floor(p.rating))}</span>
        <span style="font-size:.85rem;font-weight:600">${p.rating}</span>
        <span style="font-size:.8rem;color:var(--text-muted)">(${p.reviews} değerlendirme)</span>
      </div>
      <div class="modal-price-row">
        <span class="modal-price">${p.price.toLocaleString('tr-TR')} TL</span>
        ${p.oldPrice ? `<span class="modal-old-price">${p.oldPrice.toLocaleString('tr-TR')} TL</span>` : ''}
        ${discount ? `<span class="modal-discount">%${discount} İndirim</span>` : ''}
      </div>
      <p class="modal-desc">${p.desc}</p>
      <div class="modal-qty-row">
        <span class="modal-qty-label">Adet:</span>
        <div class="modal-qty-controls">
          <button class="qty-btn" onclick="changeModalQty(-1)">−</button>
          <span class="qty-num" id="modal-qty-val">1</span>
          <button class="qty-btn" onclick="changeModalQty(1)">+</button>
        </div>
      </div>
      <div class="modal-actions">
        <button class="modal-add-cart" onclick="addToCartFromModal()">🛒 Sepete Ekle</button>
        <button class="modal-fav-btn ${isFav ? 'active' : ''}" id="modal-fav-btn" onclick="toggleFavorite('${p.id}',true)">${isFav ? '❤️' : '🤍'}</button>
      </div>
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

// ── CART ──────────────────────────────────────────────────
function addToCart(id, showToastFlag = true) {
  const p = DATA[State.gender].products.find(x => x.id === id);
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

function updateCartUI() {
  const total = State.cart.reduce((s, i) => s + i.qty, 0);
  const totalPrice = State.cart.reduce((s, i) => s + i.product.price * i.qty, 0);
  const el = document.getElementById('cart-count'); if (el) el.textContent = total;
  const tp = document.getElementById('cart-total-price'); if (tp) tp.textContent = totalPrice.toLocaleString('tr-TR') + ' TL';
  const st = document.getElementById('cart-subtotal'); if (st) st.textContent = totalPrice.toLocaleString('tr-TR') + ' TL';
  const sh = document.getElementById('cart-shipping'); if (sh) { sh.textContent = totalPrice >= 150 ? 'Ücretsiz' : '29,90 TL'; sh.className = totalPrice >= 150 ? 'free-shipping' : ''; }
  const emp = document.getElementById('cart-empty'); if (emp) emp.style.display = State.cart.length ? 'none' : 'flex';
}

function renderCartItems() {
  const container = document.getElementById('cart-items');
  if (!container) return;
  container.innerHTML = State.cart.map(item => {
    const p = item.product;
    return `<div class="cart-item" id="cart-item-${p.id}">
      <div class="cart-item-img">${p.img}</div>
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
  const p = DATA[State.gender].products.find(x => x.id === id);
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
  const favProducts = State.favorites.map(id => DATA[State.gender].products.find(p => p.id === id)).filter(Boolean);
  container.innerHTML = favProducts.map(p => `
    <div class="fav-item" id="fav-item-${p.id}">
      <div class="fav-item-img">${p.img}</div>
      <div class="cart-item-info">
        <div class="fav-item-name">${p.brand} – ${p.name}</div>
        <div class="fav-item-price">${p.price.toLocaleString('tr-TR')} TL</div>
      </div>
      <div style="display:flex;flex-direction:column;gap:6px">
        <button class="item-delete-btn" style="background:#e0e7ff;color:var(--accent)" onclick="addToCart('${p.id}')">🛒</button>
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
    const matches = DATA[State.gender].products.filter(p =>
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
  const matches = DATA[State.gender].products.filter(p =>
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
      <span class="checkout-cart-item-img">${item.product.img}</span>
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
    body.innerHTML = `<h3 class="checkout-title">💳 Ödeme Seçenekleri</h3>
      <div class="payment-methods">
        <div class="payment-method-option ${State.selectedPayment === 'card' ? 'selected' : ''}" id="pm-card" onclick="selectPaymentMethod('card')">
          <span class="payment-method-icon">💳</span>
          <div class="payment-method-info"><div class="payment-method-name">Kredi / Banka Kartı</div><div class="payment-method-desc">Visa, Mastercard, Troy</div></div>
        </div>
        <div class="payment-method-option ${State.selectedPayment === 'transfer' ? 'selected' : ''}" id="pm-transfer" onclick="selectPaymentMethod('transfer')">
          <span class="payment-method-icon">🏦</span>
          <div class="payment-method-info"><div class="payment-method-name">Havale / EFT</div><div class="payment-method-desc">%3 indirim</div></div>
        </div>
        <div class="payment-method-option ${State.selectedPayment === 'door' ? 'selected' : ''}" id="pm-door" onclick="selectPaymentMethod('door')">
          <span class="payment-method-icon">🚪</span>
          <div class="payment-method-info"><div class="payment-method-name">Kapıda Ödeme</div><div class="payment-method-desc">Nakit veya kart</div></div>
        </div>
      </div>
      <div class="card-details" id="card-details" style="${State.selectedPayment !== 'card' ? 'display:none' : ''}">
        <div class="form-group"><label class="form-label">Kart Numarası</label><input class="form-input" id="cc-num" placeholder="•••• •••• •••• ••••" maxlength="19" oninput="formatCard(this)" /></div>
        <div class="form-row">
          <div class="form-group"><label class="form-label">Son Kullanma</label><input class="form-input" id="cc-exp" placeholder="AA/YY" maxlength="5" /></div>
          <div class="form-group"><label class="form-label">CVV</label><input class="form-input" id="cc-cvv" placeholder="•••" maxlength="3" type="password" /></div>
        </div>
        <div class="form-group"><label class="form-label">Kart Sahibi</label><input class="form-input" id="cc-name" placeholder="Ad Soyad" /></div>
      </div>
      <div class="checkout-summary" style="margin-top:16px">
        <div class="checkout-summary-row total"><span>Ödenecek Tutar</span><span style="color:var(--accent);font-size:1.2rem;font-weight:900">${total.toLocaleString('tr-TR')} TL</span></div>
      </div>
      <button class="checkout-next-btn" onclick="processPayment()">🔒 Ödemeyi Tamamla</button>
      <span class="checkout-back-link" onclick="renderCheckoutStep(2)">← Geri Dön</span>`;
    logAction('Ödeme Adım 3: Ödeme yöntemi seçimi gösterildi', 'cart');
  }
}

function submitAddress() {
  const name = document.getElementById('f-name')?.value.trim();
  const addr = document.getElementById('f-address')?.value.trim();
  if (!name || !addr) { showToast('⚠️ Lütfen Ad ve Adres alanlarını doldurun', 'error'); return; }
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
    const orderNo = 'SX' + Date.now().toString().slice(-8);
    const total = State.cart.reduce((s, i) => s + i.product.price * i.qty, 0);
    const itemCount = State.cart.reduce((s, i) => s + i.qty, 0);
    const city = document.getElementById('f-city')?.value || 'İstanbul';
    logAction(`Sipariş tamamlandı: #${orderNo} – ${total.toLocaleString('tr-TR')} TL`, 'cart');
    body.innerHTML = `
      <div class="order-success">
        <div class="order-success-icon">✅</div>
        <h2>Siparişiniz Alındı!</h2>
        <p>Teşekkürler! Siparişiniz başarıyla oluşturuldu ve kargoya verilecek.</p>
        <div class="order-number-box">
          <div class="order-number-label">Sipariş Numarası</div>
          <div class="order-number">#${orderNo}</div>
        </div>
        <div class="order-details-grid">
          <div class="order-detail-item"><div class="order-detail-label">Ürün Sayısı</div><div class="order-detail-value">${itemCount} adet</div></div>
          <div class="order-detail-item"><div class="order-detail-label">Toplam Tutar</div><div class="order-detail-value" style="color:var(--accent)">${total.toLocaleString('tr-TR')} TL</div></div>
          <div class="order-detail-item"><div class="order-detail-label">Teslimat</div><div class="order-detail-value">2-4 İş Günü</div></div>
          <div class="order-detail-item"><div class="order-detail-label">Kargo</div><div class="order-detail-value" style="color:#22c55e">Ücretsiz</div></div>
        </div>
        <p style="font-size:.8rem;color:var(--text-muted)">📧 Sipariş detayları e-posta adresinize gönderildi</p>
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
  const d = DATA[State.gender];
  const saleProducts = d.products.filter(p => p.oldPrice);
  if (!saleProducts.length) return;
  const p = saleProducts[Math.floor(Math.random() * saleProducts.length)];
  const discount = Math.round((1 - p.price / p.oldPrice) * 100);
  const flashPrice = Math.round(p.price * 0.8); // extra 20% off for popup
  logAction(`Flaş indirim pop-up gösterildi: ${p.name}`, 'ui');

  document.getElementById('flash-popup-body').innerHTML = `
    <div class="flash-popup-img">${p.img}</div>
    <div class="flash-popup-info">
      <div class="flash-popup-brand">${p.brand}</div>
      <div class="flash-popup-name">${p.name}</div>
      <div class="flash-popup-price-row">
        <span class="flash-popup-price">${flashPrice.toLocaleString('tr-TR')} TL</span>
        <span class="flash-popup-old">${p.price.toLocaleString('tr-TR')} TL</span>
        <span class="flash-popup-discount">%${discount + 20}</span>
      </div>
    </div>`;

  // Add buy button to footer
  const footer = document.querySelector('.flash-popup-footer');
  // Remove old button if exists
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

// ── ACCOUNT MODAL ─────────────────────────────────────────
function openAccount() {
  logAction('Hesabım açıldı', 'ui');
  const m = document.getElementById('account-modal');
  m.style.display = 'block';
  document.getElementById('account-overlay').classList.add('active');
  setTimeout(() => m.classList.add('open'), 10);
  document.getElementById('account-content').innerHTML = `
    <h2 class="info-modal-title">👤 Hesabım</h2>
    <div class="checkout-form">
      <div class="form-group"><label class="form-label">E-posta</label><input class="form-input" placeholder="ornek@email.com" /></div>
      <div class="form-group"><label class="form-label">Şifre</label><input class="form-input" type="password" placeholder="••••••••" /></div>
    </div>
    <button class="checkout-next-btn" onclick="fakeLogin()">Giriş Yap</button>
    <div style="text-align:center;margin-top:14px;font-size:.82rem;color:var(--text-muted)">Hesabın yok mu? <a href="#" style="color:var(--accent);font-weight:700" onclick="showToast('Kayıt sayfası yakında!','info')">Üye Ol</a></div>`;
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
  buildRecommendedProducts(getFilteredByBudget(DATA[State.gender].products).slice(0, 5));
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

// ── INIT ──────────────────────────────────────────────────
window.addEventListener('DOMContentLoaded', () => {
  logAction('ShopX yüklendi – Cinsiyet seçim ekranı gösterildi', 'system');
});

// ── EXPOSE GLOBALS (for HTML onclick handlers) ─────────────
Object.assign(window, {
  selectGender, selectBudget, switchGender,
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
  openLogPanel, closeLogPanel, toggleLogFilter, filterLogs, clearLogs, exportLogs,
  showFlashPopup, closeFlashPopup,
  handleLogoClick,
});
