import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DrinkSelectionComponent } from './drink-selection.component';

describe('DrinkSelectionComponent', () => {
  let component: DrinkSelectionComponent;
  let fixture: ComponentFixture<DrinkSelectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DrinkSelectionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DrinkSelectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
