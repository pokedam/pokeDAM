export const INVALID_JWT_MESSAGE = 'Invalid jwt token';

export interface User {
    id: number;
    nickname: string;
    avatarId: number | null;
    email: string | null;
}

export interface Auth {
    refreshToken: string;
    user: User;
}

export interface JwtAuth extends Auth { // Client
    idToken: string;
}

export interface UserChangeRequest {
    nickname: string | null;
    avatarId: number | null;
    email: string | null;
    password: string | null;
}

export interface LoginRequest {
    email: string;
    password: string;
}

