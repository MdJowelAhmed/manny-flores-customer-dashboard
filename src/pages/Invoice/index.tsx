import { useMemo, useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { format, parseISO, isValid } from 'date-fns'
import { Calendar as CalendarIcon } from 'lucide-react'
import { Calendar } from '@/components/ui/calendar'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Pagination } from '@/components/common'
import { cn } from '@/utils/cn'
import { invoicesData, type Invoice } from './invoicesData'
import { InvoiceCard } from './components/InvoiceCard'
import { InvoiceViewModal } from './components/InvoiceViewModal'

const ITEMS_PER_PAGE = 6

export default function InvoicePage() {
  const { t } = useTranslation()
  const [invoices] = useState<Invoice[]>(invoicesData)
  const [filterDate, setFilterDate] = useState<Date | undefined>(undefined)
  const [calendarOpen, setCalendarOpen] = useState(false)
  const [selected, setSelected] = useState<Invoice | null>(null)
  const [viewOpen, setViewOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(ITEMS_PER_PAGE)

  const filteredInvoices = useMemo(() => {
    if (!filterDate) return invoices
    const key = format(filterDate, 'yyyy-MM-dd')
    return invoices.filter((inv) => {
      try {
        const d = parseISO(inv.invoiceDate)
        return isValid(d) && format(d, 'yyyy-MM-dd') === key
      } catch {
        return false
      }
    })
  }, [invoices, filterDate])

  const totalItems = filteredInvoices.length
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage))
  const paginated = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage
    return filteredInvoices.slice(start, start + itemsPerPage)
  }, [filteredInvoices, currentPage, itemsPerPage])

  useEffect(() => {
    if (currentPage > totalPages && totalPages >= 1) setCurrentPage(1)
  }, [totalPages, currentPage])

  useEffect(() => {
    setCurrentPage(1)
  }, [filterDate])

  const openView = (inv: Invoice) => {
    setSelected(inv)
    setViewOpen(true)
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-800 sm:text-3xl">
          {t('invoice.title')}
        </h1>
        <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="outline"
              size="icon"
              className={cn(
                'h-10 w-10 shrink-0 rounded-lg border-gray-200 bg-gray-100 text-gray-700 shadow-none hover:bg-gray-200',
                filterDate && 'border-[#22c55e]/40 bg-[#22c55e]/10'
              )}
              aria-label={t('invoice.filterByDate')}
            >
              <CalendarIcon className="h-5 w-5" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="end">
            <Calendar
              mode="single"
              selected={filterDate}
              onSelect={(d) => {
                setFilterDate(d)
                if (d) setCalendarOpen(false)
              }}
              defaultMonth={filterDate ?? new Date()}
              captionLayout="dropdown"
              startMonth={new Date(2020, 0, 1)}
              endMonth={new Date(2030, 11, 31)}
            />
            <div className="border-t border-gray-100 p-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="w-full text-gray-600"
                onClick={() => {
                  setFilterDate(undefined)
                  setCalendarOpen(false)
                }}
              >
                {t('invoice.clearDate')}
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {filterDate && (
        <p className="-mt-4 text-sm text-gray-500">
          {t('invoice.showingFor')}{' '}
          <span className="font-medium text-gray-800">
            {format(filterDate, 'dd/MM/yyyy')}
          </span>
        </p>
      )}

      {totalItems === 0 ? (
        <div className="py-16 text-center text-sm text-gray-500">
          {t('invoice.noInvoices')}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {paginated.map((inv) => (
            <InvoiceCard
              key={inv.id}
              invoice={inv}
              viewLabel={t('invoice.viewInvoice')}
              onView={openView}
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
          onItemsPerPageChange={(n) => {
            setItemsPerPage(n)
            setCurrentPage(1)
          }}
          showItemsPerPage
        />
      )}

      <InvoiceViewModal
        open={viewOpen}
        onClose={() => {
          setViewOpen(false)
          setSelected(null)
        }}
        invoice={selected}
      />
    </div>
  )
}
