import { baseApi } from "@/redux/baseApi";

const overviewApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        overviewStats: builder.query<any, void>({
            query: () => {
                return {
                    url: '/dashboard/user/overview',
                    method: 'GET',
                }
            },
        }),
        overviewProjectStatus: builder.query<any, void>({
            query: () => {
                return {
                    url: '/dashboard/user/status-overview',
                    method: 'GET',
                }
            },
        }),
        overviewRecentActivities: builder.query<any, void>({
            query: () => {
                return {
                    url: '/dashboard/user/recent-activities',
                    method: 'GET',
                }
            },
        }),
        overviewRecentProjects: builder.query<any, { limit?: number, page?: number, search?: string }>({
            query: ({ limit = 10, page = 1, search }) => {
                return {
                    url: '/dashboard/user/recent-projects',
                    method: 'GET',
                    params: {
                        ...(search && search.trim().length > 0 && { search }),
                        page: page,
                        limit: limit
                    }
                }
            },
        }),
    }),
})

export const { useOverviewStatsQuery, useOverviewProjectStatusQuery, useOverviewRecentProjectsQuery, useOverviewRecentActivitiesQuery } = overviewApi