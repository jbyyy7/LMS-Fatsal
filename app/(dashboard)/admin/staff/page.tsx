'use client';

import { useState, useEffect } from 'react';
import { Users, Plus, Edit, Trash2, School, Mail, Phone } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface Staff {
  id: string;
  full_name: string;
  email: string;
  identity_number: string;
  phone: string | null;
  role: string;
  school_id: string | null;
  school?: {
    name: string;
  };
}

interface School {
  id: string;
  name: string;
}

export default function AdminStaffPage() {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [schools, setSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);

  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    identity_number: '',
    phone: '',
    school_id: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [staffData, schoolsData] = await Promise.all([
        supabase
          .from('profiles')
          .select(`
            *,
            school:schools(name)
          `)
          .eq('role', 'Staff')
          .order('full_name'),
        supabase
          .from('schools')
          .select('id, name')
          .order('name')
      ]);

      if (staffData.error) throw staffData.error;
      if (schoolsData.error) throw schoolsData.error;

      setStaff(staffData.data || []);
      setSchools(schoolsData.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingStaff) {
        const { error } = await supabase
          .from('profiles')
          .update({
            full_name: formData.full_name,
            phone: formData.phone,
            school_id: formData.school_id || null,
          })
          .eq('id', editingStaff.id);

        if (error) throw error;
      } else {
        // Create new staff via Supabase Auth
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: formData.email,
          password: 'TempPassword123!', // Should be changed on first login
          options: {
            data: {
              full_name: formData.full_name,
              identity_number: formData.identity_number,
              phone: formData.phone,
              role: 'Staff',
              school_id: formData.school_id || null,
            }
          }
        });

        if (authError) throw authError;

        // Update profile dengan school_id
        if (authData.user) {
          await supabase
            .from('profiles')
            .update({ school_id: formData.school_id || null })
            .eq('id', authData.user.id);
        }
      }

      setFormData({ full_name: '', email: '', identity_number: '', phone: '', school_id: '' });
      setEditingStaff(null);
      setShowModal(false);
      fetchData();
    } catch (error: any) {
      console.error('Error saving staff:', error);
      alert(error.message || 'Gagal menyimpan data staff');
    }
  };

  const handleEdit = (staffMember: Staff) => {
    setEditingStaff(staffMember);
    setFormData({
      full_name: staffMember.full_name,
      email: staffMember.email,
      identity_number: staffMember.identity_number,
      phone: staffMember.phone || '',
      school_id: staffMember.school_id || '',
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Yakin ingin menghapus staff ini?')) return;

    try {
      const { error } = await supabase.auth.admin.deleteUser(id);
      if (error) throw error;
      fetchData();
    } catch (error) {
      console.error('Error deleting staff:', error);
      alert('Gagal menghapus staff');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manajemen Staff Sekolah</h1>
          <p className="text-gray-600 mt-1">Kelola admin untuk setiap sekolah</p>
        </div>
        <button
          onClick={() => {
            setEditingStaff(null);
            setFormData({ full_name: '', email: '', identity_number: '', phone: '', school_id: '' });
            setShowModal(true);
          }}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-5 h-5" />
          Tambah Staff
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nama</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sekolah</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kontak</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Aksi</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {staff.map((member) => (
              <tr key={member.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                      <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <Users className="h-5 w-5 text-blue-600" />
                      </div>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">{member.full_name}</div>
                      <div className="text-sm text-gray-500">{member.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">{member.identity_number}</td>
                <td className="px-6 py-4">
                  {member.school ? (
                    <div className="flex items-center gap-2 text-sm">
                      <School className="w-4 h-4 text-gray-400" />
                      <span>{member.school.name}</span>
                    </div>
                  ) : (
                    <span className="text-sm text-gray-400">Belum ditentukan</span>
                  )}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {member.phone || '-'}
                </td>
                <td className="px-6 py-4 text-right text-sm font-medium">
                  <button
                    onClick={() => handleEdit(member)}
                    className="text-blue-600 hover:text-blue-900 mr-4"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(member.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {staff.length === 0 && (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Belum ada staff</h3>
            <p className="text-gray-600">Mulai dengan menambahkan staff pertama</p>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">
              {editingStaff ? 'Edit Staff' : 'Tambah Staff'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nama Lengkap *
                </label>
                <input
                  type="text"
                  required
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              {!editingStaff && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email *
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nomor Induk *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.identity_number}
                      onChange={(e) => setFormData({ ...formData, identity_number: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="STAFF001"
                    />
                  </div>
                </>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Telepon
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sekolah *
                </label>
                <select
                  required
                  value={formData.school_id}
                  onChange={(e) => setFormData({ ...formData, school_id: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Pilih Sekolah</option>
                  {schools.map((school) => (
                    <option key={school.id} value={school.id}>
                      {school.name}
                    </option>
                  ))}
                </select>
              </div>
              {!editingStaff && (
                <p className="text-xs text-gray-500">
                  Password default: <strong>TempPassword123!</strong> (harus diganti saat login pertama)
                </p>
              )}
              <div className="flex gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingStaff(null);
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {editingStaff ? 'Update' : 'Simpan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
