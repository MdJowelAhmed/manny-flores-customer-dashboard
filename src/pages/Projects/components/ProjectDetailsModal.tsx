import { FileText } from 'lucide-react'
import { ModalWrapper } from '@/components/common'
import { cn } from '@/utils/cn'
import type { Project } from '../projectsData'

interface ProjectDetailsModalProps {
  open: boolean
  onClose: () => void
  project: Project | null
}

function DetailRow({
  label,
  value,
  valueClassName,
}: {
  label: string
  value: string | number
  valueClassName?: string
}) {
  return (
    <div className="flex justify-between py-2 gap-4">
      <span className="text-sm text-muted-foreground flex-shrink-0">{label}</span>
      <span className={cn('text-sm font-medium text-right', valueClassName)}>
        {value}
      </span>
    </div>
  )
}

export function ProjectDetailsModal({
  open,
  onClose,
  project,
}: ProjectDetailsModalProps) {
  if (!project) return null

  const projectName = project.projectName
  const category = project.category

  return (
    <ModalWrapper
      open={open}
      onClose={onClose}
      title={projectName}
      description={category}
      size="lg"
      className="max-w-2xl bg-white"
    >
      <div className="space-y-6">
        <p className="text-sm font-medium text-purple-600 -mt-1">
          Project ID: {project.id}
        </p>

        {/* Project Overview */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="p-1.5 rounded-full bg-green-100">
              <FileText className="h-4 w-4 text-green-600" />
            </div>
            <h3 className="text-sm font-semibold text-foreground">
              Project Overview
            </h3>
          </div>
          <p className="text-sm text-muted-foreground pl-8 mb-4 leading-relaxed">
            {project.description || 'No description available.'}
          </p>
          <div className="grid grid-cols-2 gap-4 pl-8 mb-4">
            <div>
              <p className="text-xs text-muted-foreground">Start Date</p>
              <p className="text-sm font-medium">{project.startDate || '-'}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Due Date</p>
              <p className="text-sm font-medium">{project.dueDate || '-'}</p>
            </div>
          </div>
          <div className="pl-8">
            <p className="text-sm font-medium text-gray-700 mb-2">Progress</p>
            <div className="flex items-center gap-3">
              <div className="flex-1 h-2 rounded-full bg-gray-100 overflow-hidden">
                <div
                  className="h-full rounded-full bg-green-500"
                  style={{ width: `${project.progress}%` }}
                />
              </div>
              <span className="text-sm font-medium">{project.progress}%</span>
            </div>
          </div>
        </div>

        {/* Financial Summary */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="p-1.5 rounded-full bg-green-100">
              <FileText className="h-4 w-4 text-green-600" />
            </div>
            <h3 className="text-sm font-semibold text-foreground">
              Financial Summary
            </h3>
          </div>
          <div className="space-y-0 pl-8">
            <DetailRow label="Project" value={projectName} />
            <DetailRow
              label="Payment Method"
              value={project.paymentMethod || '-'}
            />
            <DetailRow
              label="Project Value"
              value={project.projectValue}
              valueClassName="text-green-600"
            />
            <DetailRow
              label="Amount Due"
              value={project.amountDue || '-'}
              valueClassName="text-red-600"
            />
            <DetailRow
              label="Payment Amount"
              value={project.paymentAmount || '-'}
              valueClassName="text-green-600"
            />
            <DetailRow
              label="Payment Date"
              value={project.paymentDate || '-'}
            />
            <DetailRow
              label="Status"
              value={project.paymentStatus || '-'}
              valueClassName="text-purple-600"
            />
          </div>
        </div>
      </div>
    </ModalWrapper>
  )
}
