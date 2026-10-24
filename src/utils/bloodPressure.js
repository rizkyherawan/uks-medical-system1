// ============================================================
// KLASIFIKASI TEKANAN DARAH
// Satu-satunya tempat aturan kategori dan teks anjuran disimpan.
// Frontend tidak menghitung sendiri: ia bertanya ke API
// (/api/blood-pressure/classify dan /categories), jadi kalau
// aturan atau teks perlu diubah, cukup ubah file ini.
// ============================================================

const CATEGORIES = [
  {
    kode: 'hipotensi',
    nama: 'Hipotensi (Tekanan Darah Rendah)',
    singkat: 'Hipotensi',
    rentang: 'Di bawah 90/60 mmHg',
    contoh: '80/50 mmHg',
    catatan:
      'Perbanyak minum air putih, tingkatkan asupan garam secukupnya, serta hindari bangkit dari posisi duduk atau tidur secara mendadak. Jika disertai gejala pusing berputar, lemas, atau pandangan kabur, segera periksakan diri ke dokter.'
  },
  {
    kode: 'normal',
    nama: 'Normal',
    singkat: 'Normal',
    rentang: 'Di bawah 120/80 mmHg',
    contoh: '110/70 mmHg',
    catatan:
      'Ini adalah kondisi ideal. Pertahankan pola hidup sehat dengan rutin berolahraga, konsumsi makanan bergizi seimbang, dan jaga berat badan tetap ideal.'
  },
  {
    kode: 'prehipertensi',
    nama: 'Prehipertensi (Meningkat)',
    singkat: 'Prehipertensi',
    rentang: 'Sistolik 120–129 dan diastolik di bawah 80 mmHg',
    contoh: '125/75 mmHg',
    catatan:
      'Angka atas mulai naik sebagai peringatan awal. Mulailah mengurangi konsumsi garam/natrium, hindari makanan olahan, dan tingkatkan aktivitas fisik harian agar tidak berlanjut menjadi hipertensi.'
  },
  {
    kode: 'hipertensi1',
    nama: 'Hipertensi Derajat 1',
    singkat: 'Hipertensi 1',
    rentang: 'Sistolik 130–139 atau diastolik 80–89 mmHg',
    contoh: '135/85 mmHg',
    catatan:
      'Sudah tergolong darah tinggi tingkat awal. Disarankan untuk membatasi konsumsi garam maksimal 1 sendok teh per hari, mengelola stres, berhenti merokok, dan berkonsultasi dengan tenaga medis untuk evaluasi awal.'
  },
  {
    kode: 'hipertensi2',
    nama: 'Hipertensi Derajat 2',
    singkat: 'Hipertensi 2',
    rentang: '140/90 mmHg atau lebih tinggi',
    contoh: '150/95 mmHg',
    catatan:
      'Memerlukan evaluasi medis secara rutin dan penerapan pola hidup sehat secara ketat. Dokter umumnya akan meresepkan obat penurun tekanan darah untuk mencegah risiko komplikasi organ.'
  },
  {
    kode: 'krisis',
    nama: 'Krisis Hipertensi',
    singkat: 'Krisis',
    rentang: 'Di atas 180/120 mmHg',
    contoh: '190/125 mmHg',
    catatan:
      'Darurat medis! Istirahatlah sejenak dan lakukan ukur ulang dalam beberapa menit. Jika hasil tetap sama—terutama bila disertai nyeri dada, sesak napas, sakit kepala hebat, atau gangguan penglihatan—segera cari pertolongan medis ke IGD atau fasilitas kesehatan terdekat.'
  }
];

const BY_CODE = Object.fromEntries(CATEGORIES.map((c) => [c.kode, c]));

// Batas angka yang masuk akal (menolak salah ketik seperti 1200 atau 5)
const LIMITS = {
  sistolik: { min: 50, max: 300 },
  diastolik: { min: 30, max: 200 }
};

// Mengembalikan daftar pesan galat (kosong jika angka valid)
function checkValues(sistolik, diastolik) {
  const errors = [];

  if (!Number.isInteger(sistolik)) errors.push('Sistolik harus berupa angka bulat.');
  else if (sistolik < LIMITS.sistolik.min || sistolik > LIMITS.sistolik.max) {
    errors.push(`Sistolik harus antara ${LIMITS.sistolik.min} dan ${LIMITS.sistolik.max} mmHg.`);
  }

  if (!Number.isInteger(diastolik)) errors.push('Diastolik harus berupa angka bulat.');
  else if (diastolik < LIMITS.diastolik.min || diastolik > LIMITS.diastolik.max) {
    errors.push(`Diastolik harus antara ${LIMITS.diastolik.min} dan ${LIMITS.diastolik.max} mmHg.`);
  }

  if (errors.length === 0 && sistolik <= diastolik) {
    errors.push('Sistolik (angka atas) harus lebih besar dari diastolik (angka bawah).');
  }

  return errors;
}

// Kategori ditentukan oleh angka yang lebih berat (sistolik atau diastolik).
// Urutan pengecekan dari yang paling berat ke yang paling ringan.
function classifyCode(sistolik, diastolik) {
  if (sistolik > 180 || diastolik > 120) return 'krisis';
  if (sistolik >= 140 || diastolik >= 90) return 'hipertensi2';
  if (sistolik >= 130 || diastolik >= 80) return 'hipertensi1';
  if (sistolik >= 120) return 'prehipertensi'; // sistolik 120–129 dan diastolik di bawah 80
  if (sistolik < 90 || diastolik < 60) return 'hipotensi';
  return 'normal';
}

function classify(sistolik, diastolik) {
  return { sistolik, diastolik, ...BY_CODE[classifyCode(sistolik, diastolik)] };
}

function getCategory(kode) {
  return BY_CODE[kode] || null;
}

module.exports = { CATEGORIES, LIMITS, checkValues, classifyCode, classify, getCategory };
