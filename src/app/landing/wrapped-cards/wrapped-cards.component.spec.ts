import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WrappedCardsComponent } from './wrapped-cards.component';

describe('WrappedCardsComponent', () => {
  let component: WrappedCardsComponent;
  let fixture: ComponentFixture<WrappedCardsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WrappedCardsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WrappedCardsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
