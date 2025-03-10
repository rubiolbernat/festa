import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MaimaiPageComponent } from './maimai-page.component';

describe('MaimaiPageComponent', () => {
  let component: MaimaiPageComponent;
  let fixture: ComponentFixture<MaimaiPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MaimaiPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MaimaiPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
