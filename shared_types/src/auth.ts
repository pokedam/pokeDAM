export interface User {
    id: number;
    nickname: string;
    avatarIndex: number | null;
    email: string | null;
}

export interface Auth {
    refreshToken: string;
    user: User;
}

export interface JwtAuth extends Auth {
    idToken: string;
}

export interface UserChangeRequest {
    nickname: string | null;
    avatarIndex: number | null;
    email: string | null;
    password: string | null;
}

export interface LoginRequest {
    email: string;
    password: string;
}

export const authFactory = {
    jwt(idToken: string, auth: Auth): JwtAuth {
        return { idToken, ...auth };
    },

    userChangeRequest(data: UserChangeRequest): UserChangeRequest {
        return data;
    }
}