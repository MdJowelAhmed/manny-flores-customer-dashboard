import { baseApi } from '../baseApi'
import { format } from 'date-fns'
import {
    type Invoice,
    type InvoiceStatus,
    normalizeProjectInvoiceStatus,
} from '@/pages/Invoice/invoicesData'
import {
    computeEstimateTotal,
    type EstimateApiDoc,
    type EstimateMutationResponse,
} from './estimateApi'

export interface InvoicePagination {
    total: number
    page: number
    limit: number
    totalPage: number
}

export interface InvoiceApiDoc {
    id: string
    projectName: string
    customerName: string
    customerEmail: string
    customerAddress: string
    estimateStartDate: string
    estimateEndDate: string
    description: string
    taxNumber: number
    userId: string
    isApproved: boolean
    projectStatus: string
    totalCost: number | null
    createdAt: string
    updatedAt: string
    customerSignature?: string | null
}

export interface InvoiceListResponse {
    success: boolean
    statusCode?: number
    message: string
    pagination: InvoicePagination
    data: InvoiceApprovalApiDoc[]
}

export interface InvoiceSignatureResponse {
    success: boolean
    statusCode?: number
    message: string
    data?: unknown
}

export interface GetInvoicesParams {
    page?: number
    limit?: number
}

function dataUrlToFile(dataUrl: string, filename = 'customer-signature.png'): File {
    const [header, base64] = dataUrl.split(',')
    const mime = header?.match(/:(.*?);/)?.[1] ?? 'image/png'
    const binary = atob(base64)
    const bytes = new Uint8Array(binary.length)
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
    return new File([bytes], filename, { type: mime })
}

function computeInvoiceTotal(doc: InvoiceApiDoc): number {
    const fromApi = doc.totalCost != null ? Number(doc.totalCost) : 0
    const base = fromApi > 0 ? fromApi : 0
    const taxPct = Number(doc.taxNumber ?? 0)
    return Math.round(base * (1 + taxPct / 100))
}

function mapInvoiceStatus(doc: InvoiceApiDoc): InvoiceStatus {
    if (doc.customerSignature) return 'paid'
    const status = doc.projectStatus?.toUpperCase() ?? ''
    if (status === 'CANCELLED') return 'overdue'
    if (doc.isApproved && status === 'IN_PROGRESS') return 'pending'
    return 'pending'
}

function toIsoDateOnly(date: string): string {
    const parsed = new Date(date)
    if (Number.isNaN(parsed.getTime())) return date
    return format(parsed, 'yyyy-MM-dd')
}

export function mapInvoiceApiDocToUi(doc: InvoiceApiDoc): Invoice {
    const subtotal = Number(doc.totalCost ?? 0)
    const taxPercent = Number(doc.taxNumber ?? 0)
    const grandTotal = computeInvoiceTotal(doc)

    return {
        id: doc.id,
        refCode: `EST-${doc.id.slice(0, 8).toUpperCase()}`,
        customerName: doc.customerName,
        materialSummary: doc.projectName,
        summaryQty: 0,
        summaryCostCount: 0,
        amount: grandTotal,
        invoiceDate: toIsoDateOnly(doc.estimateStartDate),
        dueDate: toIsoDateOnly(doc.estimateEndDate),
        description: doc.description || undefined,
        status: mapInvoiceStatus(doc),
        projectStatus: normalizeProjectInvoiceStatus(doc.projectStatus),
        customerEmail: doc.customerEmail,
        customerAddress: doc.customerAddress,
        taxPercent,
        subtotal,
        labor: { quantity: 0, price: 0 },
        signatureDataUrl: doc.customerSignature ?? undefined,
        approvedAt: doc.customerSignature ? doc.updatedAt : undefined,
    }
}

export interface InvoiceApprovalApiDoc {
    id: string
    estimateId: string
    signature?: string | null
    estimateStatus?: string
    customerEmail: string
    customerName: string
    createdAt: string
    updatedAt: string
    estimate?: EstimateApiDoc
}

function mapApprovalToInvoiceStatus(approval: InvoiceApprovalApiDoc): InvoiceStatus {
    if (approval.signature) return 'paid'
    return 'pending'
}

export function mapInvoiceApprovalApiDocToUi(doc: InvoiceApprovalApiDoc): Invoice {
    const est = doc.estimate
    const taxPercent = Number(est?.taxNumber ?? 0)
    const subtotal = est ? computeEstimateTotal(est) : 0
    const amount = Math.round(subtotal * (1 + taxPercent / 100))
    const projectStatus = normalizeProjectInvoiceStatus(est?.projectStatus)
    const projectName = est?.projectName?.trim() || '—'

    return {
        id: doc.estimateId,
        approvalId: doc.id,
        refCode: `EST-${doc.estimateId.slice(0, 8).toUpperCase()}`,
        projectName,
        customerName: est?.customerName ?? doc.customerName,
        materialSummary: projectName,
        summaryQty: 0,
        summaryCostCount: 0,
        amount,
        invoiceDate: toIsoDateOnly(est?.createdAt ?? doc.createdAt),
        dueDate: toIsoDateOnly(est?.updatedAt ?? doc.updatedAt),
        description: est?.description || undefined,
        status: mapApprovalToInvoiceStatus(doc),
        projectStatus,
        customerEmail: est?.customerEmail ?? doc.customerEmail,
        customerAddress: est?.customerAddress ?? undefined,
        taxPercent,
        subtotal,
        signatureDataUrl: doc.signature ?? undefined,
        approvedAt: doc.signature ? doc.updatedAt : undefined,
        totalDate: est?.totalDate,
        estimate: est,
    }
}

const invoiceApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getInvoices: builder.query<InvoiceListResponse, GetInvoicesParams | void>({
            query: (params) => ({
                url: '/estimate-invoices/user',
                method: 'GET',
                params: {
                    page: params?.page ?? 1,
                    limit: params?.limit ?? 10,
                },
            }),
            providesTags: ['Invoice'],
        }),

        addInvoiceSignature: builder.mutation<
            InvoiceSignatureResponse,
            { estimateId: string; signatureDataUrl: string }
        >({
            query: ({ estimateId, signatureDataUrl }) => {
                const formData = new FormData()
                formData.append('estimateId', estimateId)
                formData.append('customerSignature', dataUrlToFile(signatureDataUrl))
                return {
                    url: '/invoice/signature',
                    method: 'POST',
                    body: formData,
                }
            },
            invalidatesTags: ['Invoice'],
        }),

        getPublicEstimate: builder.query<EstimateMutationResponse, string>({
            query: (id) => ({
                url: `/estimate-v-two/${id}`,
                method: 'GET',
            }),
            providesTags: ['Invoice'],
        }),

        submitPublicEstimateDecision: builder.mutation<
            InvoiceSignatureResponse,
            {
                estimateId: string
                estimateStatus: 'APPROVED' | 'REJECTED'
                customerEmail: string
                customerName: string
                signatureDataUrl?: string
            }
        >({
            query: ({
                estimateId,
                estimateStatus,
                customerEmail,
                customerName,
                signatureDataUrl,
            }) => {
                const formData = new FormData()
                formData.append('estimateId', estimateId)
                formData.append('estimateStatus', estimateStatus)
                formData.append('customerEmail', customerEmail)
                formData.append('customerName', customerName)
                if (estimateStatus === 'APPROVED' && signatureDataUrl) {
                    formData.append(
                        'signature',
                        dataUrlToFile(signatureDataUrl, 'signature.png')
                    )
                }
                return {
                    url: '/estimate-approved/create',
                    method: 'POST',
                    body: formData,
                }
            },
            invalidatesTags: ['Invoice'],
        }),
    }),
})

export const {
    useGetInvoicesQuery,
    useAddInvoiceSignatureMutation,
    useGetPublicEstimateQuery,
    useSubmitPublicEstimateDecisionMutation,
} = invoiceApi
