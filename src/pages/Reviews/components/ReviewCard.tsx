import { Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { Review } from '@/types'
import { cn } from '@/utils/cn'
import { REVIEW_STATUS_COLORS } from '../reviewData'

interface ReviewCardProps {
  review: Review
  onApproved: () => void
  onDelete: () => void
}

function StarRatingDisplay({ value }: { value: number }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={cn(
            'h-6 w-6',
            i <= value ? 'fill-amber-400 text-amber-400' : 'text-gray-300'
          )}
        />
      ))}
      <span className="ml-2 text-sm text-muted-foreground">
        {value} out of 5 stars
      </span>
    </div>
  )
}

export function ReviewCard({ review, onApproved, onDelete }: ReviewCardProps) {
  const statusColors = REVIEW_STATUS_COLORS[review.status]

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 lg:p-12 2xl:p-20">
      <div className="flex justify-between items-start gap-4 mb-6">
        <h3 className="text-lg font-semibold text-foreground">Customer Review</h3>
        <span
          className={cn(
            'px-3 py-1 rounded-full text-sm font-medium',
            statusColors.bg,
            statusColors.text
          )}
        >
          {review.status}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h4 className="text-sm font-bold text-foreground mb-3">Customer Details</h4>
          <div className="space-y-3">
            <div>
              <p className="text-xs text-muted-foreground mb-0.5">Customer Name</p>
              <p className="text-sm font-medium text-foreground">{review.customerName}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-0.5">Project Name</p>
              <p className="text-sm font-medium text-foreground">{review.projectName}</p>
            </div>
          </div>
        </div>

        <div>
          <h4 className="text-sm font-bold text-foreground mb-3">Rating & Feedback</h4>
          <div className="space-y-4">
            <div>
              <p className="text-xs text-muted-foreground mb-1.5">Rating</p>
              <StarRatingDisplay value={review.rating} />
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1.5">Feedback</p>
              <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap bg-gray-50 rounded-lg p-4 border border-gray-100">
                {review.feedback}
              </p>
            </div>
          </div>
        </div>
      </div>

      {review.status === 'Pending' && (
        <div className="flex justify-end gap-3 pt-6 mt-6 border-t border-gray-100">
          <Button
            type="button"
            variant="destructive"
            onClick={onDelete}
            className="px-5 py-2.5 rounded-lg text-white"
          >
            Reject
          </Button>
          <Button
            type="button"
            onClick={onApproved}
            className="px-5 py-2.5 rounded-lg bg-primary hover:bg-primary/90 text-white"
          >
            Approve
          </Button>
        </div>
      )}
    </div>
  )
}
