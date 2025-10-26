'use client';

import { useState, useEffect } from 'react';
import { BarChart, Users, BookOpen, GraduationCap, TrendingUp, FileText } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';

interface SchoolStats {
  totalCourses: number;
  totalTeachers: number;
  totalStudents: number;
  totalEnrollments: number;
  totalAssignments: number;
}

export default function StaffReportsPage() {
  const { profile } = useAuth();
  const [stats, setStats] = useState<SchoolStats>({
    totalCourses: 0,
    totalTeachers: 0,
    totalStudents: 0,
    totalEnrollments: 0,
    totalAssignments: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profile?.school_id) {
      fetchStats();
    }
  }, [profile]);

  const fetchStats = async () => {
    try {
      const schoolId = profile?.school_id;

      const [courses, teachers, students] = await Promise.all([
        supabase.from('courses').select('*', { count: 'exact', head: true }).eq('school_id', schoolId),
        supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'Teacher').eq('school_id', schoolId),
        supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'Student').eq('school_id', schoolId),
      ]);

      setStats({
        totalCourses: courses.count || 0,
        totalTeachers: teachers.count || 0,
        totalStudents: students.count || 0,
        totalEnrollments: 0,
        totalAssignments: 0,
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
    { label: 'Total Kursus', value: stats.totalCourses, icon: BookOpen, color: 'green' },
    { label: 'Total Guru', value: stats.totalTeachers, icon: GraduationCap, color: 'purple' },
    { label: 'Total Siswa', value: stats.totalStudents, icon: Users, color: 'blue' },
  ];

  const colorClasses: Record<string, { bg: string; text: string }> = {
    blue: { bg: 'bg-blue-100', text: 'text-blue-600' },
    green: { bg: 'bg-green-100', text: 'text-green-600' },
    purple: { bg: 'bg-purple-100', text: 'text-purple-600' },
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Laporan Sekolah</h1>
        <p className="text-gray-600 mt-1">Analytics dan statistik sekolah Anda</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
    </div>
  );
}
