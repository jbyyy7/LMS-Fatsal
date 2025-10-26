-- ============================================
-- QUICK FIX: Isi identity_number untuk semua user
-- ============================================

-- 1. CEK DULU: Lihat user yang identity_number nya kosong
SELECT id, full_name, email, role, identity_number 
FROM profiles 
WHERE identity_number IS NULL 
ORDER BY created_at DESC;

-- 2. CEK: Lihat semua user
SELECT id, full_name, email, role, identity_number 
FROM profiles 
ORDER BY role, created_at;

-- ============================================
-- CARA 1: UPDATE MANUAL SATU-SATU (RECOMMENDED)
-- ============================================
-- Copy ID dari query diatas, lalu update satu-satu:

-- Contoh untuk Admin (boleh 1 digit)
UPDATE profiles 
SET identity_number = '1'
WHERE id = 'masukkan-user-id-disini';

-- Contoh untuk Teacher
UPDATE profiles 
SET identity_number = 'NIP001'
WHERE id = 'masukkan-user-id-disini';

-- Contoh untuk Student
UPDATE profiles 
SET identity_number = 'NIS001'
WHERE id = 'masukkan-user-id-disini';

-- ============================================
-- CARA 2: UPDATE SEMUA SEKALIGUS (SIMPLE)
-- ============================================
-- Jalankan satu per satu, JANGAN sekaligus!

-- Update Admin pertama
UPDATE profiles 
SET identity_number = '1'
WHERE role = 'Admin' 
  AND identity_number IS NULL
LIMIT 1;

-- Update Admin kedua (kalau ada)
UPDATE profiles 
SET identity_number = '2'
WHERE role = 'Admin' 
  AND identity_number IS NULL
LIMIT 1;

-- Update Teacher dengan nomor manual
-- Ganti 'user-id' dengan ID yang sebenarnya
UPDATE profiles SET identity_number = 'NIP001' WHERE id = 'user-id-teacher-1';
UPDATE profiles SET identity_number = 'NIP002' WHERE id = 'user-id-teacher-2';
UPDATE profiles SET identity_number = 'NIP003' WHERE id = 'user-id-teacher-3';

-- Update Student dengan nomor manual
-- Ganti 'user-id' dengan ID yang sebenarnya
UPDATE profiles SET identity_number = 'NIS001' WHERE id = 'user-id-student-1';
UPDATE profiles SET identity_number = 'NIS002' WHERE id = 'user-id-student-2';
UPDATE profiles SET identity_number = 'NIS003' WHERE id = 'user-id-student-3';

-- ============================================
-- CARA 3: GUNAKAN USERNAME SEBAGAI IDENTITY_NUMBER (PALING MUDAH!)
-- ============================================
-- Kalau di SIAKAD username sudah diisi, bisa pakai ini:

UPDATE profiles 
SET identity_number = username
WHERE identity_number IS NULL 
  AND username IS NOT NULL;

-- ============================================
-- VERIFIKASI: Cek hasil update
-- ============================================
SELECT role, 
       COUNT(*) as total, 
       COUNT(identity_number) as has_identity,
       COUNT(*) - COUNT(identity_number) as missing
FROM profiles 
GROUP BY role;

-- Lihat semua user dengan identity_number
SELECT id, full_name, email, role, identity_number, username
FROM profiles 
ORDER BY role, identity_number
LIMIT 50;

-- ============================================
-- CATATAN:
-- - Admin bisa 1 digit: '1', '2', '3'
-- - Teacher pakai NIP: 'NIP001', 'NIP002'
-- - Student pakai NIS: 'NIS001', 'NIS002'
-- - Atau pakai username kalau sudah ada
-- ============================================
