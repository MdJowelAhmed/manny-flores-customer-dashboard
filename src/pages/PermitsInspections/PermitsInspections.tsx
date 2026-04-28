import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Pagination } from '@/components/common/Pagination'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { formatCurrency } from '@/utils/formatters'
import { cn } from '@/utils/cn'
import {
  mockPermits,
  filterPermitsForCurrentUser,
  computePermitStats,
  type PermitRow,
} from './permitsInspectionsData'
import { ModalWrapper } from '@/components/common/ModalWrapper'
import { EyeIcon } from 'lucide-react'
import { useAppSelector } from '@/redux/hooks'

type TabValue = 'all' | 'permit' | 'inspection'

export default function PermitsInspections() {
  const { user } = useAppSelector((state) => state.auth)

  const myPermits = useMemo(
    () => filterPermitsForCurrentUser(mockPermits, user),
    [user]
  )

  const [rows, setRows] = useState<PermitRow[]>([])
  const [activeTab, setActiveTab] = useState<TabValue>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(8)
  const [rowToDelete, setRowToDelete] = useState<PermitRow | null>(null)
  const [selectedRow, setSelectedRow] = useState<PermitRow | null>(null)

  useEffect(() => {
    setRows(myPermits)
    setCurrentPage(1)
    setSelectedRow((prev) => (prev ? myPermits.find((r) => r.id === prev.id) ?? null : null))
  }, [myPermits])

  const permitStats = useMemo(() => computePermitStats(rows), [rows])

  const filteredRows = useMemo(() => {
    if (activeTab === 'all') return rows
    return rows.filter((r) => r.category === activeTab)
  }, [rows, activeTab])

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / itemsPerPage))
  const pagedRows = filteredRows.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const handleDelete = () => {
    if (!rowToDelete) return
    setRows((prev) => prev.filter((r) => r.id !== rowToDelete.id))
    setRowToDelete(null)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div className="space-y-1">
        <h1 className="text-xl font-semibold text-foreground">Permits &amp; Inspections</h1>
        <p className="text-sm text-muted-foreground">
          Track permits and schedule inspections for your projects only.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        {permitStats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: index * 0.05 }}
              className="bg-white rounded-xl px-5 py-4 shadow-sm border border-gray-100"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className=" font-medium text-muted-foreground">{stat.title}</p>
                  <h3 className="text-xl font-bold text-foreground mt-1">
                    {stat.title.toLowerCase().includes('value')
                      ? formatCurrency(stat.value)
                      : stat.value}
                  </h3>
                </div>
                <div className={cn('p-2.5 rounded-lg', stat.iconBg)}>
                  <Icon className={cn('h-5 w-5', stat.iconColor)} />
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <Tabs value={activeTab} onValueChange={(val) => setActiveTab(val as TabValue)}>
          <TabsList className=" rounded-full p-1 h-11">
            <TabsTrigger
              value="all"
              className="rounded-sm px-5 py-2  md:text-sm data-[state=active]:bg-secondary data-[state=active]:text-white data-[state=inactive]:text-accent data-[state=inactive]:bg-secondary-foreground mr-6"
            >
              All
            </TabsTrigger>
            <TabsTrigger
              value="permit"
              className="rounded-sm px-5 py-2  md:text-sm data-[state=active]:bg-secondary data-[state=active]:text-white data-[state=inactive]:text-accent data-[state=inactive]:bg-secondary-foreground mr-6"
            >
              Permit
            </TabsTrigger>
            <TabsTrigger
              value="inspection"
              className="rounded-sm px-5 py-2  md:text-sm data-[state=active]:bg-secondary data-[state=active]:text-white data-[state=inactive]:text-accent data-[state=inactive]:bg-secondary-foreground"
            >
              Inspections
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 border-b">
              <tr className=" text-muted-foreground">
                <th className="px-4 py-4 text-left font-medium">ID</th>
                <th className="px-4 py-4 text-left font-medium">Permit</th>
                <th className="px-4 py-4 text-left font-medium">Customer</th>
                <th className="px-4 py-4 text-left font-medium">Project</th>
                <th className="px-4 py-4 text-left font-medium">Type</th>
                <th className="px-4 py-4 text-left font-medium">Status</th>
                <th className="px-4 py-4 text-left font-medium">Applied</th>
                <th className="px-4 py-4 text-left font-medium">Expiry</th>
                <th className="px-4 py-4 text-right font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {pagedRows.length === 0 ? (
                <tr>
                  <td
                    colSpan={9}
                    className="px-4 py-8 text-center text-sm text-muted-foreground"
                  >
                    No records found
                  </td>
                </tr>
              ) : (
                pagedRows.map((row) => (
                  <tr key={row.id} className="border-b last:border-0">
                    <td className="px-4 py-3  text-muted-foreground">
                      #{row.id.toString().padStart(2, '0')}
                    </td>
                    <td className="px-4 py-3  font-medium text-foreground">
                      {row.permitId}
                    </td>
                    <td className="px-4 py-3  text-foreground">{row.customer}</td>
                    <td className="px-4 py-3  text-muted-foreground">{row.project}</td>
                    <td className="px-4 py-3  text-muted-foreground">{row.type}</td>
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          'inline-flex items-center px-3 py-1 rounded-full  font-medium',
                          row.status === 'Approved'
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-amber-50 text-amber-700'
                        )}
                      >
                        {row.status}
                      </span>
                    </td>
                    <td className="px-4 py-3  text-muted-foreground">{row.applied}</td>
                    <td className="px-4 py-3  text-muted-foreground">{row.expiry}</td>
                    <td className="px-4 py-3 text-right space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-none px-4 "
                        onClick={() => setSelectedRow(row)}
                      >
                        <EyeIcon className="h-5 w-5" />
                      </Button>
                      {/* <Button
                        variant="outline"
                            size="icon-sm"
                            className=" border-none text-red-500 hover:bg-red-50"
                        onClick={() => setRowToDelete(row)}
                      >
                        <Trash2 className="h-5 w-5" />
                      </Button> */}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={filteredRows.length}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
          onItemsPerPageChange={setItemsPerPage}
        />
      </div>

      <ConfirmDialog
        open={!!rowToDelete}
        onClose={() => setRowToDelete(null)}
        onConfirm={handleDelete}
        title="Delete record?"
        description="Are you sure you want to delete this permit/inspection record? This action cannot be undone."
      />

      {selectedRow && (
        <ModalWrapper
          open={!!selectedRow}
          onClose={() => setSelectedRow(null)}
          title={selectedRow.permitId}
          description="Permit & inspection details"
          size="md"
          className="bg-white"
        >
          <div className="space-y-4 text-sm">
            <div className="space-y-2 rounded-lg border border-gray-100 bg-slate-50/60 p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Project
              </p>
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground shrink-0">Code</span>
                <span className="font-mono font-medium text-foreground text-right">
                  {selectedRow.projectCode}
                </span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground shrink-0">Name</span>
                <span className="font-medium text-foreground text-right">{selectedRow.project}</span>
              </div>
            </div>

            <div className="space-y-2 rounded-lg border border-gray-100 bg-slate-50/60 p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Related invoice
              </p>
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground shrink-0">Invoice #</span>
                <span className="font-mono font-medium text-foreground text-right">
                  {selectedRow.relatedInvoiceNumber}
                </span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground shrink-0">Date</span>
                <span className="font-medium text-foreground text-right">
                  {selectedRow.relatedInvoiceDate}
                </span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground shrink-0">Amount</span>
                <span className="font-medium text-foreground text-right">
                  {formatCurrency(selectedRow.relatedInvoiceAmount)}
                </span>
              </div>
              <div className="flex justify-between gap-4 items-center">
                <span className="text-muted-foreground shrink-0">Payment</span>
                <span
                  className={cn(
                    'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                    selectedRow.relatedInvoiceStatus === 'Paid'
                      ? 'bg-emerald-50 text-emerald-700'
                      : selectedRow.relatedInvoiceStatus === 'Pending'
                        ? 'bg-amber-50 text-amber-700'
                        : 'bg-slate-100 text-slate-700'
                  )}
                >
                  {selectedRow.relatedInvoiceStatus}
                </span>
              </div>
            </div>

            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground shrink-0">Customer</span>
              <span className="font-medium text-foreground text-right">{selectedRow.customer}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground shrink-0">Email</span>
              <span className="font-medium text-foreground text-right break-all">
                {selectedRow.customerEmail}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Type</span>
              <span className="font-medium text-foreground">{selectedRow.type}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Category</span>
              <span className="font-medium capitalize text-foreground">
                {selectedRow.category}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Status</span>
              <span
                className={cn(
                  'inline-flex items-center px-3 py-1 rounded-full  font-medium',
                  selectedRow.status === 'Approved'
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'bg-amber-50 text-amber-700'
                )}
              >
                {selectedRow.status}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Applied</span>
              <span className="font-medium text-foreground">{selectedRow.applied}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Expiry</span>
              <span className="font-medium text-foreground">{selectedRow.expiry}</span>
            </div>
          </div>
        </ModalWrapper>
      )}
    </motion.div>
  )
}

