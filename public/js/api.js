// ============================================================
// KONEKSI FRONTEND -> BACKEND
// Semua pemanggilan ke server Node.js lewat file ini.
//
// Halaman dibuka lewat Express (http://localhost:3000)  -> pakai '/api'
// Halaman dibuka lewat Live Server / file://            -> ganti ke
//                                  'http://localhost:3000/api'
// ============================================================
const API_BASE_URL = '/api';

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options
  });

  let payload = null;
  try {
    payload = await response.json();
  } catch (_) {
    // response bukan JSON (mis. server mati di tengah jalan)
  }

  if (!response.ok) {
    const error = new Error((payload && payload.message) || 'Terjadi kesalahan pada server.');
    error.details = (payload && payload.errors) || [];
    throw error;
  }

  return payload;
}

const PatientAPI = {
  list: (search = '') =>
    request(`/patients${search ? `?search=${encodeURIComponent(search)}` : ''}`),

  get: (id) => request(`/patients/${id}`),

  create: (data) =>
    request('/patients', { method: 'POST', body: JSON.stringify(data) }),

  update: (id, data) =>
    request(`/patients/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  remove: (id) => request(`/patients/${id}`, { method: 'DELETE' })
};
