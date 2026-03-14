import { useState } from 'react'
import { motion } from 'framer-motion'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { DailyChecklistCard } from './components/DailyChecklistCard'
import { SafetyVerificationModal } from './components/SafetyVerificationModal'
import { IncidentReportForm } from './components/IncidentReportForm'
import {
  mockDailyChecklistItems,
  type DailyChecklistItem,
} from './safetyComplianceData'
import { cn } from '@/utils/cn'

type TabValue = 'checklist' | 'incident'

export default function SafetyCompliance() {
  const [activeTab, setActiveTab] = useState<TabValue>('checklist')
  const [checklistItems, setChecklistItems] = useState(mockDailyChecklistItems)
  const [verificationModalOpen, setVerificationModalOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<DailyChecklistItem | null>(null)

  const handleCheck = (item: DailyChecklistItem) => {
    setSelectedItem(item)
    setVerificationModalOpen(true)
  }

  const handleVerificationSuccess = () => {
    if (selectedItem) {
      setChecklistItems((prev) =>
        prev.map((i) =>
          i.id === selectedItem.id ? { ...i, isCompleted: true } : i
        )
      )
      setSelectedItem(null)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div className="rounded-xl overflow-hidden">
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as TabValue)} className="w-full">
          <div className="pb-4">
            <TabsList
              className={cn(
                'h-[44px] bg-gray-100 p-1 gap-1 inline-flex',
                'rounded-xl'
              )}
            >
              <TabsTrigger
                value="checklist"
                className={cn(
                  'px-5 py-3 text-sm font-medium rounded-lg transition-colors',
                  'data-[state=active]:bg-[#195ABE] data-[state=active]:text-white',
                  'data-[state=inactive]:bg-white data-[state=inactive]:text-gray-700 data-[state=inactive]:border data-[state=inactive]:border-gray-200'
                )}
              >
                Daily Safety Checklist
              </TabsTrigger>
              <TabsTrigger
                value="incident"
                className={cn(
                  'px-5 py-3 text-sm font-medium rounded-lg transition-colors',
                  'data-[state=active]:bg-[#195ABE] data-[state=active]:text-white',
                  'data-[state=inactive]:bg-white data-[state=inactive]:text-gray-700 data-[state=inactive]:border data-[state=inactive]:border-gray-200'
                )}
              >
                Create Incident Report
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="checklist" className="mt-6 space-y-4">
            <div className="space-y-6">
              {checklistItems.map((item) => (
                <DailyChecklistCard
                  key={item.id}
                  item={item}
                  onCheck={handleCheck}
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="incident" className="mt-6">
            <IncidentReportForm />
          </TabsContent>
        </Tabs>
      </div>

      <SafetyVerificationModal
        open={verificationModalOpen}
        onClose={() => {
          setVerificationModalOpen(false)
          setSelectedItem(null)
        }}
        projectName={selectedItem?.projectName ?? ''}
        onSuccess={handleVerificationSuccess}
      />
    </motion.div>
  )
}
