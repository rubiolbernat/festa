import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DrinkingPageComponent } from './drinking-page.component';

describe('DrinkingPageComponent', () => {
  let component: DrinkingPageComponent;
  let fixture: ComponentFixture<DrinkingPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DrinkingPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DrinkingPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
