'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { BookOpen, Lock, User } from 'lucide-react';

const loginSchema = z.object({
  identity_number: z.string().min(1, 'Nomor induk tidak boleh kosong'),
  password: z.string().min(6, 'Password minimal 6 karakter'),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    try {
      setLoading(true);
      setError('');

      // First, get user profile by identity_number
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id, email')
        .eq('identity_number', data.identity_number)
        .single();

      if (profileError || !profile) {
        throw new Error('Nomor induk tidak ditemukan');
      }

      if (!profile.email) {
        throw new Error('Email tidak terdaftar. Hubungi admin.');
      }

      // Then sign in with email and password
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: profile.email,
        password: data.password,
      });

      if (authError) throw authError;

      // Redirect to dashboard
      router.push('/dashboard');
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Login gagal');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8 shadow-2xl">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 text-white mb-4">
            <BookOpen className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">LMS Fathus Salafi</h1>
          <p className="text-gray-600">Masuk ke sistem pembelajaran</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="identity_number" className="text-sm font-medium text-gray-700">
              Nomor Induk (NIS/NIP/NISN)
            </Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                id="identity_number"
                type="text"
                placeholder="Masukkan nomor induk"
                className="pl-10"
                {...register('identity_number')}
                disabled={loading}
              />
            </div>
            {errors.identity_number && (
              <p className="text-sm text-red-600">{errors.identity_number.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-medium text-gray-700">
              Password
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                id="password"
                type="password"
                placeholder="Masukkan password"
                className="pl-10"
                {...register('password')}
                disabled={loading}
              />
            </div>
            {errors.password && (
              <p className="text-sm text-red-600">{errors.password.message}</p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-3 rounded-lg font-semibold shadow-lg transition-all"
            disabled={loading}
          >
            {loading ? 'Memproses...' : 'Masuk'}
          </Button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-600">
          <p>Lupa password? Hubungi administrator</p>
        </div>
      </Card>
    </div>
  );
}
