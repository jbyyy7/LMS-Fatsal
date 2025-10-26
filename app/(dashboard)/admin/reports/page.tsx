'use client';

import { useState, useEffect } from 'react';
import { BarChart, School, Users, BookOpen, GraduationCap, TrendingUp } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface Stats {
  totalSchools: number;
  totalCourses: number;
  totalTeachers: number;
  totalStudents: number;
  totalEnrollments: number;
  totalAssignments: number;
}

export default function AdminReportsPage() {
  const [stats, setStats] = useState<Stats>({
    totalSchools: 0,
    totalCourses: 0,
    totalTeachers: 0,
    totalStudents: 0,
    totalEnrollments: 0,
    totalAssignments: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [schools, courses, teachers, students, enrollments, assignments] = await Promise.all([
        supabase.from('schools').select('*', { count: 'exact', head: true }),
        supabase.from('courses').select('*', { count: 'exact', head: true }),
        supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'Teacher'),
        supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'Student'),
        supabase.from('enrollments').select('*', { count: 'exact', head: true }),
        supabase.from('assignments').select('*', { count: 'exact', head: true }),
      ]);

      setStats({
        totalSchools: schools.count || 0,
        totalCourses: courses.count || 0,
        totalTeachers: teachers.count || 0,
        totalStudents: students.count || 0,
        totalEnrollments: enrollments.count || 0,
        totalAssignments: assignments.count || 0,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat laporan...</p>
        </div>
      </div>
    );
  }

  const statCards = [
    { label: 'Total Sekolah', value: stats.totalSchools, icon: School, color: 'blue' },
    { label: 'Total Kursus', value: stats.totalCourses, icon: BookOpen, color: 'green' },
    { label: 'Total Guru', value: stats.totalTeachers, icon: GraduationCap, color: 'purple' },
    { label: 'Total Siswa', value: stats.totalStudents, icon: Users, color: 'orange' },
    { label: 'Total Enrollments', value: stats.totalEnrollments, icon: TrendingUp, color: 'pink' },
    { label: 'Total Tugas', value: stats.totalAssignments, icon: BarChart, color: 'indigo' },
  ];

  const colorClasses: Record<string, { bg: string; text: string }> = {
    blue: { bg: 'bg-blue-100', text: 'text-blue-600' },
    green: { bg: 'bg-green-100', text: 'text-green-600' },
    purple: { bg: 'bg-purple-100', text: 'text-purple-600' },
    orange: { bg: 'bg-orange-100', text: 'text-orange-600' },
    pink: { bg: 'bg-pink-100', text: 'text-pink-600' },
    indigo: { bg: 'bg-indigo-100', text: 'text-indigo-600' },
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Laporan Global</h1>
        <p className="text-gray-600 mt-1">Analytics dan statistik dari semua sekolah</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          const colors = colorClasses[stat.color];
          
          return (
            <div key={stat.label} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                  <p className="text-3xl font-bold text-gray-900">{stat.value.toLocaleString()}</p>
                </div>
                <div className={`${colors.bg} p-4 rounded-lg`}>
                  <Icon className={`w-8 h-8 ${colors.text}`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Additional Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Rata-rata per Sekolah</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
              <span className="text-gray-700">Kursus per Sekolah</span>
              <span className="font-bold text-gray-900">
                {stats.totalSchools > 0 ? Math.round(stats.totalCourses / stats.totalSchools) : 0}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
              <span className="text-gray-700">Guru per Sekolah</span>
              <span className="font-bold text-gray-900">
                {stats.totalSchools > 0 ? Math.round(stats.totalTeachers / stats.totalSchools) : 0}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
              <span className="text-gray-700">Siswa per Sekolah</span>
              <span className="font-bold text-gray-900">
                {stats.totalSchools > 0 ? Math.round(stats.totalStudents / stats.totalSchools) : 0}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Engagement Metrics</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
              <span className="text-gray-700">Enrollments per Siswa</span>
              <span className="font-bold text-gray-900">
                {stats.totalStudents > 0 
                  ? (stats.totalEnrollments / stats.totalStudents).toFixed(1)
                  : 0
                }
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
              <span className="text-gray-700">Siswa per Kursus</span>
              <span className="font-bold text-gray-900">
                {stats.totalCourses > 0 
                  ? Math.round(stats.totalEnrollments / stats.totalCourses)
                  : 0
                }
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
              <span className="text-gray-700">Tugas per Kursus</span>
              <span className="font-bold text-gray-900">
                {stats.totalCourses > 0 
                  ? (stats.totalAssignments / stats.totalCourses).toFixed(1)
                  : 0
                }
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
