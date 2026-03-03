import { useState } from 'react'
import { motion } from 'framer-motion'
import { Plus } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { useAppDispatch, useAppSelector } from '@/redux/hooks'
import { deleteShop, toggleShopStatus } from '@/redux/slices/shopSlice'
import type { Shop } from '@/types'
import { toast } from '@/utils/toast'
import { AddEditShopModal } from './AddEditShopModal'
import { ConfirmDialog } from '@/components/common'

export default function ShopList() {
  const dispatch = useAppDispatch()
  const shops = useAppSelector((s) => s.shops.filteredList)

  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Shop | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const selected = shops.find((s) => s.id === editingId) ?? null

  const handleAdd = () => {
    setEditingId(null)
    setModalOpen(true)
  }
  const handleEdit = (s: Shop) => {
    setEditingId(s.id)
    setModalOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return
    setIsDeleting(true)
    try {
      await new Promise((r) => setTimeout(r, 300))
      dispatch(deleteShop(deleteTarget.id))
      toast({ title: 'Deleted', description: 'Shop removed.' })
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
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-xl font-bold text-slate-800">
              Shops
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Manage your shops with name, contact, location, hours, and more
            </p>
          </div>
          <Button onClick={handleAdd} className="bg-primary text-white">
            <Plus className="h-4 w-4 mr-2" />
            Add Shop
          </Button>
        </CardHeader>
        <CardContent>
          <div className="w-full overflow-auto">
            <table className="w-full min-w-[700px]">
              <thead>
                <tr className="bg-[#E2FBFB] text-slate-800">
                  <th className="px-6 py-4 text-left text-sm font-bold">Shop</th>
                  <th className="px-6 py-4 text-left text-sm font-bold">Contact</th>
                  <th className="px-6 py-4 text-left text-sm font-bold">Location</th>
                  <th className="px-6 py-4 text-left text-sm font-bold">Hours</th>
                  <th className="px-6 py-4 text-left text-sm font-bold">Status</th>
                  <th className="px-6 py-4 text-right text-sm font-bold">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {shops.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                      No shops yet. Add one to get started.
                    </td>
                  </tr>
                ) : (
                  shops.map((s) => (
                    <tr key={s.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {s.shopPicture ? (
                            <img
                              src={s.shopPicture}
                              alt={s.shopName}
                              className="w-10 h-10 rounded-lg object-cover"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center text-muted-foreground text-sm">
                              Shop
                            </div>
                          )}
                          <span className="font-medium">{s.shopName}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">{s.contact}</td>
                      <td className="px-6 py-4 text-muted-foreground max-w-[200px] truncate">
                        {s.location}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {s.openTime} - {s.closeTime}
                      </td>
                      <td className="px-6 py-4">
                        <Switch
                          checked={s.isActive}
                          onCheckedChange={() => dispatch(toggleShopStatus(s.id))}
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(s)}
                            className="text-blue-600"
                          >
                            Edit
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDeleteTarget(s)}
                            className="text-red-600"
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
        </CardContent>
      </Card>

      <AddEditShopModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false)
          setEditingId(null)
        }}
        editingId={editingId}
        shop={selected}
      />
      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => !isDeleting && setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Shop"
        description={`Are you sure you want to delete "${deleteTarget?.shopName}"?`}
        confirmText="Delete"
        variant="danger"
        isLoading={isDeleting}
      />
    </motion.div>
  )
}
