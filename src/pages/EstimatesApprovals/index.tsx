import { useMemo, useRef, useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Pagination } from '@/components/common'
import { estimatesData, type Estimate } from './estimatesData'
import { EstimateViewModal } from './components/EstimateViewModal'
import { EstimateListCard } from './components/EstimateListCard'
import { toast } from 'sonner'
import { ProjectDetailsModal } from '@/pages/Projects/components/ProjectDetailsModal'
import type { Project } from '@/pages/Projects/projectsData'
import { useAppSelector } from '@/redux/hooks'

export default function EstimatesApprovals() {
  const { t } = useTranslation()
  const user = useAppSelector((s) => s.auth.user)
  const currentCustomerName = user ? `${user.firstName} ${user.lastName}`.trim() : 'Karim Ullah'
  const currentCustomerEmail = user?.email?.toLowerCase().trim() ?? ''

  const [estimates, setEstimates] = useState<Estimate[]>(estimatesData)
  const [workflowProjects, setWorkflowProjects] = useState<Project[]>([])
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [showProjectModal, setShowProjectModal] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(5)
  const [selectedEstimate, setSelectedEstimate] = useState<Estimate | null>(null)
  const [showViewModal, setShowViewModal] = useState(false)
  const timersRef = useRef<number[]>([])
  const userTouchedRef = useRef(false)
  const seededRef = useRef(false)

  const visibleEstimates = useMemo(() => {
    return estimates.filter((e) => {
      if (e.customerName === currentCustomerName) return true
      if (currentCustomerEmail && e.email?.toLowerCase().trim() === currentCustomerEmail) return true
      return false
    })
  }, [estimates, currentCustomerName, currentCustomerEmail])

  const visibleProjects = useMemo(() => {
    return workflowProjects.filter((p) => p.customerName === currentCustomerName)
  }, [workflowProjects, currentCustomerName])

  const totalItems = visibleEstimates.length
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage))
  const paginatedEstimates = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage
    return visibleEstimates.slice(start, start + itemsPerPage)
  }, [visibleEstimates, currentPage, itemsPerPage])

  useEffect(() => {
    if (currentPage > totalPages && totalPages >= 1) setCurrentPage(1)
  }, [totalPages, currentPage])

  useEffect(() => {
    return () => {
      for (const id of timersRef.current) window.clearTimeout(id)
      timersRef.current = []
    }
  }, [])

  useEffect(() => {
    if (seededRef.current) return
    if (userTouchedRef.current) return

    // Seed a few estimates for the current customer so the UI isn't empty in demos.
    const hasAnyForUser = estimatesData.some((e) => {
      if (e.customerName === currentCustomerName) return true
      if (currentCustomerEmail && e.email?.toLowerCase().trim() === currentCustomerEmail) return true
      return false
    })
    if (hasAnyForUser) {
      seededRef.current = true
      return
    }

    const seeded = estimatesData.map((e, idx) => {
      if (idx >= 3) return e
      return {
        ...e,
        customerName: currentCustomerName,
        email: currentCustomerEmail || e.email,
      }
    })
    setEstimates(seeded)
    seededRef.current = true
  }, [currentCustomerName, currentCustomerEmail])

  useEffect(() => {
    if (userTouchedRef.current) return
    // Seed one dummy project so users understand the post-invoice flow.
    setWorkflowProjects((prev) => {
      const alreadyHas = prev.some((p) => p.customerName === currentCustomerName)
      if (alreadyHas) return prev
      return [
        {
          id: 'PROJ-DEMO',
          projectName: 'Garden Design & Installation',
          category: 'Garden Design & Installation',
          customerName: currentCustomerName,
          status: 'In Progress',
          progress: 55,
          location: '—',
          dateRange: '—',
          projectValue: '$12,560',
          description: 'Demo project (shows after admin creates invoice).',
        },
        ...prev,
      ]
    })
  }, [currentCustomerName])

  const handleView = (estimate: Estimate) => {
    setSelectedEstimate(estimate)
    setShowViewModal(true)
  }

  const handleApprove = (e: Estimate) => {
    userTouchedRef.current = true
    // User approves -> show waiting message, then admin creates invoice -> project appears.
    setEstimates((prev) =>
      prev.map((x) =>
        x.id === e.id
          ? { ...x, status: 'Approved' as const, approvedAt: new Date().toISOString() }
          : x
      )
    )
    setSelectedEstimate(null)
    toast.success(t('estimates.approvedToast'))

    const timerId = window.setTimeout(() => {
      const project: Project = {
        id: e.estimateCode,
        projectName: e.project,
        category: e.project,
        customerName: e.customerName,
        status: 'In Progress',
        progress: 35,
        location: '—',
        dateRange: '—',
        projectValue: e.amount,
        description: `Created after admin invoice for ${e.estimateCode}`,
      }

      setWorkflowProjects((prev) => {
        const exists = prev.some((p) => p.id === project.id)
        return exists ? prev : [project, ...prev]
      })

      setEstimates((prev) =>
        prev.map((x) =>
          x.id === e.id
            ? {
                ...x,
                status: 'Project Created' as const,
                invoicedAt: new Date().toISOString(),
                projectCreatedAt: new Date().toISOString(),
              }
            : x
        )
      )
    }, 1500)

    timersRef.current.push(timerId)
  }

  const handleReject = (e: Estimate) => {
    userTouchedRef.current = true
    setEstimates((prev) =>
      prev.map((x) => (x.id === e.id ? { ...x, status: 'Rejected' as const } : x))
    )
    setSelectedEstimate(null)
    toast.message(t('estimates.rejectedToast'))
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-800">
            {t('estimates.title')}
          </h1>
          <p className="mt-1.5 text-sm text-gray-500">{t('estimates.subtitle')}</p>
        </div>
        {/* customer can't create estimates */}
      </div>

      {visibleEstimates.length === 0 ? (
        <div className="py-16 text-center text-sm text-gray-500">
          {t('estimates.noEstimates')}
        </div>
      ) : (
        <div className="space-y-4">
          {paginatedEstimates.map((estimate) => (
            <div key={estimate.id} className="space-y-2">
              <EstimateListCard
                estimate={estimate}
                onViewDetails={handleView}
                viewDetailsLabel={t('estimates.viewDetails')}
                onApprove={handleApprove}
                approveLabel={t('estimates.approved')}
              />

              {estimate.status === 'Approved' ? (
                <p className="text-right text-sm text-gray-500">
                  please waiting admin create  Invoice ...
                </p>
              ) : null}
            </div>
          ))}
        </div>
      )}

      {visibleProjects.length > 0 ? (
        <div className="rounded-xl bg-white p-5 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900">Project Name</h2>
          <p className="mt-1 text-sm text-gray-500">
            After admin creates invoice, projects will appear here and you can track progress.
          </p>

          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full border-separate border-spacing-y-2">
              <thead>
                <tr className="text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  <th className="px-3 py-2">Project</th>
                  <th className="px-3 py-2">Status</th>
                  <th className="px-3 py-2">Progress</th>
                  <th className="px-3 py-2 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {visibleProjects.map((p) => (
                  <tr key={p.id} className="rounded-lg bg-gray-50/70">
                    <td className="px-3 py-3">
                      <div className="text-sm font-semibold text-gray-900">{p.projectName}</div>
                      <div className="text-xs text-gray-500">{p.customerName}</div>
                    </td>
                    <td className="px-3 py-3 text-sm text-gray-700">{p.status}</td>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-2 w-40 overflow-hidden rounded-full bg-gray-200">
                          <div
                            className="h-full rounded-full bg-green-500"
                            style={{ width: `${p.progress}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium text-gray-800">{p.progress}%</span>
                      </div>
                    </td>
                    <td className="px-3 py-3 text-right">
                      <Button
                        type="button"
                        variant="outline"
                        className="h-9 rounded-lg border-gray-300 bg-white text-sm font-semibold text-gray-800 hover:bg-gray-50"
                        onClick={() => {
                          setSelectedProject(p)
                          setShowProjectModal(true)
                        }}
                      >
                        View Details
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}

      {totalItems > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
          onItemsPerPageChange={(limit) => {
            setItemsPerPage(limit)
            setCurrentPage(1)
          }}
          showItemsPerPage
        />
      )}

      <EstimateViewModal
        open={showViewModal}
        onClose={() => {
          setShowViewModal(false)
          setSelectedEstimate(null)
        }}
        estimate={selectedEstimate}
        onApprove={handleApprove}
        onReject={handleReject}
      />

      <ProjectDetailsModal
        open={showProjectModal}
        onClose={() => {
          setShowProjectModal(false)
          setSelectedProject(null)
        }}
        project={selectedProject}
      />
    </div>
  )
}
