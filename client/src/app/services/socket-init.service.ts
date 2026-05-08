import { effect, inject, Injectable } from "@angular/core";
import { AuthService } from "./auth.service";
import { SocketService } from "./socket.service";
import { RouteContextService } from "./route-context.service";
import { ErrorService } from "./error.service";

@Injectable({ providedIn: 'root' })
export class SocketInitializer {
    private auth = inject(AuthService);
    private socketService = inject(SocketService);
    private error = inject(ErrorService);
    private routeCtx = inject(RouteContextService);

    init() {
        effect(() => {
            const auth = this.auth.auth();
            if (auth && this.routeCtx.requiresSocket()) {
                this.socketService.connect(auth.idToken)
                    .subscribe({
                        error: (err) => {
                            if (err.message === 'jwt expired') {
                                this.auth.refreshTokens().subscribe({
                                    error: (err) => this.error.show(err)
                                })
                            } else this.error.show(err);
                        }
                    })
            }
        });
    }
} 