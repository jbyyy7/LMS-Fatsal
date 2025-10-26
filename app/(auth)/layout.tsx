import { BookOpen } from 'lucide-react'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-white p-3 rounded-full shadow-md">
              <BookOpen className="h-12 w-12 text-primary-500" />
            </div>
          </div>
          <h1 className="text-3xl font-bold font-heading text-gray-900 mb-2">
            LMS Fatsal
          </h1>
          <p className="text-gray-600">
            Learning Management System
          </p>
        </div>
        {children}
      </div>
    </div>
  )
}
