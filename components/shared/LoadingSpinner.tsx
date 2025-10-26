import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface LoadingSpinnerProps {
  className?: string
  text?: string
}

export function LoadingSpinner({ className, text = 'Memuat data...' }: LoadingSpinnerProps) {
  return (
    <div className={cn('flex items-center justify-center py-8', className)}>
      <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
      <span className="ml-2 text-gray-600">{text}</span>
    </div>
  )
}
