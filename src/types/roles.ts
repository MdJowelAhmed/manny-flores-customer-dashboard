// Role definitions: customer dashboard (API returns USER)
export enum UserRole {
  USER = 'USER',
}

export type UserRoleType = (typeof UserRole)[keyof typeof UserRole]

export interface RoutePermission {
  path: string
  allowedRoles: UserRole[]
  description?: string
}

/**
 * Feature-based access matrix (Customer Dashboard):
 * - USER: Dashboard, Profile, Attendance, Payroll, Projects, Documents, Communication, Safety Reports, Notifications
 */
export const FEATURE_ACCESS: Record<string, UserRole[]> = {
  dashboard: [UserRole.USER],
  profile: [UserRole.USER],
  attendance: [UserRole.USER],
  'payroll-management': [UserRole.USER],
  payroll: [UserRole.USER],
  'recent-projects': [UserRole.USER],
  projects: [UserRole.USER],
  'estimates-approvals': [UserRole.USER],
  invoice: [UserRole.USER],
  'project-scheduling': [UserRole.USER],
  'documents-approvals': [UserRole.USER],
  communication: [UserRole.USER],
  'daily-safety-reports': [UserRole.USER],
  notifications: [UserRole.USER],
  'my-task': [UserRole.USER],
  orders: [],
  'shop-management': [],
  'shop-management-shop': [],
  revenue: [],
  'user-management': [],
  subscribers: [],
  'ad-management': [],
  'push-notification': [],
  controllers: [],
  'company-projects': [],
  'customer-management': [],
  'employee-management': [],
  'vehicle-maintenance': [],
  vehicles: [UserRole.USER],
  'equipment-maintenance': [],
  equipment: [UserRole.USER],
  reviews: [UserRole.USER],
  'manage-materials': [UserRole.USER],
  payment: [UserRole.USER],
  'customer-finance': [],
  'resource-requests-report': [],
  'safety-compliance': [UserRole.USER],
  'change-orders': [UserRole.USER],
  'permits-inspections': [UserRole.USER],
}

export type FeatureKey = keyof typeof FEATURE_ACCESS

export const hasFeatureAccess = (userRole: UserRole, feature: FeatureKey): boolean => {
  const roles = FEATURE_ACCESS[feature]
  return roles ? roles.includes(userRole) : false
}

/** Map API role string to app UserRole enum */
export const normalizeApiRole = (role?: string): UserRole => {
  if (role?.toUpperCase() === 'USER') return UserRole.USER
  return UserRole.USER
}
