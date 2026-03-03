import { useState } from 'react'
import { motion } from 'framer-motion'
import { Plus } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { useAppDispatch, useAppSelector } from '@/redux/hooks'
import { deleteShopProduct, toggleShopProductStatus } from '@/redux/slices/shopProductSlice'
import type { ShopProduct } from '@/types'
import { toast } from '@/utils/toast'
import { formatCurrency } from '@/utils/formatters'
import { AddEditShopProductModal } from './AddEditShopProductModal'
import { ConfirmDialog } from '@/components/common'

export default function ShopProducts() {
  const dispatch = useAppDispatch()
  const products = useAppSelector((s) => s.shopProducts.filteredList)

  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<ShopProduct | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const selected = products.find((p) => p.id === editingId) ?? null

  const handleAdd = () => {
    setEditingId(null)
    setModalOpen(true)
  }
  const handleEdit = (p: ShopProduct) => {
    setEditingId(p.id)
    setModalOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return
    setIsDeleting(true)
    try {
      await new Promise((r) => setTimeout(r, 300))
      dispatch(deleteShopProduct(deleteTarget.id))
      toast({ title: 'Deleted', description: 'Product removed.' })
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
              Shop Products
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Manage products with name, price, category, tags, pickup time, and picture
            </p>
          </div>
          <Button onClick={handleAdd} className="bg-primary text-white">
            <Plus className="h-4 w-4 mr-2" />
            Add Product
          </Button>
        </CardHeader>
        <CardContent>
          <div className="w-full overflow-auto">
            <table className="w-full min-w-[700px]">
              <thead>
                <tr className="bg-[#E2FBFB] text-slate-800">
                  <th className="px-6 py-4 text-left text-sm font-bold">Product</th>
                  <th className="px-6 py-4 text-left text-sm font-bold">Price</th>
                  <th className="px-6 py-4 text-left text-sm font-bold">Category</th>
                  <th className="px-6 py-4 text-left text-sm font-bold">Tags</th>
                  <th className="px-6 py-4 text-left text-sm font-bold">Pickup Time</th>
                  <th className="px-6 py-4 text-left text-sm font-bold">Status</th>
                  <th className="px-6 py-4 text-right text-sm font-bold">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {products.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                      No products yet. Add one to get started.
                    </td>
                  </tr>
                ) : (
                  products.map((p) => (
                    <tr key={p.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {p.itemsPicture ? (
                            <img
                              src={p.itemsPicture}
                              alt={p.itemsName}
                              className="w-10 h-10 rounded-lg object-cover"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center text-muted-foreground text-sm">
                              Item
                            </div>
                          )}
                          <span className="font-medium">{p.itemsName}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">{formatCurrency(p.price)}</td>
                      <td className="px-6 py-4 text-muted-foreground">
                        {p.categoryName || '-'}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {p.tags.length > 0
                            ? p.tags.map((t) => (
                                <span
                                  key={t}
                                  className="rounded bg-muted px-2 py-0.5 text-xs"
                                >
                                  {t}
                                </span>
                              ))
                            : '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm">{p.pickupTime}</td>
                      <td className="px-6 py-4">
                        <Switch
                          checked={p.isActive}
                          onCheckedChange={() => dispatch(toggleShopProductStatus(p.id))}
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(p)}
                            className="text-blue-600"
                          >
                            Edit
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDeleteTarget(p)}
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

      <AddEditShopProductModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false)
          setEditingId(null)
        }}
        editingId={editingId}
        product={selected}
      />
      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => !isDeleting && setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Product"
        description={`Are you sure you want to delete "${deleteTarget?.itemsName}"?`}
        confirmText="Delete"
        variant="danger"
        isLoading={isDeleting}
      />
    </motion.div>
  )
}
