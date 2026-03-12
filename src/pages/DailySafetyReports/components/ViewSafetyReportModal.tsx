import { ModalWrapper } from '@/components/common'
import { Button } from '@/components/ui/button'
import type { SafetyChecklistSubmission } from '../dailySafetyReportsData'
import { cn } from '@/utils/cn'

interface ViewSafetyReportModalProps {
  open: boolean
  onClose: () => void
  submission: SafetyChecklistSubmission | null
  onReview?: (id: string) => void
}

function SectionHeader({ title }: { title: string }) {
  return (
    <h3 className="text-sm font-semibold text-foreground mb-3">{title}</h3>
  )
}

export function ViewSafetyReportModal({
  open,
  onClose,
  submission,
  onReview,
}: ViewSafetyReportModalProps) {
  if (!submission) return null

  return (
    <ModalWrapper
      open={open}
      onClose={onClose}
      title="Safety Verification"
      description={`${submission.projectName} – ${submission.supervisorName} (${submission.supervisorRole}) • ${submission.dateSubmitted}`}
      size="lg"
    >
      <div className="space-y-6">
          <div>
            <SectionHeader title="Complete daily safety checks" />
            <ul className="space-y-3">
              {submission.checklistItems.map((item, index) => (
                <li
                  key={item.id}
                  className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
                >
                  <span className="text-sm text-foreground">
                    {index + 1}. {item.label}
                  </span>
                  <span
                    className={cn(
                      'text-sm font-medium px-2 py-0.5 rounded',
                      item.value === 'Yes'
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-amber-100 text-amber-700'
                    )}
                  >
                    {item.value}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <SectionHeader title="Notes" />
            <div className="min-h-[80px] p-3 rounded-md border border-gray-200 bg-gray-50 text-sm text-foreground">
              {submission.notes || '—'}
            </div>
          </div>

          <Button
            className="w-full bg-primary hover:bg-primary/90 text-white"
            onClick={() => {
              onReview?.(submission.id)
              onClose()
            }}
          >
            Review
          </Button>
        </div>
    </ModalWrapper>
  )
}
