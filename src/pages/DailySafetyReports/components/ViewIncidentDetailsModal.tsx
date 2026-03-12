import { ModalWrapper } from '@/components/common'
import type { IncidentReportSubmission } from '../dailySafetyReportsData'

interface ViewIncidentDetailsModalProps {
  open: boolean
  onClose: () => void
  submission: IncidentReportSubmission | null
}

function SectionHeader({ title }: { title: string }) {
  return (
    <h3 className="text-sm font-semibold text-foreground mb-2">{title}</h3>
  )
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between py-1.5 gap-4 text-sm">
      <span className="text-muted-foreground">{label}:</span>
      <span className="text-foreground font-medium">{value}</span>
    </div>
  )
}

export function ViewIncidentDetailsModal({
  open,
  onClose,
  submission,
}: ViewIncidentDetailsModalProps) {
  if (!submission) return null

  const logistics = submission.logistics
  const peopleInvolved = submission.peopleInvolved
  const incidentDetails = submission.incidentDetails

  return (
    <ModalWrapper
      open={open}
      onClose={onClose}
      title="Incident Details"
      description={`${submission.projectName} – ${submission.incidentType}`}
      size="lg"
    >
      <div className="space-y-6">
          {logistics && (
            <div>
              <SectionHeader title="Logistics" />
              <div className="pl-2 space-y-0">
                <DetailRow label="Employee Name" value={logistics.employeeName} />
                <DetailRow label="Date" value={logistics.date} />
                <DetailRow label="Time" value={logistics.time} />
                <DetailRow label="Location" value={logistics.location} />
              </div>
            </div>
          )}

          {peopleInvolved && (
            <div>
              <SectionHeader title="People Involved" />
              <div className="pl-2 space-y-0">
                <DetailRow label="Involved Person" value={peopleInvolved.involvedPerson} />
                <DetailRow label="Witness Name" value={peopleInvolved.witnessName} />
              </div>
            </div>
          )}

          {incidentDetails && (
            <div>
              <SectionHeader title="Incident Details" />
              <div className="pl-2 space-y-0">
                <DetailRow label="Incident Type" value={incidentDetails.incidentType} />
                <DetailRow label="Description" value={incidentDetails.description} />
              </div>
            </div>
          )}
        </div>
    </ModalWrapper>
  )
}
