import { Star } from 'lucide-react'
import { cn } from '@/utils/cn'

interface StarRatingProps {
  value: number
  max?: number
  onChange?: (value: number) => void
  readonly?: boolean
  className?: string
}

export function StarRating({
  value,
  max = 5,
  onChange,
  readonly = false,
  className,
}: StarRatingProps) {
  return (
    <div className={cn('flex items-center gap-1', className)}>
      {Array.from({ length: max }, (_, i) => {
        const rating = i + 1
        const isFilled = rating <= value
        return (
          <button
            key={rating}
            type="button"
            disabled={readonly}
            onClick={() => onChange?.(rating)}
            className={cn(
              'p-0.5 rounded transition-colors',
              readonly && 'cursor-default',
              !readonly && 'hover:scale-110 cursor-pointer'
            )}
            aria-label={`Rate ${rating} stars`}
          >
            <Star
              className={cn(
                'h-6 w-6 transition-colors',
                isFilled
                  ? 'fill-amber-400 text-amber-400'
                  : 'fill-none text-gray-300'
              )}
            />
          </button>
        )
      })}
    </div>
  )
}
