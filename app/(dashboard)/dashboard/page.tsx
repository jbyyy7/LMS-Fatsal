'use client';

import { useAuth } from '@/hooks/useAuth';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import {
  BookOpen,
  GraduationCap,
  Trophy,
  Clock,
  TrendingUp,
  FileText,
  CheckCircle,
  Award,
  Users,
  BarChart
} from 'lucide-react';

export default function DashboardPage() {
  const { user, profile } = useAuth();

  if (!profile) return null;

  const isTeacher = profile.role === 'Teacher' || profile.role === 'Admin';

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white shadow-xl">
        <h1 className="text-3xl font-bold mb-2">
          Selamat Datang, {profile.full_name}! 👋
        </h1>
        <p className="text-blue-100 text-lg">
          {isTeacher 
            ? 'Kelola kursus dan pantau progress siswa Anda' 
            : 'Lanjutkan perjalanan belajar Anda hari ini'}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {isTeacher ? (
          <>
            <Card className="p-6 hover:shadow-lg transition-shadow border-l-4 border-l-blue-600">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 font-medium">Total Kursus</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">12</p>
                  <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" /> +2 bulan ini
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow border-l-4 border-l-purple-600">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 font-medium">Total Siswa</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">348</p>
                  <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
                    <Users className="w-3 h-3" /> Aktif
                  </p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <Users className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow border-l-4 border-l-orange-600">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 font-medium">Tugas Pending</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">24</p>
                  <p className="text-xs text-orange-600 mt-2 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> Perlu direview
                  </p>
                </div>
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                  <FileText className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow border-l-4 border-l-green-600">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 font-medium">Avg. Progress</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">76%</p>
                  <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" /> +5% minggu ini
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <BarChart className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </Card>
          </>
        ) : (
          <>
            <Card className="p-6 hover:shadow-lg transition-shadow border-l-4 border-l-blue-600">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 font-medium">Kursus Aktif</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">6</p>
                  <p className="text-xs text-blue-600 mt-2">Sedang berlangsung</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow border-l-4 border-l-green-600">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 font-medium">Progress</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">68%</p>
                  <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" /> Terus tingkatkan!
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <GraduationCap className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow border-l-4 border-l-orange-600">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 font-medium">Tugas</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">3</p>
                  <p className="text-xs text-orange-600 mt-2 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> Deadline dekat
                  </p>
                </div>
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                  <FileText className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow border-l-4 border-l-yellow-600">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 font-medium">Prestasi</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">12</p>
                  <p className="text-xs text-yellow-600 mt-2 flex items-center gap-1">
                    <Award className="w-3 h-3" /> Badge diraih
                  </p>
                </div>
                <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                  <Trophy className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
            </Card>
          </>
        )}
      </div>

      {/* Quick Actions & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <Card className="p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-blue-600" />
            Aksi Cepat
          </h2>
          <div className="space-y-3">
            {isTeacher ? (
              <>
                <Link href="/courses/create">
                  <Button className="w-full justify-start bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white">
                    <BookOpen className="w-4 h-4 mr-2" />
                    Buat Kursus Baru
                  </Button>
                </Link>
                <Link href="/assignments">
                  <Button variant="outline" className="w-full justify-start">
                    <FileText className="w-4 h-4 mr-2" />
                    Review Tugas Siswa
                  </Button>
                </Link>
                <Link href="/students">
                  <Button variant="outline" className="w-full justify-start">
                    <Users className="w-4 h-4 mr-2" />
                    Kelola Siswa
                  </Button>
                </Link>
              </>
            ) : (
              <>
                <Link href="/courses">
                  <Button className="w-full justify-start bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white">
                    <BookOpen className="w-4 h-4 mr-2" />
                    Lihat Semua Kursus
                  </Button>
                </Link>
                <Link href="/assignments">
                  <Button variant="outline" className="w-full justify-start">
                    <FileText className="w-4 h-4 mr-2" />
                    Kerjakan Tugas
                  </Button>
                </Link>
                <Link href="/quizzes">
                  <Button variant="outline" className="w-full justify-start">
                    <Trophy className="w-4 h-4 mr-2" />
                    Ikuti Kuis
                  </Button>
                </Link>
              </>
            )}
          </div>
        </Card>

        {/* Recent Activity */}
        <Card className="p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-purple-600" />
            Aktivitas Terbaru
          </h2>
          <div className="space-y-4">
            <div className="flex gap-3 pb-3 border-b border-gray-100">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                <BookOpen className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">Materi baru tersedia</p>
                <p className="text-xs text-gray-500">Matematika Kelas 10 - 2 jam yang lalu</p>
              </div>
            </div>

            <div className="flex gap-3 pb-3 border-b border-gray-100">
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">Tugas dinilai</p>
                <p className="text-xs text-gray-500">Bahasa Indonesia - Nilai: 85 - 5 jam yang lalu</p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
                <FileText className="w-5 h-5 text-orange-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">Tugas baru</p>
                <p className="text-xs text-gray-500">Fisika - Deadline: 3 hari - 1 hari yang lalu</p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
