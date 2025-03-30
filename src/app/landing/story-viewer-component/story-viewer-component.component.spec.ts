import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StoryViewerComponentComponent } from './story-viewer-component.component';

describe('StoryViewerComponentComponent', () => {
  let component: StoryViewerComponentComponent;
  let fixture: ComponentFixture<StoryViewerComponentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StoryViewerComponentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StoryViewerComponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
