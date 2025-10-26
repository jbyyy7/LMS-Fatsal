-- ============================================
-- LMS TABLES FOR YAYASAN FATHUS SALAFI
-- ============================================
-- This migration creates tables for the Learning Management System
-- IMPORTANT: This shares authentication with SIAKAD using profiles table
-- 
-- Tables created:
-- - courses
-- - modules
-- - lessons
-- - enrollments
-- - lesson_progress
-- - assignments
-- - submissions
-- - quizzes
-- - quiz_questions
-- - quiz_attempts
-- - discussions
-- - discussion_replies
-- - course_announcements
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- COURSES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS courses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  teacher_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  class_ids UUID[] NOT NULL DEFAULT '{}',
  thumbnail_url TEXT,
  is_published BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_courses_subject_id ON courses(subject_id);
CREATE INDEX IF NOT EXISTS idx_courses_teacher_id ON courses(teacher_id);
CREATE INDEX IF NOT EXISTS idx_courses_is_published ON courses(is_published);

-- RLS Policies
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view published courses" 
  ON courses FOR SELECT 
  USING (auth.uid() IS NOT NULL AND (is_published = true OR teacher_id = auth.uid()));

CREATE POLICY "Teachers can create courses" 
  ON courses FOR INSERT 
  WITH CHECK (auth.uid() = teacher_id);

CREATE POLICY "Teachers can update own courses" 
  ON courses FOR UPDATE 
  USING (auth.uid() = teacher_id);

CREATE POLICY "Teachers can delete own courses" 
  ON courses FOR DELETE 
  USING (auth.uid() = teacher_id);

-- ============================================
-- MODULES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS modules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  "order" INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(course_id, "order")
);

CREATE INDEX idx_modules_course_id ON modules(course_id);

-- RLS Policies
ALTER TABLE modules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view modules of accessible courses" 
  ON modules FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM courses 
      WHERE courses.id = modules.course_id 
      AND (courses.is_published = true OR courses.teacher_id = auth.uid())
    )
  );

CREATE POLICY "Teachers can manage modules in own courses" 
  ON modules FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM courses 
      WHERE courses.id = modules.course_id 
      AND courses.teacher_id = auth.uid()
    )
  );

-- ============================================
-- LESSONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS lessons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  module_id UUID NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('video', 'document', 'text', 'quiz', 'assignment')),
  content TEXT,
  video_url TEXT,
  document_url TEXT,
  duration INTEGER DEFAULT 0,
  "order" INTEGER NOT NULL DEFAULT 1,
  is_preview BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(module_id, "order")
);

CREATE INDEX idx_lessons_module_id ON lessons(module_id);
CREATE INDEX idx_lessons_type ON lessons(type);

-- RLS Policies
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view lessons of accessible modules" 
  ON lessons FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM modules m
      JOIN courses c ON c.id = m.course_id
      WHERE m.id = lessons.module_id 
      AND (c.is_published = true OR c.teacher_id = auth.uid() OR is_preview = true)
    )
  );

CREATE POLICY "Teachers can manage lessons in own courses" 
  ON lessons FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM modules m
      JOIN courses c ON c.id = m.course_id
      WHERE m.id = lessons.module_id 
      AND c.teacher_id = auth.uid()
    )
  );

-- ============================================
-- ENROLLMENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS enrollments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  progress DECIMAL(5, 2) DEFAULT 0,
  
  UNIQUE(course_id, student_id)
);

CREATE INDEX idx_enrollments_course_id ON enrollments(course_id);
CREATE INDEX idx_enrollments_student_id ON enrollments(student_id);

-- RLS Policies
ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can view own enrollments" 
  ON enrollments FOR SELECT 
  USING (auth.uid() = student_id);

CREATE POLICY "Teachers can view enrollments in own courses" 
  ON enrollments FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM courses 
      WHERE courses.id = enrollments.course_id 
      AND courses.teacher_id = auth.uid()
    )
  );

CREATE POLICY "Students can enroll in published courses" 
  ON enrollments FOR INSERT 
  WITH CHECK (
    auth.uid() = student_id 
    AND EXISTS (
      SELECT 1 FROM courses 
      WHERE courses.id = enrollments.course_id 
      AND courses.is_published = true
    )
  );

-- ============================================
-- LESSON PROGRESS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS lesson_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  enrollment_id UUID NOT NULL REFERENCES enrollments(id) ON DELETE CASCADE,
  lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMP WITH TIME ZONE,
  time_spent INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(enrollment_id, lesson_id)
);

CREATE INDEX idx_lesson_progress_enrollment_id ON lesson_progress(enrollment_id);
CREATE INDEX idx_lesson_progress_lesson_id ON lesson_progress(lesson_id);

-- RLS Policies
ALTER TABLE lesson_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can view and update own progress" 
  ON lesson_progress FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM enrollments 
      WHERE enrollments.id = lesson_progress.enrollment_id 
      AND enrollments.student_id = auth.uid()
    )
  );

CREATE POLICY "Teachers can view progress in own courses" 
  ON lesson_progress FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM enrollments e
      JOIN courses c ON c.id = e.course_id
      WHERE e.id = lesson_progress.enrollment_id 
      AND c.teacher_id = auth.uid()
    )
  );

-- ============================================
-- ASSIGNMENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  due_date TIMESTAMP WITH TIME ZONE NOT NULL,
  max_score INTEGER NOT NULL DEFAULT 100,
  allow_late_submission BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_assignments_lesson_id ON assignments(lesson_id);

-- RLS Policies
ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view assignments in accessible lessons" 
  ON assignments FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM lessons l
      JOIN modules m ON m.id = l.module_id
      JOIN courses c ON c.id = m.course_id
      WHERE l.id = assignments.lesson_id 
      AND (c.is_published = true OR c.teacher_id = auth.uid())
    )
  );

CREATE POLICY "Teachers can manage assignments in own courses" 
  ON assignments FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM lessons l
      JOIN modules m ON m.id = l.module_id
      JOIN courses c ON c.id = m.course_id
      WHERE l.id = assignments.lesson_id 
      AND c.teacher_id = auth.uid()
    )
  );

-- ============================================
-- SUBMISSIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  assignment_id UUID NOT NULL REFERENCES assignments(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT,
  file_url TEXT,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  score INTEGER,
  feedback TEXT,
  graded_at TIMESTAMP WITH TIME ZONE,
  graded_by UUID REFERENCES profiles(id),
  
  UNIQUE(assignment_id, student_id)
);

CREATE INDEX idx_submissions_assignment_id ON submissions(assignment_id);
CREATE INDEX idx_submissions_student_id ON submissions(student_id);

-- RLS Policies
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can view and submit own submissions" 
  ON submissions FOR ALL
  USING (auth.uid() = student_id);

CREATE POLICY "Teachers can view and grade submissions in own courses" 
  ON submissions FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM assignments a
      JOIN lessons l ON l.id = a.lesson_id
      JOIN modules m ON m.id = l.module_id
      JOIN courses c ON c.id = m.course_id
      WHERE a.id = submissions.assignment_id 
      AND c.teacher_id = auth.uid()
    )
  );

-- ============================================
-- QUIZZES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS quizzes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  time_limit INTEGER,
  max_attempts INTEGER DEFAULT 1,
  passing_score INTEGER DEFAULT 70,
  show_correct_answers BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_quizzes_lesson_id ON quizzes(lesson_id);

-- RLS Policies
ALTER TABLE quizzes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view quizzes in accessible lessons" 
  ON quizzes FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM lessons l
      JOIN modules m ON m.id = l.module_id
      JOIN courses c ON c.id = m.course_id
      WHERE l.id = quizzes.lesson_id 
      AND (c.is_published = true OR c.teacher_id = auth.uid())
    )
  );

CREATE POLICY "Teachers can manage quizzes in own courses" 
  ON quizzes FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM lessons l
      JOIN modules m ON m.id = l.module_id
      JOIN courses c ON c.id = m.course_id
      WHERE l.id = quizzes.lesson_id 
      AND c.teacher_id = auth.uid()
    )
  );

-- ============================================
-- QUIZ QUESTIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS quiz_questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  quiz_id UUID NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('multiple_choice', 'true_false', 'short_answer')),
  options TEXT[],
  correct_answer TEXT NOT NULL,
  points INTEGER DEFAULT 1,
  "order" INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(quiz_id, "order")
);

CREATE INDEX idx_quiz_questions_quiz_id ON quiz_questions(quiz_id);

-- RLS Policies
ALTER TABLE quiz_questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view questions in accessible quizzes" 
  ON quiz_questions FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM quizzes q
      JOIN lessons l ON l.id = q.lesson_id
      JOIN modules m ON m.id = l.module_id
      JOIN courses c ON c.id = m.course_id
      WHERE q.id = quiz_questions.quiz_id 
      AND (c.is_published = true OR c.teacher_id = auth.uid())
    )
  );

CREATE POLICY "Teachers can manage questions in own courses" 
  ON quiz_questions FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM quizzes q
      JOIN lessons l ON l.id = q.lesson_id
      JOIN modules m ON m.id = l.module_id
      JOIN courses c ON c.id = m.course_id
      WHERE q.id = quiz_questions.quiz_id 
      AND c.teacher_id = auth.uid()
    )
  );

-- ============================================
-- QUIZ ATTEMPTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS quiz_attempts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  quiz_id UUID NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  score INTEGER,
  answers JSONB DEFAULT '{}',
  attempt_number INTEGER NOT NULL DEFAULT 1
);

CREATE INDEX idx_quiz_attempts_quiz_id ON quiz_attempts(quiz_id);
CREATE INDEX idx_quiz_attempts_student_id ON quiz_attempts(student_id);

-- RLS Policies
ALTER TABLE quiz_attempts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can view and create own attempts" 
  ON quiz_attempts FOR ALL
  USING (auth.uid() = student_id);

CREATE POLICY "Teachers can view attempts in own courses" 
  ON quiz_attempts FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM quizzes q
      JOIN lessons l ON l.id = q.lesson_id
      JOIN modules m ON m.id = l.module_id
      JOIN courses c ON c.id = m.course_id
      WHERE q.id = quiz_attempts.quiz_id 
      AND c.teacher_id = auth.uid()
    )
  );

-- ============================================
-- DISCUSSIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS discussions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_discussions_course_id ON discussions(course_id);
CREATE INDEX idx_discussions_user_id ON discussions(user_id);

-- RLS Policies
ALTER TABLE discussions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view discussions in enrolled courses" 
  ON discussions FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM courses c
      WHERE c.id = discussions.course_id 
      AND (
        c.teacher_id = auth.uid() 
        OR EXISTS (
          SELECT 1 FROM enrollments e 
          WHERE e.course_id = c.id 
          AND e.student_id = auth.uid()
        )
      )
    )
  );

CREATE POLICY "Enrolled users can create discussions" 
  ON discussions FOR INSERT 
  WITH CHECK (
    auth.uid() = user_id 
    AND EXISTS (
      SELECT 1 FROM courses c
      WHERE c.id = discussions.course_id 
      AND (
        c.teacher_id = auth.uid() 
        OR EXISTS (
          SELECT 1 FROM enrollments e 
          WHERE e.course_id = c.id 
          AND e.student_id = auth.uid()
        )
      )
    )
  );

CREATE POLICY "Users can update own discussions" 
  ON discussions FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own discussions" 
  ON discussions FOR DELETE 
  USING (auth.uid() = user_id);

-- ============================================
-- DISCUSSION REPLIES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS discussion_replies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  discussion_id UUID NOT NULL REFERENCES discussions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_discussion_replies_discussion_id ON discussion_replies(discussion_id);
CREATE INDEX idx_discussion_replies_user_id ON discussion_replies(user_id);

-- RLS Policies
ALTER TABLE discussion_replies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view replies in accessible discussions" 
  ON discussion_replies FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM discussions d
      JOIN courses c ON c.id = d.course_id
      WHERE d.id = discussion_replies.discussion_id 
      AND (
        c.teacher_id = auth.uid() 
        OR EXISTS (
          SELECT 1 FROM enrollments e 
          WHERE e.course_id = c.id 
          AND e.student_id = auth.uid()
        )
      )
    )
  );

CREATE POLICY "Users can create replies in accessible discussions" 
  ON discussion_replies FOR INSERT 
  WITH CHECK (
    auth.uid() = user_id 
    AND EXISTS (
      SELECT 1 FROM discussions d
      JOIN courses c ON c.id = d.course_id
      WHERE d.id = discussion_replies.discussion_id 
      AND (
        c.teacher_id = auth.uid() 
        OR EXISTS (
          SELECT 1 FROM enrollments e 
          WHERE e.course_id = c.id 
          AND e.student_id = auth.uid()
        )
      )
    )
  );

CREATE POLICY "Users can update own replies" 
  ON discussion_replies FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own replies" 
  ON discussion_replies FOR DELETE 
  USING (auth.uid() = user_id);

-- ============================================
-- COURSE ANNOUNCEMENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS course_announcements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  teacher_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_course_announcements_course_id ON course_announcements(course_id);
CREATE INDEX idx_course_announcements_teacher_id ON course_announcements(teacher_id);

-- RLS Policies
ALTER TABLE course_announcements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view announcements in enrolled courses" 
  ON course_announcements FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM courses c
      WHERE c.id = course_announcements.course_id 
      AND (
        c.teacher_id = auth.uid() 
        OR EXISTS (
          SELECT 1 FROM enrollments e 
          WHERE e.course_id = c.id 
          AND e.student_id = auth.uid()
        )
      )
    )
  );

CREATE POLICY "Teachers can manage announcements in own courses" 
  ON course_announcements FOR ALL
  USING (
    auth.uid() = teacher_id 
    AND EXISTS (
      SELECT 1 FROM courses 
      WHERE courses.id = course_announcements.course_id 
      AND courses.teacher_id = auth.uid()
    )
  );

-- ============================================
-- TRIGGERS FOR UPDATED_AT
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_courses_updated_at
  BEFORE UPDATE ON courses
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_modules_updated_at
  BEFORE UPDATE ON modules
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_lessons_updated_at
  BEFORE UPDATE ON lessons
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_lesson_progress_updated_at
  BEFORE UPDATE ON lesson_progress
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_assignments_updated_at
  BEFORE UPDATE ON assignments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_quizzes_updated_at
  BEFORE UPDATE ON quizzes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_discussions_updated_at
  BEFORE UPDATE ON discussions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_discussion_replies_updated_at
  BEFORE UPDATE ON discussion_replies
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_course_announcements_updated_at
  BEFORE UPDATE ON course_announcements
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- SUCCESS MESSAGE
-- ============================================
-- All LMS tables created successfully!
-- Remember to run this migration in your Supabase SQL Editor
-- Make sure the shared tables (profiles, schools, classes, subjects) exist first
