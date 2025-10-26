export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-gray-50 border-t mt-auto">
      <div className="container mx-auto px-4 py-6">
        <div className="text-center text-sm text-gray-600">
          <p>
            © {currentYear} Yayasan Fathus Salafi. All rights reserved.
          </p>
          <p className="mt-1">
            Learning Management System - Empowering Education
          </p>
        </div>
      </div>
    </footer>
  )
}
