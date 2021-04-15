import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScreeSharePlayerComponent } from './scree-share-player.component';

describe('ScreeSharePlayerComponent', () => {
  let component: ScreeSharePlayerComponent;
  let fixture: ComponentFixture<ScreeSharePlayerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ScreeSharePlayerComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ScreeSharePlayerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
