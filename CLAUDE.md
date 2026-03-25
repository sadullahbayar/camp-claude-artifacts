# Camp Artifacts

HTML artifact ve mini app paylaşım platformu. Netlify üzerinde deploy ediliyor.

## Proje Yapısı

```
/index.html                              → Ana sayfa (marka kartları)
/assets/                                 → Ortak CSS/JS/görseller
/brands/{marka-slug}/index.html          → Marka sayfası (artifact listesi)
/brands/{marka-slug}/artifacts/{slug}/   → Artifact sayfaları (index.html + dosyalar)
/brands/brands.json                      → Marka ve artifact metadata
```

## Kurallar

- Backend yok, tamamen statik frontend
- Tüm marka ve artifact metadata'sı `brands/brands.json` dosyasında tutulur
- Yeni marka/artifact eklendiğinde `brands.json` güncellenmeli
- Artifact klasörleri kendi içinde bağımsız çalışmalı (kendi CSS/JS'i olabilir)
- Netlify'a push ile otomatik deploy olur (main branch)
- Türkçe karakter içeren isimler slug olarak yazılmalı (ö→o, ş→s vb.)
- Deploy: `git push origin main`
