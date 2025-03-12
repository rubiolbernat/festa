import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChartMonthComponent } from './chart-month.component';

describe('ChartMonthComponent', () => {
  let component: ChartMonthComponent;
  let fixture: ComponentFixture<ChartMonthComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChartMonthComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChartMonthComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
