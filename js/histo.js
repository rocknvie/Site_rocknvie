const isMobile = window.matchMedia("(max-width: 768px)").matches;

document.addEventListener("DOMContentLoaded", () => {
  const groups = document.querySelectorAll(".group");

  // --- Préchargement immédiat de la première image de chaque groupe ---
  groups.forEach(group => {
    const firstSlide = group.querySelector(".slideshow .slide");
    if (firstSlide) {
      const imgPreload = new Image();
      imgPreload.src = firstSlide.src;
      firstSlide.style.display = "block";
    }
  });

  const controls = new Map();

  groups.forEach(group => {
    const hoverText = group.querySelector(".hover-text");
    const baseImg = group.querySelector("img");
    let slideElems = Array.from(group.querySelectorAll(".slideshow .slide"));
    let intervalId = null;
    let current = 0;

    slideElems.slice(1).forEach(slide => {
      const img = new Image();
      img.src = slide.src;
      slide.style.display = "none";
    });

    function showSlide(i) {
      if (!slideElems.length) return;
      slideElems.forEach(el => el.style.display = "none");
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
        nextSlide();
        intervalId = setInterval(nextSlide, 2000);
      } else {
        intervalId = null;
      }

      group.classList.add("slideshow-running");
    }

    function stop() {
      if (intervalId) clearInterval(intervalId);
      intervalId = null;

      slideElems.forEach(el => el.style.display = "none");
      if (baseImg) baseImg.style.display = "";
      if (hoverText) hoverText.style.display = "block";

      group.classList.remove("slideshow-running");
    }

    // --- Comportement desktop uniquement ---
    if (!isMobile) {
      group.addEventListener("mouseenter", start);
      group.addEventListener("mouseleave", stop);

      group.addEventListener("touchstart", () => {
        start();
      }, { passive: true });

      group.addEventListener("touchend", () => {
        setTimeout(stop, 300);
      });
    }

    controls.set(group, { start, stop });
  });

  // --- Fade-in (inchangé) ---
  const fadeElems = document.querySelectorAll('.fade-in');
  const fadeObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) entry.target.classList.add('visible');
    });
  }, { threshold: 0.1 });

  fadeElems.forEach(el => fadeObserver.observe(el));

  // --- Nouveau comportement mobile : déclenchement quand ENTIEREMENT visible ---
if (isMobile) {
  const mobileObserver = new IntersectionObserver(() => {
    checkFullyVisibleGroups();
  }, { threshold: 1.0 });

  groups.forEach(g => mobileObserver.observe(g));

  window.addEventListener('resize', () => {
    // re-vérifier au changement d'orientation / UI mobile
    checkFullyVisibleGroups();
  });

  function checkFullyVisibleGroups() {
    const viewportHeight = window.innerHeight;
    groups.forEach(group => {
      const rect = group.getBoundingClientRect();
      // tolérance 5 px en bas (ajustable)
      const fullyVisible = rect.top >= 0 && (rect.bottom <= viewportHeight + 5);
      const ctrl = controls.get(group);
      if (!ctrl) return;
      if (fullyVisible) ctrl.start();
      else ctrl.stop();
    });
  }

  // appel initial
  checkFullyVisibleGroups();
}


});
