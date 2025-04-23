import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MediaInputComponent } from './media-input.component';

describe('MediaInputComponent', () => {
  let component: MediaInputComponent;
  let fixture: ComponentFixture<MediaInputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MediaInputComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MediaInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
