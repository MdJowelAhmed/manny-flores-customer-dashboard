import { Card, CardContent } from '@/components/ui/card'
import { motion } from 'framer-motion'
import { DollarSign, TrendingUp, FileText } from 'lucide-react'
import { cn } from '@/utils/cn'
import { formatCurrency } from '@/utils/formatters'
import type { PaymentSummary } from '../paymentsData'

interface PaymentSummaryCardsProps {
  summary: PaymentSummary
}

const CARD_CONFIG = [
  {
    key: 'totalPaid' as const,
    icon: DollarSign,
    iconBg: 'bg-green-100',
    iconColor: 'text-green-600',
  },
  {
    key: 'totalCollected' as const,
    icon: DollarSign,
    iconBg: 'bg-purple-100',
    iconColor: 'text-purple-600',
  },
  {
    key: 'outstanding' as const,
    icon: TrendingUp,
    iconBg: 'bg-purple-100',
    iconColor: 'text-purple-600',
  },
  {
    key: 'paidInvoicesCount' as const,
    icon: FileText,
    iconBg: 'bg-yellow-100',
    iconColor: 'text-yellow-600',
  },
]

export function PaymentSummaryCards({ summary }: PaymentSummaryCardsProps) {
  const formatValue = (key: keyof PaymentSummary, value: number) => {
    if (key === 'paidInvoicesCount') return String(value)
    return formatCurrency(value, 'USD')
  }

  const labels: Record<keyof PaymentSummary, string> = {
    totalPaid: 'Total Paid',
    totalCollected: 'Total Collected',
    outstanding: 'Outstanding',
    paidInvoicesCount: 'Paid Invoices',
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {CARD_CONFIG.map(({ key, icon: Icon, iconBg, iconColor }, index) => (
        <motion.div
          key={key}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.05 }}
        >
          <Card className="bg-white shadow-sm overflow-hidden border border-gray-200">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{labels[key]}</p>
                  <p className="text-2xl font-bold text-accent mt-1">
                    {formatValue(key, summary[key] as number)}
                  </p>
                </div>
                <div
                  className={cn(
                    'flex items-center justify-center w-12 h-12 rounded-full',
                    iconBg,
                    iconColor
                  )}
                >
                  <Icon className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  )
}
