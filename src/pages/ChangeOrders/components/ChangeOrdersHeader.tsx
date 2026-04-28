import { motion } from 'framer-motion'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'

import type { ChangeOrderStatus } from '../changeOrdersData'

interface ChangeOrdersHeaderProps {
  activeTab: 'all' | ChangeOrderStatus
  onTabChange: (value: 'all' | ChangeOrderStatus) => void
  onOpenNewOrder: () => void
  onOpenNewChangeOrder: () => void
}

const tabs: { label: string; value: 'all' | ChangeOrderStatus }[] = [
  { label: 'All', value: 'all' },
  { label: 'Pending', value: 'Pending' },
  { label: 'Approved', value: 'Approved' },
  { label: 'Rejected', value: 'Rejected' },
]

export function ChangeOrdersHeader({
  activeTab,
  onTabChange,
}: ChangeOrdersHeaderProps) {
  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        {/* left empty for now */}
      </div>

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <Tabs
            value={activeTab}
            onValueChange={(val) => onTabChange(val as 'all' | ChangeOrderStatus)}
          >
            <TabsList className="rounded-full  p-1 h-11">
              {tabs.map((tab) => (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  className="rounded-full px-5 py-2 text-xs md:text-sm data-[state=active]:bg-secondary data-[state=active]:text-white data-[state=active]:shadow-sm data-[state=inactive]:bg-secondary-foreground data-[state=inactive]:text-accent mr-6 "
                >
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </motion.div>

        <div className="flex flex-col md:flex-row md:items-center gap-3">
         
      
        </div>
      </div>
    </div>
  )
}

