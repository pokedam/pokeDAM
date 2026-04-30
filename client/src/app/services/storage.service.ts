export const storage = {
    get idToken(): string | null {
        return localStorage.getItem('idToken');
    },

    set idToken(data: string | null) {
        if (data) localStorage.setItem('idToken', data);
        else localStorage.removeItem('idToken');
    },

    get refreshToken(): string | null {
        return localStorage.getItem('refreshToken');
    },

    set refreshToken(data: string | null) {
        if (data) localStorage.setItem('refreshToken', data);
        else localStorage.removeItem('refreshToken');
    }
};
