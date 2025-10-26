'use client';

import { useState, useEffect } from 'react';
import { Users, Mail, BookOpen, GraduationCap } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';

interface Teacher {
  id: string;
  full_name: string;
  email: string;
  identity_number: string;
  _coursesCount?: number;
}

export default function StaffTeachersPage() {
  const { profile } = useAuth();
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTeachers();
  }, []);

  const fetchTeachers = async () => {
    try {
      let query = supabase
        .from('profiles')
        .select('*')
        .eq('role', 'Teacher');

      // Filter by school for Staff
      if (profile?.role === 'Staff' && profile.school_id) {
        query = query.eq('school_id', profile.school_id);
      }

      const { data, error } = await query.order('full_name');
      if (error) throw error;

      // Get courses count for each teacher
      if (data) {
        const teachersWithCounts = await Promise.all(
          data.map(async (teacher) => {
            const { count } = await supabase
              .from('courses')
              .select('*', { count: 'exact', head: true })
              .eq('teacher_id', teacher.id);
            
            return { ...teacher, _coursesCount: count || 0 };
          })
        );
        setTeachers(teachersWithCounts);
      }
    } catch (error) {
      console.error('Error fetching teachers:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat data guru...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Daftar Guru</h1>
        <p className="text-gray-600 mt-1">Kelola guru di sekolah Anda</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center gap-3">
            <div className="bg-purple-100 p-3 rounded-lg">
              <GraduationCap className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Guru</p>
              <p className="text-2xl font-bold">{teachers.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center gap-3">
            <div className="bg-green-100 p-3 rounded-lg">
              <BookOpen className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Kursus</p>
              <p className="text-2xl font-bold">
                {teachers.reduce((acc, t) => acc + (t._coursesCount || 0), 0)}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 p-3 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Rata-rata Kursus</p>
              <p className="text-2xl font-bold">
                {teachers.length > 0
                  ? Math.round(teachers.reduce((acc, t) => acc + (t._coursesCount || 0), 0) / teachers.length * 10) / 10
                  : 0
                }
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Teachers Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Guru</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">NIP</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kursus</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {teachers.map((teacher) => (
              <tr key={teacher.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                      <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                        <GraduationCap className="h-5 w-5 text-purple-600" />
                      </div>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">{teacher.full_name}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">{teacher.identity_number}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Mail className="w-4 h-4" />
                    <span className="truncate max-w-xs">{teacher.email}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-gray-400" />
                    <span className="text-sm font-semibold text-gray-900">
                      {teacher._coursesCount || 0} kursus
                    </span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {teachers.length === 0 && (
          <div className="text-center py-12">
            <GraduationCap className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Belum ada guru</h3>
            <p className="text-gray-600">Guru akan muncul di sini setelah terdaftar</p>
          </div>
        )}
      </div>
    </div>
  );
}
