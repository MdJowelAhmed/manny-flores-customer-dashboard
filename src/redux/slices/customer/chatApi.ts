import { baseApi } from "@/redux/baseApi";


const chatSlice = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getChats: builder.query({
            query: () => {
                return {
                    url: `/chat`,
                }
            },
            providesTags: ["chats"]
        }),

        createInitialChat: builder.mutation({
            query: (id) => {
                return {
                    method: "POST",
                    url: `/chat/${id}`,
                }
            },

            invalidatesTags: ["chats"]
        }),

        getChatList: builder.query({
            query: (search) => {
                const params = new URLSearchParams()
                if (search) params.append('search', search)
                return {
                    url: `/chat?${params.toString()}`,
                }
            },
            providesTags: ["chats"]
        }),

        sendMessage: builder.mutation({
            query: (data) => {
                return {
                    method: "POST",
                    url: "/message",
                    body: data,
                }
            },
        }),

        getMessageList: builder.query({
            query: (arg: string | { chatId: string; page?: number; limit?: number }) => {
                if (typeof arg === 'string') {
                    return { url: `/message/${arg}` }
                }
                const { chatId, page = 1, limit = 100 } = arg
                const params = new URLSearchParams()
                params.set('page', String(page))
                params.set('limit', String(limit))
                return { url: `/message/${chatId}?${params.toString()}` }
            },
        }),


    })

})

export const { useCreateInitialChatMutation, useGetChatListQuery, useSendMessageMutation, useGetMessageListQuery, useGetChatsQuery } = chatSlice
 