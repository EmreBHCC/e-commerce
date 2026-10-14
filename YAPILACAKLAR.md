# Yapılacaklar

## Kart puanı ile modal puanı tutarsız

**Durum (2026-10-13, `experiment-conditions` dalı):** Aynı ürün, ürün kartında ve ürün
modalında farklı puan gösteriyor.

| Ürün | Kartta | Modalda |
| --- | --- | --- |
| Girl Summer Dress (`dj_163`) | ★★★★☆ (614) | ★★☆☆☆ 2.8 (5 değerlendirme) |
| Blue Frock (`dj_162`) | ★★★★★ (713) | 0.0 (değerlendirme yok) |

**Neden:** İki ayrı kaynak kullanılıyor.

- **Kart:** `p.rating` DummyJSON'un puanı, `p.reviews` ise uydurma bir sayı
  (`transformDJProduct`, `app.js:103`: `reviews.length * 47 + stock * 11`, yorum yoksa
  `stock * 23 + 80`).
- **Modal:** sadece `reviews/` klasöründeki gerçek denek yorumları (`/api/reviews`, `app.js:1109`).

**Deney açısından neden önemli:** Kontrol koşulundaki bir denek bile dışarıda yüksek puan +
yüzlerce yorum, içeride düşük puan ya da hiç yorum görüyor. Sosyal kanıt koşulu ölçülürken
puan sinyali tüm koşullarda zaten açık ve tutarsız. Bu, koşullar arası farkı bulandırabilir.

**Önce karar verilecek (Levent'le):**

- [ ] Kart puanı bilinçli mi (vitrin gerçekçiliği), yoksa yorum özelliği eklenirken kartlar mı
      unutuldu?
- [ ] Puan tek kaynaktan mı gelsin? Seçenekler:
  - (a) Her yerde gerçek denek yorumları; yorumu olmayan üründe puan gizlenir ya da "yeni ürün"
    yazar.
  - (b) Her yerde DummyJSON puanı; modaldaki yorum listesi kalır ama başlıktaki ortalama kart
    ile aynı olur.
  - (c) Kontrol koşulunda puan hiç gösterilmez, puan/yorum sadece `social` koşulunun sinyali olur.

**Karar sonrası dokunulacak yerler** (`p.rating` / `p.reviews` kullananlar):

- [ ] Ürün kartı: `app.js:1072-1073`
- [ ] Sosyal kanıt şeridi `getConditionSlotHtml`: `app.js:265` (`p.rating` + `_socialBuyers` sahte sayısı)
- [ ] Karşılaştırma tablosu: `app.js:1478-1479`
- [ ] AI ürün analizi `_generateAIReview`: `app.js:2411-2439` (puan ve yorum sayısına göre skor/artı/eksi)
- [ ] Asistan "en yüksek puanlı / en çok satan" önerileri: `app.js:2631-2633`
- [ ] Modal başlığı: `app.js:1109-1121`

**Bitti sayılması için:** Yorumu olan bir ürün (örn. `dj_163`) ile olmayan bir ürün
(örn. `dj_162`) için kart, modal, karşılaştırma ve asistan aynı puanı/yorum sayısını gösteriyor.
Tarayıcıda dört koşulun her birinden bir üründe kontrol edildi.

## Eye-tracker kalibrasyonu (2026-10-15 incelemesi)

`main`'deki d4a871a üzerinde kod okuması + bu makinede duman testi. Hesap doğru (tıklanan
noktadan çıkarılan açı, `convert_gaze_to_screen_coordinates`'in tam tersi), ama:

- [ ] **7 noktalı kalibrasyon pratikte tek noktaya iniyor.** `calibration_mouse` saniyede 10
      örnek gönderiyor ve tıklama örnekleriyle aynı 5'lik `_calib_samples` tamponuna düşüyor.
      Sonuç: ofset son tıklanan noktanın etrafındaki ~0.5 sn fare hareketinden çıkıyor, ilk
      noktalar atılıyor. Öneri: tıklama örneklerini ayrı ve hepsini tut, fare örneklerini ya
      kaldır ya da düşük ağırlıkla kullan ("göz fareye bakıyor" varsayımı zayıf).
- [ ] **Sadece kaydırma (ofset), ölçek yok.** ±12°/±8° sabit kabul ediliyor, köşeler kayar.
      7 nokta olduğu için yaw/pitch başına doğrusal uydurma (kazanç + ofset) yapılabilir.
- [ ] **Oturum durdurulmadan yeniden başlatılırsa gaze yayını kesiliyor.** Eski sürecin
      `_watch_eye_tracker`'ı `_gaze_broadcaster_active = False` yapıp yenisinin yayınını kapatıyor.
- [ ] **Ekran ölçeklemesi.** Tarayıcı CSS piksel, `pyautogui.size()` fiziksel piksel gönderiyor.
      %100'de sorun yok; %125/%150 ölçekli makinede `devicePixelRatio` ile çarpılmalı.
- [ ] **Geç açılan mağaza sekmesi kalibrasyonu görmüyor.** `SESSION_STARTED` sadece başlangıçta
      gidiyor; sekme sonra bağlanırsa `session_status` alıyor ama kalibrasyon ekranı açılmıyor.

Duman testi: kamera açılıyor, otomatik kalibrasyon ~13 sn, durdurunca heatmap PNG/CSV/JSON
yazılıyor. Tıklamalı kalibrasyon yapılmadan 227 noktanın 163'ü ekran kenarına yapıştı
(beklenen; asıl doğruluk testi henüz yapılmadı).
