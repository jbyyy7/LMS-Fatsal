'use client';

import { useState, useEffect } from 'react';
import { FileQuestion, Plus, Clock, Award, CheckCircle2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';

interface Quiz {
  id: string;
  title: string;
  description: string | null;
  time_limit_minutes: number | null;
  passing_score: number;
  course: {
    title: string;
  };
  _questionsCount?: number;
  _mySubmission?: {
    score: number;
    passed: boolean;
  } | null;
}

export default function QuizzesPage() {
  const { profile } = useAuth();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);

  const isTeacher = profile?.role === 'Teacher' || profile?.role === 'Admin' || profile?.role === 'Staff';

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const fetchQuizzes = async () => {
    try {
      const { data: user } = await supabase.auth.getUser();

      let query = supabase
        .from('quizzes')
        .select(`
          *,
          course:courses(title)
        `)
        .order('created_at', { ascending: false });

      const { data, error } = await query;
      if (error) throw error;

      if (data) {
        const quizzesWithData = await Promise.all(
          data.map(async (quiz) => {
            // Get questions count
            const { count } = await supabase
              .from('quiz_questions')
              .select('*', { count: 'exact', head: true })
              .eq('quiz_id', quiz.id);

            if (profile?.role === 'Student') {
              // Get student's best submission
              const { data: submission } = await supabase
                .from('quiz_submissions')
                .select('score, passed')
                .eq('quiz_id', quiz.id)
                .eq('student_id', user.user?.id)
                .order('score', { ascending: false })
                .limit(1)
                .single();

              return { ...quiz, _questionsCount: count || 0, _mySubmission: submission || null };
            }

            return { ...quiz, _questionsCount: count || 0 };
          })
        );
        setQuizzes(quizzesWithData);
      }
    } catch (error) {
      console.error('Error fetching quizzes:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat kuis...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Kuis & Ujian</h1>
          <p className="text-gray-600 mt-1">
            {isTeacher ? 'Kelola kuis untuk siswa' : 'Kerjakan kuis untuk menguji pemahaman'}
          </p>
        </div>
        {isTeacher && (
          <Link
            href="/quizzes/create"
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            <Plus className="w-5 h-5" />
            Buat Kuis
          </Link>
        )}
      </div>

      <div className="grid gap-4">
        {quizzes.map((quiz) => (
          <div
            key={quiz.id}
            className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow border-l-4 border-purple-500"
          >
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <FileQuestion className="w-5 h-5 text-purple-600" />
                  <h3 className="text-lg font-semibold text-gray-900">{quiz.title}</h3>
                </div>

                {quiz.description && (
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">{quiz.description}</p>
                )}

                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span className="font-medium text-gray-700">{quiz.course.title}</span>
                  <div className="flex items-center gap-1">
                    <FileQuestion className="w-4 h-4" />
                    <span>{quiz._questionsCount} soal</span>
                  </div>
                  {quiz.time_limit_minutes && (
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{quiz.time_limit_minutes} menit</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    <Award className="w-4 h-4" />
                    <span>Passing: {quiz.passing_score}%</span>
                  </div>
                </div>
              </div>

              {profile?.role === 'Student' && quiz._mySubmission && (
                <div className="ml-4">
                  {quiz._mySubmission.passed ? (
                    <div className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg">
                      <CheckCircle2 className="w-5 h-5" />
                      <div>
                        <div className="text-xs font-medium">Lulus</div>
                        <div className="text-sm font-bold">{quiz._mySubmission.score}%</div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg">
                      <div>
                        <div className="text-xs font-medium">Belum Lulus</div>
                        <div className="text-sm font-bold">{quiz._mySubmission.score}%</div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {quizzes.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg">
          <FileQuestion className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Belum ada kuis</h3>
          <p className="text-gray-600">
            {isTeacher ? 'Mulai dengan membuat kuis pertama' : 'Kuis akan muncul di sini'}
          </p>
        </div>
      )}
    </div>
  );
}
