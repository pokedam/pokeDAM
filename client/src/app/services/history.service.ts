import { Injectable, inject, signal } from '@angular/core';
import { tap, map, throwError, Observable, } from 'rxjs';
import shared, { GameHistory, GameSummary, JwtAuth, LoginRequest, User, UserChangeRequest } from 'shared_types';
import { HttpService } from './http.service';
import { storage } from './storage.service';

export interface Auth {
  idToken: string,
  user: User,
}

@Injectable({
  providedIn: 'root'
})
export class HistoryService {
  private http = inject(HttpService);


  public getGames(): Observable<GameSummary[]> {
    return this.http.get<GameSummary[]>(`/games`);
  }
}