import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DrinkDataListPageComponent } from './drink-data-list-page.component';

describe('DrinkDataListPageComponent', () => {
  let component: DrinkDataListPageComponent;
  let fixture: ComponentFixture<DrinkDataListPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DrinkDataListPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DrinkDataListPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
