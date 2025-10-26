'use client'

import { useAuth } from '@/hooks/useAuth'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  BookOpen, 
  GraduationCap, 
  Users, 
  BarChart,
  Plus,
  PlayCircle,
  FileText,
  MessageSquare 
} from 'lucide-react'
import Link from 'next/link'

export default function DashboardPage() {
  const { user } = useAuth()

  if (!user) {
    return null
  }

  const isTeacher = user.role === 'Teacher' || user.role === 'Admin'
  const isStudent = user.role === 'Student'

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div>
        <h1 className="text-3xl font-bold font-heading text-gray-900">
          Selamat Datang, {user.full_name}!
        </h1>
        <p className="text-gray-600 mt-2">
          {isTeacher && 'Kelola kursus dan pantau progress siswa Anda'}
          {isStudent && 'Lanjutkan pembelajaran dan kembangkan kemampuanmu'}
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {isTeacher ? 'Total Kursus' : 'Kursus Aktif'}
            </CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">
              {isTeacher ? 'Kursus yang Anda buat' : 'Kursus yang diikuti'}
            </p>
          </CardContent>
        </Card>

        {isStudent && (
          <>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Progress</CardTitle>
                <BarChart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">0%</div>
                <p className="text-xs text-muted-foreground">
                  Rata-rata penyelesaian
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Tugas</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">0</div>
                <p className="text-xs text-muted-foreground">
                  Tugas yang harus dikerjakan
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Sertifikat</CardTitle>
                <GraduationCap className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">0</div>
                <p className="text-xs text-muted-foreground">
                  Kursus diselesaikan
                </p>
              </CardContent>
            </Card>
          </>
        )}

        {isTeacher && (
          <>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Siswa</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">0</div>
                <p className="text-xs text-muted-foreground">
                  Total siswa terdaftar
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Tugas Pending</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">0</div>
                <p className="text-xs text-muted-foreground">
                  Menunggu penilaian
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Diskusi</CardTitle>
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">0</div>
                <p className="text-xs text-muted-foreground">
                  Diskusi aktif
                </p>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Aksi cepat untuk memulai aktivitas Anda
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {isTeacher && (
            <>
              <Button className="h-auto flex-col py-6" variant="outline" asChild>
                <Link href="/courses/create">
                  <Plus className="h-6 w-6 mb-2" />
                  <span>Buat Kursus Baru</span>
                </Link>
              </Button>
              <Button className="h-auto flex-col py-6" variant="outline" asChild>
                <Link href="/courses">
                  <BookOpen className="h-6 w-6 mb-2" />
                  <span>Kelola Kursus</span>
                </Link>
              </Button>
              <Button className="h-auto flex-col py-6" variant="outline" asChild>
                <Link href="/submissions">
                  <FileText className="h-6 w-6 mb-2" />
                  <span>Review Tugas</span>
                </Link>
              </Button>
              <Button className="h-auto flex-col py-6" variant="outline" asChild>
                <Link href="/analytics">
                  <BarChart className="h-6 w-6 mb-2" />
                  <span>Lihat Analytics</span>
                </Link>
              </Button>
            </>
          )}

          {isStudent && (
            <>
              <Button className="h-auto flex-col py-6" variant="outline" asChild>
                <Link href="/courses">
                  <BookOpen className="h-6 w-6 mb-2" />
                  <span>Jelajahi Kursus</span>
                </Link>
              </Button>
              <Button className="h-auto flex-col py-6" variant="outline" asChild>
                <Link href="/my-courses">
                  <PlayCircle className="h-6 w-6 mb-2" />
                  <span>Lanjutkan Belajar</span>
                </Link>
              </Button>
              <Button className="h-auto flex-col py-6" variant="outline" asChild>
                <Link href="/assignments">
                  <FileText className="h-6 w-6 mb-2" />
                  <span>Lihat Tugas</span>
                </Link>
              </Button>
              <Button className="h-auto flex-col py-6" variant="outline" asChild>
                <Link href="/certificates">
                  <GraduationCap className="h-6 w-6 mb-2" />
                  <span>Sertifikat Saya</span>
                </Link>
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      {/* Recent Activity / Courses */}
      <Card>
        <CardHeader>
          <CardTitle>
            {isTeacher ? 'Kursus Terbaru' : 'Kursus yang Sedang Diikuti'}
          </CardTitle>
          <CardDescription>
            {isTeacher 
              ? 'Kursus yang baru saja Anda buat atau update' 
              : 'Lanjutkan pembelajaran dari kursus yang sedang Anda ikuti'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-gray-500">
            <BookOpen className="h-16 w-16 mx-auto mb-4 text-gray-300" />
            <p>Belum ada kursus</p>
            <p className="text-sm mt-2">
              {isTeacher 
                ? 'Mulai dengan membuat kursus pertama Anda' 
                : 'Jelajahi dan daftar ke kursus yang tersedia'}
            </p>
            <Button className="mt-4" asChild>
              <Link href="/courses">
                {isTeacher ? 'Buat Kursus' : 'Jelajahi Kursus'}
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
