// =========================================================
// Kapaksız - tüm sayfalarda ortak çalışan kodlar
// 1. Mobil menü
// 2. Karanlık mod (tercih localStorage'da saklanır)
// 3. Veri yardımcıları: moods.json ve Open Library'den veri çekme
// 4. Kitap kartı üretme (ana sayfa ve randevu sayfası birlikte kullanır)
// 5. Pasaport kayıtları (localStorage)
//
// Bu dosya her sayfada ilk yüklenir. Sayfaya özel dosyalar
// (anasayfa.js, randevu.js ...) buradaki fonksiyonları kullanır.
// Güvenlik kuralı: Dışarıdan gelen hiçbir metin innerHTML ile yazılmaz,
// her zaman textContent kullanılır.
// =========================================================


// ---------------------------------------------------------
// 1. Mobil menü
// ---------------------------------------------------------
const menuDugmesi = document.querySelector(".menu-dugmesi");
const anaMenu = document.querySelector("#ana-menu");

function menuyuAyarla(acikMi) {
  // classList.toggle'ın ikinci parametresi: true ise sınıfı ekler, false ise kaldırır.
  anaMenu.classList.toggle("acik", acikMi);
  menuDugmesi.setAttribute("aria-expanded", String(acikMi));
  menuDugmesi.setAttribute("aria-label", acikMi ? "Menüyü kapat" : "Menüyü aç");
}

// Olay 1: click. Düğmeye her tıklamada menü açıksa kapanır, kapalıysa açılır.
menuDugmesi.addEventListener("click", function () {
  const acikMi = menuDugmesi.getAttribute("aria-expanded") === "true";
  menuyuAyarla(!acikMi);
});

// Olay 2: keydown. Menü açıkken Esc tuşu menüyü kapatır ve odağı düğmeye geri verir.
document.addEventListener("keydown", function (olay) {
  if (olay.key === "Escape" && anaMenu.classList.contains("acik")) {
    menuyuAyarla(false);
    menuDugmesi.focus();
  }
});


// ---------------------------------------------------------
// 2. Karanlık mod
// ---------------------------------------------------------
const TEMA_ANAHTARI = "kapaksiz-tema";
const temaDugmesi = document.querySelector(".tema-dugmesi");

function temayiUygula(tema) {
  // CSS'teki :root[data-tema="karanlik"] kuralı bu nitelik sayesinde devreye girer.
  if (tema === "karanlik") {
    document.documentElement.setAttribute("data-tema", "karanlik");
  } else {
    document.documentElement.removeAttribute("data-tema");
  }
}

// Sayfa açılınca daha önce kaydedilen tercihi uygula.
temayiUygula(localStorage.getItem(TEMA_ANAHTARI));

temaDugmesi.addEventListener("click", function () {
  const karanlikMi = document.documentElement.getAttribute("data-tema") === "karanlik";
  const yeniTema = karanlikMi ? "acik" : "karanlik";
  temayiUygula(yeniTema);
  localStorage.setItem(TEMA_ANAHTARI, yeniTema);   // Tercih bir sonraki ziyarette de hatırlanır
});


// ---------------------------------------------------------
// 3. Veri yardımcıları
// ---------------------------------------------------------

// Kendi JSON dosyamızı okur. fetch dosya yollarında da çalışır,
// bu yüzden site Live Server (ya da GitHub Pages) üzerinden açılmalı.
async function ruhHalleriniGetir() {
  const yanit = await fetch("data/moods.json");
  if (!yanit.ok) {
    throw new Error("moods.json okunamadı: " + yanit.status);
  }
  return yanit.json();
}

const API_ADRESI = "https://openlibrary.org/search.json";
const KAPAK_ADRESI = "https://covers.openlibrary.org/b/id/";

// Open Library'den bir konudaki kitapları çeker ve sadece işimize yarayanları döndürür.
// async/await: fetch'in cevabını beklerken sayfa donmaz, kod okunuşu da sıralı kalır.
async function kitaplariGetir(konu) {
  const adres = API_ADRESI +
    "?subject=" + encodeURIComponent(konu) +
    "&fields=key,title,author_name,first_sentence,cover_i,first_publish_year" +
    "&limit=100";

  const yanit = await fetch(adres);
  // fetch, sunucu 404 ya da 500 döndürse bile hata fırlatmaz. Bunu kendimiz kontrol ederiz.
  if (!yanit.ok) {
    throw new Error("Open Library hatası: " + yanit.status);
  }
  const veri = await yanit.json();

  // map: Her ham kaydı bizim biçimimize çevirir. Uygun olmayanlar null olur, filter onları atar.
  return veri.docs
    .map(kitabiDuzenle)
    .filter(function (kitap) { return kitap !== null; });
}

// API'den gelen bir kaydı kontrol eder ve sade bir nesneye çevirir.
// Kapağı ya da İngilizce ilk cümlesi olmayan kitaplar oyuna giremez.
function kitabiDuzenle(ham) {
  if (!ham.cover_i || !Array.isArray(ham.first_sentence)) {
    return null;
  }

  const cumle = ham.first_sentence.find(ilkCumleUygunMu);
  if (!cumle) {
    return null;
  }

  return {
    anahtar: ham.key,                      // ör. "/works/OL472165W", her kitap için benzersiz
    baslik: ham.title,
    yazar: ham.author_name ? ham.author_name.join(", ") : "Bilinmeyen yazar",
    ilkCumle: cumle.trim(),
    kapakId: ham.cover_i,
    yil: ham.first_publish_year
  };
}

// Bazı ilk cümleler Felemenkçe, Almanca gibi başka dillerde geliyor.
// Basit bir kontrol: Sadece İngiliz alfabesi ve noktalama işaretleri olsun,
// içinde de en az 2 tane sık kullanılan İngilizce kelime geçsin.
const INGILIZCE_KELIMELER = /\b(the|and|of|to|was|he|she|it|i|that|is|his|her|had|with|for|on|in|a|my|you)\b/gi;

function ilkCumleUygunMu(cumle) {
  const sadeceLatin = /^[\x20-\x7E\s‘’“”–—…]+$/.test(cumle);
  const uzunlukUygun = cumle.length >= 20 && cumle.length <= 300;
  const eslesmeler = cumle.match(INGILIZCE_KELIMELER) || [];
  return sadeceLatin && uzunlukUygun && eslesmeler.length >= 2;
}

// Durum mesajı (yükleniyor, hata, bilgi) için küçük bir <p> üretir.
function durumMesajiOlustur(metin, ekSinif) {
  const p = document.createElement("p");
  p.classList.add("durum");
  if (ekSinif) {
    p.classList.add(ekSinif);
  }
  p.textContent = metin;
  return p;
}


// ---------------------------------------------------------
// 4. Kitap kartı (paket)
// ---------------------------------------------------------
// Üretilen yapı (CSS'teki .kitap-karti kurallarıyla eşleşir):
// <article class="kitap-karti">
//   <div class="kart-ic">
//     <div class="kart-yuz kart-on">   ilk cümle + etiketler   </div>
//     <div class="kart-yuz kart-arka"> kapak + başlık + yazar + düğmeler </div>
//   </div>
// </article>
function kitapKartiOlustur(kitap, etiketler) {
  const kart = document.createElement("article");
  kart.classList.add("kitap-karti");

  const ic = document.createElement("div");
  ic.classList.add("kart-ic");

  // --- Ön yüz: Paket ---
  const on = document.createElement("div");
  on.classList.add("kart-yuz", "kart-on");
  // Ön yüz klavyeyle de açılabilsin diye düğme gibi davranır.
  on.setAttribute("role", "button");
  on.setAttribute("tabindex", "0");
  on.setAttribute("aria-label", "Paketi aç. İlk cümle: " + kitap.ilkCumle);

  const alinti = document.createElement("blockquote");
  alinti.classList.add("ilk-cumle");
  const alintiMetni = document.createElement("p");
  alintiMetni.textContent = "“" + kitap.ilkCumle + "”";
  alinti.appendChild(alintiMetni);
  on.appendChild(alinti);

  const etiketListesi = document.createElement("ul");
  etiketListesi.classList.add("etiketler");
  etiketler
    .filter(Boolean)                       // Boş etiketleri (ör. yılı bilinmeyen) atla
    .forEach(function (etiket) {
      const li = document.createElement("li");
      li.textContent = etiket;
      etiketListesi.appendChild(li);
    });
  on.appendChild(etiketListesi);

  // --- Arka yüz: Kapak ve isim ---
  const arka = document.createElement("div");
  arka.classList.add("kart-yuz", "kart-arka");
  arka.inert = true;   // Kapalıyken arka yüze tıklanamaz, Tab tuşuyla da ulaşılamaz

  const kapak = document.createElement("img");
  kapak.alt = kitap.baslik + " kitabının kapağı";   // Ödev şartı: alt metni
  kapak.width = 180;
  kapak.height = 270;
  // src şimdilik boş. Kapak, paket açılınca yüklenir; böylece sürpriz bozulmaz.

  const baslik = document.createElement("h3");
  baslik.textContent = kitap.baslik;

  const yazar = document.createElement("p");
  yazar.textContent = kitap.yazar;

  const dugmeler = document.createElement("div");
  dugmeler.classList.add("kart-dugmeleri");

  const muhurDugmesi = document.createElement("button");
  muhurDugmesi.type = "button";
  muhurDugmesi.classList.add("dugme");
  muhurDugmesiniAyarla(muhurDugmesi, pasaporttaMi(kitap.anahtar));

  const kapatDugmesi = document.createElement("button");
  kapatDugmesi.type = "button";
  kapatDugmesi.classList.add("dugme", "dugme-ikincil");
  kapatDugmesi.textContent = "Paketi kapat";

  dugmeler.append(muhurDugmesi, kapatDugmesi);
  arka.append(kapak, baslik, yazar, dugmeler);

  ic.append(on, arka);
  kart.appendChild(ic);

  // --- Olaylar ---
  function kartiAyarla(acikMi) {
    kart.classList.toggle("acik", acikMi);   // CSS'teki dönme animasyonunu tetikler
    on.inert = acikMi;
    arka.inert = !acikMi;
    if (acikMi && !kapak.src) {
      kapak.src = KAPAK_ADRESI + kitap.kapakId + "-M.jpg";
    }
    // Odağı görünen yüze taşı, klavye kullanıcısı kaybolmasın.
    if (acikMi) {
      (muhurDugmesi.disabled ? kapatDugmesi : muhurDugmesi).focus();
    } else {
      on.focus();
    }
  }

  on.addEventListener("click", function () {
    kartiAyarla(true);
  });

  // role="button" verdiğimiz öğe, gerçek düğme gibi Enter ve Boşluk ile de çalışmalı.
  on.addEventListener("keydown", function (olay) {
    if (olay.key === "Enter" || olay.key === " ") {
      olay.preventDefault();               // Boşluk tuşu sayfayı kaydırmasın
      kartiAyarla(true);
    }
  });

  kapatDugmesi.addEventListener("click", function () {
    kartiAyarla(false);
  });

  muhurDugmesi.addEventListener("click", function () {
    pasaportaEkle(kitap);
    muhurDugmesiniAyarla(muhurDugmesi, true);
    kapatDugmesi.focus();   // Devre dışı kalan düğmeden odağı al
  });

  return kart;
}

function muhurDugmesiniAyarla(dugme, muhurlendiMi) {
  dugme.textContent = muhurlendiMi ? "Pasaportta ✓" : "Okudum, mühürle";
  dugme.disabled = muhurlendiMi;
}


// ---------------------------------------------------------
// 5. Pasaport kayıtları (localStorage)
// ---------------------------------------------------------
// localStorage sadece metin saklar. Diziyi JSON.stringify ile metne çevirip kaydeder,
// okurken JSON.parse ile tekrar diziye çeviririz.
const PASAPORT_ANAHTARI = "kapaksiz-pasaport";

function pasaportuOku() {
  try {
    const veri = JSON.parse(localStorage.getItem(PASAPORT_ANAHTARI));
    return Array.isArray(veri) ? veri : [];
  } catch (hata) {
    // Kayıt bozulmuşsa sayfa çökmesin, boş pasaportla devam etsin.
    return [];
  }
}

function pasaportuKaydet(liste) {
  localStorage.setItem(PASAPORT_ANAHTARI, JSON.stringify(liste));
}

function pasaporttaMi(anahtar) {
  return pasaportuOku().some(function (kayit) { return kayit.anahtar === anahtar; });
}

function pasaportaEkle(kitap) {
  if (pasaporttaMi(kitap.anahtar)) {
    return;
  }
  const liste = pasaportuOku();
  liste.push({
    anahtar: kitap.anahtar,
    baslik: kitap.baslik,
    yazar: kitap.yazar,
    kapakId: kitap.kapakId,
    tarih: new Date().toISOString()
  });
  pasaportuKaydet(liste);
}
