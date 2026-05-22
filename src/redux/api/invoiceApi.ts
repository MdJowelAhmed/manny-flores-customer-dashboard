import { baseApi } from '../baseApi'
import { format } from 'date-fns'
import {
    type Invoice,
    type InvoiceStatus,
    normalizeProjectInvoiceStatus,
} from '@/pages/Invoice/invoicesData'

export interface InvoicePagination {
    total: number
    page: number
    limit: number
    totalPage: number
}

export interface InvoiceMaterialApiDoc {
    id: string
    estimateId: string
    materialId: string
    quantity: number
    unitPrice: number
    totalPrice: number
    createdAt?: string
}

export interface InvoiceVehicleApiDoc {
    id: string
    estimateId: string
    vehicleId: string
    vehicleUnits: number
    vehicleQuantity?: number
    totalPrice: number | null
    createdAt?: string
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
    materials: InvoiceMaterialApiDoc[]
    vehicles: InvoiceVehicleApiDoc[]
    customerSignature?: string | null
}

export interface InvoiceListResponse {
    success: boolean
    statusCode?: number
    message: string
    pagination: InvoicePagination
    data: InvoiceApiDoc[]
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
    const materialsTotal = (doc.materials ?? []).reduce(
        (sum, item) => sum + Number(item.totalPrice ?? item.quantity * item.unitPrice),
        0
    )
    const vehiclesTotal = (doc.vehicles ?? []).reduce(
        (sum, item) => sum + Number(item.totalPrice ?? 0),
        0
    )
    const subtotal = materialsTotal + vehiclesTotal
    const fromApi = doc.totalCost != null ? Number(doc.totalCost) : 0
    const base = fromApi > 0 ? fromApi : subtotal
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
    const subtotalMaterials = (doc.materials ?? []).reduce(
        (sum, item) => sum + Number(item.totalPrice ?? item.quantity * item.unitPrice),
        0
    )
    const subtotalVehicles = (doc.vehicles ?? []).reduce(
        (sum, item) => sum + Number(item.totalPrice ?? 0),
        0
    )
    const subtotal = subtotalMaterials + subtotalVehicles
    const taxPercent = Number(doc.taxNumber ?? 0)
    const grandTotal = computeInvoiceTotal(doc)

    const firstMaterial = doc.materials?.[0]
    const firstVehicle = doc.vehicles?.[0]
    const materialQty = (doc.materials ?? []).reduce((sum, row) => sum + row.quantity, 0)
    const vehicleQty = (doc.vehicles ?? []).reduce(
        (sum, row) => sum + (row.vehicleQuantity ?? row.vehicleUnits ?? 0),
        0
    )
    const lineCount = (doc.materials?.length ?? 0) + (doc.vehicles?.length ?? 0)

    const materialTotal = firstMaterial
        ? Number(firstMaterial.totalPrice ?? firstMaterial.quantity * firstMaterial.unitPrice)
        : 0
    const vehicleQtyLine = firstVehicle?.vehicleQuantity ?? firstVehicle?.vehicleUnits ?? 0
    const vehicleTotal = firstVehicle ? Number(firstVehicle.totalPrice ?? 0) : 0
    const vehicleUnitPrice =
        vehicleQtyLine > 0 && vehicleTotal > 0 ? vehicleTotal / vehicleQtyLine : 0

    return {
        id: doc.id,
        refCode: `EST-${doc.id.slice(0, 8).toUpperCase()}`,
        customerName: doc.customerName,
        materialSummary: doc.projectName,
        summaryQty: materialQty + vehicleQty,
        summaryCostCount: lineCount,
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
        material: {
            name: firstMaterial ? 'Material' : doc.projectName,
            quantity: firstMaterial?.quantity ?? 0,
            unitPricePerSqFt: firstMaterial?.unitPrice ?? 0,
            totalPrice: materialTotal,
        },
        equipment: {
            name: firstVehicle ? 'Vehicle' : '—',
            quantity: vehicleQtyLine,
            unitPricePerSqFt: vehicleUnitPrice,
            totalPrice: vehicleTotal,
        },
        signatureDataUrl: doc.customerSignature ?? undefined,
        approvedAt: doc.customerSignature ? doc.updatedAt : undefined,
    }
}

const invoiceApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getInvoices: builder.query<InvoiceListResponse, GetInvoicesParams | void>({
            query: (params) => ({
                url: '/invoice',
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
    }),
})

export const { useGetInvoicesQuery, useAddInvoiceSignatureMutation } = invoiceApi
