import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpContext, HttpErrorResponse, HttpHeaders, HttpParams } from '@angular/common/http';
import { catchError, Observable } from 'rxjs';
import { result } from 'shared_types';

type HttpOptions = {
    headers?: HttpHeaders | Record<string, string | string[]>;
    context?: HttpContext;
    observe?: 'body';
    params?: HttpParams | Record<string, string | number | boolean | ReadonlyArray<string | number | boolean>>;
    reportProgress?: boolean;
    responseType?: 'json';
    withCredentials?: boolean;
    credentials?: RequestCredentials;
    keepalive?: boolean;
    priority?: RequestPriority;
    cache?: RequestCache;
    mode?: RequestMode;
    redirect?: RequestRedirect;
    referrer?: string;
    integrity?: string;
    referrerPolicy?: ReferrerPolicy;
    timeout?: number;
};
@Injectable({
    providedIn: 'root'
})
export class HttpService {
    private http = inject(HttpClient);
    private get apiUrl(): string {
        const isTauri = !!(window as any).__TAURI__ || !!(window as any).__TAURI_INTERNALS__;
        return isTauri ? 'http://51.103.210.63' : (window.location.hostname === 'localhost' ? 'http://localhost:8080' : window.location.origin);
    }

    public get<T>(url: string, options?: HttpOptions): Observable<T> {
        return this._handleHttpErr(this.http.get<T>(`${this.apiUrl}${url}`, options));
    }

    public delete<T>(url: string, options?: HttpOptions): Observable<T> {
        return this._handleHttpErr(this.http.delete<T>(`${this.apiUrl}${url}`, options));
    }

    public post<T>(url: string, body: any | null, options?: HttpOptions): Observable<T> {
        return this._handleHttpErr(this.http.post<T>(`${this.apiUrl}${url}`, body, options));
    }

    public patch<T>(url: string, body: any | null, options?: HttpOptions): Observable<T> {
        return this._handleHttpErr(this.http.patch<T>(`${this.apiUrl}${url}`, body, options));
    }

    _handleHttpErr<T>(obs: Observable<T>): Observable<T> {
        return obs.pipe(
            catchError((err) => {
                if (err instanceof HttpErrorResponse) {
                    throw result.err({ message: err.error, status: err.status });
                }
                throw err;
            })
        );
    }
}