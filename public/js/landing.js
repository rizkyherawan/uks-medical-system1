// ============================================================
// LANDING PAGE: menampilkan KEGIATAN dan LOMBA dari site-data.js
// Jumlah item tidak dibatasi; halaman memanjang ke bawah sesuai isi.
// ============================================================
(() => {
  'use strict';

  const esc = (value) =>
    String(value ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');

  const icon = (name) => `<svg class="icon" aria-hidden="true"><use href="#i-${name}"/></svg>`;

  // Foto asli jika ada, kalau tidak pakai placeholder
  function media(foto, alt, placeholderLabel) {
    if (foto) {
      return `<img src="${esc(foto)}" alt="${esc(alt)}" loading="lazy">`;
    }
    return `<div class="ph" role="img" aria-label="Tempat foto">${icon('image')}${esc(placeholderLabel)}</div>`;
  }

  function emptyMessage(text) {
    return `<p class="list-empty">${esc(text)}</p>`;
  }

  // ---------- Kegiatan ----------
  const kegiatanGrid = document.getElementById('kegiatan-grid');

  if (kegiatanGrid) {
    const items = typeof KEGIATAN === 'undefined' ? [] : KEGIATAN;

    kegiatanGrid.innerHTML = items.length
      ? items
          .map(
            (item) => `
        <article class="card activity">
          <div class="media">${media(item.foto, item.judul, 'Foto kegiatan')}</div>
          <div class="activity-body">
            <span class="date-chip">${icon('calendar')}${esc(item.tanggal)}</span>
            <h3>${esc(item.judul)}</h3>
            <p>${esc(item.deskripsi)}</p>
          </div>
        </article>`
          )
          .join('')
      : emptyMessage('Belum ada kegiatan yang ditampilkan.');
  }

  // ---------- Hasil lomba ----------
  const lombaList = document.getElementById('lomba-list');

  if (lombaList) {
    const items = typeof LOMBA === 'undefined' ? [] : LOMBA;

    lombaList.innerHTML = items.length
      ? items
          .map(
            (item) => `
        <li class="result">
          <div class="media">${media(item.foto, item.nama, '')}</div>
          <div>
            <h3>${esc(item.nama)}</h3>
            <p>${esc(item.keterangan)}</p>
          </div>
          <span class="rank-pill">${icon('trophy')}${esc(item.juara)}</span>
        </li>`
          )
          .join('')
      : emptyMessage('Belum ada hasil lomba yang ditampilkan.');
  }
})();
