import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import type { RootState } from './store'

export const socketUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'

export const baseApi = createApi({
    reducerPath: 'baseApi',
    baseQuery: fetchBaseQuery({
        baseUrl: import.meta.env.VITE_API_BASE_URL + '/api/v1',
        prepareHeaders: (headers, { getState, endpoint }) => {
            if (endpoint !== 'resetPassword') {
                const token = (getState() as RootState).auth.token
                if (token) {
                    headers.set('authorization', `Bearer ${token}`)
                }
            }
            return headers
        },
    }),
    tagTypes: [
        'Auth',
        'Estimate',
        'Invoice',
        'Project',
        'Payment',
        'chats',
    ],
    endpoints: () => ({}),
})