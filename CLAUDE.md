# ShopX: CLAUDE.md

Alışveriş bağımlılığı araştırması için **sahte bir e-ticaret sitesi**. Denek gerçek bir mağazada
geziyormuş gibi davranır. Her tıklama, ürün bakışı, sepet hareketi ve (isteğe bağlı) göz takibi
araştırmacının admin panelinde canlı olarak kaydedilir. Ürün değil, **deney düzeneği**: amaç
satış değil, ölçüm.

- **Ekip:** Emre (EmreBHCC, repo sahibi) + Levent Aslan (lvntaslann, collaborator). Kodun
  büyük kısmını 2026-06/07'de Levent yazdı.
- **Dallar:** `main` kararlı hal. `experiment-conditions` en son iş (deneysel pazarlama
  koşulları + eye-tracker düzeltmeleri), Levent 2026-10-14'te PR #1 ile `main`'e birleştirdi
  (d0f3ea4). `v2-profesyonel` bunun üstünde, `main`'in içerdiği her şeyi zaten taşıyor.
- **Açık işler:** `YAPILACAKLAR.md`.
- **README.md:** mimari ve API için iyi bir harita, ama kısmen eskimiş (bkz. "README'de eskimiş
  olanlar"). Kod ile çelişirse kod doğrudur.

## Çalıştırma

```bash
python server.py        # ya da app.bat — Flask + Socket.IO, 0.0.0.0:5000, debug=True
```

- Mağaza `http://localhost:5000`, admin `http://localhost:5000/admin`. Sunucu açılınca ikisini
  varsayılan tarayıcıda kendisi açar (`_open_browser`, reloader'da bir kez).
- Bağımlılıklar `requirements.txt` içinde. Sadece site için `flask` + `flask-socketio` yeter. Eye-tracker için
  mediapipe/opencv/scipy/pyautogui/keyboard gerekir.
- Ürünler çalışma anında **dummyjson.com**'dan çekilir (internet gerekir). Erişilemezse
  `FALLBACK_PRODUCTS` (8 emoji'li ürün) devreye girer.
- Test, lint veya derleme adımı yok. Düz HTML/CSS/vanilla JS, paketleyici yok.

## Dosya haritası

| Dosya | Ne |
| --- | --- |
| `server.py` | Flask REST + Socket.IO merkezi. JSON dosya veritabanı, oturum durumu, eye-tracker alt sürecini başlatır/durdurur, gaze yayını |
| `index.html` / `app.js` / `style.css` | Mağaza (SPA). `app.js` ~3200 satır, tek dosya, global `State` nesnesi |
| `admin.html` / `admin.js` / `admin.css` | Araştırmacı paneli: canlı loglar, kontrol merkezi (uzak komutlar), denekler, istatistik, dışa aktarma |
| `eye-tracker.py` | MediaPipe Face Mesh ile bakış → ekran koordinatı. Oturum sonunda heatmap PNG/CSV/JSON yazar |
| `reviews/*.json` | Gerçek denek yorumları (`{exportedAt, participant, reviews:[{productId, rating, comment, ...}]}`), `/api/reviews` ürün başına birleştirir |
| `data/` | **git dışı** çalışma verisi: `logs.json`, `sessions.json`, `<denek_slug>/` heatmap'leri, eye-tracker sinyal dosyaları |
| `screen_position.txt` | Eye-tracker'ın anlık bakış noktası (x,y). Çalışırken sürekli yazılır, **git'te izleniyor ama runtime dosyası**; değişmişse commit'e katma |

### `app.js` içinde nereye bakılır

`app.js`'de modül yok, her şey global ve `Object.assign(window, {...})` ile HTML'deki
`onclick`'lere açılır. Yeni bir fonksiyon HTML'den çağrılacaksa o listeye eklenmeli.

- **Ürün verisi:** `DJ_CATEGORY_MAP` (8 kategori → DummyJSON kategorisi, her birinden 5 = 40 ürün),
  `transformDJProduct` (USD×38 → TL, `id = dj_<n>`), `fetchAllProducts`, `getProducts()`.
- **Deneysel koşullar:** `CONDITIONS`, `assignConditions`, `getProductCondition`,
  `getConditionRibbon`, `getConditionSlotHtml` (`app.js` ~202-268).
- **Socket ve uzak komutlar:** `socket.on('command')` switch'i (~276). Admin'in mağazaya
  gönderebildiği her komut burada.
- **Akış:** `selectGender` → `goToShopFromBudget` / `selectBudget` → `initShop` → kart
  (`buildProductCard`), modal (`openProduct`), sepet, checkout, asistan (`VA_*`), AI analizi
  (`_generateAIReview`).
- **Loglama:** `logAction(msg, type)`. Her şey buradan geçer, socket ile sunucuya gider.

## Deney düzeni (değiştirmeden önce anla)

**Oturum yaşam döngüsü:**
1. Admin → Kontrol Merkezi'nde denek adı girip oturum başlatır (`session_started`).
2. Sunucu mağazaya `SESSION_STARTED` gönderir **ve eye-tracker'ı otomatik başlatır** (kamera
   açılır, Windows'ta yeni konsol penceresi). Mağaza kalibrasyon ekranını gösterir (7 nokta × 5 tık).
3. Denek gezer. Her `logAction` → `log` olayı → sunucu `data/logs.json`'a yazar + admin'e iletir.
4. Admin oturumu durdurur → mağaza `resetToInitial()` ile sıfırlanır, eye-tracker'a dur sinyali
   gider, heatmap `data/<slug>/` altına düşer, admin'e `heatmap_saved` gelir.

Oturum yokken mağazanın üstünde "Bu oturum kayıt altına alınmıyor" şeridi görünür. Bu normal.

**Deneysel koşullar:** 40 ürün 4 koşula 10'ar dağıtılır: `control`, `discount` (çapa fiyat
×2, %50 rozeti), `scarcity` ("Son N ürün!"), `social` ("N kişi satın aldı"). Dağıtım kategori
dengeli ve **deterministik**: aynı denek adı her zaman aynı ürün→koşul eşleşmesini alır. Ad
değişince rotasyon değişir (`_hashString(participantName) % 4`). Oturum başlatılmadan
gezilirse ad `'default'` olur. Kıtlık ve sosyal sayılar da ürün id'sinden hash ile üretilir
(rastgele değil, tekrar üretilebilir). Her ürün logu `[Koşul: ...]` etiketini taşır. Analiz
buna dayanır.

**Cinsiyet:** Seçim ekranı bilerek duruyor. Cinsiyet her log girdisine (`gender` alanı) demografik
değişken olarak yazılır. Ürünleri veya temayı **değiştirmez**: 71f7331 commit'i cinsiyete göre
temayı kaldırdı, seçimi değil. `toggleGenderTheme` adı yanıltıcı, sadece giriş ekranının
açık/koyu modu.

## Değişmezler: araştırma verisini bozma

- **Koşul atamasını ve log metinlerini sessizce değiştirme.** `assignConditions`, hash
  fonksiyonları, `[Koşul: ...]` etiketi ve log mesaj kalıpları önceki deneklerin verisiyle
  karşılaştırılabilirliği belirler. Değişecekse bilerek, Emre/Levent'e söyleyerek.
- **Koşullar arasında sızıntı yaratma.** Bir koşulun sinyali (indirim rozeti, kıtlık mesajı,
  sosyal kanıt sayısı) başka koşuldaki ürünlerde görünmemeli. Kontrol ürünü "nötr" kalmalı.
  Bilinen ihlal: kart ve modal puanları tüm koşullarda farklı kaynaklardan geliyor
  (`YAPILACAKLAR.md`).
- **`data/` ve `reviews/` gerçek denek verisi.** Silme, üzerine yazma, test verisiyle kirletme.
  Admin'deki "Logları Temizle" `logs.json`'ı boşaltır. Oturum silme ise o denegin
  `data/<slug>/` heatmap klasörünü de **kalıcı olarak siler** (`_delete_session_data_folder`).
- **Admin sekmesi oturum boyunca açık kalmalı.** Oturumun kendi log listesi (`sess.logs`)
  admin tarayıcısında birikir ve saniyede bir `PUT /api/sessions/<id>` ile kaydedilir. Admin
  kapalıyken gelen loglar sadece global `logs.json`'a düşer. O dosya da **son 1000 kayıtla
  sınırlı** (`MAX_LOGS`), eskiler atılır.
- **Eye-tracker kamera açar.** Doğrulama için oturum başlatmak = kamera + yeni konsol penceresi.
  Emre'ye sormadan oturum başlatma.

## Doğrulama nasıl yapılır

Test takımı yok, doğrulama tarayıcıda yapılır:

1. `python server.py` arka planda çalıştır, `curl` ile `/`, `/admin`, `/api/sessions`,
   `/api/reviews`, `/api/heatmaps` 200 dönüyor mu bak.
2. Tarayıcıda (Chrome eklentisi, yoksa headless Chrome + CDP) mağazayı sür:
   `document.getElementById('btn-female').click()` → `goToShopFromBudget()` → kartların
   (`.product-card[data-condition]`) oluşmasını bekle → `openProduct(id)`.
3. Koşul dağılımı: `Object.values(State.conditionMap)` 4×10 olmalı.
4. Admin'e geç, adımların `[Koşul: ...]` ile loglandığını gör.
5. Konsolda `[EXCEPTION]` olmamalı. `favicon.ico` 404'ü bilinen ve önemsiz.

Test gezintisi `data/logs.json`'a gerçek log yazar. Bitince Emre'ye söyle (admin'den
temizlenebilir ama gerçek denek logları da gider, kendin temizleme).

## README'de eskimiş olanlar (2026-10-13)

- "Cinsiyete göre kategoriler" tablosu: artık kategoriler tek set (`DJ_CATEGORY_MAP`), cinsiyet
  ürünü değiştirmiyor.
- "Cinsiyet bazlı ürün keşfi" araştırma boyutu: yerini deneysel koşullar (kontrol/indirim/kıtlık/
  sosyal) aldı. README bu sistemi hiç anlatmıyor.
- Kullanıcı yorumları (`reviews/`, `/api/reviews`) README'de yok.
- Satır sayıları (CSS 4771, JS 3263) güncel değil.

## Çalışma kuralları

- Commit'ler Emre'nin kimliğiyle (`Emre BAHÇECİ`). `Co-Authored-By` satırı ekleme.
- Repo ortak. **Push etmeden önce sor.** Levent'in dalına (`experiment-conditions`) yazılan
  her şey onun da çalıştığı yer.
- Deney tasarımını etkileyen kararlar (koşul mantığı, hangi sinyalin nerede görüneceği) kod
  kararı değil, araştırma kararıdır. Seçenekleri çıkar, kararı Emre'ye bırak, gerekirse
  `YAPILACAKLAR.md`'ye yaz.
- Arayüz metinleri Türkçe. Ürün adları ve açıklamaları DummyJSON'dan İngilizce gelir, bu bilinen durum.
