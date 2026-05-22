import { baseApi } from "@/redux/baseApi";

const reviewApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({

    // ✅ CREATE REVIEW (POST)
    createReview: builder.mutation<any, {
      rating: number;
      comment: string;
      userId: string;
      productId: string;
    }>({
      query: (body) => ({
        url: "/review",
        method: "POST",
        body,
      }),
    }),

  }),
});

export const {
  useCreateReviewMutation,
} = reviewApi;