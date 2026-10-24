# UKS PMR Wira Stemsago: Sistem Rekam Medis (Beta)

Prototipe "Implementasi Sistem Rekam Medis UKS Berbasis Web". Menggantikan pencatatan pasien UKS di buku menjadi sistem digital untuk PMR Wira Stemsago, dilengkapi pencatatan tensi darah dengan penentuan kategori otomatis.

**Teknologi:** HTML5, CSS3, dan JavaScript murni (frontend) · Node.js dengan Express (REST API, pola MVC) · MySQL (database)

Dokumen ini ditulis untuk Anda yang mengetik atau menyalin file satu per satu dan ingin memahami bagaimana frontend, backend, dan database saling terhubung. Baca berurutan dari bagian 1 kalau baru mulai. Kalau sudah paham dan hanya butuh langkah menjalankan, lompat ke bagian 6.

## Daftar isi

1. [Gambaran besar](#1-gambaran-besar)
2. [Menyiapkan komputer](#2-menyiapkan-komputer)
3. [Menulis file proyek](#3-menulis-file-proyek)
4. [Menyiapkan database](#4-menyiapkan-database)
5. [Mengatur koneksi dengan file env](#5-mengatur-koneksi-dengan-file-env)
6. [Menjalankan sistem](#6-menjalankan-sistem)
7. [Cara kerja integrasi](#7-cara-kerja-integrasi)
8. [Fungsi setiap file](#8-fungsi-setiap-file)
9. [Referensi API](#9-referensi-api)
10. [Fitur tensi darah](#10-fitur-tensi-darah)
11. [Mengisi konten situs](#11-mengisi-konten-situs)
12. [Menambah fitur baru](#12-menambah-fitur-baru)
13. [Masalah umum](#13-masalah-umum)
14. [Pengembangan lanjutan](#14-pengembangan-lanjutan)
15. [Catatan data](#15-catatan-data)

---

## 1. Gambaran besar

Sistem ini terdiri dari tiga bagian yang berjalan bersama di komputer Anda:

| Bagian | Isinya | Berjalan di mana |
| ------ | ------ | ---------------- |
| **Frontend** | Halaman web (HTML, CSS, JavaScript) di folder `public/` | Di browser |
| **Backend** | Program Node.js + Express di folder `src/` | Di terminal, sebagai server |
| **Database** | MySQL dengan database `uks_pmr_wira` | Di MySQL (XAMPP, Laragon, atau MySQL Server) |

Alur data selalu sama, dari browser sampai database dan kembali lagi:

```
BROWSER                         SERVER (Node.js + Express)                      DATABASE
public/*.html + js/*.js                                                          MySQL
        |                                                                          |
        |  1. fetch('/api/patients')                                               |
        +-----------------------> src/app.js                                      |
        |                          -> routes -> validator -> controller            |
        |                                          -> model ------ SQL ----------->|
        |                                                       <--- hasil --------+
        |  2. jawaban JSON  <-----------------------+
        v
   tabel di layar diperbarui
```

Ada tiga sambungan yang perlu Anda pahami. Masing-masing dipegang oleh file tertentu:

| Sambungan | File penghubungnya | Apa yang dilakukan |
| --------- | ------------------ | ------------------ |
| **A. Backend ke database** | `src/config/db.js` + `.env` | Membuka sambungan ke MySQL memakai alamat, user, dan password dari `.env` |
| **B. Backend ke frontend** | `src/app.js` | Menyajikan folder `public/` sebagai halaman web dan membuka pintu `/api` untuk data |
| **C. Frontend ke backend** | `public/js/api.js` dan `public/js/api-tensi.js` | Mengirim permintaan `fetch()` ke `/api/...` dan menerima JSON |

Penjelasan rinci ketiganya ada di [bagian 7](#7-cara-kerja-integrasi).

---

## 2. Menyiapkan komputer

Ada tiga hal yang perlu terpasang: Node.js, MySQL, dan editor kode. Panduan ini memakai Windows sebagai contoh. Di macOS atau Linux langkahnya sama, hanya cara memasang MySQL dan sebagian perintah terminal yang berbeda.

### 2.1 Node.js

1. Buka https://nodejs.org lalu unduh versi **LTS**.
2. Jalankan installer dan ikuti langkahnya sampai selesai (pilihan bawaan sudah cukup).
3. **Tutup semua jendela terminal yang sedang terbuka lalu buka lagi.** Tanpa ini, komputer belum mengenali perintah baru.
4. Cek dengan mengetik perintah ini di terminal:

```
node -v
npm -v
```

Keduanya harus menampilkan nomor versi. Proyek ini membutuhkan Node.js **versi 18 atau lebih baru**. Kalau `node -v` menampilkan angka di bawah 18, pasang ulang dari versi LTS.

### 2.2 MySQL

Pilih salah satu. Untuk pemula, **XAMPP** paling mudah karena sudah membawa phpMyAdmin (alat untuk melihat dan mengisi database lewat browser).

**Opsi A: XAMPP (disarankan)**

1. Unduh dari https://www.apachefriends.org lalu pasang.
2. Buka **XAMPP Control Panel**.
3. Klik **Start** pada **Apache** dan **MySQL**. Keduanya harus berubah menjadi hijau. Apache dibutuhkan agar phpMyAdmin bisa dibuka, sedangkan proyek ini sendiri hanya membutuhkan MySQL.
4. Buka http://localhost/phpmyadmin. Kalau halamannya terbuka, MySQL siap dipakai.

XAMPP memakai user `root` dengan password **kosong**.

**Opsi B: Laragon**

Pasang Laragon, lalu klik **Start All**. Laragon juga memakai user `root` dengan password kosong. Untuk mengisi database, pakai HeidiSQL yang ikut terpasang (menu *File*, lalu *Run SQL file*), atau terminal bawaan Laragon.

**Opsi C: MySQL Server resmi**

Pasang MySQL Server dari https://dev.mysql.com/downloads/. Saat pemasangan Anda diminta membuat password untuk user `root`. Catat password itu, karena nanti dimasukkan ke file `.env`.

### 2.3 Editor kode

Disarankan **Visual Studio Code** (https://code.visualstudio.com). Alasan utamanya: ia tidak menambahkan ekstensi `.txt` diam-diam ke nama file, dan ia punya terminal bawaan.

### 2.4 Memilih terminal (penting di Windows)

Di VS Code, buka terminal lewat menu **Terminal, lalu New Terminal**. Di Windows, terminal bawaannya adalah PowerShell. PowerShell punya dua kekhasan yang sering membingungkan:

- Perintah dengan tanda `<` (dipakai untuk mengimpor file SQL lewat terminal) **tidak berfungsi** di PowerShell.
- Kadang `npm` ditolak dengan pesan "running scripts is disabled on this system".

Solusi paling mudah: pakai **Command Prompt (cmd)**. Di terminal VS Code, klik tanda panah kecil di sebelah tombol `+`, lalu pilih **Command Prompt**. Semua perintah di dokumen ini berjalan di Command Prompt.

---

## 3. Menulis file proyek

### 3.1 Membuat folder

Buat satu folder untuk proyek, misalnya `uks-pmr-wira`, lalu buka folder itu di VS Code (menu *File, lalu Open Folder*). Buka terminal (Command Prompt) di dalamnya, lalu buat sub-folder:

**Windows (Command Prompt):**

```
mkdir database
mkdir src\config src\models src\controllers src\routes src\middlewares src\utils
mkdir public\css public\js public\img
```

**macOS / Linux (bash atau zsh):**

```
mkdir -p database src/{config,models,controllers,routes,middlewares,utils} public/{css,js,img}
```

Cara lain: di VS Code, klik kanan di panel kiri, pilih **New File**, lalu ketik nama lengkap dengan garis miring, misalnya `src/config/db.js`. VS Code membuat folder yang belum ada secara otomatis.

### 3.2 Struktur akhir

Setelah semua file ditulis, struktur foldernya harus seperti ini. Nama dan huruf besar-kecilnya harus **persis sama**.

```
uks-pmr-wira/
├── package.json
├── .env                      (dibuat dari .env.example, lihat bagian 5)
├── .env.example
├── .gitignore
├── README.md
├── database/
│   ├── schema.sql
│   └── schema_tensi.sql
├── src/
│   ├── server.js
│   ├── app.js
│   ├── config/
│   │   └── db.js
│   ├── models/
│   │   ├── patientModel.js
│   │   └── bloodPressureModel.js
│   ├── controllers/
│   │   ├── patientController.js
│   │   └── bloodPressureController.js
│   ├── routes/
│   │   ├── index.js
│   │   ├── patientRoutes.js
│   │   └── bloodPressureRoutes.js
│   ├── middlewares/
│   │   ├── validators.js
│   │   ├── validateBloodPressure.js
│   │   └── errorHandler.js
│   └── utils/
│       └── bloodPressure.js
└── public/
    ├── index.html
    ├── patients.html
    ├── tensi.html
    ├── css/
    │   ├── style.css
    │   └── tensi.css
    ├── img/
    │   ├── logo-pmi.png
    │   ├── logo-pmi-mark.png
    │   ├── favicon.png
    │   └── mark-watermark.png
    └── js/
        ├── api.js
        ├── api-tensi.js
        ├── site-data.js
        ├── footer.js
        ├── landing.js
        ├── main.js
        ├── patients.js
        └── tensi.js
```

Folder `node_modules/` dan file `package-lock.json` akan muncul sendiri saat Anda menjalankan `npm install`. Jangan dibuat manual.

### 3.3 Urutan menulis dan titik pemeriksaan

Tulis dengan urutan di bawah ini. Urutannya mengikuti ketergantungan antar file (file yang dipakai file lain ditulis lebih dulu), dan setiap tahap punya titik pemeriksaan agar kesalahan ketahuan sedini mungkin.

| Tahap | File yang ditulis | Titik pemeriksaan |
| ----- | ----------------- | ----------------- |
| **A. Dasar** | `package.json`, `.env.example` (lalu salin menjadi `.env`), `.gitignore` | Jalankan `npm install`. Harus selesai tanpa pesan `ERR!` merah, dan folder `node_modules` muncul. |
| **B. Database** | `database/schema.sql`, `database/schema_tensi.sql` | Impor ke MySQL (bagian 4), lalu cek bahwa tabel `patients` dan `blood_pressure_readings` ada. |
| **C. Backend** | Urutan: `config/db.js`, `utils/bloodPressure.js`, `models/*`, `middlewares/*`, `controllers/*`, `routes/patientRoutes.js`, `routes/bloodPressureRoutes.js`, `routes/index.js`, `app.js`, `server.js` | Jalankan `npm start`. Terminal harus menampilkan `[OK] Terhubung ke database MySQL` dan `[OK] Server berjalan di http://localhost:3000`. Lalu buka http://localhost:3000/api/health. |
| **D. Frontend** | `css/*`, `js/api.js`, `js/api-tensi.js`, `js/site-data.js`, `js/footer.js`, `js/landing.js`, `js/main.js`, `js/patients.js`, `js/tensi.js`, lalu `index.html`, `patients.html`, `tensi.html`, dan gambar | Buka http://localhost:3000 di browser. Landing page tampil lengkap dengan footer. |

Dua hal yang perlu diingat pada tahap C:

- Server **gagal menyala** kalau ada file backend yang dirujuk tetapi belum ada, karena `routes/index.js` memuat kedua file routes, yang masing-masing memuat controller, lalu model. Jadi tulis semua file backend dulu sebelum menjalankan `npm start`.
- Kalau ingin menguji lebih awal dengan fitur pasien saja, beri tanda `//` di depan baris `router.use('/blood-pressure', ...)` di `routes/index.js`. Hapus tandanya setelah file tensi selesai ditulis.

Pemeriksaan tambahan di akhir tahap C, tanpa perlu frontend sama sekali. Buka alamat ini di browser:

| Alamat | Jawaban yang benar |
| ------ | ------------------ |
| `http://localhost:3000/api/health` | `{"status":"ok","time":"..."}` |
| `http://localhost:3000/api/patients` | `{"success":true,"count":0,"data":[]}` |
| `http://localhost:3000/api/blood-pressure/categories` | JSON dengan `"success":true` dan 6 kategori |
| `http://localhost:3000/api/blood-pressure/classify?sistolik=100&diastolik=70` | JSON dengan `"kode":"normal"` |

Jika keempatnya benar, backend dan database sudah terhubung dengan baik.

### 3.4 Aturan saat menyalin kode

- **Nama file harus persis sama**, termasuk huruf besar dan kecil. `patientModel.js` tidak sama dengan `patientmodel.js`. Windows tidak mempermasalahkan, tetapi Node.js akan gagal menemukan file di macOS dan Linux, dan di server hosting nanti.
- **Salin seluruh isi file**, dari baris pertama sampai terakhir. Satu kurung `}` atau koma yang hilang membuat seluruh file error.
- **Simpan file** (Ctrl+S) sebelum menjalankan. Titik bulat di tab VS Code menandakan file belum disimpan.
- **Pastikan file bukan `.txt`.** Di File Explorer Windows, aktifkan *View, Show, File name extensions*. File `.env` yang tersimpan sebagai `.env.txt` tidak akan terbaca.
- **Letak `.env`** harus di folder utama, sejajar dengan `package.json`, bukan di dalam `src`.
- **Encoding UTF-8.** Ini bawaan VS Code. Penting karena ada karakter seperti tanda hubung panjang (–) di teks.

### 3.5 File gambar

Empat file di `public/img/` berupa gambar dan tidak bisa diketik. Salin dari paket zip proyek, lalu pastikan namanya persis seperti ini:

| File | Dipakai untuk |
| ---- | ------------- |
| `logo-pmi.png` | Logo lengkap di panel hero landing page |
| `logo-pmi-mark.png` | Lambang kecil di header dan footer |
| `favicon.png` | Ikon di tab browser |
| `mark-watermark.png` | Gambar samar di latar panel merah (dipanggil dari CSS) |

Kalau salah satunya tidak ada, sistem tetap berjalan. Yang terlihat hanya ikon gambar rusak di tempat logo.

---

## 4. Menyiapkan database

### 4.1 Pastikan MySQL menyala

Untuk XAMPP, tombol **MySQL** di Control Panel harus hijau. Kalau tidak mau menyala, biasanya port 3306 dipakai program lain (misalnya MySQL lain yang sudah terpasang). Lihat [bagian 13](#13-masalah-umum).

### 4.2 Impor lewat phpMyAdmin (cara termudah)

1. Buka http://localhost/phpmyadmin.
2. Klik tab **Import** (atau **Impor**).
3. Klik **Choose File**, pilih `database/schema.sql`, lalu klik tombol **Import** di bagian paling bawah halaman.
4. Muncul pesan hijau. Di panel kiri sekarang ada database `uks_pmr_wira`.
5. **Ulangi langkah 2 sampai 4** dengan file `database/schema_tensi.sql`.

Urutannya harus `schema.sql` dulu, baru `schema_tensi.sql`, karena file kedua memakai database yang dibuat file pertama.

### 4.3 Impor lewat terminal (alternatif)

Jalankan di **Command Prompt** (bukan PowerShell), dari folder proyek:

```
mysql -u root -p < database\schema.sql
mysql -u root -p < database\schema_tensi.sql
```

Saat diminta password: untuk XAMPP dan Laragon cukup tekan Enter (password kosong). Untuk MySQL Server resmi, ketik password yang Anda buat.

Kalau muncul pesan `'mysql' is not recognized`, program `mysql` belum masuk PATH. Pakai alamat lengkapnya. Contoh untuk XAMPP:

```
C:\xampp\mysql\bin\mysql.exe -u root < database\schema.sql
C:\xampp\mysql\bin\mysql.exe -u root < database\schema_tensi.sql
```

Di macOS dan Linux, gunakan garis miring biasa: `mysql -u root -p < database/schema.sql`.

### 4.4 Memeriksa hasilnya

Di tab **SQL** phpMyAdmin (atau di klien MySQL), jalankan:

```sql
USE uks_pmr_wira;
SHOW TABLES;
DESCRIBE patients;
DESCRIBE blood_pressure_readings;
```

Daftar tabel harus berisi dua tabel: `patients` dan `blood_pressure_readings`.

### 4.5 Struktur tabel

**Tabel `patients`** (satu baris = satu kunjungan pasien ke UKS)

| Kolom | Tipe | Keterangan |
| ----- | ---- | ---------- |
| `id` | INT, otomatis naik | Nomor unik baris |
| `nama_pasien` | VARCHAR(100) | Nama pasien |
| `nisn` | CHAR(10) | NISN, tepat 10 digit. Tidak dibuat UNIQUE karena satu siswa bisa berobat berkali-kali |
| `kelas` | VARCHAR(20) | Contoh: `XI IPA 2` |
| `keluhan` | TEXT | Sakit atau keluhan |
| `created_at` | TIMESTAMP | Waktu dicatat, diisi otomatis oleh MySQL |
| `updated_at` | TIMESTAMP | Waktu terakhir diubah, diperbarui otomatis |

**Tabel `blood_pressure_readings`** (satu baris = satu hasil pengukuran tensi)

| Kolom | Tipe | Keterangan |
| ----- | ---- | ---------- |
| `id` | INT, otomatis naik | Nomor unik baris |
| `nama_siswa` | VARCHAR(100) | Nama anggota PMR |
| `nisn` | CHAR(10) | NISN, penghubung antar pengukuran milik anak yang sama |
| `kelas` | VARCHAR(20) | Kelas |
| `pengukuran_ke` | TINYINT | 1, 2, atau 3 (tiap anak diukur tiga kali) |
| `sistolik` | SMALLINT | Angka atas |
| `diastolik` | SMALLINT | Angka bawah |
| `kategori` | VARCHAR(30) | Kode kategori (contoh `normal`, `hipertensi1`). **Diisi oleh server**, bukan dari browser |
| `created_at`, `updated_at` | TIMESTAMP | Sama seperti di tabel pasien |

### 4.6 Catatan kompatibilitas

XAMPP memakai MariaDB, bukan MySQL asli. Skema di sini kompatibel dengan keduanya. Batasan `CHECK` pada tabel tensi diberlakukan oleh MariaDB 10.2 ke atas dan MySQL 8.0.16 ke atas. Pada MySQL yang lebih lama batasan itu dilewati tanpa error, dan itu aman karena server juga memeriksa nilai `pengukuran_ke` sebelum menyimpan.

---

## 5. Mengatur koneksi dengan file env

File `.env` berisi pengaturan koneksi ke database. Isinya dibaca oleh paket `dotenv` saat server menyala, lalu tersedia di program sebagai `process.env.NAMA_VARIABEL`.

### 5.1 Membuat file .env

Salin `.env.example` menjadi `.env`:

```
copy .env.example .env
```

(macOS dan Linux: `cp .env.example .env`.) Atau buat file baru bernama persis `.env` di VS Code dan isi sendiri.

### 5.2 Isi file

```
PORT=3000
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=uks_pmr_wira
```

| Variabel | Artinya | Kapan diubah |
| -------- | ------- | ------------ |
| `PORT` | Nomor port server Node.js. Alamat web menjadi `http://localhost:PORT` | Kalau port 3000 dipakai program lain |
| `DB_HOST` | Alamat komputer MySQL | Hampir tidak pernah. Kalau muncul error `::1:3306`, ganti jadi `127.0.0.1` |
| `DB_PORT` | Port MySQL | Kalau MySQL Anda tidak memakai 3306 |
| `DB_USER` | Nama user MySQL | Kalau bukan `root` |
| `DB_PASSWORD` | Password user MySQL | **Isi kalau MySQL Anda memakai password.** XAMPP dan Laragon: biarkan kosong |
| `DB_NAME` | Nama database | Biarkan `uks_pmr_wira`, sesuai `schema.sql` |

### 5.3 Hal yang sering terlewat

- Tidak boleh ada spasi di sekitar tanda `=`, dan tidak perlu tanda kutip. Contoh benar: `DB_PASSWORD=rahasia123`.
- **Setiap kali `.env` diubah, server harus dimatikan (Ctrl+C) lalu dijalankan ulang.** File ini hanya dibaca saat server menyala.
- Jangan membagikan `.env` kepada orang lain atau mengunggahnya ke GitHub kalau isinya password sungguhan. File `.gitignore` sudah mencegah `.env` ikut terunggah.

---

## 6. Menjalankan sistem

### 6.1 Pertama kali

Buka terminal (Command Prompt) di folder utama proyek, yaitu folder yang berisi `package.json`.

```
npm install
```

Perintah ini mengunduh empat paket yang dibutuhkan: `express` (kerangka server), `mysql2` (penghubung ke MySQL), `dotenv` (pembaca `.env`), dan `cors`, ditambah `nodemon` untuk pengembangan. Ini satu-satunya langkah yang membutuhkan internet. Setelah selesai, sistem berjalan tanpa internet.

### 6.2 Menyalakan server

Pastikan MySQL sudah menyala, lalu:

```
npm start
```

Kalau berhasil, terminal menampilkan:

```
[OK] Terhubung ke database MySQL
[OK] Server berjalan di http://localhost:3000
```

Biarkan jendela terminal ini tetap terbuka. Server hidup selama terminal ini berjalan.

Alternatifnya, `npm run dev` menjalankan server dengan **nodemon**, yang memulai ulang server otomatis setiap kali file backend disimpan. Nyaman saat sedang menulis atau mengubah kode.

### 6.3 Membuka sistem

| Alamat | Halaman |
| ------ | ------- |
| http://localhost:3000 | Landing page |
| http://localhost:3000/patients.html | Data pasien |
| http://localhost:3000/tensi.html | Tensi darah |

Buka lewat alamat `http://localhost:3000`. **Jangan klik dua kali file `index.html` dari folder**, karena halaman yang dibuka dengan cara itu (alamat berawalan `file://`) tidak bisa memanggil API, sehingga data tidak muncul.

### 6.4 Mematikan server

Di jendela terminal server, tekan **Ctrl+C**.

### 6.5 Rutinitas setiap kali bekerja

1. Nyalakan MySQL (XAMPP: Start pada MySQL).
2. Buka terminal di folder proyek, jalankan `npm start`.
3. Buka `http://localhost:3000` di browser.
4. Selesai bekerja: Ctrl+C di terminal, lalu Stop MySQL.

`npm install` **tidak** perlu diulang, kecuali folder `node_modules` terhapus.

---

## 7. Cara kerja integrasi

Bagian ini menjelaskan bagaimana tiap bagian saling memanggil. Kalau suatu saat ada yang tidak berfungsi, bagian ini membantu menemukan di lapisan mana masalahnya.

### 7.1 Peta file: siapa memanggil siapa

**Di backend**, hubungan antar file dibuat lewat `require(...)`:

```
server.js
 |-- dotenv ............ membaca .env
 |-- config/db.js ...... (mysql2) pool sambungan ke MySQL
 `-- app.js
      |-- express, cors, path
      |-- middlewares/errorHandler.js
      `-- routes/index.js
           |-- routes/patientRoutes.js
           |    |-- middlewares/validators.js
           |    `-- controllers/patientController.js
           |         `-- models/patientModel.js ------- config/db.js
           `-- routes/bloodPressureRoutes.js
                |-- middlewares/validateBloodPressure.js --- utils/bloodPressure.js
                `-- controllers/bloodPressureController.js
                     |-- utils/bloodPressure.js
                     `-- models/bloodPressureModel.js -- config/db.js
```

Perhatikan bahwa `require('./routes')` di `app.js` otomatis memuat `routes/index.js`. Node.js memperlakukan `index.js` sebagai file bawaan sebuah folder.

**Di frontend**, hubungan dibuat lewat urutan tag `<script>` di tiap halaman HTML. Semua file JavaScript memakai ruang nama global yang sama, jadi sebuah file hanya bisa memakai fungsi atau variabel dari file yang **dimuat lebih dulu**:

| Halaman | Urutan script | Alasan urutan ini |
| ------- | ------------- | ----------------- |
| `index.html` | `site-data.js`, `footer.js`, `landing.js`, `main.js` | `footer.js` dan `landing.js` membaca `SITE_INFO`, `KEGIATAN`, dan `LOMBA` dari `site-data.js` |
| `patients.html` | `api.js`, `site-data.js`, `footer.js`, `main.js`, `patients.js` | `patients.js` memakai `PatientAPI` dari `api.js` |
| `tensi.html` | `api.js`, `api-tensi.js`, `site-data.js`, `footer.js`, `main.js`, `tensi.js` | `api-tensi.js` memakai fungsi `request()` dari `api.js`, dan `tensi.js` memakai `BloodPressureAPI` dari `api-tensi.js` |

Kalau urutannya salah, browser menampilkan error `... is not defined` di Console (tombol F12).

### 7.2 Sambungan A: backend ke database

**Satu file yang tahu cara terhubung: `src/config/db.js`** (potongan di bawah disederhanakan, versi lengkapnya ada di file):

```js
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'uks_pmr_wira',
  ...
});
```

- Nilai `process.env.DB_...` berasal dari file `.env`. Tanda `||` memberi nilai cadangan kalau variabelnya tidak ada.
- `pool` adalah kumpulan sambungan ke MySQL yang dipakai bergantian. Ini lebih efisien daripada membuka sambungan baru untuk setiap permintaan.
- `.env` baru terbaca kalau `require('dotenv').config()` dipanggil **sebelum** `db.js` dimuat. Itu sebabnya baris itu ada di **baris pertama** `server.js`.
- Saat server menyala, `server.js` memanggil `testConnection()` untuk mengecek sambungan. Kalau gagal, server berhenti dengan pesan `[GAGAL] ...` supaya masalah koneksi langsung ketahuan, bukan baru saat halaman dibuka.

**Model memakai pool itu untuk menjalankan SQL.** Contoh dari `patientModel.js`:

```js
const [result] = await pool.execute(
  'INSERT INTO patients (nama_pasien, nisn, kelas, keluhan) VALUES (?, ?, ?, ?)',
  [nama_pasien, nisn, kelas, keluhan]
);
return result.insertId;
```

- Tanda `?` adalah tempat nilai. Nilai diberikan terpisah di array. Dengan cara ini data dari pengguna **tidak pernah digabung langsung ke teks SQL**, sehingga aman dari serangan SQL injection.
- Hasil yang dikembalikan tiap fungsi model:

| Fungsi model | Mengembalikan |
| ------------ | ------------- |
| `findAll()` | Array berisi baris-baris data |
| `findById(id)` | Satu baris, atau `null` kalau tidak ada |
| `create(data)` | `insertId`, yaitu `id` baris yang baru dibuat |
| `update(id, data)` dan `remove(id)` | `affectedRows`, yaitu jumlah baris yang terpengaruh. Nilai 0 berarti `id` tidak ditemukan, dan controller membalas 404 |

Model **hanya** berurusan dengan database. Tidak ada `req` atau `res` di dalamnya. Pemisahan ini yang memudahkan migrasi ke PostgreSQL nanti (lihat [bagian 14](#14-pengembangan-lanjutan)).

### 7.3 Sambungan B: backend ke frontend

Semuanya dirakit di `src/app.js`:

```js
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'public')));
app.use('/api', routes);
app.use('/api', notFound);
app.use(errorHandler);
```

Express menjalankan baris-baris ini **berurutan** untuk setiap permintaan yang masuk:

| Baris | Fungsinya |
| ----- | --------- |
| `cors()` | Mengizinkan halaman dari alamat lain memanggil API. Dibutuhkan hanya kalau Anda membuka frontend lewat Live Server (lihat di bawah) |
| `express.json()` | Membaca isi permintaan yang berformat JSON dan menaruhnya di `req.body` |
| `express.static(... 'public')` | Menyajikan isi folder `public/` sebagai file web. Inilah sebabnya `http://localhost:3000/` membuka `public/index.html`, dan `/patients.html` membuka `public/patients.html` |
| `app.use('/api', routes)` | Semua alamat berawalan `/api` diteruskan ke `routes/index.js` untuk ditangani sebagai API |
| `app.use('/api', notFound)` | Alamat `/api/...` yang tidak cocok dengan rute apa pun dijawab 404 berformat JSON |
| `app.use(errorHandler)` | Penampung semua error. Dipanggil kalau ada `next(err)` di controller |

Karena halaman web dan API disajikan **oleh server yang sama** di alamat yang sama (`http://localhost:3000`), frontend cukup memanggil alamat relatif seperti `/api/patients`, tanpa menulis nama server.

**Kalau Anda membuka frontend lewat Live Server** (ekstensi VS Code, biasanya alamat `http://127.0.0.1:5500`), halaman dan API berada di alamat berbeda. Ubah satu baris di `public/js/api.js`:

```js
const API_BASE_URL = 'http://localhost:3000/api';
```

`cors()` di `app.js` sudah mengizinkan panggilan seperti itu. Server Node.js tetap harus menyala. Kalau Anda membuka lewat `http://localhost:3000`, biarkan nilainya `'/api'`.

### 7.4 Sambungan C: frontend ke backend

Semua `fetch()` ada di dua file kecil: `public/js/api.js` (pasien) dan `public/js/api-tensi.js` (tensi). File halaman seperti `patients.js` tidak pernah menulis `fetch` sendiri. Mereka memanggil fungsi dari kedua file itu.

Inti `api.js` adalah fungsi `request()` (potongan di bawah disederhanakan, versi lengkapnya ada di file):

```js
const API_BASE_URL = '/api';

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options
  });
  ...
  if (!response.ok) {
    const error = new Error(payload.message || 'Terjadi kesalahan pada server.');
    error.details = payload.errors || [];
    throw error;
  }
  return payload;
}
```

- `fetch` mengirim permintaan HTTP ke server dan menunggu jawaban.
- Header `Content-Type: application/json` memberi tahu server bahwa isi yang dikirim berformat JSON, sehingga `express.json()` bisa membacanya.
- Kalau server membalas dengan status gagal (400, 404, 500, dan sebagainya), `request()` melempar error yang membawa pesan dari server. Halaman menampilkan pesan itu ke pengguna.
- Kalau server **tidak bisa dihubungi sama sekali** (server mati), `fetch` sendiri yang gagal dengan `TypeError`. Halaman menangkapnya dan menampilkan "Tidak dapat terhubung ke server. Pastikan server Node.js sedang berjalan".

Fungsi yang tersedia untuk halaman:

| Objek | Fungsi | Memanggil |
| ----- | ------ | --------- |
| `PatientAPI` | `list(search)` | `GET /api/patients` |
| | `get(id)` | `GET /api/patients/:id` |
| | `create(data)` | `POST /api/patients` |
| | `update(id, data)` | `PUT /api/patients/:id` |
| | `remove(id)` | `DELETE /api/patients/:id` |
| `BloodPressureAPI` | `categories()` | `GET /api/blood-pressure/categories` |
| | `classify(sistolik, diastolik)` | `GET /api/blood-pressure/classify?...` |
| | `list()` | `GET /api/blood-pressure` |
| | `summary()` | `GET /api/blood-pressure/summary` |
| | `create(data)`, `update(id, data)`, `remove(id)` | `POST`, `PUT`, `DELETE /api/blood-pressure` |

### 7.5 Perjalanan satu aksi dari klik sampai database

**Contoh 1: menekan "Simpan catatan" di halaman Data Pasien**

1. **Browser.** `patients.js` menangkap event `submit` pada form, memeriksa kolom wajib, lalu menyusun objek `{ nama_pasien, nisn, kelas, keluhan }` dan memanggil `PatientAPI.create(data)`.
2. **Frontend ke backend.** `api.js` menjalankan `fetch('/api/patients', { method: 'POST', body: JSON.stringify(data) })`. Browser mengirim permintaan HTTP POST ke `http://localhost:3000/api/patients`.
3. **Express (`app.js`).** `express.json()` membaca isi JSON ke `req.body`. Karena alamatnya berawalan `/api`, permintaan diteruskan ke `routes/index.js`.
4. **Routing.** `routes/index.js` meneruskan `/patients` ke `patientRoutes.js`. Di sana tertulis `route('/').post(validatePatient, controller.createPatient)`, artinya POST dijalankan lewat dua tahap: validator dulu, baru controller.
5. **Validator (`validators.js`).** Memangkas spasi, memastikan nama, kelas, dan keluhan terisi, dan NISN tepat 10 digit. Kalau salah, langsung dijawab `400` berisi daftar pesan galat, dan proses berhenti di sini. Kalau benar, data bersih ditaruh di `req.body` lalu `next()` meneruskan ke controller.
6. **Controller (`patientController.js`).** `createPatient` memanggil `PatientModel.create(req.body)`.
7. **Model dan database.** `patientModel.js` menjalankan `INSERT` lewat `pool.execute(...)`. MySQL menyimpan baris baru dan mengembalikan `insertId`. Controller lalu memanggil `PatientModel.findById(insertId)` untuk mengambil baris yang baru tersimpan.
8. **Jawaban.** Controller membalas `201` dengan `{ "success": true, "message": "Catatan disimpan.", "data": { ... } }`.
9. **Kembali di browser.** `request()` membaca JSON itu. `patients.js` menampilkan pemberitahuan "Catatan disimpan.", mengosongkan form, lalu memanggil `PatientAPI.list()` (`GET /api/patients`) untuk mengambil data terbaru dan menggambar ulang tabel.

**Contoh 2: mengetik angka tensi di halaman Tensi Darah**

1. Pengguna mengetik `100` di sistolik dan `70` di diastolik. `tensi.js` menunggu 250 milidetik setelah berhenti mengetik, lalu memanggil `BloodPressureAPI.classify(100, 70)`.
2. `api-tensi.js` mengirim `GET /api/blood-pressure/classify?sistolik=100&diastolik=70`.
3. `bloodPressureRoutes.js` mengarahkannya ke `validateClassifyQuery` (memeriksa angka masuk akal dan sistolik lebih besar dari diastolik), lalu ke `classifyValues` di controller.
4. Controller memanggil `classify(100, 70)` dari `utils/bloodPressure.js`, yang memilih kategori berdasarkan aturan di file itu.
5. Server membalas `{ "success": true, "data": { "kode": "normal", "nama": "Normal", "rentang": "...", "catatan": "..." } }`.
6. `tensi.js` menampilkan kategori dan anjurannya di panel hasil. Perhitungan ini **tidak menyentuh database**, karena hanya aturan di `utils/bloodPressure.js` yang dipakai.

**Contoh 3: menyimpan pengukuran tensi**

Alurnya sama seperti Contoh 1 dengan satu perbedaan penting. Browser **tidak mengirim kategori**. Di `bloodPressureController.js`, fungsi `createReading` menghitung sendiri `kategori = classifyCode(sistolik, diastolik)`, lalu menyimpannya ke kolom `kategori`. Dengan begitu, kategori yang tersimpan di database tidak bisa diubah dari browser.

### 7.6 Kesamaan nama antara database, JSON, dan form

Nama yang sama di tiga tempat inilah yang membuat data bisa mengalir tanpa diterjemahkan:

**Pasien**

| Kolom database | Nama di JSON | `id` input di `patients.html` |
| -------------- | ------------ | ----------------------------- |
| `nama_pasien` | `nama_pasien` | `nama_pasien` |
| `nisn` | `nisn` | `nisn` |
| `kelas` | `kelas` | `kelas` |
| `keluhan` | `keluhan` | `keluhan` |
| `id`, `created_at`, `updated_at` | sama | tidak ada input (diisi otomatis, hanya dikirim server ke browser) |

**Tensi darah**

| Kolom database | Nama di JSON | Input di `tensi.html` |
| -------------- | ------------ | --------------------- |
| `nama_siswa` | `nama_siswa` | `id="nama_siswa"` |
| `nisn` | `nisn` | `id="nisn"` |
| `kelas` | `kelas` | `id="kelas"` |
| `pengukuran_ke` | `pengukuran_ke` | tombol pilihan `name="pengukuran_ke"` |
| `sistolik` | `sistolik` | `id="sistolik"` |
| `diastolik` | `diastolik` | `id="diastolik"` |
| `kategori` | `kategori` (kode) | tidak ada input, **dihitung server** |
| tidak ada | `kategori_nama`, `kategori_singkat` | tambahan dari server untuk tampilan |

Kalau Anda mengganti nama sebuah kolom, nama itu harus diganti di semua tempat: SQL, model, validator, controller, dan JavaScript halaman.

Soal waktu: kolom `created_at` disimpan MySQL, dikirim server sebagai teks seperti `"2026-10-15T04:08:46.000Z"`, lalu `new Date(...)` di browser menampilkannya sesuai jam setempat.

### 7.7 Format jawaban server dan kode status

Semua jawaban API berupa JSON dengan pola yang sama:

```json
{ "success": true, "count": 2, "data": [ ... ] }
{ "success": true, "message": "Catatan disimpan.", "data": { ... } }
{ "success": false, "message": "Data belum lengkap atau tidak valid.", "errors": [ "NISN harus 10 digit angka." ] }
```

| Kode | Artinya | Contoh penyebab |
| ---- | ------- | --------------- |
| `200` | Berhasil | Daftar dimuat, data diubah atau dihapus |
| `201` | Berhasil dibuat | Catatan baru tersimpan |
| `400` | Permintaan tidak valid | NISN bukan 10 digit, ID bukan angka, JSON rusak |
| `404` | Tidak ditemukan | ID tidak ada di database, atau alamat `/api/...` tidak dikenal |
| `503` | Database tidak terjangkau | MySQL mati saat server berjalan |
| `500` | Galat tak terduga di server | Misalnya tabel belum dibuat. Penjelasan lengkapnya ada di **terminal server** |

Untuk kode `500`, browser hanya menerima pesan umum "Terjadi kesalahan pada server." Pesan teknis yang sebenarnya (misalnya `Table 'uks_pmr_wira.patients' doesn't exist`) dicetak di jendela terminal tempat server berjalan. **Selalu lihat terminal itu** kalau ada error 500.

### 7.8 Membuktikan tiap sambungan berfungsi

Periksa dari belakang ke depan. Kalau satu lapisan gagal, lapisan setelahnya pasti gagal juga.

| Yang diperiksa | Caranya | Hasil yang benar |
| -------------- | ------- | ---------------- |
| **Database** | Di phpMyAdmin, jalankan `SELECT * FROM patients;` | Tabel ada (boleh kosong) |
| **Backend ke database** | `npm start` | `[OK] Terhubung ke database MySQL` |
| **API hidup** | Buka `http://localhost:3000/api/health` | `{"status":"ok",...}` |
| **API membaca database** | Buka `http://localhost:3000/api/patients` | `{"success":true,"count":...,"data":[...]}` |
| **Frontend memuat** | Buka `http://localhost:3000/patients.html` | Halaman tampil dan tabel tidak menampilkan pesan galat |
| **Frontend ke backend** | Tekan F12, tab **Network**, pilih filter **Fetch/XHR**, lalu tekan Simpan catatan | Muncul baris `patients` dengan status `201`. Klik baris itu, tab **Payload** menampilkan yang dikirim dan tab **Response** menampilkan jawaban server |
| **Data benar-benar tersimpan** | Di phpMyAdmin, buka tabel `patients`, klik **Browse** | Baris yang barusan Anda simpan ada di sana |

Untuk menguji pengiriman data tanpa memakai form, buka `http://localhost:3000`, tekan F12, buka tab **Console**, lalu tempel dan jalankan:

```js
fetch('/api/patients', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ nama_pasien: 'Uji Coba', nisn: '0012345678', kelas: 'X IPA 1', keluhan: 'Pusing' })
}).then(r => r.json()).then(console.log)
```

Hasilnya `{ success: true, message: 'Catatan disimpan.', ... }`. Datanya muncul di tabel `patients`, dan hapus saja lewat halaman Data Pasien setelah selesai.

**Panduan cepat menentukan letak masalah:**

| Gejala di tab Network (F12) | Lapisan yang bermasalah |
| --------------------------- | ----------------------- |
| Permintaan tidak muncul sama sekali | Frontend (JavaScript halaman error, cek tab Console) |
| Merah, status `(failed)` | Server mati atau halaman dibuka lewat `file://` |
| Status `400` | Data tidak lolos validasi, baca tab Response |
| Status `404` | Alamat salah atau data tidak ada |
| Status `500` atau `503` | Backend atau database, baca terminal server |

---

## 8. Fungsi setiap file

### Folder utama

| File | Fungsi | Kapan diedit |
| ---- | ------ | ------------ |
| `package.json` | Daftar paket yang dibutuhkan dan perintah `npm start` serta `npm run dev`. Dibaca oleh `npm` | Saat menambah paket |
| `.env` | Pengaturan koneksi database dan port. Dibaca `server.js` lewat `dotenv` | Saat password, port, atau nama database berubah |
| `.env.example` | Contoh isi `.env` | Hampir tidak pernah |
| `.gitignore` | Daftar file yang tidak ikut ke Git (`node_modules`, `.env`) | Hampir tidak pernah |
| `README.md` | Dokumen ini | Saat ada perubahan sistem |

### Folder `database/`

| File | Fungsi | Kapan diedit |
| ---- | ------ | ------------ |
| `schema.sql` | Membuat database `uks_pmr_wira` dan tabel `patients` | Saat struktur tabel pasien berubah |
| `schema_tensi.sql` | Membuat tabel `blood_pressure_readings` | Saat struktur tabel tensi berubah |

### Folder `src/` (backend)

| File | Fungsi | Dipanggil oleh |
| ---- | ------ | -------------- |
| `server.js` | Titik awal. Memuat `.env`, mengecek koneksi database, lalu menyalakan server | `npm start` |
| `app.js` | Merakit aplikasi Express: middleware, penyaji folder `public`, jalur `/api` | `server.js` |
| `config/db.js` | Membuat pool sambungan MySQL dan fungsi `testConnection()` | `server.js` dan semua model |
| `models/patientModel.js` | Query SQL tabel `patients`: cari, ambil satu, tambah, ubah, hapus | `patientController.js` |
| `models/bloodPressureModel.js` | Query SQL tabel `blood_pressure_readings` | `bloodPressureController.js` |
| `controllers/patientController.js` | Menerima permintaan pasien, memanggil model, membalas JSON | `patientRoutes.js` |
| `controllers/bloodPressureController.js` | Sama untuk tensi, ditambah ringkasan per anak dan klasifikasi | `bloodPressureRoutes.js` |
| `routes/index.js` | Menggabungkan semua rute di bawah `/api` dan menyediakan `/api/health` | `app.js` |
| `routes/patientRoutes.js` | Memetakan `GET/POST/PUT/DELETE /api/patients` ke fungsi controller | `routes/index.js` |
| `routes/bloodPressureRoutes.js` | Memetakan rute `/api/blood-pressure` | `routes/index.js` |
| `middlewares/validators.js` | Memeriksa dan membersihkan input pasien, serta memeriksa ID | `patientRoutes.js` |
| `middlewares/validateBloodPressure.js` | Memeriksa input tensi, query klasifikasi, dan ID pengukuran | `bloodPressureRoutes.js` |
| `middlewares/errorHandler.js` | Jawaban 404 untuk alamat API yang tak dikenal dan penampung semua error | `app.js` |
| `utils/bloodPressure.js` | **Satu-satunya tempat** aturan enam kategori tensi, rentang, dan teks anjuran | Controller dan validator tensi |

### Folder `public/` (frontend)

| File | Fungsi | Kapan diedit |
| ---- | ------ | ------------ |
| `index.html` | Landing page: hero, layanan, kegiatan, hasil lomba, ajakan | Mengubah susunan halaman |
| `patients.html` | Halaman data pasien: statistik, daftar, form, dialog hapus | Mengubah susunan halaman |
| `tensi.html` | Halaman tensi: form dengan hasil kategori langsung, riwayat, ringkasan, panduan | Mengubah susunan halaman |
| `css/style.css` | Gaya untuk semua halaman: warna, header, kartu, tabel, footer | Mengubah tampilan. Warna ada di bagian `:root` paling atas |
| `css/tensi.css` | Gaya khusus halaman tensi: warna kategori, input angka, panel hasil | Mengubah tampilan halaman tensi |
| `js/api.js` | Fungsi `request()` dan `PatientAPI`: **sambungan C untuk pasien** | Mengubah alamat API (lihat 7.3) |
| `js/api-tensi.js` | `BloodPressureAPI`: sambungan C untuk tensi. Memakai `request()` dari `api.js` | Saat menambah endpoint tensi |
| `js/site-data.js` | **Isi konten**: info PMR, kontak, media sosial, daftar kegiatan, daftar lomba | Hampir setiap kali ingin mengubah isi situs |
| `js/footer.js` | Membuat footer di semua halaman dari data `SITE_INFO` | Mengubah susunan footer |
| `js/landing.js` | Menampilkan `KEGIATAN` dan `LOMBA` sebagai kartu di landing page | Mengubah tampilan kartu |
| `js/main.js` | Menu mobile dan tombol kembali ke atas | Jarang |
| `js/patients.js` | Seluruh perilaku halaman pasien: statistik, cari, filter, tambah, ubah, hapus | Mengubah perilaku halaman pasien |
| `js/tensi.js` | Perilaku halaman tensi: hasil langsung, simpan, ubah, hapus, ringkasan | Mengubah perilaku halaman tensi |
| `img/*.png` | Logo PMI (lengkap, lambang, ikon tab, watermark) | Saat mengganti logo |

---

## 9. Referensi API

Semua alamat diawali `http://localhost:3000`. Alamat GET bisa langsung dicoba dari browser.

### Pasien

| Method | Alamat | Fungsi |
| ------ | ------ | ------ |
| GET | `/api/patients` | Daftar semua pasien. Opsional `?search=kata` untuk mencari |
| GET | `/api/patients/:id` | Satu pasien |
| POST | `/api/patients` | Tambah catatan |
| PUT | `/api/patients/:id` | Ubah catatan |
| DELETE | `/api/patients/:id` | Hapus catatan |

Isi (body) untuk POST dan PUT, berformat JSON:

```json
{
  "nama_pasien": "Contoh Siswa",
  "nisn": "0012345678",
  "kelas": "XI IPA 2",
  "keluhan": "Pusing sejak pagi"
}
```

Aturan: nama maksimal 100 karakter, NISN tepat 10 digit angka, kelas maksimal 20 karakter, keluhan maksimal 1000 karakter, dan semuanya wajib diisi.

### Tensi darah

| Method | Alamat | Fungsi |
| ------ | ------ | ------ |
| GET | `/api/blood-pressure/categories` | Enam kategori beserta rentang dan anjuran |
| GET | `/api/blood-pressure/classify?sistolik=100&diastolik=70` | Tentukan kategori dari angka, tanpa menyimpan |
| GET | `/api/blood-pressure` | Semua pengukuran |
| GET | `/api/blood-pressure/summary` | Per anak: tiga pengukuran, rata-rata, kategori rata-rata |
| POST | `/api/blood-pressure` | Simpan pengukuran |
| PUT | `/api/blood-pressure/:id` | Ubah pengukuran |
| DELETE | `/api/blood-pressure/:id` | Hapus pengukuran |

Isi (body) untuk POST dan PUT. Kolom `kategori` **tidak perlu dikirim**, server menghitungnya sendiri:

```json
{
  "nama_siswa": "Contoh Siswa",
  "nisn": "0012345678",
  "kelas": "XI IPA 2",
  "pengukuran_ke": 1,
  "sistolik": 100,
  "diastolik": 70
}
```

Aturan: `pengukuran_ke` harus 1, 2, atau 3. Sistolik harus antara 50 dan 300, diastolik antara 30 dan 200, dan sistolik harus lebih besar dari diastolik.

---

## 10. Fitur tensi darah

Halaman `tensi.html` dipakai untuk mencatat tensi anggota PMR, tiga kali per anak. Begitu sistolik dan diastolik diisi, halaman bertanya ke `/api/blood-pressure/classify` dan menampilkan kategori beserta catatan dan anjurannya. Saat disimpan, server menghitung ulang kategori sendiri, jadi data tidak bisa dipalsukan dari browser.

Setelah pengukuran ke-1 atau ke-2 disimpan, data anak tetap terisi dan formulir pindah ke nomor berikutnya. Kalau NISN yang diketik sudah pernah tercatat, nama, kelas, dan nomor pengukuran berikutnya terisi otomatis. Bagian "Ringkasan per anak" menampilkan tiga pengukuran tiap anak beserta rata-ratanya, dan kategori rata-rata itu dihitung server.

Aturan kategori (kategori ditentukan oleh angka yang lebih berat, sistolik atau diastolik):

| Kategori | Aturan | Contoh |
| -------- | ------ | ------ |
| Hipotensi | Sistolik di bawah 90 atau diastolik di bawah 60 | 80/50 |
| Normal | Di bawah 120/80 (dan tidak hipotensi) | 110/70 |
| Prehipertensi | Sistolik 120–129 dan diastolik di bawah 80 | 125/75 |
| Hipertensi Derajat 1 | Sistolik 130–139 atau diastolik 80–89 | 135/85 |
| Hipertensi Derajat 2 | Sistolik 140 atau lebih, atau diastolik 90 atau lebih | 150/95 |
| Krisis Hipertensi | Sistolik di atas 180 atau diastolik di atas 120 | 190/125 |

Aturan dan teks anjuran hanya ada di satu file, `src/utils/bloodPressure.js`. Untuk mengubah teks anjuran, edit di sana lalu restart server.

**Catatan penting:** ambang di atas adalah ambang tekanan darah dewasa. Pedoman American Academy of Pediatrics 2017 memakai ambang yang sama untuk remaja usia 13 tahun ke atas, tetapi untuk usia di bawah 13 tahun klasifikasi memakai tabel persentil menurut usia, tinggi, dan jenis kelamin. Hasil di halaman ini adalah alat bantu skrining, bukan diagnosis. Pastikan pembina atau tenaga kesehatan meninjau aturan ini sebelum dipakai sebagai dasar penelitian.

---

## 11. Mengisi konten situs

Hampir semua isi yang berubah-ubah ada di satu file: `public/js/site-data.js`. Anda tidak perlu menyentuh HTML.

| Yang ingin diubah | Caranya |
| ----------------- | ------- |
| **Kegiatan** | Tambah atau ubah blok `{ judul, tanggal, deskripsi, foto }` di daftar `KEGIATAN`. Jumlahnya tidak dibatasi, halaman otomatis memanjang ke bawah |
| **Hasil lomba** | Tambah atau ubah blok `{ nama, keterangan, juara, foto }` di daftar `LOMBA` |
| **Foto** | Simpan file di `public/img/`, lalu isi `foto: 'img/nama-foto.jpg'`. Biarkan `''` untuk memakai placeholder |
| **Profil dan kontak di footer** | Ubah `deskripsi` dan daftar `kontak` di `SITE_INFO` |
| **Akun media sosial** | Isi `url` tiap akun dengan alamat lengkap, misalnya `https://www.instagram.com/nama_akun`. Ikon yang `url`-nya masih kosong tampil redup dan tidak bisa diklik. Hanya alamat `http://` atau `https://` yang diterima |
| **Warna tema** | Semua warna ada di bagian `:root` paling atas `public/css/style.css`. `--red-500` adalah merah utama |
| **Logo** | Timpa `public/img/logo-pmi.png` dan `public/img/logo-pmi-mark.png` dengan file baru bernama sama |

Contoh menambah satu kegiatan, tempel di dalam daftar `KEGIATAN` (jangan lupa koma setelah blok sebelumnya):

```js
  {
    judul: 'Donor darah bersama PMI',
    tanggal: '12 Oktober 2026',
    deskripsi: 'Anggota PMR membantu pendaftaran dan pendampingan pendonor.',
    foto: 'img/donor-darah.jpg'
  },
```

Setelah mengubah file ini, cukup muat ulang halaman di browser (tekan Ctrl+F5). Server tidak perlu dimulai ulang, karena file ini adalah file frontend.

---

## 12. Menambah fitur baru

Semua fitur di sistem ini mengikuti pola yang sama. Misalnya Anda ingin menambah pencatatan "jadwal piket UKS". Langkahnya, dengan file yang dibuat atau diubah:

1. **Database.** Buat file SQL baru dengan `CREATE TABLE`, lalu impor. Contoh `database/schema_piket.sql`.
2. **Model.** Buat `src/models/piketModel.js`. Salin pola `patientModel.js`, ganti nama tabel dan kolom.
3. **Validator.** Buat `src/middlewares/validatePiket.js` untuk memeriksa input.
4. **Controller.** Buat `src/controllers/piketController.js`. Salin pola `patientController.js`.
5. **Routes.** Buat `src/routes/piketRoutes.js`, lalu daftarkan di `src/routes/index.js` dengan satu baris: `router.use('/piket', require('./piketRoutes'));`.
6. **Koneksi frontend.** Buat `public/js/api-piket.js` berisi objek `PiketAPI` yang memanggil `request()`. Salin pola `api-tensi.js`.
7. **Halaman.** Buat `public/piket.html` dan `public/js/piket.js`. Muat script dengan urutan: `api.js`, `api-piket.js`, `site-data.js`, `footer.js`, `main.js`, `piket.js`.
8. **Navigasi.** Tambahkan tautan ke halaman itu di menu header semua halaman dan di daftar `links` pada `public/js/footer.js`.

Setelah itu mulai ulang server (Ctrl+C lalu `npm start`) agar rute baru dikenali.

---

## 13. Masalah umum

Kalau ada error, lihat dua tempat: **jendela terminal server** (untuk masalah backend dan database) dan **tab Console serta Network di browser** (tombol F12, untuk masalah frontend).

### Saat instalasi dan menyalakan server

| Pesan atau gejala | Penyebab dan solusi |
| ----------------- | ------------------- |
| `'node' is not recognized` | Node.js belum terpasang, atau terminal belum dibuka ulang setelah pemasangan. Pasang Node.js lalu **tutup dan buka lagi terminal**. |
| `npm : File ... npm.ps1 cannot be loaded because running scripts is disabled` | Terjadi di PowerShell. Pakai **Command Prompt** (lihat 2.4), atau jalankan sekali di PowerShell: `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned`. |
| `npm install` gagal dengan `ENOTFOUND` atau `ETIMEDOUT` | Tidak ada internet saat `npm install`. Hubungkan internet lalu ulangi. |
| `Cannot find module 'express'` (atau `mysql2`, `dotenv`, `cors`) | `npm install` belum dijalankan, atau dijalankan di folder yang salah. Pindah ke folder yang berisi `package.json`, lalu jalankan `npm install`. |
| `Cannot find module './routes'`, `'../models/patientModel'`, dan sejenisnya | Nama file atau folder salah ketik, atau file belum dibuat. Cocokkan dengan struktur di bagian 3.2, perhatikan huruf besar-kecil. |
| `SyntaxError: Unexpected token ...` saat `npm start` | Ada salah ketik di file yang disebut pada pesan (kurung atau koma hilang). Pesan menyebutkan nama file dan nomor barisnya. |
| `[GAGAL] Tidak bisa terhubung ke database: connect ECONNREFUSED` | MySQL belum menyala (Start di XAMPP). Kalau sudah menyala dan pesannya menyebut `::1:3306`, ubah `DB_HOST=127.0.0.1` di `.env`. Cek juga `DB_PORT`. |
| `Access denied for user 'root'@'localhost'` | `DB_USER` atau `DB_PASSWORD` di `.env` tidak cocok dengan akun MySQL Anda. |
| `Unknown database 'uks_pmr_wira'` | `schema.sql` belum diimpor, atau `DB_NAME` di `.env` salah ketik. |
| `EADDRINUSE: address already in use :::3000` | Port 3000 sedang dipakai. Matikan server lama (Ctrl+C di terminalnya), atau ubah `PORT` di `.env`. |
| MySQL XAMPP tidak mau menyala | Port 3306 dipakai MySQL lain. Matikan layanan MySQL yang lain, atau ubah port MySQL XAMPP lalu samakan `DB_PORT` di `.env`. |

### Saat sistem sudah berjalan

| Gejala | Penyebab dan solusi |
| ------ | ------------------- |
| Browser menampilkan `Cannot GET /` | Server hidup tetapi folder `public` tidak ada di tempat yang benar atau `index.html` tidak ada di dalamnya. Cek letaknya (sejajar dengan folder `src`). |
| Halaman terbuka tetapi tabel menampilkan "Tidak dapat terhubung ke server" | Server Node.js mati, atau halaman dibuka lewat `file://` atau Live Server. Buka lewat `http://localhost:3000` (lihat 7.3). |
| `Table 'uks_pmr_wira.patients' doesn't exist` di terminal, dan browser menampilkan galat 500 | `schema.sql` belum diimpor ke database yang dipakai. Impor ulang (bagian 4). |
| `Table 'uks_pmr_wira.blood_pressure_readings' doesn't exist` | `schema_tensi.sql` belum diimpor. |
| Landing page tidak menampilkan kegiatan, lomba, atau footer | Ada kesalahan ketik di `site-data.js` (biasanya koma atau kurung kurawal hilang). Buka F12, tab Console, baca pesan merahnya. |
| `ReferenceError: PatientAPI is not defined` atau `BloodPressureAPI is not defined` | Urutan tag `<script>` di HTML salah, atau `api.js` / `api-tensi.js` belum dimuat. Cocokkan dengan tabel di 7.1. |
| `request is not defined` | `api.js` harus dimuat **sebelum** `api-tensi.js`. |
| Logo tampil sebagai ikon gambar rusak | Nama atau letak file di `public/img/` salah (bagian 3.5). |
| Perubahan kode tidak terlihat | **Backend** (`src/...`, `.env`): matikan server lalu `npm start` lagi, atau pakai `npm run dev`. **Frontend** (`public/...`): tekan **Ctrl+F5** di browser untuk memuat ulang tanpa cache. |
| Takut data hilang saat mengimpor ulang | Menjalankan `schema.sql` lagi **tidak** menghapus data, karena memakai `IF NOT EXISTS`. Yang menghapus semua isi adalah menghapus database di phpMyAdmin. Ekspor dulu lewat tab *Export* sebelum menghapus. |

---

## 14. Pengembangan lanjutan

**Migrasi MySQL ke PostgreSQL.** Hanya dua tempat yang berubah: `src/config/db.js` (ganti `mysql2` dengan `pg`) dan query di `src/models/` (placeholder `?` menjadi `$1, $2, ...`, tambahkan `RETURNING id` pada INSERT). Controller, routes, dan frontend tidak tersentuh. Di file SQL, `AUTO_INCREMENT` menjadi `GENERATED ALWAYS AS IDENTITY`, dan `ON UPDATE CURRENT_TIMESTAMP` diganti trigger.

**Login dan Role-Based Access Control.** Tambahkan tabel `users` dan `roles` (administrator, petugas_uks, siswa), `src/models/userModel.js`, `src/controllers/authController.js`, `src/routes/authRoutes.js`, dan `src/middlewares/auth.js` (verifikasi token dan cek role). Middleware dipasang per rute, misalnya `router.post('/', authorize('petugas_uks', 'administrator'), ...)`. Folder `middlewares/` sudah disiapkan untuk ini, dan `routes/index.js` memuat komentar tempat rute `/auth` akan ditambahkan.

**Analitik risiko hipertensi.** Tahap awalnya sudah ada: tabel `blood_pressure_readings` (tiga pengukuran per anak, kolom `pengukuran_ke`) dan ringkasan rata-rata per anak di `/api/blood-pressure/summary`. Langkah berikutnya: pecah tabel menjadi `students` (data siswa, NISN unik) dan `visits` (kunjungan UKS), lalu hubungkan `blood_pressure_readings` ke `students` lewat `student_id`. Satu siswa memiliki tepat tiga bacaan, dan modul analisis membaca ketiganya untuk menghitung rata-rata dan kategori risiko. Karena itu NISN di tabel `patients` sengaja tidak dibuat UNIQUE.

---

## 15. Catatan data

Data pasien dan data tensi berisi identitas siswa serta informasi kesehatan. Selama uji coba, pakai data contoh. Versi beta ini belum memiliki login, jadi siapa pun yang bisa membuka alamat server dapat melihat dan mengubah datanya. Jangan menjalankan server ini di jaringan yang bisa diakses orang lain sebelum fitur login selesai.
