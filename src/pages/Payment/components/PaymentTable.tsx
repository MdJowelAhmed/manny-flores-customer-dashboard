import { useTranslation } from 'react-i18next'
import { Eye } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Pagination } from '@/components/common'
import { STATUS_COLORS } from '@/utils/constants'
import { formatCurrency } from '@/utils/formatters'
import { cn } from '@/utils/cn'
import { formatPaymentStatusLabel, type Payment } from '../paymentsData'

interface PaymentTableProps {
  payments: Payment[]
  currentPage: number
  totalPages: number
  totalItems: number
  itemsPerPage: number
  onPageChange: (page: number) => void
  onItemsPerPageChange?: (limit: number) => void
  onView: (payment: Payment) => void
}

export function PaymentTable({
  payments,
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange,
  onView,
}: PaymentTableProps) {
  const { t } = useTranslation()

  const getStatusClasses = (status: string) => {
    const label = formatPaymentStatusLabel(status as Payment['status'])
    const config = STATUS_COLORS[label] ||
      STATUS_COLORS[status] || {
        bg: 'bg-gray-100',
        text: 'text-gray-800',
      }
    return cn('inline-flex rounded-full px-3 py-1 text-xs font-medium capitalize', config.bg, config.text)
  }

  return (
    <Card className="bg-white border shadow-sm">
      <CardContent className="p-0">
        <div className="w-full overflow-auto">
          <table className="w-full min-w-[900px]">
            <thead>
              <tr className="bg-[#CCF3F5] text-accent border-b">
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                  {t('payment.id')}
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                  {t('payment.project')}
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                  {t('payment.customer')}
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                  {t('payment.paymentAmount')}
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                  {t('payment.method')}
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                  {t('payment.paymentDate')}
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                  {t('payment.status')}
                </th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">
                  {t('payment.action')}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-slate-700">
              {payments.map((payment) => (
                <tr key={payment.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-5 text-sm font-medium">
                    #{payment.id.slice(0, 8).toUpperCase()}
                  </td>
                  <td className="px-6 py-5 text-sm">{payment.project}</td>
                  <td className="px-6 py-5 text-sm">{payment.customer}</td>
                  <td className="px-6 py-5 text-sm font-medium">
                    {payment.amount != null
                      ? formatCurrency(payment.amount, 'USD')
                      : '—'}
                  </td>
                  <td className="px-6 py-5 text-sm">{payment.method}</td>
                  <td className="px-6 py-5 text-sm">{payment.paymentDate ?? '—'}</td>
                  <td className="px-6 py-5">
                    <span className={getStatusClasses(payment.status)}>
                      {formatPaymentStatusLabel(payment.status)}
                    </span>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onView(payment)}
                        className="text-gray-400 hover:text-gray-600 h-8 w-8"
                        aria-label="View details"
                      >
                        <Eye className="h-5 w-5" />
                      </Button>
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
            onPageChange={onPageChange}
            onItemsPerPageChange={onItemsPerPageChange}
            showItemsPerPage
          />
        )}
      </CardContent>
    </Card>
  )
}
