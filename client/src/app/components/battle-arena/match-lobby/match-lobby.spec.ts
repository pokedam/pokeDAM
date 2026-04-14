import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MatchLobby } from './match-lobby';

describe('MatchLobby', () => {
  let component: MatchLobby;
  let fixture: ComponentFixture<MatchLobby>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MatchLobby],
    }).compileComponents();

    fixture = TestBed.createComponent(MatchLobby);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
