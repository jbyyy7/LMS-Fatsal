'use client';

import { useState, useEffect } from 'react';
import { Users, BookOpen, Mail, Search, GraduationCap } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';

interface Student {
  id: string;
  full_name: string;
  email: string;
  identity_number: string;
  class_id: string | null;
  class?: {
    name: string;
  };
  _enrollments?: number;
}

export default function StaffStudentsPage() {
  const { profile } = useAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      let query = supabase
        .from('profiles')
        .select(`
          *,
          class:classes(name)
        `)
        .eq('role', 'Student');

      // Filter by school for Staff
      if (profile?.school_id) {
        query = query.eq('school_id', profile.school_id);
      }

      const { data, error } = await query.order('full_name');
      if (error) throw error;

      // Get enrollment counts
      if (data) {
        const studentsWithCounts = await Promise.all(
          data.map(async (student) => {
            const { count } = await supabase
              .from('enrollments')
              .select('*', { count: 'exact', head: true })
              .eq('student_id', student.id);
            
            return { ...student, _enrollments: count || 0 };
          })
        );
        setStudents(studentsWithCounts);
      }
    } catch (error) {
      console.error('Error fetching students:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredStudents = students.filter(student =>
    student.full_name.toLowerCase().includes(search.toLowerCase()) ||
    student.identity_number.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat data siswa...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Daftar Siswa</h1>
        <p className="text-gray-600 mt-1">Kelola siswa di sekolah Anda</p>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Cari siswa..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 p-3 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Siswa</p>
              <p className="text-2xl font-bold">{students.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center gap-3">
            <div className="bg-green-100 p-3 rounded-lg">
              <GraduationCap className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Aktif Belajar</p>
              <p className="text-2xl font-bold">
                {students.filter(s => (s._enrollments || 0) > 0).length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center gap-3">
            <div className="bg-purple-100 p-3 rounded-lg">
              <BookOpen className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Enrollments</p>
              <p className="text-2xl font-bold">
                {students.reduce((acc, s) => acc + (s._enrollments || 0), 0)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Students Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Siswa</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">NIS</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kelas</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kursus</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredStudents.map((student) => (
              <tr key={student.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                      <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <Users className="h-5 w-5 text-blue-600" />
                      </div>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">{student.full_name}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">{student.identity_number}</td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {student.class?.name || <span className="text-gray-400">-</span>}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Mail className="w-4 h-4" />
                    <span className="truncate max-w-xs">{student.email}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-gray-400" />
                    <span className="text-sm font-semibold text-gray-900">
                      {student._enrollments || 0}
                    </span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredStudents.length === 0 && (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {search ? 'Tidak ada hasil' : 'Belum ada siswa'}
            </h3>
            <p className="text-gray-600">
              {search ? 'Coba kata kunci lain' : 'Siswa akan muncul di sini'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
