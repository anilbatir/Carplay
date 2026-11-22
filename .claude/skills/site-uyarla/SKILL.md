---
name: site-uyarla
description: >
  Bir referans siteyi (renkleri, yazı tipleri, animasyonları, bölüm kurgusu, etkileşimleri)
  inceleyip yeni bir konu için uyarlanmış yeni bir siteye dönüştürür: tersine mühendislik,
  içerik eşleştirme, yeniden kurma ve tarayıcıda doğrulama. Kullanıcı bir site linki verip
  "bunu referans al", "bu siteyi uyarla", "bunun gibi bir site yap", "aynı tasarımı X için yap",
  "renklerini ve animasyonlarını kopyala", "bu tarzda hukuk/hastane/düğün/portfolyo sitesi",
  "clone this site's design", "rebuild this site for my business", "make it look like this site"
  dediğinde mutlaka kullan; link verilmeden "şu sitedeki gibi olsun" dendiğinde de linki iste
  ve bu skill ile ilerle.
---

# Site uyarla

Bir referans sitenin tasarım dilini (renk sistemi, tipografi, hareket, bölüm sırası, etkileşimler)
alıp tamamen farklı bir konuya taşıyan iş akışı. Hedef, ziyaretçinin "bu, o sitenin kardeşi" diye
hissetmesi; içerik ise yeni konuya ait ve gerçek.

Başarının iki ölçüsü var: **sadakat** (referanstaki her önemli tasarım ve hareket öğesinin
karşılığı yeni sitede var) ve **uyum** (her öğe yeni konunun dilinde anlamlı; matematik formülü
romantik sitede "sen + ben = biz" olur, hukuk sitesinde bir kanun maddesi olur).

## 0. Önce iki şeyi netleştir

- **Kimin sitesi?** Kullanıcının kendi sitesi ya da kodu kopyalanmaya açık bir kaynak
  (MIT lisanslı repo, Webflow "cloneable", Codrops demosu) ise kod birebir kullanılabilir.
  Başkasının ticari sitesiyse kodu, metni, görseli ve logoyu aynen yayınlama: düzeni, renk
  mantığını ve animasyon fikirlerini alıp kendi kodunla yeniden yaz. Bunu kullanıcıya bir
  cümleyle söyle; deneme/öğrenme amaçlı yerel çalışmada sorun yok.
- **Yeni konu ve içerik.** İsim, iletişim bilgisi, gerçek rakamlar kullanıcıdan gelir.
  Bilmediğin olguları (kuruluş yılı, müşteri sayısı, tarih) uydurma; genel tut ya da
  kullanıcıya sor ve teslimde neleri genel bıraktığını söyle.

## 1. Referansı çıkar

`scripts/cikar.sh <url> <cikti-klasoru>` çalıştır. İki şey üretir:

- `kaynak/`: sayfanın HTML'i ve aynı alan adındaki CSS/JS dosyaları (ham kaynak).
- `tasarim/`: skillui çıktısı: renk ve yazı tipi tokenları, CSS keyframe'leri, kullanılan
  animasyon kütüphaneleri, 7 kaydırma ekran görüntüsü, hover/focus halleri.

Sonra **ham kaynağın tamamını oku** (HTML, CSS, JS). skillui renkleri, fontları ve CSS
animasyonlarını iyi yakalar, ama JavaScript ile yapılan koreografiyi (GSAP zaman çizelgeleri,
pin'lenen yatay kaydırma, sayaçlar, sürükle-bırak etkileşimleri, imleç efektleri) sadece
"GSAP var" diye özetler. Sitenin asıl karakteri çoğu zaman oradadır; okumadan geçersen
kopya düz ve cansız çıkar. Ekran görüntülerine (`tasarim/*/screens/scroll/`) bakarak sırayı
ve atmosferi doğrula.

Alan adı ağ tarafından engelliyse (proxy 403), bulut ortamında kullanıcıdan o alan adına
erişim onayı iste; ayna sitelerle (arşiv, önbellek) dolaşmaya çalışma.

## 2. Envanter ve eşleştirme tablosu

Kod yazmadan önce referanstaki her öğeyi listele ve yeni karşılığını yaz. Ayrıntılı yöntem ve
örnek tablo: `references/uyarlama-rehberi.md`. Kısaca:

| Katman | Çıkar | Uyarlarken |
|---|---|---|
| Renk tokenları | `:root` değişkenleri, rgba türevleri | Rolleri koru (zemin, ana vurgu, ikincil vurgular, kâğıt, mürekkep), tonları konuya göre kaydır; rgba türevlerini de aynı oranla çevir |
| Tipografi | aileler, ağırlıklar, ölçek, harf aralığı | Genelde aynen kalır; sadakatin en ucuz yolu budur |
| Hareket | her keyframe, her GSAP tween'i, süre ve easing | Hepsini koru, sadece içeriğini değiştir |
| Bölümler | sıra, başlık yapısı, kart sayıları | Aynı sıra ve aynı iskelet, konuya uygun yeni anlam |
| Metin | başlık, slogan, el yazısı notlar, kayan yazılar | Aynı uzunluk ve ritimde yeni konu dili |
| Etkileşim | pop-up, sürüklenen öğeler, sabit butonlar | Aynı mekanik, yeni amaç |

## 3. Önce ikizi kur, sonra farklılaştır

Varsayılan çalışma şekli iki turdur, çünkü kullanıcı önce referansa çok yakın bir sonuç görüp
sonra küçük farkları kendisi yönlendirmek ister:

1. **İkiz tur:** Görsel ve hareket olarak referansa olabildiğince yakın bir site kur. Yapı,
   renkler, fontlar, animasyonlar, boşluklar referansla aynı kalsın; sadece metinler yeni konuya
   geçsin. Bu turda kendi zevkine göre "iyileştirme" yapma: amaç kullanıcıya sağlam bir
   başlangıç noktası vermek. Kullanıcı ilk istekte renk ya da ton değişikliği istediyse onu
   da bu turda yap.
2. **Farklılaştırma turları:** İkizi ve referansla karşılaştırma sayfasını göster, kullanıcıdan
   değiştirmek istediklerini al (renk, bir bölümü çıkarmak, bir animasyonu değiştirmek, logo),
   her turda sadece istenenleri değiştir ve yeniden doğrula. Her turdan sonra neyin değiştiğini
   bir iki cümleyle söyle.

Başkasının sitesi söz konusuysa ikiz, yayına girmeden önceki çalışma taslağıdır: yayından önce
metinler, görseller ve marka öğeleri tamamen kullanıcıya ait olmalı. Bunu ikiz teslim edilirken
bir kez hatırlat.

## 4. Kur

- Kullanıcının kendi sitesi ya da açık kaynaksa: referansın CSS/JS dosyasını kopyala, renkleri
  bir betikle değiştir (her değiştirmenin gerçekten bir eşleşme bulduğunu kontrol et), HTML'i
  yeni içerikle baştan yaz. JS'yi mümkün olduğunca dokunmadan bırak; çalışan koreografiyi
  yeniden yazmak hata kaynağıdır.
- Başkasının sitesiyse: tokenları ve yapıyı kendi CSS'inle yaz, animasyonları aynı kütüphane
  ve benzer zamanlamalarla kendin kur.
- **En sık hata:** JS'nin seçtiği `id` ve sınıfları HTML'de yeniden adlandırmak. Bölüm
  `id`'lerini değiştirdiysen JS'de `#eski-id`, `querySelector`, `getElementById` aramalarını
  güncelle. Tek bir boş seçici bütün animasyon zincirini durdurabilir.
- Kayan yazılarda (marquee, textPath) JS tekrar sayısına göre hesap yapıyorsa aynı tekrar
  sayısını koru.
- Türkçe büyük harflerde (İ, Ş, Ğ) başlık satırlarının çakışmadığına, `♥` gibi sembollerin
  telefonda emojiye dönmediğine bak (`♥︎` + `font-variant-emoji:text`).

## 5. Doğrula ve karşılaştır

```
node scripts/kontrol.js <yeni-site-klasoru> <cikti-klasoru> --referans <referans-url>
```

Yeni siteyi ve referansı masaüstü ve telefon genişliğinde açar, açılış animasyonunu bekler,
ikisini de sayfanın %0, 17, 33, 50, 67, 83 ve 100'ünde çeker, konsol hatalarını ve yatay
taşmayı raporlar. `karsilastirma.html` iki siteyi yan yana gösterir. CDN'lere ağ izni olmayan
ortamlarda sayfanın CDN betiklerini npm'den indirip yerelden servis eder. Hata ya da taşma
varsa 2 koduyla çıkar.

- Konsol hatası sıfır olmalı. Hata varsa önce seçici/id uyuşmazlığına bak.
- Ekran görüntülerine gerçekten bak: animasyon sonrası boş kalan bölüm, üst üste binen
  yazı, telefonda taşan başlık.
- İkiz turda karşılaştırma sayfasındaki her çiftte farkı not et; kasıtlı olmayan her fark
  düzeltilecek bir hatadır.

## 6. Teslim

Kısa bir özet ver:

- **Birebir alınanlar:** yapı, animasyonlar, fontlar.
- **Uyarlananlar:** renk değişimi, içerik eşleştirmesinden 3-5 çarpıcı örnek.
- **Kullanıcının bilmesi gerekenler:** uydurulmadan genel bırakılan bilgiler, değiştirilmesi
  gereken iletişim bilgileri, yayına alma seçenekleri.
- **Sonraki tur için:** "Değiştirmek istediklerini söyle" diye bitir; kullanıcı küçük farkları
  yönlendirecek.

Ekran görüntülerinden en iyi 3-5 tanesini ve karşılaştırma sayfasını kullanıcıya gönder.
