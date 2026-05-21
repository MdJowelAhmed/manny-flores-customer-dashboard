import { baseApi } from '../baseApi'
import { format } from 'date-fns'
import {
    formatProjectDisplayDate,
    type Project,
    type ProjectStatus,
} from '@/pages/Projects/projectsData'

export interface ProjectPagination {
    total: number
    page: number
    limit: number
    totalPage: number
}

export interface ProjectEstimateApiDoc {
    id: string
    projectName: string
    customerName: string
    customerEmail: string
    customerAddress: string
    estimateStartDate: string
    estimateEndDate: string
    description: string
    createdAt: string
    updatedAt: string
    userId: string
    taxNumber: number
    isApproved: boolean
    totalCost: number | null
    projectStatus: string
}

export interface ProjectInvoiceSignatureApiDoc {
    id: string
    estimateId: string
    customerSignature: string
    isProvideSignature: boolean
    createdAt: string
    updatedAt: string
    userId: string
}

export interface ProjectApiDoc {
    id: string
    estimateId: string
    invoiceWithSignaturesId: string
    status: string
    clientId: string
    createdAt: string
    updatedAt: string
    estimates: ProjectEstimateApiDoc
    invoiceWithSignatures: ProjectInvoiceSignatureApiDoc
}

export interface ProjectListResponse {
    success: boolean
    statusCode?: number
    message: string
    pagination: ProjectPagination
    data: ProjectApiDoc[]
}

export interface GetProjectsParams {
    page?: number
    limit?: number
}

function resolveAssetUrl(path?: string | null): string | undefined {
    if (!path) return undefined
    if (path.startsWith('http://') || path.startsWith('https://')) return path
    const base = (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/$/, '')
    return `${base}${path.startsWith('/') ? path : `/${path}`}`
}

function toIsoDateOnly(date: string): string {
    const parsed = new Date(date)
    if (Number.isNaN(parsed.getTime())) return date
    return format(parsed, 'yyyy-MM-dd')
}

function mapProjectStatus(apiStatus: string, estimateStatus?: string): ProjectStatus {
    const status = apiStatus.toUpperCase()
    const estimate = estimateStatus?.toUpperCase() ?? ''

    if (status === 'COMPLETED' || estimate === 'COMPLETED') return 'Completed'
    if (status === 'IN_PROGRESS' || estimate === 'IN_PROGRESS') return 'In Progress'
    if (status === 'SCHEDULED') return 'Scheduled'
    return 'Pending Approval'
}

function formatProjectValue(totalCost: number | null | undefined): string {
    const amount = Number(totalCost ?? 0)
    if (amount <= 0) return '—'
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount)
}

export function mapProjectApiDocToUi(doc: ProjectApiDoc): Project {
    const estimate = doc.estimates
    const startDate = toIsoDateOnly(estimate.estimateStartDate)
    const endDate = toIsoDateOnly(estimate.estimateEndDate)
    const status = mapProjectStatus(doc.status, estimate.projectStatus)

    return {
        id: doc.id,
        estimateId: doc.estimateId,
        projectName: estimate.projectName,
        category: estimate.projectName,
        customerName: estimate.customerName,
        status,
        progress: 0,
        taxPercent: Number(estimate.taxNumber ?? 0),
        location: estimate.customerAddress || '—',
        dateRange: `${formatProjectDisplayDate(startDate)} - ${formatProjectDisplayDate(endDate)}`,
        projectValue: formatProjectValue(estimate.totalCost),
        description: estimate.description || undefined,
        startDate,
        endDate,
        customerEmail: estimate.customerEmail,
        signatureUrl: resolveAssetUrl(doc.invoiceWithSignatures?.customerSignature),
        hasSignature: doc.invoiceWithSignatures?.isProvideSignature ?? false,
    }
}

const projectApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getProjects: builder.query<ProjectListResponse, GetProjectsParams | void>({
            query: (params) => ({
                url: '/project',
                method: 'GET',
                params: {
                    page: params?.page ?? 1,
                    limit: params?.limit ?? 10,
                },
            }),
            providesTags: ['Project'],
        }),
    }),
})

export const { useGetProjectsQuery } = projectApi
