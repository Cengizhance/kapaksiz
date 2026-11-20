# Kapaksız: proje notları

Bu dosya, projeye VS Code'daki Claude ile devam edebilmek için şimdiye kadar yapılanları özetler.

## Ödev
- **Ders:** CEN303 Web Mobil Programlama, final projesi. Bireysel.
- **Son teslim:** 25.12.2026, Google Classroom'a `AdSoyad_OgrenciNo.zip`
- **Kural:** Sadece HTML, CSS ve saf JavaScript. Bootstrap, Tailwind, jQuery gibi kütüphaneler yasak. Google Fonts ve ikonlar serbest.
- **Zorunlu öğeler:**
  - **HTML:** En az 3 sayfa, ortak menü, anlamsal etiketler, meta viewport, doğrulama nitelikleri olan form, `alt` metinleri.
  - **CSS:** Tek harici dosya, Flexbox ve Grid, en az 2 kırılma noktası, mobil menü, `:root` değişkenleri, transition/animasyon, `:hover`/`:focus`.
  - **JavaScript (DOM):** Harici `.js`, satır içi olay yok, `addEventListener` ile en az 3 farklı olay, `createElement` ile dinamik öğeler, arama/filtre, `classList`.
  - **JavaScript (veri):** `fetch` + `async/await`, yükleniyor ve hata durumları, `localStorage`.
  - **JavaScript (form):** `preventDefault` ile doğrulama, hata mesajı alanın yanında, başarı mesajı.
  - **Güvenlik:** Kullanıcı girdisi `textContent` ile yazılır, `innerHTML` ile yazılmaz. API anahtarı yok.
  - **Kod yönetimi:** GitHub, anlamlı commit mesajları, `css/` `js/` `img/` klasörleri.
- **Yayın:** GitHub Pages: `cengizhance.github.io/kapaksiz`
- **README:** En başta canlı site linki ve repo linki olacak. Sonra amaç, sayfalar, hangi gereksinimin hangi dosyanın kaçıncı satırında olduğu, kullanılan API, ekran görüntüleri ve **yapay zekâ kullanım beyanı**.

## Çalışma şekli
- Öğrenci projeye hâkim olmalı, hoca koda dair yazılı açıklama isteyebilir.
- Claude her adımda kavramı açıklar. Bir parçayı Claude örnek olarak yazar, benzerini öğrenci yazar, Claude kontrol eder.
- Her adımın sonunda anlamlı bir commit atılır. Commit'leri öğrenci kendisi atar.
- Yapay zekâdan alınan her yardım `AI-KULLANIMI.md` dosyasına not edilir.

## Konsept
**Kapaksız**, "kör randevu" usulü bir kitap sitesi. Kitaplar paketlenmiş kartlar olarak görünür, üstünde sadece ilk cümlesi ve birkaç etiketi yazar. Karta tıklayınca kart dönerek açılır, kapak ve isim ortaya çıkar.

| Sayfa | İçerik |
| --- | --- |
| `index.html`: Ana sayfa | "Bugün nasıl hissediyorsun?" ruh hali kartları (`data/moods.json`), günün kör randevusu |
| `randevu.html`: Kör randevu | Open Library'den gelen paketli kartlar, açılma animasyonu, arama ve filtre |
| `pasaport.html`: Okuma pasaportum | Okunan kitaplar, mühür animasyonu, yıllık hedef. Veriler `localStorage`'da. |
| `iletisim.html`: Kitap öner | "Bir yabancıya hangi kitabı paketlerdin?" formu, JavaScript doğrulaması |

- **API:** Open Library, anahtarsız.
  - Arama: `https://openlibrary.org/search.json?subject=mystery&fields=title,author_name,first_sentence,cover_i&limit=20`
  - Kapak: `https://covers.openlibrary.org/b/id/{cover_i}-M.jpg`
  - Bazı kitaplarda `first_sentence` yok, bazılarında başka dilde. Bunlar JavaScript'te filtrelenecek.
- **Kapsam dışı:** Edebiyat haritası fikri konuşuldu ama çıkarıldı.

## Yapılanlar (20.11.2026)
- GitHub reposu açıldı: https://github.com/Cengizhance/kapaksiz
- Repo `Belgeler\kapaksiz` klasörüne klonlandı, `kurulum` dalında çalışılıyor.
- Oluşturulan dosyalar:
  - `css/style.css`: Bölüm başlıkları ve `:root` değişkenleri. Renkler: kâğıt zemin, mühür kırmızısı, ambalaj kâğıdı.
  - `js/main.js`: Ortak kodlar için yer tutucu: menü ve karanlık mod.
  - `data/moods.json`: Ruh halinden Open Library konusuna 8 eşleşme.
  - `img/.gitkeep`
  - `AI-KULLANIMI.md`
- VS Code'a Live Server eklentisi kuruldu. `fetch` ile JSON okunabilmesi için site Live Server ile açılmalı.

## Sıradaki adımlar
1. **İlk commit henüz atılmadı.** Terminalde `kapaksiz` klasöründe sırayla:
   - `git add .`
   - `git commit -m "Proje klasör yapısı ve başlangıç dosyaları eklendi"`
   - `git push -u origin kurulum`
2. **Aşama 2, HTML iskeleti:** `index.html`'i Claude açıklamalarıyla yazacak, `iletisim.html`'i öğrenci aynı kalıpla yazacak. Sonra `randevu.html` ve `pasaport.html` gelecek.
3. **Aşama 3, CSS:** Flexbox menü, Grid kartlar, medya sorguları, hamburger menü, kart çevirme ve mühür animasyonları.
4. **Aşama 4, JavaScript DOM:** Menü, karanlık mod, ruh hali kartlarının `moods.json`'dan üretilmesi, arama ve filtre.
5. **Aşama 5, veri:** Open Library'den `fetch`, yükleniyor ve hata durumları, pasaport için `localStorage`.
6. **Aşama 6, form:** Doğrulama ve geri bildirim.
7. **Aşama 7, yayın:** `kurulum` dalını `main`'e birleştir, GitHub Pages'i aç, README'yi yaz, zip'i hazırla.

## Diğer bağlam
- Aynı tarihte CEN207 Java finali de teslim edilecek. O ayrı bir proje: `Belgeler\cen207-2026-2027-090-cengizhan-ogur-java`, ekip arkadaşı Furkan Enez. İş bölümü: A seçeneği (veri saklama ve dosyalar) Cengizhan'da, B seçeneği (algoritmalar) Furkan'da.
