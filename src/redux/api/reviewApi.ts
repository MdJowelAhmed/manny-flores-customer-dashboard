import { baseApi } from '@/redux/baseApi'

export interface CreateReviewPayload {
  rating: number
  feedback: string
  projectName: string
}

export interface CreateReviewResponse {
  success: boolean
  statusCode?: number
  message: string
}

const reviewApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createReview: builder.mutation<CreateReviewResponse, CreateReviewPayload>({
      query: (body) => ({
        url: '/review',
        method: 'POST',
        body,
      }),
    }),
  }),
})

export const { useCreateReviewMutation } = reviewApi
