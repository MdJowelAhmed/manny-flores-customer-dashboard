import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { ShopProduct } from '@/types'

interface ShopProductState {
  list: ShopProduct[]
  filteredList: ShopProduct[]
}

const mockShopProducts: ShopProduct[] = [
  { id: 'sp1', itemsName: 'Americano', price: 4.50, categoryId: 'sc1', categoryName: 'Hot Coffee', tags: ['hot', 'espresso', 'popular'], customizeType: 'both', pickupTime: '10:00', isActive: true, createdAt: '2024-01-01T10:00:00Z', updatedAt: '2024-01-01T10:00:00Z' },
  { id: 'sp2', itemsName: 'Latte', price: 5.50, categoryId: 'sc1', categoryName: 'Hot Coffee', tags: ['hot', 'milk', 'popular'], customizeType: 'both', pickupTime: '10:15', isActive: true, createdAt: '2024-01-01T10:00:00Z', updatedAt: '2024-01-01T10:00:00Z' },
  { id: 'sp3', itemsName: 'Iced Coffee', price: 5.00, categoryId: 'sc2', categoryName: 'Cold Coffee', tags: ['cold', 'refreshing'], customizeType: 'both', pickupTime: '10:30', isActive: true, createdAt: '2024-01-01T10:00:00Z', updatedAt: '2024-01-01T10:00:00Z' },
  { id: 'sp4', itemsName: 'Cold Brew', price: 5.75, categoryId: 'sc2', categoryName: 'Cold Coffee', tags: ['cold', 'smooth'], customizeType: 'both', pickupTime: '10:45', isActive: true, createdAt: '2024-01-01T10:00:00Z', updatedAt: '2024-01-01T10:00:00Z' },
  { id: 'sp5', itemsName: 'Green Tea', price: 3.50, categoryId: 'sc3', categoryName: 'Tea', tags: ['tea', 'healthy'], customizeType: 'both', pickupTime: '11:00', isActive: true, createdAt: '2024-01-01T10:00:00Z', updatedAt: '2024-01-01T10:00:00Z' },
  { id: 'sp6', itemsName: 'Chocolate Croissant', price: 4.00, categoryId: 'sc4', categoryName: 'Pastries', tags: ['pastry', 'sweet'], customizeType: 'both', pickupTime: '09:00', isActive: true, createdAt: '2024-01-01T10:00:00Z', updatedAt: '2024-01-01T10:00:00Z' },
  { id: 'sp7', itemsName: 'Chicken Panini', price: 8.50, categoryId: 'sc5', categoryName: 'Sandwiches', tags: ['lunch', 'savory'], customizeType: 'both', pickupTime: '12:00', isActive: true, createdAt: '2024-01-01T10:00:00Z', updatedAt: '2024-01-01T10:00:00Z' },
  { id: 'sp8', itemsName: 'Mango Smoothie', price: 6.00, categoryId: 'sc6', categoryName: 'Smoothies', tags: ['cold', 'fruit'], customizeType: 'both', pickupTime: '11:30', isActive: false, createdAt: '2024-01-01T10:00:00Z', updatedAt: '2024-01-01T10:00:00Z' },
  { id: 'sp9', itemsName: 'Cappuccino', price: 5.25, categoryId: 'sc1', categoryName: 'Hot Coffee', tags: ['hot', 'espresso', 'foam'], customizeType: 'both', pickupTime: '10:20', isActive: true, createdAt: '2024-01-01T10:00:00Z', updatedAt: '2024-01-01T10:00:00Z' },
  { id: 'sp10', itemsName: 'Blueberry Muffin', price: 3.75, categoryId: 'sc4', categoryName: 'Pastries', tags: ['pastry', 'breakfast'], customizeType: 'both', pickupTime: '09:15', isActive: true, createdAt: '2024-01-01T10:00:00Z', updatedAt: '2024-01-01T10:00:00Z' },
]

const initialState: ShopProductState = {
  list: mockShopProducts,
  filteredList: mockShopProducts,
}

const shopProductSlice = createSlice({
  name: 'shopProducts',
  initialState,
  reducers: {
    setShopProducts: (state, action: PayloadAction<ShopProduct[]>) => {
      state.list = action.payload
      state.filteredList = action.payload
    },
    addShopProduct: (state, action: PayloadAction<ShopProduct>) => {
      state.list.unshift(action.payload)
      state.filteredList.unshift(action.payload)
    },
    updateShopProduct: (state, action: PayloadAction<ShopProduct>) => {
      const index = state.list.findIndex((p) => p.id === action.payload.id)
      if (index !== -1) {
        state.list[index] = { ...action.payload, updatedAt: new Date().toISOString() }
      }
      const fi = state.filteredList.findIndex((p) => p.id === action.payload.id)
      if (fi !== -1) {
        state.filteredList[fi] = { ...action.payload, updatedAt: new Date().toISOString() }
      }
    },
    deleteShopProduct: (state, action: PayloadAction<string>) => {
      state.list = state.list.filter((p) => p.id !== action.payload)
      state.filteredList = state.filteredList.filter((p) => p.id !== action.payload)
    },
    toggleShopProductStatus: (state, action: PayloadAction<string>) => {
      const item = state.list.find((p) => p.id === action.payload)
      if (item) {
        item.isActive = !item.isActive
        item.updatedAt = new Date().toISOString()
      }
      const fItem = state.filteredList.find((p) => p.id === action.payload)
      if (fItem) {
        fItem.isActive = !fItem.isActive
        fItem.updatedAt = new Date().toISOString()
      }
    },
  },
})

export const {
  setShopProducts,
  addShopProduct,
  updateShopProduct,
  deleteShopProduct,
  toggleShopProductStatus,
} = shopProductSlice.actions
export default shopProductSlice.reducer
