'use client';

import { Card } from '@/components/ui/card';
import { BookOpen } from 'lucide-react';

export default function AdminSchoolsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Manajemen Sekolah</h1>
      </div>

      <Card className="p-12 text-center">
        <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-700 mb-2">Daftar Sekolah</h2>
        <p className="text-gray-500">Fitur ini sedang dalam pengembangan</p>
        <p className="text-sm text-gray-400 mt-2">Super Admin dapat melihat dan mengelola semua sekolah</p>
      </Card>
    </div>
  );
}
