import { useMemo, useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ConfirmDialog } from '@/components/common'
import {
  paymentsData,
  paymentSummaryData,
  paymentChartYearlyData,
  type Payment,
} from './paymentsData'
import {
  PaymentSummaryCards,
  PaymentVisibilityChart,
  PaymentStatusFilters,
  PaymentTable,
  AddPaymentModal,
  RecordPaymentModal,
} from './components'

export default function Payment() {
  const { t } = useTranslation()
  const [payments, setPayments] = useState<Payment[]>(paymentsData)
  const [activeFilter, setActiveFilter] = useState<string>('all')
  const [selectedYear, setSelectedYear] = useState('2025')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  const chartData = useMemo(
    () =>
      paymentChartYearlyData[selectedYear] ?? paymentChartYearlyData['2025'],
    [selectedYear]
  )

  const filteredPayments = useMemo(() => {
    if (activeFilter === 'all') return payments
    return payments.filter((p) => p.status === activeFilter)
  }, [payments, activeFilter])

  const totalItems = filteredPayments.length
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage))
  const paginatedPayments = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage
    return filteredPayments.slice(start, start + itemsPerPage)
  }, [filteredPayments, currentPage, itemsPerPage])

  useEffect(() => {
    if (currentPage > totalPages && totalPages >= 1) setCurrentPage(1)
  }, [totalPages, currentPage])

  useEffect(() => {
    setCurrentPage(1)
  }, [activeFilter])

  const handleAddPayment = (data: Omit<Payment, 'id'>) => {
    const nextId = String(
      Math.max(...payments.map((p) => parseInt(p.id, 10)), 0) + 1
    )
    const invoice =
      data.invoice ||
      `INV-${new Date().getFullYear()}-${String(nextId).padStart(3, '0')}`
    const newPayment: Payment = {
      ...data,
      id: nextId,
      invoice,
    }
    setPayments((prev) => [newPayment, ...prev])
    setShowAddModal(false)
  }

  const handleView = (payment: Payment) => {
    setSelectedPayment(payment)
    setShowViewModal(true)
  }

  const handleDeleteClick = (payment: Payment) => {
    setSelectedPayment(payment)
    setShowDeleteModal(true)
  }

  const handleConfirmDelete = () => {
    if (!selectedPayment) return
    setPayments((prev) => prev.filter((p) => p.id !== selectedPayment.id))
    setSelectedPayment(null)
    setShowDeleteModal(false)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            {t('payment.title')}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {t('payment.subtitle')}
          </p>
        </div>
        <Button
          className="bg-green-600 hover:bg-green-700 text-white gap-2"
          onClick={() => setShowAddModal(true)}
        >
          <Plus className="h-5 w-5" />
          {t('payment.addPayment')}
        </Button>
      </div>

      {/* Summary Cards */}
      <PaymentSummaryCards summary={paymentSummaryData} />

      {/* Chart */}
      <PaymentVisibilityChart
        chartData={chartData}
        selectedYear={selectedYear}
        onYearChange={setSelectedYear}
      />

      {/* Filter tabs */}
      <PaymentStatusFilters
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
      />

      {/* Table */}
      <PaymentTable
        payments={paginatedPayments}
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={totalItems}
        itemsPerPage={itemsPerPage}
        onPageChange={setCurrentPage}
        onItemsPerPageChange={(limit) => {
          setItemsPerPage(limit)
          setCurrentPage(1)
        }}
        onView={handleView}
        onDelete={handleDeleteClick}
      />

      {filteredPayments.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          {t('payment.noPayments')}
        </div>
      )}

      {/* Modals */}
      <AddPaymentModal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleAddPayment}
      />

      <RecordPaymentModal
        open={showViewModal}
        onClose={() => {
          setShowViewModal(false)
          setSelectedPayment(null)
        }}
        payment={selectedPayment}
      />

      <ConfirmDialog
        open={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false)
          setSelectedPayment(null)
        }}
        onConfirm={handleConfirmDelete}
        title={t('payment.deleteTitle')}
        description={t('payment.deleteDescription')}
        confirmText="Delete"
        cancelText={t('common.cancel')}
        variant="danger"
      />
    </div>
  )
}
