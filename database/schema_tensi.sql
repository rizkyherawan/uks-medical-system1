-- =====================================================
-- Tambahan skema: pengukuran tensi darah anggota PMR
-- Jalankan SETELAH database/schema.sql (database uks_pmr_wira sudah ada):
--   mysql -u root -p < database/schema_tensi.sql
-- Atau impor lewat phpMyAdmin.
-- =====================================================

USE uks_pmr_wira;

-- Satu baris = satu hasil pengukuran. Tiap anak diukur 3 kali (pengukuran_ke 1 sampai 3),
-- jadi satu NISN bisa punya beberapa baris. Kolom "kategori" diisi oleh server
-- (hasil klasifikasi), bukan dari input pengguna.
CREATE TABLE IF NOT EXISTS blood_pressure_readings (
  id             INT UNSIGNED      NOT NULL AUTO_INCREMENT,
  nama_siswa     VARCHAR(100)      NOT NULL,
  nisn           CHAR(10)          NOT NULL,
  kelas          VARCHAR(20)       NOT NULL,
  pengukuran_ke  TINYINT UNSIGNED  NOT NULL,
  sistolik       SMALLINT UNSIGNED NOT NULL,
  diastolik      SMALLINT UNSIGNED NOT NULL,
  kategori       VARCHAR(30)       NOT NULL,
  created_at     TIMESTAMP         NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at     TIMESTAMP         NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX idx_bp_nisn (nisn),
  INDEX idx_bp_kelas (kelas),
  INDEX idx_bp_kategori (kategori),
  INDEX idx_bp_created_at (created_at),
  CONSTRAINT chk_bp_pengukuran_ke CHECK (pengukuran_ke BETWEEN 1 AND 3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------
-- (Opsional) Data contoh. Hapus tanda komentar jika perlu. Semua data fiktif.
-- -----------------------------------------------------
-- INSERT INTO blood_pressure_readings
--   (nama_siswa, nisn, kelas, pengukuran_ke, sistolik, diastolik, kategori) VALUES
--   ('Contoh Siswa Satu', '0012345678', 'X IPA 1', 1, 110, 70, 'normal'),
--   ('Contoh Siswa Satu', '0012345678', 'X IPA 1', 2, 112, 72, 'normal'),
--   ('Contoh Siswa Satu', '0012345678', 'X IPA 1', 3, 108, 70, 'normal'),
--   ('Contoh Siswa Dua',  '0023456789', 'XI IPS 2', 1, 135, 85, 'hipertensi1');
