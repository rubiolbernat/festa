import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WrappedOptionsComponent } from './wrapped-options.component';

describe('WrappedOptionsComponent', () => {
  let component: WrappedOptionsComponent;
  let fixture: ComponentFixture<WrappedOptionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WrappedOptionsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WrappedOptionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
