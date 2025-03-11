import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DrinkDataEditPageComponent } from './drink-data-edit-page.component';

describe('DrinkDataEditPageComponent', () => {
  let component: DrinkDataEditPageComponent;
  let fixture: ComponentFixture<DrinkDataEditPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DrinkDataEditPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DrinkDataEditPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
