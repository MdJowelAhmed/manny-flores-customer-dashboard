import { useState, useEffect } from 'react'
import { ModalWrapper } from '@/components/common'
import { Button } from '@/components/ui/button'
import { FormInput } from '@/components/common/Form'
import type { SafetyTemplateItem } from '../dailySafetyReportsData'

interface EditTemplateModalProps {
  open: boolean
  onClose: () => void
  item: SafetyTemplateItem | null
  onSave: (id: string, label: string) => void
}

export function EditTemplateModal({
  open,
  onClose,
  item,
  onSave,
}: EditTemplateModalProps) {
  const [label, setLabel] = useState('')

  useEffect(() => {
    if (item) {
      setLabel(item.label)
    } else {
      setLabel('')
    }
  }, [item])

  const handleSave = () => {
    const trimmed = label.trim()
    if (!trimmed || !item) return
    onSave(item.id, trimmed)
    onClose()
  }

  if (!item) return null

  return (
    <ModalWrapper
      open={open}
      onClose={onClose}
      title="Edit Template Item"
      description="Update the safety checklist item label"
      size="md"
    >
      <div className="space-y-4">
        <FormInput
          label="Item label"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="Enter item label"
        />
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            className="bg-primary hover:bg-primary/90 text-white"
            onClick={handleSave}
            disabled={!label.trim()}
          >
            Save
          </Button>
        </div>
      </div>
    </ModalWrapper>
  )
}
