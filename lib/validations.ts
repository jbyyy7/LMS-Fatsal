import { z } from 'zod'

// Auth schemas
export const loginSchema = z.object({
  email: z.string().email('Email tidak valid'),
  password: z.string().min(6, 'Password minimal 6 karakter'),
})

// Course schemas
export const courseSchema = z.object({
  title: z.string().min(3, 'Judul minimal 3 karakter'),
  description: z.string().optional(),
  subject_id: z.string().uuid('Subject ID tidak valid'),
  class_ids: z.array(z.string().uuid()).min(1, 'Pilih minimal 1 kelas'),
  thumbnail_url: z.string().url().optional(),
  is_published: z.boolean().default(false),
})

// Module schemas
export const moduleSchema = z.object({
  course_id: z.string().uuid('Course ID tidak valid'),
  title: z.string().min(3, 'Judul minimal 3 karakter'),
  description: z.string().optional(),
  order: z.number().int().min(1),
})

// Lesson schemas
export const lessonSchema = z.object({
  module_id: z.string().uuid('Module ID tidak valid'),
  title: z.string().min(3, 'Judul minimal 3 karakter'),
  type: z.enum(['video', 'document', 'text', 'quiz', 'assignment']),
  content: z.string().optional(),
  video_url: z.string().url().optional(),
  document_url: z.string().url().optional(),
  duration: z.number().int().min(0).optional(),
  order: z.number().int().min(1),
  is_preview: z.boolean().default(false),
})

// Assignment schemas
export const assignmentSchema = z.object({
  lesson_id: z.string().uuid('Lesson ID tidak valid'),
  title: z.string().min(3, 'Judul minimal 3 karakter'),
  description: z.string(),
  due_date: z.string().datetime(),
  max_score: z.number().int().min(1).max(100),
  allow_late_submission: z.boolean().default(false),
})

export const submissionSchema = z.object({
  assignment_id: z.string().uuid('Assignment ID tidak valid'),
  content: z.string().optional(),
  file_url: z.string().url().optional(),
})

// Quiz schemas
export const quizSchema = z.object({
  lesson_id: z.string().uuid('Lesson ID tidak valid'),
  title: z.string().min(3, 'Judul minimal 3 karakter'),
  description: z.string().optional(),
  time_limit: z.number().int().min(1).optional(),
  max_attempts: z.number().int().min(1).default(1),
  passing_score: z.number().int().min(0).max(100).default(70),
  show_correct_answers: z.boolean().default(true),
})

export const quizQuestionSchema = z.object({
  quiz_id: z.string().uuid('Quiz ID tidak valid'),
  question: z.string().min(5, 'Pertanyaan minimal 5 karakter'),
  type: z.enum(['multiple_choice', 'true_false', 'short_answer']),
  options: z.array(z.string()).optional(),
  correct_answer: z.string(),
  points: z.number().int().min(1).default(1),
  order: z.number().int().min(1),
})

// Discussion schemas
export const discussionSchema = z.object({
  course_id: z.string().uuid('Course ID tidak valid'),
  title: z.string().min(3, 'Judul minimal 3 karakter'),
  content: z.string().min(10, 'Konten minimal 10 karakter'),
})

export const discussionReplySchema = z.object({
  discussion_id: z.string().uuid('Discussion ID tidak valid'),
  content: z.string().min(5, 'Konten minimal 5 karakter'),
})
