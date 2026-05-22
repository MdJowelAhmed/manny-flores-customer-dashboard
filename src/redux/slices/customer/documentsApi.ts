import { baseApi } from "@/redux/baseApi";

const documentsApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getDocuments: builder.query<any, { page?: number; limit?: number; search?: string }>({
            query: ({ page = 1, limit = 10, search = '' }) => {
                return {
                    url: '/requested-document',
                    method: 'GET',
                    params: {
                        page,
                        limit,
                        search
                    }
                }
            },
        }),
        submitDocument: builder.mutation<any, { id: string; data: FormData }>({
            query: ({ id, data }) => ({
                url: `/requested-document/${id}`,
                method: 'PATCH',
                body: data,
            }),
        }),
    }),
});

export const { useGetDocumentsQuery, useSubmitDocumentMutation } = documentsApi