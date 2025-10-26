# 🎭 MULTI-ROLE SYSTEM - LMS FATHUS SALAFI

## 📋 Role & Permission Overview

### 1. **Admin** (Super Admin) 👑
**Akses:** Semua sekolah & sistem

**Dashboard Stats:**
- Total Sekolah (5)
- Total Kursus (48 - semua sekolah)
- Total Guru (85)
- Total Siswa (1,248)

**Menu:**
- Dashboard
- Manajemen Sekolah
  - Semua Sekolah
  - Staff Sekolah
- Kursus Global
  - Semua Kursus
  - Buat Kursus
- Laporan
- Pengaturan

**Permissions:**
- ✅ Buat/Edit/Hapus semua sekolah
- ✅ Kelola semua staff
- ✅ Lihat semua kursus dari semua sekolah
- ✅ Akses laporan global
- ✅ Pengaturan sistem

---

### 2. **Staff** (Admin Sekolah) 🏫
**Akses:** 1 sekolah saja (sekolahnya sendiri)

**Dashboard Stats:**
- Kursus Sekolah (18)
- Guru Aktif (24)
- Siswa Sekolah (356)
- Average Progress (72%)

**Menu:**
- Dashboard
- Manajemen Kursus
  - Semua Kursus
  - Buat Kursus
- Guru & Siswa
  - Daftar Guru
  - Daftar Siswa
- Laporan Sekolah
- Pengaturan

**Permissions:**
- ✅ Kelola kursus di sekolahnya
- ✅ Kelola guru di sekolahnya
- ✅ Kelola siswa di sekolahnya
- ✅ Lihat laporan sekolahnya
- ❌ Tidak bisa akses sekolah lain
- ❌ Tidak bisa kelola staff lain

---

### 3. **Teacher** (Guru) 👨‍🏫
**Akses:** Kursus yang dia buat/ajar

**Dashboard Stats:**
- Total Kursus (12)
- Total Siswa (348)
- Tugas Pending (24)
- Average Progress (76%)

**Menu:**
- Dashboard
- Kursus Saya
  - Semua Kursus
  - Buat Kursus
- Siswa
- Tugas
- Diskusi
- Pengaturan

**Permissions:**
- ✅ Buat kursus baru
- ✅ Edit/Hapus kursus sendiri
- ✅ Lihat siswa yang enroll
- ✅ Kelola tugas & kuis
- ✅ Nilai submission siswa
- ❌ Tidak bisa lihat kursus guru lain
- ❌ Tidak bisa kelola user

---

### 4. **Student** (Murid) 👨‍🎓
**Akses:** Kursus yang dia enroll

**Dashboard Stats:**
- Kursus Aktif (6)
- Progress (68%)
- Tugas (3 pending)
- Prestasi (12 badges)

**Menu:**
- Dashboard
- Kursus Saya
- Pembelajaran
  - Materi
  - Tugas
  - Kuis
- Diskusi
- Pengaturan

**Permissions:**
- ✅ Enroll ke kursus published
- ✅ Akses materi yang di-enroll
- ✅ Submit tugas & kuis
- ✅ Ikut diskusi di kursus
- ❌ Tidak bisa buat kursus
- ❌ Tidak bisa lihat kursus yang tidak di-enroll

---

## 🔐 Role Mapping di Database

```sql
-- Tabel profiles sudah ada di SIAKAD
-- Field: role (enum)
'Admin'    -- Super Admin (akses semua)
'Staff'    -- Admin Sekolah (1 sekolah)
'Teacher'  -- Guru
'Student'  -- Siswa
```

### Update Role User:
```sql
-- Set user jadi Admin
UPDATE profiles SET role = 'Admin' WHERE identity_number = '1';

-- Set user jadi Staff
UPDATE profiles SET role = 'Staff' WHERE identity_number = 'STAFF001';

-- Set user jadi Teacher
UPDATE profiles SET role = 'Teacher' WHERE identity_number = 'NIP001';

-- Set user jadi Student  
UPDATE profiles SET role = 'Student' WHERE identity_number = 'NIS001';
```

---

## 🎯 Role-Based Filtering

### Courses (RLS Policy)
```sql
-- Admin: Lihat semua
-- Staff: Hanya sekolahnya (WHERE school_id = user.school_id)
-- Teacher: Hanya yang dia buat (WHERE teacher_id = auth.uid())
-- Student: Hanya yang published dan di-enroll

CREATE POLICY "Role-based course access" ON courses
  FOR SELECT USING (
    -- Admin lihat semua
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'Admin'
    OR
    -- Staff lihat sekolahnya
    ((SELECT role FROM profiles WHERE id = auth.uid()) = 'Staff' 
     AND EXISTS (
       SELECT 1 FROM profiles p 
       WHERE p.id = auth.uid() 
       AND p.school_id = courses.school_id
     ))
    OR
    -- Teacher lihat kursus sendiri
    teacher_id = auth.uid()
    OR
    -- Student lihat yang published dan enrolled
    (is_published = true AND EXISTS (
      SELECT 1 FROM enrollments 
      WHERE course_id = courses.id 
      AND student_id = auth.uid()
    ))
  );
```

---

## 📊 Dashboard Logic

### File: `app/(dashboard)/dashboard/page.tsx`

```typescript
const isAdmin = profile.role === 'Admin';
const isStaff = profile.role === 'Staff';
const isTeacher = profile.role === 'Teacher';
const isStudent = profile.role === 'Student';

// Conditional rendering
{isAdmin && <AdminDashboard />}
{isStaff && <StaffDashboard />}
{isTeacher && <TeacherDashboard />}
{isStudent && <StudentDashboard />}
```

---

## 🧭 Sidebar Navigation

### File: `components/layout/Sidebar.tsx`

**Dynamic menu based on role:**
- Admin → Manajemen Sekolah, Kursus Global, Laporan
- Staff → Manajemen Kursus, Guru & Siswa, Laporan Sekolah
- Teacher → Kursus Saya, Siswa, Tugas
- Student → Kursus Saya, Pembelajaran, Diskusi

---

## ✅ Testing Different Roles

### 1. **Login sebagai Admin:**
```
Nomor Induk: 1
Password: [password-admin]
```
**Expect:**
- Dashboard super admin
- Menu: Manajemen Sekolah, Laporan
- Stats: Total sekolah, total kursus semua

### 2. **Login sebagai Staff:**
```
Nomor Induk: STAFF001
Password: [password-staff]
```
**Expect:**
- Dashboard staff sekolah
- Menu: Guru & Siswa, Laporan Sekolah
- Stats: Hanya sekolahnya

### 3. **Login sebagai Teacher:**
```
Nomor Induk: NIP001
Password: [password-teacher]
```
**Expect:**
- Dashboard guru
- Menu: Kursus Saya, Siswa, Tugas
- Stats: Kursus & siswa sendiri

### 4. **Login sebagai Student:**
```
Nomor Induk: NIS001
Password: [password-student]
```
**Expect:**
- Dashboard siswa
- Menu: Pembelajaran, Diskusi
- Stats: Progress & tugas sendiri

---

## 🔧 Setup Role di Database

```sql
-- 1. Cek role user saat ini
SELECT id, full_name, identity_number, role, school_id 
FROM profiles 
ORDER BY role;

-- 2. Set role untuk testing
-- Admin (identity_number = 1)
UPDATE profiles 
SET role = 'Admin' 
WHERE identity_number = '1';

-- Staff (identity_number = STAFF001, set school_id!)
UPDATE profiles 
SET role = 'Staff', 
    school_id = 'uuid-sekolah-disini'
WHERE identity_number = 'STAFF001';

-- Teacher
UPDATE profiles 
SET role = 'Teacher'
WHERE identity_number = 'NIP001';

-- Student
UPDATE profiles 
SET role = 'Student'
WHERE identity_number = 'NIS001';

-- 3. Verifikasi
SELECT role, COUNT(*) as total 
FROM profiles 
GROUP BY role;
```

---

## 🚀 Features per Role

| Feature | Admin | Staff | Teacher | Student |
|---------|-------|-------|---------|---------|
| Lihat Semua Sekolah | ✅ | ❌ | ❌ | ❌ |
| Kelola Staff | ✅ | ❌ | ❌ | ❌ |
| Kelola Guru Sekolah | ✅ | ✅ | ❌ | ❌ |
| Kelola Siswa Sekolah | ✅ | ✅ | ❌ | ❌ |
| Buat Kursus | ✅ | ✅ | ✅ | ❌ |
| Edit Kursus Sendiri | ✅ | ✅ | ✅ | ❌ |
| Edit Kursus Orang Lain | ✅ | ❌ | ❌ | ❌ |
| Lihat Laporan Global | ✅ | ❌ | ❌ | ❌ |
| Lihat Laporan Sekolah | ✅ | ✅ | ❌ | ❌ |
| Submit Tugas | ❌ | ❌ | ❌ | ✅ |
| Nilai Tugas | ✅ | ✅ | ✅ | ❌ |

---

## 📝 Notes

1. **Staff vs Admin:**
   - Admin = Super admin (semua sekolah)
   - Staff = Admin 1 sekolah (school_id specific)

2. **School Filtering:**
   - Staff harus punya `school_id` di profiles
   - Semua query staff auto-filter by school_id

3. **Future Enhancement:**
   - Multi-school staff (jika 1 staff handle >1 sekolah)
   - Role "Kepala Sekolah" jika diperlukan nanti
   - Role "Wali Kelas" dengan permission khusus

---

**LMS Fathus Salafi - Multi-Role System** 🎭
**Roles:** Admin | Staff | Teacher | Student
