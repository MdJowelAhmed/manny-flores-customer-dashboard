import { useState, useMemo, useEffect } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Calendar, UserCheck, UserX, Clock, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { Pagination } from '@/components/common/Pagination'
import { AttendanceDetailTable } from './AttendanceDetailTable'
import { ViewAttendanceDetailsModal } from './components/ViewAttendanceDetailsModal'
import { AddEditAttendanceModal } from './components/AddEditAttendanceModal'
import {
  mockAttendanceData,
  getEmployeeName,
  employeeProfiles,
  type AttendanceRecord,
} from './attendanceData'
import { toast } from '@/utils/toast'
import { cn } from '@/utils/cn'

const detailStats = [
  { key: 'totalDays', title: 'Total Days', icon: Calendar, iconBg: 'bg-blue-100', iconColor: 'text-blue-600' },
  { key: 'present', title: 'Present', icon: UserCheck, iconBg: 'bg-teal-100', iconColor: 'text-teal-600' },
  { key: 'absent', title: 'Absent', icon: UserX, iconBg: 'bg-amber-100', iconColor: 'text-amber-600' },
  { key: 'late', title: 'Late Arrivals', icon: Clock, iconBg: 'bg-green-100', iconColor: 'text-green-600' },
]

export default function AttendanceDetail() {
  const { employeeSlug } = useParams<{ employeeSlug: string }>()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const currentPage = Math.max(1, parseInt(searchParams.get('page') || '1', 10))
  const itemsPerPage = Math.max(1, parseInt(searchParams.get('limit') || '10', 10)) || 10

  const employeeName = employeeSlug ? getEmployeeName(employeeSlug) : ''
  const profile = employeeName ? employeeProfiles[employeeName] : null

  const [records, setRecords] = useState<AttendanceRecord[]>(() =>
    mockAttendanceData.filter((r) => r.employee === employeeName)
  )
  const [selectedRecord, setSelectedRecord] = useState<AttendanceRecord | null>(null)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false)
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)
  const [recordToDelete, setRecordToDelete] = useState<AttendanceRecord | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const totalPages = Math.max(1, Math.ceil(records.length / itemsPerPage))

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

  useEffect(() => {
    if (currentPage > totalPages && totalPages >= 1) setPage(1)
  }, [totalPages, currentPage])

  const paginatedRecords = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage
    return records.slice(start, start + itemsPerPage)
  }, [records, currentPage, itemsPerPage])

  const stats = useMemo(() => {
    const total = records.length
    const present = records.filter((r) => r.status === 'Present').length
    const absent = records.filter((r) => r.status === 'Absent').length
    const late = records.filter((r) => r.status === 'Late').length
    return { totalDays: total, present, absent, late }
  }, [records])

  const todayRecord = useMemo(() => {
    const today = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
    return records.find((r) => r.date === today) ?? records[0]
  }, [records])

  const handleView = (r: AttendanceRecord) => {
    setSelectedRecord(r)
    setIsViewModalOpen(true)
  }

  const handleEdit = (r: AttendanceRecord, e: React.MouseEvent) => {
    e?.stopPropagation?.()
    setSelectedRecord(r)
    setIsAddEditModalOpen(true)
  }

  const handleSave = (data: Partial<AttendanceRecord>) => {
    if (data.id) {
      setRecords((prev) =>
        prev.map((r) =>
          r.id === data.id
            ? {
                ...r,
                ...data,
                date: data.date ?? r.date,
                status: data.status ?? r.status,
                checkIn: data.checkIn ?? r.checkIn,
                checkOut: data.checkOut ?? r.checkOut,
                totalHours: data.totalHours ?? r.totalHours,
                isActive: data.isActive ?? r.isActive,
              }
            : r
        )
      )
    }
    setIsAddEditModalOpen(false)
    setSelectedRecord(null)
  }

  const handleMarkAbsent = () => {
    if (selectedRecord) {
      setRecords((prev) =>
        prev.map((r) =>
          r.id === selectedRecord.id
            ? { ...r, status: 'Absent' as const, checkIn: '--:--', checkOut: '--:--', totalHours: '--:--' }
            : r
        )
      )
      toast({ variant: 'success', title: 'Updated', description: 'Marked as absent.' })
      setIsViewModalOpen(false)
      setSelectedRecord(null)
    }
  }

  const handleStatusChange = (r: AttendanceRecord, isActive: boolean) => {
    setRecords((prev) =>
      prev.map((rec) => (rec.id === r.id ? { ...rec, isActive } : rec))
    )
    toast({
      variant: 'success',
      title: 'Status Updated',
      description: `Record marked as ${isActive ? 'Active' : 'Inactive'}.`,
    })
  }

  const handleDelete = (r: AttendanceRecord) => {
    setRecordToDelete(r)
    setIsConfirmOpen(true)
  }

  const handleDeleteFromView = () => {
    if (selectedRecord) {
      setRecordToDelete(selectedRecord)
      setIsViewModalOpen(false)
      setIsConfirmOpen(true)
    }
  }

  const handleConfirmDelete = async () => {
    if (!recordToDelete) return
    setIsDeleting(true)
    try {
      await new Promise((r) => setTimeout(r, 300))
      setRecords((prev) => prev.filter((r) => r.id !== recordToDelete.id))
      toast({ variant: 'success', title: 'Record Deleted', description: 'Attendance record removed.' })
      setIsConfirmOpen(false)
      setRecordToDelete(null)
      if (selectedRecord?.id === recordToDelete.id) setSelectedRecord(null)
    } catch {
      toast({ title: 'Error', description: 'Failed to delete.', variant: 'destructive' })
    } finally {
      setIsDeleting(false)
    }
  }

  if (!employeeSlug || !employeeName) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-muted-foreground mb-4">Employee not found</p>
        <Button variant="outline" onClick={() => navigate('/attendance')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Attendance
        </Button>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* <Button
        variant="ghost"
        size="sm"
        onClick={() => navigate('/attendance')}
        className="text-muted-foreground -ml-1"
      >
        <ArrowLeft className="h-4 w-4 mr-1" />
        Back
      </Button> */}

      {/* Profile + Current Day Summary */}
      <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={profile?.avatar} alt={employeeName} />
            <AvatarFallback className="bg-primary/20 text-primary text-lg">
              {employeeName
                .split(' ')
                .map((s) => s[0])
                .join('')}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-xl font-bold text-foreground">{employeeName}</h1>
            <p className="text-sm text-muted-foreground">{profile?.role ?? 'Employee'}</p>
          </div>
        </div>
        <div className="flex items-center gap-4 sm:gap-6 py-3 px-4 rounded-lg ">
          <div>
            <p className="text-sm text-muted-foreground mt-1">Check In</p>
            <p className="text-base font-bold text-foreground">{todayRecord?.checkIn ?? '--:--'}</p>
          </div>
          <div className="w-px h-10 bg-emerald-400" />
          <div>
            <p className="text-sm text-muted-foreground mt-1">Check Out</p>
            <p className="text-base font-bold text-foreground">{todayRecord?.checkOut ?? '--:--'}</p>
          </div>
          <div className="w-px h-10 bg-amber-400" />
          <div>
            <p className="text-sm text-muted-foreground mt-1">Today Working Period</p>
            <p className="text-base font-bold text-foreground">{todayRecord?.totalHours ?? '--:--'}</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {detailStats.map((s, index) => {
          const Icon = s.icon
          const value = stats[s.key as keyof typeof stats]
          return (
            <motion.div
              key={s.key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className="bg-white rounded-xl px-5 py-5 shadow-sm border border-gray-100"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{s.title}</p>
                  <h3 className="text-xl font-bold text-foreground mt-1">{value}</h3>
                </div>
                <div className={cn('p-2.5 rounded-lg', s.iconBg)}>
                  <Icon className={cn('h-5 w-5', s.iconColor)} />
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Attendance History Table */}
      <div className="rounded-xl border border-gray-100 bg-white overflow-hidden shadow-sm">
       
        <AttendanceDetailTable
          records={paginatedRecords}
          onView={handleView}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onStatusChange={handleStatusChange}
        />
        {records.length > 0 && (
          <div className="border-t border-gray-100 px-4 py-3">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={records.length}
              itemsPerPage={itemsPerPage}
              onPageChange={setPage}
              onItemsPerPageChange={setLimit}
              showItemsPerPage
            />
          </div>
        )}
      </div>

      <ViewAttendanceDetailsModal
        open={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false)
          setSelectedRecord(null)
        }}
        record={selectedRecord}
        onEdit={() => {
          setIsViewModalOpen(false)
          setIsAddEditModalOpen(true)
        }}
        onMarkAbsent={handleMarkAbsent}
        onDelete={handleDeleteFromView}
      />

      <AddEditAttendanceModal
        open={isAddEditModalOpen}
        onClose={() => {
          setIsAddEditModalOpen(false)
          setSelectedRecord(null)
        }}
        record={selectedRecord}
        onSave={handleSave}
      />

      <ConfirmDialog
        open={isConfirmOpen}
        onClose={() => {
          setIsConfirmOpen(false)
          setRecordToDelete(null)
        }}
        onConfirm={handleConfirmDelete}
        title="Delete Attendance"
        description="Are you sure you want to delete this record? This action cannot be undone."
        confirmText="Delete"
        variant="danger"
        isLoading={isDeleting}
      />
    </motion.div>
  )
}
