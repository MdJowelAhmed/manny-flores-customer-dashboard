import { useMemo, useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { format } from 'date-fns'
import { Button } from '@/components/ui/button'
import { Pagination } from '@/components/common'
import { estimatesData, type Estimate } from './estimatesData'
import { EstimateViewModal } from './components/EstimateViewModal'
import { EstimateEditModal } from './components/EstimateEditModal'
import { EstimateListCard } from './components/EstimateListCard'

export default function EstimatesApprovals() {
  const { t } = useTranslation()
  const [estimates, setEstimates] = useState<Estimate[]>(estimatesData)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(5)
  const [selectedEstimate, setSelectedEstimate] = useState<Estimate | null>(null)
  const [showViewModal, setShowViewModal] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)

  const totalItems = estimates.length
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage))
  const paginatedEstimates = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage
    return estimates.slice(start, start + itemsPerPage)
  }, [estimates, currentPage, itemsPerPage])

  useEffect(() => {
    if (currentPage > totalPages && totalPages >= 1) setCurrentPage(1)
  }, [totalPages, currentPage])

  const handleView = (estimate: Estimate) => {
    setSelectedEstimate(estimate)
    setShowViewModal(true)
  }

  const handleApprove = (e: Estimate) => {
    setEstimates((prev) =>
      prev.map((x) => (x.id === e.id ? { ...x, status: 'Approved' as const } : x))
    )
    setSelectedEstimate(null)
  }

  const handleReject = (e: Estimate) => {
    setEstimates((prev) =>
      prev.map((x) => (x.id === e.id ? { ...x, status: 'Rejected' as const } : x))
    )
    setSelectedEstimate(null)
  }

  const handleSaveCreate = (newEstimate: Estimate) => {
    setEstimates((prev) => {
      const nextId = String(
        Math.max(...prev.map((e) => parseInt(e.id, 10) || 0), 0) + 1
      )
      const maxCode = prev.reduce((m, e) => {
        const match = e.estimateCode.match(/EST-(\d+)/)
        const num = match ? parseInt(match[1], 10) : 0
        return Math.max(m, num)
      }, 0)
      const code = `EST-${String(maxCode + 1).padStart(3, '0')}`
      return [...prev, { ...newEstimate, id: nextId, estimateCode: code }]
    })
    setShowCreateModal(false)
    setSelectedEstimate(null)
  }

  const newEstimateForCreate: Estimate = {
    id: '',
    estimateCode: '',
    project: '',
    amount: '$0',
    status: 'Draft',
    startDate: format(new Date(), 'd/M/yyyy'),
    customerName: '',
    email: '',
    company: '',
    contactNumber: '',
    businessProjectDetail: '',
    taxRatePercent: 15,
    materialSummary: '',
    summaryQty: 1,
    summaryCostCount: 1,
    lineItems: [{ description: '', unitCost: 0, qty: 1, taxable: true }],
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
        <Button
          type="button"
          variant="outline"
          className="h-10 shrink-0 rounded-xl border-gray-300 text-sm font-medium text-gray-800 hover:bg-gray-50"
          onClick={() => setShowCreateModal(true)}
        >
          {t('estimates.createNew')}
        </Button>
      </div>

      {estimates.length === 0 ? (
        <div className="py-16 text-center text-sm text-gray-500">
          {t('estimates.noEstimates')}
        </div>
      ) : (
        <div className="space-y-4">
          {paginatedEstimates.map((estimate) => (
            <EstimateListCard
              key={estimate.id}
              estimate={estimate}
              onViewDetails={handleView}
              viewDetailsLabel={t('estimates.viewDetails')}
            />
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

      <EstimateEditModal
        open={showCreateModal}
        onClose={() => {
          setShowCreateModal(false)
          setSelectedEstimate(null)
        }}
        estimate={newEstimateForCreate}
        onSave={handleSaveCreate}
        mode="create"
      />
    </div>
  )
}
