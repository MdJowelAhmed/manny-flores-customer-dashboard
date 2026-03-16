import { UserRole, hasFeatureAccess, type FeatureKey } from '@/types/roles'

/**
 * Add businessId to data items for demo purposes
 * In production, this would come from your API
 */
export const addBusinessIdToMockData = <T extends Record<string, unknown>>(
  data: T[],
  businessIdField: string = 'businessId'
): T[] => {
  const businessIds = ['business-001', 'business-002', 'business-003']

  return data.map((item, index) => ({
    ...item,
    [businessIdField]: businessIds[index % businessIds.length],
  }))
}

/**
 * Role filtering: employee sees own/assigned data.
 */
export const filterDataByRole = <T extends Record<string, unknown>>(
  data: T[],
  userRole: string,
  userBusinessId?: string,
  businessIdField: string = 'businessId'
): T[] => {
  if (userRole === UserRole.EMPLOYEE) return data
  if (userBusinessId)
    return data.filter((item) => item[businessIdField] === userBusinessId)
  return []
}

/**
 * Check if user can access a specific item
 */
export const canAccessItem = (
  item: Record<string, unknown>,
  userRole: string,
  userBusinessId?: string,
  businessIdField: string = 'businessId'
): boolean => {
  if (userRole === UserRole.EMPLOYEE) return true
  if (userBusinessId) return item[businessIdField] === userBusinessId
  return false
}

/**
 * Check if user can access a feature by role
 */
export const canAccessFeature = (
  userRole: string,
  feature: FeatureKey
): boolean => {
  return hasFeatureAccess(userRole as UserRole, feature)
}

/**
 * Get role badge color
 */
export const getRoleBadgeColor = (role: string): string => {
  switch (role) {
    case UserRole.EMPLOYEE:
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
  }
}

/**
 * Get role display name
 */
export const getRoleDisplayName = (role: string): string => {
  switch (role) {
    case UserRole.EMPLOYEE:
      return 'Customer'
    default:
      return 'Customer'
  }
}
