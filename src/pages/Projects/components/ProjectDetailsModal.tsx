import { useTranslation } from 'react-i18next'
import { ModalWrapper } from '@/components/common'
import { formatProjectDisplayDate, type Project } from '../projectsData'

interface ProjectDetailsModalProps {
  open: boolean
  onClose: () => void
  project: Project | null
}

function DetailLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-2 text-sm sm:gap-3">
      <span className="min-w-0 flex-shrink-0 font-medium text-gray-700">{label}:</span>
      <span className="min-w-0 flex-1 text-gray-900">{value}</span>
    </div>
  )
}

export function ProjectDetailsModal({
  open,
  onClose,
  project,
}: ProjectDetailsModalProps) {
  const { t } = useTranslation()
  if (!project) return null

  const description = project.description?.trim() || '—'

  return (
    <ModalWrapper
      open={open}
      onClose={onClose}
      title={t('projects.detailsTitle')}
      size="lg"
      className="max-w-lg bg-white sm:rounded-2xl"
      headerClassName="pb-2"
    >
      <div className="space-y-4 pr-1">
        <div className="rounded-xl border border-gray-100 bg-gray-50/70 p-4">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-semibold text-gray-800">{project.status}</p>
            <p className="text-sm font-semibold text-gray-900">{project.progress}%</p>
          </div>
          <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-gray-200">
            <div
              className="h-full rounded-full bg-green-500 transition-all"
              style={{ width: `${project.progress}%` }}
            />
          </div>
          <p className="mt-2 text-xs text-gray-500">
            Progress updates will appear here as work completes.
          </p>
        </div>

        <DetailLine label={t('projects.projectName')} value={project.projectName} />
        <DetailLine label="Project Value" value={project.projectValue} />
        <DetailLine
          label={t('projects.startDate')}
          value={formatProjectDisplayDate(project.startDate)}
        />
        <DetailLine
          label={t('projects.endDate')}
          value={formatProjectDisplayDate(project.endDate)}
        />
        <div className="space-y-1.5">
          <p className="text-sm font-medium text-gray-700">
            {t('projects.descriptionLabel')}:
          </p>
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-gray-900">
            {description}
          </p>
        </div>
      </div>
    </ModalWrapper>
  )
}
