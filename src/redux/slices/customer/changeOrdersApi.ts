import { baseApi } from "@/redux/baseApi";

const changeOrdersApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getChangeOrders: builder.query<any, { page?: number; limit?: number; status?: string } | void>({
            query: (params) => {
                return {
                    url: '/change-orders/user',
                    method: 'GET',
                    params: params || undefined,
                }
            },
        }),
        changeOrderStatus: builder.mutation<any, { id: string, status: string }>({
            query: ({ id, status }) => {
                return {
                    url: `/change-orders/user/${id}`,
                    method: 'PATCH',
                    body: { status }
                }
            }
        })
    })
})

export const { useGetChangeOrdersQuery, useChangeOrderStatusMutation } = changeOrdersApi