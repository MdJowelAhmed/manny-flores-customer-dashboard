export type AttendanceStatus = 'Present' | 'Absent'

export interface TodaySummary {
  checkIn: string
  checkOut: string
  workingPeriod: string
}

export interface AttendanceRecord {
  id: string
  date: string
  checkIn: string
  checkOut: string
  workHour: string
  attendance: AttendanceStatus
}

export const todaySummaryData: TodaySummary = {
  checkIn: '09:10 am',
  checkOut: '06:15 pm',
  workingPeriod: '1 hr 30 min',
}

export const ATTENDANCE_FILTER_OPTIONS = [
  { value: 'all', label: 'All' },
  { value: 'Present', label: 'Present' },
  { value: 'Absent', label: 'Absent' },
]

export const mockAttendanceRecords: AttendanceRecord[] = [
  {
    id: 'att-1',
    date: '21 February, 2025',
    checkIn: '09:00 AM',
    checkOut: '06:00 PM',
    workHour: '1 hr 30 min',
    attendance: 'Present',
  },
  {
    id: 'att-2',
    date: '21 February, 2025',
    checkIn: '09:00 AM',
    checkOut: '06:00 PM',
    workHour: '1 hr 30 min',
    attendance: 'Present',
  },
  {
    id: 'att-3',
    date: '21 February, 2025',
    checkIn: '--',
    checkOut: '--',
    workHour: '--',
    attendance: 'Absent',
  },
  {
    id: 'att-4',
    date: '21 February, 2025',
    checkIn: '09:00 AM',
    checkOut: '06:00 PM',
    workHour: '1 hr 30 min',
    attendance: 'Present',
  },
  {
    id: 'att-5',
    date: '21 February, 2025',
    checkIn: '--',
    checkOut: '--',
    workHour: '--',
    attendance: 'Absent',
  },
  {
    id: 'att-6',
    date: '21 February, 2025',
    checkIn: '09:00 AM',
    checkOut: '06:00 PM',
    workHour: '1 hr 30 min',
    attendance: 'Present',
  },
]
