import { configureStore } from '@reduxjs/toolkit'
import authReducer from './slices/authSlice'
import uiReducer from './slices/uiSlice'
import transactionReducer from './slices/transactionSlice'
import orderReducer from './slices/orderSlice'
import faqReducer from './slices/faqSlice'
import pushNotificationReducer from './slices/pushNotificationSlice'
import adReducer from './slices/adSlice'
import { baseApi } from './baseApi'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    ui: uiReducer,
    transactions: transactionReducer,
    orders: orderReducer,
    faqs: faqReducer,
    pushNotifications: pushNotificationReducer,
    ads: adReducer,
    [baseApi.reducerPath]: baseApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }).concat(baseApi.middleware),
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
