import axios from 'axios';
import type { User } from '../auth/auth.models.js';

// Utilizaremos una variable de entorno en el futuro, por ahora dejamos un fallback.
const MAIN_SERVER_URL = process.env.MAIN_SERVER_URL ?? fallbackMainServerUrl();

function fallbackMainServerUrl(): string {
    const url = 'http://localhost:8081';
    console.warn(`[WARNING] process.env.MAIN_SERVER_URL is not defined. Using dev fallback.`);
    return url;
}

// Creamos una instancia de axios pre-configurada
const mainServerClient = axios.create({
    baseURL: MAIN_SERVER_URL,
    timeout: 5000,
    headers: {
        'Content-Type': 'application/json'
    }
});

export const MainServerService = {
    /**
     * Envía la información de un usuario al main-server.
     * Esta función está preparada para ser usada en el futuro sin modificar la funcionalidad actual.
     * 
     * @param user El objeto User a enviar
     */
    async sendUser(user: User): Promise<any> {
        try {
            // Ejemplo de petición POST a una hipotética ruta del main-server
            // No afecta a la funcionalidad actual del backend porque todavía no se llama desde ningún controlador
            const response = await mainServerClient.post('/api/users/sync', user);
            return response.data;
        } catch (error) {
            console.error("Error al enviar el usuario al main-server:", error);
            // Lanzamos el error para que, en un futuro, el controlador que use esto decida qué hacer (ej. devolver un status 502)
            throw error;
        }
    }
};
