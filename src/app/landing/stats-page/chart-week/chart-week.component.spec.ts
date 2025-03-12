import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChartWeekComponent } from './chart-week.component';

describe('ChartWeekComponent', () => {
  let component: ChartWeekComponent;
  let fixture: ComponentFixture<ChartWeekComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChartWeekComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChartWeekComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
