// Daily Safety Checklist submissions
export type SafetyChecklistStatus = 'Reviewed' | 'Pending'

export interface SafetyChecklistSubmission {
  id: string
  projectName: string
  supervisorName: string
  supervisorRole: string
  dateSubmitted: string
  status: SafetyChecklistStatus
  checklistItems: SafetyChecklistItem[]
  notes?: string
}

export interface SafetyChecklistItem {
  id: string
  label: string
  value: 'Yes' | 'No'
}

// Incident Report submissions
export interface IncidentReportSubmission {
  id: string
  projectName: string
  reporterName: string
  incidentType: string
  dateTime: string
  logistics?: IncidentLogistics
  peopleInvolved?: IncidentPeople
  incidentDetails?: IncidentDetails
}

export interface IncidentLogistics {
  employeeName: string
  date: string
  time: string
  location: string
}

export interface IncidentPeople {
  involvedPerson: string
  witnessName: string
}

export interface IncidentDetails {
  incidentType: string
  description: string
}

// Safety template items
export interface SafetyTemplateItem {
  id: string
  label: string
}

// Mock data
export const mockSafetyChecklistSubmissions: SafetyChecklistSubmission[] = [
  {
    id: 'sc-1',
    projectName: 'Green Villa Project',
    supervisorName: 'Jhon Lura',
    supervisorRole: 'Supervisor',
    dateSubmitted: '22 Feb, 2025',
    status: 'Reviewed',
    checklistItems: [
      { id: '1', label: 'PPE worn by all staff', value: 'No' },
      { id: '2', label: 'PPE worn by all staff', value: 'Yes' },
      { id: '3', label: 'PPE worn by all staff', value: 'Yes' },
      { id: '4', label: 'PPE worn by all staff', value: 'No' },
      { id: '5', label: 'PPE worn by all staff', value: 'Yes' },
      { id: '6', label: 'PPE worn by all staff', value: 'Yes' },
    ],
    notes: 'SDFHSDJHIFKJSDN',
  },
  {
    id: 'sc-2',
    projectName: 'Green Villa Project',
    supervisorName: 'Jhon Lura',
    supervisorRole: 'Supervisor',
    dateSubmitted: '22 Feb, 2025',
    status: 'Pending',
    checklistItems: [
      { id: '1', label: 'PPE worn by all staff', value: 'Yes' },
      { id: '2', label: 'PPE worn by all staff', value: 'Yes' },
    ],
  },
  ...Array.from({ length: 7 }, (_, i) => ({
    id: `sc-${i + 3}`,
    projectName: 'Green Villa Project',
    supervisorName: 'Jhon Lura',
    supervisorRole: 'Supervisor',
    dateSubmitted: '22 Feb, 2025',
    status: (i % 2 === 0 ? 'Reviewed' : 'Pending') as SafetyChecklistStatus,
    checklistItems: [
      { id: '1', label: 'PPE worn by all staff', value: 'Yes' as const },
      { id: '2', label: 'PPE worn by all staff', value: 'No' as const },
    ],
  })),
]

export const mockIncidentReportSubmissions: IncidentReportSubmission[] = [
  {
    id: 'ir-1',
    projectName: 'Green Villa Project',
    reporterName: 'Jhon Doe',
    incidentType: 'Break Fail',
    dateTime: 'Feb 23, 09:30 am',
    logistics: {
      employeeName: 'Jhon Lura',
      date: 'Oct 24, 2024',
      time: '14:32 PM',
      location: '12 Street, House 78',
    },
    peopleInvolved: {
      involvedPerson: 'Marcus Jhonson',
      witnessName: 'Lucas Leo',
    },
    incidentDetails: {
      incidentType: 'Break Fail',
      description: 'Lucas Leo',
    },
  },
  ...Array.from({ length: 5 }, (_, i) => ({
    id: `ir-${i + 2}`,
    projectName: 'Green Villa Project',
    reporterName: 'Jhon Doe',
    incidentType: 'Break Fail',
    dateTime: 'Feb 23, 09:30 am',
    logistics: {
      employeeName: 'Jhon Lura',
      date: 'Oct 24, 2024',
      time: '14:32 PM',
      location: '12 Street, House 78',
    },
    peopleInvolved: {
      involvedPerson: 'Marcus Jhonson',
      witnessName: 'Lucas Leo',
    },
    incidentDetails: {
      incidentType: 'Break Fail',
      description: 'Lucas Leo',
    },
  })),
]

export const mockSafetyTemplateItems: SafetyTemplateItem[] = [
  { id: 't1', label: 'PPE worn by all staff' },
  { id: 't2', label: 'PPE worn by all staff' },
  { id: 't3', label: 'PPE worn by all staff' },
  { id: 't4', label: 'PPE worn by all staff' },
  { id: 't5', label: 'PPE worn by all staff' },
  { id: 't6', label: 'PPE worn by all staff' },
]
