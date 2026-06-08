# ShopX — Alışveriş Bağımlılığı Araştırma Platformu

> Gerçekçi bir e-ticaret deneyimi üzerinde kullanıcı davranışlarını izleyen, kaydeden ve analiz eden araştırma platformu.

---

## İçindekiler

- [Proje Hakkında](#proje-hakkında)
- [Teknoloji Yığını](#teknoloji-yığını)
- [Mimari Genel Bakış](#mimari-genel-bakış)
- [Modüller](#modüller)
  - [Mağaza Arayüzü](#1-mağaza-arayüzü-indexhtml--appjs)
  - [Bütçe Sistemi](#2-bütçe-sistemi)
  - [Yapay Zeka Asistanı](#3-yapay-zeka-asistanı-va)
  - [Ürün Karşılaştırma](#4-ürün-karşılaştırma)
  - [Yapay Zeka Ürün Yorumları](#5-yapay-zeka-ürün-yorumları)
  - [Üyelik & Kupon Sistemi](#6-üyelik--kupon-sistemi)
  - [Ödeme Akışı](#7-ödeme-akışı)
  - [Admin Paneli](#8-admin-paneli-adminhtml--adminjs)
  - [Gerçek Zamanlı İletişim](#9-gerçek-zamanlı-i̇letişim-socketio)
  - [Göz Takip Sistemi](#10-göz-takip-sistemi-eye-trackerpy)
  - [Flask Backend](#11-flask-backend-serverpy)
- [Veri Akışı](#veri-akışı)
- [Ekran Akışı](#ekran-akışı)
- [API Referansı](#api-referansı)
- [Kurulum & Çalıştırma](#kurulum--çalıştırma)
- [Dizin Yapısı](#dizin-yapısı)

---

## Proje Hakkında

ShopX, alışveriş bağımlılığı araştırmaları için tasarlanmış bir **araştırma platformudur**. Gerçek bir e-ticaret sitesini taklit ederken arka planda kullanıcı her tıklamasını, gezinme desenini ve satın alma kararını kaydeder.

**Araştırma boyutları:**
- Cinsiyet bazlı ürün keşfi ve satın alma kararları
- Bütçe kısıtlamasının harcama davranışına etkisi
- Yapay zeka önerileri altında karar alma süreci
- Göz takibi ile sayfa ısı haritası analizi

---

## Teknoloji Yığını

```
┌─────────────────────────────────────────────────────────────┐
│                        FRONTEND                             │
│   HTML5 · CSS3 (4771 satır) · Vanilla JavaScript (3263 s.) │
│                    Socket.IO Client                         │
├─────────────────────────────────────────────────────────────┤
│                        BACKEND                              │
│          Python 3 · Flask · Flask-SocketIO                  │
│              JSON dosya tabanlı veri katmanı                │
├─────────────────────────────────────────────────────────────┤
│                    HARICI SERVISLER                         │
│        DummyJSON API (ürün verileri) · USD→TRY (x38)       │
├─────────────────────────────────────────────────────────────┤
│                     GÖZ TAKİBİ                              │
│       MediaPipe · OpenCV · PyAutoGUI · SciPy                │
└─────────────────────────────────────────────────────────────┘
```

---

## Mimari Genel Bakış

```
                        ┌─────────────────┐
                        │   KULLANICI      │
                        │  (Tarayıcı)      │
                        └────────┬────────┘
                                 │ HTTP + WebSocket
                    ┌────────────▼────────────┐
                    │       server.py          │
                    │    Flask + Socket.IO     │
                    │    localhost:5000         │
                    └──┬──────────┬──────┬────┘
                       │          │      │
              ┌────────▼──┐  ┌────▼────┐ │
              │ index.html│  │admin.html│ │
              │  app.js   │  │ admin.js │ │
              │ style.css │  │admin.css │ │
              └───────────┘  └─────────┘ │
                                          │
                               ┌──────────▼────────┐
                               │   data/ (JSON)     │
                               │  logs.json          │
                               │  sessions.json      │
                               │  heatmaps/          │
                               └───────────────────┘
                                          ▲
                               ┌──────────┴────────┐
                               │  eye-tracker.py    │
                               │  (subprocess)      │
                               │  MediaPipe+OpenCV  │
                               └───────────────────┘
```

---

## Modüller

### 1. Mağaza Arayüzü (`index.html` + `app.js`)

Tek sayfalı uygulama (SPA) mimarisi. Tüm geçişler modal tabanlıdır, sayfa yenilenmez.

**Global Durum Nesnesi:**

```
State = {
  gender          → "female" | "male"
  budget          → sayısal limit (TL)
  budgetLabel     → "low" | "medium" | "high" | "luxury"
  cart[]          → sepet ürünleri
  favorites[]     → favoriler
  compareList[]   → karşılaştırma listesi (maks. 3)
  membership      → "bronze" | "silver" | "gold" | "platinum"
  couponCode      → aktif kupon
  giftBalance     → hediye bakiyesi
  checkoutStep    → 1-4 arası
  salary          → aylık gelir (TL)
  monthlyCredit   → kredi ödemesi
  monthlyDebt     → sabit giderler
  creditLimit     → hesaplanan limit
  loggedIn        → oturum durumu (boolean)
}
```

**Kategoriler:**

| Cinsiyet | Kategoriler |
|----------|-------------|
| Kadın | Elbise & Üstler, Ayakkabı, Çanta, Makyaj, Cilt Bakımı, Parfüm, Takı & Aksesuar, Spor |
| Erkek | Gömlek & Üstler, Ayakkabı, Saat & Güneş Gözlüğü, Akıllı Telefonlar, Gaming & Laptop, Tablet, Outdoor & Spor |

**DummyJSON API Entegrasyonu:**
- Ürünler `https://dummyjson.com` API'sinden çekilir
- USD fiyatlar 38 katsayısıyla TRY'ye dönüştürülür
- `PRODUCTS_CACHE` ile istemci taraflı önbellekleme yapılır
- Kategori eşlemesi `DUMMYJSON_CAT_MAP` ile yönetilir
- Her ürün için `thumbnail` (liste görünümü) ve `images[0]` (detay görünümü) ayrı ayrı saklanır

---

### 2. Bütçe Sistemi

Kullanıcının mali profilini alarak alışveriş limiti hesaplar.

```
┌────────────────────────────────────────────┐
│           BÜTÇE HESAPLAMA AKIŞI            │
│                                            │
│  Aylık Maaş ─────────────────┐            │
│  Kredi Kartı Ödemesi ─────────┤→ Serbest  │
│  Sabit Giderler (kira vb.) ──┘   Gelir    │
│                                    ↓       │
│         Serbest Gelir × 0.30 = Limit       │
│                                            │
│  ≤ 500 TL    → 💚 Düşük Bütçe             │
│  500–1500    → 💛 Orta Bütçe              │
│  1500–3500   → 🔵 Yüksek Bütçe           │
│  3500+ TL    → 💜 Lüks Bütçe             │
└────────────────────────────────────────────┘
```

**Harcama Kademeleri (SPEND_TIERS):**

| Harcama | İndirim | Ücretsiz Kargo |
|---------|---------|----------------|
| 500+ TL | %3 | Hayır |
| 1.000+ TL | %5 | Hayır |
| 2.000+ TL | %8 | Evet |
| 3.000+ TL | %10 | Evet |

---

### 3. Yapay Zeka Asistanı (VA)

Anahtar kelime tabanlı bir chatbot sistemi. Kullanıcının sorularını kategorize ederek ilgili alışveriş önerileri sunar.

```
Kullanıcı Mesajı
      │
      ▼
┌─────────────────────┐
│  VA_KEYWORDS eşleş  │──→ Eşleşme var? ──→ Kategori yanıtı
└─────────────────────┘         │
                                Hayır
                                 │
                         ┌───────▼────────┐
                         │ VA_SELF_INTRO  │──→ Asistan hakkında
                         └───────┬────────┘
                                 │ Eşleşme yok
                                 ▼
                         ┌───────────────┐
                         │ VA_SAD_RESP.  │──→ Konu dışı yanıt
                         └───────────────┘
```

**Desteklenen konular:** ürün önerisi, fiyat sorgulama, kargo bilgisi, iade/değişim, üyelik avantajları, kampanyalar, ödeme yöntemleri, bütçe takibi.

---

### 4. Ürün Karşılaştırma

Aynı anda en fazla 3 ürün yan yana karşılaştırılabilir.

```
┌──────────┬──────────┬──────────┐
│ Ürün  1  │ Ürün  2  │ Ürün  3  │
├──────────┼──────────┼──────────┤
│  Resim   │  Resim   │  Resim   │
├──────────┼──────────┼──────────┤
│  Fiyat   │  Fiyat   │  Fiyat   │
├──────────┼──────────┼──────────┤
│  Puan    │  Puan    │  Puan    │
├──────────┼──────────┼──────────┤
│  Stok    │  Stok    │  Stok    │
└──────────┴──────────┴──────────┘
```

- `addToCompare(id)` — listeye ekle
- `removeFromCompare(id)` — listeden çıkar
- `openCompareModal()` — karşılaştırma görünümünü aç
- `_updateCompareBar()` — navigasyon rozeti güncelle

---

### 5. Yapay Zeka Ürün Yorumları

Her ürün için dinamik olarak sentezlenmiş yapay zeka yorumu oluşturulur.

```
_generateAIReview(product)
        │
        ├─→ Artıları (pros) listesi
        ├─→ Eksileri (cons) listesi
        ├─→ Kalite skoru (1–8)
        ├─→ Emoji bazlı değerlendirme
        └─→ Fiyat/değer analizi

_buildAIReviewHTML(product)
        │
        └─→ Kart HTML yapısı (modal içinde render edilir)
```

---

### 6. Üyelik & Kupon Sistemi

**Üyelik Seviyeleri:**

Üyelik seviyesi kullanıcı tarafından seçilemez; alışveriş geçmişine göre otomatik belirlenir. Hesap modalı seviyeyi bilgi amaçlı gösterir.

| Seviye | İndirim | Ücretsiz Kargo | Rozet |
|--------|---------|----------------|-------|
| Bronze | %0 | Hayır | 🥉 |
| Silver | %5 | Hayır | 🥈 |
| Gold | %10 | Evet | 🥇 |
| Platinum | %15 | Evet | 💎 |

**Kupon Kodları:**

| Kod | Tür | Değer |
|-----|-----|-------|
| `SHOPX10` | Yüzde | %10 indirim |
| `ILKALIS20` | Yüzde | %20 ilk alışveriş |
| `KARGO` | Kargo | Ücretsiz kargo |
| `HEDIYE50` | Sabit | 50 TL indirim |
| `SHOPX5` | Yüzde | %5 ek indirim |

---

### 7. Ödeme Akışı

4 adımlı checkout süreci:

```
┌──────────────────────────────────────────────────┐
│                  CHECKOUT AKIŞI                  │
│                                                  │
│  [1] Adres    →  [2] Ödeme  →  [3] Onay  →  [4] Başarı │
│   Teslimat       Yöntemi       İnceleme    Sipariş No   │
│   Bilgileri                                      │
│                                                  │
│  Ödeme Yöntemleri:                               │
│  ├─ 💳 Kredi / Banka Kartı (kart formatlama)     │
│  ├─ 🏦 Havale / EFT                              │
│  └─ 💵 Kapıda Ödeme                              │
└──────────────────────────────────────────────────┘
```

---

### 8. Admin Paneli (`admin.html` + `admin.js`)

Araştırmacıların test oturumlarını yönettiği kontrol merkezi.

```
┌─────────────────────────────────────────────────┐
│                 ADMIN PANELİ                    │
│                                                 │
│  Kenar Çubuğu:                                  │
│  ├─ 📊 Canlı Loglar    → gerçek zamanlı akış   │
│  ├─ 🎮 Kontrol Merkezi → oturum başlat/durdur  │
│  ├─ 🧪 Denekler        → kayıtlı oturumlar     │
│  └─ 📈 İstatistikler   → özet metrikler        │
│                                                 │
│  Oturum Yönetimi:                               │
│  ├─ Denek adı gir → oturumu başlat             │
│  ├─ Göz takibini etkinleştir/devre dışı bırak  │
│  ├─ Canlı log filtresi (tür / anahtar kelime)  │
│  └─ JSON veya CSV olarak dışa aktar            │
└─────────────────────────────────────────────────┘
```

**Log Tipleri:**

| Tip | Açıklama |
|-----|----------|
| `system` | Oturum başlatma/durdurma olayları |
| `navigation` | Sayfa/kategori gezinmesi |
| `product` | Ürün görüntüleme, sepete ekleme |
| `cart` | Sepet değişiklikleri |
| `search` | Arama sorguları |
| `ui` | Buton tıklamaları, modal açma |

---

### 9. Gerçek Zamanlı İletişim (Socket.IO)

```
      MAĞAZA (index.html)          ADMIN (admin.html)
            │                              │
            │◄──── Socket.IO ────────────►│
            │                              │
  Gönderilen olaylar:           Dinlenen olaylar:
  ├─ identify (shop)            ├─ log
  ├─ session_started            ├─ session_status
  ├─ session_stopped            ├─ logs_history
  ├─ log (her aksiyon)          ├─ logs_cleared
  └─ heartbeat                  └─ heatmap_saved

            │                              │
            └──────────┬───────────────────┘
                       │
              ┌────────▼────────┐
              │   server.py     │
              │  (SocketIO hub) │
              └─────────────────┘
```

---

### 10. Göz Takip Sistemi (`eye-tracker.py`)

```
┌─────────────────────────────────────────────────┐
│              GÖZ TAKİP AKIŞI                    │
│                                                 │
│  Kamera → OpenCV → MediaPipe Face Mesh          │
│                │                                │
│                ▼                                │
│       Göz noktaları tespit et                   │
│                │                                │
│                ▼                                │
│    SciPy ile bakış yönü hesapla                 │
│                │                                │
│                ▼                                │
│  PyAutoGUI ile ekran koordinatı dönüştür        │
│                │                                │
│                ▼                                │
│    Tkinter overlay ile görsel imleç             │
│                │                                │
│                ▼                                │
│  NumPy ile ısı haritası verisi biriktir         │
│                │                                │
│                ▼                                │
│  Oturum sonu: PNG + JSON + CSV kaydet           │
│  → data/heatmaps/<isim>_<tarih>.*               │
└─────────────────────────────────────────────────┘
```

Üretilen dosyalar: `deneme_20260508_122230.png`, `.json`, `.csv`

---

### 11. Flask Backend (`server.py`)

**REST API Uç Noktaları:**

```
GET  /                        → index.html (mağaza)
GET  /admin                   → admin.html (panel)

GET  /api/logs                → logları getir (?limit=N)
POST /api/logs/clear          → tüm logları temizle

GET  /api/sessions            → oturumları listele
POST /api/sessions            → yeni oturum oluştur
PUT  /api/sessions/<id>       → oturumu güncelle
DEL  /api/sessions/<id>       → oturumu sil
DEL  /api/sessions/all        → tüm oturumları sil

GET  /api/export              → tüm veriyi dışa aktar (JSON)
GET  /api/heatmaps            → ısı haritası listesi
GET  /api/heatmap/<dosya>     → ısı haritası resmi
```

**Yapılandırma:**

```python
BASE_DIR   = proje kök dizini
DATA_DIR   = ./data/
LOGS_FILE  = ./data/logs.json    (maks. 1000 kayıt)
SESS_FILE  = ./data/sessions.json
HEATMAPS   = ./data/heatmaps/
SECRET_KEY = 'shopx-secret-2026'
PORT       = 5000
```

---

## Veri Akışı

```
Kullanıcı Aksiyonu (tıklama, kaydırma, satın alma)
          │
          ▼
   app.js → logAction(msg, type)
          │
          ├─→ State.logs[] (istemci belleği)
          │
          └─→ socket.emit('log', {...})
                    │
                    ▼
             server.py
             socket handler
                    │
                    ├─→ logs.json'a kaydet
                    │
                    └─→ socket.emit('log', {...})  [broadcast]
                              │
                              ▼
                    admin.js log stream
                    (canlı tablo güncelleme)
```

---

## Ekran Akışı

```
        ┌─────────────────┐
        │ Cinsiyet Seçimi │
        │  Kadın / Erkek  │
        └────────┬────────┘
                 │
        ┌────────▼────────┐
        │ Bütçe Profili   │
        │ (gelir/gider)   │
        └────────┬────────┘
                 │
        ┌────────▼────────┐
        │   Ana Mağaza    │◄──┐
        │ Banner/Ürünler  │   │
        └──┬──────────────┘   │
           │                  │
    ┌──────┴──────┐           │
    │             │           │
    ▼             ▼           │
Kategori      Ürün Detay      │
Sayfası       Modali          │
    │             │           │
    │         ┌───▼──────┐   │
    │         │  Sepet   │   │
    │         │  Modali  │   │
    │         └───┬──────┘   │
    │             │           │
    │         ┌───▼──────┐   │
    │         │ Ödeme 4  │   │
    │         │  Adımı   │   │
    │         └───┬──────┘   │
    │             │           │
    └─────────────┴───────────┘
                  │
           Sipariş Onayı
```

**Diğer modaller:** Favoriler, Karşılaştırma, VA Asistanı, Yardım/SSS, Hesap, Bütçe Güncelleme

---

## API Referansı

### Log Nesnesi

```json
{
  "id": "uuid-string",
  "timestamp": "2026-06-02T14:32:11.000Z",
  "type": "product",
  "message": "Ürün görüntülendi: iPhone 15 Pro (₺38.000)",
  "session": "denek_001"
}
```

### Oturum Nesnesi

```json
{
  "id": "uuid-string",
  "name": "denek_001",
  "startTime": "2026-06-02T14:00:00.000Z",
  "endTime": "2026-06-02T14:45:00.000Z",
  "gender": "female",
  "budget": "medium",
  "logs": [...],
  "eyeTracking": true
}
```

---

## Kurulum & Çalıştırma

### Gereksinimler

```
Python 3.9+
pip
Webcam (göz takibi için)
```

### Kurulum

```bash
# Bağımlılıkları yükle
pip install flask flask-socketio

# Göz takibi için ek bağımlılıklar
pip install opencv-python mediapipe numpy pyautogui keyboard scipy
```

### Çalıştırma

**Yöntem 1 — BAT dosyası (Windows):**
```
app.bat dosyasına çift tıklayın
```

**Yöntem 2 — Terminal:**
```bash
python server.py
```

Sunucu başladığında tarayıcı otomatik açılır:
- **Mağaza:** `http://localhost:5000`
- **Admin Paneli:** `http://localhost:5000/admin`

---

## Dizin Yapısı

```
e-commerce/
│
├── server.py            # Flask + Socket.IO backend (284 satır)
├── app.js               # Mağaza mantığı ve durum (3263 satır)
├── index.html           # Mağaza arayüzü (930 satır)
├── style.css            # Mağaza stilleri (4771 satır)
│
├── admin.html           # Admin panel arayüzü
├── admin.js             # Admin panel mantığı (861 satır)
├── admin.css            # Admin panel stilleri
│
├── eye-tracker.py       # Göz takip modülü (MediaPipe + OpenCV)
├── app.bat              # Windows hızlı başlatma betiği
├── requirements.txt     # Python bağımlılıkları
│
└── data/
    ├── logs.json        # Canlı aktivite logları (maks. 1000)
    ├── sessions.json    # Kayıtlı test oturumları
    └── heatmaps/        # Göz takibi çıktıları
        ├── *.png        # Isı haritası görüntüsü
        ├── *.json       # Bakış noktası verileri
        └── *.csv        # Ham koordinat verileri
```

---

## Özellik Özeti

| Kategori | Özellik | Durum |
|----------|---------|-------|
| Alışveriş | Cinsiyet bazlı kişiselleştirme | ✅ |
| Alışveriş | Ürün filtreleme & sıralama | ✅ |
| Alışveriş | Sepet & favoriler | ✅ |
| Alışveriş | Ürün karşılaştırma (4'e kadar) | ✅ |
| Ödeme | 4 adımlı checkout | ✅ |
| Ödeme | Kupon kodu sistemi | ✅ |
| Ödeme | Üyelik indirimleri (salt okunur, otomatik) | ✅ |
| Ödeme | Hediye bakiyesi | ✅ |
| Yapay Zeka | Alışveriş asistanı (chatbot) | ✅ |
| Yapay Zeka | Ürün yorumu & puanlama | ✅ |
| Finans | Bütçe profili & limit hesaplama | ✅ |
| Finans | Harcama kademesi avantajları | ✅ |
| Admin | Gerçek zamanlı log akışı | ✅ |
| Admin | Oturum kayıt/durdurma | ✅ |
| Admin | JSON/CSV dışa aktarma | ✅ |
| Admin | İstatistik dashboard | ✅ |
| Göz Takibi | MediaPipe tabanlı gaze detection | ✅ |
| Göz Takibi | Isı haritası üretimi (PNG) | ✅ |
| Göz Takibi | Oturum bazlı kayıt | ✅ |
| Arayüz | Karanlık/aydınlık tema | ✅ |
| Arayüz | Cinsiyet bazlı tema renkleri | ✅ |
| Arayüz | Duyarlı (responsive) tasarım | ✅ |

---

*ShopX — Alışveriş Bağımlılığı Araştırma Projesi*
