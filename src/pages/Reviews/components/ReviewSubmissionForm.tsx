import { useState } from 'react'
import { motion } from 'framer-motion'
import { CustomerDetailsCard } from './CustomerDetailsCard'
import { FeedbackRatingCard } from './FeedbackRatingCard'
import { toast } from '@/utils/toast'

export function ReviewSubmissionForm() {
  const [customerName, setCustomerName] = useState('')
  const [projectName, setProjectName] = useState('')
  const [rating, setRating] = useState(0)
  const [feedback, setFeedback] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleCancel = () => {
    setCustomerName('')
    setProjectName('')
    setRating(0)
    setFeedback('')
  }

  const handleSend = async () => {
    if (!customerName.trim()) {
      toast({ variant: 'destructive', title: 'Error', description: 'Please enter customer name.' })
      return
    }
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

    setIsSubmitting(true)
    try {
      // TODO: Replace with actual API call when backend is ready
      await new Promise((r) => setTimeout(r, 500))
      toast({
        variant: 'success',
        title: 'Review Submitted',
        description: 'Your review has been sent successfully.',
      })
      handleCancel()
    } catch {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to submit review. Please try again.',
      })
    } finally {
      setIsSubmitting(false)
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
        customerName={customerName}
        projectName={projectName}
        onCustomerNameChange={setCustomerName}
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
