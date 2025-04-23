import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuantityPriceComponent } from './quantity-price.component';

describe('QuantityPriceComponent', () => {
  let component: QuantityPriceComponent;
  let fixture: ComponentFixture<QuantityPriceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QuantityPriceComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(QuantityPriceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
