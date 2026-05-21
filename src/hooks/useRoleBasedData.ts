import { useMemo } from 'react';
import { useAppSelector } from '@/redux/hooks';
import { UserRole } from '@/types/roles';

interface DataItem {
  businessId?: string;
  userId?: string;
  [key: string]: string | number | undefined;
}

/**
 * Employee dashboard: employee sees filtered data.
 */
export const useRoleBasedData = <T extends DataItem>(data: T[]): T[] => {
  const { user } = useAppSelector((state) => state.auth)

  return useMemo(() => {
    if (!user) return []
    if (user.role === UserRole.USER) return data
    return []
  }, [data, user])
}

/**
 * Check if user is admin (none in employee-only mode).
 */
export const useIsAdmin = (): boolean => {
  return false
}

/**
 * Employee is the primary role.
 */
export const useIsBusiness = (): boolean => {
  const { user } = useAppSelector((state) => state.auth)
  return !!user && user.role === UserRole.USER
}

/**
 * Hook to get current user's business ID
 */
export const useBusinessId = (): string | undefined => {
  const { user } = useAppSelector((state) => state.auth)
  return user?.businessId
}

/**
 * Hook to check if user can modify/delete an item (employee: own items only)
 */
export const useCanModifyItem = (item: DataItem): boolean => {
  const { user } = useAppSelector((state) => state.auth)

  if (!user) return false
  if (user.role === UserRole.USER) {
    return item.businessId === user.businessId || item.userId === user.id
  }
  return false
}
