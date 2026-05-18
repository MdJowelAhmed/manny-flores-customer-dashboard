import { useMemo, useRef, useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Pagination } from '@/components/common'
import { estimatesData, type Estimate } from './estimatesData'
import { EstimateViewModal } from './components/EstimateViewModal'
import { EstimateListCard } from './components/EstimateListCard'
import { toast } from 'sonner'
import { ProjectDetailsModal } from '@/pages/Projects/components/ProjectDetailsModal'
import { useAppSelector } from '@/redux/hooks'

export default function EstimatesApprovals() {
  const { t } = useTranslation()
  const user = useAppSelector((s) => s.auth.user)
  const currentCustomerName = user ? `${user.firstName} ${user.lastName}`.trim() : 'Karim Ullah'
  const currentCustomerEmail = user?.email?.toLowerCase().trim() ?? ''

  const [estimates, setEstimates] = useState<Estimate[]>(estimatesData)
  const [selectedProject, setSelectedProject] = useState<any | null>(null)
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
