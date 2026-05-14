import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InLobby } from './in-lobby';

describe('InLobby', () => {
  let component: InLobby;
  let fixture: ComponentFixture<InLobby>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InLobby],
    }).compileComponents();

    fixture = TestBed.createComponent(InLobby);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
