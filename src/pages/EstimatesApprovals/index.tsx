import { useMemo, useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { format } from 'date-fns'
import { Eye, Trash2 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ConfirmDialog, Pagination } from '@/components/common'
import { cn } from '@/utils/cn'
import {
  estimatesData,
  type Estimate,
  ESTIMATE_STATUS_BADGE,
} from './estimatesData'
import { EstimateViewModal } from './components/EstimateViewModal'
import { EstimateEditModal } from './components/EstimateEditModal'

const FILTER_TABS = ['all', 'Pending', 'Approved', 'Draft'] as const

export default function EstimatesApprovals() {
  const { t } = useTranslation()
  const [estimates, setEstimates] = useState<Estimate[]>(estimatesData)
  const [activeTab, setActiveTab] = useState<string>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [selectedEstimate, setSelectedEstimate] = useState<Estimate | null>(null)
  const [showViewModal, setShowViewModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  const filteredEstimates = useMemo(() => {
    if (activeTab === 'all') return estimates
    return estimates.filter((e) => e.status === activeTab)
  }, [estimates, activeTab])

  const totalItems = filteredEstimates.length
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage))
  const paginatedEstimates = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage
    return filteredEstimates.slice(start, start + itemsPerPage)
  }, [filteredEstimates, currentPage, itemsPerPage])

  useEffect(() => {
    if (currentPage > totalPages && totalPages >= 1) setCurrentPage(1)
  }, [totalPages, currentPage])

  useEffect(() => {
    setCurrentPage(1)
  }, [activeTab])

  const getStatusClasses = (status: string) => {
    const config =
      ESTIMATE_STATUS_BADGE[status as keyof typeof ESTIMATE_STATUS_BADGE] ?? {
        bg: 'bg-gray-100',
        text: 'text-gray-700',
      }
    return cn(
      'inline-flex rounded-full px-3 py-1 text-xs font-medium',
      config.bg,
      config.text
    )
  }

  const handleView = (estimate: Estimate) => {
    setSelectedEstimate(estimate)
    setShowViewModal(true)
  }

  const handleCreate = () => {
    setSelectedEstimate(null)
    setShowCreateModal(true)
  }

  const handleDeleteClick = (estimate: Estimate) => {
    setSelectedEstimate(estimate)
    setShowDeleteModal(true)
  }

  const handleConfirmDelete = () => {
    if (!selectedEstimate) return
    setEstimates((prev) => prev.filter((e) => e.id !== selectedEstimate.id))
    setSelectedEstimate(null)
    setShowDeleteModal(false)
  }

  const handleSaveEdit = (updated: Estimate) => {
    setEstimates((prev) =>
      prev.map((e) => (e.id === updated.id ? updated : e))
    )
    setShowEditModal(false)
    setSelectedEstimate(null)
  }

  const handleSaveCreate = (newEstimate: Estimate) => {
    setEstimates((prev) => {
      const nextId = String(
        Math.max(...prev.map((e) => parseInt(e.id, 10) || 0), 0) + 1
      )
      const code = `EST-2026-${String(nextId).padStart(3, '0')}`
      return [...prev, { ...newEstimate, id: nextId, estimateCode: code }]
    })
    setShowCreateModal(false)
    setSelectedEstimate(null)
  }

  const newEstimateForCreate: Estimate = {
    id: '',
    estimateCode: '',
    project: '',
    amount: '€0',
    status: 'Draft',
    startDate: format(new Date(), 'd/M/yyyy'),
    customerName: '',
    email: '',
    company: '',
    contactNumber: '',
    businessProjectDetail: '',
    taxRatePercent: 15,
    lineItems: [
      { description: '', unitCost: 0, qty: 1, taxable: true },
    ],
  }

  return (
    <div className="space-y-8">
      {/* Header — matches reference layout */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            {t('estimates.title')}
          </h1>
          <p className="mt-1.5 text-sm text-gray-500">
            {t('estimates.subtitle')}
          </p>
        </div>
        <Button
          type="button"
          className="h-11 shrink-0 rounded-xl bg-[#22c55e] px-5 text-sm font-semibold text-white shadow-sm hover:bg-[#16a34a]"
          onClick={handleCreate}
        >
          {t('estimates.createNew')}
        </Button>
      </div>

      {/* Filter tabs — pill style */}
      <div className="flex flex-wrap gap-2">
        {FILTER_TABS.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={cn(
              'rounded-full px-5 py-2.5 text-sm font-medium transition-colors',
              activeTab === tab
                ? 'bg-[#22c55e] text-white shadow-sm'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            )}
          >
            {tab === 'all' ? t('estimates.all') : tab}
          </button>
        ))}
      </div>

      {/* Table */}
      <Card className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <CardContent className="p-0">
          <div className="w-full overflow-x-auto">
            <table className="w-full min-w-[860px] border-collapse">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-100">
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    ID
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    {t('estimates.estimate')}
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    {t('estimates.project')}
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    {t('estimates.amount')}
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    {t('estimates.status')}
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    {t('estimates.startDate')}
                  </th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">
                    {t('estimates.action')}
                  </th>
                </tr>
              </thead>
              <tbody className="text-gray-800">
                {paginatedEstimates.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-6 py-16 text-center text-sm text-gray-500"
                    >
                      {t('estimates.noEstimates')}
                    </td>
                  </tr>
                ) : (
                  paginatedEstimates.map((estimate) => (
                    <tr
                      key={estimate.id}
                      className="border-b border-gray-100 transition-colors hover:bg-gray-50/60"
                    >
                      <td className="px-6 py-5 text-sm font-medium text-gray-900">
                        #{estimate.id}
                      </td>
                      <td className="px-6 py-5 text-sm text-gray-800">
                        {estimate.estimateCode}
                      </td>
                      <td className="px-6 py-5 text-sm text-gray-800">
                        {estimate.project}
                      </td>
                      <td className="px-6 py-5 text-sm font-medium text-gray-900">
                        {estimate.amount}
                      </td>
                      <td className="px-6 py-5">
                        <span className={getStatusClasses(estimate.status)}>
                          {estimate.status}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-sm text-gray-800">
                        {estimate.startDate}
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center justify-end gap-3">
                          <button
                            type="button"
                            onClick={() => handleView(estimate)}
                            className="rounded-md text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
                            aria-label="View details"
                          >
                            <Eye className="h-5 w-5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteClick(estimate)}
                            className="rounded-md text-rose-400 transition-colors hover:bg-rose-50 hover:text-rose-600"
                            aria-label="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

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
        </CardContent>
      </Card>

      {/* Modals */}
      <EstimateViewModal
        open={showViewModal}
        onClose={() => {
          setShowViewModal(false)
          setSelectedEstimate(null)
        }}
        estimate={selectedEstimate}
        onEdit={(e) => {
          setShowViewModal(false)
          setSelectedEstimate(e)
          setShowEditModal(true)
        }}
      />

      <EstimateEditModal
        open={showEditModal}
        onClose={() => {
          setShowEditModal(false)
          setSelectedEstimate(null)
        }}
        estimate={selectedEstimate}
        onSave={handleSaveEdit}
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

      <ConfirmDialog
        open={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false)
          setSelectedEstimate(null)
        }}
        onConfirm={handleConfirmDelete}
        title={t('estimates.deleteTitle')}
        description={t('estimates.deleteDescription')}
        confirmText="Delete"
        cancelText={t('common.cancel')}
        variant="danger"
      />
    </div>
  )
}
