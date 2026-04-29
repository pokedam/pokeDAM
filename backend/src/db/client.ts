import axios, { type AxiosRequestConfig, type AxiosResponse } from 'axios';
import * as auth from './entrypoints/auth.js';
import * as user from './entrypoints/user.js';
import { result, type Err, type Result } from 'shared_types';

const REST_SERVER_URL = process.env.MAIN_SERVER_URL ?? fallbackRestServerUrl();
const REST_SERVER_KEY = process.env.MAIN_SERVER_KEY ?? fallbackRestServerKey();

function fallbackRestServerUrl(): string {
    const url = 'http://localhost:8081';
    console.warn(`[WARNING] process.env.MAIN_SERVER_URL is not defined. Using dev fallback.`);
    return url;
}
function fallbackRestServerKey(): string {
    const key = 'dev-private-key';
    console.warn(`[WARNING] process.env.MAIN_SERVER_KEY is not defined. Using dev fallback.`);
    return key;
}

// Creamos una instancia de axios pre-configurada
const rest = axios.create({
    baseURL: REST_SERVER_URL,
    timeout: 5000,
    headers: {
        'Content-Type': 'application/json'
    }
});

rest.interceptors.request.use((config: any) => {
    config.headers = config.headers ?? {};
    (config.headers as Record<string, string>)['Authorization'] = `Bearer ${REST_SERVER_KEY}`;
    return config;
});

async function propagate<T = any, D = any, H = {}>(entrypoint: Promise<AxiosResponse<T, D, H>>): Promise<Result<T>> {
    try {
        return result.ok((await entrypoint).data);
    } catch (error) {
        if (axios.isAxiosError(error) && error.response)
            return result.err(error.response.data?.message ?? 'Unknown', error.response.status);
        else
            return result.internal('Internal server error');
    }
}

export const api = {
    async post<T = any, R extends AxiosResponse<T> = AxiosResponse<T>, D = any>(
        url: string,
        data?: D,
        config?: AxiosRequestConfig<D>
    ): Promise<Result<T>> {
        let res = rest.post<T, R, D>(url, data, config);
        return await propagate(res);
    },

    async get<T = any, R extends AxiosResponse<T> = AxiosResponse<T>>(
        url: string,
        config?: AxiosRequestConfig
    ): Promise<Result<T>> {
        let res = rest.get<T, R>(url, config);
        return await propagate(res);
    },

    async patch<T = any, R extends AxiosResponse<T> = AxiosResponse<T>, D = any>(
        url: string,
        data?: D,
        config?: AxiosRequestConfig<D>
    ): Promise<Result<T>> {
        let res = rest.patch<T, R, D>(url, data, config);
        return await propagate(res);
    },

    async delete<T = any, R extends AxiosResponse<T> = AxiosResponse<T>>(
        url: string,
        config?: AxiosRequestConfig
    ): Promise<Result<T>> {
        let res = rest.delete<T, R>(url, config);
        return await propagate(res);
    },
};

export const dbService = {
    auth,
    user,
};
