import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WheelPageComponent } from './wheel-page.component';

describe('WheelPageComponent', () => {
  let component: WheelPageComponent;
  let fixture: ComponentFixture<WheelPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WheelPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WheelPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
