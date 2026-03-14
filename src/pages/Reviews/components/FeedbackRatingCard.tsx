import { FormTextarea } from '@/components/common/Form'
import { StarRating } from '@/components/common/StarRating'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { FEEDBACK_MAX_LENGTH } from '../reviewData'

interface FeedbackRatingCardProps {
  rating: number
  feedback: string
  onRatingChange: (value: number) => void
  onFeedbackChange: (value: string) => void
  onCancel: () => void
  onSend: () => void
  isSubmitting?: boolean
}

export function FeedbackRatingCard({
  rating,
  feedback,
  onRatingChange,
  onFeedbackChange,
  onCancel,
  onSend,
  isSubmitting = false,
}: FeedbackRatingCardProps) {
  return (
    <Card className="bg-white border-gray-100 shadow-sm">
      <CardHeader>
        <h3 className="text-base font-bold text-foreground">
          Customer Feedback & Rating
        </h3>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Rating</label>
          <div className="flex items-center gap-2">
            <StarRating value={rating} onChange={onRatingChange} />
            <span className="text-sm text-muted-foreground">out of 5 star</span>
          </div>
        </div>
        <FormTextarea
          label="Feedback"
          placeholder="Type here...."
          value={feedback}
          onChange={(e) => onFeedbackChange(e.target.value)}
          rows={4}
          maxLength={FEEDBACK_MAX_LENGTH}
          className="bg-gray-50 resize-none"
        />
        <p className="text-xs text-muted-foreground">{FEEDBACK_MAX_LENGTH} max characters</p>
        <div className="flex gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            className="bg-red-50 text-red-600 border-red-200 hover:bg-red-100 hover:text-red-700"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="button"
            className="bg-green-600 hover:bg-green-700 text-white"
            onClick={onSend}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Sending...' : 'Send'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
