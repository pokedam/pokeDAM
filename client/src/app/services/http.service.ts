import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpContext, HttpErrorResponse, HttpHeaders, HttpParams } from '@angular/common/http';
import { BehaviorSubject, tap, map, catchError, throwError, Observable, EMPTY, of } from 'rxjs';
import { ErrorService } from './error.service';
import shared, { authFactory, JwtAuth, LoginRequest, result, User, UserChangeRequest } from 'shared_types';

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
    private apiUrl = 'http://localhost:8080'; // Adjust based on your server

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
                    throw result.err(err.error, err.status);
                }
                throw err;
            })
        );
    }
}