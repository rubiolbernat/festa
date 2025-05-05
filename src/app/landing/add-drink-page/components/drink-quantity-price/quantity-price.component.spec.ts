import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DrinkQuantityPriceComponent } from './quantity-price.component';

describe('DrinkQuantityPriceComponent', () => {
  let component: DrinkQuantityPriceComponent;
  let fixture: ComponentFixture<DrinkQuantityPriceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DrinkQuantityPriceComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DrinkQuantityPriceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
