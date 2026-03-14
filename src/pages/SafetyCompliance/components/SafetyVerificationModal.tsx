import { useState } from 'react'
import { ModalWrapper } from '@/components/common/ModalWrapper'
import { Button } from '@/components/ui/button'
import { FormTextarea } from '@/components/common/Form'
import { PPE_CHECK_ITEMS } from '../safetyComplianceData'
import { toast } from '@/utils/toast'

interface SafetyVerificationModalProps {
  open: boolean
  onClose: () => void
  projectName: string
  onSuccess?: () => void
}

export function SafetyVerificationModal({
  open,
  onClose,
  projectName,
  onSuccess,
}: SafetyVerificationModalProps) {
  const [answers, setAnswers] = useState<Record<number, 'yes' | 'no' | null>>({})
  const [notes, setNotes] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async () => {
    const allAnswered = PPE_CHECK_ITEMS.every((_, i) => answers[i] != null)
    if (!allAnswered) {
      toast({ title: 'Please answer all safety check items', variant: 'destructive' })
      return
    }
    setIsSubmitting(true)
    try {
      await new Promise((r) => setTimeout(r, 400))
      toast({
        variant: 'success',
        title: 'Checklist Submitted',
        description: `Daily safety checklist for ${projectName} has been submitted.`,
      })
      setAnswers({})
      setNotes('')
      onClose()
      onSuccess?.()
    } catch {
      toast({ title: 'Submission failed', variant: 'destructive' })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <ModalWrapper
      open={open}
      onClose={onClose}
      title="Safety Verification"
      size="lg"
      className="bg-white max-w-2xl"
      footer={
        <Button
          className="w-full bg-primary  text-white font-medium rounded-md h-[44px]"
          onClick={handleSubmit}
          disabled={isSubmitting}
          isLoading={isSubmitting}
        >
          Submit Checklist
        </Button>
      }
    >
      <div className="space-y-6">
        <div>
          <h3 className="text-sm font-semibold text-foreground mb-3">
            Complete daily safety checks
          </h3>
          <div className="space-y-3">
            {PPE_CHECK_ITEMS.map((label, index) => (
              <div
                key={index}
                className="flex items-center justify-between gap-4 p-3 rounded-xl border border-gray-200 bg-white"
              >
                <span className="text-sm  text-foreground">
                  {index + 1}. {label}
                </span>
                <div className="flex items-center gap-4 shrink-0">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name={`ppe-${index}`}
                      checked={answers[index] === 'yes'}
                      onChange={() =>
                        setAnswers((prev) => ({ ...prev, [index]: 'yes' }))
                      }
                      className="w-4 h-4 text-[#22c55e] border-gray-300 focus:ring-[#22c55e]"
                    />
                    <span className="text-sm text-foreground">Yes</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name={`ppe-${index}`}
                      checked={answers[index] === 'no'}
                      onChange={() =>
                        setAnswers((prev) => ({ ...prev, [index]: 'no' }))
                      }
                      className="w-4 h-4 text-[#22c55e] border-gray-300 focus:ring-[#22c55e]"
                    />
                    <span className="text-sm text-foreground">No</span>
                  </label>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-foreground mb-2">Notes</h3>
          <FormTextarea
            placeholder="please describe the issue..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="min-h-[100px] rounded-xl border-gray-200"
            rows={4}
          />
        </div>
      </div>
    </ModalWrapper>
  )
}
