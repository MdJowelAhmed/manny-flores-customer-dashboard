import type { Payment } from '@/pages/Payment/paymentsData'
import type { Project } from './projectsData'

export function isProjectPaymentDue(project: Project): boolean {
  return (project.estimateProjectStatus ?? '').toUpperCase() === 'COMPLETED_REQUESTED'
}

export function buildProjectPayablePayment(
  project: Project,
  balanceDue: number
): Payment {
  const amount = Math.max(0, balanceDue)
  const invoice = project.estimateId
    ? `EST-${project.estimateId.slice(0, 8).toUpperCase()}`
    : `PRJ-${project.id.slice(0, 8).toUpperCase()}`

  return {
    id: project.id,
    invoice,
    customer: project.customerName,
    project: project.projectName,
    totalAmount: amount,
    paidAmount: 0,
    outstandingAmount: amount > 0 ? amount : 0,
    method: '—',
    status: 'Pending',
  }
}
