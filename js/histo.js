document.addEventListener("DOMContentLoaded", () => {

  const groups = document.querySelectorAll(".group");

  // --- Contrôles accessibles pour l'observer mobile ---
  const controls = new Map();

  groups.forEach(group => {

    const hoverText = group.querySelector(".hover-text");
    const baseImg = group.querySelector(".base-img") || group.querySelector("img");
    const slideElems = Array.from(group.querySelectorAll(".slideshow .slide"));

    let current = 0;
    let intervalId = null;
    let running = false;

    // --- Préchargement ---
    if (slideElems.length) {
      const preloadFirst = new Image();
      preloadFirst.src = slideElems[0].src;
      slideElems.forEach((s, i) => {
        if (i > 0) {
          const img = new Image();
          img.src = s.src;
        }
        s.style.display = "none";
      });
    }

    // --- Gestion affichage slides ---
    function showSlide(i) {
      if (!slideElems.length) return;

      slideElems.forEach(el => (el.style.display = "none"));

      const idx = ((i % slideElems.length) + slideElems.length) % slideElems.length;
      slideElems[idx].style.display = "block";
    }

    function nextSlide() {
      if (!slideElems.length) return;
      current = (current + 1) % slideElems.length;
      showSlide(current);
    }

    // --- START ---
    function start() {
      if (!slideElems.length || running) return;
      running = true;

      if (hoverText) hoverText.style.display = "none";
      if (baseImg) baseImg.style.display = "none";

      current = 0;
      showSlide(current);

      if (slideElems.length > 1) {
        nextSlide();
        intervalId = setInterval(nextSlide, 2000);
      }

      group.classList.add("slideshow-running");
    }

    // --- STOP ---
    function stop() {
      if (!running) return;
      running = false;

      if (intervalId) clearInterval(intervalId);
      intervalId = null;

      slideElems.forEach(el => el.style.display = "none");
      if (baseImg) baseImg.style.display = "";
      if (hoverText) hoverText.style.display = "block";

      group.classList.remove("slideshow-running");
    }

    // Sauvegarde pour l'observer
    controls.set(group, { start, stop });

    // --- Desktop hover ---
    group.addEventListener("mouseenter", start);
    group.addEventListener("mouseleave", stop);

    // --- Touch devices (fallback) ---
    group.addEventListener(
      "touchstart",
      () => start(),
      { passive: true }
    );
    group.addEventListener("touchend", () => {
      setTimeout(stop, 300);
    });

  });

  // --- Animation fade-in simple ---
  const fadeElems = document.querySelectorAll(".fade-in");
  const fadeObserver = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) entry.target.classList.add("visible");
      });
    },
    { threshold: 0.1 }
  );
  fadeElems.forEach(el => fadeObserver.observe(el));

  // --- Mobile : slideshow auto selon groupe centré ---
  if (window.matchMedia("(max-width: 768px)").matches) {

    const mobileObserver = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          const group = entry.target;
          const ctrl = controls.get(group);
          if (!ctrl) return;

          const ratio = entry.intersectionRatio;

          // Démarre si groupe bien visible (80%)
          if (ratio >= 0.8) {
            controls.forEach((c, g) => {
              if (g !== group) c.stop();
            });
            ctrl.start();
          }

          // Stop uniquement si vraiment sorti du champ (< 25%)
          else if (ratio <= 0.25) {
            ctrl.stop();
          }
        });
      },
      {
        root: null,
        threshold: [0, 0.25, 0.5, 0.8, 1],
        rootMargin: "0px 0px -5% 0px"
      }
    );

    groups.forEach(g => mobileObserver.observe(g));
  }
});
