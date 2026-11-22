#!/usr/bin/env bash
# Referans sitenin ham kaynağını indirir ve skillui ile tasarım sistemini çıkarır.
# Kullanım: cikar.sh <url> <cikti-klasoru>
# Çıktı:   <cikti>/kaynak/  ham HTML + aynı alan adındaki CSS/JS/SVG
#          <cikti>/tasarim/ skillui çıktısı (tokenlar, keyframe'ler, ekran görüntüleri)
set -uo pipefail

URL="${1:?Kullanım: cikar.sh <url> <cikti-klasoru>}"
OUT="${2:?Kullanım: cikar.sh <url> <cikti-klasoru>}"
UA="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124 Safari/537.36"
mkdir -p "$OUT/kaynak" "$OUT/tasarim"
OUT="$(cd "$OUT" && pwd)"

echo "== 1/2 Ham kaynak indiriliyor: $URL"
if ! curl -sSL -A "$UA" "$URL" -o "$OUT/kaynak/index.html"; then
  echo "HATA: sayfa indirilemedi. Bulut ortamındaysan alan adına ağ izni gerekebilir." >&2
  exit 1
fi

# Aynı alan adındaki (ya da göreli) css/js/svg/json dosyalarını bul ve indir.
python3 -I - "$URL" "$OUT/kaynak/index.html" > "$OUT/kaynak/.liste" <<'EOF'
import re, sys
from urllib.parse import urljoin, urlparse
base, path = sys.argv[1], sys.argv[2]
html = open(path, encoding="utf-8", errors="replace").read()
host = urlparse(base).netloc
seen = set()
for ref in re.findall(r'(?:src|href)=["\']([^"\'#]+)["\']', html):
    full = urljoin(base, ref)
    u = urlparse(full)
    if u.scheme not in ("http", "https") or u.netloc != host:
        continue
    name = u.path.lstrip("/") or "index.html"
    if not re.search(r"\.(css|js|mjs|svg|json|webmanifest)$", name):
        continue
    if name not in seen:
        seen.add(name)
        print(full + "\t" + name)
EOF
while IFS=$'\t' read -r full name; do
  [ -z "$full" ] && continue
  mkdir -p "$OUT/kaynak/$(dirname "$name")"
  code=$(curl -sSL -A "$UA" "$full" -o "$OUT/kaynak/$name" -w "%{http_code}")
  echo "   $name ($code, $(wc -c < "$OUT/kaynak/$name" 2>/dev/null || echo 0) bayt)"
done < "$OUT/kaynak/.liste"
rm -f "$OUT/kaynak/.liste"
echo "   Harici betikler (CDN):"
grep -oE '<script[^>]+src="https?://[^"]+"' "$OUT/kaynak/index.html" | grep -oE 'https?://[^"]+' | sed 's/^/     /'

echo "== 2/2 skillui ile tasarım sistemi çıkarılıyor"
# skillui ürettiği skill'i ~/.claude/skills altına kendiliğinden kopyalar; bunu önlemek için
# geçici bir ev klasörü kullanılır. Tarayıcının sertifika deposu (.pki) oraya taşınır ki
# proxy'li ortamlarda Playwright sayfayı açabilsin.
SANDBOX_HOME="$(mktemp -d)"
[ -d "$HOME/.pki" ] && cp -r "$HOME/.pki" "$SANDBOX_HOME/"
EXTRA_ENV=()
[ -n "${HTTPS_PROXY:-}${https_proxy:-}" ] && EXTRA_ENV+=("NODE_USE_ENV_PROXY=1")
[ -f /root/.ccr/ca-bundle.crt ] && EXTRA_ENV+=("NODE_EXTRA_CA_CERTS=/root/.ccr/ca-bundle.crt")
MODE=()
node -e "require('playwright')" 2>/dev/null && MODE=(--mode ultra --screens 1)
( cd "$OUT/tasarim" && env HOME="$SANDBOX_HOME" "${EXTRA_ENV[@]}" \
    npx -y skillui@1.3.4 --url "$URL" "${MODE[@]}" --out "$OUT/tasarim" 2>&1 \
  | sed 's/\x1b\[[0-9;?]*[a-zA-Z]//g' | grep -E "✓|✗|Error" )
rm -rf "$SANDBOX_HOME"

echo
echo "Bitti. Okunacaklar:"
echo "  $OUT/kaynak/      (HTML, CSS, JS'nin tamamını oku)"
find "$OUT/tasarim" -maxdepth 2 -name SKILL.md -printf "  %p\n" 2>/dev/null
find "$OUT/tasarim" -type d -path "*screens/scroll" -printf "  %p  (referans ekran görüntüleri)\n" 2>/dev/null
