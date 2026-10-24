// ============================================================
// DATA SITUS
// Edit file ini untuk mengisi konten tanpa menyentuh HTML.
// Semua isi di bawah masih CONTOH, ganti dengan data asli PMR.
//
//  - SITE_INFO : profil, kontak, dan akun media sosial (tampil di footer)
//  - KEGIATAN  : kartu di section "Kegiatan PMR Wira"
//  - LOMBA     : baris di section "Hasil lomba"
//
// Cara menambah: salin satu blok { ... }, tempel di bawahnya, ubah isinya.
// Cara memasang foto: simpan file di folder public/img/ lalu isi
//   foto: 'img/nama-foto.jpg'   (kosongkan '' untuk memakai placeholder)
// ============================================================

const SITE_INFO = {
  nama: 'UKS PMR Wira Stemsago',

  deskripsi:
    'Tulis profil singkat PMR Wira Stemsago di sini: sejak kapan berdiri, apa saja yang dikerjakan, dan siapa yang bisa bergabung.',

  // ikon yang tersedia: pin, mail, phone, clock
  kontak: [
    { ikon: 'pin', judul: 'Alamat', nilai: 'Tulis alamat sekolah di sini' },
    { ikon: 'mail', judul: 'Email', nilai: 'Tulis alamat email PMR di sini' },
    { ikon: 'phone', judul: 'Telepon / WhatsApp', nilai: 'Tulis nomor kontak pembina di sini' },
    { ikon: 'clock', judul: 'Jam layanan UKS', nilai: 'Tulis jam buka UKS di sini' }
  ],

  // Isi "url" dengan alamat akun lengkap, contoh: 'https://www.instagram.com/nama_akun'
  // Ikon yang urlnya masih kosong tampil redup dan belum bisa diklik.
  // ikon yang tersedia: instagram, youtube, tiktok, facebook, whatsapp
  sosial: [
    { nama: 'Instagram', ikon: 'instagram', url: '' },
    { nama: 'YouTube', ikon: 'youtube', url: '' },
    { nama: 'TikTok', ikon: 'tiktok', url: '' },
    { nama: 'Facebook', ikon: 'facebook', url: '' },
    { nama: 'WhatsApp', ikon: 'whatsapp', url: '' }
  ]
};

const KEGIATAN = [
  {
    judul: 'Latihan pertolongan pertama',
    tanggal: 'Tanggal kegiatan',
    deskripsi: 'Tulis deskripsi singkat kegiatan di sini: apa yang dilakukan, kapan, dan siapa saja yang terlibat.',
    foto: ''
  },
  {
    judul: 'Pemeriksaan kesehatan siswa',
    tanggal: 'Tanggal kegiatan',
    deskripsi: 'Tulis deskripsi singkat kegiatan di sini: apa yang dilakukan, kapan, dan siapa saja yang terlibat.',
    foto: ''
  },
  {
    judul: 'Bakti sosial',
    tanggal: 'Tanggal kegiatan',
    deskripsi: 'Tulis deskripsi singkat kegiatan di sini: apa yang dilakukan, kapan, dan siapa saja yang terlibat.',
    foto: ''
  },
  {
    judul: 'Donor darah',
    tanggal: 'Tanggal kegiatan',
    deskripsi: 'Tulis deskripsi singkat kegiatan di sini: apa yang dilakukan, kapan, dan siapa saja yang terlibat.',
    foto: ''
  },
  {
    judul: 'Penyuluhan kesehatan remaja',
    tanggal: 'Tanggal kegiatan',
    deskripsi: 'Tulis deskripsi singkat kegiatan di sini: apa yang dilakukan, kapan, dan siapa saja yang terlibat.',
    foto: ''
  },
  {
    judul: 'Pelatihan anggota baru',
    tanggal: 'Tanggal kegiatan',
    deskripsi: 'Tulis deskripsi singkat kegiatan di sini: apa yang dilakukan, kapan, dan siapa saja yang terlibat.',
    foto: ''
  }
];

const LOMBA = [
  {
    nama: 'Lomba pertolongan pertama',
    keterangan: 'Tingkat dan penyelenggara lomba. Tulis deskripsi singkat tentang lomba dan tim yang berpartisipasi.',
    juara: 'Juara',
    foto: ''
  },
  {
    nama: 'Lomba tandu darurat',
    keterangan: 'Tingkat dan penyelenggara lomba. Tulis deskripsi singkat tentang lomba dan tim yang berpartisipasi.',
    juara: 'Juara',
    foto: ''
  },
  {
    nama: 'Lomba poster kesehatan',
    keterangan: 'Tingkat dan penyelenggara lomba. Tulis deskripsi singkat tentang lomba dan tim yang berpartisipasi.',
    juara: 'Juara',
    foto: ''
  },
  {
    nama: 'Lomba cerdas cermat PMR',
    keterangan: 'Tingkat dan penyelenggara lomba. Tulis deskripsi singkat tentang lomba dan tim yang berpartisipasi.',
    juara: 'Juara',
    foto: ''
  },
  {
    nama: 'Lomba yel-yel dan baris-berbaris',
    keterangan: 'Tingkat dan penyelenggara lomba. Tulis deskripsi singkat tentang lomba dan tim yang berpartisipasi.',
    juara: 'Juara',
    foto: ''
  },
  {
    nama: 'Lomba simulasi bencana',
    keterangan: 'Tingkat dan penyelenggara lomba. Tulis deskripsi singkat tentang lomba dan tim yang berpartisipasi.',
    juara: 'Juara',
    foto: ''
  }
];
