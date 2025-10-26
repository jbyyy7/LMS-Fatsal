'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { 
  BookOpen, 
  GraduationCap, 
  Home, 
  LogOut, 
  User,
  Menu,
  X 
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useState } from 'react'
import { getInitials } from '@/lib/utils'
import toast from 'react-hot-toast'

export function Navbar() {
  const { user, signOut } = useAuth()
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleSignOut = async () => {
    try {
      await signOut()
      toast.success('Berhasil logout')
    } catch (error) {
      toast.error('Gagal logout')
    }
  }

  return (
    <nav className="bg-white shadow-md border-b sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-8">
            <Link href="/dashboard" className="flex items-center space-x-2">
              <BookOpen className="h-8 w-8 text-primary-500" />
              <span className="text-xl font-bold font-heading">LMS Fatsal</span>
            </Link>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex space-x-1">
              <Link 
                href={process.env.NEXT_PUBLIC_WEBSITE_URL || 'https://yayasan-fatsal.com'}
                className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-primary-500 hover:bg-gray-100"
                target="_blank"
              >
                Website
              </Link>
              <Link 
                href={process.env.NEXT_PUBLIC_SIAKAD_URL || 'https://siakad.yayasan-fatsal.com'}
                className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-primary-500 hover:bg-gray-100"
                target="_blank"
              >
                SIAKAD
              </Link>
              <Link 
                href="/dashboard"
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  pathname?.startsWith('/dashboard')
                    ? 'text-primary-500 bg-primary-50'
                    : 'text-gray-700 hover:text-primary-500 hover:bg-gray-100'
                }`}
              >
                Dashboard
              </Link>
            </div>
          </div>
          
          {/* User Menu */}
          {user && (
            <div className="hidden md:flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="flex items-center justify-center h-10 w-10 rounded-full bg-primary-500 text-white font-medium">
                  {user.avatar_url ? (
                    <img 
                      src={user.avatar_url} 
                      alt={user.full_name} 
                      className="h-10 w-10 rounded-full"
                    />
                  ) : (
                    getInitials(user.full_name)
                  )}
                </div>
                <div className="text-sm">
                  <p className="font-medium text-gray-900">{user.full_name}</p>
                  <p className="text-gray-500">{user.role}</p>
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={handleSignOut}
                title="Logout"
              >
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          )}

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 rounded-md text-gray-700 hover:text-primary-500 hover:bg-gray-100"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden pb-4 space-y-2">
            <Link 
              href={process.env.NEXT_PUBLIC_WEBSITE_URL || 'https://yayasan-fatsal.com'}
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary-500 hover:bg-gray-100"
              target="_blank"
            >
              Website
            </Link>
            <Link 
              href={process.env.NEXT_PUBLIC_SIAKAD_URL || 'https://siakad.yayasan-fatsal.com'}
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary-500 hover:bg-gray-100"
              target="_blank"
            >
              SIAKAD
            </Link>
            <Link 
              href="/dashboard"
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary-500 hover:bg-gray-100"
            >
              Dashboard
            </Link>
            {user && (
              <>
                <div className="px-3 py-2 border-t">
                  <p className="font-medium text-gray-900">{user.full_name}</p>
                  <p className="text-sm text-gray-500">{user.role}</p>
                </div>
                <button
                  onClick={handleSignOut}
                  className="w-full text-left px-3 py-2 rounded-md text-base font-medium text-red-600 hover:bg-red-50"
                >
                  Logout
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  )
}
