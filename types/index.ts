// Database types based on PROJECT_CONTEXT.md schema

export type UserRole = 
  | 'Admin'
  | 'Foundation Head'
  | 'Principal'
  | 'Staff'
  | 'Teacher'
  | 'Student'

export type Gender = 'L' | 'P'

export type LessonType = 'video' | 'document' | 'text' | 'quiz' | 'assignment'

export type QuestionType = 'multiple_choice' | 'true_false' | 'short_answer'

export interface Profile {
  id: string
  email: string
  full_name: string
  identity_number?: string
  role: UserRole
  school_id?: string
  place_of_birth?: string
  date_of_birth?: string
  gender?: Gender
  religion?: string
  address?: string
  phone_number?: string
  parent_name?: string
  parent_phone_number?: string
  subject_ids?: string[]
  avatar_url?: string
  created_at: string
  updated_at: string
}

export interface School {
  id: string
  name: string
  level: 'MA' | 'MTs' | 'MI' | 'RA' | 'TK'
  address?: string
  created_at: string
  updated_at: string
}

export interface Class {
  id: string
  school_id: string
  name: string
  level?: string
  homeroom_teacher_id?: string
  academic_year: string
  created_at: string
  updated_at: string
}

export interface Subject {
  id: string
  school_id: string
  name: string
  code?: string
  description?: string
  created_at: string
}

export interface Course {
  id: string
  title: string
  description?: string
  subject_id: string
  teacher_id: string
  class_ids: string[]
  thumbnail_url?: string
  is_published: boolean
  created_at: string
  updated_at: string
}

export interface Module {
  id: string
  course_id: string
  title: string
  description?: string
  order: number
  created_at: string
  updated_at: string
}

export interface Lesson {
  id: string
  module_id: string
  title: string
  type: LessonType
  content?: string
  video_url?: string
  document_url?: string
  duration?: number
  order: number
  is_preview: boolean
  created_at: string
  updated_at: string
}

export interface Enrollment {
  id: string
  course_id: string
  student_id: string
  enrolled_at: string
  completed_at?: string
  progress: number
}

export interface LessonProgress {
  id: string
  enrollment_id: string
  lesson_id: string
  completed: boolean
  completed_at?: string
  time_spent?: number
}

export interface Assignment {
  id: string
  lesson_id: string
  title: string
  description: string
  due_date: string
  max_score: number
  allow_late_submission: boolean
  created_at: string
  updated_at: string
}

export interface Submission {
  id: string
  assignment_id: string
  student_id: string
  content?: string
  file_url?: string
  submitted_at: string
  score?: number
  feedback?: string
  graded_at?: string
  graded_by?: string
}

export interface Quiz {
  id: string
  lesson_id: string
  title: string
  description?: string
  time_limit?: number
  max_attempts: number
  passing_score: number
  show_correct_answers: boolean
  created_at: string
  updated_at: string
}

export interface QuizQuestion {
  id: string
  quiz_id: string
  question: string
  type: QuestionType
  options?: string[]
  correct_answer: string
  points: number
  order: number
  created_at: string
}

export interface QuizAttempt {
  id: string
  quiz_id: string
  student_id: string
  started_at: string
  completed_at?: string
  score?: number
  answers: Record<string, string>
  attempt_number: number
}

export interface Discussion {
  id: string
  course_id: string
  user_id: string
  title: string
  content: string
  created_at: string
  updated_at: string
}

export interface DiscussionReply {
  id: string
  discussion_id: string
  user_id: string
  content: string
  created_at: string
  updated_at: string
}

export interface Announcement {
  id: string
  course_id: string
  teacher_id: string
  title: string
  content: string
  created_at: string
  updated_at: string
}
