import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BreakingBannerComponent } from './breaking-banner.component';

describe('BreakingBannerComponent', () => {
  let component: BreakingBannerComponent;
  let fixture: ComponentFixture<BreakingBannerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BreakingBannerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BreakingBannerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
