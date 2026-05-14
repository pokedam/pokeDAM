import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateLobby } from './create-lobby';

describe('CreateLobby', () => {
  let component: CreateLobby;
  let fixture: ComponentFixture<CreateLobby>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateLobby],
    }).compileComponents();

    fixture = TestBed.createComponent(CreateLobby);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
