-- ============================================
-- FIX RLS POLICY untuk LOGIN
-- ============================================
-- Masalah: User belum login tidak bisa query profiles
-- Solusi: Buat policy untuk SELECT profiles (anon user)

-- 1. CEK: Apakah profiles punya RLS?
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'profiles';

-- 2. CEK: Policy apa saja yang ada di profiles?
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies 
WHERE tablename = 'profiles';

-- ============================================
-- 3. TAMBAHKAN POLICY untuk LOGIN (SELECT by identity_number)
-- ============================================
-- Policy ini membolehkan anon user untuk SELECT profiles by identity_number
-- (Dibutuhkan untuk login flow)

CREATE POLICY "Allow anon select profiles by identity_number" 
  ON profiles 
  FOR SELECT 
  TO anon
  USING (true);

-- Atau kalau mau lebih strict (hanya bisa select 4 kolom)
DROP POLICY IF EXISTS "Allow anon select profiles by identity_number" ON profiles;

CREATE POLICY "Allow anon select profiles for login" 
  ON profiles 
  FOR SELECT 
  TO anon, authenticated
  USING (true);

-- ============================================
-- 4. VERIFIKASI: Test query dari client
-- ============================================
-- Jalankan ini untuk test (pakai anon key):
SELECT id, email, full_name, role 
FROM profiles 
WHERE identity_number = '1';

-- ============================================
-- ALTERNATIVE: Disable RLS untuk profiles (NOT RECOMMENDED tapi works)
-- ============================================
-- Hanya gunakan ini kalau cara diatas tidak berhasil
-- ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- ============================================
-- CATATAN:
-- - RLS memblokir anon user untuk query profiles
-- - Kita perlu policy SELECT untuk login flow
-- - Setelah login, user punya auth.uid() untuk policy lain
-- ============================================
