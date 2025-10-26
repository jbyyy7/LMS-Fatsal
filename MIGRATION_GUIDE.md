# 📝 PANDUAN MENJALANKAN SQL MIGRATION LMS

## ⚠️ JANGAN KHAWATIR - MIGRATION INI AMAN! ✅

Migration ini **TIDAK AKAN NABRAK** tabel SIAKAD yang sudah ada karena:

1. ✅ Semua tabel LMS punya **nama berbeda** (tidak bentrok)
2. ✅ Hanya **menambah tabel baru**, tidak mengubah yang lama
3. ✅ Foreign key ke tabel SIAKAD menggunakan **REFERENCES** (validasi otomatis)
4. ✅ Menggunakan **CREATE TABLE** bukan **ALTER TABLE**

---

## 🗄️ Tabel yang Akan Dibuat (13 Tabel Baru)

### LMS Tables (BARU):
1. ✅ `courses` - Kursus online
2. ✅ `modules` - Modul per kursus
3. ✅ `lessons` - Materi pembelajaran
4. ✅ `enrollments` - Pendaftaran siswa
5. ✅ `lesson_progress` - Tracking progress
6. ✅ `assignments` - Tugas
7. ✅ `submissions` - Pengumpulan tugas
8. ✅ `quizzes` - Kuis online
9. ✅ `quiz_questions` - Bank soal
10. ✅ `quiz_attempts` - Percobaan kuis
11. ✅ `discussions` - Forum diskusi
12. ✅ `discussion_replies` - Balasan diskusi
13. ✅ `course_announcements` - Pengumuman kursus

### SIAKAD Tables (TIDAK DISENTUH):
- ❌ `profiles` - Skip (sudah ada)
- ❌ `schools` - Skip (sudah ada)
- ❌ `classes` - Skip (sudah ada)
- ❌ `subjects` - Skip (sudah ada)
- ❌ `class_schedules` - Skip (sudah ada)
- ❌ `grades` - Skip (sudah ada)
- ❌ `attendances` - Skip (sudah ada)

---

## 🚀 Langkah-langkah Eksekusi

### **Step 1: Buka Supabase Dashboard**

1. Buka https://supabase.com/dashboard
2. Login dengan akun Anda
3. Pilih project SIAKAD yang sudah ada
   - **PENTING:** Gunakan project yang SAMA dengan SIAKAD!

### **Step 2: Buka SQL Editor**

1. Di sidebar kiri, klik **SQL Editor**
2. Klik tombol **+ New query**

### **Step 3: Copy Migration SQL**

1. Buka file: `database/migration.sql` di repository
2. Copy **SEMUA ISI** file (690 baris)
3. Paste ke SQL Editor di Supabase

### **Step 4: Review SQL (Opsional)**

Cek bagian-bagian penting:

```sql
-- ✅ AMAN: Hanya CREATE TABLE, tidak ALTER
CREATE TABLE courses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  subject_id UUID NOT NULL REFERENCES subjects(id),  -- ← FK ke SIAKAD
  teacher_id UUID NOT NULL REFERENCES profiles(id),  -- ← FK ke SIAKAD
  ...
);

-- ✅ AMAN: Foreign key dengan CASCADE
-- Jika subject dihapus di SIAKAD, course ikut terhapus (konsisten)
REFERENCES subjects(id) ON DELETE CASCADE

-- ✅ AMAN: RLS policies untuk security
CREATE POLICY "Authenticated users can view published courses" 
  ON courses FOR SELECT 
  USING (auth.uid() IS NOT NULL AND is_published = true);
```

### **Step 5: Run Migration**

1. Klik tombol **Run** (atau tekan Ctrl+Enter / Cmd+Enter)
2. Tunggu beberapa detik
3. Lihat hasilnya di bawah:

**Jika Sukses:**
```
Success. No rows returned
```

**Jika Ada Error:**
- Baca pesan error
- Biasanya karena tabel sudah ada (skip saja)
- Atau foreign key reference tidak ditemukan (pastikan tabel SIAKAD ada)

### **Step 6: Verifikasi**

1. Klik **Table Editor** di sidebar
2. Lihat daftar tabel
3. Cari tabel-tabel LMS yang baru:
   - ✅ courses
   - ✅ modules
   - ✅ lessons
   - ✅ enrollments
   - dll.

4. Cek struktur tabel:
   - Klik salah satu tabel (misal: `courses`)
   - Lihat columns dan relationships
   - Pastikan foreign key terconnect ke `profiles`, `subjects`

---

## 🔍 Cara Cek Apakah Migration Berhasil

### **Test 1: Lihat Tabel di Table Editor**

```
✅ courses - ada
✅ modules - ada
✅ lessons - ada
✅ enrollments - ada
... dst
```

### **Test 2: Run Query Test**

Di SQL Editor, test query ini:

```sql
-- Test 1: Lihat semua tabel LMS
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN (
    'courses', 'modules', 'lessons', 
    'enrollments', 'assignments', 'quizzes'
  )
ORDER BY table_name;

-- Test 2: Cek foreign key ke SIAKAD
SELECT 
  tc.table_name, 
  kcu.column_name,
  ccu.table_name AS foreign_table_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY' 
  AND tc.table_name = 'courses';

-- Test 3: Insert test course (opsional)
-- Ganti UUID dengan ID guru dan subject yang valid
INSERT INTO courses (
  title, 
  description, 
  subject_id, 
  teacher_id,
  class_ids,
  is_published
) VALUES (
  'Test Course',
  'This is a test course',
  '[SUBJECT_ID_DARI_SIAKAD]'::uuid,
  '[TEACHER_ID_DARI_PROFILES]'::uuid,
  ARRAY['[CLASS_ID_DARI_SIAKAD]'::uuid],
  false
);
```

---

## ⚠️ Troubleshooting

### **Error: "relation does not exist"**

**Penyebab:** Tabel reference (profiles, subjects, classes) belum ada

**Solusi:** 
- Pastikan SIAKAD sudah setup database
- Pastikan tabel `profiles`, `subjects`, `classes` sudah ada
- Jalankan migration SIAKAD dulu jika belum

### **Error: "already exists"**

**Penyebab:** Tabel sudah pernah dibuat sebelumnya

**Solusi:**
- Aman, skip saja
- Atau drop table dulu: `DROP TABLE IF EXISTS courses CASCADE;`
- Lalu run ulang migration

### **Error: "permission denied"**

**Penyebab:** RLS policy conflict

**Solusi:**
- Temporarily disable RLS: `ALTER TABLE courses DISABLE ROW LEVEL SECURITY;`
- Drop existing policies: `DROP POLICY IF EXISTS "policy_name" ON courses;`
- Run ulang migration

---

## 🎯 Yang Perlu Diperhatikan

### ✅ DO's:
- ✅ Backup database sebelum migration (opsional tapi recommended)
- ✅ Run di project Supabase yang SAMA dengan SIAKAD
- ✅ Cek tabel SIAKAD ada dulu (profiles, subjects, classes)
- ✅ Test query setelah migration

### ❌ DON'Ts:
- ❌ Jangan run di Supabase project berbeda
- ❌ Jangan modify SQL jika tidak paham
- ❌ Jangan lupa enable RLS (sudah auto enable)

---

## 📊 Diagram Relationships Setelah Migration

```
SIAKAD Tables (Existing):
┌──────────────┐
│  profiles    │─────┐
└──────────────┘     │
                     │
┌──────────────┐     │
│  subjects    │─────┤
└──────────────┘     │
                     │  Foreign Keys
┌──────────────┐     │  (REFERENCES)
│  classes     │─────┤
└──────────────┘     │
                     │
┌──────────────┐     │
│  schools     │     │
└──────────────┘     │
                     ▼
LMS Tables (New):    │
┌──────────────┐     │
│  courses     │◄────┘
└──────┬───────┘
       │
       ▼
┌──────────────┐
│  modules     │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│  lessons     │
└──────┬───────┘
       │
       ├──► assignments
       ├──► quizzes
       └──► discussions
```

---

## ✅ Checklist Setelah Migration

- [ ] Semua 13 tabel LMS berhasil dibuat
- [ ] Foreign key ke SIAKAD terconnect
- [ ] RLS policies active
- [ ] Indexes created
- [ ] Triggers created (updated_at)
- [ ] Test query berhasil
- [ ] Tidak ada error di logs

---

## 🎉 Setelah Migration Berhasil

1. **Update .env.local di LMS**
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://[your-project].supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=[your-anon-key]
   ```

2. **Test Login di LMS**
   - Buka http://localhost:3000
   - Login dengan akun SIAKAD
   - Cek dashboard

3. **Test Create Course**
   - Login sebagai Teacher
   - Buat course baru
   - Assign ke class

4. **Lanjut Development!** 🚀

---

**Need Help?**
- Check Supabase logs di Dashboard → Database → Logs
- Check browser console di http://localhost:3000
- Read error messages carefully
- Create issue di GitHub jika ada masalah

**Migration File:** `database/migration.sql` (690 lines)
**Status:** ✅ Safe to run (tidak akan nabrak SIAKAD)
