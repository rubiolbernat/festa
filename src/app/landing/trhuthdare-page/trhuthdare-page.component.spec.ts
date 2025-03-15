import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TrhuthdarePageComponent } from './trhuthdare-page.component';

describe('TrhuthdarePageComponent', () => {
  let component: TrhuthdarePageComponent;
  let fixture: ComponentFixture<TrhuthdarePageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TrhuthdarePageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TrhuthdarePageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
