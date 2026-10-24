// ============================================================
// FOOTER BERSAMA
// Dipakai semua halaman lewat: <footer class="site-footer" data-site-footer></footer>
// Isinya diambil dari SITE_INFO di site-data.js (muat file itu lebih dulu).
// ============================================================
(() => {
  'use strict';

  const footer = document.querySelector('[data-site-footer]');
  if (!footer || typeof SITE_INFO === 'undefined') return;

  const esc = (value) =>
    String(value ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');

  // Hanya alamat http/https yang dianggap valid untuk tautan akun
  const isUrl = (value) => /^https?:\/\//i.test(String(value || '').trim());

  // Kumpulan ikon footer (disisipkan sekali ke halaman)
  const sprite = `
    <svg width="0" height="0" style="position:absolute" aria-hidden="true" focusable="false">
      <symbol id="f-pin" viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></symbol>
      <symbol id="f-mail" viewBox="0 0 24 24"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-10 6L2 7"/></symbol>
      <symbol id="f-phone" viewBox="0 0 24 24"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></symbol>
      <symbol id="f-clock" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></symbol>
      <symbol id="f-instagram" viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="20" rx="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><path d="M17.5 6.5h.01"/></symbol>
      <symbol id="f-youtube" viewBox="0 0 24 24"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"/><path d="m9.75 15.02 5.75-3.27-5.75-3.27z"/></symbol>
      <symbol id="f-tiktok" viewBox="0 0 24 24"><path d="M16 3v10.5a4.5 4.5 0 1 1-4.5-4.5"/><path d="M16 3c.3 2.4 1.9 4.1 4.5 4.3"/></symbol>
      <symbol id="f-facebook" viewBox="0 0 24 24"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></symbol>
      <symbol id="f-whatsapp" viewBox="0 0 24 24"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></symbol>
    </svg>`;

  const icon = (name) => `<svg class="icon" aria-hidden="true"><use href="#f-${esc(name)}"/></svg>`;

  const links = [
    ['Beranda', 'index.html'],
    ['Layanan', 'index.html#layanan'],
    ['Kegiatan', 'index.html#kegiatan'],
    ['Hasil lomba', 'index.html#lomba'],
    ['Data pasien', 'patients.html'],
    ['Tensi darah', 'tensi.html']
  ];

  const contactHtml = (SITE_INFO.kontak || [])
    .map(
      (item) => `
        <li>
          ${icon(item.ikon)}
          <span><small>${esc(item.judul)}</small>${esc(item.nilai)}</span>
        </li>`
    )
    .join('');

  const socialHtml = (SITE_INFO.sosial || [])
    .map((item) => {
      const name = esc(item.nama);
      if (isUrl(item.url)) {
        return `
        <li>
          <a class="social-link" href="${esc(item.url)}" target="_blank" rel="noopener noreferrer"
             aria-label="${name} PMR Wira Stemsago" title="${name}">${icon(item.ikon)}</a>
        </li>`;
      }
      return `
        <li>
          <span class="social-link is-empty" role="img" aria-label="${name}, akun belum diisi"
                title="${name}: akun belum diisi">${icon(item.ikon)}</span>
        </li>`;
    })
    .join('');

  footer.innerHTML = `
    ${sprite}
    <div class="container footer-grid">
      <div class="footer-about">
        <div class="footer-brand">
          <span class="brand-logo"><img src="img/logo-pmi-mark.png" alt="" width="40" height="39"></span>
          <strong>${esc(SITE_INFO.nama)}</strong>
        </div>
        <p>${esc(SITE_INFO.deskripsi)}</p>
      </div>

      <nav class="footer-col" aria-label="Tautan cepat">
        <h3>Tautan Cepat</h3>
        <ul class="footer-links">
          ${links.map(([label, href]) => `<li><a href="${href}">${label}</a></li>`).join('')}
        </ul>
      </nav>

      <div class="footer-col">
        <h3>Informasi</h3>
        <ul class="footer-contact">${contactHtml}</ul>
      </div>

      <div class="footer-col">
        <h3>Media Sosial</h3>
        <ul class="social-list">${socialHtml}</ul>
        <p class="social-note">Ikuti kegiatan dan prestasi PMR Wira Stemsago.</p>
      </div>
    </div>

    <div class="container footer-bottom">
      <p>&copy; ${new Date().getFullYear()} ${esc(SITE_INFO.nama)}. Prototipe versi beta untuk uji coba lokal.</p>
      <p>Logo Palang Merah Indonesia digunakan sebagai identitas PMR.</p>
    </div>`;
})();
