import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CarrousselComponent } from './carroussel.component';

describe('CarrousselComponent', () => {
  let component: CarrousselComponent;
  let fixture: ComponentFixture<CarrousselComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CarrousselComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CarrousselComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
