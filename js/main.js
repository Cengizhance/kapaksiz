// =========================================================
// Kapaksız - tüm sayfalarda ortak çalışan kodlar
//
// Bölümler:
// 1. Mobil menü              (Ders 7)
// 2. Karanlık mod            (Ders 8)
// 3. Veri yardımcıları       (Ders 9-10)
//
// Bu dosya her sayfanın en sonunda yüklenir. O anda HTML'in
// tamamı hazır olduğu için öğeleri hemen bulabiliriz.
//
// Güvenlik kuralı: Dışarıdan gelen hiçbir metin innerHTML ile
// sayfaya yazılmaz, her zaman textContent kullanılır.
// =========================================================


// ---------------------------------------------------------
// 1. Mobil menü
// ---------------------------------------------------------

// querySelector: CSS seçicisiyle sayfadaki İLK eşleşen öğeyi bulur.
// const: Bu değişkene bir daha başka bir değer atanmayacak.
const menuDugmesi = document.querySelector(".menu-dugmesi");
const anaMenu = document.querySelector("#ana-menu");
const menuBaglantilari = document.querySelectorAll(".ana-menu a");  // querySelectorAll: HEPSİNİ bulur

// Menüyü açan ya da kapatan tek bir fonksiyon.
// acikMi true ise açar, false ise kapatır.
function menuyuAyarla(acikMi) {
  // classList.toggle(sinif, kosul): kosul true ise sınıfı ekler, false ise kaldırır.
  // CSS'teki .ana-menu.acik kuralı bu sınıf sayesinde devreye girer.
  anaMenu.classList.toggle("acik", acikMi);

  // Ekran okuyucu ve CSS (hamburger → X) için düğmenin durumunu güncelle.
  // setAttribute metin ister, bu yüzden true/false'u String ile metne çeviriyoruz.
  menuDugmesi.setAttribute("aria-expanded", String(acikMi));
  menuDugmesi.setAttribute("aria-label", acikMi ? "Menüyü kapat" : "Menüyü aç");
}

// Olay 1: click
// addEventListener(olayAdı, fonksiyon): O olay olduğunda fonksiyonu çalıştırır.
// HTML'e onclick yazmıyoruz; olaylar sadece burada bağlanıyor (ödev şartı).
menuDugmesi.addEventListener("click", function () {
  // Menü şu an açık mı? aria-expanded niteliğine bakarak öğreniyoruz.
  const suAnAcikMi = menuDugmesi.getAttribute("aria-expanded") === "true";
  menuyuAyarla(!suAnAcikMi);      // ! tersini alır: açıksa kapat, kapalıysa aç
});

// Olay 2: keydown
// Menü açıkken Esc tuşuna basılırsa menü kapanır ve odak düğmeye döner.
// Böylece klavye kullanan biri nerede kaldığını kaybetmez.
document.addEventListener("keydown", function (olay) {
  // olay: Tarayıcının verdiği bilgi nesnesi. olay.key basılan tuşun adı.
  if (olay.key === "Escape" && anaMenu.classList.contains("acik")) {
    menuyuAyarla(false);
    menuDugmesi.focus();
  }
});

// Menüdeki bir bağlantıya tıklanınca menü kapansın.
// forEach: Listedeki her öğe için aynı işi yapar.
menuBaglantilari.forEach(function (baglanti) {
  baglanti.addEventListener("click", function () {
    menuyuAyarla(false);
  });
});
