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


export const authFactory = {
    jwt(idToken: string, auth: Auth): JwtAuth {
        return { idToken, ...auth };
    }
}