'use client';

import { useState, useEffect } from 'react';
import { BookOpen, Play, FileText, CheckCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';

interface Lesson {
  id: string;
  title: string;
  content: string | null;
  order_index: number;
  duration_minutes: number | null;
  module: {
    title: string;
    course: {
      title: string;
    };
  };
  _isCompleted?: boolean;
}

export default function LessonsPage() {
  const { profile } = useAuth();
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLessons();
  }, []);

  const fetchLessons = async () => {
    try {
      const { data: user } = await supabase.auth.getUser();

      let query = supabase
        .from('lessons')
        .select(`
          *,
          module:modules(
            title,
            course:courses(title)
          )
        `)
        .order('order_index');

      const { data, error } = await query;
      if (error) throw error;

      // Check completion for students
      if (profile?.role === 'Student' && data) {
        const lessonsWithProgress = await Promise.all(
          data.map(async (lesson) => {
            const { data: progress } = await supabase
              .from('lesson_progress')
              .select('completed')
              .eq('lesson_id', lesson.id)
              .eq('student_id', user.user?.id)
              .single();

            return { ...lesson, _isCompleted: progress?.completed || false };
          })
        );
        setLessons(lessonsWithProgress);
      } else {
        setLessons(data || []);
      }
    } catch (error) {
      console.error('Error fetching lessons:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat materi...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Materi Pembelajaran</h1>
        <p className="text-gray-600 mt-1">Akses semua materi pelajaran</p>
      </div>

      <div className="grid gap-4">
        {lessons.map((lesson) => (
          <div key={lesson.id} className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <div className={`p-2 rounded-lg ${lesson._isCompleted ? 'bg-green-100' : 'bg-blue-100'}`}>
                    {lesson._isCompleted ? (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    ) : (
                      <Play className="w-5 h-5 text-blue-600" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{lesson.title}</h3>
                    <p className="text-sm text-gray-600">
                      {lesson.module.course.title} › {lesson.module.title}
                    </p>
                  </div>
                </div>

                {lesson.content && (
                  <p className="text-gray-600 text-sm mt-3 line-clamp-2">{lesson.content}</p>
                )}

                <div className="flex items-center gap-4 mt-4 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <FileText className="w-4 h-4" />
                    <span>Pertemuan #{lesson.order_index}</span>
                  </div>
                  {lesson.duration_minutes && (
                    <div className="flex items-center gap-1">
                      <BookOpen className="w-4 h-4" />
                      <span>{lesson.duration_minutes} menit</span>
                    </div>
                  )}
                </div>
              </div>

              {lesson._isCompleted && (
                <span className="ml-4 px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                  Selesai
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {lessons.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg">
          <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Belum ada materi</h3>
          <p className="text-gray-600">Materi pembelajaran akan muncul di sini</p>
        </div>
      )}
    </div>
  );
}
