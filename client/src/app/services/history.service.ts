import { Injectable, inject } from '@angular/core';
import { Observable, } from 'rxjs';
import { GameSummary, User, } from 'shared_types';
import { HttpService } from './http.service';

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