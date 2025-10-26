# ⚠️ QUICK FIX: Error "relation already exists"

## Masalah
```
ERROR: 42P07: relation "enrollments" already exists
```

## ✅ Solusi - SUDAH DIPERBAIKI!

File `database/migration.sql` sudah diupdate dengan `IF NOT EXISTS` untuk semua tabel.

### Update Terbaru:
```sql
-- Sebelum (ERROR jika tabel sudah ada)
CREATE TABLE enrollments (...);

-- Sesudah (AMAN, skip jika sudah ada)
CREATE TABLE IF NOT EXISTS enrollments (...);
```

---

## 🚀 Cara Run Migration (Updated)

### **Option 1: Run Full Migration (RECOMMENDED)**

1. **Pull latest code:**
   ```bash
   git pull origin main
   ```

2. **Buka Supabase SQL Editor**
   - Dashboard → SQL Editor → New Query

3. **Copy & Run:**
   - Copy **SEMUA ISI** file `database/migration.sql`
   - Paste ke SQL Editor
   - Klik **Run**

4. **Hasil:**
   - ✅ Tabel baru akan dibuat
   - ✅ Tabel lama akan di-skip (tidak error)
   - ✅ Indexes & policies tetap dibuat

---

### **Option 2: Drop & Recreate (Hati-hati!)**

**⚠️ WARNING: Ini akan HAPUS semua data LMS!**

Gunakan jika Anda yakin tidak ada data penting.

```sql
-- 1. Drop semua tabel LMS (urutan penting!)
DROP TABLE IF EXISTS course_announcements CASCADE;
DROP TABLE IF EXISTS discussion_replies CASCADE;
DROP TABLE IF EXISTS discussions CASCADE;
DROP TABLE IF EXISTS quiz_attempts CASCADE;
DROP TABLE IF EXISTS quiz_questions CASCADE;
DROP TABLE IF EXISTS quizzes CASCADE;
DROP TABLE IF EXISTS submissions CASCADE;
DROP TABLE IF EXISTS assignments CASCADE;
DROP TABLE IF EXISTS lesson_progress CASCADE;
DROP TABLE IF EXISTS enrollments CASCADE;
DROP TABLE IF EXISTS lessons CASCADE;
DROP TABLE IF EXISTS modules CASCADE;
DROP TABLE IF EXISTS courses CASCADE;

-- 2. Lalu run migration.sql lengkap
-- (Copy dari file database/migration.sql)
```

---

### **Option 3: Skip Error & Continue**

Jika Anda sudah punya beberapa tabel, dan mau lanjut create yang belum ada:

1. **Run migration.sql** seperti biasa
2. **Ignore error** `relation already exists`
3. **Lanjut ke baris berikutnya** (akan auto-skip)
4. **Tabel yang belum ada** akan tetap dibuat

---

## 🔍 Cek Status Tabel

```sql
-- Lihat tabel LMS yang sudah ada
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN (
    'courses',
    'modules', 
    'lessons',
    'enrollments',
    'lesson_progress',
    'assignments',
    'submissions',
    'quizzes',
    'quiz_questions',
    'quiz_attempts',
    'discussions',
    'discussion_replies',
    'course_announcements'
  )
ORDER BY table_name;
```

**Expected result:** Semua 13 tabel harus muncul

---

## 📋 Checklist

- [x] Pull latest code dari GitHub
- [ ] Run `database/migration.sql` di Supabase
- [ ] Verify 13 tabel LMS berhasil dibuat
- [ ] Test query untuk cek foreign keys
- [ ] Update `.env.local` dengan Supabase credentials
- [ ] Test login di LMS (http://localhost:3000)

---

## ✅ Status

| Item | Status |
|------|--------|
| Migration file fixed | ✅ Done (with IF NOT EXISTS) |
| Pushed to GitHub | ✅ Done (commit 944fe51) |
| Safe to run multiple times | ✅ Yes |
| Will overwrite existing data | ❌ No (preserves data) |

---

## 💡 Tips

1. **Selalu backup** sebelum drop tables
2. **Run migration** di non-production dulu
3. **Test query** setelah migration
4. **Check logs** di Supabase Dashboard → Database → Logs

---

**Last Updated:** October 26, 2025
**Fix Commit:** `944fe51`
