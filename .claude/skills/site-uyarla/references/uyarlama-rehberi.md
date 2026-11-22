# Uyarlama rehberi

## Envanter nasıl çıkarılır

Kaynağı okurken şu listeyi doldur. Her satır, yeni sitede bir karşılığı olması gereken bir öğedir.

1. **Renkler:** `:root` değişkenlerinin tamamı, ayrıca CSS içinde doğrudan yazılmış hex ve
   `rgba(...)` değerleri. rgba'lar çoğu zaman bir tokenın saydam hali (`rgba(15,61,46,.07)` =
   zemin rengi %7); yeni rengin RGB'siyle aynı saydamlıkta çevir.
2. **Fontlar:** Google Fonts bağlantısı, `--f-display` / `--f-body` / `--f-hand` gibi roller.
3. **CSS animasyonları:** her `@keyframes` adı ve kullanıldığı sınıf.
4. **JS animasyonları:** her bölüm için hangi tetikleyiciyle (açılış, kaydırma, hover, sürükleme)
   ne olduğu: sayaçlar, harf harf gelen başlıklar, pin'lenen bölümler, parallax, imleç.
5. **Bölüm sırası:** her bölümün `id`'si, başlığı, kart sayısı, arka plan rengi.
6. **Tekrarlanan metin kalıpları:** kayan bant yazıları, rozet halkalarındaki yazılar, el yazısı
   notlar, küçük üst başlıklar (eyebrow).
7. **Etkileşimler:** pop-up, sabit mobil buton, menü, sürüklenen öğeler, form.

## Eşleştirme tablosu örneği

Matematik öğretmeni sitesi → eşine romantik site (bu skill'in ilk gerçek kullanımı):

| Referans | Yeni karşılık | Neden |
|---|---|---|
| Zemin `#0F3D2E` (kara tahta yeşili) | `#5B1030` (bordo) | Konunun duygusu; rol aynı |
| Ana vurgu `#CBFF3D` (neon lime) | `#FFB8CF` (pudra pembe) | Rol aynı, ton romantik |
| Sarı, mavi, turuncu ikincil vurgular | Aynen | Çok renkli oyunculuk korunur |
| Açılış: isim mührü + π basamakları + % sayaç | İsim mührü + "sen + ben = biz ♥ 1 + 1 = 1" | Aynı mekanik, yeni anlam |
| Tahtadaki formüller | "lim (ben → sen) = ev", "∫ sen dt = mutluluk" | Öğretmenin dili korunur, konu aşka döner |
| "EZBER ● BOZAN / MATEMATİK" | "KALBİMİN ♥ SAHİBİ / DİLEK" | Aynı satır yapısı ve araya giren rozet |
| İstatistik daireleri (100+, %98, 12+) | 365, %100, 1 | Aynı sayaç animasyonu |
| 4 adımlı metot: TANI, ANLA, ÇÖZ, KAZAN | Hikâye: TANIŞ, SEV, EVET, BİZ | Yatay akan bölüm aynen |
| Öğrenci yorumları | Eşine küçük notlar | Masaya düşen kâğıt animasyonu aynen |
| SSS: "soru − cevap = 0" | "sen − ben = tanımsız" | Matematik şakası korunur |
| "ÇEK BENİ" etiketi → iletişim pop-up'ı | "ÇEK BENİ ↓ sana mektup" → aşk mektubu | Sürükleme mekaniği aynen |

## Metin uyarlama ilkeleri

- Uzunluğu koru: dev başlıklar `data-fit` gibi kutuya sığdırma mantığıyla çalışıyorsa çok
  daha uzun bir kelime her şeyi küçültür.
- Ritmi koru: "X ✦ Y ✦" kalıbındaki bant yazıları aynı kalıpta kalsın.
- Referansın mizahı ya da imzası varsa (matematik şakaları gibi) onu yeni konuya taşı; bu,
  uyarlamanın "kopya" değil "kardeş" gibi hissettirmesini sağlar.

## Sık yapılan hatalar

- **ID değişip JS'nin güncellenmemesi:** `IntersectionObserver.observe(null)` gibi bir hata
  bütün animasyon zincirini durdurur. Yeniden adlandırılan her `id` için JS'yi tara.
- **Sabitlenmiş tekrar sayıları:** kayan yazının uzunluğunu "metin / 6" diye hesaplayan kod,
  6 tekrar beklenir.
- **Font glifi eksikliği:** Anton gibi display fontlarda `♥`, `∞`, `√` olmayabilir; yedek
  fonttan gelir, telefonda emojiye dönebilir.
- **Mobil:** referansın telefon görünümünde gizlediği veya küçülttüğü öğeleri (rozetler,
  formüller) yeni sitede de aynı kurallarla gizle.
