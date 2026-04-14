import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GameBrowser } from './game-browser';

describe('GameBrowser', () => {
  let component: GameBrowser;
  let fixture: ComponentFixture<GameBrowser>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GameBrowser],
    }).compileComponents();

    fixture = TestBed.createComponent(GameBrowser);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
