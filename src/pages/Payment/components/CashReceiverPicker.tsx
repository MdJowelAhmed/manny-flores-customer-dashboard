import { useTranslation } from 'react-i18next'
import { User } from 'lucide-react'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/utils/cn'
import { imageUrl } from '@/components/common/getImageUrl'
import {
  useGetAllAdminAndEmployeeQuery,
  type PaymentReceiver,
} from '@/redux/api/projectApi'

const inputClass =
  'h-11 rounded-lg border-0 bg-[#F3F4F6] shadow-none ring-1 ring-inset ring-gray-100'

function roleLabel(role: string, t: (key: string, opts?: { defaultValue: string }) => string) {
  const r = role.toUpperCase()
  if (r.includes('ADMIN')) {
    return t('payment.roleAdmin', { defaultValue: 'Admin' })
  }
  return t('payment.roleEmployee', { defaultValue: 'Employee' })
}

function avatarSrc(profile: string | null): string | undefined {
  if (!profile || profile === '/image.png') return undefined
  return imageUrl(profile) || undefined
}

function ReceiverAvatar({ receiver, className }: { receiver: PaymentReceiver; className?: string }) {
  const src = avatarSrc(receiver.profile)
  if (src) {
    return (
      <img
        src={src}
        alt=""
        className={cn('h-10 w-10 shrink-0 rounded-full object-cover bg-gray-100', className)}
        onError={(e) => {
          e.currentTarget.style.display = 'none'
        }}
      />
    )
  }
  return (
    <div
      className={cn(
        'flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-200 text-gray-600',
        className
      )}
    >
      <User className="h-5 w-5" />
    </div>
  )
}

function ReceiverDetails({
  receiver,
  compact,
}: {
  receiver: PaymentReceiver
  compact?: boolean
}) {
  const { t } = useTranslation()
  return (
    <div className="flex min-w-0 items-center gap-3 text-left">
      <ReceiverAvatar receiver={receiver} className={compact ? 'h-8 w-8' : undefined} />
      <div className="min-w-0 flex-1">
        <p className={cn('truncate font-medium text-gray-900', compact ? 'text-sm' : 'text-sm')}>
          {receiver.name}
        </p>
        <p className="truncate text-xs text-gray-500">{receiver.email}</p>
        {!compact ? (
          <span className="mt-0.5 inline-block rounded bg-gray-100 px-1.5 py-0.5 text-[10px] font-medium uppercase text-gray-600">
            {roleLabel(receiver.role, t)}
          </span>
        ) : null}
      </div>
    </div>
  )
}

interface CashReceiverPickerProps {
  value: string
  onChange: (receiverId: string) => void
  enabled: boolean
  className?: string
}

export function CashReceiverPicker({
  value,
  onChange,
  enabled,
  className,
}: CashReceiverPickerProps) {
  const { t } = useTranslation()
  const { data, isLoading, isError } = useGetAllAdminAndEmployeeQuery(undefined, {
    skip: !enabled,
  })

  const receivers = data?.data ?? []
  const selected = receivers.find((r) => r.id === value)

  return (
    <div className={cn('space-y-1.5', className)}>
      <Label className="text-sm font-medium text-gray-800">
        {t('payment.cashPaidToLabel', { defaultValue: 'Paid to' })}
      </Label>
      {isLoading ? (
        <p className={cn(inputClass, 'flex h-11 items-center px-3 text-sm text-gray-500')}>
          {t('common.loading', { defaultValue: 'Loading...' })}
        </p>
      ) : isError || receivers.length === 0 ? (
        <p className="text-sm text-red-600">
          {t('payment.receiversLoadError', {
            defaultValue: 'Could not load admin and employee list.',
          })}
        </p>
      ) : (
        <Select value={value} onValueChange={onChange}>
          <SelectTrigger className={cn(inputClass, 'h-auto min-h-11 py-2')}>
            {selected ? (
              <ReceiverDetails receiver={selected} compact />
            ) : (
              <SelectValue
                placeholder={t('payment.selectCashReceiver', {
                  defaultValue: 'Select who received the cash',
                })}
              />
            )}
          </SelectTrigger>
          <SelectContent className="max-h-72">
            {receivers.map((receiver) => (
              <SelectItem
                key={receiver.id}
                value={receiver.id}
                className="py-2 focus:bg-gray-50"
              >
                <ReceiverDetails receiver={receiver} />
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </div>
  )
}
