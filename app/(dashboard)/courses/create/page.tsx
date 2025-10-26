'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { BookOpen, Image, FileText, Users } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';

interface School {
  id: string;
  name: string;
}

interface Subject {
  id: string;
  name: string;
}

export default function CreateCoursePage() {
  const router = useRouter();
  const { profile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [schools, setSchools] = useState<School[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    school_id: '',
    subject_id: '',
    grade_level: '',
    thumbnail_url: '',
    is_published: false,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [schoolsData, subjectsData] = await Promise.all([
        supabase.from('schools').select('id, name').order('name'),
        supabase.from('subjects').select('id, name').order('name'),
      ]);

      if (schoolsData.data) setSchools(schoolsData.data);
      if (subjectsData.data) setSubjects(subjectsData.data);
      
      // Auto-set school for Staff
      if (profile?.role === 'Staff' && profile.school_id) {
        setFormData(prev => ({ ...prev, school_id: profile.school_id! }));
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: user } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from('courses')
        .insert([{
          ...formData,
          teacher_id: user.user?.id,
          school_id: formData.school_id || null,
          subject_id: formData.subject_id || null,
        }])
        .select()
        .single();

      if (error) throw error;

      alert('Kursus berhasil dibuat!');
      router.push('/courses');
    } catch (error: any) {
      console.error('Error creating course:', error);
      alert(error.message || 'Gagal membuat kursus');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Buat Kursus Baru</h1>
        <p className="text-gray-600 mt-1">Lengkapi informasi kursus untuk mulai mengajar</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <BookOpen className="w-4 h-4 inline mr-2" />
            Judul Kursus *
          </label>
          <input
            type="text"
            required
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="Contoh: Matematika Kelas 5"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <FileText className="w-4 h-4 inline mr-2" />
            Deskripsi
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            rows={4}
            placeholder="Jelaskan tentang kursus ini..."
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sekolah {profile?.role === 'Admin' && '*'}
            </label>
            <select
              required={profile?.role === 'Admin'}
              disabled={profile?.role === 'Staff'}
              value={formData.school_id}
              onChange={(e) => setFormData({ ...formData, school_id: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
            >
              <option value="">Pilih Sekolah</option>
              {schools.map((school) => (
                <option key={school.id} value={school.id}>
                  {school.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mata Pelajaran
            </label>
            <select
              value={formData.subject_id}
              onChange={(e) => setFormData({ ...formData, subject_id: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Pilih Mata Pelajaran</option>
              {subjects.map((subject) => (
                <option key={subject.id} value={subject.id}>
                  {subject.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Users className="w-4 h-4 inline mr-2" />
            Tingkat Kelas
          </label>
          <select
            value={formData.grade_level}
            onChange={(e) => setFormData({ ...formData, grade_level: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Pilih Tingkat</option>
            <option value="1">Kelas 1</option>
            <option value="2">Kelas 2</option>
            <option value="3">Kelas 3</option>
            <option value="4">Kelas 4</option>
            <option value="5">Kelas 5</option>
            <option value="6">Kelas 6</option>
            <option value="7">Kelas 7</option>
            <option value="8">Kelas 8</option>
            <option value="9">Kelas 9</option>
            <option value="10">Kelas 10</option>
            <option value="11">Kelas 11</option>
            <option value="12">Kelas 12</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Image className="w-4 h-4 inline mr-2" />
            URL Thumbnail
          </label>
          <input
            type="url"
            value={formData.thumbnail_url}
            onChange={(e) => setFormData({ ...formData, thumbnail_url: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="https://example.com/image.jpg"
          />
          <p className="text-xs text-gray-500 mt-1">Opsional: Link gambar untuk cover kursus</p>
        </div>

        <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
          <input
            type="checkbox"
            id="is_published"
            checked={formData.is_published}
            onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <label htmlFor="is_published" className="text-sm font-medium text-gray-700">
            Publish kursus sekarang (siswa bisa langsung enroll)
          </label>
        </div>

        <div className="flex gap-3 pt-4 border-t">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex-1 px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Menyimpan...' : 'Buat Kursus'}
          </button>
        </div>
      </form>
    </div>
  );
}
