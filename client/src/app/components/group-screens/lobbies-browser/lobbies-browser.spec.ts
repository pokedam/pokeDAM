import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LobbiesBrowser } from './lobbies-browser';

describe('LobbiesBrowser', () => {
  let component: LobbiesBrowser;
  let fixture: ComponentFixture<LobbiesBrowser>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LobbiesBrowser],
    }).compileComponents();

    fixture = TestBed.createComponent(LobbiesBrowser);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
