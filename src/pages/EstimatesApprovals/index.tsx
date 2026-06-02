import { useMemo, useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Pagination } from '@/components/common'
import { type Estimate } from './estimatesData'
import { EstimateViewModal } from './components/EstimateViewModal'
import { EstimateListCard } from './components/EstimateListCard'
import { ProjectDetailsModal } from '@/pages/Projects/components/ProjectDetailsModal'
import {
  mapEstimateApiDocToApprovalEstimate,
  useGetEstimatesQuery,
} from '@/redux/api/estimateApi'

export default function EstimatesApprovals() {
  const { t } = useTranslation()
  const [selectedProject, setSelectedProject] = useState<any | null>(null)
  const [showProjectModal, setShowProjectModal] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [selectedEstimate, setSelectedEstimate] = useState<Estimate | null>(null)
  const [showViewModal, setShowViewModal] = useState(false)

  const { data, isLoading, isError, refetch } = useGetEstimatesQuery({
    page: currentPage,
    limit: itemsPerPage,
  })

  const estimates = useMemo(
    () => (data?.data ?? []).map(mapEstimateApiDocToApprovalEstimate),
    [data?.data]
  )

  const totalItems = data?.pagination?.total ?? estimates.length
  const totalPages = Math.max(1, data?.pagination?.totalPage ?? 1)

  useEffect(() => {
    if (currentPage > totalPages && totalPages >= 1) setCurrentPage(1)
  }, [totalPages, currentPage])

  const handleView = (estimate: Estimate) => {
    setSelectedEstimate(estimate)
    setShowViewModal(true)
  }

  const handleDecisionComplete = () => {
    setSelectedEstimate(null)
    refetch()
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
      </div>

      {isLoading ? (
        <div className="py-16 text-center text-sm text-gray-500">
          {t('common.loading', { defaultValue: 'Loading...' })}
        </div>
      ) : isError ? (
        <div className="py-16 text-center text-sm text-red-600">
          {t('estimates.loadError', { defaultValue: 'Failed to load estimates' })}
        </div>
      ) : estimates.length === 0 ? (
        <div className="py-16 text-center text-sm text-gray-500">
          {t('estimates.noEstimates')}
        </div>
      ) : (
        <div className="space-y-4">
          {estimates.map((estimate) => (
            <div key={estimate.id} className="space-y-2">
              <EstimateListCard
                estimate={estimate}
                onViewDetails={handleView}
                viewDetailsLabel={t('estimates.viewDetails')}
              />

              {estimate.projectStatus === 'SCHEDULED' ||
              estimate.projectStatus === 'IN_PROGRESS' ? (
                <p className="text-right text-sm text-gray-500">
                  {t('estimates.waitingInvoice', {
                    defaultValue: 'Please wait — admin will create the invoice.',
                  })}
                </p>
              ) : null}
            </div>
          ))}
        </div>
      )}

      {totalItems > 0 && !isLoading && !isError && (
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
        onDecisionComplete={handleDecisionComplete}
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
