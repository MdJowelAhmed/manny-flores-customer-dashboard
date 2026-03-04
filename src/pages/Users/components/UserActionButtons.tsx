import { Eye, Lock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { User } from '@/types'

interface UserActionButtonsProps {
  user: User
  onView: (user: User) => void
  onLock: (user: User) => void
}

export function UserActionButtons({
  user,
  onView,
  onLock,
}: UserActionButtonsProps) {
  const isBlocked = user.status === 'blocked'

  return (
    <div className="flex items-center justify-end gap-2">
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={() => onView(user)}
        className="h-8 w-8 hover:bg-green-50"
      >
        <Eye className="h-4 w-4 text-green-600" />
      </Button>
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={() => onLock(user)}
        className="h-8 w-8 hover:bg-red-50"
        title={isBlocked ? 'Unblock user' : 'Block user'}
      >
        <Lock className="h-4 w-4 text-red-600" />
      </Button>
    </div>
  )
}
