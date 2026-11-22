# Dilek BATIR

Dilek'e, sevgiyle hazırlanmış tek sayfalık romantik site.

Tasarım sistemi, renk yapısı, animasyonlar ve bölüm kurgusu [anilbatir.com](https://anilbatir.com)'dan referans alınıp uyarlandı:
açılış mührü ve büyüyen halkalar, ipten sarkan "ÇEK BENİ" etiketi ve mektup penceresi, sinüs bandında kayan yazılar,
toplanan harfler ve sayaçlar, sağa akan "Hikâyemiz" yolculuğu, yuvarlanan rozetler, masaya düşen notlar ve zıplayan footer harfleri.

## Dosyalar

- `index.html`: içerik
- `style.css`: tasarım (renkler `:root` içinde)
- `main.js`: animasyonlar (GSAP 3.12.5, ScrollTrigger, Lenis 1.1.13)
- `favicon.svg`

Derleme gerekmez; `index.html` dosyasını tarayıcıda açmak ya da GitHub Pages ile yayınlamak yeterli.

## Skill'ler

`.claude/skills/` altında Claude Code için iki skill kurulu:

- `frontend-design` ([anthropics/skills](https://github.com/anthropics/skills))
- `find-skills` ([vercel-labs/skills](https://github.com/vercel-labs/skills)): yeni skill bulup kurmak için (`npx skills find <konu>`)
- `site-uyarla` (Anıl BATIR için yazıldı): bir referans siteyi inceleyip yeni bir konuya uyarlar; önce ikiz site, sonra küçük farklar

### Kütüphaneye eklenecek skill'ler (hazırlık listesi)

- [anthropics/claude-plugins-official](https://github.com/anthropics/claude-plugins-official): `claude-code-setup` (proje için araç önerisi)
- [nateherkai/scroll-craft](https://github.com/nateherkai/scroll-craft): kaydırmalı premium siteler
- [usestrix/strix](https://github.com/usestrix/strix): güvenlik testi (9 skill)
- [amaancoderx/npxskillui](https://github.com/amaancoderx/npxskillui): siteden tasarım çıkarma aracı (`npx skillui`)
- anilbatir-design: anilbatir.com'un skillui ile çıkarılmış tasarım skill'i (`tasarimlar/` klasörüne)
