// ============================================================
// Halaman Data Pasien
// - Data diambil sekali dari API (PatientAPI di api.js), lalu
//   pencarian dan filter kelas dilakukan di browser agar instan.
// - Tambah / ubah / hapus memanggil API, lalu data dimuat ulang.
// ============================================================
(() => {
  'use strict';

  const $ = (id) => document.getElementById(id);
  const icon = (name) => `<svg class="icon" aria-hidden="true"><use href="#i-${name}"/></svg>`;

  // ---------- Elemen ----------
  const form = $('patient-form');
  const idInput = $('patient-id');
  const fields = {
    nama_pasien: $('nama_pasien'),
    nisn: $('nisn'),
    kelas: $('kelas'),
    keluhan: $('keluhan')
  };
  const formCard = $('form-card');
  const formTitleText = $('form-title-text');
  const modeBadge = $('mode-badge');
  const submitBtn = $('submit-btn');
  const submitLabel = $('submit-label');
  const cancelBtn = $('cancel-btn');
  const formError = $('form-error');
  const keluhanCount = $('keluhan-count');

  const searchInput = $('search');
  const classFilter = $('class-filter');
  const resultInfo = $('result-info');
  const loadingEl = $('loading');
  const listError = $('list-error');
  const listErrorText = $('list-error-text');
  const tableWrap = $('table-wrap');
  const rows = $('patient-rows');
  const emptyState = $('empty-state');

  const statTotal = $('stat-total');
  const statToday = $('stat-today');
  const statClass = $('stat-class');

  const confirmDialog = $('confirm-dialog');
  const confirmName = $('confirm-name');
  const confirmYes = $('confirm-yes');
  const confirmNo = $('confirm-no');
  const toastEl = $('toast');

  // ---------- State ----------
  let allPatients = [];
  let editingId = null;
  let pendingDeleteId = null;
  let toastTimer = null;

  // ---------- Util ----------

  function escapeHtml(value) {
    return String(value ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  // Mengembalikan HTML dua baris: tanggal di atas, jam di bawah
  function formatDateHtml(value) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '-';
    const day = date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
    const time = date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    return `<span class="date-day">${escapeHtml(day)}</span><span class="date-time">${escapeHtml(time)}</span>`;
  }

  function initials(name) {
    const parts = String(name).trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return '?';
    const first = parts[0][0];
    const second = parts.length > 1 ? parts[1][0] : '';
    return (first + second).toUpperCase();
  }

  function friendlyMessage(err) {
    // fetch gagal total: server Node.js belum jalan atau port salah
    if (err instanceof TypeError) {
      return 'Tidak dapat terhubung ke server. Pastikan server Node.js sedang berjalan, lalu coba lagi.';
    }
    return err.message || 'Terjadi kesalahan.';
  }

  function showToast(message, type = 'success') {
    toastEl.classList.toggle('is-error', type === 'error');
    toastEl.innerHTML = `${icon(type === 'error' ? 'alert' : 'check')}<span>${escapeHtml(message)}</span>`;
    toastEl.classList.add('is-visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove('is-visible'), 3200);
  }

  // ---------- Ringkasan & filter ----------

  function renderStats() {
    statTotal.textContent = allPatients.length;

    const today = new Date().toDateString();
    statToday.textContent = allPatients.filter(
      (p) => new Date(p.created_at).toDateString() === today
    ).length;

    if (allPatients.length === 0) {
      statClass.textContent = '-';
      return;
    }

    const counts = new Map();
    allPatients.forEach((p) => counts.set(p.kelas, (counts.get(p.kelas) || 0) + 1));
    let topClass = '';
    let topCount = 0;
    counts.forEach((count, kelas) => {
      if (count > topCount) {
        topClass = kelas;
        topCount = count;
      }
    });
    statClass.textContent = topClass;
  }

  function renderClassFilter() {
    const current = classFilter.value;
    const classes = [...new Set(allPatients.map((p) => p.kelas))].sort((a, b) =>
      a.localeCompare(b, 'id', { numeric: true })
    );

    classFilter.innerHTML =
      '<option value="">Semua kelas</option>' +
      classes.map((k) => `<option value="${escapeHtml(k)}">${escapeHtml(k)}</option>`).join('');

    classFilter.value = classes.includes(current) ? current : '';
  }

  function getVisiblePatients() {
    const query = searchInput.value.trim().toLowerCase();
    const kelas = classFilter.value;

    return allPatients.filter((p) => {
      if (kelas && p.kelas !== kelas) return false;
      if (!query) return true;
      return [p.nama_pasien, p.nisn, p.kelas, p.keluhan].some((value) =>
        String(value).toLowerCase().includes(query)
      );
    });
  }

  // ---------- Tampilan daftar ----------

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
        <p>Tidak ada catatan yang cocok dengan pencarian atau filter yang dipilih.</p>
        <button type="button" class="btn btn-outline btn-sm" data-action="clear-filters">Hapus pencarian</button>`;
    } else {
      emptyState.innerHTML = `
        <span class="state-icon">${icon('clipboard')}</span>
        <h3>Belum ada catatan pasien</h3>
        <p>Catatan yang Anda simpan akan muncul di sini. Mulai dengan menambahkan catatan pertama.</p>
        <button type="button" class="btn btn-primary btn-sm" data-action="focus-form">Tambah catatan pertama</button>`;
    }
  }

  function renderList() {
    const visible = getVisiblePatients();
    const filtering = Boolean(searchInput.value.trim() || classFilter.value);

    resultInfo.textContent = filtering
      ? `${visible.length} dari ${allPatients.length} catatan`
      : `${allPatients.length} catatan`;

    if (visible.length === 0) {
      tableWrap.hidden = true;
      renderEmptyState(allPatients.length > 0);
      emptyState.hidden = false;
      return;
    }

    emptyState.hidden = true;
    tableWrap.hidden = false;

    rows.innerHTML = visible
      .map((p) => {
        const name = escapeHtml(p.nama_pasien);
        return `
        <tr class="${p.id === editingId ? 'is-editing' : ''}">
          <td class="cell-patient" data-label="Pasien">
            <div class="patient-cell">
              <span class="avatar" aria-hidden="true">${escapeHtml(initials(p.nama_pasien))}</span>
              <div>
                <p class="patient-name">${name}</p>
                <p class="patient-nisn">NISN ${escapeHtml(p.nisn)}</p>
              </div>
            </div>
          </td>
          <td data-label="Kelas"><span class="kelas-chip">${escapeHtml(p.kelas)}</span></td>
          <td class="complaint" data-label="Sakit / keluhan">${escapeHtml(p.keluhan)}</td>
          <td class="date" data-label="Dicatat">${formatDateHtml(p.created_at)}</td>
          <td class="cell-actions">
            <div class="row-actions">
              <button type="button" class="icon-btn" data-action="edit" data-id="${p.id}"
                      aria-label="Ubah catatan ${name}" title="Ubah">${icon('edit')}</button>
              <button type="button" class="icon-btn icon-btn-danger" data-action="delete" data-id="${p.id}"
                      aria-label="Hapus catatan ${name}" title="Hapus">${icon('trash')}</button>
            </div>
          </td>
        </tr>`;
      })
      .join('');
  }

  function renderAll() {
    renderStats();
    renderClassFilter();
    renderList();
  }

  // ---------- Read ----------

  async function loadPatients({ silent = false } = {}) {
    if (!silent) showState('loading');

    try {
      const result = await PatientAPI.list();
      allPatients = result.data;
      showState('ready');
      renderAll();
    } catch (err) {
      allPatients = [];
      renderStats();
      resultInfo.textContent = '';
      listErrorText.textContent = friendlyMessage(err);
      showState('error');
    }
  }

  // ---------- Form: validasi & tampilan ----------

  function validate(data) {
    const errors = {};

    if (!data.nama_pasien) errors.nama_pasien = 'Nama pasien wajib diisi.';
    else if (data.nama_pasien.length > 100) errors.nama_pasien = 'Nama pasien maksimal 100 karakter.';

    if (!data.nisn) errors.nisn = 'NISN wajib diisi.';
    else if (!/^\d{10}$/.test(data.nisn)) errors.nisn = 'NISN harus 10 digit angka.';

    if (!data.kelas) errors.kelas = 'Kelas wajib diisi.';
    else if (data.kelas.length > 20) errors.kelas = 'Kelas maksimal 20 karakter.';

    if (!data.keluhan) errors.keluhan = 'Sakit/keluhan wajib diisi.';

    return errors;
  }

  function setFieldError(name, message) {
    const errorEl = $(`err-${name}`);
    fields[name].setAttribute('aria-invalid', message ? 'true' : 'false');
    errorEl.textContent = message || '';
    errorEl.hidden = !message;
  }

  function clearFieldErrors() {
    Object.keys(fields).forEach((name) => setFieldError(name, ''));
  }

  function showFormError(messages) {
    formError.innerHTML =
      '<ul>' + messages.map((m) => `<li>${escapeHtml(m)}</li>`).join('') + '</ul>';
    formError.hidden = false;
  }

  function hideFormError() {
    formError.hidden = true;
    formError.innerHTML = '';
  }

  function updateCounter() {
    keluhanCount.textContent = `${fields.keluhan.value.length}/1000`;
  }

  function setSubmitting(isSubmitting) {
    submitBtn.disabled = isSubmitting;
    cancelBtn.disabled = isSubmitting;
  }

  function resetForm() {
    form.reset();
    idInput.value = '';
    editingId = null;
    formTitleText.textContent = 'Tambah catatan';
    submitLabel.textContent = 'Simpan catatan';
    modeBadge.hidden = true;
    cancelBtn.hidden = true;
    clearFieldErrors();
    hideFormError();
    updateCounter();
    renderList();
  }

  // ---------- Create & Update ----------

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    hideFormError();

    const data = {
      nama_pasien: fields.nama_pasien.value.trim(),
      nisn: fields.nisn.value.trim(),
      kelas: fields.kelas.value.trim(),
      keluhan: fields.keluhan.value.trim()
    };

    const errors = validate(data);
    Object.keys(fields).forEach((name) => setFieldError(name, errors[name]));

    const firstInvalid = Object.keys(fields).find((name) => errors[name]);
    if (firstInvalid) {
      fields[firstInvalid].focus();
      return;
    }

    const isEdit = Boolean(idInput.value);
    setSubmitting(true);

    try {
      if (isEdit) {
        await PatientAPI.update(idInput.value, data);
        showToast('Perubahan disimpan.');
      } else {
        await PatientAPI.create(data);
        showToast('Catatan disimpan.');
      }
      resetForm();
      await loadPatients({ silent: true });
    } catch (err) {
      const details = err.details && err.details.length > 0 ? err.details : [friendlyMessage(err)];
      showFormError(details);
    } finally {
      setSubmitting(false);
    }
  });

  function startEdit(id) {
    const patient = allPatients.find((p) => p.id === id);
    if (!patient) return;

    editingId = id;
    idInput.value = patient.id;
    fields.nama_pasien.value = patient.nama_pasien;
    fields.nisn.value = patient.nisn;
    fields.kelas.value = patient.kelas;
    fields.keluhan.value = patient.keluhan;

    formTitleText.textContent = 'Ubah catatan';
    submitLabel.textContent = 'Simpan perubahan';
    modeBadge.hidden = false;
    cancelBtn.hidden = false;
    clearFieldErrors();
    hideFormError();
    updateCounter();
    renderList();

    const isNarrow = window.matchMedia('(max-width: 1040px)').matches;
    formCard.scrollIntoView({ behavior: 'smooth', block: isNarrow ? 'start' : 'nearest' });
    fields.nama_pasien.focus({ preventScroll: true });
  }

  cancelBtn.addEventListener('click', resetForm);

  // ---------- Delete ----------

  function openDeleteDialog(id) {
    const patient = allPatients.find((p) => p.id === id);
    if (!patient) return;

    pendingDeleteId = id;
    confirmName.textContent = patient.nama_pasien;
    confirmDialog.showModal();
  }

  confirmNo.addEventListener('click', () => confirmDialog.close());

  // Menutup dialog (tombol Batal, Escape, atau setelah hapus) selalu mengosongkan target
  confirmDialog.addEventListener('close', () => {
    pendingDeleteId = null;
  });

  confirmYes.addEventListener('click', async () => {
    if (pendingDeleteId === null) return;

    const id = pendingDeleteId;
    confirmYes.disabled = true;

    try {
      await PatientAPI.remove(id);
      if (id === editingId) resetForm();
      showToast('Catatan dihapus.');
      await loadPatients({ silent: true });
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
      classFilter.value = '';
      renderList();
      searchInput.focus();
    }
    if (button.dataset.action === 'focus-form') {
      formCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      fields.nama_pasien.focus({ preventScroll: true });
    }
  });

  $('retry-btn').addEventListener('click', () => loadPatients());

  searchInput.addEventListener('input', renderList);
  classFilter.addEventListener('change', renderList);

  // Pilihan cepat keluhan: tambahkan ke isi kolom tanpa menimpa tulisan yang sudah ada
  document.querySelector('.chips').addEventListener('click', (event) => {
    const chip = event.target.closest('.chip');
    if (!chip) return;

    const text = chip.dataset.text;
    const current = fields.keluhan.value.trim();

    if (current.toLowerCase().includes(text.toLowerCase())) {
      fields.keluhan.focus();
      return;
    }

    const next = current ? `${current}, ${text.toLowerCase()}` : text;
    fields.keluhan.value = next.slice(0, 1000);
    setFieldError('keluhan', '');
    updateCounter();
    fields.keluhan.focus();
  });

  // NISN hanya boleh angka, maksimal 10 digit
  fields.nisn.addEventListener('input', () => {
    fields.nisn.value = fields.nisn.value.replace(/\D/g, '').slice(0, 10);
  });

  // Pesan galat sebuah kolom hilang begitu pengguna mulai memperbaikinya
  Object.keys(fields).forEach((name) => {
    fields[name].addEventListener('input', () => {
      if (fields[name].getAttribute('aria-invalid') === 'true') setFieldError(name, '');
    });
  });

  fields.keluhan.addEventListener('input', updateCounter);

  // ---------- Mulai ----------

  $('today-date').textContent = new Date().toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  updateCounter();
  loadPatients();
})();
