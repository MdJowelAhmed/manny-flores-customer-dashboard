import { Card, CardContent } from '@/components/ui/card'
import { motion } from 'framer-motion'
import { cn } from '@/utils/cn'

export interface DashboardStatCardProps {
  title: string
  value: string | number
  icon: React.ElementType
  iconBg: string
  iconColor: string
  index?: number
}

export function DashboardStatCard({
  title,
  value,
  icon: Icon,
  iconBg,
  iconColor,
  index = 0,
}: DashboardStatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
    >
      <Card className="bg-white shadow-sm  overflow-hidden">
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">{title}</p>
              <p className="text-2xl font-bold text-accent mt-1">{value}</p>
            </div>
            <div
              className={cn(
                'flex items-center justify-center w-12 h-12 rounded-lg',
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
  )
}
