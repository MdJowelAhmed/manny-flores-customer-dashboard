import { useState } from 'react'
import { motion } from 'framer-motion'
import { Plus } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Switch } from '@/components/ui/switch'
import { useAppDispatch, useAppSelector } from '@/redux/hooks'
import {
  deleteMilkType,
  toggleMilkTypeStatus,
} from '@/redux/slices/milkTypeSlice'
import {
  deleteSyrupType,
  toggleSyrupTypeStatus,
} from '@/redux/slices/syrupTypeSlice'
import type { MilkType, SyrupType } from '@/types'
import { toast } from '@/utils/toast'
import { formatCurrency } from '@/utils/formatters'
import { AddEditMilkTypeModal } from './AddEditMilkTypeModal'
import { AddEditSyrupTypeModal } from './AddEditSyrupTypeModal'
import { ConfirmDialog } from '@/components/common'

function MilkTypeTable({
  items,
  onEdit,
  onDelete,
  onToggle,
}: {
  items: MilkType[]
  onEdit: (m: MilkType) => void
  onDelete: (m: MilkType) => void
  onToggle: (m: MilkType) => void
}) {
  return (
    <div className="w-full overflow-auto">
      <table className="w-full min-w-[500px]">
        <thead>
          <tr className="bg-[#E2FBFB] text-slate-800">
            <th className="px-6 py-4 text-left text-sm font-bold">Name</th>
            <th className="px-6 py-4 text-left text-sm font-bold">Price</th>
            <th className="px-6 py-4 text-left text-sm font-bold">Type</th>
            <th className="px-6 py-4 text-left text-sm font-bold">Status</th>
            <th className="px-6 py-4 text-right text-sm font-bold">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {items.length === 0 ? (
            <tr>
              <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                No milk types yet. Add one to get started.
              </td>
            </tr>
          ) : (
            items.map((m) => (
              <tr key={m.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 font-medium">{m.name}</td>
                <td className="px-6 py-4">{formatCurrency(m.price)}</td>
                <td className="px-6 py-4">
                  <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-800">
                    milk
                  </span>
                </td>
                <td className="px-6 py-4">
                  <Switch
                    checked={m.isActive}
                    onCheckedChange={() => onToggle(m)}
                  />
                </td>
                <td className="px-6 py-4">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEdit(m)}
                      className="text-blue-600 hover:text-blue-700"
                    >
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDelete(m)}
                      className="text-red-600 hover:text-red-700"
                    >
                      Delete
                    </Button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}

function SyrupTypeTable({
  items,
  onEdit,
  onDelete,
  onToggle,
}: {
  items: SyrupType[]
  onEdit: (s: SyrupType) => void
  onDelete: (s: SyrupType) => void
  onToggle: (s: SyrupType) => void
}) {
  return (
    <div className="w-full overflow-auto">
      <table className="w-full min-w-[500px]">
        <thead>
          <tr className="bg-[#E2FBFB] text-slate-800">
            <th className="px-6 py-4 text-left text-sm font-bold">Name</th>
            <th className="px-6 py-4 text-left text-sm font-bold">Price</th>
            <th className="px-6 py-4 text-left text-sm font-bold">Type</th>
            <th className="px-6 py-4 text-left text-sm font-bold">Status</th>
            <th className="px-6 py-4 text-right text-sm font-bold">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {items.length === 0 ? (
            <tr>
              <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                No syrup types yet. Add one to get started.
              </td>
            </tr>
          ) : (
            items.map((s) => (
              <tr key={s.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 font-medium">{s.name}</td>
                <td className="px-6 py-4">{formatCurrency(s.price)}</td>
                <td className="px-6 py-4">
                  <span className="rounded-full bg-purple-100 px-3 py-1 text-xs font-medium text-purple-800">
                    syrup
                  </span>
                </td>
                <td className="px-6 py-4">
                  <Switch
                    checked={s.isActive}
                    onCheckedChange={() => onToggle(s)}
                  />
                </td>
                <td className="px-6 py-4">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEdit(s)}
                      className="text-blue-600 hover:text-blue-700"
                    >
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDelete(s)}
                      className="text-red-600 hover:text-red-700"
                    >
                      Delete
                    </Button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}

export default function Customise() {
  const dispatch = useAppDispatch()
  const milkTypes = useAppSelector((s) => s.milkTypes.filteredList)
  const syrupTypes = useAppSelector((s) => s.syrupTypes.filteredList)

  const [milkModalOpen, setMilkModalOpen] = useState(false)
  const [syrupModalOpen, setSyrupModalOpen] = useState(false)
  const [editingMilkId, setEditingMilkId] = useState<string | null>(null)
  const [editingSyrupId, setEditingSyrupId] = useState<string | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<
    { type: 'milk'; item: MilkType } | { type: 'syrup'; item: SyrupType } | null
  >(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const selectedMilk = milkTypes.find((m) => m.id === editingMilkId) ?? null
  const selectedSyrup = syrupTypes.find((s) => s.id === editingSyrupId) ?? null

  const handleAddMilk = () => {
    setEditingMilkId(null)
    setMilkModalOpen(true)
  }
  const handleEditMilk = (m: MilkType) => {
    setEditingMilkId(m.id)
    setMilkModalOpen(true)
  }
  const handleAddSyrup = () => {
    setEditingSyrupId(null)
    setSyrupModalOpen(true)
  }
  const handleEditSyrup = (s: SyrupType) => {
    setEditingSyrupId(s.id)
    setSyrupModalOpen(true)
  }

  const handleDelete = (type: 'milk' | 'syrup', item: MilkType | SyrupType) => {
    setDeleteTarget({ type, item } as typeof deleteTarget)
  }
  const handleConfirmDelete = async () => {
    if (!deleteTarget) return
    setIsDeleting(true)
    try {
      await new Promise((r) => setTimeout(r, 300))
      if (deleteTarget.type === 'milk') {
        dispatch(deleteMilkType(deleteTarget.item.id))
        toast({ title: 'Deleted', description: 'Milk type removed.' })
      } else {
        dispatch(deleteSyrupType(deleteTarget.item.id))
        toast({ title: 'Deleted', description: 'Syrup type removed.' })
      }
      setDeleteTarget(null)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <Card className="bg-white border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-slate-800">
            Customise
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Manage milk and syrup options for your shop.
          </p>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="milk" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="milk">Milk Type</TabsTrigger>
              <TabsTrigger value="syrup">Syrup Type</TabsTrigger>
            </TabsList>
            <TabsContent value="milk" className="mt-4">
              <div className="flex justify-end mb-4">
                <Button onClick={handleAddMilk} className="bg-primary text-white">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Milk Type
                </Button>
              </div>
              <MilkTypeTable
                items={milkTypes}
                onEdit={handleEditMilk}
                onDelete={(m) => handleDelete('milk', m)}
                onToggle={(m) => dispatch(toggleMilkTypeStatus(m.id))}
              />
            </TabsContent>
            <TabsContent value="syrup" className="mt-4">
              <div className="flex justify-end mb-4">
                <Button onClick={handleAddSyrup} className="bg-primary text-white">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Syrup Type
                </Button>
              </div>
              <SyrupTypeTable
                items={syrupTypes}
                onEdit={handleEditSyrup}
                onDelete={(s) => handleDelete('syrup', s)}
                onToggle={(s) => dispatch(toggleSyrupTypeStatus(s.id))}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <AddEditMilkTypeModal
        open={milkModalOpen}
        onClose={() => {
          setMilkModalOpen(false)
          setEditingMilkId(null)
        }}
        editingId={editingMilkId}
        milkType={selectedMilk}
      />
      <AddEditSyrupTypeModal
        open={syrupModalOpen}
        onClose={() => {
          setSyrupModalOpen(false)
          setEditingSyrupId(null)
        }}
        editingId={editingSyrupId}
        syrupType={selectedSyrup}
      />
      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => !isDeleting && setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        title="Delete"
        description={`Are you sure you want to delete "${deleteTarget?.item.name}"?`}
        confirmText="Delete"
        variant="danger"
        isLoading={isDeleting}
      />
    </motion.div>
  )
}
