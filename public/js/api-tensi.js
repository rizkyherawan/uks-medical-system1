// ============================================================
// KONEKSI FRONTEND -> BACKEND untuk fitur tensi darah.
// Memakai fungsi request() dan API_BASE_URL dari api.js,
// jadi api.js harus dimuat LEBIH DULU di tensi.html.
// ============================================================
const BloodPressureAPI = {
  // Daftar 6 kategori beserta rentang dan catatan/anjuran
  categories: () => request('/blood-pressure/categories'),

  // Tentukan kategori dari angka, tanpa menyimpan apa pun
  classify: (sistolik, diastolik) =>
    request(
      `/blood-pressure/classify?sistolik=${encodeURIComponent(sistolik)}&diastolik=${encodeURIComponent(diastolik)}`
    ),

  list: () => request('/blood-pressure'),

  // Ringkasan per siswa: 3 pengukuran + rata-rata + kategori rata-rata
  summary: () => request('/blood-pressure/summary'),

  create: (data) =>
    request('/blood-pressure', { method: 'POST', body: JSON.stringify(data) }),

  update: (id, data) =>
    request(`/blood-pressure/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  remove: (id) => request(`/blood-pressure/${id}`, { method: 'DELETE' })
};
