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

/* ── Scroll to top button ───────────────────────────────────── */
(function () {
  const btn = document.createElement('button');
  btn.className = 'scroll-top';
  btn.setAttribute('aria-label', 'Наверх');
  btn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"
    stroke-linecap="round" stroke-linejoin="round">
    <polyline points="18 15 12 9 6 15"/>
  </svg>`;
  document.body.appendChild(btn);

  window.addEventListener('scroll', () => {
    btn.classList.toggle('visible', window.scrollY > 400);
  }, { passive: true });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
})();

/* ── Gold particles (global) ────────────────────────────────── */
(function () {
  const colors = [
    'rgba(210,159,38,.75)',
    'rgba(226,184,84,.6)',
    'rgba(235,202,131,.5)',
    'rgba(194,151,59,.65)',
  ];
  const count = 20;
  for (let i = 0; i < count; i++) {
    const el = document.createElement('div');
    el.className = 'particle';
    const size = 1.5 + Math.random() * 3;
    el.style.cssText = [
      `left:${Math.random() * 100}%`,
      `bottom:${Math.random() * 15}px`,
      `width:${size}px`,
      `height:${size}px`,
      `background:${colors[Math.floor(Math.random() * colors.length)]}`,
      `--tx:${((Math.random() - .5) * 140).toFixed(1)}px`,
      `animation-duration:${(7 + Math.random() * 13).toFixed(1)}s`,
      `animation-delay:${(Math.random() * 12).toFixed(1)}s`,
    ].join(';');
    document.body.appendChild(el);
  }
})();

/* ── Cart logic ─────────────────────────────────────────────── */
const CART_KEY = 'immaah_cart';

function getCart() {
  try { return JSON.parse(localStorage.getItem(CART_KEY)) || []; }
  catch { return []; }
}

function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

function cartCount() {
  return getCart().reduce((s, i) => s + i.qty, 0);
}

function updateCartBadge() {
  const badge = document.querySelector('.h-cart-badge');
  if (!badge) return;
  const n = cartCount();
  badge.textContent = n;
  badge.classList.toggle('show', n > 0);
}

function triggerCartAnimation(btnEl) {
  const cartEl = document.querySelector('.h-cart');
  const badge  = document.querySelector('.h-cart-badge');
  if (!cartEl) return;

  // Flying dot
  const dot = document.createElement('span');
  dot.className = 'cart-fly-dot';
  document.body.appendChild(dot);

  const srcRect  = btnEl.getBoundingClientRect();
  const destRect = cartEl.getBoundingClientRect();
  const startX = srcRect.left + srcRect.width / 2;
  const startY = srcRect.top  + srcRect.height / 2;
  const endX   = destRect.left + destRect.width / 2;
  const endY   = destRect.top  + destRect.height / 2;

  dot.style.left = startX + 'px';
  dot.style.top  = startY + 'px';

  const anim = dot.animate([
    { transform: 'translate(-50%,-50%) scale(1)', opacity: 1 },
    { transform: `translate(calc(${endX - startX}px - 50%), calc(${endY - startY}px - 50%)) scale(.25)`, opacity: .6 }
  ], { duration: 550, easing: 'cubic-bezier(.4,0,.2,1)' });

  anim.onfinish = () => {
    dot.remove();
    cartEl.classList.remove('bounce');
    void cartEl.offsetWidth; // reflow
    cartEl.classList.add('bounce');
    if (badge) {
      badge.classList.remove('pop');
      void badge.offsetWidth;
      badge.classList.add('pop');
    }
    cartEl.addEventListener('animationend', () => cartEl.classList.remove('bounce'), { once: true });
  };
}

function addToCart(id, name, price, img) {
  const cart = getCart();
  const existing = cart.find(i => i.id === id);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ id, name, price, img, qty: 1 });
  }
  saveCart(cart);
  updateCartBadge();
}

// Wire up buy buttons
document.addEventListener('click', (e) => {
  const btn = e.target.closest('.btn-buy');
  if (!btn) return;
  const card = btn.closest('.card');
  if (!card) return;
  const id    = card.dataset.id   || btn.dataset.id || 'sku';
  const name  = card.querySelector('.card-name')?.textContent || 'Товар';
  const price = parseInt(card.querySelector('.card-price strong')?.textContent) || 0;
  const img   = card.querySelector('.card-img img')?.src || '';
  addToCart(id, name, price, img);
  triggerCartAnimation(btn);
});

// Init badge on page load
document.addEventListener('DOMContentLoaded', updateCartBadge);

/* ── Count-up animation ─────────────────────────────────────── */
(function () {
  const els = document.querySelectorAll('[data-count]');
  if (!els.length) return;

  function countUp(el) {
    const target = +el.dataset.count;
    const suffix = el.dataset.suffix || '';
    const prefix = el.dataset.prefix || '';
    const duration = 1800;
    const steps = 60;
    const increment = target / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        current = target;
        clearInterval(timer);
      }
      el.textContent = prefix + Math.round(current) + suffix;
    }, duration / steps);
  }

  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        countUp(e.target);
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.5 });

  els.forEach((el) => io.observe(el));
})();

/* ── FAQ Accordion ──────────────────────────────────────────── */
(function () {
  document.querySelectorAll('.faq-q').forEach((q) => {
    q.addEventListener('click', () => {
      const item = q.closest('.faq-item');
      const wasOpen = item.classList.contains('open');
      document.querySelectorAll('.faq-item.open').forEach((i) => i.classList.remove('open'));
      if (!wasOpen) item.classList.add('open');
    });
  });
})();

/* ── Catalog filter tabs ────────────────────────────────────── */
(function () {
  const btns = document.querySelectorAll('.filter-btn');
  if (!btns.length) return;

  btns.forEach((btn) => {
    btn.addEventListener('click', () => {
      btns.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      const filter = btn.dataset.filter;

      document.querySelectorAll('.card[data-filter]').forEach((card) => {
        const match = filter === 'all' || card.dataset.filter === filter;
        card.classList.toggle('hidden', !match);
      });
    });
  });
})();