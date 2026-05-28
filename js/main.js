/* ============================================================
   IMMAAH — main.js
   ============================================================ */

/* ── Header: hide on scroll-down, show on scroll-up ───────── */
(function () {
  const header = document.getElementById('header');
  let lastY = 0;
  let ticking = false;

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        const y = window.scrollY;

        header.classList.toggle('scrolled', y > 50);

        if (y > lastY && y > 100) {
          header.classList.add('hide');
        } else {
          header.classList.remove('hide');
        }

        lastY = y;
        ticking = false;
      });
      ticking = true;
    }
  });
})();

/* ── Scroll-reveal (Intersection Observer) ─────────────────── */
(function () {
  const els = document.querySelectorAll('.fade');
  if (!els.length) return;

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add('visible');
          io.unobserve(e.target);
        }
      });
    },
    { threshold: 0.12 }
  );

  els.forEach((el) => io.observe(el));
})();

/* ── Smooth anchor scroll ───────────────────────────────────── */
document.querySelectorAll('a[href^="#"]').forEach((a) => {
  a.addEventListener('click', (e) => {
    const target = document.querySelector(a.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    const headerH = document.getElementById('header').offsetHeight;
    const top = target.getBoundingClientRect().top + window.scrollY - headerH - 12;
    window.scrollTo({ top, behavior: 'smooth' });
  });
});

/* ── Ticker: duplicate content for seamless loop ────────────── */
(function () {
  const track = document.querySelector('.ticker-track');
  if (!track) return;
  track.innerHTML += track.innerHTML;
})();