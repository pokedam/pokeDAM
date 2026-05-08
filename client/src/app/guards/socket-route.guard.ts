import { Injectable, inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';
import { ErrorService } from '../services/error.service';
import { SocketService } from '../services/socket.service';

@Injectable({ providedIn: 'root' })
export class SocketRouteGuard implements CanActivate {
    private auth = inject(AuthService);
    private error = inject(ErrorService);
    private socket = inject(SocketService);
    private router = inject(Router);

    canActivate(route: ActivatedRouteSnapshot, _state: RouterStateSnapshot): Observable<boolean | UrlTree> {
        const requiresSocket = route.data?.['requiresSocket'] === true;
        if (!requiresSocket) {
            this.socket.disconnect();
            return of(true);
        }

        const token = this.auth.auth()?.idToken;
        if (!token) {
            this.error.show('Not authenticated');
            return of(this.router.createUrlTree(['/login']));
        }

        if (this.socket.isConnectedWithToken(token)) {
            return of(true);
        }

        return this.socket.connect(token).pipe(
            map(() => true),
            catchError((err) => this.handleConnectError(err, token)),
        );
    }

    private handleConnectError(err: unknown, token: string): Observable<boolean | UrlTree> {
        console.log(err);
        if (this.isJwtDisabledError(err)) {
            return this.auth.refreshTokens().pipe(
                switchMap((auth) => this.socket.connect(auth.idToken).pipe(map(() => true))),
                catchError((refreshErr) => this.handleFinalError(refreshErr)),
            );
        }

        return this.handleFinalError(err);
    }

    private handleFinalError(err: unknown): Observable<UrlTree> {
        console.error('Error connecting socket:', err);
        this.error.show('Error connecting to server');
        return of(this.router.createUrlTree(['/login']));
    }

    private isJwtDisabledError(err: unknown): boolean {
        if (!err) return false;
        if (typeof err === 'string') return this.isJwtDisabledMessage(err);
        if (err && typeof err === 'object' && 'message' in err) {
            const message = (err as { message?: unknown }).message;
            if (typeof message === 'string') return this.isJwtDisabledMessage(message);
        }
        return false;
    }

    private isJwtDisabledMessage(message: string): boolean {
        const lower = message.toLowerCase();
        return (lower.includes('jwt') && (lower.includes('expired') || lower.includes('invalid') || lower.includes('disabled')));
    }
}
