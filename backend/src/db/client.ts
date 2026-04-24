import axios from 'axios';
import type { User } from 'shared_types';
import * as auth from './endpoints/auth.js';
import * as user from './endpoints/user.js';

// Utilizaremos una variable de entorno en el futuro, por ahora dejamos un fallback.
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
export const rest = axios.create({
    baseURL: REST_SERVER_URL,
    timeout: 5000,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Añadimos un interceptor para poner el header Authorization dinámicamente.
// Esto permite rotar/actualizar el token, añadir logging o manejar excepciones centralizadas.
rest.interceptors.request.use((config: any) => {
    config.headers = config.headers ?? {};
    (config.headers as Record<string, string>)['Authorization'] = `Bearer ${REST_SERVER_KEY}`;
    return config;
});



export const dbService = {
    auth,
    user,
    // /**
    //  * Envía la información de un usuario al main-server.
    //  * Esta función está preparada para ser usada en el futuro sin modificar la funcionalidad actual.
    //  * 
    //  * @param user El objeto User a enviar
    //  */
    // async sendUser(user: User): Promise<number> {
    //     try {
    //         // Ejemplo de petición POST a una hipotética ruta del main-server
    //         // No afecta a la funcionalidad actual del backend porque todavía no se llama desde ningún controlador
    //         const response = await rest.post<number>('/api/users/sync', user);
    //         return response.data;
    //     } catch (error) {
    //         console.error("Error al enviar el usuario al main-server:", error);
    //         // Lanzamos el error para que, en un futuro, el controlador que use esto decida qué hacer (ej. devolver un status 502)
    //         throw error;
    //     }
    // }
};
