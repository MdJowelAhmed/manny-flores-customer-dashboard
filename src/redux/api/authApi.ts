import { baseApi } from "../baseApi";

interface LoginResponse {
    success: boolean;
    statusCode?: number;
    message: string;
    data?: {
        accessToken: string;
        refreshToken: string;
        role: string;
    };
}

interface LoginCredentials {
    email: string;
    password: string;
}

export interface RegisterPayload {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
    contact: string;
}

interface RegisterResponse {
    success: boolean;
    statusCode?: number;
    message: string;
}

interface ResendOtpPayload {
    email: string;
}

interface ResendOtpResponse {
    success: boolean;
    statusCode?: number;
    message: string;
}

interface ChangePasswordPayload {
    currentPassword: string;
    newPassword: string;
    confirmNewPassword: string;
}

interface ChangePasswordResponse {
    success: boolean;
    message: string;
}

interface VerifyEmailPayload {
    email: string;
    oneTimeCode: number;
}

interface VerifyEmailNestedData {
    message?: string;
    data?: string;
}

interface VerifyEmailResponse {
    success: boolean;
    statusCode?: number;
    message: string;
    data?: string | VerifyEmailNestedData;
}

interface ForgotPasswordPayload {
    email: string;
}

interface ForgotPasswordResponse {
    success: boolean;
    statusCode?: number;
    message: string;
}

interface ResetPasswordPayload {
    newPassword: string;
    confirmPassword: string;
}

interface ResetPasswordResponse {
    success: boolean;
    statusCode?: number;
    message: string;
    data?: { message?: string };
}

export const RESET_PASSWORD_TOKEN_KEY = 'resetPasswordToken';

export function extractResetPasswordToken(
    payload: VerifyEmailResponse['data']
): string | null {
    if (!payload) return null;
    if (typeof payload === 'string') return payload;
    if (typeof payload === 'object' && typeof payload.data === 'string') {
        return payload.data;
    }
    return null;
}

interface GetMyProfileResponse {
    success: boolean;
    message: string;
    data: {
        _id: string;
        name: string;
        email: string;
        role: string;
        profile?: string;
        status: string;
        isVerified: boolean;
        isPhoneVerified: boolean;
        isEmailVerified: boolean;
        isDeleted: boolean;
        authProviders: string[];
        createdAt: string;
        updatedAt: string;
        __v: number;
    };
}

interface UpdateMyProfileResponse {
    success: boolean;
    message: string;
    data: GetMyProfileResponse['data'];
}

export interface UpdateMyProfilePayload {
    name?: string;
    profileImage?: File | null;
}
export function buildProfileFormData(
    data: {
        name: string;
        email: string;
        contact: string;
        address?: string;
        city?: string;
        country?: string;
    },
    profileFile?: File | null
): FormData {
    const formData = new FormData();
    formData.append('name', data.name);
    formData.append('email', data.email);
    formData.append('contact', data.contact);
    formData.append('address', data.address ?? '');
    formData.append('city', data.city ?? '');
    formData.append('country', data.country ?? '');

    if (profileFile instanceof File) {
        formData.append('profile', profileFile, profileFile.name);
    }

    return formData;
}

const authApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        login: builder.mutation<LoginResponse, LoginCredentials>({
            query: (credentials) => ({
                url: '/auth/login',
                method: 'POST',
                body: credentials,
            }),
            invalidatesTags: ['Auth'],
        }),
        register: builder.mutation<RegisterResponse, RegisterPayload>({
            query: (credentials) => ({
                url: '/user',
                method: 'POST',
                body: credentials,
            }),
            invalidatesTags: ['Auth'],
        }),
        logout: builder.mutation({
            query: () => ({
                url: '/auth/logout',
                method: 'POST',
            }),
            invalidatesTags: ['Auth'],
        }),
        getCurrentUser: builder.query({
            query: () => ({
                url: '/auth/current-user',
                method: 'GET',
            }),
            providesTags: ['Auth'],
        }),
        changePassword: builder.mutation<ChangePasswordResponse, ChangePasswordPayload>({
            query: (credentials) => ({
                url: '/auth/change-password',
                method: 'POST',
                body: credentials,
            }),
            invalidatesTags: ['Auth'],
        }),
        forgotPassword: builder.mutation<ForgotPasswordResponse, ForgotPasswordPayload>({
            query: (credentials) => ({
                url: '/auth/forgot-password',
                method: 'POST',
                body: credentials,
            }),
            invalidatesTags: ['Auth'],
        }),
        resendOtp: builder.mutation<ResendOtpResponse, ResendOtpPayload>({
            query: (credentials) => ({
                url: '/auth/resend-otp',
                method: 'POST',
                body: credentials,
            }),
            invalidatesTags: ['Auth'],
        }),
        verifyEmail: builder.mutation<VerifyEmailResponse, VerifyEmailPayload>({
            query: (credentials) => ({
                url: '/auth/verify',
                method: 'POST',
                body: credentials,
            }),
            async onQueryStarted(_arg, { queryFulfilled }) {
                try {
                    const { data } = await queryFulfilled;
                    const resetToken = extractResetPasswordToken(data?.data);
                    if (resetToken && typeof localStorage !== 'undefined') {
                        localStorage.setItem(RESET_PASSWORD_TOKEN_KEY, resetToken);
                    }
                } catch {
                    // ignore errors; normal RTK Query error handling will apply
                }
            },
            invalidatesTags: ['Auth'],
        }),
        resetPassword: builder.mutation<ResetPasswordResponse, ResetPasswordPayload>({
            query: (credentials) => {
                let resetToken: string | null = null;
                try {
                    resetToken =
                        typeof localStorage !== 'undefined'
                            ? localStorage.getItem(RESET_PASSWORD_TOKEN_KEY)
                            : null;
                } catch {
                    resetToken = null;
                }

                const headers: Record<string, string> = {};
                if (resetToken) {
                    headers.Authorization = resetToken;
                }

                return {
                    url: '/auth/resetpassword',
                    method: 'POST',
                    body: credentials,
                    headers,
                };
            },
            async onQueryStarted(_arg, { queryFulfilled }) {
                try {
                    await queryFulfilled;
                    if (typeof localStorage !== 'undefined') {
                        localStorage.removeItem(RESET_PASSWORD_TOKEN_KEY);
                    }
                } catch {
                    // keep token so user can retry
                }
            },
            invalidatesTags: ['Auth'],
        }),

        getMyProfile: builder.query<GetMyProfileResponse, void>({
            query: () => ({
                url: '/user/profile',
                method: 'GET',
            }),
            providesTags: ['Auth'],
        }),

        updateMyProfile: builder.mutation<UpdateMyProfileResponse, FormData>({
            query: (formData) => ({
                url: '/user/profile',
                method: 'PATCH',
                body: formData,
            }),
            invalidatesTags: ['Auth'],
        }),


    }),

})

export const {
    useLoginMutation,
    useRegisterMutation,
    useLogoutMutation,
    useGetCurrentUserQuery,
    useChangePasswordMutation,
    useForgotPasswordMutation,
    useVerifyEmailMutation,
    useResetPasswordMutation,
    useResendOtpMutation,
    useGetMyProfileQuery,
    useUpdateMyProfileMutation,
} =
    authApi