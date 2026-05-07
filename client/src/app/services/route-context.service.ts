import { inject, Injectable, signal } from "@angular/core";
import { ActivatedRouteSnapshot, NavigationEnd, Router } from "@angular/router";
import { filter } from "rxjs/internal/operators/filter";

@Injectable({ providedIn: 'root' })
export class RouteContextService {
    private router = inject(Router);

    private _requiresSocket = signal(false);
    readonly requiresSocket = this._requiresSocket.asReadonly();

    init() {
        this.router.events
            .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
            .subscribe(() => {
                const snapshot = this.router.routerState.snapshot.root;
                this._requiresSocket.set(RouteContextService.requireSocket(snapshot));
            });

        // inicial
        const snapshot = this.router.routerState.snapshot.root;
        this._requiresSocket.set(RouteContextService.requireSocket(snapshot));
    }

    private static requireSocket(route: ActivatedRouteSnapshot): boolean {
        const value = route.data?.['socket'];

        if (typeof value === 'boolean') 
            return value;
        
        if (!route.firstChild) 
            return false;
        
        return RouteContextService.requireSocket(route.firstChild);
    }
}