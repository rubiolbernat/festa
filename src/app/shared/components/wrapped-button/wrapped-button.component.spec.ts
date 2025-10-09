import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WrappedButtonComponent } from './wrapped-button.component';

describe('WrappedButtonComponent', () => {
  let component: WrappedButtonComponent;
  let fixture: ComponentFixture<WrappedButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WrappedButtonComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WrappedButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
