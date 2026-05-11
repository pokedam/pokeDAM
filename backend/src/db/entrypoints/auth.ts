import { api } from '../client.js';
import { jwt } from '../../jwt.js';
import { authFactory, type Auth, type JwtAuth, type LoginRequest, type Result } from 'shared_types';

export async function anonymous(): Promise<Result<JwtAuth>> {
    const auth = await api.post<Auth>('/auth/anonymous');
    return auth.map(a => authFactory.jwt(jwt.generate(a.user.id), a));
}

export async function refresh(refreshToken: string): Promise<Result<JwtAuth>> {
    const auth = await api.post<Auth>('/auth/refresh', refreshToken, {
        headers: { 'Content-Type': 'text/plain' }
    });
    return auth.map(a => authFactory.jwt(jwt.generate(a.user.id), a));
}

export async function login(loginRequest: LoginRequest): Promise<Result<JwtAuth>> {
    const auth = await api.post<Auth>('/auth/login', loginRequest);
    return auth.map(a => authFactory.jwt(jwt.generate(a.user.id), a));
}