import {
    createApi,
    fetchBaseQuery,
    type BaseQueryFn,
    type FetchArgs,
    type FetchBaseQueryError,
} from '@reduxjs/toolkit/query/react'
import i18n from '@/i18n/i18n'
import { toast } from '@/utils/toast'
import { getApiErrorMessage } from '@/utils/getApiErrorMessage'
import { logout } from './slices/authSlice'
import type { RootState } from './store'

export const socketUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'

const PUBLIC_AUTH_ENDPOINTS = new Set([
    'login',
    'register',
    'forgotPassword',
    'verifyEmail',
    'resetPassword',
    'resendOtp',
    'getPublicEstimate',
    'submitPublicEstimateDecision',
])

const rawBaseQuery = fetchBaseQuery({
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
})

const baseQueryWithGlobalErrors: BaseQueryFn<
    string | FetchArgs,
    unknown,
    FetchBaseQueryError
> = async (args, api, extraOptions) => {
    const endpoint = api.endpoint
    const isPublicEndpoint = PUBLIC_AUTH_ENDPOINTS.has(endpoint)
    const tokenAtRequestTime = (api.getState() as RootState).auth.token
    const sentWithAuth =
        !!tokenAtRequestTime && endpoint !== 'resetPassword' && !isPublicEndpoint

    const result = await rawBaseQuery(args, api, extraOptions)

    if (!result.error) return result

    const { error } = result

    if (error.status === 401 && sentWithAuth) {
        api.dispatch(logout())
        toast({
            variant: 'destructive',
            title: i18n.t('errors.sessionExpired'),
            description: i18n.t('errors.pleaseLoginAgain'),
        })
        return result
    }

    if (error.status === 'FETCH_ERROR' && sentWithAuth) {
        toast({
            variant: 'destructive',
            title: i18n.t('errors.networkError'),
            description: i18n.t('errors.checkConnection'),
        })
        return result
    }

    if (
        typeof error.status === 'number' &&
        error.status >= 500 &&
        api.type === 'mutation' &&
        sentWithAuth
    ) {
        toast({
            variant: 'destructive',
            title: i18n.t('errors.unexpectedError'),
            description: getApiErrorMessage(
                error,
                i18n.t('errors.anErrorOccurred')
            ),
        })
    }

    return result
}

export const baseApi = createApi({
    reducerPath: 'baseApi',
    baseQuery: baseQueryWithGlobalErrors,
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