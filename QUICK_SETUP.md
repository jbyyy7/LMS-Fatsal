# ⚡ QUICK SETUP GUIDE - LMS FATHUS SALAFI

## 🚀 Setup dalam 5 Menit

### Step 1: Pull Latest Code
```bash
cd /workspaces/LMS-Fatsal
git pull origin main
```

### Step 2: Install Dependencies (jika belum)
```bash
npm install
```

### Step 3: Configure Environment
```bash
# Copy .env.example ke .env.local
cp .env.example .env.local

# Edit .env.local
nano .env.local
```

**Isi dengan credentials Supabase yang sama dengan SIAKAD:**
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Step 4: Run Database Migration
1. Buka Supabase Dashboard → SQL Editor
2. Copy paste isi file `database/migration.sql`
3. Click **Run** (akan create 13 tables LMS)

### Step 5: Setup Test Users dengan Role
```sql
-- Login ke Supabase SQL Editor, jalankan query ini:

-- 1. Set Admin (Super Admin)
UPDATE profiles 
SET role = 'Admin' 
WHERE identity_number = '1';

-- 2. Set Staff (Admin Sekolah - ganti school_id!)
UPDATE profiles 
SET role = 'Staff',
    school_id = (SELECT id FROM schools LIMIT 1)
WHERE identity_number = 'STAFF001';

-- 3. Set Teacher
UPDATE profiles 
SET role = 'Teacher'
WHERE identity_number = 'NIP001';

-- 4. Set Student
UPDATE profiles 
SET role = 'Student'
WHERE identity_number = 'NIS001';

-- 5. Verifikasi
SELECT full_name, identity_number, role, school_id 
FROM profiles 
WHERE identity_number IN ('1', 'STAFF001', 'NIP001', 'NIS001');
```

### Step 6: Fix RLS Policy (jika login error)
```bash
# Jika dapat error "nomor induk tidak ditemukan"
# Run ini di SQL Editor:
```
Copy paste isi `database/fix_rls_login.sql`

### Step 7: Start Development Server
```bash
npm run dev
```

Buka: http://localhost:3000

---

## 🔐 Test Login

### 1. Login sebagai Admin:
```
URL: http://localhost:3000/login
Nomor Induk: 1
Password: [password admin]
```
**Expect:** Dashboard super admin, menu Manajemen Sekolah

### 2. Login sebagai Staff:
```
Nomor Induk: STAFF001
Password: [password staff]
```
**Expect:** Dashboard sekolah, menu Guru & Siswa

### 3. Login sebagai Teacher:
```
Nomor Induk: NIP001
Password: [password teacher]
```
**Expect:** Dashboard guru, menu Kursus Saya

### 4. Login sebagai Student:
```
Nomor Induk: NIS001
Password: [password student]
```
**Expect:** Dashboard siswa, menu Pembelajaran

---

## ✅ Checklist

- [ ] Code di-pull dari GitHub
- [ ] npm install selesai
- [ ] .env.local configured
- [ ] Database migration berhasil (13 tables created)
- [ ] Test users punya role (Admin/Staff/Teacher/Student)
- [ ] RLS policy fixed (jika perlu)
- [ ] Dev server running
- [ ] Bisa login dengan identity_number
- [ ] Dashboard tampil sesuai role
- [ ] Sidebar menu berbeda per role
- [ ] Tidak ada 404 error di menu

---

## 🐛 Troubleshooting

### Error: "nomor induk tidak ditemukan"
**Cause:** RLS policy blocking anon user dari query profiles

**Fix:**
```sql
-- Run di Supabase SQL Editor
DROP POLICY IF EXISTS "Allow login with identity_number" ON profiles;

CREATE POLICY "Allow login with identity_number" ON profiles
  FOR SELECT
  TO anon
  USING (true);
```

### Error: "relation courses already exists"
**Cause:** Tables sudah ada di database

**Fix:**
```bash
# Option 1: Drop existing tables (HATI-HATI!)
# Run di SQL Editor:
DROP TABLE IF EXISTS quiz_submissions CASCADE;
DROP TABLE IF EXISTS quiz_questions CASCADE;
DROP TABLE IF EXISTS quizzes CASCADE;
DROP TABLE IF EXISTS assignment_submissions CASCADE;
DROP TABLE IF EXISTS assignments CASCADE;
DROP TABLE IF EXISTS lesson_progress CASCADE;
DROP TABLE IF EXISTS lessons CASCADE;
DROP TABLE IF EXISTS modules CASCADE;
DROP TABLE IF EXISTS course_materials CASCADE;
DROP TABLE IF EXISTS discussion_replies CASCADE;
DROP TABLE IF EXISTS discussions CASCADE;
DROP TABLE IF EXISTS enrollments CASCADE;
DROP TABLE IF EXISTS courses CASCADE;

# Option 2: Rename existing tables
ALTER TABLE courses RENAME TO courses_old;
# ... dll
```

### Error: "Cannot read properties of null (reading 'role')"
**Cause:** User belum punya role di profiles

**Fix:**
```sql
-- Set role default untuk semua user tanpa role
UPDATE profiles 
SET role = 'Student' 
WHERE role IS NULL;

-- Atau set spesifik per user
UPDATE profiles 
SET role = 'Teacher'
WHERE identity_number = 'NIP001';
```

### 404 Error di Menu
**Cause:** Page belum dibuat (tapi harusnya sudah semua!)

**Check:**
```bash
# Cek apakah file page.tsx ada
ls -la app/\(dashboard\)/admin/schools/
ls -la app/\(dashboard\)/staff/teachers/
ls -la app/\(dashboard\)/courses/create/
```

**Fix:** Sudah ada 15 placeholder pages, tinggal implement fiturnya

---

## 📊 Database Tables (13 LMS Tables)

✅ Created by migration.sql:
1. `courses` - Data kursus
2. `enrollments` - Siswa enroll ke kursus
3. `discussions` - Forum diskusi
4. `discussion_replies` - Balasan diskusi
5. `course_materials` - File/video materi
6. `modules` - Modul pembelajaran
7. `lessons` - Pelajaran/topik
8. `lesson_progress` - Progress siswa
9. `assignments` - Tugas
10. `assignment_submissions` - Submit tugas
11. `quizzes` - Kuis
12. `quiz_questions` - Soal kuis
13. `quiz_submissions` - Jawaban kuis

---

## 🎯 Next Steps After Setup

1. **Test semua role login** ✅
2. **Verifikasi sidebar menu** ✅
3. **Check dashboard stats** ✅
4. **Implement Course Create Form** (placeholder ready)
5. **Build Module & Lesson Management** (placeholder ready)
6. **Create Assignment System** (placeholder ready)
7. **Build Quiz Builder** (placeholder ready)
8. **Add Discussion Forum** (placeholder ready)

---

## 📚 File Structure

```
LMS-Fatsal/
├── app/
│   ├── (auth)/
│   │   └── login/           # Login with identity_number
│   └── (dashboard)/
│       ├── dashboard/       # Role-based dashboards
│       ├── admin/          # Admin pages (3)
│       ├── staff/          # Staff pages (3)
│       ├── courses/        # Course management (2)
│       ├── students/       # Student list (1)
│       ├── assignments/    # Assignments (1)
│       ├── discussions/    # Discussions (1)
│       ├── lessons/        # Lessons (1)
│       ├── quizzes/        # Quizzes (1)
│       └── settings/       # Settings (1)
├── components/
│   └── layout/
│       ├── Sidebar.tsx     # Role-based sidebar
│       ├── Navbar.tsx      # Top navigation
│       └── Footer.tsx      # Footer
├── database/
│   ├── migration.sql       # 13 LMS tables
│   └── fix_rls_login.sql   # Fix RLS policy
├── ROLE_SYSTEM.md          # Role documentation
├── QUICK_SETUP.md          # This file
└── README.md               # Project overview
```

---

## 🔥 Common Commands

```bash
# Development
npm run dev              # Start dev server (localhost:3000)
npm run build            # Build production
npm run start            # Start production server

# Git
git status              # Check changes
git add .               # Stage all changes
git commit -m "feat: ..." # Commit
git push origin main    # Push to GitHub

# Database
# No CLI commands - use Supabase SQL Editor

# Clean install (jika error)
rm -rf node_modules package-lock.json
npm install
```

---

## 🎉 Setup Complete!

Kalo semua checklist ✅, berarti sistem sudah ready!

**Test dengan:**
1. Login 4 role berbeda
2. Check sidebar menu berbeda
3. Lihat dashboard stats berbeda
4. Click menu items (semua placeholder ada)

**Next:** Implement fitur asli (courses, assignments, quizzes, dll)

---

**Need Help?** Check:
- `ROLE_SYSTEM.md` - Role permissions & logic
- `PROJECT_CONTEXT.md` - Original requirements
- `README.md` - Project overview
- GitHub: https://github.com/jbyyy7/LMS-Fatsal

**Happy Coding! 🚀**
