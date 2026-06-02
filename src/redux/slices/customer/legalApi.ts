import { baseApi } from "@/redux/baseApi";

const legalApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        // Dashboard data   
        getLegalData: builder.query({
            query: ({ type }) => {
                return {
                    url: `/admin/rule`,
                    params: {
                        type
                    }
                }
            }
        })
    })
})
export const { useGetLegalDataQuery } = legalApi