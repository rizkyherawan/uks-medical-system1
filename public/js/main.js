// Perilaku bersama di semua halaman
(() => {
  'use strict';

  // ---------- Menu navigasi (layar kecil) ----------
  const toggle = document.querySelector('.nav-toggle');
  const nav = document.getElementById('site-nav');

  if (toggle && nav) {
    const setOpen = (open) => {
      nav.classList.toggle('is-open', open);
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Tutup menu' : 'Buka menu');
    };

    toggle.addEventListener('click', () => {
      setOpen(toggle.getAttribute('aria-expanded') !== 'true');
    });

    // Tutup menu setelah salah satu tautan dipilih
    nav.addEventListener('click', (event) => {
      if (event.target.closest('a')) setOpen(false);
    });

    // Tutup dengan tombol Escape
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
        setOpen(false);
        toggle.focus();
      }
    });
  }

  // ---------- Tombol kembali ke atas ----------
  const topButton = document.querySelector('.fab-top');

  if (topButton) {
    const updateVisibility = () => {
      topButton.classList.toggle('is-visible', window.scrollY > 480);
    };

    window.addEventListener('scroll', updateVisibility, { passive: true });
    topButton.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    updateVisibility();
  }

  // ---------- Tahun di footer ----------
  document.querySelectorAll('[data-year]').forEach((el) => {
    el.textContent = new Date().getFullYear();
  });
})();
