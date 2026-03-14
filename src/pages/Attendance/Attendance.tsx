import { useMemo, useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

import { Card, CardContent } from '@/components/ui/card'
import { Pagination } from '@/components/common/Pagination'
import { FilterDropdown } from '@/components/common/FilterDropdown'
import {
  todaySummaryData,
  mockAttendanceRecords,
  ATTENDANCE_FILTER_OPTIONS,
  type AttendanceRecord,
} from './attendanceData'
import { format } from 'date-fns'
import { cn } from '@/utils/cn'

export default function Attendance() {
  const { t } = useTranslation()
  const [searchParams, setSearchParams] = useSearchParams()
  const currentPage = Math.max(1, parseInt(searchParams.get('page') || '1', 10))
  const itemsPerPage = parseInt(searchParams.get('limit') || '10', 10) || 10
  const [records] = useState<AttendanceRecord[]>(mockAttendanceRecords)
  const [filterStatus, setFilterStatus] = useState('all')
  const [presentChecked] = useState(true)
  const [absentChecked] = useState(false)

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

  const filteredRecords = useMemo(() => {
    let list = records
    if (filterStatus !== 'all') {
      list = list.filter((r) => r.attendance === filterStatus)
    }
    if (!presentChecked && absentChecked) {
      list = list.filter((r) => r.attendance === 'Absent')
    } else if (presentChecked && !absentChecked) {
      list = list.filter((r) => r.attendance === 'Present')
    } else if (!presentChecked && !absentChecked) {
      list = []
    }
    return list
  }, [records, filterStatus, presentChecked, absentChecked])

  const totalItems = filteredRecords.length
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage))

  useEffect(() => {
    if (currentPage > totalPages && totalPages >= 1) setPage(1)
  }, [totalPages, currentPage])

  const paginatedRecords = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage
    return filteredRecords.slice(start, start + itemsPerPage)
  }, [filteredRecords, currentPage, itemsPerPage])

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* Main content */}
      <div className="flex-1 space-y-6">
        {/* Top: Date selector + Summary card */}
        <div className="flex flex-col md:flex-row md:items-start gap-4">


          <Card className="flex-1 rounded-xl shadow-sm border border-gray-100">


            <CardContent className="p-6">
              <div className="flex  justify-between">
                <h2 className="text-2xl font-bold text-accent"> {format(new Date(), 'dd MMMM, yyyy')}</h2>
                <div className="flex flex-wrap items-center justify-around gap-4 divide-x divide-orange-400">
                  <div className="flex flex-col items-center gap-1 px-4 first:pl-0 last:pr-0">
                    <span className="text-sm text-muted-foreground">{t('attendance.checkIn')}</span>
                    <span className="font-bold text-accent text-lg">
                      {todaySummaryData.checkIn}
                    </span>
                  </div>
                  <div className="flex flex-col items-center gap-1 px-4">
                    <span className="text-sm text-muted-foreground">{t('attendance.checkOut')}</span>
                    <span className="font-bold text-accent text-lg">
                      {todaySummaryData.checkOut}
                    </span>
                  </div>
                  <div className="flex flex-col items-center gap-1 px-4">
                    <span className="text-sm text-muted-foreground">
                      {t('attendance.todayWorkingPeriod')}
                    </span>
                    <span className="font-bold text-accent text-lg">
                      {todaySummaryData.workingPeriod}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>


        <div className="flex items-center justify-end  ">
          <FilterDropdown
            value={filterStatus}
            options={ATTENDANCE_FILTER_OPTIONS}
            onChange={setFilterStatus}
            placeholder={t('attendance.all')}
          />
        </div>
        {/* Table section */}
        <div className="rounded-xl shadow-sm bg-white overflow-hidden">

          <div className="overflow-x-auto bg-white">
            <table className="w-full min-w-[500px]">
              <thead>
                <tr className="bg-secondary-foreground text-accent">
                  <th className="px-6 py-4 text-left text-sm font-bold">{t('attendance.date')}</th>
                  <th className="px-6 py-4 text-left text-sm font-bold">
                    {t('attendance.checkIn')}
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-bold">
                    {t('attendance.checkOut')}
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-bold">
                    {t('attendance.workHour')}
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-bold">
                    {t('attendance.attendance')}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {paginatedRecords.map((record) => (
                  <tr
                    key={record.id}
                    className="hover:bg-gray-50/50 transition-colors shadow-sm"
                  >
                    <td className="px-6 py-5 text-sm text-foreground">
                      {record.date}
                    </td>
                    <td className="px-6 py-5 text-sm text-foreground">
                      {record.checkIn}
                    </td>
                    <td className="px-6 py-5 text-sm text-foreground">
                      {record.checkOut}
                    </td>
                    <td className="px-6 py-5 text-sm text-foreground">
                      {record.workHour}
                    </td>
                    <td className="px-6 py-5">
                      <span
                        className={cn(
                          'font-medium',
                          record.attendance === 'Present'
                            ? 'text-green-600'
                            : 'text-red-600'
                        )}
                      >
                        {record.attendance}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {totalItems > 0 && (
            <div className="border-t border-gray-100">
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
      </div>


    </div>
  )
}
