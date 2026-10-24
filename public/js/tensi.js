// ============================================================
// Halaman Tensi Darah
// Alur data:
//   ketik angka -> BloodPressureAPI.classify() -> server menghitung
//   kategori (utils/bloodPressure.js) -> hasil tampil di panel.
//   simpan      -> BloodPressureAPI.create()   -> server menghitung ulang
//   kategori sendiri, lalu menyimpannya ke MySQL.
// Browser tidak pernah menentukan kategori yang disimpan.
// ============================================================
(() => {
  'use strict';

  const $ = (id) => document.getElementById(id);
  const icon = (name) => `<svg class="icon" aria-hidden="true"><use href="#i-${name}"/></svg>`;

  // ---------- Elemen ----------
  const form = $('bp-form');
  const idInput = $('reading-id');
  const fields = {
    nama_siswa: $('nama_siswa'),
    nisn: $('nisn'),
    kelas: $('kelas'),
    sistolik: $('sistolik'),
    diastolik: $('diastolik')
  };
  const formCard = $('form-card');
  const formTitleText = $('form-title-text');
  const modeBadge = $('mode-badge');
  const submitBtn = $('submit-btn');
  const submitLabel = $('submit-label');
  const cancelBtn = $('cancel-btn');
  const formError = $('form-error');
  const nisnHint = $('nisn-hint');
  const resultPanel = $('bp-result');

  const searchInput = $('search');
  const categoryFilter = $('category-filter');
  const resultInfo = $('result-info');
  const loadingEl = $('loading');
  const listError = $('list-error');
  const listErrorText = $('list-error-text');
  const tableWrap = $('table-wrap');
  const rows = $('reading-rows');
  const emptyState = $('empty-state');
  const summaryWrap = $('summary-wrap');
  const summaryRows = $('summary-rows');
  const summaryEmpty = $('summary-empty');
  const guideGrid = $('guide-grid');

  const statTotal = $('stat-total');
  const statStudents = $('stat-students');
  const statAbnormal = $('stat-abnormal');

  const confirmDialog = $('confirm-dialog');
  const confirmText = $('confirm-text');
  const confirmYes = $('confirm-yes');
  const confirmNo = $('confirm-no');
  const toastEl = $('toast');

  // ---------- State ----------
  let readings = [];
  let summary = [];
  let categories = [];
  let editingId = null;
  let pendingDeleteId = null;
  let toastTimer = null;
  let previewTimer = null;
  let previewSeq = 0;

  // ---------- Util ----------

  function esc(value) {
    return String(value ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function formatDateHtml(value) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '-';
    const day = date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
    const time = date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    return `<span class="date-day">${esc(day)}</span><span class="date-time">${esc(time)}</span>`;
  }

  function initials(name) {
    const parts = String(name).trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return '?';
    return (parts[0][0] + (parts.length > 1 ? parts[1][0] : '')).toUpperCase();
  }

  function friendlyMessage(err) {
    if (err instanceof TypeError) {
      return 'Tidak dapat terhubung ke server. Pastikan server Node.js sedang berjalan, lalu coba lagi.';
    }
    return err.message || 'Terjadi kesalahan.';
  }

  function showToast(message, type = 'success') {
    toastEl.classList.toggle('is-error', type === 'error');
    toastEl.innerHTML = `${icon(type === 'error' ? 'alert' : 'check')}<span>${esc(message)}</span>`;
    toastEl.classList.add('is-visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove('is-visible'), 3600);
  }

  // teks = yang ditampilkan, nama = nama lengkap untuk tooltip
  const badge = (kode, teks, nama = teks) =>
    `<span class="cat-badge cat-${esc(kode)}" title="${esc(nama)}">${esc(teks)}</span>`;

  function getPengukuranKe() {
    return Number(form.querySelector('input[name="pengukuran_ke"]:checked').value);
  }

  function setPengukuranKe(number) {
    const radio = form.querySelector(`input[name="pengukuran_ke"][value="${number}"]`);
    if (radio) radio.checked = true;
  }

  // ---------- Hasil kategori langsung ----------

  function renderResultEmpty() {
    resultPanel.dataset.cat = 'empty';
    resultPanel.innerHTML = `
      <p class="bp-result-empty">${icon('activity')}<span>Isi angka sistolik dan diastolik untuk melihat kategorinya.</span></p>`;
  }

  function renderResult(data) {
    resultPanel.dataset.cat = data.kode;
    resultPanel.innerHTML = `
      <div class="bp-result-head">
        <p class="bp-result-value">${esc(data.sistolik)}/${esc(data.diastolik)} <small>mmHg</small></p>
        ${badge(data.kode, data.nama)}
      </div>
      <p class="bp-result-range">Rentang kategori: ${esc(data.rentang)}</p>
      <p class="bp-result-note"><strong>Catatan &amp; anjuran</strong>${esc(data.catatan)}</p>`;
  }

  function renderResultError(message) {
    resultPanel.dataset.cat = 'error';
    resultPanel.innerHTML = `<p class="bp-result-empty">${icon('alert')}<span>${esc(message)}</span></p>`;
  }

  // Menunggu 250 ms setelah berhenti mengetik, dan mengabaikan jawaban
  // lama jika pengguna sudah mengubah angka lagi (previewSeq).
  function updatePreview() {
    clearTimeout(previewTimer);

    const sistolik = fields.sistolik.value.trim();
    const diastolik = fields.diastolik.value.trim();

    if (sistolik.length < 2 || diastolik.length < 2) {
      previewSeq += 1;
      renderResultEmpty();
      return;
    }

    previewTimer = setTimeout(async () => {
      const seq = (previewSeq += 1);
      try {
        const result = await BloodPressureAPI.classify(sistolik, diastolik);
        if (seq === previewSeq) renderResult(result.data);
      } catch (err) {
        if (seq === previewSeq) renderResultError(friendlyMessage(err));
      }
    }, 250);
  }

  // ---------- Statistik, filter, daftar ----------

  function renderStats() {
    statTotal.textContent = readings.length;
    statStudents.textContent = summary.length;
    statAbnormal.textContent = readings.filter((r) => r.kategori !== 'normal').length;
  }

  function renderCategoryFilter() {
    const current = categoryFilter.value;
    categoryFilter.innerHTML =
      '<option value="">Semua kategori</option>' +
      categories.map((c) => `<option value="${esc(c.kode)}">${esc(c.nama)}</option>`).join('');
    categoryFilter.value = categories.some((c) => c.kode === current) ? current : '';
  }

  function getVisibleReadings() {
    const query = searchInput.value.trim().toLowerCase();
    const kategori = categoryFilter.value;

    return readings.filter((r) => {
      if (kategori && r.kategori !== kategori) return false;
      if (!query) return true;
      return [r.nama_siswa, r.nisn, r.kelas].some((v) => String(v).toLowerCase().includes(query));
    });
  }

  function showState(name) {
    loadingEl.hidden = name !== 'loading';
    listError.hidden = name !== 'error';
    if (name !== 'ready') {
      tableWrap.hidden = true;
      emptyState.hidden = true;
    }
  }

  function renderEmptyState(hasData) {
    if (hasData) {
      emptyState.innerHTML = `
        <span class="state-icon">${icon('search')}</span>
        <h3>Tidak ada hasil</h3>
        <p>Tidak ada pengukuran yang cocok dengan pencarian atau filter yang dipilih.</p>
        <button type="button" class="btn btn-outline btn-sm" data-action="clear-filters">Hapus pencarian</button>`;
    } else {
      emptyState.innerHTML = `
        <span class="state-icon">${icon('activity')}</span>
        <h3>Belum ada data tensi</h3>
        <p>Pengukuran yang Anda simpan akan muncul di sini. Mulai dengan mencatat tensi anak pertama.</p>
        <button type="button" class="btn btn-primary btn-sm" data-action="focus-form">Catat tensi pertama</button>`;
    }
  }

  function renderList() {
    const visible = getVisibleReadings();
    const filtering = Boolean(searchInput.value.trim() || categoryFilter.value);

    resultInfo.textContent = filtering
      ? `${visible.length} dari ${readings.length} pengukuran`
      : `${readings.length} pengukuran`;

    if (visible.length === 0) {
      tableWrap.hidden = true;
      renderEmptyState(readings.length > 0);
      emptyState.hidden = false;
      return;
    }

    emptyState.hidden = true;
    tableWrap.hidden = false;

    rows.innerHTML = visible
      .map((r) => {
        const name = esc(r.nama_siswa);
        return `
        <tr class="${r.id === editingId ? 'is-editing' : ''}">
          <td class="cell-patient" data-label="Anak">
            <div class="patient-cell">
              <span class="avatar" aria-hidden="true">${esc(initials(r.nama_siswa))}</span>
              <div>
                <p class="patient-name">${name}</p>
                <p class="patient-nisn">NISN ${esc(r.nisn)}</p>
              </div>
            </div>
          </td>
          <td data-label="Kelas"><span class="kelas-chip">${esc(r.kelas)}</span></td>
          <td data-label="Tensi">
            <span class="bp-value">${esc(r.sistolik)}/${esc(r.diastolik)} <span class="bp-unit">mmHg</span>
              <small>Pengukuran ke-${esc(r.pengukuran_ke)}</small></span>
          </td>
          <td data-label="Kategori">${badge(r.kategori, r.kategori_singkat, r.kategori_nama)}</td>
          <td class="date" data-label="Dicatat">${formatDateHtml(r.created_at)}</td>
          <td class="cell-actions">
            <div class="row-actions">
              <button type="button" class="icon-btn" data-action="edit" data-id="${r.id}"
                      aria-label="Ubah pengukuran ${name}" title="Ubah">${icon('edit')}</button>
              <button type="button" class="icon-btn icon-btn-danger" data-action="delete" data-id="${r.id}"
                      aria-label="Hapus pengukuran ${name}" title="Hapus">${icon('trash')}</button>
            </div>
          </td>
        </tr>`;
      })
      .join('');
  }

  // ---------- Ringkasan per anak ----------

  function summaryCell(p) {
    if (!p) return '<span class="bp-empty">-</span>';
    return `<span class="bp-value" title="${esc(p.kategori_nama)}"><span class="cat-dot cat-${esc(p.kategori)}"></span>${esc(p.sistolik)}/${esc(p.diastolik)}</span>`;
  }

  function renderSummary() {
    if (summary.length === 0) {
      summaryWrap.hidden = true;
      summaryEmpty.hidden = false;
      return;
    }

    summaryEmpty.hidden = true;
    summaryWrap.hidden = false;

    summaryRows.innerHTML = summary
      .map((s) => {
        const average = s.rata_rata
          ? `<div class="avg-cell">
               <span class="bp-value">${esc(s.rata_rata.sistolik)}/${esc(s.rata_rata.diastolik)} <span class="bp-unit">mmHg</span></span>
               ${badge(s.kategori.kode, s.kategori.nama)}
               <span class="progress-pill ${s.lengkap ? 'is-complete' : ''}">${s.jumlah} dari 3 pengukuran${s.lengkap ? '' : ' (belum lengkap)'}</span>
             </div>`
          : '<span class="bp-empty">-</span>';

        return `
        <tr>
          <td class="cell-patient" data-label="Anak">
            <div class="patient-cell">
              <span class="avatar" aria-hidden="true">${esc(initials(s.nama_siswa))}</span>
              <div>
                <p class="patient-name">${esc(s.nama_siswa)}</p>
                <p class="patient-nisn">${esc(s.kelas)} &middot; NISN ${esc(s.nisn)}</p>
              </div>
            </div>
          </td>
          <td data-label="Pengukuran 1">${summaryCell(s.pengukuran[0])}</td>
          <td data-label="Pengukuran 2">${summaryCell(s.pengukuran[1])}</td>
          <td data-label="Pengukuran 3">${summaryCell(s.pengukuran[2])}</td>
          <td data-label="Rata-rata">${average}</td>
        </tr>`;
      })
      .join('');
  }

  // ---------- Panduan kategori ----------

  function renderGuide() {
    if (categories.length === 0) {
      guideGrid.innerHTML = '<p class="list-empty">Panduan kategori belum bisa dimuat dari server.</p>';
      return;
    }

    guideGrid.innerHTML = categories
      .map(
        (c) => `
        <article class="card guide-card">
          <h3>${badge(c.kode, c.nama)}</h3>
          <p class="guide-range"><strong>Rentang:</strong> ${esc(c.rentang)}. Contoh: ${esc(c.contoh)}.</p>
          <p class="guide-note"><strong>Catatan &amp; anjuran</strong>${esc(c.catatan)}</p>
        </article>`
      )
      .join('');
  }

  function renderAll() {
    renderStats();
    renderList();
    renderSummary();
  }

  // ---------- Muat data dari API ----------

  async function loadReadings({ silent = false } = {}) {
    if (!silent) showState('loading');

    try {
      const [list, sum] = await Promise.all([BloodPressureAPI.list(), BloodPressureAPI.summary()]);
      readings = list.data;
      summary = sum.data;
      showState('ready');
      renderAll();
    } catch (err) {
      readings = [];
      summary = [];
      renderStats();
      renderSummary();
      resultInfo.textContent = '';
      listErrorText.textContent = friendlyMessage(err);
      showState('error');
    }
  }

  async function loadCategories() {
    try {
      const result = await BloodPressureAPI.categories();
      categories = result.data;
    } catch (err) {
      categories = [];
    }
    renderGuide();
    renderCategoryFilter();
  }

  // ---------- Form ----------

  function setFieldError(name, message) {
    const errorEl = $(`err-${name}`);
    errorEl.textContent = message || '';
    errorEl.hidden = !message;

    const targets = name === 'tekanan' ? [fields.sistolik, fields.diastolik] : [fields[name]];
    targets.forEach((el) => el.setAttribute('aria-invalid', message ? 'true' : 'false'));
  }

  function clearFieldErrors() {
    ['nama_siswa', 'nisn', 'kelas', 'tekanan'].forEach((name) => setFieldError(name, ''));
  }

  function showFormError(messages) {
    formError.innerHTML = '<ul>' + messages.map((m) => `<li>${esc(m)}</li>`).join('') + '</ul>';
    formError.hidden = false;
  }

  function hideFormError() {
    formError.hidden = true;
    formError.innerHTML = '';
  }

  function setSubmitting(isSubmitting) {
    submitBtn.disabled = isSubmitting;
    cancelBtn.disabled = isSubmitting;
  }

  function resetForm() {
    form.reset();
    idInput.value = '';
    editingId = null;
    formTitleText.textContent = 'Catat tensi';
    submitLabel.textContent = 'Simpan pengukuran';
    modeBadge.hidden = true;
    cancelBtn.hidden = true;
    nisnHint.hidden = true;
    clearFieldErrors();
    hideFormError();
    previewSeq += 1;
    renderResultEmpty();
    renderList();
  }

  // Setelah pengukuran ke-1 atau ke-2 disimpan: data anak dipertahankan,
  // hanya angka tensi yang dikosongkan dan pengukuran maju ke nomor berikutnya.
  function continueWithSameStudent(nextNumber, name) {
    fields.sistolik.value = '';
    fields.diastolik.value = '';
    setPengukuranKe(nextNumber);
    clearFieldErrors();
    hideFormError();
    previewSeq += 1;
    renderResultEmpty();
    nisnHint.textContent = `Lanjut mencatat pengukuran ke-${nextNumber} untuk ${name}.`;
    nisnHint.hidden = false;
    fields.sistolik.focus();
  }

  function updateNisnHint() {
    nisnHint.hidden = true;
    const nisn = fields.nisn.value;
    if (nisn.length !== 10 || editingId !== null) return;

    const student = summary.find((s) => s.nisn === nisn);
    if (!student) return;

    if (!fields.nama_siswa.value.trim()) fields.nama_siswa.value = student.nama_siswa;
    if (!fields.kelas.value.trim()) fields.kelas.value = student.kelas;

    const missing = [1, 2, 3].filter((n) => !student.pengukuran[n - 1]);
    if (missing.length > 0) {
      setPengukuranKe(missing[0]);
      nisnHint.textContent = `Sudah ada ${student.jumlah} dari 3 pengukuran. Berikutnya: pengukuran ke-${missing[0]}.`;
    } else {
      nisnHint.textContent = 'Tiga pengukuran anak ini sudah lengkap. Menyimpan lagi akan menambah data baru.';
    }
    nisnHint.hidden = false;
  }

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    hideFormError();

    const raw = {
      nama_siswa: fields.nama_siswa.value.trim(),
      nisn: fields.nisn.value.trim(),
      kelas: fields.kelas.value.trim(),
      sistolik: fields.sistolik.value.trim(),
      diastolik: fields.diastolik.value.trim()
    };

    const errors = {};
    if (!raw.nama_siswa) errors.nama_siswa = 'Nama anak wajib diisi.';
    if (!raw.nisn) errors.nisn = 'NISN wajib diisi.';
    else if (!/^\d{10}$/.test(raw.nisn)) errors.nisn = 'NISN harus 10 digit angka.';
    if (!raw.kelas) errors.kelas = 'Kelas wajib diisi.';
    if (!raw.sistolik || !raw.diastolik) errors.tekanan = 'Sistolik dan diastolik wajib diisi.';

    ['nama_siswa', 'nisn', 'kelas', 'tekanan'].forEach((name) => setFieldError(name, errors[name]));

    const firstInvalid = ['nama_siswa', 'nisn', 'kelas', 'tekanan'].find((name) => errors[name]);
    if (firstInvalid) {
      (firstInvalid === 'tekanan' ? fields.sistolik : fields[firstInvalid]).focus();
      return;
    }

    const data = {
      nama_siswa: raw.nama_siswa,
      nisn: raw.nisn,
      kelas: raw.kelas,
      pengukuran_ke: getPengukuranKe(),
      sistolik: Number(raw.sistolik),
      diastolik: Number(raw.diastolik)
    };

    const isEdit = Boolean(idInput.value);
    setSubmitting(true);

    try {
      let saved;
      if (isEdit) {
        saved = await BloodPressureAPI.update(idInput.value, data);
        showToast('Perubahan disimpan.');
      } else {
        saved = await BloodPressureAPI.create(data);
        showToast(`Pengukuran disimpan: ${saved.data.kategori_nama}.`);
      }

      if (!isEdit && data.pengukuran_ke < 3) {
        continueWithSameStudent(data.pengukuran_ke + 1, data.nama_siswa);
      } else {
        resetForm();
      }
      await loadReadings({ silent: true });
    } catch (err) {
      const details = err.details && err.details.length > 0 ? err.details : [friendlyMessage(err)];
      showFormError(details);
    } finally {
      setSubmitting(false);
    }
  });

  function startEdit(id) {
    const reading = readings.find((r) => r.id === id);
    if (!reading) return;

    editingId = id;
    idInput.value = reading.id;
    fields.nama_siswa.value = reading.nama_siswa;
    fields.nisn.value = reading.nisn;
    fields.kelas.value = reading.kelas;
    fields.sistolik.value = reading.sistolik;
    fields.diastolik.value = reading.diastolik;
    setPengukuranKe(reading.pengukuran_ke);

    formTitleText.textContent = 'Ubah pengukuran';
    submitLabel.textContent = 'Simpan perubahan';
    modeBadge.hidden = false;
    cancelBtn.hidden = false;
    nisnHint.hidden = true;
    clearFieldErrors();
    hideFormError();
    updatePreview();
    renderList();

    const isNarrow = window.matchMedia('(max-width: 1040px)').matches;
    formCard.scrollIntoView({ behavior: 'smooth', block: isNarrow ? 'start' : 'nearest' });
    fields.sistolik.focus({ preventScroll: true });
  }

  cancelBtn.addEventListener('click', resetForm);

  // ---------- Hapus ----------

  function openDeleteDialog(id) {
    const reading = readings.find((r) => r.id === id);
    if (!reading) return;

    pendingDeleteId = id;
    confirmText.innerHTML =
      `Pengukuran ke-${esc(reading.pengukuran_ke)} atas nama <strong>${esc(reading.nama_siswa)}</strong> ` +
      `(${esc(reading.sistolik)}/${esc(reading.diastolik)} mmHg) akan dihapus permanen dan tidak bisa dikembalikan.`;
    confirmDialog.showModal();
  }

  confirmNo.addEventListener('click', () => confirmDialog.close());

  confirmDialog.addEventListener('close', () => {
    pendingDeleteId = null;
  });

  confirmYes.addEventListener('click', async () => {
    if (pendingDeleteId === null) return;

    const id = pendingDeleteId;
    confirmYes.disabled = true;

    try {
      await BloodPressureAPI.remove(id);
      if (id === editingId) resetForm();
      showToast('Pengukuran dihapus.');
      await loadReadings({ silent: true });
    } catch (err) {
      showToast(friendlyMessage(err), 'error');
    } finally {
      confirmYes.disabled = false;
      confirmDialog.close();
    }
  });

  // ---------- Event lain ----------

  rows.addEventListener('click', (event) => {
    const button = event.target.closest('button[data-action]');
    if (!button) return;

    const id = Number(button.dataset.id);
    if (button.dataset.action === 'edit') startEdit(id);
    if (button.dataset.action === 'delete') openDeleteDialog(id);
  });

  emptyState.addEventListener('click', (event) => {
    const button = event.target.closest('button[data-action]');
    if (!button) return;

    if (button.dataset.action === 'clear-filters') {
      searchInput.value = '';
      categoryFilter.value = '';
      renderList();
      searchInput.focus();
    }
    if (button.dataset.action === 'focus-form') {
      formCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      fields.nama_siswa.focus({ preventScroll: true });
    }
  });

  $('retry-btn').addEventListener('click', () => {
    loadReadings();
    loadCategories();
  });

  searchInput.addEventListener('input', renderList);
  categoryFilter.addEventListener('change', renderList);

  // Hanya angka
  fields.nisn.addEventListener('input', () => {
    fields.nisn.value = fields.nisn.value.replace(/\D/g, '').slice(0, 10);
    updateNisnHint();
  });

  fields.sistolik.addEventListener('input', () => {
    fields.sistolik.value = fields.sistolik.value.replace(/\D/g, '').slice(0, 3);
    // Sistolik 3 digit (100 ke atas) sudah pasti selesai, langsung pindah ke diastolik
    if (fields.sistolik.value.length === 3 && document.activeElement === fields.sistolik) {
      fields.diastolik.focus();
    }
    updatePreview();
  });

  fields.diastolik.addEventListener('input', () => {
    fields.diastolik.value = fields.diastolik.value.replace(/\D/g, '').slice(0, 3);
    updatePreview();
  });

  // Pesan galat hilang begitu pengguna mulai memperbaikinya
  ['nama_siswa', 'nisn', 'kelas'].forEach((name) => {
    fields[name].addEventListener('input', () => {
      if (fields[name].getAttribute('aria-invalid') === 'true') setFieldError(name, '');
    });
  });
  [fields.sistolik, fields.diastolik].forEach((el) => {
    el.addEventListener('input', () => setFieldError('tekanan', ''));
  });

  // ---------- Mulai ----------

  renderResultEmpty();
  renderGuide();
  loadReadings();
  loadCategories();
})();
