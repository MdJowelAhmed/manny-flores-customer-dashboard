import { useEffect, useState, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ModalWrapper, FormInput, FormSelect, ImageUploader } from '@/components/common'
import { Button } from '@/components/ui/button'
import { useAppDispatch, useAppSelector } from '@/redux/hooks'
import { addShopProduct, updateShopProduct } from '@/redux/slices/shopProductSlice'
import type { ShopProduct } from '@/types'
import type { SelectOption } from '@/types'
import { toast } from '@/utils/toast'

const schema = z.object({
  itemsName: z.string().min(1, 'Item name is required'),
  price: z.number().min(0, 'Price must be 0 or more'),
  categoryId: z.string().min(1, 'Category is required'),
  tags: z.string().min(0),
  pickupTime: z.string().min(1, 'Pickup time is required'),
})

type FormData = z.infer<typeof schema>

interface AddEditShopProductModalProps {
  open: boolean
  onClose: () => void
  editingId: string | null
  product: ShopProduct | null
}

export function AddEditShopProductModal({
  open,
  onClose,
  editingId,
  product,
}: AddEditShopProductModalProps) {
  const dispatch = useAppDispatch()
  const categories = useAppSelector((s) => s.shopCategories.list)
  const isEdit = !!editingId
  const [image, setImage] = useState<File | string | null>(null)

  const categoryOptions: SelectOption[] = useMemo(
    () => categories.map((c) => ({ value: c.id, label: c.name })),
    [categories]
  )

  const { register, handleSubmit, reset, setValue, watch, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      itemsName: '',
      price: 0,
      categoryId: '',
      tags: '',
      pickupTime: '10:00',
    },
  })

  const watchedCategoryId = watch('categoryId')

  useEffect(() => {
    if (open) {
      if (isEdit && product) {
        reset({
          itemsName: product.itemsName,
          price: product.price,
          categoryId: product.categoryId,
          tags: product.tags.join(', '),
          pickupTime: product.pickupTime,
        })
        setImage(product.itemsPicture || null)
      } else {
        reset({
          itemsName: '',
          price: 0,
          categoryId: '',
          tags: '',
          pickupTime: '10:00',
        })
        setImage(null)
      }
    }
  }, [open, isEdit, product, reset])

  const onSubmit = (data: FormData) => {
    const now = new Date().toISOString()
    const tags = data.tags
      ? data.tags.split(',').map((t) => t.trim()).filter(Boolean)
      : []
    const picture =
      typeof image === 'string' ? image : image ? URL.createObjectURL(image) : undefined
    const categoryName = categories.find((c) => c.id === data.categoryId)?.name ?? ''

    const payload: ShopProduct = {
      id: isEdit && product ? product.id : Date.now().toString(),
      itemsName: data.itemsName,
      price: data.price,
      categoryId: data.categoryId,
      categoryName,
      tags,
      customizeType: 'both',
      pickupTime: data.pickupTime,
      itemsPicture: picture,
      isActive: isEdit && product ? product.isActive : true,
      createdAt: isEdit && product ? product.createdAt : now,
      updatedAt: now,
    }
    if (isEdit) {
      dispatch(updateShopProduct(payload))
      toast({ title: 'Updated', description: 'Product updated successfully.' })
    } else {
      dispatch(addShopProduct(payload))
      toast({ title: 'Added', description: 'Product added successfully.' })
    }
    onClose()
  }

  return (
    <ModalWrapper
      open={open}
      onClose={onClose}
      title={isEdit ? 'Edit Product' : 'Add Product'}
      size="xl"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <FormInput
          label="Items Name"
          placeholder="Enter item name"
          error={errors.itemsName?.message}
          required
          {...register('itemsName')}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormInput
            label="Price"
            type="number"
            step="0.01"
            min="0"
            placeholder="0.00"
            error={errors.price?.message}
            required
            {...register('price', { valueAsNumber: true })}
          />
          <FormSelect
            label="Category"
            value={watchedCategoryId}
            options={categoryOptions}
            onChange={(v) => setValue('categoryId', v)}
            placeholder="Select category"
            error={errors.categoryId?.message}
            required
          />
        </div>

        <FormInput
          label="Tags"
          placeholder="e.g. hot, popular, new (comma separated)"
          error={errors.tags?.message}
          {...register('tags')}
        />

        <FormInput
          label="Pickup Time"
          type="time"
          error={errors.pickupTime?.message}
          required
          {...register('pickupTime')}
        />

        <div>
          <p className="text-sm text-muted-foreground mb-1">Customize Type: both</p>
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">Items Picture</label>
          <ImageUploader value={image} onChange={(f) => setImage(f)} />
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : isEdit ? 'Save' : 'Add'}
          </Button>
        </div>
      </form>
    </ModalWrapper>
  )
}
