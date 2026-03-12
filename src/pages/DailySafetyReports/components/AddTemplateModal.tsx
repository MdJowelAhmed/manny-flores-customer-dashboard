import { useState } from 'react'
import { ModalWrapper } from '@/components/common'
import { Button } from '@/components/ui/button'
import { FormInput } from '@/components/common/Form'
import type { SafetyTemplateItem } from '../dailySafetyReportsData'

interface AddTemplateModalProps {
  open: boolean
  onClose: () => void
  existingItems: SafetyTemplateItem[]
  onAdd: (label: string) => void
}

export function AddTemplateModal({
  open,
  onClose,
  existingItems,
  onAdd,
}: AddTemplateModalProps) {
  const [newItemLabel, setNewItemLabel] = useState('')

  const handleAdd = () => {
    const trimmed = newItemLabel.trim()
    if (!trimmed) return
    onAdd(trimmed)
    setNewItemLabel('')
    onClose()
  }

  return (
    <ModalWrapper
      open={open}
      onClose={onClose}
      title="Add Template"
      description="Add a new item to the safety checklist template"
      size="md"
    >
      <div className="space-y-4">
          <div className="p-4 rounded-xl bg-white border border-gray-200 shadow-sm">
            <h3 className="font-semibold text-foreground mb-4">Safety Template</h3>
            <ul className="space-y-2 mb-4">
              {existingItems.map((item, index) => (
                <li
                  key={item.id}
                  className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0 text-sm text-foreground"
                >
                  {index + 1}. {item.label}
                </li>
              ))}
            </ul>
            <div className="flex gap-2">
              <FormInput
                value={newItemLabel}
                onChange={(e) => setNewItemLabel(e.target.value)}
                placeholder={`${existingItems.length + 1}. Enter new item`}
                className="flex-1"
              />
              <Button
                size="sm"
                className="bg-primary hover:bg-primary/90 text-white shrink-0"
                onClick={handleAdd}
                disabled={!newItemLabel.trim()}
              >
                Add
              </Button>
            </div>
          </div>
        </div>
    </ModalWrapper>
  )
}
