import { api } from '../client.js';
import { jwt } from '../../jwt.js';
import { type Auth, type JwtAuth, type LoginRequest, type Result } from 'shared_types';

export async function anonymous(): Promise<JwtAuth> {
    const auth = await api.post<Auth>('/auth/anonymous');
    return {
        ...auth,
        idToken: jwt.generate(auth.user.id),
    };
}

export async function refresh(refreshToken: string): Promise<JwtAuth> {
    const auth = await api.post<Auth>('/auth/refresh', refreshToken, {
        headers: { 'Content-Type': 'text/plain' }
    });
    return {
        ...auth,
        idToken: jwt.generate(auth.user.id),
    };
}

export async function login(loginRequest: LoginRequest): Promise<JwtAuth> {
    const auth = await api.post<Auth>('/auth/login', loginRequest);
    return {
        ...auth,
        idToken: jwt.generate(auth.user.id),
    };
}