import { Injectable, inject } from '@angular/core';
import { EnvironmentService } from './environment.service';

@Injectable({
    providedIn: 'root'
})
export class StorageService {
    private env = inject(EnvironmentService);

    private getKey(baseKey: string): string {
        return this.env.isDev ? `${baseKey}.dev` : baseKey;
    }

    get idToken(): string | null {
        return localStorage.getItem(this.getKey('org.cifpaviles.pokedam.idToken'));
    }

    set idToken(data: string | null) {
        const key = this.getKey('org.cifpaviles.pokedam.idToken');
        if (data) localStorage.setItem(key, data);
        else localStorage.removeItem(key);
    }

    get refreshToken(): string | null {
        return localStorage.getItem(this.getKey('org.cifpaviles.pokedam.refreshToken'));
    }

    set refreshToken(data: string | null) {
        const key = this.getKey('org.cifpaviles.pokedam.refreshToken');
        if (data) localStorage.setItem(key, data);
        else localStorage.removeItem(key);
    }
}
