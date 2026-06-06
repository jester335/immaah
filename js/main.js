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
/* ── Product photos for sliders & search ───────────────────── */
const PRODUCT_PHOTOS = {
  'SK-1':  ['img/products/1.jpg','img/products/8.jpg'],
  'SK-2':  ['img/products/3.jpg','img/products/5.jpg'],
  'SK-3':  ['img/products/2.jpg','img/products/7.jpg'],
  'SK-4':  ['img/products/6.jpg'],
  'SK-5':  ['img/products/4.jpg','img/products/1.jpg'],
  'SK-6':  ['img/products/5.jpg','img/products/3.jpg'],
  'SK-7':  ['img/products/7.jpg','img/products/2.jpg'],
  'SK-8':  ['img/products/8.jpg','img/products/6.jpg'],
  'SK-9':  ['img/products/1.jpg','img/products/4.jpg'],
  'SK-10': ['img/products/8.jpg'],
  'SK-11': ['img/products/3.jpg','img/products/2.jpg'],
};

const PRODUCT_DATA = [
  { id:'SK-1',  name:'Скатерть тканевая с кружевом', pattern:'Вензель',   color:'Белый',             price:600 },
  { id:'SK-2',  name:'Скатерть тканевая с кружевом', pattern:'Вензель',   color:'Ваниль/Сливочный',  price:600 },
  { id:'SK-3',  name:'Скатерть тканевая с кружевом', pattern:'Вензель',   color:'Бежево-розовый',    price:600 },
  { id:'SK-4',  name:'Скатерть тканевая с кружевом', pattern:'Вензель',   color:'Капучино',          price:600 },
  { id:'SK-5',  name:'Скатерть тканевая с кружевом', pattern:'Цветочек',  color:'Белый',             price:600 },
  { id:'SK-6',  name:'Скатерть тканевая с кружевом', pattern:'Цветочек',  color:'Ваниль',            price:600 },
  { id:'SK-7',  name:'Скатерть тканевая с кружевом', pattern:'Цветочек',  color:'Бежево-розовый',    price:600 },
  { id:'SK-8',  name:'Скатерть тканевая с кружевом', pattern:'Цветочек',  color:'Капучино',          price:600 },
  { id:'SK-9',  name:'Скатерть тканевая с кружевом', pattern:'Жаккард',   color:'Белый',             price:600 },
  { id:'SK-10', name:'Скатерть тканевая с тёмным кружевом', pattern:'Жаккард', color:'Белый',        price:600 },
  { id:'SK-11', name:'Скатерть тканевая с кружевом', pattern:'Жаккард',   color:'Бежевый',           price:600 },
];

/* ── Card sliders ───────────────────────────────────────────── */
(function () {
  function initSliders() {
    document.querySelectorAll('.card').forEach(card => {
      const id = card.dataset.id || card.querySelector('.card-label')?.textContent.trim();
      if (!id) return;
      const photos = PRODUCT_PHOTOS[id];
      if (!photos || photos.length < 2) return;

      const imgWrap = card.querySelector('.card-img');
      if (!imgWrap) return;
      const label = imgWrap.querySelector('.card-label');

      const slidesEl = document.createElement('div');
      slidesEl.className = 'card-slides';
      photos.forEach((src, i) => {
        const img = document.createElement('img');
        img.src = src;
        img.loading = 'lazy';
        img.className = 'slide' + (i === 0 ? ' active' : '');
        slidesEl.appendChild(img);
      });

      const prevBtn = document.createElement('button');
      prevBtn.className = 'slide-prev'; prevBtn.type = 'button'; prevBtn.textContent = '‹';
      const nextBtn = document.createElement('button');
      nextBtn.className = 'slide-next'; nextBtn.type = 'button'; nextBtn.textContent = '›';

      const dotsWrap = document.createElement('div');
      dotsWrap.className = 'slide-dots';
      photos.forEach((_, i) => {
        const d = document.createElement('span');
        d.className = 'dot' + (i === 0 ? ' active' : '');
        dotsWrap.appendChild(d);
      });

      const existingImg = imgWrap.querySelector('img:not(.slide)');
      existingImg?.remove();
      imgWrap.prepend(slidesEl);
      imgWrap.appendChild(prevBtn);
      imgWrap.appendChild(nextBtn);
      imgWrap.appendChild(dotsWrap);
      if (label) imgWrap.appendChild(label);

      const slides = slidesEl.querySelectorAll('.slide');
      const dots   = dotsWrap.querySelectorAll('.dot');
      let cur = 0;

      function goTo(n) {
        slides[cur].classList.remove('active'); dots[cur]?.classList.remove('active');
        cur = (n + slides.length) % slides.length;
        slides[cur].classList.add('active');   dots[cur]?.classList.add('active');
      }
      prevBtn.addEventListener('click', e => { e.stopPropagation(); goTo(cur - 1); });
      nextBtn.addEventListener('click', e => { e.stopPropagation(); goTo(cur + 1); });
      dotsWrap.querySelectorAll('.dot').forEach((d, i) => {
        d.addEventListener('click', e => { e.stopPropagation(); goTo(i); });
      });

      // Touch / swipe support
      let touchStartX = 0;
      imgWrap.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
      imgWrap.addEventListener('touchend', e => {
        const diff = touchStartX - e.changedTouches[0].clientX;
        if (Math.abs(diff) > 40) goTo(diff > 0 ? cur + 1 : cur - 1);
      }, { passive: true });

      // Mouse drag support
      let dragStartX = 0, isDragging = false;
      slidesEl.addEventListener('mousedown', e => { dragStartX = e.clientX; isDragging = true; });
      slidesEl.addEventListener('mousemove', e => { if (isDragging) e.preventDefault(); });
      slidesEl.addEventListener('mouseup', e => {
        if (!isDragging) return;
        isDragging = false;
        const diff = dragStartX - e.clientX;
        if (Math.abs(diff) > 40) goTo(diff > 0 ? cur + 1 : cur - 1);
      });
      slidesEl.addEventListener('mouseleave', () => { isDragging = false; });
    });
  }
  initSliders();
})();

/* ── Search overlay ─────────────────────────────────────────── */
(function () {
  // Create search icon in all headers
  const header = document.getElementById('header');
  if (!header) return;

  const cartEl = header.querySelector('.h-cart');
  if (!cartEl) return;

  const searchBtn = document.createElement('button');
  searchBtn.className = 'h-search-btn';
  searchBtn.setAttribute('aria-label', 'Поиск');
  searchBtn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
    stroke-linecap="round" stroke-linejoin="round">
    <circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>`;
  // Wrap search + cart in one block (search left, cart right)
  const iconGroup = document.createElement('div');
  iconGroup.className = 'h-icon-group';
  cartEl.parentNode.insertBefore(iconGroup, cartEl);
  iconGroup.appendChild(searchBtn);
  iconGroup.appendChild(cartEl);

  // Create overlay
  const overlay = document.createElement('div');
  overlay.className = 'search-overlay';
  overlay.innerHTML = `
    <div class="search-box">
      <input type="text" class="search-input" placeholder="Поиск товаров..." autocomplete="off">
      <button class="search-close" type="button">✕</button>
    </div>
    <div class="search-results" style="display:none"></div>
    <p class="search-hint">Нажмите <kbd>Esc</kbd> чтобы закрыть</p>
  `;
  document.body.appendChild(overlay);

  const input   = overlay.querySelector('.search-input');
  const results = overlay.querySelector('.search-results');

  function open()  { overlay.classList.add('open'); setTimeout(() => input.focus(), 50); }
  function close() { overlay.classList.remove('open'); input.value = ''; results.style.display = 'none'; }

  searchBtn.addEventListener('click', open);
  overlay.querySelector('.search-close').addEventListener('click', close);
  overlay.addEventListener('click', e => { if (e.target === overlay) close(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });

  function search(query) {
    const q = query.toLowerCase().trim();
    if (q.length < 1) { results.style.display = 'none'; return; }

    const matched = PRODUCT_DATA.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.id.toLowerCase().includes(q) ||
      p.pattern.toLowerCase().includes(q) ||
      p.color.toLowerCase().includes(q) ||
      'скатерть жаккард полиэстер кружево'.includes(q)
    );

    results.style.display = 'block';

    if (!matched.length) {
      results.innerHTML = `<p class="search-no-results">Ничего не найдено по запросу «${query}»</p>`;
      return;
    }

    results.innerHTML = matched.map(p => `
      <a href="product.html?id=${p.id}" class="search-result-item" onclick="document.querySelector('.search-overlay').classList.remove('open')">
        <img class="sri-img" src="${(PRODUCT_PHOTOS[p.id] || ['img/products/1.jpg'])[0]}" loading="lazy">
        <div>
          <p class="sri-name">${p.name}</p>
          <p class="sri-sub">Узор: ${p.pattern} · ${p.color} · от ${p.price} ₽/шт</p>
        </div>
        <span class="sri-id">${p.id}</span>
      </a>
    `).join('');
  }

  let debounce;
  input.addEventListener('input', () => {
    clearTimeout(debounce);
    debounce = setTimeout(() => search(input.value), 120);
  });
})();

/* ── Lead Modal ─────────────────────────────────────────────── */
function openLeadModal() {
  const m = document.getElementById('lead-modal');
  if (!m) return;
  m.classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeLeadModal() {
  const m = document.getElementById('lead-modal');
  if (!m) return;
  m.classList.remove('open');
  document.body.style.overflow = '';
}
function submitLeadForm() {
  const ids = ['lf-privacy', 'lf-offer'];
  const labels = [
    'Политика защиты персональных данных и Согласие на предоставление персональных данных',
    'Договор публичной оферты'
  ];
  for (let i = 0; i < ids.length; i++) {
    if (!document.getElementById(ids[i]).checked) {
      document.getElementById(ids[i]).focus();
      alert('Необходимо подтвердить: ' + labels[i]);
      return;
    }
  }
  document.getElementById('lead-form').reset();
  closeLeadModal();
  alert('Заявка отправлена! Мы свяжемся с вами в течение рабочего дня.');
}
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeLeadModal();
});

/* ── Catalog sidebar pattern filter ───────────────────────── */
(function () {
  document.querySelectorAll('[name="pattern"]').forEach(radio => {
    radio.addEventListener('change', () => {
      const val = radio.value;
      // Sync with top filter-bar buttons
      document.querySelectorAll('.filter-btn').forEach(b => {
        b.classList.toggle('active', b.dataset.filter === val);
      });
      // Filter cards
      document.querySelectorAll('.card[data-filter]').forEach(card => {
        card.classList.toggle('hidden', val !== 'all' && card.dataset.filter !== val);
      });
    });
  });
})();
