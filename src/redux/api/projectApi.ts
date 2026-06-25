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
    estimateStartDate?: string
    estimateEndDate?: string
    totalDate?: number
    description: string
    createdAt: string
    updatedAt: string
    userId: string
    taxNumber: number
    isApproved: boolean
    totalCost: number | null
    projectStatus: string
}

export interface ProjectScheduleApiDoc {
    id: string
    estimateId: string
    signature?: string | null
    projectStatus: string
    assignEmployee?: string[]
    teamId?: string | null
    projectStartDate?: string
    projectEndDate?: string
    createdAt: string
    updatedAt: string
    estimate: ProjectEstimateApiDoc
}

export interface ProjectListResponse {
    success: boolean
    statusCode?: number
    message: string
    pagination: ProjectPagination
    data: ProjectScheduleApiDoc[]
}

export interface GetProjectsParams {
    page?: number
    limit?: number
}

export interface CompleteProjectResponse {
    success: boolean
    statusCode?: number
    message: string
    data?: ProjectScheduleApiDoc
}

export type ProjectPaymentMethod = 'CARD' | 'CASH' | 'CHEQUE' | 'FINANCE'

export interface CreateProjectPaymentPayload {
    estimateId: string
    method: ProjectPaymentMethod
    amount?: number
    receiverId?: string
    checkImage?: File
    loanId?: string
    financeCompanyName?: string
}

export interface CardCheckoutPaymentData {
    checkoutUrl: string
    stripeCheckoutSessionId?: string
    estimateId: string
    amount?: number
    method: 'CARD'
}

export interface CreateProjectPaymentResponse {
    success: boolean
    statusCode?: number
    message: string
    data?: CardCheckoutPaymentData | Record<string, unknown>
}

export interface PaymentReceiver {
    id: string
    name: string
    email: string
    role: string
    profile: string | null
}

export interface PaymentReceiversResponse {
    success: boolean
    statusCode?: number
    message: string
    data: PaymentReceiver[]
}

function buildProjectPaymentFormData(payload: CreateProjectPaymentPayload): FormData {
    const formData = new FormData()
    formData.append('estimateId', payload.estimateId)
    formData.append('method', payload.method)
    if (payload.amount != null && payload.amount > 0) {
        formData.append('amount', String(payload.amount))
    }
    if (payload.receiverId) {
        formData.append('receiverId', payload.receiverId)
    }
    if (payload.checkImage) {
        formData.append('checkImage', payload.checkImage, payload.checkImage.name)
    }
    if (payload.loanId) {
        formData.append('loanId', payload.loanId)
    }
    if (payload.financeCompanyName) {
        formData.append('financeCompanyName', payload.financeCompanyName)
    }
    return formData
}

function toIsoDateOnly(date?: string): string {
    if (!date) return '—'
    const parsed = new Date(date)
    if (Number.isNaN(parsed.getTime())) return date
    return format(parsed, 'yyyy-MM-dd')
}

function mapProjectStatus(projectStatus?: string): ProjectStatus {
    const status = (projectStatus ?? '').toUpperCase()

    if (status === 'COMPLETED') return 'Completed'
    if (status === 'COMPLETED_REQUESTED') return 'Payment Due'
    if (status === 'IN_PROGRESS') return 'In Progress'
    if (status === 'SCHEDULED') return 'Scheduled'
    if (status === 'CANCELLED') return 'Cancelled'
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

export function mapProjectApiDocToUi(doc: ProjectScheduleApiDoc): Project {
    const estimate = doc.estimate
    const startDate = toIsoDateOnly(doc.projectStartDate ?? estimate.estimateStartDate ?? estimate.createdAt)
    const endDate = toIsoDateOnly(doc.projectEndDate ?? estimate.estimateEndDate ?? estimate.updatedAt)
    const estimateProjectStatus = estimate.projectStatus ?? ''
    const status = mapProjectStatus(estimateProjectStatus)

    return {
        id: doc.id,
        estimateId: doc.estimateId,
        projectName: estimate.projectName,
        category: estimate.projectName,
        customerName: estimate.customerName,
        status,
        estimateProjectStatus,
        progress: 0,
        taxPercent: Number(estimate.taxNumber ?? 0),
        location: estimate.customerAddress || '—',
        dateRange: `${formatProjectDisplayDate(startDate)} - ${formatProjectDisplayDate(endDate)}`,
        projectValue: formatProjectValue(estimate.totalCost),
        description: estimate.description || undefined,
        startDate,
        endDate,
        customerEmail: estimate.customerEmail,
        signatureUrl: doc.signature || undefined,
        hasSignature: !!doc.signature,
    }
}

const projectApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getProjects: builder.query<ProjectListResponse, GetProjectsParams | void>({
            query: (params) => ({
                url: '/estimate-schedules/user',
                method: 'GET',
                params: {
                    page: params?.page ?? 1,
                    limit: params?.limit ?? 10,
                },
            }),
            providesTags: ['Project'],
        }),
        completeProject: builder.mutation<CompleteProjectResponse, string>({
            query: (id) => ({
                url: `/estimate-schedules/mark-as-completed/${id}`,
                method: 'PATCH',
                body: { projectStatus: 'COMPLETED' },
            }),
            invalidatesTags: ['Project'],
        }),
        createProjectPayment: builder.mutation<
            CreateProjectPaymentResponse,
            CreateProjectPaymentPayload
        >({
            query: (payload) => ({
                url: '/payment',
                method: 'POST',
                body: buildProjectPaymentFormData(payload),
            }),
            invalidatesTags: ['Project', 'Payment'],
        }),

        getAllAdminAndEmployee: builder.query<PaymentReceiversResponse, void>({
            query: () => ({
                url: '/payment/admin',
                method: 'GET',
            }),
        }),
    }),
})

export const {
    useGetProjectsQuery,
    useCompleteProjectMutation,
    useCreateProjectPaymentMutation,
    useGetAllAdminAndEmployeeQuery,
} = projectApi
