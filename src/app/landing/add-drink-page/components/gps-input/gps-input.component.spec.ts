import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GpsInputComponent } from './gps-input.component';

describe('GpsInputComponent', () => {
  let component: GpsInputComponent;
  let fixture: ComponentFixture<GpsInputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GpsInputComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GpsInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
