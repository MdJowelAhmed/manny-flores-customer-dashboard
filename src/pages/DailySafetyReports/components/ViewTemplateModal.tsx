import { ModalWrapper } from '@/components/common'
import { Button } from '@/components/ui/button'
import { Pencil, Trash2 } from 'lucide-react'
import type { SafetyTemplateItem } from '../dailySafetyReportsData'

interface ViewTemplateModalProps {
  open: boolean
  onClose: () => void
  items: SafetyTemplateItem[]
  onAddNew: () => void
  onEdit?: (item: SafetyTemplateItem) => void
  onDelete?: (item: SafetyTemplateItem) => void
}

export function ViewTemplateModal({
  open,
  onClose,
  items,
  onAddNew,
  onEdit,
  onDelete,
}: ViewTemplateModalProps) {
  return (
    <ModalWrapper
      open={open}
      onClose={onClose}
      title="View Template"
      description="Manage your safety checklist template items"
      size="md"
    >
      <div className="space-y-4">
          <div className="p-4 rounded-xl bg-white border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-foreground">Safety Template</h3>
              <Button
                size="sm"
                className="bg-primary hover:bg-primary/90 text-white"
                onClick={onAddNew}
              >
                Add New
              </Button>
            </div>
            <ul className="space-y-2">
              {items.map((item, index) => (
                <li
                  key={item.id}
                  className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0 group"
                >
                  <span className="text-sm text-foreground">
                    {index + 1}. {item.label}
                  </span>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      type="button"
                      onClick={() => onEdit?.(item)}
                      className="p-1.5 rounded hover:bg-primary/10 text-primary"
                      title="Edit"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete?.(item)}
                      className="p-1.5 rounded hover:bg-destructive/10 text-destructive"
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
    </ModalWrapper>
  )
}
