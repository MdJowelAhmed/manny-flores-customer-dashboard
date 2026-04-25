import { useMemo, useRef, useState, useEffect } from 'react'
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
import { useAppSelector } from '@/redux/hooks'

const ITEMS_PER_PAGE = 6

export default function InvoicePage() {
  const { t } = useTranslation()
  const user = useAppSelector((s) => s.auth.user)
  const currentCustomerName = user ? `${user.firstName} ${user.lastName}`.trim() : 'Karim Ullah'
  const currentCustomerEmail = user?.email?.toLowerCase().trim() ?? ''

  const [invoices, setInvoices] = useState<Invoice[]>(invoicesData)
  const seededRef = useRef(false)
  const userTouchedRef = useRef(false)
  const [filterDate, setFilterDate] = useState<Date | undefined>(undefined)
  const [calendarOpen, setCalendarOpen] = useState(false)
  const [selected, setSelected] = useState<Invoice | null>(null)
  const [viewOpen, setViewOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(ITEMS_PER_PAGE)

  const visibleInvoices = useMemo(() => {
    return invoices.filter((inv) => {
      if (inv.customerName === currentCustomerName) return true
      if (currentCustomerEmail && inv.customerEmail?.toLowerCase().trim() === currentCustomerEmail) return true
      return false
    })
  }, [invoices, currentCustomerName, currentCustomerEmail])

  useEffect(() => {
    if (seededRef.current) return
    if (userTouchedRef.current) return
    if (visibleInvoices.length > 0) {
      seededRef.current = true
      return
    }

    // Seed 3-5 invoices for the current user (demo only, state-based).
    setInvoices((prev) => {
      const seeded = prev.map((inv, idx) => {
        if (idx >= 5) return inv
        return {
          ...inv,
          customerName: currentCustomerName,
          customerEmail: currentCustomerEmail || inv.customerEmail,
          customerPhone: inv.customerPhone ?? '+1 (555) 201-2033',
          customerAddress: inv.customerAddress ?? '120 Oak Ridge Dr, Austin, TX 78701',
        }
      })
      return seeded
    })

    seededRef.current = true
  }, [currentCustomerName, currentCustomerEmail, visibleInvoices.length])

  const filteredInvoices = useMemo(() => {
    if (!filterDate) return visibleInvoices
    const key = format(filterDate, 'yyyy-MM-dd')
    return visibleInvoices.filter((inv) => {
      try {
        const d = parseISO(inv.invoiceDate)
        return isValid(d) && format(d, 'yyyy-MM-dd') === key
      } catch {
        return false
      }
    })
  }, [visibleInvoices, filterDate])

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
    userTouchedRef.current = true
    setSelected(inv)
    setViewOpen(true)
  }

  const handleApproveInvoice = (id: string, payload: { signatureDataUrl: string; approvedAt: string }) => {
    userTouchedRef.current = true
    setInvoices((prev) =>
      prev.map((x) =>
        x.id === id
          ? {
              ...x,
              status: 'paid',
              signatureDataUrl: payload.signatureDataUrl,
              approvedAt: payload.approvedAt,
            }
          : x
      )
    )

    // Keep modal content in sync if currently open.
    setSelected((prev) => {
      if (!prev) return prev
      if (prev.id !== id) return prev
      return {
        ...prev,
        status: 'paid',
        signatureDataUrl: payload.signatureDataUrl,
        approvedAt: payload.approvedAt,
      }
    })
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

      {selected ? (
        <InvoiceViewModal
          open={viewOpen}
          onClose={() => {
            setViewOpen(false)
            setSelected(null)
          }}
          invoice={selected}
          onApprove={handleApproveInvoice}
        />
      ) : null}
    </div>
  )
}
