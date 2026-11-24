// =========================================================
// Kapaksız - ana sayfa (index.html)
// 1. Ruh hali kartlarını data/moods.json dosyasından üretir.
// 2. Günün kör randevusunu Open Library'den seçer.
// main.js'deki ortak fonksiyonları kullanır.
// =========================================================

const ruhHaliKutusu = document.querySelector("#ruh-hali-kartlari");
const gununKutusu = document.querySelector("#gunun-kitabi");

// Ruh hali kartı: Tıklanınca randevu sayfasına o konuyla gider (ör. randevu.html?konu=mystery).
function ruhHaliKartiOlustur(ruhHali) {
  const kart = document.createElement("a");
  kart.classList.add("ruh-hali-karti");
  kart.href = "randevu.html?konu=" + encodeURIComponent(ruhHali.konu);

  const baslik = document.createElement("h3");
  baslik.textContent = ruhHali.baslik;

  const ipucu = document.createElement("p");
  ipucu.textContent = ruhHali.ipucu;

  kart.append(baslik, ipucu);
  return kart;
}

// Yılın kaçıncı günündeyiz? Her gün farklı bir ruh hali ve kitap seçmek için kullanılır.
// Aynı gün sayfayı kaç kez açarsan aç aynı paket gelir.
function yilinGunu() {
  const bugun = new Date();
  const yilBasi = new Date(bugun.getFullYear(), 0, 0);
  const birGun = 24 * 60 * 60 * 1000;
  return Math.floor((bugun - yilBasi) / birGun);
}

async function gununRandevusunuGoster(ruhHalleri) {
  gununKutusu.replaceChildren(durumMesajiOlustur("Bugünün paketi hazırlanıyor…", "durum-yukleniyor"));

  try {
    const gun = yilinGunu();
    const ruhHali = ruhHalleri[gun % ruhHalleri.length];
    const kitaplar = await kitaplariGetir(ruhHali.konu);

    if (kitaplar.length === 0) {
      throw new Error("Uygun kitap bulunamadı");
    }

    const kitap = kitaplar[gun % kitaplar.length];
    gununKutusu.replaceChildren(kitapKartiOlustur(kitap, [ruhHali.baslik, kitap.yil]));
  } catch (hata) {
    console.error(hata);
    gununKutusu.replaceChildren(
      durumMesajiOlustur("Bugünün paketi getirilemedi. Bağlantını kontrol edip sayfayı yenile.", "durum-hata")
    );
  }
}

async function baslat() {
  try {
    const ruhHalleri = await ruhHalleriniGetir();
    ruhHalleri.forEach(function (ruhHali) {
      ruhHaliKutusu.appendChild(ruhHaliKartiOlustur(ruhHali));
    });
    gununRandevusunuGoster(ruhHalleri);
  } catch (hata) {
    console.error(hata);
    ruhHaliKutusu.appendChild(durumMesajiOlustur("Ruh halleri yüklenemedi.", "durum-hata"));
    gununKutusu.replaceChildren(durumMesajiOlustur("Bugünün paketi hazırlanamadı.", "durum-hata"));
  }
}

baslat();
