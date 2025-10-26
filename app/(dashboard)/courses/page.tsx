'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { EmptyState } from '@/components/shared/EmptyState'
import { BookOpen, Plus, Users, Clock } from 'lucide-react'
import Link from 'next/link'
import type { Course } from '@/types'

export default function CoursesPage() {
  const { user } = useAuth()
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)

  const isTeacher = user?.role === 'Teacher' || user?.role === 'Admin'

  useEffect(() => {
    if (user) {
      loadCourses()
    }
  }, [user])

  async function loadCourses() {
    try {
      setLoading(true)
      
      let query = supabase
        .from('courses')
        .select('*')
        .order('created_at', { ascending: false })

      if (isTeacher) {
        query = query.eq('teacher_id', user!.id)
      } else {
        query = query.eq('is_published', true)
      }

      const { data, error } = await query

      if (error) throw error

      setCourses(data || [])
    } catch (error) {
      console.error('Error loading courses:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <LoadingSpinner text="Memuat kursus..." />
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold font-heading text-gray-900">
            {isTeacher ? 'Kelola Kursus' : 'Jelajahi Kursus'}
          </h1>
          <p className="text-gray-600 mt-2">
            {isTeacher 
              ? 'Buat dan kelola kursus pembelajaran Anda' 
              : 'Temukan kursus yang sesuai dengan kebutuhan belajar Anda'}
          </p>
        </div>
        {isTeacher && (
          <Button asChild>
            <Link href="/courses/create">
              <Plus className="h-4 w-4 mr-2" />
              Buat Kursus Baru
            </Link>
          </Button>
        )}
      </div>

      {courses.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <EmptyState 
              icon={BookOpen}
              title={isTeacher ? 'Belum ada kursus' : 'Belum ada kursus tersedia'}
              description={
                isTeacher 
                  ? 'Mulai dengan membuat kursus pertama Anda untuk siswa'
                  : 'Saat ini belum ada kursus yang tersedia. Silakan cek kembali nanti.'
              }
              action={
                isTeacher ? (
                  <Button asChild>
                    <Link href="/courses/create">
                      <Plus className="h-4 w-4 mr-2" />
                      Buat Kursus Pertama
                    </Link>
                  </Button>
                ) : undefined
              }
            />
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <Card key={course.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                {course.thumbnail_url && (
                  <img 
                    src={course.thumbnail_url} 
                    alt={course.title}
                    className="w-full h-48 object-cover rounded-md mb-4"
                  />
                )}
                <CardTitle className="line-clamp-2">{course.title}</CardTitle>
                <CardDescription className="line-clamp-3">
                  {course.description || 'Tidak ada deskripsi'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center">
                    <Users className="h-4 w-4 mr-2" />
                    <span>{course.class_ids.length} Kelas</span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-2" />
                    <span>
                      {new Date(course.created_at).toLocaleDateString('id-ID')}
                    </span>
                  </div>
                </div>
                <div className="mt-4 flex gap-2">
                  <Button className="flex-1" asChild>
                    <Link href={`/courses/${course.id}`}>
                      {isTeacher ? 'Kelola' : 'Lihat Detail'}
                    </Link>
                  </Button>
                  {isTeacher && (
                    <Button variant="outline" asChild>
                      <Link href={`/courses/${course.id}/edit`}>
                        Edit
                      </Link>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
