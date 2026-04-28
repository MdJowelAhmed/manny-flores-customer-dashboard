export type DocumentRequestStatus = 'pending' | 'submitted'

export interface DocumentRequest {
  id: string
  projectName: string
  projectCategory: string
  reason: string
  requestedBy: string
  requestedAt: string
  status: DocumentRequestStatus
  submittedAt?: string
  submittedFileName?: string
  submittedDescriptionHtml?: string
}

export const mockDocumentRequests: DocumentRequest[] = [
  {
    id: 'req-1',
    projectName: 'Garden Design & Installation',
    projectCategory: 'Residential',
    reason: 'Please upload the signed contract and any reference photos for the project.',
    requestedBy: 'Admin Office',
    requestedAt: 'Apr 27, 2026',
    status: 'pending',
  },
  {
    id: 'req-2',
    projectName: 'Backyard Renovation',
    projectCategory: 'Residential',
    reason: 'We need the HOA approval letter before scheduling permits.',
    requestedBy: 'Admin Office',
    requestedAt: 'Apr 20, 2026',
    status: 'submitted',
    submittedAt: 'Apr 21, 2026',
    submittedFileName: 'hoa_approval.pdf',
  },
]

