import { useState } from 'react'
import { motion } from 'framer-motion'
import type { FetchBaseQueryError } from '@reduxjs/toolkit/query'
import type { SerializedError } from '@reduxjs/toolkit'
import { CustomerDetailsCard } from './CustomerDetailsCard'
import { FeedbackRatingCard } from './FeedbackRatingCard'
import { useCreateReviewMutation } from '@/redux/api/reviewApi'
import { toast } from '@/utils/toast'

function getApiErrorMessage(
  error: FetchBaseQueryError | SerializedError | undefined,
  fallback: string
): string {
  if (!error) return fallback
  if ('data' in error && error.data && typeof error.data === 'object') {
    const data = error.data as { message?: string }
    if (data.message) return data.message
  }
  if ('message' in error && error.message) return error.message
  return fallback
}

export function ReviewSubmissionForm() {
  const [projectName, setProjectName] = useState('')
  const [rating, setRating] = useState(0)
  const [feedback, setFeedback] = useState('')
  const [createReview, { isLoading: isSubmitting }] = useCreateReviewMutation()

  const handleCancel = () => {
    setProjectName('')
    setRating(0)
    setFeedback('')
  }

  const handleSend = async () => {
    if (!projectName.trim()) {
      toast({ variant: 'destructive', title: 'Error', description: 'Please enter project name.' })
      return
    }
    if (rating === 0) {
      toast({ variant: 'destructive', title: 'Error', description: 'Please select a rating.' })
      return
    }
    if (!feedback.trim()) {
      toast({ variant: 'destructive', title: 'Error', description: 'Please enter feedback.' })
      return
    }

    try {
      const result = await createReview({
        rating,
        feedback: feedback.trim(),
        projectName: projectName.trim(),
      }).unwrap()

      if (!result.success) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: result.message || 'Failed to submit review. Please try again.',
        })
        return
      }

      toast({
        variant: 'success',
        title: 'Review Submitted',
        description: result.message || 'Your review has been sent successfully.',
      })
      handleCancel()
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: getApiErrorMessage(
          error as FetchBaseQueryError,
          'Failed to submit review. Please try again.'
        ),
      })
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="grid grid-cols-1 lg:grid-cols-2 gap-6"
    >
      <CustomerDetailsCard
        projectName={projectName}
        onProjectNameChange={setProjectName}
      />
      <FeedbackRatingCard
        rating={rating}
        feedback={feedback}
        onRatingChange={setRating}
        onFeedbackChange={setFeedback}
        onCancel={handleCancel}
        onSend={handleSend}
        isSubmitting={isSubmitting}
      />
    </motion.div>
  )
}
