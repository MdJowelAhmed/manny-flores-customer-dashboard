import { useState, useEffect } from 'react'
import { ModalWrapper } from '@/components/common'
import { FormInput, FormTextarea } from '@/components/common/Form'
import { Button } from '@/components/ui/button'
import { StarRating } from './StarRating'
import type { Project } from '../projectsData'
import { toast } from 'sonner'

interface RatingFeedbackModalProps {
  open: boolean
  onClose: () => void
  project: Project | null
}

export function RatingFeedbackModal({
  open,
  onClose,
  project,
}: RatingFeedbackModalProps) {
  const [projectName, setProjectName] = useState('')
  const [feedback, setFeedback] = useState('')
  const [rating, setRating] = useState(0)

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      setProjectName('')
      setFeedback('')
      setRating(0)
      onClose()
    }
  }

  const handleSave = () => {
    // Validate or submit – for now just toast
    toast.success('Rating & feedback saved successfully')
    handleOpenChange(false)
    onClose()
  }

  const handleCancel = () => {
    handleOpenChange(false)
    onClose()
  }

  useEffect(() => {
    if (project && open) {
      setProjectName(project.projectName)
      setFeedback('')
      setRating(0)
    }
  }, [project?.id, open])

  return (
    <ModalWrapper
      open={open}
      onClose={() => handleOpenChange(false)}
      title="Rating & Feedback Details"
      size="md"
      className="max-w-lg bg-white"
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button
            className="bg-green-600 hover:bg-green-700 text-white"
            onClick={handleSave}
          >
            Save
          </Button>
        </div>
      }
    >
      <div className="space-y-5">
        <div>
          <h3 className="text-sm font-semibold text-foreground mb-4">
            Rating & Feedback
          </h3>
          <div className="space-y-4">
            <FormInput
              label="Project name"
              placeholder="Enter project name"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              className="bg-gray-50"
            />
            <FormTextarea
              label="Feedback"
              placeholder="Type here..."
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              rows={4}
              className="bg-gray-50 resize-none"
            />
            <div className="space-y-2">
              <label className="text-sm font-medium">Rating</label>
              <StarRating value={rating} onChange={setRating} />
            </div>
          </div>
        </div>
      </div>
    </ModalWrapper>
  )
}
