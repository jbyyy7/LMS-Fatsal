'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  BookOpen, 
  GraduationCap, 
  FileText, 
  MessageSquare, 
  Settings,
  ChevronDown,
  ChevronRight,
  Menu,
  X,
  Home,
  Users,
  BookMarked,
  ClipboardList
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SidebarProps {
  role?: 'admin' | 'staff' | 'teacher' | 'student';
}

interface MenuItem {
  title: string;
  icon: React.ReactNode;
  href?: string;
  children?: MenuItem[];
}

export function Sidebar({ role = 'student' }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState<string[]>(['courses']);
  const pathname = usePathname();

  const toggleMenu = (title: string) => {
    setExpandedMenus(prev =>
      prev.includes(title)
        ? prev.filter(item => item !== title)
        : [...prev, title]
    );
  };

  const menuItems: MenuItem[] = role === 'admin'
    ? [
        // SUPER ADMIN - Akses semua sekolah
        {
          title: 'Dashboard',
          icon: <LayoutDashboard className="w-5 h-5" />,
          href: '/dashboard',
        },
        {
          title: 'Manajemen Sekolah',
          icon: <Users className="w-5 h-5" />,
          children: [
            { title: 'Semua Sekolah', icon: <BookMarked className="w-4 h-4" />, href: '/admin/schools' },
            { title: 'Staff Sekolah', icon: <Users className="w-4 h-4" />, href: '/admin/staff' },
          ],
        },
        {
          title: 'Kursus Global',
          icon: <BookOpen className="w-5 h-5" />,
          children: [
            { title: 'Semua Kursus', icon: <BookMarked className="w-4 h-4" />, href: '/courses' },
            { title: 'Buat Kursus', icon: <FileText className="w-4 h-4" />, href: '/courses/create' },
          ],
        },
        {
          title: 'Laporan',
          icon: <ClipboardList className="w-5 h-5" />,
          href: '/admin/reports',
        },
        {
          title: 'Pengaturan',
          icon: <Settings className="w-5 h-5" />,
          href: '/settings',
        },
      ]
    : role === 'staff'
    ? [
        // STAFF - Admin 1 sekolah
        {
          title: 'Dashboard',
          icon: <LayoutDashboard className="w-5 h-5" />,
          href: '/dashboard',
        },
        {
          title: 'Manajemen Kursus',
          icon: <BookOpen className="w-5 h-5" />,
          children: [
            { title: 'Semua Kursus', icon: <BookMarked className="w-4 h-4" />, href: '/courses' },
            { title: 'Buat Kursus', icon: <FileText className="w-4 h-4" />, href: '/courses/create' },
          ],
        },
        {
          title: 'Guru & Siswa',
          icon: <Users className="w-5 h-5" />,
          children: [
            { title: 'Daftar Guru', icon: <Users className="w-4 h-4" />, href: '/staff/teachers' },
            { title: 'Daftar Siswa', icon: <Users className="w-4 h-4" />, href: '/staff/students' },
          ],
        },
        {
          title: 'Laporan Sekolah',
          icon: <ClipboardList className="w-5 h-5" />,
          href: '/staff/reports',
        },
        {
          title: 'Pengaturan',
          icon: <Settings className="w-5 h-5" />,
          href: '/settings',
        },
      ]
    : role === 'teacher' 
    ? [
        // GURU
        {
          title: 'Dashboard',
          icon: <LayoutDashboard className="w-5 h-5" />,
          href: '/dashboard',
        },
        {
          title: 'Kursus Saya',
          icon: <BookOpen className="w-5 h-5" />,
          children: [
            { title: 'Semua Kursus', icon: <BookMarked className="w-4 h-4" />, href: '/courses' },
            { title: 'Buat Kursus', icon: <FileText className="w-4 h-4" />, href: '/courses/create' },
          ],
        },
        {
          title: 'Siswa',
          icon: <Users className="w-5 h-5" />,
          href: '/students',
        },
        {
          title: 'Tugas',
          icon: <ClipboardList className="w-5 h-5" />,
          href: '/assignments',
        },
        {
          title: 'Diskusi',
          icon: <MessageSquare className="w-5 h-5" />,
          href: '/discussions',
        },
        {
          title: 'Pengaturan',
          icon: <Settings className="w-5 h-5" />,
          href: '/settings',
        },
      ]
    : [
        // STUDENT
        {
          title: 'Dashboard',
          icon: <Home className="w-5 h-5" />,
          href: '/dashboard',
        },
        {
          title: 'Kursus Saya',
          icon: <BookOpen className="w-5 h-5" />,
          href: '/courses',
        },
        {
          title: 'Pembelajaran',
          icon: <GraduationCap className="w-5 h-5" />,
          children: [
            { title: 'Materi', icon: <BookMarked className="w-4 h-4" />, href: '/lessons' },
            { title: 'Tugas', icon: <FileText className="w-4 h-4" />, href: '/assignments' },
            { title: 'Kuis', icon: <ClipboardList className="w-4 h-4" />, href: '/quizzes' },
          ],
        },
        {
          title: 'Diskusi',
          icon: <MessageSquare className="w-5 h-5" />,
          href: '/discussions',
        },
        {
          title: 'Pengaturan',
          icon: <Settings className="w-5 h-5" />,
          href: '/settings',
        },
      ];

  const renderMenuItem = (item: MenuItem, level = 0) => {
    const isExpanded = expandedMenus.includes(item.title);
    const isActive = item.href ? pathname === item.href : false;

    if (item.children) {
      return (
        <div key={item.title}>
          <button
            onClick={() => toggleMenu(item.title)}
            className={cn(
              'w-full flex items-center justify-between px-4 py-3 rounded-lg transition-colors',
              'hover:bg-blue-50 dark:hover:bg-gray-800',
              isActive && 'bg-blue-50 dark:bg-gray-800 text-blue-600'
            )}
          >
            <div className="flex items-center gap-3">
              {item.icon}
              {!collapsed && <span className="font-medium">{item.title}</span>}
            </div>
            {!collapsed && (
              isExpanded 
                ? <ChevronDown className="w-4 h-4" />
                : <ChevronRight className="w-4 h-4" />
            )}
          </button>
          
          {isExpanded && !collapsed && (
            <div className="ml-4 mt-1 space-y-1">
              {item.children.map(child => renderMenuItem(child, level + 1))}
            </div>
          )}
        </div>
      );
    }

    return (
      <Link
        key={item.title}
        href={item.href || '#'}
        className={cn(
          'flex items-center gap-3 px-4 py-3 rounded-lg transition-all',
          'hover:bg-blue-50 dark:hover:bg-gray-800',
          isActive 
            ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg' 
            : 'text-gray-700 dark:text-gray-300',
          level > 0 && 'text-sm'
        )}
      >
        {item.icon}
        {!collapsed && <span className="font-medium">{item.title}</span>}
      </Link>
    );
  };

  return (
    <>
      {/* Mobile Toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-white shadow-lg"
      >
        {collapsed ? <Menu className="w-6 h-6" /> : <X className="w-6 h-6" />}
      </button>

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-0 h-full bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 transition-all duration-300 z-40',
          collapsed ? 'w-20' : 'w-64',
          'lg:translate-x-0',
          collapsed && 'max-lg:-translate-x-full'
        )}
      >
        {/* Logo */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white font-bold">
              {collapsed ? 'L' : 'LMS'}
            </div>
            {!collapsed && <span className="font-bold text-lg">LMS Fatsal</span>}
          </div>
          
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden lg:block p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
          >
            {collapsed ? <ChevronRight className="w-5 h-5" /> : <X className="w-5 h-5" />}
          </button>
        </div>

        {/* Menu Items */}
        <nav className="p-4 space-y-2 overflow-y-auto h-[calc(100vh-80px)]">
          {menuItems.map(item => renderMenuItem(item))}
        </nav>
      </aside>

      {/* Overlay for mobile */}
      {!collapsed && (
        <div
          onClick={() => setCollapsed(true)}
          className="lg:hidden fixed inset-0 bg-black/50 z-30"
        />
      )}
    </>
  );
}
