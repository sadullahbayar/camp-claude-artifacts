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

## Oturum Başlangıcı (Zorunlu)

Her yeni konuşma/oturum açıldığında ilk iş olarak `git pull origin main` çalıştır. Başka biri push etmiş olabilir — eski versiyon üzerine yazma riskini önle.

## Kurallar

- Backend yok, tamamen statik frontend
- Tüm marka ve artifact metadata'sı `brands/brands.json` dosyasında tutulur
- Yeni marka/artifact eklendiğinde `brands.json` güncellenmeli
- Artifact klasörleri kendi içinde bağımsız çalışmalı (kendi CSS/JS'i olabilir)
- Netlify'a push ile otomatik deploy olur (main branch)
- Türkçe karakter içeren isimler slug olarak yazılmalı (ö→o, ş→s vb.)
- Deploy: `git push origin main`

## Yeni Artifact Oluşturma Workflow'u

Kullanıcı sıfırdan artifact oluşturmamı istediğinde:

1. Dosyayı doğru klasöre oluştur (`brands/{marka}/artifacts/{slug}/index.html`)
2. `brands.json`'ı güncelle
3. **Push etme!** Önce kullanıcıya lokal önizleme linki ver:
   `file:///Users/sadullahbayar/Desktop/ClaudeProjects/camp-artifacts/brands/{marka}/artifacts/{slug}/index.html`
4. Kullanıcının tarayıcıda açıp onaylamasını bekle
5. Onay gelince commit + push yap
6. Push sonrası canlı linki ver:
   `https://campartifacts.netlify.app/brands/{marka}/artifacts/{slug}/`

Hazır HTML dosyası verildiğinde de aynı şekilde: önce yerleştir, onay al, sonra push et.
Kullanıcı direkt "deploy et" derse onay beklemeden push yap — push sonrası her durumda canlı linki ver.

## Artifact Geri Butonu (Zorunlu)

Her artifact sayfasına sol üst köşeye floating geri butonu eklenmeli. Buton:
- Sayfanın tasarımına göre göze batmayacak şekilde uyarlanmalı (renk, opaklık vb.)
- `position: fixed; top: 16px; left: 16px; z-index: 9999;`
- Glassmorphism stili: yarı-saydam arka plan, backdrop-filter blur, ince border
- Hover'da biraz daha belirgin olmalı
- Link: `/brands/{marka-slug}/` şeklinde marka sayfasına dönmeli
- İçerik: `← {Marka Adı}` formatında
- CSS class: `.camp-back`

Örnek stil (koyu temalar için):
```css
.camp-back {
  position: fixed;
  top: 16px;
  left: 16px;
  z-index: 9999;
  background: rgba(255,255,255,0.06);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 10px;
  padding: 8px 14px;
  color: rgba(255,255,255,0.45);
  text-decoration: none;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  font-size: 13px;
  transition: all 0.2s ease;
}
.camp-back:hover {
  background: rgba(255,255,255,0.1);
  color: rgba(255,255,255,0.8);
}
```

Açık temalar için renkleri ters çevir (rgba(0,0,0,...) kullan). Her artifact'in temasına göre opaklık ve renk değerlerini ayarla.
