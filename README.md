# LMS Yayasan Fathus Salafi

Learning Management System untuk Yayasan Fathus Salafi - Platform pembelajaran online terintegrasi dengan SIAKAD dan Website Utama.

## Quick Start

```bash
# Install dependencies
npm install

# Setup environment variables
cp .env.example .env.local
# Edit .env.local dengan kredensial Supabase Anda

# Run database migration
# Buka Supabase SQL Editor dan jalankan database/migration.sql

# Run development server
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000)

## Fitur Utama

### Untuk Guru/Pengajar
- Membuat dan mengelola kursus
- Upload materi (video, dokumen, teks)
- Membuat tugas dan kuis online
- Menilai tugas siswa
- Tracking progress siswa
- Forum diskusi dengan siswa
- Analytics dan laporan

### Untuk Siswa
- Akses materi pembelajaran
- Mengerjakan tugas dan kuis
- Tracking progress belajar
- Diskusi dengan guru dan teman
- Sertifikat setelah selesai
- Notifikasi tugas dan deadline

## Tech Stack

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Supabase (PostgreSQL + Auth)
- React Hook Form + Zod
- Video.js

## Shared Authentication

**PENTING:** LMS ini menggunakan Supabase Auth yang sama dengan SIAKAD dan Website Utama.

- Single Sign-On (SSO): Login 1x untuk semua sistem
- Shared Users Table: Menggunakan tabel `profiles` yang sama
- Akun yang dibuat di SIAKAD/Website bisa langsung login ke LMS!

## Database Schema

### LMS Tables
- `courses` - Kursus/mata pelajaran online
- `modules` - Modul/bab per kursus
- `lessons` - Materi pembelajaran
- `enrollments` - Pendaftaran siswa ke kursus
- `lesson_progress` - Progress belajar
- `assignments` - Tugas
- `submissions` - Pengumpulan tugas
- `quizzes` - Kuis/ujian
- `quiz_questions` - Soal kuis
- `quiz_attempts` - Percobaan kuis
- `discussions` - Forum diskusi
- `discussion_replies` - Balasan diskusi
- `course_announcements` - Pengumuman kursus

### Shared Tables (dari SIAKAD)
- `profiles` - User data
- `schools` - Sekolah
- `classes` - Kelas
- `subjects` - Mata pelajaran
- `class_members` - Relasi siswa/guru ke kelas

## Deployment

Recommended: Vercel

```bash
git push origin main
# Import repository di vercel.com
# Set environment variables
# Deploy!
```

Custom Domain: `lms.yayasan-fatsal.com`

## Documentation

Lihat `PROJECT_CONTEXT.md` untuk dokumentasi lengkap tentang:
- Arsitektur sistem
- Integrasi dengan SIAKAD
- Database schema detail
- Best practices
- Troubleshooting

## Support

- Repository: https://github.com/jbyyy7/LMS-Fatsal
- SIAKAD Repo: https://github.com/jbyyy7/Siakad-Fatsal
- Issues: Create issue di GitHub
- Maintainer: jbyyy7

---

**Made with ❤️ for Yayasan Fathus Salafi**