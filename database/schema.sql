-- =====================================================
-- Skema database: Sistem Rekam Medis UKS PMR Wira (beta)
-- Jalankan sekali: mysql -u root -p < database/schema.sql
-- Atau impor lewat phpMyAdmin (XAMPP/Laragon).
-- =====================================================

CREATE DATABASE IF NOT EXISTS uks_pmr_wira
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE uks_pmr_wira;

-- Satu baris = satu catatan kunjungan pasien ke UKS.
-- NISN sengaja TIDAK dibuat UNIQUE karena satu siswa bisa berobat berkali-kali.
CREATE TABLE IF NOT EXISTS patients (
  id           INT UNSIGNED NOT NULL AUTO_INCREMENT,
  nama_pasien  VARCHAR(100) NOT NULL,
  nisn         CHAR(10)     NOT NULL,
  kelas        VARCHAR(20)  NOT NULL,
  keluhan      TEXT         NOT NULL,
  created_at   TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at   TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX idx_patients_nisn (nisn),
  INDEX idx_patients_kelas (kelas),
  INDEX idx_patients_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------
-- (Opsional) Data contoh untuk uji coba. Hapus tanda komentar jika perlu.
-- Semua data di bawah ini fiktif.
-- -----------------------------------------------------
-- INSERT INTO patients (nama_pasien, nisn, kelas, keluhan) VALUES
--   ('Contoh Siswa Satu', '0012345678', 'X IPA 1', 'Pusing sejak pagi'),
--   ('Contoh Siswa Dua',  '0023456789', 'XI IPS 2', 'Sakit perut'),
--   ('Contoh Siswa Tiga', '0034567890', 'XII IPA 3', 'Demam ringan');
