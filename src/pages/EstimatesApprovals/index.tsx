import { useMemo, useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { format } from 'date-fns'
import { Eye, Trash2, Plus } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ConfirmDialog, Pagination } from '@/components/common'
import { STATUS_COLORS } from '@/utils/constants'
import { cn } from '@/utils/cn'
import {
  estimatesData,
  type Estimate,
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
    const config = STATUS_COLORS[status] || {
      bg: 'bg-gray-100',
      text: 'text-gray-800',
    }
    return cn('inline-flex rounded-full px-3 py-1 text-xs font-medium', config.bg, config.text)
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
    const nextId = String(Math.max(...estimates.map((e) => parseInt(e.id, 10)), 0) + 1)
    const code = `EST-2026-${String(nextId).padStart(3, '0')}`
    setEstimates((prev) => [
      ...prev,
      { ...newEstimate, id: nextId, estimateCode: code },
    ])
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
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            {t('estimates.title')}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {t('estimates.subtitle')}
          </p>
        </div>
        <Button
          className="bg-green-600 hover:bg-green-700 text-white gap-2"
          onClick={handleCreate}
        >
          <Plus className="h-5 w-5" />
          {t('estimates.createNew')}
        </Button>
      </div>

      {/* Filter tabs */}
      <div className="flex flex-wrap gap-5">
        {FILTER_TABS.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={cn(
              'rounded-md px-4 py-2 text-sm font-medium transition-colors',
              activeTab === tab
                ? 'bg-green-600 text-white'
                : 'bg-secondary-foreground text-gray-700 hover:bg-gray-200'
            )}
          >
            {tab === 'all' ? t('estimates.all') : tab}
          </button>
        ))}
      </div>

      {/* Table */}
      <Card className="bg-white border shadow-sm">
        <CardContent className="p-0">
          <div className="w-full overflow-auto">
            <table className="w-full min-w-[800px] ">
              <thead>
                <tr className="bg-secondary-foreground text-accent border-b">
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
              <tbody className="divide-y divide-gray-100 text-slate-700">
                {paginatedEstimates.map((estimate, idx) => (
                  <tr
                    key={estimate.id}
                    className={cn(
                      'hover:bg-gray-50/50 transition-colors shadow-sm',
                      idx % 2 === 1 && ''
                    )}
                  >
                    <td className="px-6 py-5 text-sm font-medium">
                      #{estimate.id}
                    </td>
                    <td className="px-6 py-5 text-sm">
                      {estimate.estimateCode}
                    </td>
                    <td className="px-6 py-5 text-sm">{estimate.project}</td>
                    <td className="px-6 py-5 text-sm font-medium">
                      {estimate.amount}
                    </td>
                    <td className="px-6 py-5">
                      <span className={getStatusClasses(estimate.status)}>
                        {estimate.status}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-sm">
                      {estimate.startDate}
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => handleView(estimate)}
                          className="text-gray-400 hover:text-gray-600 transition-colors"
                          aria-label="View details"
                        >
                          <Eye className="h-5 w-5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteClick(estimate)}
                          className="text-gray-400 hover:text-red-600 transition-colors"
                          aria-label="Delete"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
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

      {filteredEstimates.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          {t('estimates.noEstimates')}
        </div>
      )}

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
