import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddDrinkPageComponent } from './add-drink-page.component';

describe('AddDrinkPageComponent', () => {
  let component: AddDrinkPageComponent;
  let fixture: ComponentFixture<AddDrinkPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddDrinkPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddDrinkPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
