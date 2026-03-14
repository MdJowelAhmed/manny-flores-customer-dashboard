import { useMemo, useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Download } from 'lucide-react'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { Button } from '@/components/ui/button'
import { Pagination } from '@/components/common/Pagination'
import {
  mockPaymentHistoryData,
  type PaymentHistoryRecord,
} from './payrollData'
import { formatCurrency } from '@/utils/formatters'
import { toast } from '@/utils/toast'

export default function Payroll() {
  const [searchParams, setSearchParams] = useSearchParams()
  const currentPage = Math.max(1, parseInt(searchParams.get('page') || '1', 10))
  const itemsPerPage = parseInt(searchParams.get('limit') || '10', 10) || 10

  const [records] = useState<PaymentHistoryRecord[]>(mockPaymentHistoryData)

  const setPage = (p: number) => {
    const next = new URLSearchParams(searchParams)
    p > 1 ? next.set('page', String(p)) : next.delete('page')
    setSearchParams(next, { replace: true })
  }

  const setLimit = (l: number) => {
    const next = new URLSearchParams(searchParams)
    l !== 10 ? next.set('limit', String(l)) : next.delete('limit')
    next.delete('page')
    setSearchParams(next, { replace: true })
  }

  const totalItems = records.length
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage))

  useEffect(() => {
    if (currentPage > totalPages && totalPages >= 1) setPage(1)
  }, [totalPages, currentPage])

  const paginatedRecords = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage
    return records.slice(start, start + itemsPerPage)
  }, [records, currentPage, itemsPerPage])

  const handleDownloadAll = () => {
    try {
      const doc = new jsPDF()
      doc.setFontSize(20)
      doc.text('Payment History - Payslips', 105, 20, { align: 'center' })
      doc.setFontSize(10)
      doc.setTextColor(100, 100, 100)
      doc.text(
        `Generated on ${new Date().toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })}`,
        105,
        28,
        { align: 'center' }
      )
      doc.setTextColor(0, 0, 0)

      autoTable(doc, {
        startY: 38,
        head: [['Month', 'Overtime (hrs)', 'Net Pay', 'Status']],
        body: records.map((r) => [
          r.month,
          String(r.overtime),
          formatCurrency(r.netPay),
          r.status,
        ]),
        theme: 'grid',
        headStyles: {
          fillColor: [248, 241, 241],
          textColor: '#000000',
          fontStyle: 'bold',
          fontSize: 10,
        },
        styles: {
          fontSize: 9,
          cellPadding: 4,
        },
       
      })

      const fileName = `payslips-${new Date().toISOString().slice(0, 10)}.pdf`
      doc.save(fileName)

      toast({
        title: 'Payslips Downloaded',
        description: `Payment history PDF (${records.length} records) has been downloaded.`,
        variant: 'success',
      })
    } catch (err) {
      toast({
        title: 'Download Failed',
        description: 'Could not generate PDF. Please try again.',
        variant: 'destructive',
      })
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-xl font-bold text-accent">Payment History</h1>
        <Button
          onClick={handleDownloadAll}
          className="bg-primary text-white shrink-0 hover:bg-primary/90 rounded-lg"
        >
          <Download className="h-4 w-4 mr-2" />
          Download Payslip
        </Button>
      </div>

      <div className="rounded-xl border border-gray-100 bg-white overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-secondary-foreground text-accent">
                <th className="px-4 py-4 text-left text-sm font-semibold text-accent rounded-tl-xl">
                  Month
                </th>
                <th className="px-4 py-4 text-left text-sm font-semibold text-accent">
                  Overtime
                </th>
                <th className="px-4 py-4 text-left text-sm font-semibold text-accent">
                  Net Pay
                </th>
                <th className="px-4 py-4 text-left text-sm font-semibold text-accent rounded-tr-xl">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {paginatedRecords.map((record) => (
                <tr
                  key={record.id}
                  className="border-t border-gray-100 hover:bg-muted/30 transition-colors"
                >
                  <td className="px-4 py-3 text-sm text-foreground">
                    {record.month}
                  </td>
                  <td className="px-4 py-3 text-sm text-foreground">
                    {formatCurrency(record.overtime)}
                  </td>
                  <td className="px-4 py-3 text-sm text-foreground">
                    {formatCurrency(record.netPay)}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center gap-2 text-sm font-medium ${
                        record.status === 'Paid'
                          ? 'text-green-600'
                          : 'text-amber-600'
                      }`}
                    >
                      <span
                        className={`h-2 w-2 rounded-full ${
                          record.status === 'Paid'
                            ? 'bg-green-500'
                            : 'bg-amber-500'
                        }`}
                      />
                      {record.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {totalItems > 0 && (
          <div className="border-t border-gray-100 px-4 py-3">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={totalItems}
              itemsPerPage={itemsPerPage}
              onPageChange={setPage}
              onItemsPerPageChange={setLimit}
              showItemsPerPage
            />
          </div>
        )}
      </div>
    </motion.div>
  )
}
