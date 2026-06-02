import { baseApi } from '../baseApi'
import {
    fmtUsd,
    type Estimate,
    type EstimateDetailBreakdown,
    type EstimateStatus,
} from '@/pages/EstimatesApprovals/estimatesData'
import { format } from 'date-fns'

export interface EstimatePagination {
    total: number
    page: number
    limit: number
    totalPage: number
}

export interface EstimateMaterialPayloadItem {
    materialId: string
    quantity: number
    unitPrice: number
    totalPrice: number
}

export interface EstimateEquipmentPayloadItem {
    equipmentId: string
    equipmentUnits: number
    unitPrice: number
}

export interface EstimateVehiclePayloadItem {
    vehicleId: string
    vehicleUnits: number
    totalPrice?: number | null
}

export interface EstimatePayload {
    projectName: string
    customerName: string
    customerEmail: string
    customerAddress: string
    estimateStartDate: string
    estimateEndDate: string
    description: string
    taxNumber: number
    materials: EstimateMaterialPayloadItem[]
    equipment?: EstimateEquipmentPayloadItem[]
    vehicles: EstimateVehiclePayloadItem[]
}

export interface EstimateMaterialApiDoc extends EstimateMaterialPayloadItem {
    id: string
    estimateId: string
}

export interface EstimateVehicleApiDoc extends EstimateVehiclePayloadItem {
    id: string
    estimateId: string
    vehicleQuantity?: number
}

export interface EstimateEquipmentApiDoc {
    id: string
    estimateId: string
    equipmentId: string
    equipmentUnits: number
    unitPrice: number
    totalPrice?: number | null
}

export interface EstimateApiDoc {
    id: string
    projectName: string
    customerName: string
    customerEmail: string
    customerAddress: string
    estimateStartDate?: string
    estimateEndDate?: string
    totalDate?: number
    description: string
    taxNumber: number
    userId: string
    isApproved: boolean
    projectStatus: string
    totalCost: number | null
    createdAt: string
    updatedAt: string
    materials: EstimateMaterialApiDoc[]
    equipment?: EstimateEquipmentApiDoc[]
    vehicles: EstimateVehicleApiDoc[]
}

export interface EstimateListResponse {
    success: boolean
    statusCode?: number
    message: string
    pagination: EstimatePagination
    data: EstimateApiDoc[]
}

export interface EstimateMutationResponse {
    success: boolean
    statusCode?: number
    message: string
    data: EstimateApiDoc
}

export interface GetEstimatesParams {
    page?: number
    limit?: number
}

export type ProjectStatus = 'PENDING' | 'IN_PROGRESS' | 'CANCELLED' | string

export interface UpdateEstimateStatusPayload {
    isApproved?: boolean
    projectStatus: ProjectStatus
}

function formatEstimateDisplayDate(date?: string): string {
    if (!date) return '—'
    const parsed = new Date(date)
    if (Number.isNaN(parsed.getTime())) return '—'
    return format(parsed, 'd/M/yyyy')
}

export function normalizeEstimateProjectStatus(status?: string): string {
    return (status ?? 'PENDING').toUpperCase()
}

function mapApprovalStatus(projectStatus: string, isApproved: boolean): EstimateStatus {
    const status = normalizeEstimateProjectStatus(projectStatus)
    if (status === 'CANCELLED') return 'Rejected'
    if (status === 'SCHEDULED') return 'Project Created'
    if (isApproved || status === 'IN_PROGRESS' || status === 'COMPLETED') return 'Approved'
    if (status === 'PENDING') return 'Pending'
    return 'Pending'
}

function computeEstimateTotal(doc: EstimateApiDoc): number {
    const materialsTotal = (doc.materials ?? []).reduce(
        (sum, item) => sum + Number(item.totalPrice ?? item.quantity * item.unitPrice),
        0
    )
    const vehiclesTotal = (doc.vehicles ?? []).reduce(
        (sum, item) => sum + Number(item.totalPrice ?? 0),
        0
    )
    const equipmentTotal = (doc.equipment ?? []).reduce(
        (sum, item) =>
            sum + Number(item.totalPrice ?? item.equipmentUnits * item.unitPrice),
        0
    )
    const fromLines = materialsTotal + vehiclesTotal + equipmentTotal
    return Number(doc.totalCost ?? fromLines)
}

function buildDetailBreakdown(doc: EstimateApiDoc, total: number): EstimateDetailBreakdown {
    const firstMaterial = doc.materials?.[0]
    const firstEquipment = doc.equipment?.[0]
    const firstVehicle = doc.vehicles?.[0]
    const taxPct = Number(doc.taxNumber ?? 0)

    const materialTotal = firstMaterial
        ? Number(firstMaterial.totalPrice ?? firstMaterial.quantity * firstMaterial.unitPrice)
        : 0
    const equipmentTotal = firstEquipment
        ? Number(
              firstEquipment.totalPrice ??
                  firstEquipment.equipmentUnits * firstEquipment.unitPrice
          )
        : firstVehicle
          ? Number(firstVehicle.totalPrice ?? 0)
          : 0

    return {
        labor: { quantity: 0, price: 0 },
        material: {
            name: firstMaterial ? 'Material' : doc.projectName,
            quantity: firstMaterial?.quantity ?? 0,
            unitPriceLabel: 'Unit Price',
            unitPrice: firstMaterial?.unitPrice ?? 0,
            totalPrice: materialTotal,
        },
        equipment: {
            name: firstEquipment ? 'Equipment' : firstVehicle ? 'Vehicle' : '—',
            quantity: firstEquipment?.equipmentUnits ?? firstVehicle?.vehicleUnits ?? 0,
            unitPriceLabel: 'Unit Price',
            unitPrice: firstEquipment?.unitPrice ?? 0,
            totalPrice: equipmentTotal,
        },
        price: { totalPrice: total, taxPercent: taxPct },
    }
}

export function mapEstimateApiDocToApprovalEstimate(doc: EstimateApiDoc): Estimate {
    const total = computeEstimateTotal(doc)
    const materialQty = (doc.materials ?? []).reduce((sum, row) => sum + row.quantity, 0)
    const vehicleQty = (doc.vehicles ?? []).reduce(
        (sum, row) => sum + (row.vehicleQuantity ?? row.vehicleUnits ?? 0),
        0
    )
    const equipmentQty = (doc.equipment ?? []).reduce(
        (sum, row) => sum + row.equipmentUnits,
        0
    )
    const lineCount =
        (doc.materials?.length ?? 0) +
        (doc.vehicles?.length ?? 0) +
        (doc.equipment?.length ?? 0)
    const projectStatus = normalizeEstimateProjectStatus(doc.projectStatus)

    return {
        id: doc.id,
        estimateCode: `EST-${doc.id.slice(0, 8).toUpperCase()}`,
        project: doc.projectName,
        amount: fmtUsd(total),
        status: mapApprovalStatus(doc.projectStatus, doc.isApproved),
        projectStatus,
        startDate: formatEstimateDisplayDate(doc.estimateStartDate ?? doc.createdAt),
        customerName: doc.customerName,
        email: doc.customerEmail,
        company: doc.customerAddress || '—',
        taxRatePercent: Number(doc.taxNumber ?? 0),
        totalDate: doc.totalDate,
        materialSummary: doc.projectName,
        summaryQty: materialQty + vehicleQty + equipmentQty,
        summaryCostCount: lineCount,
        detailBreakdown: buildDetailBreakdown(doc, total),
        lineItems: [
            ...(doc.materials ?? []).map((item) => ({
                description: 'Material',
                unitCost: item.unitPrice,
                qty: item.quantity,
                taxable: true,
            })),
            ...(doc.equipment ?? []).map((item) => ({
                description: 'Equipment',
                unitCost: item.unitPrice,
                qty: item.equipmentUnits,
                taxable: true,
            })),
            ...(doc.vehicles ?? []).map((item) => ({
                description: 'Vehicle',
                unitCost:
                    item.vehicleUnits > 0
                        ? Number(item.totalPrice ?? 0) / item.vehicleUnits
                        : 0,
                qty: item.vehicleQuantity ?? item.vehicleUnits,
                taxable: true,
            })),
        ],
    }
}

const estimateApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getEstimates: builder.query<EstimateListResponse, GetEstimatesParams | void>({
            query: (params) => ({
                url: '/estimate-v-two/user',
                method: 'GET',
                params: {
                    page: params?.page ?? 1,
                    limit: params?.limit ?? 10,
                },
            }),
            providesTags: ['Estimate'],
        }),

        getSingleEstimate: builder.query<EstimateMutationResponse, string>({
            query: (id) => ({
                url: `/estimate-v-two/${id}`,
                method: 'GET',
            }),
            providesTags: ['Estimate'],
        }),

        updateEstimate: builder.mutation<
            EstimateMutationResponse,
            { id: string } & EstimatePayload
        >({
            query: ({ id, ...body }) => ({
                url: `/estimate/${id}`,
                method: 'PATCH',
                body,
            }),
            invalidatesTags: ['Estimate'],
        }),

        updateEstimateStatus: builder.mutation<
            EstimateMutationResponse,
            { id: string } & UpdateEstimateStatusPayload
        >({
            query: ({ id, ...body }) => ({
                url: `/estimate/${id}`,
                method: 'PATCH',
                body,
            }),
            invalidatesTags: ['Estimate'],
        }),
    }),
})

export const {
    useGetEstimatesQuery,
    useGetSingleEstimateQuery,
    useUpdateEstimateMutation,
    useUpdateEstimateStatusMutation,
} = estimateApi
