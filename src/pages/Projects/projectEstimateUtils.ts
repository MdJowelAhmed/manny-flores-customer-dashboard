import type { EstimateApiDoc } from '@/redux/api/estimateApi'
import type { ProjectLineItem } from './projectsData'

export function buildLineItemsFromEstimate(doc: EstimateApiDoc): ProjectLineItem[] {
  const materials = (doc.materials ?? []).map((item) => ({
    name: 'Material',
    quantity: item.quantity,
    unitPrice: Number(item.unitPrice),
    totalPrice: Number(item.totalPrice ?? item.quantity * item.unitPrice),
  }))

  const vehicles = (doc.vehicles ?? []).map((item) => {
    const quantity = item.vehicleUnits ?? 1
    const total = Number(item.totalPrice ?? 0)
    const unitPrice = quantity > 0 && total > 0 ? total / quantity : 0
    return {
      name: 'Vehicle',
      quantity,
      unitPrice,
      totalPrice: total,
    }
  })

  const equipment = (doc.equipment ?? []).map((item) => ({
    name: 'Equipment',
    quantity: item.equipmentUnits,
    unitPrice: Number(item.unitPrice),
    totalPrice: Number(item.totalPrice ?? item.equipmentUnits * item.unitPrice),
  }))

  return [...materials, ...equipment, ...vehicles]
}

export function computeProjectTotals(
  lineItems: ProjectLineItem[],
  taxPercent: number,
  totalCost?: number | null
) {
  const subtotal = lineItems.reduce((sum, row) => sum + row.totalPrice, 0)
  const taxAmount = Math.round(subtotal * (taxPercent / 100) * 100) / 100
  const calculatedBalance = Math.round((subtotal + taxAmount) * 100) / 100
  const fromApi = totalCost != null ? Number(totalCost) : 0
  const balanceDue =
    fromApi > 0
      ? Math.round(fromApi * (1 + taxPercent / 100) * 100) / 100
      : calculatedBalance

  return { subtotal, taxAmount, balanceDue }
}
