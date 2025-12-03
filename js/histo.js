document.addEventListener("DOMContentLoaded", () => {
  const groups = document.querySelectorAll(".group");

  // --- Préchargement immédiat de la première image de chaque groupe ---
  groups.forEach(group => {
    const firstSlide = group.querySelector(".slideshow .slide");
    if (firstSlide) {
      const imgPreload = new Image();
      imgPreload.src = firstSlide.src;
      // Affiche la première image directement (sauf si le CSS gère déjà)
      firstSlide.style.display = "block";
    }
  });

  // Map pour pouvoir contrôler start/stop depuis l'extérieur (observer mobile)
  const controls = new Map();

  groups.forEach(group => {
    const hoverText = group.querySelector(".hover-text");
    const baseImg = group.querySelector("img"); // image principale si présente
    let slideElems = Array.from(group.querySelectorAll(".slideshow .slide"));
    let intervalId = null;
    let current = 0;

    // --- Préchargement du reste des images ---
    slideElems.slice(1).forEach(slide => {
      const img = new Image();
      img.src = slide.src;
      slide.style.display = "none";
    });

    // S'assure que si aucune slide n'existe on ne plante pas
    function showSlide(i) {
      if (!slideElems.length) return;
      slideElems.forEach(el => el.style.display = "none");
      // defensive: clamp index
      const idx = ((i % slideElems.length) + slideElems.length) % slideElems.length;
      slideElems[idx].style.display = "block";
    }

    function nextSlide() {
      if (!slideElems.length) return;
      current = (current + 1) % slideElems.length;
      showSlide(current);
    }

    function start() {
  if (!slideElems.length || intervalId) return;

  if (hoverText) hoverText.style.display = "none";
  if (baseImg) baseImg.style.display = "none";

  current = 0;
  showSlide(current);

  if (slideElems.length > 1) {
    // comportement identique à l'ancienne version :
    // on avance une fois immédiatement (pour un démarrage "plus vite")
    nextSlide();
    // puis on lance l'intervalle régulier
    intervalId = setInterval(nextSlide, 2000);
  } else {
    intervalId = null;
  }

  group.classList.add("slideshow-running");
}


    function stop() {
      if (intervalId) {
        clearInterval(intervalId);
      }
      intervalId = null;

      // cache toutes les slides et restore l'image de base / texte
      slideElems.forEach(el => el.style.display = "none");
      if (baseImg) baseImg.style.display = "";
      if (hoverText) hoverText.style.display = "block";

      group.classList.remove("slideshow-running");
    }

    // comportements desktop (hover)
    group.addEventListener("mouseenter", start);
    group.addEventListener("mouseleave", stop);

    // comportements tactile simples (touchstart lance, touchend stop après court délai)
    group.addEventListener("touchstart", (e) => {
      // empêche le déclenchement d'autres handlers si nécessaire
      start();
    }, { passive: true });

    group.addEventListener("touchend", () => {
      // petit délai pour laisser l'utilisateur voir la 1re image
      setTimeout(stop, 300);
    });

    // expose contrôles pour l'observer mobile
    controls.set(group, { start, stop });
  });

  // --- Fade-in des éléments (inchangé) ---
  const fadeElems = document.querySelectorAll('.fade-in');
  const fadeObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) entry.target.classList.add('visible');
    });
  }, { threshold: 0.1 });

  fadeElems.forEach(el => fadeObserver.observe(el));

  // --- Comportement mobile : activer uniquement le slideshow du groupe centré ---
 if (window.matchMedia("(max-width: 768px)").matches) {

  const mobileObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      const group = entry.target;
      const ctrl = controls.get(group);
      if (!ctrl) return;

      // Si le groupe est suffisamment visible pour être "le" groupe affiché
      if (entry.intersectionRatio >= 0.2) {

        // Stoppe tous les autres groupes
        controls.forEach((c, g) => {
          if (g !== group) c.stop();
        });

        // Lance immédiatement celui-ci
        ctrl.start();

      } else {
        // Sinon il doit s'arrêter
        ctrl.stop();
      }
    });
  }, {
    root: null,
    threshold: [0, 0.1, 0.2, 0.3, 0.5, 1],
  });

  groups.forEach(g => mobileObserver.observe(g));
}


});
