import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { ShopProduct } from '@/types'

interface ShopProductState {
  list: ShopProduct[]
  filteredList: ShopProduct[]
}

const initialState: ShopProductState = {
  list: [],
  filteredList: [],
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
