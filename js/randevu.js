// =========================================================
// Kapaksız - kör randevu sayfası (randevu.html)
// - Seçilen ruh haline göre Open Library'den kitapları çeker.
// - Yükleniyor ve hata durumlarını gösterir.
// - İlk cümlede arama yapar (input olayı), ruh haline göre süzer (change olayı).
// main.js'deki ortak fonksiyonları kullanır.
// =========================================================

const aramaKutusu = document.querySelector("#arama");
const konuFiltresi = document.querySelector("#konu-filtresi");
const kartKutusu = document.querySelector("#kitap-kartlari");
const yukleniyorMesaji = document.querySelector("#yukleniyor");
const hataKutusu = document.querySelector("#hata-kutusu");
const tekrarDugmesi = document.querySelector("#tekrar-dene");
const sonucYokMesaji = document.querySelector("#sonuc-yok");

const VARSAYILAN_KONU = "fiction";   // "Hepsi" seçiliyken kullanılan genel konu
const EN_FAZLA_KART = 24;

let ruhHalleri = [];
let yuklenenKartlar = [];   // { kitap, kart } çiftleri. Arama bu listede yapılır.
let sonIstekNo = 0;

// Ruh hallerini <select> içine <option> olarak ekler.
function filtreSecenekleriniDoldur() {
  ruhHalleri.forEach(function (ruhHali) {
    const secenek = document.createElement("option");
    secenek.value = ruhHali.konu;
    secenek.textContent = ruhHali.baslik;
    konuFiltresi.appendChild(secenek);
  });
}

// Durum: "yukleniyor", "hata" ya da "hazir". hidden niteliğiyle doğru mesajı gösterir.
function durumuGoster(durum) {
  yukleniyorMesaji.hidden = durum !== "yukleniyor";
  hataKutusu.hidden = durum !== "hata";
  kartKutusu.setAttribute("aria-busy", String(durum === "yukleniyor"));
  if (durum !== "hazir") {
    sonucYokMesaji.hidden = true;
  }
}

async function kitaplariYukle() {
  const konu = konuFiltresi.value || VARSAYILAN_KONU;
  const ruhHali = ruhHalleri.find(function (r) { return r.konu === konu; });
  const etiket = ruhHali ? ruhHali.baslik : "Karışık";

  // Kullanıcı filtreyi hızlıca değiştirirse eski isteğin cevabı yenisinin üstüne yazmasın.
  const istekNo = ++sonIstekNo;

  kartKutusu.replaceChildren();
  yuklenenKartlar = [];
  durumuGoster("yukleniyor");

  try {
    const kitaplar = await kitaplariGetir(konu);
    if (istekNo !== sonIstekNo) {
      return;
    }

    kitaplar.slice(0, EN_FAZLA_KART).forEach(function (kitap) {
      const kart = kitapKartiOlustur(kitap, [etiket, kitap.yil]);
      kartKutusu.appendChild(kart);
      yuklenenKartlar.push({ kitap: kitap, kart: kart });
    });

    durumuGoster("hazir");
    kartlariSuz();
  } catch (hata) {
    if (istekNo !== sonIstekNo) {
      return;
    }
    console.error(hata);
    durumuGoster("hata");
  }
}

// Arama: İlk cümlesinde aranan kelime geçmeyen kartları gizler.
// Kartları silmeyiz, sadece hidden yaparız; arama temizlenince geri gelirler.
function kartlariSuz() {
  const aranan = aramaKutusu.value.trim().toLowerCase();
  let gorunenSayisi = 0;

  yuklenenKartlar.forEach(function (oge) {
    const uygunMu = oge.kitap.ilkCumle.toLowerCase().includes(aranan);
    oge.kart.hidden = !uygunMu;
    if (uygunMu) {
      gorunenSayisi++;
    }
  });

  sonucYokMesaji.hidden = gorunenSayisi > 0;
}

// Olay: input. Her harf yazıldığında çalışır, Enter'a basmaya gerek yok.
aramaKutusu.addEventListener("input", kartlariSuz);

// Olay: change. Yeni ruh hali seçilince adres çubuğunu günceller ve yeni kitapları getirir.
konuFiltresi.addEventListener("change", function () {
  const adres = new URL(window.location.href);
  if (konuFiltresi.value) {
    adres.searchParams.set("konu", konuFiltresi.value);
  } else {
    adres.searchParams.delete("konu");
  }
  history.replaceState(null, "", adres);   // Sayfayı yenilemeden adresi değiştirir
  aramaKutusu.value = "";
  kitaplariYukle();
});

tekrarDugmesi.addEventListener("click", kitaplariYukle);

async function baslat() {
  try {
    ruhHalleri = await ruhHalleriniGetir();
    filtreSecenekleriniDoldur();
  } catch (hata) {
    // moods.json okunamazsa filtre sadece "Hepsi" ile çalışmaya devam eder.
    console.error(hata);
  }

  // Ana sayfadaki ruh hali kartından gelindiyse (ör. ?konu=mystery) o konuyu seç.
  const gelenKonu = new URLSearchParams(window.location.search).get("konu");
  if (ruhHalleri.some(function (r) { return r.konu === gelenKonu; })) {
    konuFiltresi.value = gelenKonu;
  }

  kitaplariYukle();
}

baslat();
