'use client';

import { useState } from 'react';
import { User, Mail, Phone, Lock, Bell, Globe, Save } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';

export default function SettingsPage() {
  const { profile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'notifications'>('profile');

  const [formData, setFormData] = useState({
    full_name: profile?.full_name || '',
    phone: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    courseUpdates: true,
    assignmentReminders: true,
    discussionReplies: true,
  });

  const handleSaveProfile = async () => {
    setLoading(true);
    try {
      const { data: user } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: formData.full_name,
          phone: formData.phone,
        })
        .eq('id', user.user?.id);

      if (error) throw error;
      alert('Profil berhasil diperbarui!');
    } catch (error: any) {
      console.error('Error updating profile:', error);
      alert(error.message || 'Gagal memperbarui profil');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (formData.newPassword !== formData.confirmPassword) {
      alert('Password baru tidak cocok!');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: formData.newPassword
      });

      if (error) throw error;
      
      alert('Password berhasil diubah!');
      setFormData({ ...formData, currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error: any) {
      console.error('Error changing password:', error);
      alert(error.message || 'Gagal mengubah password');
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'profile' as const, label: 'Profil', icon: User },
    { id: 'security' as const, label: 'Keamanan', icon: Lock },
    { id: 'notifications' as const, label: 'Notifikasi', icon: Bell },
  ];

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Pengaturan</h1>
        <p className="text-gray-600 mt-1">Kelola preferensi dan informasi akun Anda</p>
      </div>

      <div className="bg-white rounded-lg shadow">
        {/* Tabs */}
        <div className="border-b border-gray-200">
          <div className="flex">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-4 border-b-2 font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'profile' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Informasi Profil</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <User className="w-4 h-4 inline mr-2" />
                      Nama Lengkap
                    </label>
                    <input
                      type="text"
                      value={formData.full_name}
                      onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <Mail className="w-4 h-4 inline mr-2" />
                      Email
                    </label>
                    <input
                      type="email"
                      value={profile?.email || ''}
                      disabled
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100"
                    />
                    <p className="text-xs text-gray-500 mt-1">Email tidak dapat diubah</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <Phone className="w-4 h-4 inline mr-2" />
                      Nomor Telepon
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <Globe className="w-4 h-4 inline mr-2" />
                      Nomor Induk
                    </label>
                    <input
                      type="text"
                      value={profile?.identity_number || ''}
                      disabled
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100"
                    />
                    <p className="text-xs text-gray-500 mt-1">Nomor induk tidak dapat diubah</p>
                  </div>
                </div>

                <button
                  onClick={handleSaveProfile}
                  disabled={loading}
                  className="mt-6 flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  <Save className="w-5 h-5" />
                  {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
                </button>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Ubah Password</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Password Baru
                    </label>
                    <input
                      type="password"
                      value={formData.newPassword}
                      onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Minimal 6 karakter"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Konfirmasi Password Baru
                    </label>
                    <input
                      type="password"
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Ketik ulang password baru"
                    />
                  </div>
                </div>

                <button
                  onClick={handleChangePassword}
                  disabled={loading || !formData.newPassword || !formData.confirmPassword}
                  className="mt-6 flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  <Lock className="w-5 h-5" />
                  {loading ? 'Mengubah...' : 'Ubah Password'}
                </button>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Preferensi Notifikasi</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">Notifikasi Email</p>
                      <p className="text-sm text-gray-600">Terima notifikasi melalui email</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={notifications.emailNotifications}
                      onChange={(e) => setNotifications({ ...notifications, emailNotifications: e.target.checked })}
                      className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">Update Kursus</p>
                      <p className="text-sm text-gray-600">Notifikasi saat ada materi atau tugas baru</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={notifications.courseUpdates}
                      onChange={(e) => setNotifications({ ...notifications, courseUpdates: e.target.checked })}
                      className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">Pengingat Tugas</p>
                      <p className="text-sm text-gray-600">Reminder sebelum deadline tugas</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={notifications.assignmentReminders}
                      onChange={(e) => setNotifications({ ...notifications, assignmentReminders: e.target.checked })}
                      className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">Balasan Diskusi</p>
                      <p className="text-sm text-gray-600">Notifikasi saat ada yang membalas diskusi Anda</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={notifications.discussionReplies}
                      onChange={(e) => setNotifications({ ...notifications, discussionReplies: e.target.checked })}
                      className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                  </div>
                </div>

                <button className="mt-6 flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
                  <Save className="w-5 h-5" />
                  Simpan Preferensi
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
