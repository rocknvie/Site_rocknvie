document.addEventListener("DOMContentLoaded", () => {
  const groups = document.querySelectorAll(".group");

  groups.forEach(group => {
    const hoverText = group.querySelector(".hover-text");
    const year = group.closest(".year-block")
      ?.querySelector(".year-title")
      ?.textContent.replace(/\D+/g, "");
    const rawName = group.querySelector("h3")?.textContent.trim();
    if (!year || !rawName) return;

    const baseImg = group.querySelector("img");
    if (!baseImg) return;

    const folder1 = `images/historique/${year}/${rawName}`;
    const folder2 = `images/historique/${year}/${rawName.toLowerCase().replace(/ /g, "_")}`;
    const folders = [folder1, folder2];

    let slides = [];
    let slideElems = [];
    let loaded = false;
    let pendingStart = false;
    let intervalId = null;
    let current = 0;

    // Test rapide : la première image existe-t-elle ?
    async function folderHasImages(folder) {
      const testUrl = `${folder}/01.webp?t=${Date.now()}`;
      try {
        const r = await fetch(testUrl, { method: "HEAD", cache: "no-store" });
        return r.ok;
      } catch {
        return false;
      }
    }

async function loadSlides() {
  if (loaded) return;

  let folderFound = null;

  for (const fld of folders) {
    try {
      if (await folderHasImages(fld)) {
        folderFound = fld;
        break;
      }
    } catch {}
  }

  if (!folderFound) {
    loaded = true;
    return;
  }

  slides = [];
  slideElems = [];

  for (let i = 1; i <= 25; i++) {
    const n = String(i).padStart(2, "0");
    const url = `${folderFound}/${n}.webp?t=${Date.now()}`;

    // Vérification silencieuse via fetch HEAD
    const exists = await fetch(url, { method: "HEAD" })
      .then(r => r.ok)
      .catch(() => false);

    if (!exists) break; // arrêt immédiat

    slides.push(url);
  }

  // Ajouter uniquement les images confirmées existantes
  slides.forEach(src => {
    try {
      const img = document.createElement("img");
      img.src = src;
      img.className = "slideshow-img";
      img.style.display = "none";
      img.style.width = "100%";
      img.style.objectFit = "contain";
      img.style.borderRadius = "10px";
      img.style.background = "#000";
      img.style.padding = "5px";

      const h3 = group.querySelector("h3");
      if (h3) group.insertBefore(img, h3);
      else group.appendChild(img);

      slideElems.push(img);
    } catch {}
  });

  loaded = true;

  if (pendingStart) {
    pendingStart = false;
    start();
  }
}



    function start() {
      if (!loaded) {
        pendingStart = true;
        return;
      }
      if (!slides.length || intervalId) return;

      if (hoverText) hoverText.style.display = "none";

      baseImg.style.display = "none";
      slideElems.forEach(el => el.style.display = "none");
      current = 0;
      slideElems[current].style.display = "block";

      intervalId = setInterval(() => {
        slideElems[current].style.display = "none";
        current = (current + 1) % slideElems.length;
        slideElems[current].style.display = "block";
      }, 2000);
    }

    function stop() {
      if (intervalId) clearInterval(intervalId);
      intervalId = null;
      pendingStart = false;

      slideElems.forEach(el => el.style.display = "none");
      baseImg.style.display = "";

      if (hoverText) hoverText.style.display = "block";
    }

    group.addEventListener("mouseenter", () => {
      if (!loaded) loadSlides();
      start();
    });

    group.addEventListener("mouseleave", stop);

    group.addEventListener("touchstart", () => {
      if (!loaded) loadSlides();
      start();
    }, { passive: true });

    group.addEventListener("touchend", () => {
      setTimeout(stop, 300);
    });

    // Préchargement background (rapide, optimisé)
    loadSlides();
  });
});
const fadeElems = document.querySelectorAll('.fade-in');
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, { threshold: 0.1 });

  fadeElems.forEach(el => observer.observe(el));
