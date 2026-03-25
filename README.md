# Camp Artifacts

Claude ile oluşturduğumuz HTML artifactleri, mini uygulamaları ve raporları ekip olarak paylaştığımız platform.

**Canlı Site:** https://campartifacts.netlify.app

---

## Ne İşe Yarıyor?

Claude ile konuşurken sıklıkla HTML çıktıları, interaktif raporlar veya küçük frontend araçları oluşturuyoruz. Ancak bunları ekip arkadaşlarımızla paylaşmak zor oluyordu. Camp Artifacts bu sorunu çözüyor:

- Oluşturduğun HTML'i bu repoya ekle
- Push et, otomatik olarak Netlify'da canlıya çıksın
- Linki ekip arkadaşlarınla paylaş

## Site Yapısı

```
Ana Sayfa (marka kartları)
  └── Marka Sayfası (artifact listesi)
        └── Artifact (HTML sayfa/uygulama)
```

- **Ana sayfa** → Tüm markaların kartları
- **Marka sayfası** → O markaya ait artifact listesi
- **Artifact** → Bağımsız HTML sayfa veya mini uygulama

---

## Kurulum Rehberi (Sıfırdan)

Bu rehber teknik bilgi gerektirmez. Adım adım takip et.

### Adım 1: Gerekli Programları Kur

Bilgisayarında şu iki programa ihtiyacın var:

**a) Git** (kodu indirmek ve göndermek için)

- https://git-scm.com/downloads adresine git
- İşletim sistemine uygun olanı indir ve kur
- Kurulumda tüm ayarları varsayılan (default) bırakabilirsin, sadece "Next" de

**b) Claude Code** (AI ile çalışmak için)

- Claude Code'u henüz kurmadıysan, IT ekibinden veya kurulum yapan kişiden destek al

### Adım 2: Projeyi Bilgisayarına İndir

**Mac kullanıyorsan** Terminal'i aç (Spotlight'ta "Terminal" yaz).
**Windows kullanıyorsan** Git Bash'i aç (Başlat menüsünde "Git Bash" yaz).

Aşağıdaki komutları sırayla yaz ve her birinin ardından Enter'a bas:

```bash
cd ~/Desktop
```
> Bu seni Desktop klasörüne götürür. İstersen başka bir konum da seçebilirsin (örn. `cd ~/Documents`).

```bash
git clone https://github.com/sadullahbayar/camp-claude-artifacts.git
```
> Bu komutu çalıştırınca Desktop'unda `camp-claude-artifacts` adında bir klasör oluşacak. Projenin tüm dosyaları bunun içinde.

### Adım 3: Claude Code'u Bu Projede Aç

Terminal'de şu komutu yaz:

```bash
cd ~/Desktop/camp-claude-artifacts
claude
```

Claude Code açılacak. Artık bu proje üzerinde Claude ile çalışabilirsin.

### Adım 4: Claude'a Ne İstediğini Söyle

Claude Code açıldığında doğal dilde konuşabilirsin. Örnekler:

- *"USCAMP altına yeni bir quiz uygulaması oluştur"*
- *"Bu HTML dosyasını Cancera markasına ekle ve deploy et"*
- *"Yeni bir marka ekle: MarkaX"*

Claude dosyaları oluşturacak, sana önizleme linki verecek, onayını aldıktan sonra canlıya alacak.

### Her Yeni Oturumda

Projeyi daha önce indirdiysen tekrar indirmene gerek yok. Sadece:

```bash
cd ~/Desktop/camp-claude-artifacts
claude
```

Claude zaten ilk iş olarak en güncel versiyonu çekecektir (`git pull`). Ama sen de her oturum başında güncel olduğundan emin olmak istersen:

```bash
cd ~/Desktop/camp-claude-artifacts
git pull origin main
claude
```

### Sorun mu Yaşıyorsun?

| Sorun | Çözüm |
|---|---|
| `git: command not found` | Git kurulu değil. Adım 1'e dön. |
| `claude: command not found` | Claude Code kurulu değil. IT ekibinden destek al. |
| `Permission denied` | GitHub'a erişim iznin olmayabilir. IT ekibine repo erişimi iste. |
| `CONFLICT` veya `merge` hatası | Claude Code'a *"git conflict var, çözer misin?"* de. |

---

## Artifact Ekleme (Detaylı)

### 1. Mevcut bir markaya artifact ekle

Diyelim USCAMP markasına yeni bir artifact ekleyeceksin:

**a) Klasörü oluştur:**

```bash
mkdir -p brands/uscamp/artifacts/yeni-artifact-adi
```

**b) HTML dosyanı koy:**

```bash
cp hazir-dosya.html brands/uscamp/artifacts/yeni-artifact-adi/index.html
```

**c) `brands/brands.json` dosyasını güncelle:**

İlgili markanın `artifacts` dizisine yeni artifact'i ekle:

```json
{
  "slug": "yeni-artifact-adi",
  "name": "Artifact Başlığı",
  "description": "Kısa açıklama",
  "date": "2026-03-25",
  "tags": ["etiket1", "etiket2"]
}
```

**d) Push et:**

```bash
git add .
git commit -m "feat: USCAMP - Yeni artifact ekle"
git push origin main
```

Birkaç dakika içinde canlıya çıkar.

### 2. Yeni marka ekle

**a) Klasörleri oluştur:**

```bash
mkdir -p brands/yeni-marka/artifacts
```

**b) Marka sayfasını kopyala (template):**

Mevcut bir markanın `index.html` dosyasını kopyala — sayfa, `brands.json`'dan dinamik olarak çalışır:

```bash
cp brands/uscamp/index.html brands/yeni-marka/index.html
```

**c) `brands/brands.json`'a markayı ekle:**

```json
{
  "slug": "yeni-marka",
  "name": "Marka Adı",
  "description": "Marka açıklaması",
  "color": "#HEX_RENK",
  "icon": "EMOJI",
  "artifacts": []
}
```

**d) Artifact ekleyip push et.**

---

## Claude Code ile Kullanım

Bu proje Claude Code ile entegre çalışmak üzere tasarlandı. Claude Code açıkken şunları söyleyebilirsin:

| Ne istiyorsun? | Ne söyle? |
|---|---|
| Hazır HTML eklemek | *"Bu HTML'i USCAMP altına ekle ve deploy et"* |
| Sıfırdan artifact oluşturmak | *"Cancera için bir hasta analiz dashboardu oluştur"* |
| Yeni marka eklemek | *"X markasını ekle"* |
| Artifact silmek | *"Şu artifact'i kaldır"* |

Claude Code sıfırdan oluştururken önce lokal önizleme linki verir, tarayıcıda kontrol ettikten sonra onayınla deploy eder.

---

## Proje Yapısı (Dosyalar)

```
camp-claude-artifacts/
├── index.html                          # Ana sayfa
├── 404.html                            # 404 sayfası
├── brands/
│   ├── brands.json                     # Tüm marka & artifact metadata
│   ├── uscamp/
│   │   ├── index.html                  # Marka sayfası
│   │   └── artifacts/
│   │       ├── match-score-calculator/
│   │       │   └── index.html
│   │       └── roadmap-quiz/
│   │           └── index.html
│   └── cancera/
│       ├── index.html
│       └── artifacts/
│           └── patient-journey/
│               └── index.html
├── CLAUDE.md                           # Claude Code proje kuralları
└── README.md                           # Bu dosya
```

## Kurallar ve Standartlar

- **Backend yok.** Tamamen statik frontend. Netlify üzerinde serve ediliyor.
- **Her artifact bağımsız.** Kendi CSS/JS'ini içerir, dışarıya bağımlılık yok (harici fontlar hariç).
- **Geri butonu zorunlu.** Her artifact'in sol üstünde marka sayfasına dönen küçük bir floating buton olmalı.
- **Slug formatı.** Klasör ve dosya isimlerinde Türkçe karakter kullanma: `ö→o`, `ş→s`, `ç→c` vb. Boşluklar yerine tire (`-`) kullan.
- **brands.json güncel tutulmalı.** Her ekleme/silme işleminde bu dosya da güncellenmelidir.

## Deploy

`main` branch'e push edildiğinde Netlify otomatik deploy eder. Ekstra bir işlem gerekmez.

**Netlify Site:** https://campartifacts.netlify.app
**GitHub Repo:** https://github.com/sadullahbayar/camp-claude-artifacts
