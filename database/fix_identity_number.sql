-- ============================================
-- QUICK FIX: Isi identity_number untuk semua user
-- ============================================

-- 1. CEK DULU: Lihat user yang identity_number nya kosong
SELECT id, full_name, email, role, identity_number 
FROM profiles 
WHERE identity_number IS NULL 
ORDER BY created_at DESC;

-- 2. UPDATE: Isi identity_number berdasarkan role
-- PILIH SALAH SATU CARA DIBAWAH:

-- CARA 1: Set manual satu-satu (RECOMMENDED)
-- Ganti 'user-id-here' dengan ID dari query diatas
UPDATE profiles 
SET identity_number = '1'  -- untuk admin
WHERE id = 'user-id-admin-here';

UPDATE profiles 
SET identity_number = 'NIS001'  -- untuk siswa
WHERE id = 'user-id-siswa-here';

UPDATE profiles 
SET identity_number = 'NIP001'  -- untuk guru
WHERE id = 'user-id-guru-here';

-- CARA 2: Auto-generate berdasarkan role (CEPAT tapi kurang akurat)
-- Untuk ADMIN: set nomor induk = 1, 2, 3, dst
UPDATE profiles 
SET identity_number = CAST(ROW_NUMBER() OVER (ORDER BY created_at) AS TEXT)
WHERE role = 'Admin' AND identity_number IS NULL;

-- Untuk TEACHER: set nomor induk = NIP001, NIP002, dst
UPDATE profiles 
SET identity_number = 'NIP' || LPAD(CAST(ROW_NUMBER() OVER (ORDER BY created_at) AS TEXT), 3, '0')
WHERE role = 'Teacher' AND identity_number IS NULL;

-- Untuk STUDENT: set nomor induk = NIS001, NIS002, dst  
UPDATE profiles 
SET identity_number = 'NIS' || LPAD(CAST(ROW_NUMBER() OVER (ORDER BY created_at) AS TEXT), 3, '0')
WHERE role = 'Student' AND identity_number IS NULL;

-- 3. VERIFIKASI: Pastikan semua sudah terisi
SELECT role, COUNT(*) as total, 
       COUNT(identity_number) as has_identity,
       COUNT(*) - COUNT(identity_number) as missing
FROM profiles 
GROUP BY role;

-- 4. LIHAT HASIL
SELECT id, full_name, email, role, identity_number 
FROM profiles 
ORDER BY role, identity_number
LIMIT 20;

-- ============================================
-- CATATAN PENTING:
-- - Admin bisa 1 digit (1, 2, 3, dst)
-- - Teacher biasanya NIP001, NIP002, dst
-- - Student biasanya NIS001, NIS002, dst
-- - Sesuaikan dengan nomor induk asli dari SIAKAD
-- ============================================
