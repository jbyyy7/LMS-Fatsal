'use client';

import { useState, useEffect } from 'react';
import { FileText, Plus, Calendar, CheckCircle, XCircle, Clock, BookOpen } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';

interface Assignment {
  id: string;
  title: string;
  description: string | null;
  due_date: string;
  points: number;
  created_at: string;
  course: {
    id: string;
    title: string;
  };
  _submissions?: number;
  _mySubmission?: {
    status: string;
    score: number | null;
  } | null;
}

export default function AssignmentsPage() {
  const { profile } = useAuth();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');

  const isTeacher = profile?.role === 'Teacher' || profile?.role === 'Admin' || profile?.role === 'Staff';

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    try {
      const { data: user } = await supabase.auth.getUser();
      
      let query = supabase
        .from('assignments')
        .select(`
          *,
          course:courses(id, title)
        `)
        .order('due_date', { ascending: false });

      // Filter by teacher's courses
      if (profile?.role === 'Teacher') {
        const { data: courses } = await supabase
          .from('courses')
          .select('id')
          .eq('teacher_id', user.user?.id);
        
        if (courses) {
          const courseIds = courses.map(c => c.id);
          query = query.in('course_id', courseIds);
        }
      }

      // For students, get enrolled courses assignments
      if (profile?.role === 'Student') {
        const { data: enrollments } = await supabase
          .from('enrollments')
          .select('course_id')
          .eq('student_id', user.user?.id);
        
        if (enrollments) {
          const courseIds = enrollments.map(e => e.course_id);
          query = query.in('course_id', courseIds);
        }
      }

      const { data, error } = await query;
      if (error) throw error;

      // Get submission counts for teachers or personal submissions for students
      if (data) {
        const assignmentsWithData = await Promise.all(
          data.map(async (assignment) => {
            if (isTeacher) {
              const { count } = await supabase
                .from('assignment_submissions')
                .select('*', { count: 'exact', head: true })
                .eq('assignment_id', assignment.id);
              
              return { ...assignment, _submissions: count || 0 };
            } else {
              // Get student's submission
              const { data: submission } = await supabase
                .from('assignment_submissions')
                .select('status, score')
                .eq('assignment_id', assignment.id)
                .eq('student_id', user.user?.id)
                .single();
              
              return { ...assignment, _mySubmission: submission || null };
            }
          })
        );
        setAssignments(assignmentsWithData);
      }
    } catch (error) {
      console.error('Error fetching assignments:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredAssignments = assignments.filter(assignment => {
    if (!isTeacher && filter !== 'all') {
      if (filter === 'pending') return !assignment._mySubmission;
      if (filter === 'completed') return assignment._mySubmission;
    }
    return true;
  });

  const getStatusBadge = (assignment: Assignment) => {
    if (isTeacher) {
      return (
        <div className="flex items-center gap-2 text-sm text-blue-600">
          <FileText className="w-4 h-4" />
          <span>{assignment._submissions} submission(s)</span>
        </div>
      );
    }

    if (assignment._mySubmission) {
      const { status, score } = assignment._mySubmission;
      if (status === 'graded') {
        return (
          <div className="flex items-center gap-2 text-sm text-green-600">
            <CheckCircle className="w-4 h-4" />
            <span>Dinilai: {score}/{assignment.points}</span>
          </div>
        );
      }
      return (
        <div className="flex items-center gap-2 text-sm text-yellow-600">
          <Clock className="w-4 h-4" />
          <span>Submitted - Menunggu penilaian</span>
        </div>
      );
    }

    const isPastDue = new Date(assignment.due_date) < new Date();
    return (
      <div className={`flex items-center gap-2 text-sm ${isPastDue ? 'text-red-600' : 'text-gray-600'}`}>
        <XCircle className="w-4 h-4" />
        <span>{isPastDue ? 'Terlambat' : 'Belum dikumpulkan'}</span>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat tugas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tugas</h1>
          <p className="text-gray-600 mt-1">
            {isTeacher ? 'Kelola tugas untuk siswa' : 'Tugas yang harus dikerjakan'}
          </p>
        </div>
        {isTeacher && (
          <Link
            href="/assignments/create"
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            <Plus className="w-5 h-5" />
            Buat Tugas
          </Link>
        )}
      </div>

      {/* Filters for students */}
      {!isTeacher && (
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg ${filter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
          >
            Semua
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-4 py-2 rounded-lg ${filter === 'pending' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
          >
            Belum Selesai
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`px-4 py-2 rounded-lg ${filter === 'completed' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
          >
            Sudah Selesai
          </button>
        </div>
      )}

      {/* Assignments Grid */}
      <div className="grid gap-4">
        {filteredAssignments.map((assignment) => {
          const dueDate = new Date(assignment.due_date);
          const isPastDue = dueDate < new Date();
          
          return (
            <div
              key={assignment.id}
              className={`bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow border-l-4 ${
                isPastDue && !assignment._mySubmission ? 'border-red-500' : 'border-blue-500'
              }`}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <FileText className="w-5 h-5 text-blue-600" />
                    <h3 className="text-lg font-semibold text-gray-900">{assignment.title}</h3>
                  </div>
                  
                  {assignment.description && (
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">{assignment.description}</p>
                  )}
                  
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <BookOpen className="w-4 h-4" />
                      <span>{assignment.course.title}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>{dueDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                    </div>
                    <div className="font-semibold text-gray-900">
                      {assignment.points} poin
                    </div>
                  </div>
                </div>
                
                <div className="ml-4">
                  {getStatusBadge(assignment)}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredAssignments.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg">
          <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {filter === 'pending' ? 'Tidak ada tugas pending' : 
             filter === 'completed' ? 'Belum ada tugas yang selesai' : 
             'Belum ada tugas'}
          </h3>
          <p className="text-gray-600">
            {isTeacher ? 'Mulai dengan membuat tugas pertama' : 'Tugas akan muncul di sini'}
          </p>
        </div>
      )}
    </div>
  );
}
