import { useState, useEffect } from 'react'
import { ModalWrapper } from '@/components/common'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Check, Pencil, Trash2, X } from 'lucide-react'
import type { SafetyTemplateItem } from '../dailySafetyReportsData'

interface ViewTemplateModalProps {
  open: boolean
  onClose: () => void
  items: SafetyTemplateItem[]
  onAddNew: () => void
  editingItem: SafetyTemplateItem | null
  onEditStart: (item: SafetyTemplateItem) => void
  onSaveEdit: (id: string, label: string) => void
  onCancelEdit: () => void
  onDelete?: (item: SafetyTemplateItem) => void
}

export function ViewTemplateModal({
  open,
  onClose,
  items,
  onAddNew,
  editingItem,
  onEditStart,
  onSaveEdit,
  onCancelEdit,
  onDelete,
}: ViewTemplateModalProps) {
  const [editLabel, setEditLabel] = useState('')

  useEffect(() => {
    if (editingItem) {
      setEditLabel(editingItem.label)
    } else {
      setEditLabel('')
    }
  }, [editingItem])

  const handleSave = () => {
    const trimmed = editLabel.trim()
    if (!trimmed || !editingItem) return
    onSaveEdit(editingItem.id, trimmed)
  }

  return (
    <ModalWrapper
      open={open}
      onClose={onClose}
      title="View Template"
      description="Manage your safety checklist template items"
      size="md"
      className="bg-white max-w-xl"
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
            {items.map((item, index) => {
              const isEditing = editingItem?.id === item.id
              return (
                <li
                  key={item.id}
                  className="flex items-center gap-2 py-2 border-b border-gray-100 last:border-0 group"
                >
                  {isEditing ? (
                    <>
                   
                      <Input
                        value={editLabel}
                        onChange={(e) => setEditLabel(e.target.value)}
                        placeholder="Enter item label"
                        className="flex-1 h-9"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSave()
                          if (e.key === 'Escape') onCancelEdit()
                        }}
                      />
                         <Button
                        size="sm"
                        className="bg-primary hover:bg-primary/90 text-white shrink-0"
                        onClick={handleSave}
                        disabled={!editLabel.trim()}
                      >
                        <Check className="h-5 w-5" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="shrink-0"
                        onClick={onCancelEdit}
                      >
                       <X className="h-5 w-5"/>
                      </Button>
                    </>
                  ) : (
                    <>
                      <span className="flex-1 text-sm text-foreground">
                        {index + 1}. {item.label}
                      </span>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          type="button"
                          onClick={() => onEditStart(item)}
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
                    </>
                  )}
                </li>
              )
            })}
          </ul>
        </div>
      </div>
    </ModalWrapper>
  )
}
