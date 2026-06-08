import { useMemo, useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  PaymentTable,
  AddPaymentModal,
  RecordPaymentModal,
} from './components'
import {
  useGetPaymentsQuery,
  mapPaymentApiDocToUi,
} from '@/redux/api/paymentApi'
import {
  useGetProjectsQuery,
  mapProjectApiDocToUi,
} from '@/redux/api/projectApi'
import {
  buildProjectPayablePayment,
  isProjectPaymentDue,
} from '@/pages/Projects/projectPaymentUtils'
import type { Payment } from './paymentsData'

function parseMoney(value: string): number {
  const n = Number(String(value).replace(/[^0-9.-]/g, ''))
  return Number.isFinite(n) ? n : 0
}

export default function Payment() {
  const { t } = useTranslation()
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)

  const {
    data: paymentResponse,
    isLoading,
    isFetching,
    refetch,
  } = useGetPaymentsQuery({
    page: currentPage,
    limit: itemsPerPage,
  })

  const { data: projectsResponse } = useGetProjectsQuery({
    page: 1,
    limit: 100,
  })

  const payments = useMemo(() => {
    const rows = paymentResponse?.data ?? []
    return rows.map(mapPaymentApiDocToUi)
  }, [paymentResponse?.data])

  const payableProjects = useMemo(() => {
    const rows = projectsResponse?.data ?? []
    return rows
      .map(mapProjectApiDocToUi)
      .filter(isProjectPaymentDue)
      .map((project) =>
        buildProjectPayablePayment(project, parseMoney(project.projectValue))
      )
  }, [projectsResponse?.data])

  const pagination = paymentResponse?.pagination
  const totalItems = pagination?.total ?? payments.length
  const totalPages = Math.max(1, pagination?.totalPage ?? 1)

  useEffect(() => {
    if (currentPage > totalPages && totalPages >= 1) setCurrentPage(1)
  }, [totalPages, currentPage])

  useEffect(() => {
    setCurrentPage(1)
  }, [itemsPerPage])

  const handleView = (payment: Payment) => {
    setSelectedPayment(payment)
    setShowViewModal(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">{t('payment.title')}</h1>
          <p className="text-sm text-muted-foreground mt-1">{t('payment.subtitle')}</p>
        </div>
        <Button
          className="bg-green-600 hover:bg-green-700 text-white gap-2"
          onClick={() => setShowAddModal(true)}
        >
          <Plus className="h-5 w-5" />
          {t('payment.addPayment')}
        </Button>
      </div>

      {isLoading || isFetching ? (
        <div className="text-center py-12 text-muted-foreground">
          {t('common.loading', { defaultValue: 'Loading...' })}
        </div>
      ) : (
        <>
          <PaymentTable
            payments={payments}
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
          />

          {payments.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              {t('payment.noPayments')}
            </div>
          )}
        </>
      )}

      <AddPaymentModal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        payments={payableProjects}
        onSubmit={() => {}}
        onPaymentSuccess={() => {
          refetch()
          setShowAddModal(false)
        }}
      />

      <RecordPaymentModal
        open={showViewModal}
        onClose={() => {
          setShowViewModal(false)
          setSelectedPayment(null)
        }}
        payment={selectedPayment}
      />
    </div>
  )
}
