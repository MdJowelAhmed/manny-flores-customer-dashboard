import { baseApi } from '../baseApi'
import { format } from 'date-fns'
import type { Payment } from '@/pages/Payment/paymentsData'

export interface PaymentPagination {
  total: number
  page: number
  limit: number
  totalPage: number
}

export interface PaymentEstimate {
  id: string
  projectName: string
  projectStatus: string
  customerName: string
  customerEmail: string
  customerAddress: string
  totalDate?: number
  description: string
  taxNumber: number
  isApproved: boolean
  totalCost: number
  userId: string
  createdAt: string
  updatedAt: string
}

export interface PaymentUser {
  id: string
  name: string
  email: string
  contact?: string
  profile?: string | null
  role: string
}

export interface PaymentApiDoc {
  id: string
  userId: string
  estimateId: string
  amount: number | null
  receiverId: string | null
  note: string | null
  method: 'CARD' | 'CASH' | 'CHEQUE' | 'FINANCE'
  checkImage: string | null
  trxId: string | null
  stripePaymentIntentId: string | null
  stripeCheckoutSessionId: string | null
  status: 'completed' | 'pending' | 'rejected'
  createdAt: string
  updatedAt: string
  resolverId: string | null
  estimate: PaymentEstimate
  user: PaymentUser
}

export interface PaymentListResponse {
  success: boolean
  statusCode?: number
  message: string
  pagination: PaymentPagination
  data: PaymentApiDoc[]
}

export interface GetPaymentsParams {
  page?: number
  limit?: number
  status?: string
}

function formatPaymentDate(iso?: string): string {
  if (!iso) return '—'
  const parsed = new Date(iso)
  if (Number.isNaN(parsed.getTime())) return iso
  return format(parsed, 'dd/MM/yyyy')
}

function formatMethod(method?: string): string {
  const value = (method ?? '').toUpperCase()
  if (value === 'CARD') return 'Card'
  if (value === 'CASH') return 'Cash'
  if (value === 'CHEQUE') return 'Cheque'
  if (value === 'FINANCE') return 'Finance Company'
  return method || '—'
}

function formatInvoiceRef(estimateId: string): string {
  return `EST-${estimateId.slice(0, 8).toUpperCase()}`
}

export function mapPaymentApiDocToUi(doc: PaymentApiDoc): Payment {
  const totalCost = Number(doc.estimate?.totalCost ?? 0)
  const amount = doc.amount != null ? Number(doc.amount) : null

  return {
    id: doc.id,
    estimateId: doc.estimateId,
    invoice: formatInvoiceRef(doc.estimateId),
    customer: doc.estimate?.customerName || doc.user?.name || '—',
    project: doc.estimate?.projectName || '—',
    amount,
    totalCost,
    totalAmount: totalCost,
    paidAmount: doc.status === 'completed' ? amount ?? 0 : 0,
    outstandingAmount: 0,
    method: formatMethod(doc.method),
    status: doc.status,
    paymentDate: formatPaymentDate(doc.createdAt),
    note: doc.note,
    checkImage: doc.checkImage,
    trxId: doc.trxId,
  }
}

const paymentApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getPayments: builder.query<PaymentListResponse, GetPaymentsParams | void>({
      query: (params) => {
        const queryParams: Record<string, string | number> = {
          page: params?.page ?? 1,
          limit: params?.limit ?? 10,
        }
        if (params?.status) {
          queryParams.status = params.status
        }
        return {
          url: '/payment/user',
          method: 'GET',
          params: queryParams,
        }
      },
      providesTags: ['Payment'],
    }),
  }),
})

export const { useGetPaymentsQuery } = paymentApi
